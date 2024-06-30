from app import app
from flask import Flask, request, jsonify
import openai
import googlemaps
from dotenv import load_dotenv
import os
from .speech_service import speech_to_text



# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_KEY")
google_maps_key = os.getenv("GOOGLE_MAPS_KEY")

# Initialize Google Maps client
gmaps = googlemaps.Client(key=google_maps_key)



@app.route('/health_queries_audio', methods=['POST'])
def health_queries_audio():
     # Check if the part 'audio' is present in files
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio file is required'}), 400
        # Assume the voice data is sent as a file or binary data
        voice_data = request.files['audio']

        # Save the temporary audio file if needed or pass directly to the speech_to_text function
        text_output = speech_to_text(voice_data)
        
        if text_output:
            return jsonify({'message': text_output}), 200
        else:
            return jsonify({'error': 'Speech recognition failed'}), 400



@app.route('/')
def welcome():
    # Simple welcome message when user hits the base URL
    return jsonify({"message": "Welcome to the Health Assistant. Please submit your health-related questions via the /health_queries endpoint."})


# Function to determine if the query is health-related
@app.route('/health_queries', methods=['GET', 'POST'])
def health_queries():
    if request.method == 'POST':
        user_query = request.json.get('query', '')
        if not user_query:
            return jsonify({"error": "Query is required"}), 400

        prompt = f"Check if the following query is related to health issues: '{user_query}'. If it is, provide a detailed response. If not, kindly suggest the user to provide a health-related query."
        try:
            response = openai.Completion.create(
                engine="gpt-3.5-turbo-instruct",
                prompt=prompt,
                max_tokens=250,  # Increased token count for added context handling
                api_key=openai_api_key
            )
            ai_response = response['choices'][0]['text'].strip()
            if "not related to health" in ai_response:
                return jsonify({"error": "Query not related to health. Please submit a health-related query."}), 400
            return jsonify(ai_response)
        except Exception as e:
            app.logger.error(f"Error processing health query: {e}")
            if "You exceeded your current quota" in str(e):
                return jsonify({"error": "We have exceeded our AI service quota. Please try again later."}), 429
            return jsonify({"error": "Error processing your request"}), 500

    return "Send a POST request with a 'query' in JSON format."

@app.route('/providers', methods=['GET'])
def providers():
    location = request.args.get('location', '')
    if not location:
        app.logger.warning("Location parameter missing for provider lookup")
        return jsonify({"error": "Location parameter is required."}), 400

    # Ensure location is in the correct format if needed, e.g., "lat,lng"
    try:
        # Parsing to float to check format validity
        lat, lng = map(float, location.split(','))
    except ValueError:
        app.logger.error("Location format is incorrect. Should be 'lat,lng'")
        return jsonify({"error": "Location format is incorrect. Use 'lat,lng'"}), 400

    try:
        app.logger.info(f"Looking up providers near location: {location}")
        # Make sure to send coordinates as a tuple of floats
        result = gmaps.places_nearby(location=(lat, lng), radius=5000, type='hospital')
        app.logger.info(f"Received results: {result}")
        return jsonify(result['results'])  # Only send the results part if needed
    except Exception as e:
        app.logger.error(f"Error finding providers: {e}")
        return jsonify({"error": "Error finding healthcare providers"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
