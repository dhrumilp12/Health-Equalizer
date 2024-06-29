from app import app
from flask import Flask, request, jsonify
import openai
import googlemaps
from dotenv import load_dotenv
import os



# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_KEY")
google_maps_key = os.getenv("GOOGLE_MAPS_KEY")

# Initialize Google Maps client
gmaps = googlemaps.Client(key=google_maps_key)

@app.route('/')
def home():
    return "Welcome to the Health Equalizer API!"

# Endpoint for Health Queries
@app.route('/health_queries', methods=['GET', 'POST'])
def health_queries():
    if request.method == 'POST':
        user_query = request.json.get('query', '')
        if not user_query:
            return jsonify({"error": "Query is required"}), 400
        try:
            response = openai.Completion.create(
                engine="gpt-3.5-turbo-instruct",
                prompt=user_query,
                max_tokens=150,
                api_key=openai_api_key  # Ensure API key is used securely
            )
            return jsonify(response['choices'][0]['text'].strip())
        except Exception as e:
            app.logger.error(f"Error processing health query: {e}")
            if "You exceeded your current quota" in str(e):
                return jsonify({"error": "We have exceeded our AI service quota. Please try again later."}), 429
            return jsonify({"error": "Error processing your request"}), 500
    return "Send a POST request with a 'query' in JSON format."

# Endpoint for Provider Locator
@app.route('/providers', methods=['GET'])
def providers():
    location = request.args.get('location', '')
    if not location:
        app.logger.warning("Location parameter missing for provider lookup")
        return jsonify({"error": "Location parameter is required."}), 400
    try:
        app.logger.info(f"Looking up providers near location: {location}")
        result = gmaps.places_nearby(location=location, radius=5000, type='hospital')
        app.logger.info(f"Received results: {result}")
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error finding providers: {e}")
        return jsonify({"error": "Error finding healthcare providers"}), 500
    
# Endpoint for Emergency Services
@app.route('/emergency', methods=['GET'])
def emergency():
    # Placeholder response, assuming implementation is pending
    return "Emergency Services Locator is under development."

if __name__ == '__main__':
    app.run(debug=True)
