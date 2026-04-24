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
LOGO_URL = settings.LOGO_URL or "https://gp-esai.netlify.app/logo.png"

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
    
    # Use standard strings and join to avoid f-string escaping issues with CSS
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f7f9; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
            .header {{ background-color: #6366f1; color: #ffffff; padding: 40px 20px; text-align: center; }}
            .content {{ padding: 40px 30px; }}
            .code-box {{ background-color: #f8fafc; border: 2px dashed #6366f1; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; }}
            .code {{ font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #6366f1; margin: 0; }}
            .footer {{ text-align: center; padding: 20px; color: #94a3b8; font-size: 13px; }}
            .logo {{ width: 80px; height: 80px; background: white; border-radius: 20px; padding: 5px; margin-bottom: 20px; }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="EyeStocks AI" class="logo" width="80" height="80">
                <h1 style="margin:0; font-size: 24px;">Security Verification</h1>
            </div>
            <div class="content">
                <h2 style="margin-top:0; color: #1e293b;">Hello, {username}!</h2>
                <p>Welcome to EyeStocks AI. Please use the following security code to verify your email address and complete your registration:</p>
                
                <div class="code-box">
                    <p class="code">{code}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px;"><strong>Note:</strong> This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="margin-bottom:0;">Best regards,<br><strong>The EyeStocks AI Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 EyeStocks AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    print(f"\n[EMAIL_LOG] Verification code for {email}: {code}\n")
    return await send_email(subject, email, html_content)

async def send_welcome_email(email: str, username: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "Welcome to EyeStocks AI!"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f7f9; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
            .header {{ background-color: #10b981; color: #ffffff; padding: 40px 20px; text-align: center; }}
            .content {{ padding: 40px 30px; }}
            .footer {{ text-align: center; padding: 20px; color: #94a3b8; font-size: 13px; }}
            .logo {{ width: 80px; height: 80px; background: white; border-radius: 20px; padding: 5px; margin-bottom: 20px; }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="EyeStocks AI" class="logo" width="80" height="80">
                <h1 style="margin:0; font-size: 24px;">Welcome Aboard!</h1>
            </div>
            <div class="content">
                <h2 style="margin-top:0; color: #1e293b;">Welcome, {username}!</h2>
                <p>Your email has been successfully verified. You now have full access to EyeStocks AI, the most advanced AI-powered stock prediction platform.</p>
                <p>We are excited to help you make smarter investment decisions.</p>
                
                <div style="margin-top: 30px;">
                    <a href="https://gp-esai.netlify.app" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started Now</a>
                </div>
                
                <p style="margin-top: 30px; margin-bottom:0;">Happy Trading,<br><strong>The EyeStocks AI Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 EyeStocks AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(subject, email, html_content)
