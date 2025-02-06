document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('username').value,
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            alert('Signup successful! Please login.');
            window.location.href = '/login.html';
        } catch (error) {
            alert(error.message || 'An error occurred during signup');
        }
    });
});