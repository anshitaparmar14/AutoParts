// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAKQTY8mGBK-SHQb2GdMwbJASVDCqMsI7g",
    authDomain: "e-com-446d2.firebaseapp.com",
    projectId: "e-com-446d2",
    storageBucket: "e-com-446d2.firebasestorage.app",
    messagingSenderId: "506050008322",
    appId: "1:506050008322:web:6c005dea74064995729e1b"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Firebase services
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  // Collection references
  const ordersCollection = db.collection('orders');
  const customersCollection = db.collection('customers');
