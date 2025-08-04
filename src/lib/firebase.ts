import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAgk4fYtSrtLsPq2CBvr507lWm7oA-VuS8",
  authDomain: "amazing-source-441905-r3.firebaseapp.com",
  projectId: "amazing-source-441905-r3",
  storageBucket: "amazing-source-441905-r3.firebasestorage.app",
  messagingSenderId: "451777399679",
  appId: "1:451777399679:android:c2a05626a725ac78a0684a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (conditionally for web)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;