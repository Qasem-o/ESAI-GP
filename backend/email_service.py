"""
Email service for sending verification codes via Brevo API.
"""

import httpx
from typing import Optional
from config import settings

# Brevo API Configuration
# Use .strip() to ensure no hidden spaces or newlines from .env are included
BREVO_API_KEY = settings.SMTP_PASS.strip() if settings.SMTP_PASS else None
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

FROM_EMAIL = settings.FROM_EMAIL or "no-reply@esai-sa.me"
FROM_NAME = settings.FROM_NAME or "EyeStocks AI"
LOGO_URL = settings.LOGO_URL or "https://gp-esai.netlify.app/logo.png"

async def send_email(subject: str, recipient: str, html_content: str) -> bool:
    """Generic helper to send email via Brevo API."""
    if not BREVO_API_KEY:
        print(f"⚠️ Brevo API Key (SMTP_PASS) not configured. Email suppressed for {recipient}")
        return False
    
    # Log masked key for debugging
    masked_key = f"{BREVO_API_KEY[:5]}...{BREVO_API_KEY[-5:]}" if len(BREVO_API_KEY) > 10 else "TOO_SHORT"
    print(f"🔍 [DEBUG] Using Brevo API Key: {masked_key} (Length: {len(BREVO_API_KEY)})")

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
        "x-sib-api-key": BREVO_API_KEY
    }

    payload = {
        "sender": {"name": FROM_NAME, "email": FROM_EMAIL},
        "to": [{"email": recipient}],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(BREVO_API_URL, headers=headers, json=payload)
            
            if response.status_code in [200, 201, 202]:
                print(f"✅ Email sent successfully to {recipient}")
                return True
            else:
                print(f"❌ [BREVO API ERROR] Failed to send email to {recipient}")
                print(f"❌ [STATUS]: {response.status_code}")
                print(f"❌ [RESPONSE]: {response.text}")
                return False
    except Exception as e:
        print(f"❌ [SYSTEM ERROR] Exception during email sending to {recipient}: {str(e)}")
        return False

async def send_verification_email(email: str, code: str, username: str) -> bool:
    """Send verification code email via Brevo API."""
    subject = "Verify your email address - EyeStocks AI"
    
    html_content = f"""
    <!DOCTYPE html>
    <html dir="ltr">
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
    
    print(f"\n[EMAIL_LOG] Sending verification code to {email}...\n")
    return await send_email(subject, email, html_content)

async def send_welcome_email(email: str, username: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "Welcome to EyeStocks AI!"
    html_content = f"""
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
        <meta charset="UTF-8">
        <style>
            .email-body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }}
            .header {{ background-color: #ffffff; color: #1e293b; padding: 40px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }}
            .content {{ padding: 40px 30px; }}
            .footer {{ text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; background-color: #fcfdfe; }}
            .btn {{ background-color: #6366f1; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2); }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
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
    """Send password reset code via Brevo API."""
    subject = "Password Reset - EyeStocks AI"
    
    html_content = f"""
    <!DOCTYPE html>
    <html dir="ltr">
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
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
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
    
    print(f"\n[EMAIL_LOG] Sending password reset code to {email}...\n")
    return await send_email(subject, email, html_content)
