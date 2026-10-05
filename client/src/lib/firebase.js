/* global firebase */
// Firebase config — same keys as the old app
const firebaseConfig = {
  apiKey: "AIzaSyBw8APb1ypdP0W1oAPAjrU8hkdf_d_qcYc",
  authDomain: "student-collab-25727.firebaseapp.com",
  projectId: "student-collab-25727",
  storageBucket: "student-collab-25727.firebasestorage.app",
  messagingSenderId: "1009326903589",
  appId: "1:1009326903589:web:a8537638ca222b4dcd0acc"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();   