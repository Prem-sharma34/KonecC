
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Message cleanup function
export const setupMessageCleanup = () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const q = query(collection(db, 'messages'), 
    where('timestamp', '<', threeDaysAgo));
  
  getDocs(q).then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      deleteDoc(doc.ref);
    });
  });
};
