// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvP8Eqkqrn4uiG7l4NKydV5F6ghD-1vZ0",
  authDomain: "equapay.firebaseapp.com",
  projectId: "equapay",
  storageBucket: "equapay.appspot.com",
  messagingSenderId: "590020881348",
  appId: "1:590020881348:web:39b05879eca488fcb8d291",
  measurementId: "G-8ZN21WTX85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase Auth with AsyncStorage Persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const database = getDatabase(app);

export { auth, database };