from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests."""
    try:
        user_input = request.json.get('message', '')
        if not user_input:
            return jsonify({'error': 'No message provided'}), 400

        # Call OpenAI API with new client format
        response = client.chat.completions.create(
            model="gpt-4",  # or "gpt-3.5-turbo" depending on requirements
            messages=[
                {"role": "user", "content": user_input}
            ],
            max_tokens=1000
        )

        # Extract the response text using new format
        ai_response = response.choices[0].message.content

        return jsonify({'response': ai_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
