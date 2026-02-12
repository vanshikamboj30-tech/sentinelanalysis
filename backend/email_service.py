"""
Email Service Module for Sentinel AI
Handles sending AI-powered email reports and alerts via SMTP.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
REPORT_EMAIL = os.getenv("REPORT_EMAIL", "joshivaibhavjoc@gmail.com")


def is_email_configured() -> bool:
    """Check if email credentials are configured"""
    return bool(SMTP_USER and SMTP_PASSWORD)


def parse_email_recipients(email_string: str) -> List[str]:
    """Parse comma-separated email addresses into a list"""
    if not email_string:
        return []
    return [email.strip() for email in email_string.split(",") if email.strip()]


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
    attachments: Optional[List[str]] = None
) -> bool:
    """Send an email via SMTP to one or more recipients"""
    if not is_email_configured():
        print("❌ Email not configured. Set SMTP_USER and SMTP_PASSWORD in .env")
        return False
    
    recipients = parse_email_recipients(to_email)
    if not recipients:
        print("❌ No valid email recipients provided")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = ", ".join(recipients)
        
        if text_body:
            part1 = MIMEText(text_body, "plain")
            msg.attach(part1)
        
        part2 = MIMEText(html_body, "html")
        msg.attach(part2)
        
        if attachments:
            for filepath in attachments:
                if os.path.exists(filepath):
                    with open(filepath, "rb") as f:
                        part = MIMEBase("application", "octet-stream")
                        part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename={os.path.basename(filepath)}"
                    )
                    msg.attach(part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipients, msg.as_string())
        
        print(f"✅ Email sent successfully to {', '.join(recipients)}")
        return True
    
    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP authentication failed. Check your credentials.")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        return False
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False


def _severity_color(severity: str) -> str:
    colors = {
        "Critical": "#dc2626",
        "High": "#ef4444",
        "Medium": "#f59e0b",
        "Low": "#22c55e",
    }
    return colors.get(severity, "#888888")


def _severity_badge(severity: str) -> str:
    color = _severity_color(severity)
    return f'<span style="background:{color};color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">{severity.upper()}</span>'


def send_alert_email(
    events: List[Dict],
    video_url: str,
    ai_analysis: Dict = None,
    to_email: Optional[str] = None
) -> bool:
    """Send a high-threat alert email with AI-generated analysis"""
    recipient = to_email or REPORT_EMAIL
    
    # Build AI insights section
    ai_section = ""
    if ai_analysis:
        overall = ai_analysis.get("overall_assessment", "")
        insights = ai_analysis.get("pattern_insights", [])
        if overall:
            ai_section += f"""
            <div style="background:#1e293b;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
                <h4 style="color:#3b82f6;margin:0 0 8px 0;font-size:14px;">🤖 AI ANALYSIS (OpenAI)</h4>
                <p style="color:#e2e8f0;margin:0;font-size:13px;line-height:1.6;">{overall}</p>
            </div>"""
        if insights:
            ai_section += '<div style="margin:12px 0;"><h4 style="color:#f59e0b;font-size:13px;">📊 Pattern Insights:</h4><ul style="color:#cbd5e1;font-size:12px;line-height:1.8;">'
            for insight in insights:
                ai_section += f"<li>{insight}</li>"
            ai_section += "</ul></div>"

    # Build event rows with AI explanations
    event_rows = ""
    analyzed_map = {}
    if ai_analysis:
        for ae in ai_analysis.get("analyzed_events", []):
            analyzed_map[ae.get("event_id")] = ae

    for i, event in enumerate(events[:10], 1):
        severity = event.get("severity", "High")
        ai_event = analyzed_map.get(event.get("id"), {})
        explanation = ai_event.get("explanation", event.get("explanation", ""))
        action = ai_event.get("recommended_action", event.get("recommendedAction", ""))
        
        explanation_row = ""
        if explanation:
            explanation_row = f'<tr><td colspan="4" style="padding:4px 8px 12px 24px;border-bottom:1px solid #333;color:#94a3b8;font-size:11px;font-style:italic;">💡 {explanation}{" → " + action if action else ""}</td></tr>'
        
        event_rows += f"""
        <tr>
            <td style="padding:8px;border-bottom:1px solid #333;">{i}</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{event.get('timestamp', 'N/A')}</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{event.get('class', 'Unknown').upper()}</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{_severity_badge(severity)} {event.get('threatScore', 0)}%</td>
        </tr>
        {explanation_row}
        """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }}
            .container {{ max-width: 650px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; padding: 24px; }}
            .header {{ text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px; }}
            .header h1 {{ color: #ef4444; margin: 0; font-size: 24px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            th {{ background: #333; padding: 10px; text-align: left; font-size: 12px; }}
            .footer {{ text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; color: #888; font-size: 12px; }}
            .btn {{ display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 SENTINEL AI ALERT</h1>
                <span style="background:#ef4444;color:white;padding:4px 12px;border-radius:4px;font-size:12px;">HIGH THREAT DETECTED</span>
                <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">Powered by OpenAI • {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            <p><strong>{len(events)}</strong> high-severity events detected in surveillance footage.</p>
            
            {ai_section}
            
            <h3 style="color:#f59e0b;">📋 Threat Events</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Timestamp</th>
                        <th>Class</th>
                        <th>Severity / Threat</th>
                    </tr>
                </thead>
                <tbody>
                    {event_rows}
                </tbody>
            </table>
            
            <div style="text-align: center;">
                <a href="{video_url}" class="btn">View Processed Video</a>
            </div>
            
            <div class="footer">
                <p>Sentinel AI Surveillance System • AI-powered analysis by OpenAI</p>
                <p>This report was automatically generated. Human review recommended.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"SENTINEL AI ALERT - {len(events)} high-threat events detected. Video: {video_url}"
    
    return send_email(
        to_email=recipient,
        subject=f"🚨 SENTINEL AI ALERT - {len(events)} High-Severity Events Detected",
        html_body=html_body,
        text_body=text_body
    )


def send_analysis_report(
    video_filename: str,
    video_url: str,
    events: List[Dict],
    stats: Dict,
    ai_report: Dict = None,
    to_email: Optional[str] = None
) -> bool:
    """Send a complete AI-powered analysis report email"""
    recipient = to_email or REPORT_EMAIL
    
    # Threat breakdown
    high_count = sum(1 for e in events if e.get("threatScore", 0) >= 70)
    medium_count = sum(1 for e in events if 40 <= e.get("threatScore", 0) < 70)
    low_count = sum(1 for e in events if e.get("threatScore", 0) < 40)
    
    # AI report sections
    ai_summary_section = ""
    ai_findings_section = ""
    ai_recommendations_section = ""
    
    if ai_report:
        incident_summary = ai_report.get("incident_summary", "")
        risk_level = ai_report.get("risk_level", "Unknown")
        behavioral = ai_report.get("behavioral_analysis", "")
        findings = ai_report.get("key_findings", [])
        recommendations = ai_report.get("recommendations", [])
        
        if incident_summary:
            ai_summary_section = f"""
            <div style="background:#1e293b;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
                <h4 style="color:#3b82f6;margin:0 0 8px 0;">🤖 AI INCIDENT SUMMARY</h4>
                <p style="color:#e2e8f0;margin:0 0 8px 0;line-height:1.6;">{incident_summary}</p>
                <p style="margin:0;"><strong>Risk Level:</strong> {_severity_badge(risk_level)}</p>
                {f'<p style="color:#94a3b8;margin:8px 0 0;font-size:12px;">📐 {behavioral}</p>' if behavioral else ''}
            </div>"""
        
        if findings:
            ai_findings_section = '<div style="margin:16px 0;"><h4 style="color:#f59e0b;">🔍 Key Findings:</h4><ul style="color:#cbd5e1;font-size:13px;line-height:1.8;">'
            for f in findings:
                ai_findings_section += f"<li>{f}</li>"
            ai_findings_section += "</ul></div>"
        
        if recommendations:
            ai_recommendations_section = '<div style="background:#1a2332;padding:16px;border-radius:8px;margin:16px 0;"><h4 style="color:#22c55e;margin:0 0 8px 0;">✅ Recommended Actions:</h4><ol style="color:#cbd5e1;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">'
            for r in recommendations:
                ai_recommendations_section += f"<li>{r}</li>"
            ai_recommendations_section += "</ol></div>"

    # Build event rows with AI explanations
    event_rows = ""
    for event in events[:20]:
        threat = event.get("threatScore", 0)
        severity = event.get("severity", "High" if threat >= 70 else "Medium" if threat >= 40 else "Low")
        explanation = event.get("explanation", "")
        
        explanation_cell = f'<td style="padding:8px;border-bottom:1px solid #333;color:#94a3b8;font-size:11px;max-width:200px;">{explanation}</td>' if explanation else '<td style="padding:8px;border-bottom:1px solid #333;color:#555;font-size:11px;">—</td>'
        
        event_rows += f"""
        <tr>
            <td style="padding:8px;border-bottom:1px solid #333;">{event.get('timestamp', 'N/A')}</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{event.get('class', 'Unknown').upper()}</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{event.get('confidence', 0):.1f}%</td>
            <td style="padding:8px;border-bottom:1px solid #333;">{_severity_badge(severity)} {threat}%</td>
            {explanation_cell}
        </tr>
        """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }}
            .container {{ max-width: 750px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; padding: 24px; }}
            .header {{ text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }}
            .header h1 {{ color: #3b82f6; margin: 0; font-size: 24px; }}
            .stats-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }}
            .stat-card {{ background: #262626; padding: 16px; border-radius: 8px; text-align: center; }}
            .stat-value {{ font-size: 28px; font-weight: bold; }}
            .stat-label {{ color: #888; font-size: 12px; text-transform: uppercase; }}
            table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }}
            th {{ background: #333; padding: 10px; text-align: left; font-size: 11px; }}
            .footer {{ text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; color: #888; font-size: 12px; }}
            .btn {{ display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 SENTINEL AI ANALYSIS REPORT</h1>
                <p style="color: #888; margin: 8px 0 0 0;">Video: {video_filename}</p>
                <p style="color: #64748b; margin: 4px 0 0; font-size: 11px;">AI Analysis powered by OpenAI • {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            {ai_summary_section}
            
            <h3 style="color: #3b82f6;">📈 Summary Statistics</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color:#ef4444;">{high_count}</div>
                    <div class="stat-label">High Threat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color:#f59e0b;">{medium_count}</div>
                    <div class="stat-label">Medium Threat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color:#22c55e;">{low_count}</div>
                    <div class="stat-label">Low Threat</div>
                </div>
            </div>
            
            {ai_findings_section}
            
            <h3 style="color: #3b82f6;">📋 Detection Events ({len(events)} total)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Class</th>
                        <th>Confidence</th>
                        <th>Severity</th>
                        <th>AI Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    {event_rows}
                </tbody>
            </table>
            
            {f'<p style="color: #888; font-style: italic;">Showing first 20 of {len(events)} events</p>' if len(events) > 20 else ''}
            
            {ai_recommendations_section}
            
            <div style="text-align: center;">
                <a href="{video_url}" class="btn">View Processed Video</a>
            </div>
            
            <div class="footer">
                <p>Sentinel AI Surveillance System • AI-powered analysis by OpenAI</p>
                <p>This report was automatically generated. Human review is recommended before taking action.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
SENTINEL AI - VIDEO ANALYSIS REPORT (AI-Powered)

Video: {video_filename}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SUMMARY:
- High Threat Events: {high_count}
- Medium Threat Events: {medium_count}
- Low Threat Events: {low_count}
- Total Detections: {len(events)}

VIDEO URL: {video_url}
"""
    
    return send_email(
        to_email=recipient,
        subject=f"📊 Sentinel AI Report - {video_filename} ({len(events)} events)",
        html_body=html_body,
        text_body=text_body
    )
