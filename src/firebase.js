import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB-DVKR_6PgidEt7smqiTUXpbLvBuq4fBg",
    authDomain: "landingpage-10420.firebaseapp.com",
    projectId: "landingpage-10420",
    storageBucket: "landingpage-10420.firebasestorage.app",
    messagingSenderId: "802825132220",
    appId: "1:802825132220:web:ea1843a054bcafa2f858b9",
    measurementId: "G-3RVDH1009D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
