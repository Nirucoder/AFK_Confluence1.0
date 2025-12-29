import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBcMTfOjEZmmGzZH_KyEb8mx-i9HR2ViWw",
    authDomain: "crisisconnect-ef203.firebaseapp.com",
    projectId: "crisisconnect-ef203",
    storageBucket: "crisisconnect-ef203.appspot.com",
    appId: "1:256821886336:web:9a839a661f8fca767e9565"
};

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
export const storage = getStorage(app);
