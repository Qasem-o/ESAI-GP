"""
Email service for sending verification codes via Brevo SMTP.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from config import settings

# SMTP Configuration from central settings
SMTP_SERVER = settings.SMTP_SERVER or "smtp-relay.brevo.com"
SMTP_PORT = settings.SMTP_PORT or 587
SMTP_USER = settings.SMTP_USER
SMTP_PASS = settings.SMTP_PASS

# If FROM_EMAIL is missing from env, use the verified Brevo sender email
FROM_EMAIL = settings.FROM_EMAIL or "shareedh777.com@gmail.com"
FROM_NAME = settings.FROM_NAME or "EyeStocks AI"
LOGO_URL = settings.LOGO_URL

async def send_email(subject: str, recipient: str, html_content: str) -> bool:
    """Generic helper to send email via SMTP."""
    if not SMTP_USER or not SMTP_PASS:
        print(f"⚠️ SMTP credentials not configured. Email suppressed for {recipient}")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"[ERROR] Error sending email to {recipient}: {e}")
        return False

async def send_verification_email(email: str, code: str, username: str) -> bool:
    """Send verification code email via SMTP."""
    subject = "Verify your email address - EyeStocks AI"
    html_content = f"""
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
                <img src="{LOGO_URL}" alt="EyeStocks AI Logo" style="width: 80px; height: auto; margin-bottom: 15px; border-radius: 12px;">
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
    
    # Always print code to logs for fallback/debugging
    print(f"\n[EMAIL_LOG] Verification code for {email}: {code}\n")
    
    success = await send_email(subject, email, html_content)
    if success:
        print(f"[SUCCESS] Verification email sent to {email}")
    return success

async def send_welcome_email(email: str, username: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "Welcome to EyeStocks AI!"
    html_content = f"""
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
                <img src="{LOGO_URL}" alt="EyeStocks AI Logo" style="width: 80px; height: auto; margin-bottom: 15px; border-radius: 12px;">
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
    return await send_email(subject, email, html_content)
