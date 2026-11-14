import json
import csv
import os
import re
from pathlib import Path
from datetime import datetime

# Root data directory on user's PC: d:\AI project 2 gem\data\projects
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
PROJECTS_DIR = ROOT_DIR / "data" / "projects"
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

REGISTRY_FILE = PROJECTS_DIR / "projects_registry.json"
CSV_SUMMARY_FILE = PROJECTS_DIR / "projects_list.csv"

def sanitize_filename(text: str) -> str:
    """Creates a clean, safe filename from a title or ID."""
    clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', text.strip().lower())
    return clean[:50]

def load_all_projects() -> list:
    """Loads all submitted projects from the registry file."""
    if not REGISTRY_FILE.exists():
        return []
    try:
        with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading projects registry: {e}")
        return []

def save_project_submission(project_data: dict) -> dict:
    """
    Saves submitted project details to:
    1. data/projects/projects_registry.json (Full JSON catalog)
    2. data/projects/project_<id>.json (Individual project proposal file)
    3. data/projects/projects_list.csv (Excel-friendly summary table)
    """
    projects = load_all_projects()
    project_id = project_data.get("id") or f"proj_{int(datetime.now().timestamp())}"
    project_data["id"] = project_id
    project_data["saved_at"] = datetime.now().isoformat()

    # Prepend or update in registry
    existing_index = next((i for i, p in enumerate(projects) if p.get("id") == project_id), None)
    if existing_index is not None:
        projects[existing_index] = project_data
    else:
        projects.insert(0, project_data)

    # 1. Write full registry file
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)

    # 2. Write individual project JSON file
    filename = f"project_{sanitize_filename(project_id)}.json"
    individual_file = PROJECTS_DIR / filename
    with open(individual_file, "w", encoding="utf-8") as f:
        json.dump(project_data, f, indent=2)

    # 3. Append to CSV file for easy inspection in Excel
    csv_exists = CSV_SUMMARY_FILE.exists()
    fieldnames = [
        "id", "title", "domain", "feasibility_score", "risk_level",
        "team_size", "timeline", "budget", "skill_level", "saved_at"
    ]
    with open(CSV_SUMMARY_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        if not csv_exists:
            writer.writeheader()
        writer.writerow({
            "id": project_data.get("id"),
            "title": project_data.get("title"),
            "domain": project_data.get("domain"),
            "feasibility_score": project_data.get("feasibility_score") or project_data.get("feasibilityScore", 0),
            "risk_level": project_data.get("risk_level") or project_data.get("riskLevel", "Unassessed"),
            "team_size": project_data.get("team_size") or project_data.get("teamSize", ""),
            "timeline": project_data.get("timeline", ""),
            "budget": project_data.get("budget", ""),
            "skill_level": project_data.get("skill_level") or project_data.get("skillLevel", ""),
            "saved_at": project_data.get("saved_at")
        })

    print(f"Saved project proposal to PC folder: {individual_file}")
    return project_data

def get_project_by_id(project_id: str) -> dict:
    """Finds a project by ID from local PC storage."""
    projects = load_all_projects()
    target_id = str(project_id).strip()
    for p in projects:
        if str(p.get("id", "")).strip() == target_id:
            return p
            
    # Also check direct file if registry didn't find it
    filename = f"project_{sanitize_filename(target_id)}.json"
    file_path = PROJECTS_DIR / filename
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading project file {file_path}: {e}")
            
    return None
