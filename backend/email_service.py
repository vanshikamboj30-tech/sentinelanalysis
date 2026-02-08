"""
Email Service Module for Sentinel AI
Handles sending email reports and alerts via SMTP.
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
    """
    Parse comma-separated email addresses into a list
    """
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
    """
    Send an email via SMTP to one or more recipients
    to_email can be a single email or comma-separated list
    Returns: True if successful, False otherwise
    """
    if not is_email_configured():
        print("❌ Email not configured. Set SMTP_USER and SMTP_PASSWORD in .env")
        return False
    
    # Parse recipients (supports comma-separated list)
    recipients = parse_email_recipients(to_email)
    if not recipients:
        print("❌ No valid email recipients provided")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = ", ".join(recipients)  # Display all recipients
        
        # Add text part
        if text_body:
            part1 = MIMEText(text_body, "plain")
            msg.attach(part1)
        
        # Add HTML part
        part2 = MIMEText(html_body, "html")
        msg.attach(part2)
        
        # Add attachments if any
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
        
        # Send email to all recipients
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


def send_alert_email(
    events: List[Dict],
    video_url: str,
    to_email: Optional[str] = None
) -> bool:
    """
    Send a high-threat alert email
    """
    recipient = to_email or REPORT_EMAIL
    
    # Build HTML email
    event_rows = ""
    for i, event in enumerate(events[:10], 1):  # Limit to top 10
        threat_color = "#ef4444" if event.get("threatScore", 0) >= 70 else "#f59e0b"
        event_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{i}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{event.get('timestamp', 'N/A')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{event.get('class', 'Unknown').upper()}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333; color: {threat_color}; font-weight: bold;">
                {event.get('threatScore', 0)}%
            </td>
        </tr>
        """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; padding: 24px; }}
            .header {{ text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px; }}
            .header h1 {{ color: #ef4444; margin: 0; font-size: 24px; }}
            .alert-badge {{ background: #ef4444; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            th {{ background: #333; padding: 10px; text-align: left; }}
            .footer {{ text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; color: #888; font-size: 12px; }}
            .btn {{ display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 SENTINEL AI ALERT</h1>
                <span class="alert-badge">HIGH THREAT DETECTED</span>
            </div>
            
            <p><strong>{len(events)}</strong> high-threat events detected in surveillance footage.</p>
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h3 style="color: #f59e0b;">📋 Top Threat Events</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Timestamp</th>
                        <th>Class</th>
                        <th>Threat</th>
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
                <p>This is an automated alert from Sentinel AI Surveillance System</p>
                <p>Do not reply to this email</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
SENTINEL AI - HIGH THREAT ALERT

{len(events)} high-threat events detected in surveillance footage.
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Top Events:
"""
    for i, event in enumerate(events[:10], 1):
        text_body += f"{i}. [{event.get('timestamp', 'N/A')}] {event.get('class', 'Unknown').upper()} - Threat: {event.get('threatScore', 0)}%\n"
    
    text_body += f"\nVideo URL: {video_url}"
    
    return send_email(
        to_email=recipient,
        subject=f"🚨 SENTINEL AI ALERT - {len(events)} High-Threat Events Detected",
        html_body=html_body,
        text_body=text_body
    )


def send_analysis_report(
    video_filename: str,
    video_url: str,
    events: List[Dict],
    stats: Dict,
    to_email: Optional[str] = None
) -> bool:
    """
    Send a complete analysis report email
    """
    recipient = to_email or REPORT_EMAIL
    
    # Calculate threat breakdown
    high_count = sum(1 for e in events if e.get("threatScore", 0) >= 70)
    medium_count = sum(1 for e in events if 40 <= e.get("threatScore", 0) < 70)
    low_count = sum(1 for e in events if e.get("threatScore", 0) < 40)
    
    # Build event rows
    event_rows = ""
    for event in events[:20]:  # Limit to 20 events
        threat = event.get("threatScore", 0)
        if threat >= 70:
            threat_color = "#ef4444"
            threat_label = "HIGH"
        elif threat >= 40:
            threat_color = "#f59e0b"
            threat_label = "MEDIUM"
        else:
            threat_color = "#22c55e"
            threat_label = "LOW"
        
        event_rows += f"""
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{event.get('timestamp', 'N/A')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{event.get('class', 'Unknown').upper()}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333;">{event.get('confidence', 0):.1f}%</td>
            <td style="padding: 8px; border-bottom: 1px solid #333; color: {threat_color};">
                <strong>{threat}%</strong> ({threat_label})
            </td>
        </tr>
        """
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; }}
            .container {{ max-width: 700px; margin: 0 auto; background: #1a1a1a; border-radius: 8px; padding: 24px; }}
            .header {{ text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }}
            .header h1 {{ color: #3b82f6; margin: 0; font-size: 24px; }}
            .stats-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }}
            .stat-card {{ background: #262626; padding: 16px; border-radius: 8px; text-align: center; }}
            .stat-value {{ font-size: 28px; font-weight: bold; }}
            .stat-label {{ color: #888; font-size: 12px; text-transform: uppercase; }}
            .high {{ color: #ef4444; }}
            .medium {{ color: #f59e0b; }}
            .low {{ color: #22c55e; }}
            table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            th {{ background: #333; padding: 10px; text-align: left; }}
            .footer {{ text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; color: #888; font-size: 12px; }}
            .btn {{ display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 SENTINEL AI ANALYSIS REPORT</h1>
                <p style="color: #888; margin: 8px 0 0 0;">Video: {video_filename}</p>
            </div>
            
            <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h3 style="color: #3b82f6;">📈 Summary Statistics</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value high">{high_count}</div>
                    <div class="stat-label">High Threat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value medium">{medium_count}</div>
                    <div class="stat-label">Medium Threat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value low">{low_count}</div>
                    <div class="stat-label">Low Threat</div>
                </div>
            </div>
            
            <h3 style="color: #3b82f6;">📋 Detection Events ({len(events)} total)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Class</th>
                        <th>Confidence</th>
                        <th>Threat Level</th>
                    </tr>
                </thead>
                <tbody>
                    {event_rows}
                </tbody>
            </table>
            
            {f'<p style="color: #888; font-style: italic;">Showing first 20 of {len(events)} events</p>' if len(events) > 20 else ''}
            
            <div style="text-align: center;">
                <a href="{video_url}" class="btn">View Processed Video</a>
            </div>
            
            <div class="footer">
                <p>Sentinel AI Video Surveillance Analysis System</p>
                <p>Report generated automatically after video processing</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
SENTINEL AI - VIDEO ANALYSIS REPORT

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
