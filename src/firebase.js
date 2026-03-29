// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PASTE YOUR COPIED OBJECT HERE
  apiKey: "AIzaSyCtMhjHG947y5DWnybLZHCz-r8LN3mdFZE",
  authDomain: "my-course-portal.firebaseapp.com",
  projectId: "my-course-portal",
  storageBucket: "my-course-portal.firebasestorage.app",
  messagingSenderId: "140273829236",
  appId: "1:140273829236:web:818065e16e041cf1ded821"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);