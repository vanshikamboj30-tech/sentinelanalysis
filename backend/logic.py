import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import supervision as sv
import os
from datetime import datetime

# Initialize YOLO model
model = YOLO("yolov8n.pt")


def calculate_threat_score(bbox, frame_shape, track_history, confidence):
    """
    Calculate threat score based on:
    1. Area of Interest (AOI) - central 60% of frame
    2. Loitering/Low Speed detection
    3. Confidence score
    """
    x1, y1, x2, y2 = bbox
    center_x = (x1 + x2) / 2
    center_y = (y1 + y2) / 2
    
    frame_h, frame_w = frame_shape[:2]
    
    # Check if in AOI (central 60% of frame)
    aoi_margin_w = frame_w * 0.2
    aoi_margin_h = frame_h * 0.2
    in_aoi = (aoi_margin_w < center_x < frame_w - aoi_margin_w and
              aoi_margin_h < center_y < frame_h - aoi_margin_h)
    
    # Calculate movement speed (simple displacement)
    speed = 0
    if len(track_history) > 1:
        prev_x, prev_y = track_history[-2]
        curr_x, curr_y = track_history[-1]
        speed = np.sqrt((curr_x - prev_x)**2 + (curr_y - prev_y)**2)
    
    # Threat scoring
    threat = 0
    threat += 40 if in_aoi else 20
    threat += 30 if speed < 5 else 10  # Loitering detection
    threat += int(confidence * 30)
    
    return min(threat, 100)


def process_video_logic(input_video_path: str):
    """
    Process video with YOLOv8 and ByteTrack
    Returns: {videoUrl, events, stats}
    """
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        raise ValueError("Failed to open video file")
    
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_shape = (height, width)
    
    # Output video path
    output_filename = f"processed_{Path(input_video_path).name}"
    output_path = Path("static") / output_filename
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
    
    # Initialize ByteTrack
    byte_tracker = sv.ByteTrack()
    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()
    
    # Track history for threat calculation
    track_histories = {}
    events = []
    event_id = 1
    frame_count = 0
    
    # Classes we care about
    target_classes = ["person", "car", "truck", "bus", "motorcycle", "bicycle"]
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        timestamp = f"{frame_count // fps // 60:02d}:{(frame_count // fps) % 60:02d}:{frame_count % fps:02d}"
        
        # Run YOLO detection
        results = model(frame, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)
        
        # Filter to target classes only
        class_names = [model.names[class_id] for class_id in detections.class_id]
        mask = [name in target_classes for name in class_names]
        detections = detections[mask]
        
        # Update tracker
        tracked_detections = byte_tracker.update_with_detections(detections)
        
        # Process each tracked object
        for i, (bbox, class_id, confidence, tracker_id) in enumerate(zip(
            tracked_detections.xyxy,
            tracked_detections.class_id,
            tracked_detections.confidence,
            tracked_detections.tracker_id
        )):
            class_name = model.names[class_id]
            
            # Update track history
            center_x = (bbox[0] + bbox[2]) / 2
            center_y = (bbox[1] + bbox[3]) / 2
            
            if tracker_id not in track_histories:
                track_histories[tracker_id] = []
            track_histories[tracker_id].append((center_x, center_y))
            
            # Calculate threat score
            threat_score = calculate_threat_score(
                bbox, frame_shape, track_histories[tracker_id], confidence
            )
            
            # Log significant events (every 30 frames to avoid spam)
            if frame_count % 30 == 0 and threat_score > 40:
                events.append({
                    "id": event_id,
                    "timestamp": timestamp,
                    "class": class_name,
                    "confidence": float(confidence),
                    "threatScore": threat_score
                })
                event_id += 1
        
        # Annotate frame
        labels = [
            f"#{tracker_id} {model.names[class_id]}"
            for tracker_id, class_id in zip(tracked_detections.tracker_id, tracked_detections.class_id)
        ]
        
        annotated_frame = box_annotator.annotate(frame.copy(), tracked_detections)
        annotated_frame = label_annotator.annotate(annotated_frame, tracked_detections, labels)
        
        out.write(annotated_frame)
    
    cap.release()
    out.release()
    
    # Calculate stats
    high_threat_count = sum(1 for e in events if e["threatScore"] >= 70)
    
    return {
        "videoUrl": f"http://localhost:8000/static/{output_filename}",
        "events": events,
        "stats": {
            "totalDetections": len(events),
            "highThreatEvents": high_threat_count
        }
    }


# Chat functionality moved to openai_service.py
# Import run_openai_chat from openai_service for backward compatibility
from openai_service import run_openai_chat


def process_frame_logic(frame):
    """
    Process a single frame and return detections with threat scores
    """
    target_classes = ["person", "car", "bicycle", "motorcycle", "bus", "truck"]
    
    # Run YOLO detection on frame
    results = model(frame, verbose=False)[0]
    detections = sv.Detections.from_ultralytics(results)
    
    detection_list = []
    frame_shape = frame.shape
    
    if len(detections) > 0:
        # Filter to target classes
        class_names = [model.names[class_id] for class_id in detections.class_id]
        mask = [name in target_classes for name in class_names]
        detections = detections[mask]
        
        for bbox, class_id, confidence in zip(detections.xyxy, detections.class_id, detections.confidence):
            class_name = model.names[class_id]
            
            # Calculate threat score
            threat_score = calculate_threat_score(bbox, frame_shape, {}, confidence)
            
            detection = {
                "time": datetime.now().strftime("%H:%M:%S"),
                "class": class_name,
                "confidence": round(float(confidence) * 100, 1),
                "threat": int(threat_score)
            }
            
            detection_list.append(detection)
    
    return detection_list


def process_annotated_frame_logic(frame, detections):
    """
    Annotate frame with detection boxes and labels
    """
    annotated_frame = frame.copy()
    
    for detection in detections:
        # Get threat level color
        threat = detection.get("threat", 0)
        if threat > 70:
            color = (0, 0, 255)  # Red
        elif threat > 40:
            color = (0, 165, 255)  # Orange
        else:
            color = (0, 255, 0)  # Green
        
        # Draw bounding box (simplified - using center as reference)
        h, w = frame.shape[:2]
        box_size = 100
        cx, cy = w // 2, h // 2
        cv2.rectangle(annotated_frame, (cx - box_size, cy - box_size), 
                     (cx + box_size, cy + box_size), color, 2)
        
        # Add label
        label = f"{detection['class']} {detection['threat']}%"
        cv2.putText(annotated_frame, label, (cx - box_size, cy - box_size - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    return annotated_frame
