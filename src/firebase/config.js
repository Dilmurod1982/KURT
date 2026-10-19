import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB-wACOr45as1sz3L4IRohMVz-so4J5ZQw",
    authDomain: "kurt-a7687.firebaseapp.com",
    projectId: "kurt-a7687",
    storageBucket: "kurt-a7687.firebasestorage.app",
    messagingSenderId: "819391312926",
    appId: "1:819391312926:web:80e0c5f26ef8aec72d6a0f"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");