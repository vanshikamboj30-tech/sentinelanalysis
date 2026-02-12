"""
Centralized OpenAI service module for Sentinel AI.
Handles all natural language reasoning and interpretation tasks:
- Threat explanation generation
- Surveillance assistant queries (chat)
- Executive summaries and analytics insights
"""

import os
import json
from openai import OpenAI

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY environment variable is not set!")
    print("Please set it with: export OPENAI_API_KEY='your-api-key-here'")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Default model for all tasks
DEFAULT_MODEL = "gpt-4o"

# ======================== SYSTEM PROMPTS ========================

SURVEILLANCE_ANALYST_PROMPT = """**System Role:**
You are **Sentinel AI**, a hyper-specialized, autonomous surveillance analyst. Your mission is to provide concise, factual, and professional analysis based *only* on the provided raw surveillance logs and the visual evidence in the video footage. Your tone must be that of a military-grade intelligence system: analytical, brief, and objective.

**Core Guidelines:**
1. **Cross-Reference:** Always attempt to cross-reference the data logs (e.g., Threat Score, AOI breach, Time) with visual details in the video evidence when answering the user's query.
2. **Mission Briefing:** If the user asks for a 'Summary' or 'Mission Briefing', compile the top 3 critical events (highest Threat Score, first AOI breach, statistical outliers) and their associated timestamps.
3. **Behavioral Hypothesis:** When asked to 'analyze behavior', classify the movement as **Transient**, **Loitering**, or **Evasive**, and provide a one-sentence justification.
4. **Time-Slice Analysis:** If a time range is specified (e.g., '10s to 20s'), filter the log data exclusively to that window before answering.
5. **Data Absence Policy:** If the answer is not present in the logs or video, state: **'Information not available in current mission logs.'**
6. **Formatting:** Report all numerical metrics (Speed, Time, Threat Score) with a maximum of **one decimal place**.

**Threat Score Reference:**
- 70-100: High Threat (requires immediate attention)
- 40-69: Medium Threat (monitor closely)
- 0-39: Low Threat (routine detection)"""

THREAT_EXPLANATION_PROMPT = """You are Sentinel AI, a security-focused AI assistant. Given detection events from a surveillance system, provide a clear, concise threat explanation. Focus on:
1. What was detected and where
2. Why it may be a threat (behavioral indicators)
3. Recommended actions
Keep responses professional, security-focused, and under 200 words."""

EXECUTIVE_SUMMARY_PROMPT = """You are Sentinel AI, generating an executive summary of surveillance analysis. Provide:
1. Overview of the analysis period
2. Key findings (top threats, patterns)
3. Statistical highlights
4. Actionable recommendations
Format as a brief, professional intelligence report."""


def run_openai_chat(user_query: str, event_logs: list) -> str:
    """
    Use OpenAI API to analyze surveillance data and respond to user query.
    Interprets structured detection outputs with natural language reasoning.
    """
    if not client:
        return "Error: OPENAI_API_KEY is not configured. Please set the environment variable."

    try:
        log_data = json.dumps(event_logs, indent=2)

        messages = [
            {"role": "system", "content": SURVEILLANCE_ANALYST_PROMPT},
            {
                "role": "user",
                "content": f"""**Data Context:**
The user has provided a video file and the following detection logs from frame-by-frame analysis.

LOG DATA:
---
{log_data}
---

**User Query:**
{user_query}

**Analysis Request:**
Based on the log data and the video, provide the most relevant and precise answer to the user's query.""",
            },
        ]

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error communicating with AI: {str(e)}"


def generate_threat_explanation(events: list) -> str:
    """
    Generate a human-readable threat explanation from detection events.
    """
    if not client:
        return "Error: OPENAI_API_KEY is not configured."

    try:
        log_data = json.dumps(events, indent=2)

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": THREAT_EXPLANATION_PROMPT},
                {"role": "user", "content": f"Detection events:\n{log_data}"},
            ],
            temperature=0.3,
            max_tokens=512,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error generating explanation: {str(e)}"


def generate_executive_summary(events: list, stats: dict) -> str:
    """
    Generate an executive summary of a surveillance analysis session.
    """
    if not client:
        return "Error: OPENAI_API_KEY is not configured."

    try:
        context = json.dumps({"events": events, "stats": stats}, indent=2)

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": EXECUTIVE_SUMMARY_PROMPT},
                {"role": "user", "content": f"Analysis data:\n{context}"},
            ],
            temperature=0.3,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error generating summary: {str(e)}"
