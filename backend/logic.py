import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO
import supervision as sv
import os
import re
import uuid
from datetime import datetime
from collections import defaultdict

# Initialize YOLO model
model = YOLO("yolov8n.pt")

# ======================== ZONE DEFINITIONS ========================

DEFAULT_ZONES = {
    "restricted": {
        "label": "Restricted Zone",
        "coords": (0.3, 0.3, 0.7, 0.7),  # Central 40% of frame (normalized)
        "severity_boost": 30,
        "allowed_classes": [],  # No objects allowed
        "time_restricted": True,
    },
    "entrance": {
        "label": "Entrance Zone",
        "coords": (0.0, 0.6, 1.0, 1.0),  # Bottom 40% of frame
        "severity_boost": 10,
        "allowed_classes": ["person", "car"],
        "time_restricted": False,
    },
    "perimeter": {
        "label": "Perimeter Zone",
        "coords": (0.0, 0.0, 1.0, 0.15),  # Top 15% of frame
        "severity_boost": 20,
        "allowed_classes": ["person"],
        "time_restricted": True,
    },
}

# ======================== EXPANDED OBJECT CLASSES ========================

# All COCO classes relevant to surveillance, grouped by category
SURVEILLANCE_CLASSES = {
    # People
    "person": {"category": "person", "base_threat": 20},
    # Vehicles
    "car": {"category": "vehicle", "base_threat": 15},
    "truck": {"category": "vehicle", "base_threat": 20},
    "bus": {"category": "vehicle", "base_threat": 15},
    "motorcycle": {"category": "vehicle", "base_threat": 15},
    "bicycle": {"category": "vehicle", "base_threat": 10},
    # Carried objects / accessories
    "backpack": {"category": "carried_object", "base_threat": 25},
    "handbag": {"category": "carried_object", "base_threat": 15},
    "suitcase": {"category": "carried_object", "base_threat": 30},
    "umbrella": {"category": "carried_object", "base_threat": 5},
    # Animals (unusual presence)
    "dog": {"category": "animal", "base_threat": 10},
    "cat": {"category": "animal", "base_threat": 5},
    # Other notable objects
    "cell phone": {"category": "equipment", "base_threat": 10},
    "laptop": {"category": "equipment", "base_threat": 15},
    "knife": {"category": "weapon", "base_threat": 80},
    "scissors": {"category": "weapon", "base_threat": 50},
    "sports ball": {"category": "misc", "base_threat": 5},
    "bottle": {"category": "misc", "base_threat": 5},
}

TARGET_CLASS_NAMES = list(SURVEILLANCE_CLASSES.keys())

# ======================== BEHAVIOR DETECTION ========================

# Loitering: object stays within radius for N frames
LOITER_RADIUS = 50  # pixels
LOITER_FRAMES_THRESHOLD = 60  # ~2 seconds at 30fps

# Speed thresholds (pixels per frame)
SPEED_SLOW = 3
SPEED_FAST = 40

# Repeated entry: same tracker re-enters a zone
ZONE_REENTRY_WINDOW = 150  # frames


def get_zone(center_x: float, center_y: float, frame_w: int, frame_h: int) -> dict:
    """Determine which zone a point falls in. Returns zone info or 'public'."""
    nx, ny = center_x / frame_w, center_y / frame_h
    for zone_id, zone in DEFAULT_ZONES.items():
        x1, y1, x2, y2 = zone["coords"]
        if x1 <= nx <= x2 and y1 <= ny <= y2:
            return {"id": zone_id, "label": zone["label"], "severity_boost": zone["severity_boost"]}
    return {"id": "public", "label": "Public Area", "severity_boost": 0}


def detect_behavior(track_history: list, loiter_threshold: int = LOITER_FRAMES_THRESHOLD) -> dict:
    """Analyze track history to infer behavior patterns."""
    if len(track_history) < 3:
        return {"pattern": "Transient", "duration_frames": len(track_history), "speed": 0}

    # Calculate speeds
    speeds = []
    for i in range(1, len(track_history)):
        dx = track_history[i][0] - track_history[i - 1][0]
        dy = track_history[i][1] - track_history[i - 1][1]
        speeds.append(np.sqrt(dx ** 2 + dy ** 2))

    avg_speed = np.mean(speeds) if speeds else 0
    max_displacement = np.sqrt(
        (track_history[-1][0] - track_history[0][0]) ** 2
        + (track_history[-1][1] - track_history[0][1]) ** 2
    )

    duration = len(track_history)

    # Loitering: low displacement over many frames
    if duration >= loiter_threshold and max_displacement < LOITER_RADIUS:
        return {"pattern": "Loitering", "duration_frames": duration, "speed": round(float(avg_speed), 1)}

    # Evasive: high speed with direction changes
    if avg_speed > SPEED_FAST:
        return {"pattern": "Evasive", "duration_frames": duration, "speed": round(float(avg_speed), 1)}

    # Repeated: appears, disappears, reappears (handled at frame level via zone_visits)
    if duration > 10 and avg_speed < SPEED_SLOW:
        return {"pattern": "Loitering", "duration_frames": duration, "speed": round(float(avg_speed), 1)}

    return {"pattern": "Transient", "duration_frames": duration, "speed": round(float(avg_speed), 1)}


def find_associated_objects(tracked_detections, idx: int, proximity_px: float = 150) -> list:
    """Find other objects near a given detection (spatial association)."""
    if len(tracked_detections.xyxy) <= 1:
        return []

    ref_bbox = tracked_detections.xyxy[idx]
    ref_cx = (ref_bbox[0] + ref_bbox[2]) / 2
    ref_cy = (ref_bbox[1] + ref_bbox[3]) / 2

    associated = []
    for j, bbox in enumerate(tracked_detections.xyxy):
        if j == idx:
            continue
        cx = (bbox[0] + bbox[2]) / 2
        cy = (bbox[1] + bbox[3]) / 2
        dist = np.sqrt((cx - ref_cx) ** 2 + (cy - ref_cy) ** 2)
        if dist < proximity_px:
            class_name = model.names[tracked_detections.class_id[j]]
            associated.append({
                "class": class_name,
                "distance": round(float(dist), 1),
                "tracker_id": int(tracked_detections.tracker_id[j]) if tracked_detections.tracker_id is not None else None,
            })
    return associated


def calculate_threat_score(bbox, frame_shape, track_history, confidence, class_name: str = "person", zone: dict = None, behavior: dict = None, associated: list = None):
    """
    Enhanced threat scoring based on:
    1. Object class base threat
    2. Zone context
    3. Behavior pattern
    4. Associated objects
    5. Confidence score
    """
    x1, y1, x2, y2 = bbox
    frame_h, frame_w = frame_shape[:2]

    # Base threat from object class
    class_info = SURVEILLANCE_CLASSES.get(class_name, {"base_threat": 15})
    threat = class_info["base_threat"]

    # Zone boost
    if zone:
        threat += zone.get("severity_boost", 0)

    # Behavior boost
    if behavior:
        pattern = behavior.get("pattern", "Transient")
        if pattern == "Loitering":
            threat += 25
        elif pattern == "Evasive":
            threat += 20
        elif pattern == "Repeated":
            threat += 15

    # Associated objects boost (person + bag = higher)
    if associated:
        for assoc in associated:
            if assoc["class"] in ("backpack", "suitcase", "knife", "scissors"):
                threat += 15
            elif assoc["class"] in ("handbag", "laptop"):
                threat += 5

    # Confidence contribution
    threat += int(confidence * 15)

    return min(threat, 100)


def process_video_logic(input_video_path: str, zones: dict = None):
    """
    Process video with YOLOv8 and ByteTrack.
    Returns enriched detection events with zone, behavior, and context data.
    """
    active_zones = zones or DEFAULT_ZONES
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        raise ValueError("Failed to open video file")

    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_shape = (height, width)

    # Sanitize filename: remove spaces/special chars, add uuid for uniqueness
    safe_stem = re.sub(r'[^\w\-]', '_', Path(input_video_path).stem)
    output_filename = f"processed_{safe_stem}_{uuid.uuid4().hex[:8]}.mp4"
    output_path = Path("static") / output_filename
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    byte_tracker = sv.ByteTrack()
    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()

    track_histories = {}
    zone_visits = defaultdict(lambda: defaultdict(list))  # tracker_id -> zone_id -> [frame_nums]
    events = []
    event_id = 1
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        timestamp = f"{frame_count // fps // 60:02d}:{(frame_count // fps) % 60:02d}:{frame_count % fps:02d}"

        # Run YOLO detection
        results = model(frame, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)

        # Filter to surveillance classes
        if len(detections) > 0:
            class_names = [model.names[cid] for cid in detections.class_id]
            mask = [name in TARGET_CLASS_NAMES for name in class_names]
            detections = detections[mask]

        # Update tracker
        tracked_detections = byte_tracker.update_with_detections(detections)

        # Process each tracked object
        for i in range(len(tracked_detections.xyxy)):
            bbox = tracked_detections.xyxy[i]
            class_id = tracked_detections.class_id[i]
            confidence = tracked_detections.confidence[i]
            tracker_id = tracked_detections.tracker_id[i] if tracked_detections.tracker_id is not None else i

            class_name = model.names[class_id]
            center_x = (bbox[0] + bbox[2]) / 2
            center_y = (bbox[1] + bbox[3]) / 2

            # Update track history
            if tracker_id not in track_histories:
                track_histories[tracker_id] = []
            track_histories[tracker_id].append((center_x, center_y))

            # Zone detection
            zone = get_zone(center_x, center_y, width, height)
            zone_visits[tracker_id][zone["id"]].append(frame_count)

            # Behavior detection
            behavior = detect_behavior(track_histories[tracker_id])

            # Check for repeated zone entry
            for zid, frames in zone_visits[tracker_id].items():
                if len(frames) > 1:
                    gaps = [frames[j] - frames[j - 1] for j in range(1, len(frames))]
                    if any(g > ZONE_REENTRY_WINDOW for g in gaps):
                        behavior["pattern"] = "Repeated"

            # Associated objects
            associated = find_associated_objects(tracked_detections, i)

            # Calculate enriched threat score
            threat_score = calculate_threat_score(
                bbox, frame_shape, track_histories[tracker_id],
                confidence, class_name, zone, behavior, associated
            )

            # Log events every 30 frames for significant detections
            if frame_count % 30 == 0 and threat_score > 30:
                category = SURVEILLANCE_CLASSES.get(class_name, {}).get("category", "unknown")
                event = {
                    "id": event_id,
                    "timestamp": timestamp,
                    "class": class_name,
                    "category": category,
                    "confidence": float(confidence),
                    "threatScore": threat_score,
                    "zone": zone["label"],
                    "zoneId": zone["id"],
                    "behavior": behavior["pattern"],
                    "speed": behavior["speed"],
                    "durationFrames": behavior["duration_frames"],
                    "associatedObjects": [a["class"] for a in associated],
                    "trackerId": int(tracker_id),
                }
                events.append(event)
                event_id += 1

        # Annotate frame with enriched labels
        if len(tracked_detections.xyxy) > 0:
            labels = []
            for i in range(len(tracked_detections.xyxy)):
                tid = tracked_detections.tracker_id[i] if tracked_detections.tracker_id is not None else i
                cid = tracked_detections.class_id[i]
                cname = model.names[cid]
                zone_info = get_zone(
                    (tracked_detections.xyxy[i][0] + tracked_detections.xyxy[i][2]) / 2,
                    (tracked_detections.xyxy[i][1] + tracked_detections.xyxy[i][3]) / 2,
                    width, height
                )
                labels.append(f"#{tid} {cname} [{zone_info['id']}]")

            annotated_frame = box_annotator.annotate(frame.copy(), tracked_detections)
            annotated_frame = label_annotator.annotate(annotated_frame, tracked_detections, labels)
        else:
            annotated_frame = frame.copy()

        out.write(annotated_frame)

    cap.release()
    out.release()

    high_threat_count = sum(1 for e in events if e["threatScore"] >= 70)

    # Compute object class distribution
    class_counts = defaultdict(int)
    for e in events:
        class_counts[e["class"]] += 1

    return {
        "videoUrl": f"/video/{output_filename}",
        "events": events,
        "stats": {
            "totalDetections": len(events),
            "highThreatEvents": high_threat_count,
            "objectDistribution": dict(class_counts),
        },
    }


# Chat functionality
from openai_service import run_openai_chat


def process_frame_logic(frame):
    """
    Process a single frame and return enriched detections with zone/context.
    """
    results = model(frame, verbose=False)[0]
    detections = sv.Detections.from_ultralytics(results)

    detection_list = []
    frame_shape = frame.shape
    h, w = frame_shape[:2]

    if len(detections) > 0:
        class_names = [model.names[cid] for cid in detections.class_id]
        mask = [name in TARGET_CLASS_NAMES for name in class_names]
        detections = detections[mask]

        all_bboxes = detections.xyxy
        all_class_ids = detections.class_id
        all_confidences = detections.confidence

        for idx, (bbox, class_id, confidence) in enumerate(zip(all_bboxes, all_class_ids, all_confidences)):
            class_name = model.names[class_id]
            cx = (bbox[0] + bbox[2]) / 2
            cy = (bbox[1] + bbox[3]) / 2

            zone = get_zone(cx, cy, w, h)
            category = SURVEILLANCE_CLASSES.get(class_name, {}).get("category", "unknown")

            # Find nearby objects
            associated = []
            for j, (b2, cid2) in enumerate(zip(all_bboxes, all_class_ids)):
                if j == idx:
                    continue
                cx2 = (b2[0] + b2[2]) / 2
                cy2 = (b2[1] + b2[3]) / 2
                dist = np.sqrt((cx2 - cx) ** 2 + (cy2 - cy) ** 2)
                if dist < 150:
                    associated.append(model.names[cid2])

            threat_score = calculate_threat_score(
                bbox, frame_shape, [], confidence, class_name, zone, None, 
                [{"class": a} for a in associated]
            )

            detection = {
                "time": datetime.now().strftime("%H:%M:%S"),
                "class": class_name,
                "category": category,
                "confidence": round(float(confidence) * 100, 1),
                "threat": int(threat_score),
                "zone": zone["label"],
                "zoneId": zone["id"],
                "associatedObjects": associated,
            }
            detection_list.append(detection)

    return detection_list


def process_annotated_frame_logic(frame, detections):
    """Annotate frame with detection boxes and enriched labels."""
    annotated_frame = frame.copy()

    for detection in detections:
        threat = detection.get("threat", 0)
        if threat > 70:
            color = (0, 0, 255)
        elif threat > 40:
            color = (0, 165, 255)
        else:
            color = (0, 255, 0)

        h, w = frame.shape[:2]
        box_size = 100
        cx, cy = w // 2, h // 2
        cv2.rectangle(annotated_frame, (cx - box_size, cy - box_size),
                      (cx + box_size, cy + box_size), color, 2)

        label = f"{detection['class']} {detection['threat']}% [{detection.get('zone', '')}]"
        cv2.putText(annotated_frame, label, (cx - box_size, cy - box_size - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    return annotated_frame
