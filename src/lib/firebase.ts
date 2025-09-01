// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, analytics };