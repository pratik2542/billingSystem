import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace this with your own Firebase project's configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyD8avGuGQAbNmF4I-8AqiYLjwFkhg60z78",
  authDomain: "billing-4bfed.firebaseapp.com",
  projectId: "billing-4bfed",
  storageBucket: "billing-4bfed.firebasestorage.app",
  messagingSenderId: "533111998504",
  appId: "1:533111998504:web:90de7f2501fe439404cd1d",
  measurementId: "G-TWDQH8CEFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services for use in other parts of the app
export { auth, db };
