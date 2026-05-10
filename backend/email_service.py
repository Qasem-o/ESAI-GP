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

async def send_email(subject: str, recipient: str, html_content: str) -> bool:
    """Sends email using the best available method based on the provided key."""
    if not BREVO_KEY:
        print(f"⚠️ No Email Key provided. Email suppressed for {recipient}")
        return False

    # Method 1: Brevo API (If key starts with xkeysib-)
    if BREVO_KEY.startswith("xkeysib-"):
        print(f"🚀 Using Brevo API for {recipient}...")
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

    # Method 2: SMTP (If key starts with xsmtpsib- or fallback)
    else:
        print(f"📧 Using SMTP for {recipient}...")
        if not SMTP_USER:
            print("⚠️ SMTP_USER is missing. Cannot use SMTP method.")
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
        success = await loop.run_in_executor(None, _send_sync)
        if success:
            print(f"✅ SMTP: Email sent to {recipient}")
        return success

async def send_verification_email(email: str, code: str, username: str) -> bool:
    """Send verification code email."""
    subject = "Verify your email address - EyeStocks AI"
    html_content = f"""
    <html>
    <body style="font-family: sans-serif; padding: 20px;">
        <h2>Hello, {username}!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #6366f1; letter-spacing: 5px;">{code}</h1>
        <p>This code expires in 10 minutes.</p>
    </body>
    </html>
    """
    return await send_email(subject, email, html_content)

async def send_welcome_email(email: str, username: str) -> bool:
    """Send welcome email."""
    subject = "Welcome to EyeStocks AI!"
    html_content = f"<html><body><h2>Welcome, {username}!</h2><p>Your account is verified.</p></body></html>"
    return await send_email(subject, email, html_content)

async def send_password_reset_email(email: str, code: str, username: str) -> bool:
    """Send password reset code."""
    subject = "Password Reset - EyeStocks AI"
    html_content = f"<html><body><h2>Reset Password</h2><p>Your code: <b>{code}</b></p></body></html>"
    return await send_email(subject, email, html_content)
