import os
import joblib
import pandas as pd
from typing import Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Prevent byte-code writing that triggers file watcher reloads
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"

app = FastAPI(
    title="Hospital Recommendation API",
    description="ML-based hospital recommendation system",
    version="1.0.0"
)

# Enable CORS for browser frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset and ML model
hospitals = pd.read_csv("hospital_recommendation.csv")
model = joblib.load("hospital_recommendation_model.pkl")

# CRITICAL FIX for Windows + Uvicorn:
# RandomForest with n_jobs=-1 uses multiprocessing/loky which causes Uvicorn to shut down/crash on Windows.
# Setting n_jobs=1 executes synchronously in <5ms without spawning child processes.
if hasattr(model, "named_steps") and "model" in model.named_steps:
    model.named_steps["model"].n_jobs = 1
elif hasattr(model, "n_jobs"):
    model.n_jobs = 1


class PatientData(BaseModel):
    required_department: str = Field(
        ...,
        description="Required medical department (e.g., Cardiology, Neurology)"
    )
    patient_age: int = Field(
        ...,
        ge=0,
        le=120,
        description="Patient age in years (0-120)"
    )
    patient_gender: Literal["Male", "Female", "Other"] = Field(
        ...,
        description="Gender of the patient"
    )
    emergency_required: Literal["Yes", "No"] = Field(
        ...,
        description="Whether emergency treatment is required"
    )
    city: str = Field(
        ...,
        description="Patient city / location in Maharashtra"
    )
    hospital_type: str = Field(
        default="All",
        description="Preferred hospital type (All, Government, Private, Trust)"
    )
    insurance_supported: Literal["Yes", "No"] = Field(
        ...,
        description="Whether patient requires insurance / cashless support"
    )


@app.get("/")
def home():
    return {
        "message": "Hospital Recommendation API is running",
        "total_hospitals": len(hospitals),
        "total_cities": hospitals["city"].nunique(),
        "total_departments": hospitals["required_department"].nunique()
    }


@app.get("/cities")
def get_cities():
    cities = sorted(hospitals["city"].dropna().unique().tolist())
    return {"cities": cities}


@app.get("/departments")
def get_departments():
    departments = sorted(hospitals["required_department"].dropna().unique().tolist())
    return {"departments": departments}


@app.get("/hospital-types")
def get_hospital_types():
    types = sorted(hospitals["hospital_type"].dropna().unique().tolist())
    return {"hospital_types": types}


@app.get("/hospitals")
def get_hospitals(city: str = None, department: str = None, hospital_type: str = None):
    data = hospitals.copy()
    if city:
        data = data[data["city"].str.lower() == city.lower()]
    if department:
        data = data[data["required_department"].str.lower() == department.lower()]
    if hospital_type and hospital_type.lower() not in ["all", "any"]:
        data = data[data["hospital_type"].str.contains(hospital_type, case=False, na=False)]

    cols = [
        "hospital_name",
        "hospital_type",
        "hospital_category",
        "hospital_bed_capacity",
        "required_department",
        "hospital_rating",
        "treatment_success_rate_pct",
        "doctor_availability_pct",
        "bed_availability_pct",
        "estimated_wait_time_min",
        "estimated_treatment_cost_inr",
        "insurance_supported",
        "emergency_services_available",
        "patient_satisfaction_score",
        "city",
        "district",
        "state"
    ]
    return data[cols].to_dict(orient="records")


# Medical specialty compatibility mapping to avoid recommending specialized mismatch hospitals
INCOMPATIBLE_CATEGORIES = {
    "Cardiology": ["Dental", "Mental Health", "Ayurvedic"],
    "Neurology": ["Dental", "Women & Children", "Ayurvedic"],
    "Orthopedics": ["Dental", "Mental Health"],
    "Oncology": ["Dental", "Mental Health", "Ayurvedic"],
    "Pediatrics": ["Mental Health", "Dental"],
    "Gynecology": ["Dental", "Mental Health"],
    "General Surgery": ["Dental", "Mental Health", "Ayurvedic"],
    "Gastroenterology": ["Dental", "Mental Health"],
    "Pulmonology": ["Dental", "Mental Health"],
    "Emergency Medicine": ["Dental", "Mental Health"],
    "Nephrology": ["Dental", "Mental Health"],
    "ENT": ["Mental Health"],
    "Ophthalmology": ["Mental Health"],
    "Dermatology": ["Mental Health"]
}


@app.post("/recommend")
def recommend_hospitals(patient: PatientData):
    dept = patient.required_department
    age = patient.patient_age
    gender = patient.patient_gender
    emergency = patient.emergency_required
    city = patient.city
    insurance = patient.insurance_supported
    h_type = patient.hospital_type

    # Step 1: Initial filter by department and city
    candidates = hospitals[
        (hospitals["required_department"].str.lower() == dept.lower()) &
        (hospitals["city"].str.lower() == city.lower())
    ].copy()

    # Step 2: Filter out clinically incompatible hospital categories (e.g., Dental or Mental Health for Cardiology)
    blocked_categories = INCOMPATIBLE_CATEGORIES.get(dept, [])
    if blocked_categories and not candidates.empty:
        valid_candidates = candidates[~candidates["hospital_category"].isin(blocked_categories)]
        if not valid_candidates.empty:
            candidates = valid_candidates

    # Step 3: Apply hospital_type filter (Government / Private / Trust) if requested
    if h_type and h_type.lower() not in ["all", "any", ""]:
        type_matches = candidates[
            candidates["hospital_type"].str.contains(h_type, case=False, na=False)
        ].copy()
        if not type_matches.empty:
            candidates = type_matches

    # Fallback Cascade if no exact candidates found
    if candidates.empty:
        # Fallback to city and hospital type (excluding blocked categories)
        candidates = hospitals[hospitals["city"].str.lower() == city.lower()].copy()
        if blocked_categories:
            valid_fallback = candidates[~candidates["hospital_category"].isin(blocked_categories)]
            if not valid_fallback.empty:
                candidates = valid_fallback

        if h_type and h_type.lower() not in ["all", "any", ""]:
            type_matches = candidates[candidates["hospital_type"].str.contains(h_type, case=False, na=False)]
            if not type_matches.empty:
                candidates = type_matches

    if candidates.empty:
        candidates = hospitals[hospitals["required_department"].str.lower() == dept.lower()].copy()

    if candidates.empty:
        candidates = hospitals.copy()

    # Step 4: Pass patient inputs directly into candidate records for the ML model
    candidates["patient_age"] = age
    candidates["patient_gender"] = gender
    candidates["emergency_required"] = emergency
    candidates["insurance_supported"] = insurance

    # Step 5: Predict recommendation score using ML model
    try:
        candidates["predicted_score"] = model.predict(candidates)
    except Exception as err:
        print(f"Prediction fallback due to: {err}")
        candidates["predicted_score"] = (
            candidates["hospital_rating"] * 10 +
            candidates["treatment_success_rate_pct"] * 0.5
        )

    # Step 6: Deduplicate by unique hospital name so top 3 are 3 distinct, top-tier institutions
    candidates = candidates.sort_values(
        by=["predicted_score", "hospital_rating", "treatment_success_rate_pct"],
        ascending=False
    )
    
    unique_candidates = candidates.drop_duplicates(subset=["hospital_name"])
    top_3 = unique_candidates.head(3)

    result = top_3[
        [
            "hospital_name",
            "hospital_type",
            "hospital_category",
            "hospital_bed_capacity",
            "required_department",
            "hospital_rating",
            "treatment_success_rate_pct",
            "doctor_availability_pct",
            "bed_availability_pct",
            "estimated_wait_time_min",
            "estimated_treatment_cost_inr",
            "insurance_supported",
            "emergency_services_available",
            "patient_satisfaction_score",
            "city",
            "district",
            "state",
            "predicted_score"
        ]
    ]

    return {
        "message": "Top 3 hospitals recommended successfully",
        "department": dept,
        "city": city,
        "hospital_type": h_type,
        "recommendations": result.to_dict(orient="records")
    }


if __name__ == "__main__":
    import uvicorn
    # Runs the server stably without infinite OneDrive/Jupyter reload loops
    print("Starting Hospital Recommendation Server at http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)

