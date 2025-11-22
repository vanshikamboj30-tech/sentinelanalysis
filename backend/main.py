from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import psutil
import os
import base64
import numpy as np
import cv2
from pathlib import Path
from logic import process_video_logic, run_gemini_chat, process_frame_logic

app = FastAPI(title="Sentinel AI Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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


@app.get("/health")
async def health_check():
    """Return system CPU and RAM usage"""
    cpu_percent = psutil.cpu_percent(interval=1)
    ram_percent = psutil.virtual_memory().percent
    
    return JSONResponse({
        "cpu": int(cpu_percent),
        "ram": int(ram_percent)
    })


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    """
    Accept video upload, process with YOLO and ByteTrack,
    return processed video URL and event logs
    """
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a video file.")
    
    # Save uploaded file temporarily
    temp_input_path = f"temp_input_{file.filename}"
    with open(temp_input_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Process video and get results
        result = process_video_logic(temp_input_path)
        
        # Clean up temporary input file
        os.remove(temp_input_path)
        
        return JSONResponse(result)
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")


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
        return JSONResponse({"detections": detections})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing failed: {str(e)}")


@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Accept user query and event logs,
    send to Gemini API for analysis
    """
    try:
        reply = run_gemini_chat(request.query, request.logs)
        return JSONResponse({"reply": reply})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
