from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from ai_services import analyze_image, classify_text, generate_advice, forecast_prices, get_daily_insight
import typing

app = FastAPI(title="AgriVision API")

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "Welcome to AgriVision API 🌾",
        "endpoints": {
            "POST /api/vision/analyze": "Upload an image for crop/disease analysis",
            "POST /api/llm/classify": "Classify agricultural text",
            "POST /api/llm/advice": "Get AI-generated farming advice",
            "GET /api/forecast/prices": "Get crop price forecasts",
            "GET /api/insights/daily": "Get daily farm insights",
        },
        "docs": "/docs"
    }

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextPayload(BaseModel):
    text: str

class AdvicePayload(BaseModel):
    disease: str
    weather: str
    market_status: str

@app.post("/api/vision/analyze")
async def api_analyze_vision(file: UploadFile = File(...)):

    contents = await file.read()

    result = analyze_image(contents)

    return {
        "status": "success",
        "data": result
    }

@app.post("/api/llm/classify")
async def api_classify_text(payload: TextPayload):
    try:
        result = classify_text(payload.text)
        return {"status": "success", "data": result}
    except Exception as e:
        error_msg = str(e)

        if "503" in error_msg or "capacity" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail="AI service is busy. Please try again in a few seconds."
            )

        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/llm/advice")
async def api_generate_advice(payload: AdvicePayload):
    try:
        result = generate_advice(payload.disease, payload.weather, payload.market_status)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Optional

@app.get("/api/forecast/prices")
async def api_forecast_prices(crop: Optional[str] = None):
    try:
        result = forecast_prices(crop)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/daily")
async def api_daily_insight(crop: Optional[str] = None):
    try:
        result = get_daily_insight(crop)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

