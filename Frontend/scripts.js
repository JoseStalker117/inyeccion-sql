document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    const messageDiv = document.getElementById('message');

    // API endpoint configuration
    const API_BASE_URL = 'http://localhost:8000';

    // Test API connection on page load
    async function testAPIConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/test`);
            if (response.ok) {
                console.log('✅ API connection successful');
            } else {
                console.warn('⚠️ API connection failed');
            }
        } catch (error) {
            console.error('❌ Cannot connect to API:', error);
        }
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
        } else {
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    }

    function validateForm() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username) {
            showMessage('Por favor ingresa tu usuario', 'error');
            usernameInput.focus();
            return false;
        }

        if (!password) {
            showMessage('Por favor ingresa tu contraseña', 'error');
            passwordInput.focus();
            return false;
        }

        if (password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            passwordInput.focus();
            return false;
        }

        return true;
    }

    async function loginAPI(username, password) {
        try {
            console.log('🔄 Sending login request to:', `${API_BASE_URL}/api/login`);
            
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            console.log('📡 Response status:', response.status);
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.detail || 'Error en la conexión');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('No se puede conectar al servidor. Verifica que la API esté ejecutándose en http://localhost:8000');
            }
            throw error;
        }
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Hide any existing messages
        messageDiv.style.display = 'none';

        // Validate form
        if (!validateForm()) {
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Set loading state
        setLoadingState(true);

        try {
            const result = await loginAPI(username, password);
            
            if (result.success) {
                showMessage(`¡Login exitoso! Bienvenido ${result.username}`, 'success');
                
                // In a real app, you would redirect to the dashboard
                // window.location.href = '/dashboard';
                
                // For demo purposes, we'll just show success and reset form
                setTimeout(() => {
                    loginForm.reset();
                    setLoadingState(false);
                }, 3000);
            } else {
                showMessage(result.message, 'error');
                setLoadingState(false);
                
                // Clear password field on error
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            showMessage(error.message, 'error');
            setLoadingState(false);
            
            // Clear password field on error
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // Add some interactive features
    usernameInput.addEventListener('input', function() {
        if (messageDiv.style.display === 'block' && messageDiv.classList.contains('error')) {
            messageDiv.style.display = 'none';
        }
    });

    passwordInput.addEventListener('input', function() {
        if (messageDiv.style.display === 'block' && messageDiv.classList.contains('error')) {
            messageDiv.style.display = 'none';
        }
    });

    // Add Enter key support for better UX
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Focus on username field when page loads
    usernameInput.focus();
    
    // Test API connection
    testAPIConnection();
});
