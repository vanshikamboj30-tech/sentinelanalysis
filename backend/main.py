from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import psutil
import os
import base64
import numpy as np
import cv2
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from logic import process_video_logic, process_frame_logic, process_annotated_frame_logic
from openai_service import (
    run_openai_chat, analyze_detections, generate_email_report_content,
    generate_threat_explanation, generate_executive_summary
)
from database import (
    save_video_analysis, save_alert, save_detection_event,
    get_recent_analyses, get_analytics_summary, get_threat_distribution,
    get_recent_alerts, get_video_analysis
)
from email_service import send_alert_email, send_analysis_report, is_email_configured

app = FastAPI(title="Sentinel AI Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory for processed videos
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


class ChatRequest(BaseModel):
    query: str
    logs: list


class FrameRequest(BaseModel):
    frame: str  # base64 encoded image


class AnnotatedFrameRequest(BaseModel):
    frame: str  # base64 encoded image
    detections: list


class AlertRequest(BaseModel):
    events: list
    videoUrl: str
    email: Optional[str] = None
    phone: Optional[str] = None
    sendEmail: Optional[bool] = True


class AnalyzeDetectionsRequest(BaseModel):
    events: list


@app.get("/health")
async def health_check():
    """Return system CPU and RAM usage"""
    cpu_percent = psutil.cpu_percent(interval=1)
    ram_percent = psutil.virtual_memory().percent
    
    return JSONResponse({
        "cpu": int(cpu_percent),
        "ram": int(ram_percent)
    })


@app.get("/status")
async def system_status():
    """Return system configuration status"""
    return JSONResponse({
        "database": True,
        "email": is_email_configured(),
        "openai": bool(os.getenv("OPENAI_API_KEY"))
    })


class AnalyzeRequest(BaseModel):
    email: Optional[str] = None


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...), email: Optional[str] = None):
    """
    Accept video upload, process with YOLO and ByteTrack,
    analyze with OpenAI, return processed video URL, events, and AI insights
    """
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a video file.")
    
    # Save uploaded file temporarily
    temp_input_path = f"temp_input_{file.filename}"
    with open(temp_input_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Step 1: Process video with YOLO + ByteTrack
        result = process_video_logic(temp_input_path)
        
        # Step 2: Analyze detections with OpenAI
        ai_analysis = analyze_detections(result["events"])
        result["aiAnalysis"] = ai_analysis
        
        # Enrich events with AI severity and explanations
        analyzed_map = {}
        for ae in ai_analysis.get("analyzed_events", []):
            analyzed_map[ae.get("event_id")] = ae
        
        for event in result["events"]:
            ai_event = analyzed_map.get(event["id"], {})
            event["severity"] = ai_event.get("severity", _get_severity(event["threatScore"]))
            event["explanation"] = ai_event.get("explanation", "")
            event["behaviorPattern"] = ai_event.get("behavior_pattern", event.get("behavior", "Normal"))
            event["recommendedAction"] = ai_event.get("recommended_action", "")
            event["aiConfidence"] = ai_event.get("ai_confidence", 0)
            event["contextFlags"] = ai_event.get("context_flags", [])
        
        # Update stats with AI insights
        result["stats"]["overallAssessment"] = ai_analysis.get("overall_assessment", "")
        result["stats"]["patternInsights"] = ai_analysis.get("pattern_insights", [])
        result["stats"]["criticalEvents"] = sum(1 for e in result["events"] if e.get("severity") == "Critical")
        
        # Step 3: Save to database
        analysis_id = save_video_analysis(
            video_filename=file.filename,
            video_url=result["videoUrl"],
            events=result["events"],
            stats=result["stats"]
        )
        
        # Step 4: Generate AI-powered email report and send
        if is_email_configured():
            report_content = generate_email_report_content(
                result["events"], result["stats"], ai_analysis
            )
            email_sent = send_analysis_report(
                video_filename=file.filename,
                video_url=result["videoUrl"],
                events=result["events"],
                stats=result["stats"],
                ai_report=report_content,
                to_email=email
            )
            result["emailSent"] = email_sent
            result["reportContent"] = report_content
        else:
            result["emailSent"] = False
        
        # Step 5: Auto-send immediate alerts for Critical/High severity
        critical_high = [e for e in result["events"] if e.get("severity") in ("Critical", "High")]
        if critical_high and is_email_configured():
            send_alert_email(
                events=critical_high,
                video_url=result["videoUrl"],
                ai_analysis=ai_analysis,
                to_email=email
            )
            result["alertSent"] = True
        else:
            result["alertSent"] = False
        
        result["analysisId"] = analysis_id
        
        # Clean up temporary input file
        os.remove(temp_input_path)
        
        return JSONResponse(result)
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")


@app.post("/analyze-detections")
async def analyze_detections_endpoint(request: AnalyzeDetectionsRequest):
    """
    Analyze raw YOLO detection events with OpenAI.
    Returns AI-powered severity classification, explanations, and insights.
    """
    try:
        analysis = analyze_detections(request.events)
        return JSONResponse(analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection analysis failed: {str(e)}")


@app.post("/process-frame")
async def process_frame(request: FrameRequest):
    """
    Process a single frame from webcam stream
    Returns detections with threat scores
    """
    try:
        # Decode base64 image
        img_data = base64.b64decode(request.frame.split(',')[1] if ',' in request.frame else request.frame)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process frame and get detections
        detections = process_frame_logic(frame)
        
        # Save high-threat detections to database
        for detection in detections:
            if detection.get("threat", 0) >= 70:
                save_detection_event(
                    source="live",
                    event_data={
                        "timestamp": detection.get("time"),
                        "class": detection.get("class"),
                        "confidence": detection.get("confidence"),
                        "threatScore": detection.get("threat")
                    }
                )
        
        return JSONResponse({"detections": detections})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing failed: {str(e)}")


@app.post("/send-alert")
async def send_alert(request: AlertRequest):
    """
    Send email/SMS notifications for high-threat events with AI analysis
    """
    try:
        # Analyze events with OpenAI before alerting
        ai_analysis = analyze_detections(request.events)
        
        # Save alert to database
        alert_id = save_alert(
            events=request.events,
            video_url=request.videoUrl,
            email=request.email,
            phone=request.phone,
            status="pending"
        )
        
        email_sent = False
        
        # Send email if configured and requested
        if request.sendEmail and is_email_configured():
            email_sent = send_alert_email(
                events=request.events,
                video_url=request.videoUrl,
                ai_analysis=ai_analysis,
                to_email=request.email
            )
        
        return JSONResponse({
            "success": True,
            "alertId": alert_id,
            "emailSent": email_sent,
            "aiAnalysis": ai_analysis,
            "message": f"Alert processed for {len(request.events)} events",
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert failed: {str(e)}")


@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Accept user query and event logs,
    send to OpenAI API for analysis
    """
    try:
        reply = run_openai_chat(request.query, request.logs)
        return JSONResponse({"reply": reply})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/annotate-frame")
async def annotate_frame(request: AnnotatedFrameRequest):
    """
    Process frame with detections and return annotated image
    """
    try:
        # Decode base64 image
        img_data = base64.b64decode(request.frame.split(',')[1] if ',' in request.frame else request.frame)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Annotate frame with detections
        annotated_frame = process_annotated_frame_logic(frame, request.detections)
        
        # Encode back to base64
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')
        
        return JSONResponse({"annotated_frame": f"data:image/jpeg;base64,{annotated_b64}"})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Annotation failed: {str(e)}")


# ==================== ANALYTICS & REPORTS ENDPOINTS ====================

@app.get("/analytics/summary")
async def get_analytics():
    """Get overall analytics summary from database"""
    try:
        summary = get_analytics_summary()
        distribution = get_threat_distribution()
        
        return JSONResponse({
            "summary": summary,
            "threatDistribution": distribution
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@app.get("/analytics/recent")
async def get_recent():
    """Get recent analyses and alerts"""
    try:
        analyses = get_recent_analyses(limit=50)
        alerts = get_recent_alerts(limit=20)
        
        return JSONResponse({
            "analyses": analyses,
            "alerts": alerts
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent data: {str(e)}")


@app.get("/reports")
async def list_reports(limit: int = 50):
    """Get all analysis reports"""
    try:
        reports = get_recent_analyses(limit=limit)
        return JSONResponse(reports)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get reports: {str(e)}")


@app.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get a specific report by ID"""
    try:
        report = get_video_analysis(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return JSONResponse(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get report: {str(e)}")


class ResendReportRequest(BaseModel):
    email: Optional[str] = None


@app.post("/reports/{report_id}/resend")
async def resend_report(report_id: str, request: ResendReportRequest):
    """Resend a report via email with AI-generated content"""
    try:
        report = get_video_analysis(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if not is_email_configured():
            raise HTTPException(status_code=400, detail="Email not configured")
        
        # Generate fresh AI report content
        ai_analysis = analyze_detections(report.get("events", []))
        report_content = generate_email_report_content(
            report.get("events", []),
            report.get("stats", {}),
            ai_analysis
        )
        
        email_sent = send_analysis_report(
            video_filename=report.get("video_filename", "Unknown"),
            video_url=report.get("video_url", ""),
            events=report.get("events", []),
            stats=report.get("stats", {}),
            ai_report=report_content,
            to_email=request.email
        )
        
        return JSONResponse({
            "success": email_sent,
            "message": "Report sent successfully" if email_sent else "Failed to send email"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend report: {str(e)}")


def _get_severity(threat_score: int) -> str:
    """Fallback severity from threat score when AI is unavailable"""
    if threat_score >= 90:
        return "Critical"
    elif threat_score >= 70:
        return "High"
    elif threat_score >= 40:
        return "Medium"
    return "Low"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
