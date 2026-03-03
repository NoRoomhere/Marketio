// Authentication JavaScript
// Готово для подключения API

// API Configuration (будет настроено позже)
const API_CONFIG = {
    baseURL: 'https://api.example.com', // Замените на ваш API URL
    endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout'
    }
};

// Utility Functions
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `message ${type} show`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\+380\d{9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.startsWith('380')) {
        value = '+' + value;
    } else if (value.startsWith('0')) {
        value = '+38' + value;
    } else if (value && !value.startsWith('+')) {
        value = '+380' + value;
    }
    
    if (value.length > 13) {
        value = value.slice(0, 13);
    }
    
    input.value = value;
}

// Account Type Selector (Registration Page)
document.addEventListener('DOMContentLoaded', function() {
    const accountTypeButtons = document.querySelectorAll('.account-type-btn');
    const businessForm = document.getElementById('businessForm');
    const bloggerForm = document.getElementById('bloggerForm');
    
    if (accountTypeButtons.length > 0) {
        accountTypeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Update active button
                accountTypeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide forms
                if (type === 'business') {
                    businessForm.classList.add('active');
                    bloggerForm.classList.remove('active');
                } else {
                    bloggerForm.classList.add('active');
                    businessForm.classList.remove('active');
                }
            });
        });
    }
    
    // Phone formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhone(this);
        });
    });
});

// Registration Handler
function handleRegistration(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Get form values
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value.trim();
    }
    
    // Validation
    if (!validateEmail(data.email)) {
        showMessage('Будь ласка, введіть коректний email', 'error');
        return;
    }
    
    if (data.password.length < 6) {
        showMessage('Пароль повинен містити мінімум 6 символів', 'error');
        return;
    }
    
    if (data.password !== data.passwordConfirm) {
        showMessage('Паролі не співпадають', 'error');
        return;
    }
    
    if (data.phone && !validatePhone(data.phone)) {
        showMessage('Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Реєстрація...';
    
    // Prepare data for API
    const apiData = {
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        userType: formType // 'business' or 'blogger'
    };
    
    if (formType === 'business') {
        apiData.businessName = data.businessName;
        apiData.description = data.description || null;
    } else {
        apiData.name = data.name;
        apiData.socialMedia = data.socialMedia || null;
        apiData.bio = data.bio || null;
    }
    
    // Firebase Registration
    registerUser(apiData)
        .then(response => {
            showMessage('Реєстрація успішна! Перенаправлення...', 'success');
            // Сохраняем токен и данные пользователя
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userType', formType);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userId', response.user.uid);
                // Сохраняем тип пользователя по UID для последующего входа
                localStorage.setItem(`userType_${response.user.uid}`, formType);
                
                // Сохраняем данные профиля
                if (formType === 'business') {
                    localStorage.setItem('businessName', data.businessName);
                    if (data.phone) localStorage.setItem('phone', data.phone);
                    if (data.description) localStorage.setItem('businessDescription', data.description);
                } else {
                    localStorage.setItem('bloggerName', data.name);
                    if (data.phone) localStorage.setItem('phone', data.phone);
                    if (data.socialMedia) localStorage.setItem('socialMedia', data.socialMedia);
                    if (data.bio) localStorage.setItem('bio', data.bio);
                }
            }
            // Перенаправление через 2 секунды
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        })
        .catch(error => {
            showMessage(error.message || 'Помилка реєстрації. Спробуйте ще раз.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Зареєструватися';
        });
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    // Validation
    if (!validateEmail(email)) {
        showMessage('Будь ласка, введіть коректний email', 'error');
        return;
    }
    
    if (!password) {
        showMessage('Будь ласка, введіть пароль', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Вхід...';
    
    // Firebase Login
    loginUser({ email, password, rememberMe })
        .then(response => {
            showMessage('Вхід успішний! Перенаправлення...', 'success');
            // Сохраняем токен и данные пользователя
            if (response.token) {
                if (rememberMe) {
                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('userType', response.user.userType || 'user');
                } else {
                    sessionStorage.setItem('authToken', response.token);
                    sessionStorage.setItem('userType', response.user.userType || 'user');
                }
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', response.user.uid);
            }
            // Перенаправление
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch(error => {
            showMessage(error.message || 'Невірний email або пароль', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Увійти';
        });
}

// Firebase Authentication Functions
async function registerUser(data) {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase не завантажено. Перезавантажте сторінку.');
    }
    
    try {
        // Create user with email and password
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(data.email, data.password);
        const user = userCredential.user;
        
        // Update user profile (basic info)
        await user.updateProfile({
            displayName: data.userType === 'business' ? data.businessName : data.name
        });
        
        // Save additional user data to Firestore (optional, requires Firestore setup)
        // Uncomment if you want to use Firestore to store additional user data
        /*
        if (typeof firebase.firestore !== 'undefined') {
            const db = firebase.firestore();
            const userProfile = {
                userType: data.userType,
                email: data.email,
                phone: data.phone || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (data.userType === 'business') {
                userProfile.businessName = data.businessName;
                userProfile.description = data.description || null;
            } else {
                userProfile.name = data.name;
                userProfile.socialMedia = data.socialMedia || null;
                userProfile.bio = data.bio || null;
            }
            
            await db.collection('users').doc(user.uid).set(userProfile);
        }
        */
        
        // Get ID token for authentication
        const token = await user.getIdToken();
        
        return {
            success: true,
            token: token,
            user: {
                uid: user.uid,
                email: user.email,
                userType: data.userType
            },
            message: 'Реєстрація успішна'
        };
    } catch (error) {
        // Handle Firebase errors
        let errorMessage = 'Помилка реєстрації. Спробуйте ще раз.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Цей email вже використовується';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Невірний формат email';
                break;
            case 'auth/weak-password':
                errorMessage = 'Пароль занадто слабкий';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Помилка мережі. Перевірте інтернет-з\'єднання';
                break;
            default:
                errorMessage = error.message || errorMessage;
        }
        
        throw new Error(errorMessage);
    }
}

async function loginUser(data) {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase не завантажено. Перезавантажте сторінку.');
    }
    
    // Check if Firebase is initialized
    if (!firebase.apps || firebase.apps.length === 0) {
        throw new Error('Firebase не ініціалізовано. Перезавантажте сторінку.');
    }
    
    try {
        // Get auth instance
        const authInstance = firebase.auth();
        if (!authInstance) {
            throw new Error('Firebase Authentication не доступна');
        }
        
        // Sign in with email and password
        const userCredential = await authInstance.signInWithEmailAndPassword(data.email, data.password);
        const user = userCredential.user;
        
        if (!user) {
            throw new Error('Не вдалося отримати дані користувача');
        }
        
        // Get ID token for authentication
        const token = await user.getIdToken();
        
        if (!token) {
            throw new Error('Не вдалося отримати токен автентифікації');
        }
        
        // Get user type from localStorage (set during registration) or default
        // Try to get from multiple possible storage locations
        const userType = localStorage.getItem(`userType_${user.uid}`) || 
                        localStorage.getItem('userType') || 
                        'user';
        
        return {
            success: true,
            token: token,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                userType: userType
            },
            message: 'Вхід успішний'
        };
    } catch (error) {
        // Handle Firebase errors
        let errorMessage = 'Невірний email або пароль';
        
        // Log error for debugging
        console.error('Login error:', error);
        
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Користувача з таким email не знайдено';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Невірний пароль';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Невірний формат email';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Акаунт заблоковано';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Помилка мережі. Перевірте інтернет-з\'єднання';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Занадто багато спроб. Спробуйте пізніше';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Невірний email або пароль';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Метод входу не дозволено. Зверніться до адміністратора';
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Firebase Auth State Observer
function setupAuthStateObserver() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase не завантажено, пропускаємо налаштування спостерігача');
        return;
    }
    
    if (!firebase.apps || firebase.apps.length === 0) {
        console.warn('Firebase не ініціалізовано, спробуємо пізніше...');
        // Retry after a short delay
        setTimeout(setupAuthStateObserver, 500);
        return;
    }
    
    try {
        const authInstance = firebase.auth();
        if (!authInstance) {
            console.error('Firebase Authentication не доступна');
            return;
        }
        
        authInstance.onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in
                user.getIdToken().then(function(token) {
                    // Update token if user is logged in
                    if (!localStorage.getItem('authToken') && !sessionStorage.getItem('authToken')) {
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userEmail', user.email);
                        localStorage.setItem('userId', user.uid);
                    }
                }).catch(function(error) {
                    console.error('Помилка отримання токену:', error);
                });
            } else {
                // User is signed out
                // Only clear tokens if we're not on login/register pages
                if (!window.location.pathname.includes('login.html') && 
                    !window.location.pathname.includes('register.html')) {
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                }
            }
        });
    } catch (error) {
        console.error('Помилка налаштування спостерігача автентифікації:', error);
    }
}

// Setup auth state observer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthStateObserver);
} else {
    setupAuthStateObserver();
}

// Wait for Firebase to be ready
function waitForFirebase(callback, maxAttempts = 10) {
    let attempts = 0;
    
    function checkFirebase() {
        attempts++;
        
        if (typeof firebase !== 'undefined' && 
            firebase.apps && 
            firebase.apps.length > 0 && 
            firebase.auth) {
            callback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkFirebase, 100);
        } else {
            console.error('Firebase не завантажився після', maxAttempts, 'спроб');
            if (document.getElementById('message')) {
                showMessage('Помилка завантаження Firebase. Перезавантажте сторінку.', 'error');
            }
        }
    }
    
    checkFirebase();
}

// Form Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase before setting up form handlers
    waitForFirebase(function() {
        // Business Registration Form
        const businessForm = document.getElementById('businessForm');
        if (businessForm) {
            businessForm.addEventListener('submit', (e) => handleRegistration(e, 'business'));
        }
        
        // Blogger Registration Form
        const bloggerForm = document.getElementById('bloggerForm');
        if (bloggerForm) {
            bloggerForm.addEventListener('submit', (e) => handleRegistration(e, 'blogger'));
        }
        
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    });
});

// Check if user is logged in
function isLoggedIn() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        return true;
    }
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Get current user
function getCurrentUser() {
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        return firebase.auth().currentUser;
    }
    return null;
}

// Logout function
async function logout() {
    try {
        // Sign out from Firebase
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            await firebase.auth().signOut();
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userType');
        window.location.href = 'index.html';
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isLoggedIn,
        getAuthToken,
        logout,
        registerUser,
        loginUser
    };
}

