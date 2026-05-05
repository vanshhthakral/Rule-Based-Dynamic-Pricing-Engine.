# AURÉVA - Modern Hotel Booking with Dynamic Pricing

AURÉVA is a comprehensive, full-stack hotel booking platform that integrates advanced artificial intelligence to offer dynamic, real-time pricing. By analyzing various market and booking factors, the application automatically adjusts room rates to balance profitability with consumer fairness.

## Project Overview

The system is designed around a three-tier architecture that separates the user experience, pricing intelligence, and data management:

1. **User Interface (Frontend)**: Built with React, the frontend offers a modern, intuitive experience for users to search for hotels, input their travel dates, and view dynamically calculated prices in real-time.
2. **Dynamic Pricing Engine (Python Backend)**: The core intelligence of the application. It processes incoming booking requests, evaluates historical and contextual data through a machine learning model, and applies business rules to determine the final room rate.
3. **Data Management API (Node.js Backend)**: A supportive backend service responsible for handling user authentication, managing reviews, and securely interacting with a MongoDB database.

## The Machine Learning Demand Model

At the heart of the Dynamic Pricing Engine is a predictive model that estimates room demand based on the context of the booking. 

### Model Architecture
The system utilizes a **Random Forest Classifier** (`RandomForestClassifier` from the `scikit-learn` library). This ensemble learning method operates by constructing a multitude of decision trees during training and outputting the mode of the classes for classification. It was chosen for its robustness against overfitting, handling of complex non-linear relationships, and its ability to process both categorical and numerical data effectively.

### Features Analyzed
To make accurate demand predictions, the model evaluates several key features of a booking request:
- **Lead Time**: The number of days between the booking date and the arrival date.
- **Seasonality**: The time of year (e.g., peak, normal, or off-season), derived from the arrival month.
- **Day of the Week**: Identifies if the stay falls on a weekend or a weekday, as weekends typically see higher demand.
- **Hotel Type**: Whether the property is a "Resort Hotel" or a "City Hotel".
- **Market Segment**: The channel through which the booking is made (e.g., Online Travel Agency).
- **Guest Composition**: The number of adults, children, and babies included in the reservation.

### Output and Decision Making
The Random Forest model classifies the expected demand for a given booking into one of three categories: **LOW**, **MEDIUM**, or **HIGH**. This classification was trained based on historical Average Daily Rate (ADR) tertiles from real-world hotel booking datasets.

Once the demand level is predicted, the Rule-Based Engine takes over to apply specific pricing adjustments:
- **High Demand**: Increases the base price by 20%.
- **Medium Demand**: Increases the base price by 10%.
- **Low Demand**: Decreases the base price by 10%.
- **Weekend Surge**: Applies an additional 10% premium for Saturday and Sunday check-ins.

### Fairness and Transparency
To ensure ethical pricing and prevent extreme price gouging during peak times, the engine enforces a **Fairness Cap**, strictly limiting the final calculated price from exceeding 1.5 times the base rate. Additionally, the system provides transparent, plain-text explanations to the user, detailing exactly why their price was adjusted (e.g., "Price adjusted due to high demand and weekend booking.").
