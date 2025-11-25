"""Mentor application endpoints"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.utils.email import send_email
import os

router = APIRouter()


class MentorApplication(BaseModel):
    full_name: str
    email: EmailStr
    linkedin: str
    experience_years: str
    expertise: str
    company: str
    why_mentor: str


@router.post("/apply")
async def submit_mentor_application(application: MentorApplication):
    """Submit a mentor application"""
    try:
        # Send notification email to admin
        admin_email = "sahriyarm@gmail.com"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .field {{ background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #6b7280; font-size: 14px; margin-bottom: 5px; }}
                .value {{ color: #111827; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 New Mentor Application</h1>
                </div>
                <div class="content">
                    <p>A new mentor application has been submitted:</p>
                    
                    <div class="field">
                        <div class="label">Full Name</div>
                        <div class="value">{application.full_name}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Email</div>
                        <div class="value"><a href="mailto:{application.email}">{application.email}</a></div>
                    </div>
                    
                    <div class="field">
                        <div class="label">LinkedIn Profile</div>
                        <div class="value"><a href="{application.linkedin}" target="_blank">{application.linkedin}</a></div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Years of Experience</div>
                        <div class="value">{application.experience_years} years</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Current/Recent Company</div>
                        <div class="value">{application.company}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Areas of Expertise</div>
                        <div class="value">{application.expertise}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Why They Want to Mentor</div>
                        <div class="value">{application.why_mentor}</div>
                    </div>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                        This application was submitted through MentorMap.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email to admin
        send_email(
            admin_email,
            f"New Mentor Application - {application.full_name}",
            html_content
        )
        
        # Send confirmation email to applicant
        applicant_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Application Received!</h1>
                </div>
                <div class="content">
                    <p>Hi {application.full_name},</p>
                    
                    <p>Thank you for applying to become a mentor on MentorMap! We've received your application and are excited to review it.</p>
                    
                    <p><strong>What's Next?</strong></p>
                    <ul>
                        <li>Our team will review your application within 2-3 business days</li>
                        <li>If selected, we'll reach out to schedule an interview</li>
                        <li>After the interview, we'll help you set up your mentor profile</li>
                    </ul>
                    
                    <p>We appreciate your interest in helping others succeed!</p>
                    
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        The MentorMap Team
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        send_email(
            application.email,
            "Your MentorMap Application - Received",
            applicant_html
        )
        
        return {
            "message": "Application submitted successfully",
            "status": "success"
        }
        
    except Exception as e:
        print(f"Error processing mentor application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit application")
