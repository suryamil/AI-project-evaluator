import json
import csv
import os
import re
from pathlib import Path
from datetime import datetime

# Root data directory on user's PC: d:\AI project 2 gem\data\users
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
USERS_DIR = ROOT_DIR / "data" / "users"
USERS_DIR.mkdir(parents=True, exist_ok=True)

REGISTRY_FILE = USERS_DIR / "users_registry.json"
LOGIN_LOG_FILE = USERS_DIR / "login_history.json"
CSV_SUMMARY_FILE = USERS_DIR / "users_list.csv"

def sanitize_filename(text: str) -> str:
    """Creates a clean, safe filename from an email or name."""
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', text.strip().lower())

def load_all_users() -> list:
    """Loads all registered users from the registry file."""
    if not REGISTRY_FILE.exists():
        return []
    try:
        with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading users registry: {e}")
        return []

def get_user_by_email(email: str) -> dict:
    """Finds a user by email from local storage."""
    users = load_all_users()
    target_email = email.strip().lower()
    for u in users:
        if u.get("email", "").strip().lower() == target_email:
            return u
    return None

def save_user(user_data: dict) -> dict:
    """
    Saves user details to:
    1. data/users/users_registry.json (Full JSON catalog)
    2. data/users/user_<email>.json (Individual user profile file)
    3. data/users/users_list.csv (Excel-friendly summary table)
    """
    users = load_all_users()
    target_email = user_data["email"].strip().lower()

    # Prepare user profile
    now_iso = datetime.utcnow().isoformat() + "Z"
    now_readable = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    profile = {
        "id": user_data.get("id") or f"usr_{int(datetime.utcnow().timestamp())}",
        "full_name": user_data["full_name"],
        "email": target_email,
        "university": user_data.get("university") or "College / University Student",
        "role": user_data.get("role", "student"),
        "password_hash": user_data.get("password_hash"),
        "salt": user_data.get("salt"),
        "registered_at": user_data.get("created_at") or now_readable,
        "last_login_at": now_readable
    }

    # Update or add to registry
    found = False
    for i, u in enumerate(users):
        if u.get("email", "").strip().lower() == target_email:
            users[i] = profile
            found = True
            break
    if not found:
        users.append(profile)

    # 1. Save registry file
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

    # 2. Save individual user JSON file for easy browsing
    safe_name = sanitize_filename(target_email)
    individual_file = USERS_DIR / f"user_{safe_name}.json"
    with open(individual_file, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, ensure_ascii=False)

    # 3. Save CSV summary for opening in Excel / Notepad
    update_csv_summary(users)

    print(f"Saved user details to PC folder: {individual_file}")
    return profile

def update_csv_summary(users: list):
    """Generates an Excel-friendly CSV with safe user metadata."""
    headers = ["ID", "Full Name", "Email", "University", "Role", "Registered At", "Last Login"]
    try:
        with open(CSV_SUMMARY_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            for u in users:
                writer.writerow([
                    u.get("id", ""),
                    u.get("full_name", ""),
                    u.get("email", ""),
                    u.get("university", ""),
                    u.get("role", "student"),
                    u.get("registered_at", ""),
                    u.get("last_login_at", "")
                ])
    except Exception as e:
        print(f"Failed to write CSV summary: {e}")

def record_login_activity(email: str, full_name: str, status: str = "SUCCESS", reason: str = ""):
    """
    Logs login activity with timestamps into data/users/login_history.json.
    """
    history = []
    if LOGIN_LOG_FILE.exists():
        try:
            with open(LOGIN_LOG_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "email": email.strip().lower(),
        "full_name": full_name or "",
        "status": status,
        "reason": reason
    }

    history.insert(0, log_entry)  # Latest first
    # Keep last 500 entries
    history = history[:500]

    with open(LOGIN_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

    # Also update last_login_at in the user's profile if user exists
    user = get_user_by_email(email)
    if user and status == "SUCCESS":
        user["last_login_at"] = log_entry["timestamp"]
        save_user(user)
