"""
Resend email service for sending verification codes.
"""

import os
import resend
from typing import Optional

# Resend Configuration
# TODO: Move these to environment variables in production
RESEND_API_KEY = "re_fcjpKDft_842JykefdC59NsY534ftuzWh"  # Replace with your Resend API Key

# Initialize Resend client
try:
    resend.api_key = RESEND_API_KEY
except Exception as e:
    print(f"Warning: Could not initialize Resend client: {e}")


async def send_verification_email(email: str, code: str, username: str) -> bool:
    """
    Send verification code email via Resend.
    
    Args:
        email: Recipient email address
        code: 6-digit verification code
        username: User's username
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if "your-resend-api-key" in RESEND_API_KEY:
        print(f"Resend API Key not configured. Verification code for {email}: {code}")
        return False
    
    try:
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .code-box {{ background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                .code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Email Verification</h1>
                    <p>EyeStocks AI</p>
                </div>
                <div class="content">
                    <h2>Hello {username}!</h2>
                    <p>Thank you for signing up for EyeStocks AI. To complete your registration, please verify your email address using the code below:</p>
                    
                    <div class="code-box">
                        <div class="code">{code}</div>
                    </div>
                    
                    <p><strong>This code will expire in 10 minutes.</strong></p>
                    
                    <p>If you didn't create an account with EyeStocks AI, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>© 2025 EyeStocks AI. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": "EyeStocks AI <onboarding@resend.dev>",
            "to": [email],
            "subject": "Verify your email address",
            "html": email_html,
        }

        email_response = resend.Emails.send(params)
        print(f"📧 Email sent to {email} with code: {code} (ID: {email_response.get('id')})")
        return True
        
    except Exception as e:
        print(f"Error sending verification email: {e}")
        # Build reliability: print code to console as fallback during development
        print(f"FALLBACK: Verification code for {email}: {code}")
        return False


async def send_welcome_email(email: str, username: str) -> bool:
    """
    Send welcome email after successful verification.
    
    Args:
        email: Recipient email address
        username: User's username
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if "your-resend-api-key" in RESEND_API_KEY:
        print(f"Resend API Key not configured. Would send welcome email to {email}")
        return False
    
    try:
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to EyeStocks AI!</h1>
                </div>
                <div class="content">
                    <h2>Hello {username}!</h2>
                    <p>Your email has been successfully verified. Welcome to EyeStocks AI!</p>
                    <p>You can now access all features of our AI-powered stock prediction platform.</p>
                    <p>Happy trading!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": "EyeStocks AI <onboarding@resend.dev>",
            "to": [email],
            "subject": "Welcome to EyeStocks AI!",
            "html": email_html,
        }

        resend.Emails.send(params)
        print(f"📧 Welcome email sent to {email}")
        return True
        
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False
