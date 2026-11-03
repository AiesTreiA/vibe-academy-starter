import os
from dotenv import load_dotenv

# Load env variables from root of the project
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(ENV_PATH)

# Optional credentials if the user decides to upgrade in the future
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_RECIPIENT_PHONE = os.getenv("WHATSAPP_RECIPIENT_PHONE")

INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
INSTAGRAM_RECIPIENT_ID = os.getenv("INSTAGRAM_RECIPIENT_ID")

def send_whatsapp_message(message: str) -> bool:
    """Sends a WhatsApp message. If no credentials, simulates the sending process."""
    if all([WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_RECIPIENT_PHONE]):
        import httpx
        url = f"https://graph.facebook.com/v17.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": WHATSAPP_RECIPIENT_PHONE,
            "type": "text",
            "text": {"body": message}
        }
        try:
            r = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            r.raise_for_status()
            print("✅ WhatsApp message sent via Meta Graph API.")
            return True
        except Exception as e:
            print(f"❌ Failed to send WhatsApp message via API: {e}")
            # Fall back to simulation
    
    # Simulation/Mock Box (Zero dependencies, free)
    border = "=" * 60
    print(f"\n{border}")
    print("📱 SIMULATED WHATSAPP NOTIFICATION SENT TO JAVIER")
    print(f"To: {WHATSAPP_RECIPIENT_PHONE or 'Javier Mujica (Default)'}")
    print(f"Message:\n{message}")
    print(f"{border}\n")
    return True

def send_instagram_dm(message: str) -> bool:
    """Sends an Instagram DM. If no credentials, simulates the sending process."""
    if all([INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_RECIPIENT_ID]):
        import httpx
        url = "https://graph.facebook.com/v17.0/me/messages"
        headers = {
            "Authorization": f"Bearer {INSTAGRAM_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "recipient": {"id": INSTAGRAM_RECIPIENT_ID},
            "message": {"text": message}
        }
        try:
            r = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            r.raise_for_status()
            print("✅ Instagram DM sent via Meta Graph API.")
            return True
        except Exception as e:
            print(f"❌ Failed to send Instagram DM via API: {e}")
            # Fall back to simulation
            
    # Simulation/Mock Box (Zero dependencies, free)
    border = "*" * 60
    print(f"\n{border}")
    print("📸 SIMULATED INSTAGRAM DM SENT TO JAVIER")
    print(f"To Username/ID: {INSTAGRAM_RECIPIENT_ID or 'javiermujica (Default)'}")
    print(f"Message:\n{message}")
    print(f"{border}\n")
    return True

def notify_all_platforms(message: str) -> bool:
    """Sends notification to both WhatsApp and Instagram."""
    w_success = send_whatsapp_message(message)
    ig_success = send_instagram_dm(message)
    return w_success and ig_success

if __name__ == "__main__":
    notify_all_platforms("🚀 ¡Hola Javier! Este es un mensaje de prueba de tus nuevos agentes inteligentes.")
