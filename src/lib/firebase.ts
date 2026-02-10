import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, onDisconnect } from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database instance
export const database = getDatabase(app);

// Helper functions
export const dbRef = (path: string) => ref(database, path);
export const dbSet = set;
export const dbGet = get;
export const dbUpdate = update;
export const dbRemove = remove;
export const dbOnValue = onValue;
export const dbOnDisconnect = onDisconnect;

export default app;
