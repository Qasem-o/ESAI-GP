"""
Hybrid Email service for EyeStocks AI.
Supports both Brevo API (xkeysib-) and Brevo SMTP (xsmtpsib-).
"""

import httpx
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from config import settings

# Configuration
BREVO_KEY = (settings.SMTP_PASS or "").strip()
SMTP_USER = (settings.SMTP_USER or "").strip()
SMTP_SERVER = "smtp-relay.brevo.com"
SMTP_PORT = 587

FROM_EMAIL = settings.FROM_EMAIL or "no-reply@esai-sa.me"
FROM_NAME = settings.FROM_NAME or "EyeStocks AI"

# Common UI Tokens
PRIMARY_COLOR = "#6366f1"
BG_COLOR = "#f8fafc"
TEXT_COLOR = "#1e293b"

async def send_email(subject: str, recipient: str, html_content: str) -> bool:
    """Sends email using the best available method based on the provided key."""
    if not BREVO_KEY:
        print(f"⚠️ No Email Key provided. Email suppressed for {recipient}")
        return False

    # Method 1: Brevo API (If key starts with xkeysib-)
    if BREVO_KEY.startswith("xkeysib-"):
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": BREVO_KEY,
            "x-sib-api-key": BREVO_KEY
        }
        payload = {
            "sender": {"name": FROM_NAME, "email": FROM_EMAIL},
            "to": [{"email": recipient}],
            "subject": subject,
            "htmlContent": html_content
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post("https://api.brevo.com/v3/smtp/email", headers=headers, json=payload)
                if response.status_code in [200, 201, 202]:
                    print(f"✅ API: Email sent to {recipient}")
                    return True
                print(f"❌ API Error ({response.status_code}): {response.text}")
                return False
        except Exception as e:
            print(f"❌ API Exception: {e}")
            return False

    # Method 2: SMTP Fallback
    else:
        if not SMTP_USER:
            print("⚠️ SMTP_USER is missing for SMTP method.")
            return False

        def _send_sync():
            try:
                msg = MIMEMultipart()
                msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
                msg['To'] = recipient
                msg['Subject'] = subject
                msg.attach(MIMEText(html_content, 'html'))

                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as server:
                    server.starttls()
                    server.login(SMTP_USER, BREVO_KEY)
                    server.send_message(msg)
                return True
            except Exception as e:
                print(f"❌ SMTP Error: {e}")
                return False

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _send_sync)

def get_base_template(content_html: str) -> str:
    """Wraps content in a premium responsive template."""
    return f"""
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            .email-body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: {TEXT_COLOR}; background-color: {BG_COLOR}; padding: 40px 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
            .header {{ background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9; }}
            .content {{ padding: 50px 40px; }}
            .footer {{ text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; background-color: #fcfdfe; }}
            .btn {{ background-color: {PRIMARY_COLOR}; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; margin: 30px 0; }}
            .code-display {{ background: #f8fafc; border: 2px dashed {PRIMARY_COLOR}; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }}
            .code-text {{ font-size: 42px; font-weight: 800; color: {PRIMARY_COLOR}; letter-spacing: 12px; margin: 0; font-family: monospace; }}
        </style>
    </head>
    <body class="email-body">
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 26px; color: #1e293b; font-weight: 800;">EyeStocks AI</h1>
                <p style="margin:5px 0 0 0; color: #64748b; font-size: 14px;">Next-Gen Market Insights</p>
            </div>
            <div class="content">
                {content_html}
            </div>
            <div class="footer">
                <p>© 2025 EyeStocks AI. All rights reserved.<br>Empowering traders with artificial intelligence.</p>
            </div>
        </div>
    </body>
    </html>
    """

async def send_verification_email(email: str, code: str, username: str) -> bool:
    """Send verification code email."""
    subject = f"Verify your EyeStocks AI Account"
    content = f"""
        <h2 style="margin-top:0;">Hello, {username}!</h2>
        <p>Welcome to the future of trading. Please use the verification code below to complete your registration:</p>
        <div class="code-display">
            <p class="code-text">{code}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you didn't request this, you can ignore this email.</p>
        <p style="margin-top: 40px;">Best regards,<br><strong>EyeStocks AI Team</strong></p>
    """
    return await send_email(subject, email, get_base_template(content))

async def send_welcome_email(email: str, username: str) -> bool:
    """Send welcome email."""
    subject = "Welcome to EyeStocks AI family!"
    content = f"""
        <h2 style="margin-top:0;">Welcome aboard, {username}!</h2>
        <p>Your account is now fully verified. You're ready to explore AI-driven stock predictions and market insights.</p>
        <div style="text-align: center;">
            <a href="https://gp-esai.netlify.app" class="btn">Launch Dashboard</a>
        </div>
        <p>We're excited to see what you achieve with our platform.</p>
        <p style="margin-top: 40px;">Happy Trading,<br><strong>EyeStocks AI Team</strong></p>
    """
    return await send_email(subject, email, get_base_template(content))

async def send_password_reset_email(email: str, code: str, username: str) -> bool:
    """Send password reset code."""
    subject = "Password Reset Request - EyeStocks AI"
    content = f"""
        <h2 style="margin-top:0;">Reset your password</h2>
        <p>Hi {username}, we received a request to reset your password. Use the code below to proceed:</p>
        <div class="code-display">
            <p class="code-text">{code}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not make this request, please secure your account.</p>
        <p style="margin-top: 40px;">Thanks,<br><strong>EyeStocks AI Team</strong></p>
    """
    return await send_email(subject, email, get_base_template(content))
