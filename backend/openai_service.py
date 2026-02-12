"""
Centralized OpenAI service module for Sentinel AI.
Handles all natural language reasoning and interpretation tasks:
- Detection event analysis & severity classification
- Threat explanation generation
- Surveillance assistant queries (chat)
- Executive summaries and analytics insights
- AI-powered email report content generation
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

DETECTION_ANALYSIS_PROMPT = """You are Sentinel AI, analyzing enriched YOLO detection outputs with zone, behavior, and multi-object context data.

Each detection event includes:
- **class**: Object type (person, car, backpack, knife, etc.)
- **category**: Grouping (person, vehicle, carried_object, weapon, equipment, animal, misc)
- **confidence**: YOLO detection confidence
- **threatScore**: Pre-computed threat score (0-100)
- **zone**: Spatial zone where detected (Restricted Zone, Entrance Zone, Perimeter Zone, Public Area)
- **behavior**: Inferred movement pattern (Transient, Loitering, Evasive, Repeated)
- **speed**: Movement speed in pixels/frame
- **durationFrames**: How long the object has been tracked
- **associatedObjects**: Other objects detected near this one (e.g., person + backpack)

For each detection event, you must:

1. **Classify Severity**: Assign one of: Low, Medium, High, Critical
   - Critical: Weapons detected, intrusions in restricted zones, evasive behavior with carried objects
   - High: Loitering in restricted zones, repeated zone entry, person + suspicious carried object
   - Medium: Unusual object combinations, perimeter activity, slow movement in sensitive areas
   - Low: Normal transit, public area activity, expected object types

2. **Analyze Multi-Object Context**: Consider object combinations:
   - Person + backpack/suitcase in restricted zone = elevated threat
   - Person + vehicle near entrance at unusual times = potential concern
   - Multiple persons converging = coordinated activity
   - Lone person + weapon = critical

3. **Assess Behavioral Patterns**: Use the behavior and speed data to classify:
   - Loitering: Extended presence in one area (especially restricted/perimeter zones)
   - Evasive: Fast, erratic movement suggesting avoidance
   - Repeated: Multiple zone entries/exits suggesting surveillance or planning
   - Transient: Normal pass-through activity

4. **Generate Explanation**: Write a clear, context-rich 1-2 sentence explanation incorporating zone, behavior, and associated objects. Example:
   "A person carrying a backpack was detected loitering in the Restricted Zone for 4 minutes with low movement speed (2.1 px/frame), indicating potentially suspicious reconnaissance behavior."

5. **Recommend Action**: Provide one specific, actionable recommendation.

Respond ONLY with valid JSON matching this schema:
{
  "analyzed_events": [
    {
      "event_id": <number>,
      "severity": "Low|Medium|High|Critical",
      "explanation": "<context-rich 1-2 sentence explanation>",
      "behavior_pattern": "Transient|Loitering|Repeated|Evasive|Normal",
      "recommended_action": "<specific action>",
      "ai_confidence": <0.0-1.0>,
      "context_flags": ["<flag1>", "<flag2>"]
    }
  ],
  "overall_assessment": "<2-3 sentence summary including zone and behavior analysis>",
  "pattern_insights": ["<insight1>", "<insight2>"],
  "object_correlations": ["<correlation1>", "<correlation2>"]
}"""

EMAIL_REPORT_PROMPT = """You are Sentinel AI, generating a professional security report for an enterprise security team. Based on the detection events and AI analysis provided, create a structured report with:

1. **Incident Summary**: 2-3 sentence overview of what happened
2. **Key Findings**: Top threats with explanations
3. **Behavioral Analysis**: Movement patterns and anomalies
4. **Risk Assessment**: Overall risk level and justification
5. **Recommendations**: 3-5 actionable next steps

Tone: Professional, clear, actionable. Suitable for enterprise security leadership.
Format: Return as JSON with keys: incident_summary, key_findings (array), behavioral_analysis, risk_level (Low/Medium/High/Critical), recommendations (array)."""

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


# ======================== CORE FUNCTIONS ========================

def analyze_detections(events: list) -> dict:
    """
    Analyze YOLO detection outputs using OpenAI.
    Classifies severity, identifies patterns, generates explanations.
    Returns enriched events with AI insights.
    """
    if not client:
        return {
            "analyzed_events": [],
            "overall_assessment": "OpenAI not configured. Raw detections available without AI analysis.",
            "pattern_insights": [],
            "error": "OPENAI_API_KEY is not configured."
        }

    if not events:
        return {
            "analyzed_events": [],
            "overall_assessment": "No detection events to analyze.",
            "pattern_insights": []
        }

    try:
        log_data = json.dumps(events, indent=2)

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": DETECTION_ANALYSIS_PROMPT},
                {"role": "user", "content": f"Analyze these YOLO detection events:\n{log_data}"},
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        return result

    except Exception as e:
        print(f"Error analyzing detections: {e}")
        return {
            "analyzed_events": [],
            "overall_assessment": f"AI analysis failed: {str(e)}",
            "pattern_insights": [],
            "error": str(e)
        }


def generate_email_report_content(events: list, stats: dict, ai_analysis: dict = None) -> dict:
    """
    Generate AI-powered email report content from detection events.
    Returns structured content for email template rendering.
    """
    if not client:
        return {
            "incident_summary": "AI-powered summary unavailable. See raw detection data below.",
            "key_findings": [],
            "behavioral_analysis": "N/A",
            "risk_level": "Unknown",
            "recommendations": ["Configure OpenAI API key for AI-powered reports."]
        }

    try:
        context = {
            "events": events,
            "stats": stats,
            "ai_analysis": ai_analysis or {}
        }

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": EMAIL_REPORT_PROMPT},
                {"role": "user", "content": f"Generate a security report for this data:\n{json.dumps(context, indent=2)}"},
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        print(f"Error generating email report: {e}")
        return {
            "incident_summary": f"Report generation error: {str(e)}",
            "key_findings": [],
            "behavioral_analysis": "N/A",
            "risk_level": "Unknown",
            "recommendations": []
        }


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
