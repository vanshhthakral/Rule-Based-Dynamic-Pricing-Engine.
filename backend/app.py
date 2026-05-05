from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime


from demand_model import predict_demand, predict_demand_batch

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Dynamic Pricing Engine Backend is running!",
        "endpoints": ["/api/health", "/api/calculate-price"],
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "pricing-engine"}), 200


@app.route("/api/calculate-price", methods=["POST"])
def calculate_price():
    try:
        data = request.json or {}
        base_price = float(data.get("base_price"))
        duration_days = int(data.get("duration_days", 1))
        if duration_days < 1:
            raise ValueError("duration_days must be at least 1")
        day_of_week = data.get("day_of_week")
        hotel = data.get("hotel", "City Hotel")
        season = data.get("season", "normal")
        adults = int(data.get("adults", 2))
        children = int(data.get("children", 0))
        babies = int(data.get("babies", 0))
        market_segment = data.get("market_segment", "Online TA")
        lead_time = int(data.get("lead_time", 21))

        predicted_demand = predict_demand(
            day_of_week=day_of_week,
            hotel=hotel,
            season=season,
            adults=adults,
            children=children,
            babies=babies,
            market_segment=market_segment,
            lead_time=lead_time,
        )

        price = base_price
        applied_rules = []

        if predicted_demand == "HIGH":
            price *= 1.20
            applied_rules.append("High demand +20%")
        elif predicted_demand == "MEDIUM":
            price *= 1.10
            applied_rules.append("Medium demand +10%")
        elif predicted_demand == "LOW":
            price *= 0.90
            applied_rules.append("Low demand -10%")

        if day_of_week in ["Saturday", "Sunday"]:
            price *= 1.10
            applied_rules.append("Weekend +10%")

        max_price = 1.5 * base_price
        capped = False
        if price > max_price:
            price = max_price
            capped = True
            applied_rules.append("Fairness cap applied (Max 1.5x)")

        final_price = round(price, 2)
        total_price = round(final_price * duration_days, 2)

        explanation_parts = []
        if predicted_demand == "HIGH":
            explanation_parts.append("high demand")
        elif predicted_demand == "LOW":
            explanation_parts.append("low demand")
        if day_of_week in ["Saturday", "Sunday"]:
            explanation_parts.append("weekend booking")

        if explanation_parts:
            explanation = f"Price adjusted due to {' and '.join(explanation_parts)}."
        else:
            explanation = "Price adjusted based on normal demand factors."
        if capped:
            explanation += " Fairness cap applied to prevent excessive pricing."
        if duration_days > 1:
            explanation += f" Total reflects {duration_days} days at the calculated daily rate."

        return jsonify({
            "base_price": base_price,
            "duration_days": duration_days,
            "predicted_demand": predicted_demand,
            "applied_rules": applied_rules,
            "final_price": final_price,  # daily dynamic rate (kept for backward compatibility)
            "daily_rate": final_price,
            "total_price": total_price,
            "explanation": explanation,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/calculate-prices-batch", methods=["POST"])
def calculate_prices_batch():
    try:
        data = request.json
        if not isinstance(data, list):
            raise ValueError("Input must be a JSON array of hotel objects.")

        if not data:
            return jsonify({}), 200

        # Extract features for batch prediction
        features_list = []
        for item in data:
            features = item.get("features", {})
            features_list.append(features)

        # Batch predict demand
        predicted_demands = predict_demand_batch(features_list)

        results = {}
        for idx, item in enumerate(data):
            hotel_id = item.get("hotel_id")
            if hotel_id is None:
                continue

            features = item.get("features", {})
            base_price = float(features.get("base_price", 0))
            duration_days = int(features.get("duration_days", 1))
            day_of_week = features.get("day_of_week")

            predicted_demand = predicted_demands[idx]

            price = base_price
            if predicted_demand == "HIGH":
                price *= 1.20
            elif predicted_demand == "MEDIUM":
                price *= 1.10
            elif predicted_demand == "LOW":
                price *= 0.90

            if day_of_week in ["Saturday", "Sunday"]:
                price *= 1.10

            max_price = 1.5 * base_price
            if price > max_price:
                price = max_price

            final_price = round(price, 2)
            results[str(hotel_id)] = {
                "final_price": final_price,
                "predicted_demand": predicted_demand
            }

        return jsonify(results), 200


    except Exception as e:
        return jsonify({"error": str(e)}), 400



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
