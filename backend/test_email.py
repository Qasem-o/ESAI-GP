import asyncio
from email_service import send_verification_email

async def test():
    success = await send_verification_email("shareedh777.com@gmail.com", "999999", "Test_User")
    print("Email sent success:", success)

if __name__ == "__main__":
    asyncio.run(test())
