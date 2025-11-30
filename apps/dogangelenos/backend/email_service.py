from typing import Dict
import os

# Email service for booking confirmations
class EmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "woof@dogangelenos.com")
    
    def send_booking_confirmation(self, booking: Dict):
        """Send booking confirmation email"""
        # In production, integrate with SendGrid or similar
        print(f"📧 Sending confirmation email to {booking['email']}")
        print(f"   Booking: {booking['program']} on {booking['preferred_date']}")
        print(f"   Location: {booking['location']}")
        
        # Mock email content
        email_content = f"""
        Dear {booking['owner_name']},
        
        Thank you for booking with Dog Angelenos!
        
        Booking Details:
        - Dog: {booking['dog_name']}
        - Program: {booking['program']}
        - Date: {booking['preferred_date']}
        - Time: {booking['preferred_time']}
        - Location: {booking['location']}
        
        We'll contact you at {booking['phone']} to confirm your appointment.
        
        Best regards,
        Dog Angelenos Team
        """
        
        return {"success": True, "message": "Email sent"}
    
    def send_reminder(self, booking: Dict):
        """Send appointment reminder"""
        print(f"📧 Sending reminder to {booking['email']}")
        return {"success": True, "message": "Reminder sent"}

email_service = EmailService()
