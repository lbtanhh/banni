import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZ5i2H5EDJvwA44-8Osj8shsB3ENVcnx8",
  authDomain: "bannie-e5654.firebaseapp.com",
  projectId: "bannie-e5654",
  storageBucket: "bannie-e5654.firebasestorage.app",
  messagingSenderId: "172502210947",
  appId: "1:172502210947:web:821fdd6fcfbfa67b4cbeb6",
  measurementId: "G-LDMV0YSRRW",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
