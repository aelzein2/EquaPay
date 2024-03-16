import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
//import {initializeAuth, getReactNativePersistence } from 'firebase/auth'; --> used for presistence login, dont need this now as we are developing
import {getFirestore} from 'firebase/firestore'
import 'firebase/compat/storage'
//import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; --> used for persistance login, dont need this now as we are developing

import { getFunctions, httpsCallable } from 'firebase/functions';

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
 const functions = getFunctions(app);
 const auth = getAuth(app);
 
 /* Initialize Firebase Auth with AsyncStorage Persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  }); */
  
  const firestore = getFirestore(app);

 export {auth, firestore, functions};