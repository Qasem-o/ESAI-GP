"""
Email service for sending verification codes via Brevo SMTP.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
from typing import Optional
from config import settings

# SMTP Configuration from central settings
SMTP_SERVER = settings.SMTP_SERVER or "smtp-relay.brevo.com"
SMTP_PORT = settings.SMTP_PORT or 587
SMTP_USER = settings.SMTP_USER
SMTP_PASS = settings.SMTP_PASS

# If FROM_EMAIL is missing from env, use a generic placeholder
FROM_EMAIL = settings.FROM_EMAIL or "no-reply@example.com"
FROM_NAME = settings.FROM_NAME or "EyeStocks AI"
LOGO_URL = settings.LOGO_URL or "https://example.com/logo.png"

async def send_email(subject: str, recipient: str, html_content: str) -> bool:
    """Generic helper to send email via SMTP (Runs in a separate thread to prevent blocking)."""
    if not SMTP_USER or not SMTP_PASS:
        print(f"⚠️ SMTP credentials not configured. Email suppressed for {recipient}")
        return False

    def _send_sync():
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
            msg['To'] = recipient
            msg['Subject'] = subject
            msg.attach(MIMEText(html_content, 'html'))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"[ERROR] SMTP Error sending email to {recipient}: {e}")
            return False

    # Run the synchronous SMTP code in a thread pool to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _send_sync)

async def send_verification_email(email: str, code: str, username: str) -> bool:
    """Send verification code email via SMTP."""
    subject = "Verify your email address - EyeStocks AI"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #ffffff; color: #1e293b; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }}
            .content {{ padding: 40px 30px; }}
            .code-box {{ background-color: #f8fafc; border: 2px dashed #6366f1; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; }}
            .code {{ font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #6366f1; margin: 0; }}
            .footer {{ text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; background-color: #fcfdfe; }}
            .logo {{ width: 80px; height: auto; margin-bottom: 20px; }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="EyeStocks AI" class="logo">
                <h1 style="margin:0; font-size: 24px; color: #1e293b;">Login Verification</h1>
            </div>
            <div class="content">
                <h2 style="margin-top:0; color: #1e293b;">Hello, {username}!</h2>
                <p>To keep your account secure, please use the following verification code to complete your signup process:</p>
                
                <div class="code-box">
                    <p class="code">{code}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes for your security.</p>
                
                <div style="margin-top: 30px;">
                    <p style="margin-bottom:0;">Thanks,<br><strong>EyeStocks AI Team</strong></p>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 EyeStocks AI. All rights reserved.<br>Made with AI for smarter trading.</p>
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
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #ffffff; color: #1e293b; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }}
            .content {{ padding: 40px 30px; }}
            .footer {{ text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; background-color: #fcfdfe; }}
            .logo {{ width: 80px; height: auto; margin-bottom: 20px; }}
            .btn {{ background-color: #6366f1; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2); }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="EyeStocks AI" class="logo">
                <h1 style="margin:0; font-size: 24px; color: #1e293b;">Welcome to the Future</h1>
            </div>
            <div class="content">
                <h2 style="margin-top:0; color: #1e293b;">Welcome to the family, {username}!</h2>
                <p>We are thrilled to have you with us. Your account is now fully verified and ready to explore the markets with AI insights.</p>
                <p>EyeStocks AI is here to help you navigate stock predictions with clarity and precision.</p>
                
                <div style="margin-top: 35px; text-align: center;">
                    <a href="https://gp-esai.netlify.app" class="btn">Launch Platform</a>
                </div>
                
                <p style="margin-top: 35px; margin-bottom:0;">See you on the dashboard,<br><strong>EyeStocks AI Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 EyeStocks AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(subject, email, html_content)

async def send_password_reset_email(email: str, code: str, username: str) -> bool:
    """Send password reset code via SMTP."""
    subject = "Password Reset - EyeStocks AI"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #ffffff; color: #1e293b; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }}
            .content {{ padding: 40px 30px; }}
            .code-box {{ background-color: #f8fafc; border: 2px dashed #6366f1; padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; }}
            .code {{ font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #6366f1; margin: 0; }}
            .footer {{ text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; background-color: #fcfdfe; }}
            .logo {{ width: 80px; height: auto; margin-bottom: 20px; }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="EyeStocks AI" class="logo">
                <h1 style="margin:0; font-size: 24px; color: #1e293b;">Password Reset</h1>
            </div>
            <div class="content">
                <h2 style="margin-top:0; color: #1e293b;">Hello, {username}!</h2>
                <p>We received a request to reset your password. Please use the following code to reset your password:</p>
                
                <div class="code-box">
                    <p class="code">{code}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
                
                <div style="margin-top: 30px;">
                    <p style="margin-bottom:0;">Thanks,<br><strong>EyeStocks AI Team</strong></p>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 EyeStocks AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    print(f"\n[EMAIL_LOG] Password reset code for {email}: {code}\n")
    return await send_email(subject, email, html_content)
