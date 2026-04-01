auth.onAuthStateChanged((user) => {
    if (user) {
        db.ref('users/' + user.uid).once('value').then((snapshot) => {
            const data = snapshot.val();
            if (data.role === 'driver' && data.isVerified === false) {
                // Redirect them to a "Waiting for Approval" screen
                window.location.href = "pending-approval.html";
            }
        });
    }
});