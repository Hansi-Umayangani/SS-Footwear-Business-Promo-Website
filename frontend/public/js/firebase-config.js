// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIatuhmRh30XNBK0xXdIjywKHBBQnkeRs",
  authDomain: "ss-footwear-promo-websit-5e578.firebaseapp.com",
  projectId: "ss-footwear-promo-websit-5e578",
  storageBucket: "ss-footwear-promo-websit-5e578.firebasestorage.app",
  messagingSenderId: "457192933751",
  appId: "1:457192933751:web:e5339cf6355f374ac87972"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
