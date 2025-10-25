import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 설정
export const firebaseConfig = {
  apiKey: "AIzaSyCYMhLXJ_E5z4gTqxLvBpz7_QqGBR-dynk",
  authDomain: "booksalon-2301f.firebaseapp.com",
  projectId: "booksalon-2301f",
  storageBucket: "booksalon-2301f.firebasestorage.app",
  messagingSenderId: "1061666488957",
  appId: "1:1061666488957:web:85d09809df2949fa0a2714",
  measurementId: "G-VJEVHFB79J"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
