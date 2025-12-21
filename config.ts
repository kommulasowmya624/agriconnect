// Firebase Configuration
// Values loaded from .env.local (not committed to git)
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCQGwqm7XI2CoHlFoXIBgd0KPqua9Ijyr0",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agriconnect-18c94.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agriconnect-18c94",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agriconnect-18c94.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "6646490296",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:6646490296:web:cf7156fbc41f24afd5004d"
};

// OpenWeatherMap Configuration
export const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "cdce5979270bcd697a41e74ddd16ad6a";

