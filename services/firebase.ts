// FIX: Declare the global firebase property on the Window object to resolve TypeScript errors
// related to using the Firebase SDK via script tags.
declare global {
  interface Window {
    firebase: any;
  }
}

// -----------------------------------------------------------------------------
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// IMPORTANT: ACTION REQUIRED
//
// You must replace the placeholder values below with your own Firebase project's
// configuration object. The application will not work until you do this.
//
// HOW TO GET YOUR FIREBASE CONFIG:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project (or create a new one).
// 3. Go to Project settings (click the ⚙️ gear icon).
// 4. In the "General" tab, scroll down to the "Your apps" section.
// 5. Select your web app (or create a new one).
// 6. Under "SDK setup and configuration", select the "Config" option.
// 7. Copy the entire `firebaseConfig` object and paste it below.
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
// -----------------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: "AIzaSyCYMhLXJ_E5z4gTqxLvBpz7_QqGBR-dynk",
  authDomain: "booksalon-2301f.firebaseapp.com",
  projectId: "booksalon-2301f",
  storageBucket: "booksalon-2301f.firebasestorage.app",
  messagingSenderId: "1061666488957",
  appId: "1:1061666488957:web:85d09809df2949fa0a2714",
  measurementId: "G-VJEVHFB79J"
};

// Initialize Firebase
if (!window.firebase.apps.length) {
  // We initialize with a config object, which might be the placeholder.
  // The app's entry point (index.tsx) will check if the config is valid
  // before attempting to render the main application and use Firebase services.
  window.firebase.initializeApp(firebaseConfig);
}

export const auth = window.firebase.auth();
export const db = window.firebase.firestore();
export const firestore = window.firebase.firestore;
