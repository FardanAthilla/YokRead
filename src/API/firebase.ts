import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjw5RCM3B1UYxVYhM3UvFQhfrchyOB2AA",
  authDomain: "yokread.firebaseapp.com",
  projectId: "yokread",
  storageBucket: "yokread.firebasestorage.app",
  messagingSenderId: "2962180391",
  appId: "1:2962180391:web:a8ccb6a6643f8d9efc8102",
  measurementId: "G-GM33X2C17X"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
