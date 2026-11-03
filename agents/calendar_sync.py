import os
import httpx
from dotenv import load_dotenv

# Load env variables from root of the project
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(ENV_PATH)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")
GOOGLE_CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")

def get_access_token():
    """Refreshes and returns the Google OAuth2 access token."""
    if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN]):
        print("⚠️ Google Calendar credentials are not configured in environment variables.")
        return None
        
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": GOOGLE_REFRESH_TOKEN,
        "grant_type": "refresh_token",
    }
    try:
        response = httpx.post(url, data=payload, timeout=10.0)
        if response.status_code != 200:
            print(f"Response status: {response.status_code}, body: {response.text}")
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"❌ Failed to refresh Google Calendar OAuth token: {e}")
        return None

def create_calendar_event(title, event_type, date_str, deadline_str, description=None):
    """Creates an event on the user's Google Calendar."""
    access_token = get_access_token()
    if not access_token:
        print("⚠️ Skipping Google Calendar event creation due to missing or invalid credentials.")
        return None
        
    # We will create a full day event on the event_date
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    desc_lines = [
        f"Tipo de Evento: {event_type.capitalize()}",
        f"Fecha del Evento: {date_str}",
        f"Fecha Límite (Deadline): {deadline_str}"
    ]
    if description:
        desc_lines.append(f"\nDetalles: {description}")
    
    desc_lines.append("\n---\nCreado por tu Growth Partner AI 🚀")
    
    event_body = {
        "summary": f"[GrowthPartner] {title}",
        "description": "\n".join(desc_lines),
        "start": {
            "date": date_str
        },
        "end": {
            "date": date_str  # Full day event ends on the same date (or next day, but Google Calendar handles same-day full-day events as single days)
        },
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 1440}, # 1 day before
                {"method": "popup", "minutes": 2880}  # 2 days before
            ]
        }
    }
    
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events"
    try:
        response = httpx.post(url, headers=headers, json=event_body, timeout=10.0)
        response.raise_for_status()
        event_data = response.json()
        print(f"✅ Google Calendar event created: {event_data.get('htmlLink')}")
        return event_data.get("id")
    except Exception as e:
        print(f"❌ Failed to create Google Calendar event: {e}")
        if 'response' in locals():
            print(f"Response content: {response.text}")
        return None

if __name__ == "__main__":
    # Test refresh token
    token = get_access_token()
    if token:
        print("✅ OAuth token refresh verified successfully!")
    else:
        print("❌ Token refresh failed.")
