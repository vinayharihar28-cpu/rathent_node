// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARaFJz-69HsDLKu5V6OdPq_tYdaD9z0lI",
  authDomain: "rathent-1.firebaseapp.com",
  databaseURL: "https://rathent-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rathent-1",
  storageBucket: "rathent-1.firebasestorage.app",
  messagingSenderId: "149146522054",
  appId: "1:149146522054:web:af7b048c608b9ca6ed22c7",
  measurementId: "G-G6ZP5T6GGT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
