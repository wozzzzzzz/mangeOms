import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4rQohVwatrm-0E9L9VWsiZ0Sw6B7pFtA",
  authDomain: "mgoms-66abf.firebaseapp.com",
  projectId: "mgoms-66abf",
  storageBucket: "mgoms-66abf.appspot.com",
  messagingSenderId: "999400163335",
  appId: "1:999400163335:web:fb8cd6531cbf8befb782a2",
  measurementId: "G-5SEFVJP1P9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };