import os
import logging
from datetime import datetime, timezone

logger = logging.getLogger("app.services.notification")

class NotificationService:
    @staticmethod
    def notify_event(tailor: dict, event_type: str, details: str = ""):
        """
        Notify a tailor about an event (profile view, click tracking, or lead submission)
        if notifications are enabled. Writes a simulated SMS/WhatsApp payload to a tracking log file.
        """
        # 1. Check if notifications are enabled
        if not tailor.get("notifications_enabled", True):
            logger.info(f"Notifications disabled for tailor {tailor.get('name')} (ID: {tailor.get('id')}). Skipping.")
            return

        channel = tailor.get("notification_channel", "whatsapp")
        tailor_name = tailor.get("name", "Tailor")
        tailor_contact = tailor.get("contact_number") or tailor.get("whatsapp_number") or "N/A"
        
        # 2. Format the message content based on event type
        timestamp = datetime.now(timezone.utc).isoformat()
        
        if event_type == "profile_view":
            message = f"StitchConnect Alert: Hello {tailor_name}! A customer just viewed your profile boutique. Keep your portfolio and services updated to get more leads!"
        elif event_type == "contact_click":
            message = f"StitchConnect Alert: Hello {tailor_name}! A customer just clicked to contact you via {details}!"
        elif event_type == "lead_submission":
            message = f"StitchConnect Alert: Hello {tailor_name}! New Lead Received! Customer requirement: '{details}'."
        else:
            message = f"StitchConnect Alert: Hello {tailor_name}! You have a new notification: {details}"

        # 3. Log to file
        log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "docs"))
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, "mock_notifications.log")
        
        log_entry = (
            f"[{timestamp}] "
            f"Tailor: {tailor_name} | "
            f"Recipient: {tailor_contact} | "
            f"Channel: {channel.upper()} | "
            f"Event: {event_type.upper()} | "
            f"Message: {message}\n"
        )
        
        try:
            with open(log_file_path, "a") as f:
                f.write(log_entry)
            logger.info(f"Simulated notification logged for tailor {tailor_name}")
        except Exception as e:
            logger.error(f"Failed to write mock notification log: {e}")
