->  CipherChat 

    CipherChat is a real-time, web-based chat room with a "secure" twist. All messages are encrypted end-to-end using a classic Caesar cipher, built entirely with Python (Flask-SocketIO) and JavaScript.
    
    This project was built to demonstrate the concepts of full-stack development, WebSocket communication, and the basic principles of client-side encryption.

CipherChat pic : <img width="1011" height="808" alt="Cipher" src="https://github.com/user-attachments/assets/9841a70d-f2d6-4ac8-81df-c98220a98c60" />



 🚀 Features

    Real-time Messaging: Instantly send and receive messages with multiple users.
    "Secure" E2E Encryption:** Messages are encrypted in your browser *before* being sent and decrypted by the receiver.
    Server-Blind:** The server only sees the encrypted text (e.g., "Khoor") and never the plain text ("Hello").
    System Notifications: See when users join or leave the chat.
    Simple & Clean UI: A modern, responsive chat interface built with HTML and CSS.


 🛠️ Technology Stack

    * Backend: Python, Flask, Flask-SocketIO, Eventlet
    * Frontend: HTML5, CSS3, JavaScript (ES6+)
    * Protocol: WebSockets


 *  Workflow: How the "Security" Works

      The core of this project is its simple "end-to-end" encryption. The server is only a middle-man that passes along encrypted data.
      
      1.  User A (Sender): Types "Hello" into their browser.
      2.  User A's Browser (Client):** The JavaScript `encrypt()` function runs, converting "Hello" into the encrypted text "Khoor" (with a shift of 3).
      3.  Network: The *encrypted* message "Khoor" is sent to the server.
      4.  Python Server: The server receives "Khoor". It does **not** know what it means. It just broadcasts "Khoor" to all other connected clients.
      5.  User B's Browser (Receiver):** The JavaScript `socket.on('message_broadcast', ...)` listener fires, receiving "Khoor".
      6.  User B (Receiver):** The JavaScript `decrypt()` function runs, converting "Khoor" back into "Hello", which is then displayed on the screen.
      

 *  Running the Project Locally

      Follow these steps to get the project running on your own machine.
      
       1. Prerequisites
      You must have Python 3 installed.
      
       2. Clone the Repository
      ```bash
      git clone https://github.com/ayush007-lio/Cipher-Chat
      cd Your-Repo-Name
