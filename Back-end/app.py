# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from pricing_engine import predict_demand, get_price_breakdown
from datetime import datetime

app = Flask(__name__)
CORS(app)

hotels = [
    {"id": 1, "name": "Grand Palace Hotel", "base_price": 5000},
    {"id": 2, "name": "Sea View Resort",    "base_price": 6500},
    {"id": 3, "name": "City Comfort Stay",  "base_price": 3500}
]

@app.route("/hotels", methods=["GET"])
def get_hotels():
    return jsonify(hotels)

@app.route("/calculate-price", methods=["POST"])
def calculate_price():
    data          = request.json
    base_price    = data["base_price"]
    season        = data["season"]
    checkin_day   = data["checkin_day"]
    tourist_level = data["tourist_level"]

    breakdown, final_price = get_price_breakdown(
        base_price, season, checkin_day, tourist_level
    )
    return jsonify({"final_price": final_price, "breakdown": breakdown})

@app.route("/auto-price", methods=["POST"])
def auto_price():
    data        = request.json
    base_price  = data["base_price"]
    season      = data["season"]
    checkin_day = data["checkin_day"]

    now          = datetime.now()
    hour         = now.hour
    day_of_week  = now.strftime("%A")
    tourist_level = predict_demand(hour, day_of_week)

    breakdown, final_price = get_price_breakdown(
        base_price, season, checkin_day, tourist_level
    )
    return jsonify({
        "final_price":       final_price,
        "predicted_demand":  tourist_level,
        "predicted_at_hour": hour,
        "day_of_week":       day_of_week,
        "breakdown":         breakdown
    })

if __name__ == "__main__":
    app.run(debug=True)
