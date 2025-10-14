import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";

import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAhYqkRn5rT4nhky9tQFXA2d_NNagvnw18",
  authDomain: "kk-mishra-test.firebaseapp.com",
  projectId: "kk-mishra-test",
  storageBucket: "kk-mishra-test.firebasestorage.app",
  messagingSenderId: "846351551174",
  appId: "1:846351551174:web:dd8c2b2949fc7b1c20e5c7",
  measurementId: "G-VS9S3V0M0R"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

