document.addEventListener('DOMContentLoaded', function() {
    
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = '/chat.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const loginData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/chat.html';
        } catch (error) {
            alert(error.message || 'An error occurred during login');
        }
    });
});