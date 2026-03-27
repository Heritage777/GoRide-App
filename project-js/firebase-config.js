// ./project-js/firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyAZMMp6r9Jr-6668CGhbXOfenWO4Reqb60",
  authDomain: "goride-app-bf879.firebaseapp.com",
  databaseURL: "https://goride-app-bf879-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "goride-app-bf879",
  storageBucket: "goride-app-bf879.firebasestorage.app",
  messagingSenderId: "291157709213",
  appId: "1:291157709213:web:ba47234ab22774a10c9f74"
};

// Initialize Firebase once for the WHOLE project
firebase.initializeApp(firebaseConfig);

// Define these globally so every other file can see them
const auth = firebase.auth();
const db = firebase.database();

console.log("Firebase Engine Started!");

