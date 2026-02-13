"""
MongoDB Database Module for Sentinel AI
Handles all database operations for storing analysis events, video metadata, and alerts.
"""
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
from dotenv import load_dotenv


def _serialize_doc(doc: Dict) -> Dict:
    """Recursively convert MongoDB-specific types to JSON-serializable types."""
    if doc is None:
        return doc
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, list):
            serialized[key] = [
                _serialize_doc(item) if isinstance(item, dict) else
                str(item) if isinstance(item, ObjectId) else
                item.isoformat() if isinstance(item, datetime) else item
                for item in value
            ]
        elif isinstance(value, dict):
            serialized[key] = _serialize_doc(value)
        else:
            serialized[key] = value
    return serialized

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sentinel_db")

# Global database connection
_client: Optional[MongoClient] = None
_db = None


def get_database():
    """Get or create MongoDB connection"""
    global _client, _db
    
    if _db is not None:
        return _db
    
    try:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        _client.admin.command('ping')
        default_db = _client.get_default_database()
        _db = default_db if default_db is not None else _client["sentinel_db"]
        print(f"✅ Connected to MongoDB: {_db.name}")
        return _db
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None


def close_connection():
    """Close MongoDB connection"""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("MongoDB connection closed")


# ==================== VIDEO ANALYSIS OPERATIONS ====================

def save_video_analysis(
    video_filename: str,
    video_url: str,
    events: List[Dict],
    stats: Dict,
    duration_seconds: float = 0
) -> Optional[str]:
    """
    Save video analysis results to database
    Returns: inserted document ID or None if failed
    """
    db = get_database()
    if db is None:
        print("Database not available, skipping save")
        return None
    
    document = {
        "video_filename": video_filename,
        "video_url": video_url,
        "events": events,
        "stats": stats,
        "duration_seconds": duration_seconds,
        "total_events": len(events),
        "high_threat_count": sum(1 for e in events if e.get("threatScore", 0) >= 70),
        "medium_threat_count": sum(1 for e in events if 40 <= e.get("threatScore", 0) < 70),
        "low_threat_count": sum(1 for e in events if e.get("threatScore", 0) < 40),
        "created_at": datetime.utcnow(),
        "status": "completed"
    }
    
    try:
        result = db.video_analyses.insert_one(document)
        print(f"✅ Saved analysis to database: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"❌ Failed to save analysis: {e}")
        return None


def get_video_analysis(analysis_id: str) -> Optional[Dict]:
    """Get a specific video analysis by ID"""
    db = get_database()
    if db is None:
        return None
    
    try:
        result = db.video_analyses.find_one({"_id": ObjectId(analysis_id)})
        if result:
            return _serialize_doc(result)
        return result
    except Exception as e:
        print(f"Error fetching analysis: {e}")
        return None


def get_recent_analyses(limit: int = 10) -> List[Dict]:
    """Get recent video analyses"""
    db = get_database()
    if db is None:
        return []
    
    try:
        results = list(db.video_analyses.find()
                      .sort("created_at", -1)
                      .limit(limit))
        return [_serialize_doc(r) for r in results]
    except Exception as e:
        print(f"Error fetching recent analyses: {e}")
        return []


# ==================== EVENT LOGGING OPERATIONS ====================

def save_detection_event(
    source: str,  # "video" or "live"
    event_data: Dict,
    video_id: Optional[str] = None
) -> Optional[str]:
    """Save individual detection event"""
    db = get_database()
    if db is None:
        return None
    
    document = {
        "source": source,
        "video_id": video_id,
        "timestamp": event_data.get("timestamp", datetime.utcnow().strftime("%H:%M:%S")),
        "class": event_data.get("class", "unknown"),
        "confidence": event_data.get("confidence", 0),
        "threat_score": event_data.get("threatScore", event_data.get("threat", 0)),
        "created_at": datetime.utcnow()
    }
    
    try:
        result = db.detection_events.insert_one(document)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving detection event: {e}")
        return None


def get_events_by_threat_level(min_threat: int = 70, limit: int = 50) -> List[Dict]:
    """Get high-threat events"""
    db = get_database()
    if db is None:
        return []
    
    try:
        results = list(db.detection_events
                      .find({"threat_score": {"$gte": min_threat}})
                      .sort("created_at", -1)
                      .limit(limit))
        return [_serialize_doc(r) for r in results]
    except Exception as e:
        print(f"Error fetching high-threat events: {e}")
        return []


# ==================== ALERT OPERATIONS ====================

def save_alert(
    events: List[Dict],
    video_url: str,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    status: str = "sent"
) -> Optional[str]:
    """Save alert record"""
    db = get_database()
    if db is None:
        return None
    
    document = {
        "events": events,
        "video_url": video_url,
        "email": email,
        "phone": phone,
        "event_count": len(events),
        "max_threat_score": max((e.get("threatScore", 0) for e in events), default=0),
        "status": status,
        "created_at": datetime.utcnow()
    }
    
    try:
        result = db.alerts.insert_one(document)
        print(f"✅ Alert saved: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving alert: {e}")
        return None


def get_recent_alerts(limit: int = 20) -> List[Dict]:
    """Get recent alerts"""
    db = get_database()
    if db is None:
        return []
    
    try:
        results = list(db.alerts.find()
                      .sort("created_at", -1)
                      .limit(limit))
        return [_serialize_doc(r) for r in results]
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return []


# ==================== ANALYTICS OPERATIONS ====================

def get_analytics_summary() -> Dict:
    """Get overall analytics summary"""
    db = get_database()
    if db is None:
        return {
            "total_analyses": 0,
            "total_events": 0,
            "high_threat_events": 0,
            "total_alerts": 0
        }
    
    try:
        total_analyses = db.video_analyses.count_documents({})
        total_events = db.detection_events.count_documents({})
        high_threat_events = db.detection_events.count_documents({"threat_score": {"$gte": 70}})
        total_alerts = db.alerts.count_documents({})
        
        return {
            "total_analyses": total_analyses,
            "total_events": total_events,
            "high_threat_events": high_threat_events,
            "total_alerts": total_alerts
        }
    except Exception as e:
        print(f"Error getting analytics: {e}")
        return {
            "total_analyses": 0,
            "total_events": 0,
            "high_threat_events": 0,
            "total_alerts": 0
        }


def get_threat_distribution() -> Dict:
    """Get threat level distribution"""
    db = get_database()
    if db is None:
        return {"high": 0, "medium": 0, "low": 0}
    
    try:
        high = db.detection_events.count_documents({"threat_score": {"$gte": 70}})
        medium = db.detection_events.count_documents({
            "threat_score": {"$gte": 40, "$lt": 70}
        })
        low = db.detection_events.count_documents({"threat_score": {"$lt": 40}})
        
        return {"high": high, "medium": medium, "low": low}
    except Exception as e:
        print(f"Error getting threat distribution: {e}")
        return {"high": 0, "medium": 0, "low": 0}
