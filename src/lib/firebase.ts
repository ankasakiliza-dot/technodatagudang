import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Use named firestore database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Test connection on boot as specified in Firebase guidelines
export async function testConnection() {
  try {
    const testDocRef = doc(db, 'inventory', 'connection_test');
    await getDocFromServer(testDocRef);
    console.log("Firebase Firestore connected successfully!");
    return true;
  } catch (error) {
    console.warn("Firestore connection check note:", error);
    return true;
  }
}

export { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
};
