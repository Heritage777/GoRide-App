// // admin.js

// import { auth, db } from "./firebase-config.js"; // Adjust based on your setup
// import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";
// import { ref, get } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-database.js";

// // 1. Hide the body immediately so non-admins don't see a "flash" of the dashboard
// document.body.style.display = "none";

// onAuthStateChanged(auth, (user) => {
//     if (!user) {
//         // Not logged in? Boot them to index
//         window.location.href = 'index.html';
//     } else {
//         const userRef = ref(db, `users/${user.uid}/role`);
        
//         get(userRef).then((snapshot) => {
//             if (snapshot.exists() && snapshot.val() === 'admin') {
//                 // 2. Success! Show the page now that we know they are Heritage (Admin)
//                 document.body.style.display = "block";
//                 console.log("Welcome, Admin.");
                
//                 // Start your admin functions here
//                 initializeDashboard(); 
//             } else {
//                 // Not an admin? Redirect
//                 alert("Unauthorized Access: This area is restricted.");
//                 window.location.href = 'index.html';
//             }
//         }).catch((error) => {
//             console.error("Error verifying role:", error);
//             window.location.href = 'index.html';
//         });
//     }
// });

// function initializeDashboard() {
//     // Put all your table-fetching and clock logic here
//     updateLiveClock();
//     fetchUserRegistry();
// }