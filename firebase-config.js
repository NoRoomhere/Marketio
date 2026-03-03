// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBryZxmfZm_fEoN3IU3uBYQWEglTWUmM6Q",
  authDomain: "marketio-56ec8.firebaseapp.com",
  projectId: "marketio-56ec8",
  storageBucket: "marketio-56ec8.firebasestorage.app",
  messagingSenderId: "560792008864",
  appId: "1:560792008864:web:20f7c34f9e873352a7f1c5",
  measurementId: "G-VFLTE6SR8D"
};

// Initialize Firebase with error handling
let firebaseApp;
let auth;

try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK не завантажено');
        throw new Error('Firebase SDK не завантажено');
    }
    
    // Check if Firebase is already initialized
    if (firebase.apps.length === 0) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
        firebaseApp = firebase.app();
    }
    
    // Initialize Firebase Authentication
    auth = firebase.auth();
    
    console.log('Firebase успішно ініціалізовано');
} catch (error) {
    console.error('Помилка ініціалізації Firebase:', error);
    // Show error to user if on login/register page
    if (document.getElementById('message')) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = 'Помилка завантаження Firebase. Перезавантажте сторінку.';
        messageEl.className = 'message error show';
    }
}

