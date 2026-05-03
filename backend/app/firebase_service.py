"""
Firebase Cloud Messaging Service for Incident Notifications
Simple push notification service for admin alerting.
"""

import firebase_admin
from firebase_admin import credentials, messaging
from pathlib import Path
import os
import logging

logger = logging.getLogger(__name__)


class FirebaseService:
    """Simple Firebase messaging service for FCM push notifications."""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not FirebaseService._initialized:
            self.init_firebase()
            FirebaseService._initialized = True
    
    @staticmethod
    def init_firebase():
        """Initialize Firebase Admin SDK."""
        try:
            creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
            print(f"DEBUG: Initializing Firebase with path: '{creds_path}'")
            
            if not creds_path or not Path(creds_path).exists():
                print(f"DEBUG: File does NOT exist at {Path(creds_path).absolute()}")
                logger.warning(f"Firebase credentials not found at {creds_path}. Push notifications disabled.")
                return False
            
            # Initialize Firebase
            if not firebase_admin._apps:
                cred = credentials.Certificate(creds_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized successfully")
                return True
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            return False
    
    @staticmethod
    def send_incident_notification(fcm_token: str, incident_id: str, description: str, severity: str) -> bool:
        """
        Send a push notification about a new incident to admin.
        
        Args:
            fcm_token: Admin's FCM device token
            incident_id: Incident ID
            description: Incident description
            severity: Incident severity level
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            if not firebase_admin._apps:
                logger.warning("Firebase not initialized")
                return False
            
            # Color code by severity
            severity_emoji = {
                "Critical": "🔴",
                "High": "🟠",
                "Medium": "🟡",
                "Low": "🔵"
            }
            emoji = severity_emoji.get(severity, "⚠️")
            
            message = messaging.Message(
                notification=messaging.Notification(
                    title=f"{emoji} New Incident: INC-{incident_id}",
                    body=description[:150]  # Truncate to 150 chars
                ),
                data={
                    "incident_id": str(incident_id),
                    "severity": severity,
                    "type": "new_incident"
                },
                token=fcm_token
            )
            
            response = messaging.send(message)
            logger.info(f"FCM notification sent: {response}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send FCM notification: {e}")
            return False
    
    @staticmethod
    def send_batch_notifications(fcm_tokens: list[str], incident_id: str, description: str, severity: str, title: str = None, correlation: str = None) -> dict:
        """
        Send push notification to multiple admins.
        """
        if not fcm_tokens:
            return {"sent": 0, "failed": 0}
        
        try:
            if not firebase_admin._apps:
                logger.warning("Firebase not initialized")
                return {"sent": 0, "failed": len(fcm_tokens)}
            
            severity_emoji = {
                "Critical": "🔴",
                "High": "🟠",
                "Medium": "🟡",
                "Low": "🔵"
            }
            emoji = severity_emoji.get(severity, "⚠️")
            
            # Use provided title or fallback
            display_title = title if title else f"{emoji} New Incident: INC-{incident_id}"
            if title and not title.startswith(emoji) and emoji != "⚠️":
                display_title = f"{emoji} {title}"

            messages = [
                messaging.Message(
                    notification=messaging.Notification(
                        title=display_title,
                        body=description[:150]
                    ),
                    data={
                        "incident_id": str(incident_id),
                        "severity": severity,
                        "correlation": correlation if correlation else "",
                        "type": "correlation_alert" if correlation else "new_incident"
                    },
                    token=token
                )
                for token in fcm_tokens
            ]
            
            response = messaging.send_each(messages)
            logger.info(f"Batch FCM notifications sent: {response.success_count} sent, {response.failure_count} failed")
            return {"sent": response.success_count, "failed": response.failure_count}
            
        except Exception as e:
            logger.error(f"Failed to send batch FCM notifications: {e}")
            return {"sent": 0, "failed": len(fcm_tokens)}


# Singleton instance
firebase_service = FirebaseService()
