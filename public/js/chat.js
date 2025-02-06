let socket;
let currentRoom = '';
let typingTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login.html';
        return;
    }


    document.getElementById('userDisplay').textContent = user.username;
    
    socket = io();

    // Setup event listeners
    setupRoomListeners();
    setupMessageForm();
    setupSocketListeners();
    setupLogout();
});

function setupRoomListeners() {
    const roomButtons = document.querySelectorAll('.list-group-item');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');

    roomButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newRoom = this.dataset.room;
            
            if (currentRoom) {
                socket.emit('leave_room', { room: currentRoom, username: user.username });
            }

            currentRoom = newRoom;
            socket.emit('join_room', { room: currentRoom, username: user.username });
            
            // Update UI
            updateRoomUI(this);
        });
    });

    leaveRoomBtn.addEventListener('click', leaveCurrentRoom);
}

function setupMessageForm() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });

    messageInput.addEventListener('input', handleTyping);
}

function setupSocketListeners() {
    socket.on('user_joined', (data) => {
        addSystemMessage(`${data.username} joined the room`);
    });

    socket.on('user_left', (data) => {
        addSystemMessage(`${data.username} left the room`);
    });

    socket.on('receive_message', (data) => {
        if (data.username !== user.username) {
            addMessageToUI(data, false);
        }
    });

    socket.on('user_typing', (data) => {
        if (data.username !== user.username) {
            document.querySelector('.typing-indicator').textContent = 
                `${data.username} is typing...`;
        }
    });

    socket.on('stop_typing', () => {
        document.querySelector('.typing-indicator').textContent = '';
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (currentRoom) {
                socket.emit('leave_room', { 
                    room: currentRoom, 
                    username: user.username 
                });
            }

            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error during logout:', error);
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
    });
}

// Helper Functions
function updateRoomUI(selectedButton) {
    document.querySelectorAll('.list-group-item')
        .forEach(btn => btn.classList.remove('current-room'));
    selectedButton.classList.add('current-room');
    
    document.getElementById('currentRoom').textContent = currentRoom;
    document.getElementById('messageInput').disabled = false;
    document.querySelector('#messageForm button').disabled = false;
    document.getElementById('leaveRoomBtn').style.display = 'block';
    document.getElementById('messageContainer').innerHTML = '';
}

function leaveCurrentRoom() {
    if (currentRoom) {
        socket.emit('leave_room', { room: currentRoom, username: user.username });
        currentRoom = '';
        
        // Reset UI
        document.querySelectorAll('.list-group-item')
            .forEach(btn => btn.classList.remove('current-room'));
        document.getElementById('currentRoom').textContent = 'Not Selected';
        document.getElementById('messageInput').disabled = true;
        document.querySelector('#messageForm button').disabled = true;
        document.getElementById('leaveRoomBtn').style.display = 'none';
        document.getElementById('messageContainer').innerHTML = '';
        document.querySelector('.typing-indicator').textContent = '';
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && currentRoom) {
        const messageData = {
            room: currentRoom,
            username: user.username,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        socket.emit('send_message', messageData);
        messageInput.value = '';
        
        addMessageToUI(messageData, true);
    }
}

function handleTyping() {
    if (currentRoom) {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        socket.emit('typing', { room: currentRoom, username: user.username });
        
        typingTimeout = setTimeout(() => {
            socket.emit('stop_typing', { room: currentRoom, username: user.username });
        }, 1000);
    }
}

function addMessageToUI(data, isSent) {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        <div class="username">${data.username}</div>
        <div class="message-text">${data.message}</div>
        <div class="time">${new Date(data.timestamp).toLocaleTimeString()}</div>
    `;
    
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function addSystemMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    const systemMessage = document.createElement('div');
    systemMessage.className = 'text-center text-muted my-2';
    systemMessage.textContent = message;
    
    messageContainer.appendChild(systemMessage);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}