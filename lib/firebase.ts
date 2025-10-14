import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";

import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC7j43oGfB8p4Gbqoc5H0fcVR4K_Sfy7FM",
  authDomain: "abc-classes-18b7a.firebaseapp.com",
  projectId: "abc-classes-18b7a",
  storageBucket: "abc-classes-18b7a.firebasestorage.app",
  messagingSenderId: "851915301949",
  appId: "1:851915301949:web:f47e201ecb70a54f643654",
  measurementId: "G-KJH30Q1254"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

