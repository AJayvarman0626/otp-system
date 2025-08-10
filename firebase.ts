// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyAQS0qBycmt68WujTuiSIXWgZB5NuxapGk",
  authDomain: "otp-system-8ad37.firebaseapp.com",
  projectId: "otp-system-8ad37",
  storageBucket: "otp-system-8ad37.firebasestorage.app",
  messagingSenderId: "532503452735",
  appId: "1:532503452735:web:67b43bc8c19edc92caac8a",
  measurementId: "G-SS3Y0W6PY9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };
