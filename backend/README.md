# Sentinel AI Backend

FastAPI backend for video surveillance analysis using YOLOv8 and OpenAI.

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set OpenAI API Key

Get your API key from: https://platform.openai.com/api-keys

**Linux/Mac:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**
```bash
set OPENAI_API_KEY=your-api-key-here
```

**Windows (PowerShell):**
```bash
$env:OPENAI_API_KEY="your-api-key-here"
```

### 5. Run the Backend

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The backend will start on: http://localhost:8000

## API Endpoints

- `GET /health` - System health check (CPU/RAM usage)
- `POST /analyze` - Upload and analyze video file
- `POST /chat` - Chat with AI about surveillance data

## Testing

Visit http://localhost:8000/docs for interactive API documentation.
