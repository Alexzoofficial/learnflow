// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAfy2fyJYLDA3WjK-VAo_zGgrYcxjkzws",
  authDomain: "alexzo.firebaseapp.com",
  databaseURL: "https://alexzo-default-rtdb.firebaseio.com",
  projectId: "alexzo",
  storageBucket: "alexzo.firebasestorage.app",
  messagingSenderId: "685761333626",
  appId: "1:685761333626:web:f7f62901121ac9dbcd6ec3",
  measurementId: "G-SCC04DDNKW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
