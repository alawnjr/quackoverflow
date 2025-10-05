// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_HxTuqbR87-wZ5xyGsObbvV6reD3XAcI",
  authDomain: "generated-armor-461702-v2.firebaseapp.com",
  projectId: "generated-armor-461702-v2",
  storageBucket: "generated-armor-461702-v2.firebasestorage.app",
  messagingSenderId: "917978023626",
  appId: "1:917978023626:web:c1d60de12d23e19484d633",
  measurementId: "G-QM116P231F"
};

// Initialize Firebase
// Check if Firebase app is already initialized to avoid duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on client-side
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { app, analytics };

