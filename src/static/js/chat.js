document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    // Handle Enter key press
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Function to create a message element
    const createMessageElement = (message, sender) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        if (sender === 'ai') {
            // Parse Markdown and set as HTML
            messageContent.innerHTML = marked.parse(message);
        } else {
            // Escape any HTML in user's message
            messageContent.textContent = message;
        }

        messageWrapper.appendChild(messageContent);
        return messageWrapper;
    };

    // Function to add a message to the chat container
    const addMessage = (message, sender) => {
        const messageElement = createMessageElement(message, sender);
        chatContainer.appendChild(messageElement);
        scrollToBottom();
    };

    // Function to handle form submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message === "") return;

        // Display user's message
        addMessage(message, 'user');
        userInput.value = '';

        // Send the message to the server and handle AI response
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                addMessage(data.response, 'ai');
            } else {
                addMessage("Sorry, I couldn't process that.", 'ai');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addMessage("An error occurred. Please try again.", 'ai');
        });
    });

    // Function to scroll chat to the bottom
    const scrollToBottom = () => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // Initial scroll to bottom on load
    scrollToBottom();

    // Function to reset the chat area
    function resetChat(event) {
        event.preventDefault();
        chatContainer.innerHTML = '';
    }
}); 