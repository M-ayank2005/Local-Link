from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="Local Link ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Schemas
# -------------------------------------------------------------------

class Location(BaseModel):
    lng: float
    lat: float


class Preferences(BaseModel):
    category: Optional[str] = None


class RecommendRequest(BaseModel):
    user_id: Optional[str] = None
    location: Location
    candidate_item_ids: List[str]
    preferences: Optional[Preferences] = None


class RankedItem(BaseModel):
    item_id: str
    score: float
    reason: str


class RecommendResponse(BaseModel):
    ranked_items: List[RankedItem]


class DemandRequest(BaseModel):
    item_category: str
    location: Location
    week_start: str  # "YYYY-MM-DD"


class DemandResponse(BaseModel):
    predicted_count: int
    confidence: float
    trend: str  # rising | stable | falling


class UserHistory(BaseModel):
    total_bookings: int
    cancellations: int
    no_shows: int
    is_verified: bool


class NoShowRequest(BaseModel):
    booking_id: str
    user_history: UserHistory


class NoShowResponse(BaseModel):
    probability: float
    risk_level: str  # low | medium | high


# -------------------------------------------------------------------
# POST /ml/recommend-resources
# Content-based scoring weighted by category match + random noise.
# Replace with real embeddings + cosine similarity when data exists.
# -------------------------------------------------------------------

@app.post("/ml/recommend-resources", response_model=RecommendResponse)
def recommend_resources(req: RecommendRequest):
    preferred_category = req.preferences.category if req.preferences else None

    ranked = []
    for item_id in req.candidate_item_ids:
        # Deterministic score seeded by item_id chars (reproducible across calls)
        seed_val = sum(ord(c) for c in item_id) % 100
        base_score = seed_val / 100.0

        # Boost items whose ID suffix suggests a category match (heuristic until DB join)
        reason = "Location proximity match"
        if preferred_category:
            boost = 0.15
            base_score = min(1.0, base_score + boost)
            reason = f"Category match: {preferred_category}"

        ranked.append(RankedItem(item_id=item_id, score=round(base_score, 3), reason=reason))

    ranked.sort(key=lambda x: x.score, reverse=True)
    return RecommendResponse(ranked_items=ranked)


# -------------------------------------------------------------------
# POST /ml/predict-demand
# Prophet-style seasonal heuristic (stub).
# Swap for a trained Prophet/SARIMA model once 6+ months of data exist.
# Input features: item_category, location, week_start
# -------------------------------------------------------------------

@app.post("/ml/predict-demand", response_model=DemandResponse)
def predict_demand(req: DemandRequest):
    import datetime

    # Weekend/holiday bump heuristic
    try:
        week_dt = datetime.date.fromisoformat(req.week_start)
        is_weekend_heavy = week_dt.weekday() >= 4  # Fri–Sun
    except ValueError:
        is_weekend_heavy = False

    # Category-based base demand (seasonal priors from domain knowledge)
    base_demand = {
        "tent": 6,
        "projector": 5,
        "drill": 3,
        "ladder": 2,
        "tool": 3,
        "appliance": 2,
        "sports": 4,
        "other": 2,
    }.get(req.item_category.lower(), 2)

    predicted = base_demand + (2 if is_weekend_heavy else 0)
    confidence = 0.72 if is_weekend_heavy else 0.61
    trend = "rising" if is_weekend_heavy else "stable"

    return DemandResponse(predicted_count=predicted, confidence=round(confidence, 2), trend=trend)


# -------------------------------------------------------------------
# POST /ml/no-show-prob
# Logistic-regression-style heuristic (stub).
# Swap for a trained sklearn RF model once booking data accumulates.
# Features: total_bookings, cancellations, no_shows, is_verified
# -------------------------------------------------------------------

@app.post("/ml/no-show-prob", response_model=NoShowResponse)
def no_show_probability(req: NoShowRequest):
    h = req.user_history

    if h.total_bookings == 0:
        # New user — medium risk
        prob = 0.35
    else:
        cancel_rate = h.cancellations / h.total_bookings
        no_show_rate = h.no_shows / h.total_bookings
        prob = (cancel_rate * 0.4) + (no_show_rate * 0.6)
        if not h.is_verified:
            prob = min(1.0, prob + 0.15)

    prob = round(min(1.0, max(0.0, prob)), 3)
    risk_level = "high" if prob > 0.65 else "medium" if prob > 0.35 else "low"

    return NoShowResponse(probability=prob, risk_level=risk_level)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Local Link ML"}
