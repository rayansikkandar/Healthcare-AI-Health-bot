// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBpJgEz3cpgGDKVnkmO7Q01Wd2-65OQUZA",
  authDomain: "healthscore-9c09c.firebaseapp.com",
  projectId: "healthscore-9c09c",
  storageBucket: "healthscore-9c09c.firebasestorage.app",
  messagingSenderId: "414329014449",
  appId: "1:414329014449:web:068b898ff1fd424aa0ba90",
  measurementId: "G-VVPLSZGFGH"
};

// Initialize Firebase
let app;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { app, analytics }; 