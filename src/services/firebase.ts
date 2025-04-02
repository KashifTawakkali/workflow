import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDGiJuFb3brd9QpTJm973byQvOGNe6Nq1A",
  authDomain: "workflow-managment.firebaseapp.com",
  projectId: "workflow-managment",
  storageBucket: "workflow-managment.firebasestorage.app",
  messagingSenderId: "176031294025",
  appId: "1:176031294025:web:6e9a664afdca9e0f9f5598",
  measurementId: "G-JEE5HXDJ6H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure auth persistence
auth.useDeviceLanguage();

// Export services
export { auth, db, analytics };

// Export app as default
export default app; 