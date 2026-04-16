import cv2
import numpy as np
import random
def load_reference_images():
    return {
        "Tomato": cv2.imread("data/tomato1.jpg"),
        "Potato": cv2.imread("data/potato.jpg"),
        "Spinach": cv2.imread("data/spinach.jpg")
    }


def compare_images(img1, img2):
    img1 = cv2.resize(img1, (100, 100))
    img2 = cv2.resize(img2, (100, 100))

    diff = np.mean((img1 - img2) ** 2)
    return diff


def analyze_image(image_bytes):
    
    # User requested to hardcode/mock 3 leaf diseases: Tomato, Potato, Spinach
    best_match = random.choice(["Tomato", "Potato", "Spinach"])

    # Assign disease manually
    disease_map = {
        "Tomato": "Leaf Blight",
        "Potato": "Early Blight",
        "Spinach": "Leaf Spot"
    }

    disease = disease_map.get(best_match, "Unknown")

    return {
        "status": "disease_detected",
        "condition": f"{best_match} - {disease}",
        "confidence": 90.0,
        "crop_name": best_match
    }

# Voice Field Logic
def classify_text(text):
    text_lower = text.lower()

    if "water" in text_lower:
        return {
            "category": "Water Advice",
            "message": "Water required: Irrigate 2-3 times per week depending on soil moisture.",
            "raw_text": text
        }

    elif "fertilizer" in text_lower or "khad" in text_lower:
        return {
            "category": "Fertilizer Advice",
            "message": "Fertilizer required: Apply khad/fertilizer every 10-15 days for optimal growth.",
            "raw_text": text
        }

    return {
        "category": "General",
        "message": "Monitor crop regularly for signs of stress.",
        "raw_text": text
    }

def generate_advice(disease, weather, market_status):
    advice_text = f"We detected {disease}. With {weather.lower()}, you must act immediately. Since {market_status.lower()}, prioritize this treatment to maximize yield."
    
    if "Tomato" in disease:
        advice_text += " Apply appropriate fungicide for Tomato blight."
    elif "Potato" in disease:
        advice_text += " Ensure Potato soil is not waterlogged."
    elif "Spinach" in disease:
        advice_text += " Add nitrogen fertilizers for healthy Spinach leaves."

    return {
        "advice_text": advice_text
    }


# Market Forecast (STATIC GRAPH)
def forecast_prices(crop):

    if crop == "Tomato":
        past = [22, 19, 23, 21, 24]
        current = 23
        future = [26, 24, 28, 27, 30]

    elif crop == "Potato":
        past = [14, 11, 13, 10, 12]
        current = 14
        future = [13, 16, 14, 17]

    else:
        past = [17, 15, 18, 16]
        current = 18
        future = [17, 20, 19, 22]

    # Format for re-charts UI
    forecast_data = []
    
    # Back is past price
    for i, p in enumerate(past):
        forecast_data.append({"day": f"Past {-len(past)+i}", "predicted_price": p})
    
    # Mid graph is current price
    forecast_data.append({"day": "Current", "predicted_price": current})
    
    # Forward is forecast like price tomato ke price up honge ya down
    for i, p in enumerate(future):
        forecast_data.append({"day": f"Forecast {i+1}", "predicted_price": p})

    trend_dir = "Upward" if future[-1] > current else "Downward"

    return {
        "forecast": forecast_data,
        "trend": trend_dir,
        "volatility": "Moderate",
        "crop": crop
    }

# Farm Insights
def get_daily_insight(crop):
    
    insights = {
        "Tomato": "Tomato insight: Apply fungicide and harvest early to prevent blight spread.",
        "Potato": "Potato insight: Monitor soil moisture carefully, avoid waterlogging.",
        "Spinach": "Spinach insight: Ensure proper leaf nutrition and keep an eye on caterpillars."
    }

    # If crop is not one of the hardcoded 3, provide a general insight
    active_crop = crop if crop in insights else random.choice(list(insights.keys())) if not crop else "General Crop"
    
    general_msg = "Farm condition is stable. Maintain regular watering schedules."

    return {
        "insight": insights.get(active_crop, general_msg),
        "alert_level": "Medium" if crop in insights else "Low"
    }