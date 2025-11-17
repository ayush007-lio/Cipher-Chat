// static/script.js

// --- Caesar Cipher (Same as your Python code) ---
// This is your "key"
const CAESAR_SHIFT = 3;

function encrypt(text, shift) {
    let encryptedText = "";
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        if (char.match(/[a-z]/)) { // if it's a lowercase letter
            let shifted = char.charCodeAt(0) + shift;
            if (shifted > 'z'.charCodeAt(0)) {
                shifted -= 26;
            }
            encryptedText += String.fromCharCode(shifted);
        } else if (char.match(/[A-Z]/)) { // if it's an uppercase letter
            let shifted = char.charCodeAt(0) + shift;
            if (shifted > 'Z'.charCodeAt(0)) {
                shifted -= 26;
            }
            encryptedText += String.fromCharCode(shifted);
        } else {
            // If not a letter (like '!', ' '), just add it as is
            encryptedText += char;
        }
    }
    return encryptedText;
}

function decrypt(text, shift) {
    // Decryption is just shifting in the opposite direction
    return encrypt(text, -shift);
}

// --- End of Cipher Logic ---


// --- Socket.IO Logic ---
document.addEventListener("DOMContentLoaded", () => {
    
    // Connect to the Socket.IO server (your python script)
    const socket = io();

    // Get references to all the HTML elements
    const messageLog = document.getElementById("message-log");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    let username = "";
    let state = "GET_USERNAME"; // We start by asking for a username

    // Function to add a message to the chat window
    // type can be 'server', 'my-message', or 'other-user'
    function addMessage(text, sender, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);
        
        let messageHTML = "";
        
        // Add the sender's name if it's a user message
        if (sender) {
            messageHTML += `<div class="sender-name">${sender}</div>`;
        }
        
        messageHTML += `<div>${text}</div>`; // The message text
        
        messageDiv.innerHTML = messageHTML;
        messageLog.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        messageLog.scrollTop = messageLog.scrollHeight;
    }

    // Function to handle sending a message
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text === "") return;

        if (state === "GET_USERNAME") {
            // --- This is the first message (the username) ---
            username = text;
            socket.emit('user_joined', username); // Tell server our name
            
            // Update UI
            state = "CHAT";
            messageInput.placeholder = "Type a message...";
            addMessage("You have joined as " + username, null, "server");
            
        } else {
            // --- This is a normal chat message ---
            
            // 1. Encrypt the message
            const encryptedText = encrypt(text, CAESAR_SHIFT);
            
            // 2. Add the *decrypted* message to *our own* chat window
            addMessage(text, "You", "my-message");
            
            // 3. Send the *encrypted* message to the server
            socket.emit('new_message', { 'encrypted_text': encryptedText });
        }
        
        // Clear the input box
        messageInput.value = "";
    }

    // --- Listen for events ---

    // 1. Handle "Send" button click
    sendButton.addEventListener("click", sendMessage);

    // 2. Handle "Enter" key press
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });


    // --- Listen for events from the SERVER ---

    // 1. Received a server message (e.g., "... joined ...")
    socket.on('server_message', (message) => {
        addMessage(message, null, "server");
    });

    // 2. Received a chat broadcast from another user
    socket.on('message_broadcast', (data) => {
        // data = { username: 'Ayush', encrypted_text: 'Khoor' }
        
        // 1. Decrypt the text
        const decryptedText = decrypt(data.encrypted_text, CAESAR_SHIFT);
        
        // 2. Add the decrypted message to the chat window
        addMessage(decryptedText, data.username, "other-user");
    });
});