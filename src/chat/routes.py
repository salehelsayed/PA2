from flask import Blueprint, request, jsonify, current_app, session
import openai
import os
from dotenv import load_dotenv
import logging
import json

chat_bp = Blueprint('chat', __name__)

# Load environment variables from .env file
load_dotenv()

# Retrieve OpenAI API key from environment variables
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    logging.error("OpenAI API key not found in environment variables.")

# Initialize OpenAI client with the API key
client = openai.Client(api_key=openai_api_key)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages from the user.

    Expects a JSON payload with the user's message and returns the AI assistant's response.

    Returns:
        A JSON response containing the AI's reply or an error message.
    """
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided.'}), 400

    try:
        # Prepare the parameters for the chat completion
        params = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7
        }

        # Call the Chat Completion API using the OpenAI client
        completion = client.chat.completions.create(**params)

        # Extract the assistant's reply
        ai_response = completion.choices[0].message.content.strip()

        return jsonify({'response': ai_response})

    except openai.OpenAIError as e:
        # Handle OpenAI API errors
        current_app.logger.error(f"OpenAI API error: {e}")
        return jsonify({'error': 'Failed to process the request with OpenAI.'}), 500

    except Exception as e:
        # Handle unexpected errors
        current_app.logger.error(f"Unexpected error: {e}")
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@chat_bp.route('/api/file', methods=['GET'])
def read_file():
    """Read and return the content of a specified file.

    The file path is provided as a query parameter. Access is restricted to the selected directory.

    Returns:
        A JSON response containing the file content or an error message.
    """
    file_path = request.args.get('file_path')
    base_directory = session.get('selected_directory')

    if not file_path or not base_directory:
        return jsonify({'error': 'File path not provided.'}), 400

    # Resolve the absolute path
    absolute_path = os.path.abspath(os.path.join(base_directory, file_path))

    # Security check to prevent access outside the base directory
    if not absolute_path.startswith(base_directory):
        return jsonify({'error': 'Access to the specified file is not allowed.'}), 403

    if not os.path.exists(absolute_path):
        return jsonify({'error': 'File not found.'}), 404

    try:
        # Read the file content
        with open(absolute_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except Exception as e:
        current_app.logger.error(f"Error reading file {absolute_path}: {e}")
        return jsonify({'error': 'An error occurred while reading the file.'}), 500

    return jsonify({'content': content})

# Note: The '/api/directory' and '/browse' routes have been removed or commented out.
# If directory browsing functionality is needed, ensure proper security measures are in place.