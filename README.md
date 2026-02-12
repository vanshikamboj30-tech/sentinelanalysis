# Sentinel AI — Autonomous Surveillance Intelligence Platform

**URL**: https://lovable.dev/projects/92eed872-340d-4d1e-8c27-dabea9378d78

## Overview

Sentinel AI is a military-grade autonomous surveillance intelligence system that combines real-time computer vision with OpenAI-powered reasoning for threat detection, behavioral analysis, and actionable security insights.

## Architecture

- **Computer Vision Layer**: YOLOv8 + ByteTrack for object detection and multi-object tracking
- **Reasoning & Intelligence Layer**: OpenAI GPT-4o for threat explanation, natural language queries, and executive summaries
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python) with MongoDB Atlas for persistence

> **Design Principle**: OpenAI is used exclusively for reasoning and interpretation of structured detection outputs. It does NOT perform raw object detection — that is handled by YOLOv8.

## OpenAI Integration

Sentinel AI uses OpenAI as its primary AI provider for all natural language reasoning tasks:

### How OpenAI Is Used
| Task | Description |
|------|-------------|
| **Threat Explanation** | Generates human-readable explanations of detected threats |
| **Surveillance Chat** | Answers natural language queries about detection events |
| **Executive Summaries** | Produces concise intelligence reports from analysis data |
| **Behavioral Analysis** | Classifies movement patterns (Transient, Loitering, Evasive) |

### Why OpenAI?
- **Explainable AI**: Clear, deterministic prompts produce transparent, auditable responses
- **Human-in-the-Loop**: AI provides recommendations; humans make final decisions
- **Responsible AI**: Prompts are designed for professional, security-focused output without speculation
- **Separation of Concerns**: Vision models detect; OpenAI interprets and explains

### Configuration
Set your OpenAI API key in the backend environment:
```bash
export OPENAI_API_KEY='your-api-key-here'
```

The centralized OpenAI logic lives in `backend/openai_service.py` with reusable, deterministic system prompts.

## Key Features

- **Video Analysis**: Upload surveillance footage for automated AI-powered analysis
- **Live Feed**: Browser-based webcam recording with real-time detection
- **AI Chat**: Natural language Q&A about surveillance events (OpenAI-powered)
- **Threat Scoring**: Dynamic 0-100 scoring based on AOI, loitering, and confidence
- **Email Alerts**: Automatic SMTP notifications for high-threat events
- **Reports**: HTML email reports and downloadable summaries
- **Analytics Dashboard**: Charts, stats, and threat distribution visualization
- **System Health**: Real-time CPU/RAM monitoring

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: FastAPI, Python, OpenAI SDK, YOLOv8, ByteTrack (Supervision)
- **Database**: MongoDB Atlas (via Motor async driver)
- **Email**: SMTP (Gmail)

## Getting Started

### Frontend
```sh
npm install
npm run dev
```

### Backend
```sh
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys
python main.py
```

## Buildathon Alignment

This project emphasizes:
- **Explainable AI** — All AI-generated outputs include context and reasoning
- **Human-in-the-Loop** — AI assists; operators decide
- **Responsible AI** — No speculation, no autonomous actions, professional tone
- **Clear Architecture** — Vision detection and AI reasoning are cleanly separated

## Deployment

Open [Lovable](https://lovable.dev/projects/92eed872-340d-4d1e-8c27-dabea9378d78) and click Share → Publish.
