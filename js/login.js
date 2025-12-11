// API Configuration
const API_BASE_URL = 'http://localhost:8080/api'; // Change this to your Spring Boot backend URL

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    checkRememberedUser();
});

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate inputs
        if (!username || !password) {
            showMessage('Please enter username and password', 'error');
            return;
        }
        
        // Perform login
        await handleLogin(username, password, role, rememberMe);
    });
}

// Handle Login
async function handleLogin(username, password, role, rememberMe) {
    const loginBtn = document.querySelector('.btn-login');
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        // In production, replace this with actual API call
        const loginData = {
            username: username,
            password: password,
            role: role
        };
        
        // Mock API call - Replace with actual authentication
        // const response = await fetch(`${API_BASE_URL}/auth/login`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(loginData)
        // });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock authentication - Replace with actual API response handling
        const mockResponse = await mockAuthentication(username, password, role);
        
        if (mockResponse.success) {
            // Store authentication data
            storeAuthData(mockResponse.token, mockResponse.user, rememberMe);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage(mockResponse.message, 'error');
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An error occurred during login. Please try again.', 'error');
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Mock Authentication Function (Replace with actual API call)
async function mockAuthentication(username, password, role) {
    // This is mock authentication - replace with actual API call
    // In production, the backend will validate credentials and return a JWT token
    
    // Mock credentials for testing
    const mockUsers = {
        'admin': { password: 'admin123', role: 'admin', name: 'John Admin' },
        'teacher': { password: 'teacher123', role: 'teacher', name: 'Jane Teacher' },
        'student': { password: 'student123', role: 'student', name: 'Bob Student' }
    };
    
    const user = mockUsers[username];
    
    if (user && user.password === password && user.role === role) {
        return {
            success: true,
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                username: username,
                name: user.name,
                role: user.role
            }
        };
    } else {
        return {
            success: false,
            message: 'Invalid username, password, or role'
        };
    }
}

// Store Authentication Data
function storeAuthData(token, user, rememberMe) {
    // Store JWT token
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name);
    
    // Store username if remember me is checked
    if (rememberMe) {
        localStorage.setItem('rememberedUsername', user.username);
    } else {
        localStorage.removeItem('rememberedUsername');
    }
}

// Check for Remembered User
function checkRememberedUser() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    
    if (rememberedUsername) {
        document.getElementById('username').value = rememberedUsername;
        document.getElementById('rememberMe').checked = true;
    }
}

// Show Message
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    // Insert message before form
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Password Toggle (Optional Enhancement)
function addPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    
    passwordInput.parentNode.appendChild(toggleBtn);
    
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = type === 'password' ? 'fa-eye' : 'fa-eye-slash';
        toggleBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    });
}

// Forgot Password Handler
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});

function handleForgotPassword() {
    const email = prompt('Please enter your email address:');
    
    if (email) {
        // In production, send password reset request to backend
        // await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        //     method: 'POST',
        //     body: JSON.stringify({ email: email })
        // });
        
        showMessage('Password reset instructions have been sent to your email.', 'success');
    }
}

// Input Validation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // Add real-time validation
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#4a90e2';
        });
    });
});

// Handle Enter Key
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (document.activeElement.form === loginForm) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

