// --- 1. ADMIN AUTH GUARD ---
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const snap = await db.ref('users/' + user.uid).once('value');
        const data = snap.val();

        if (!data || data.role !== 'admin') {
            console.error("Access Denied: User is not an admin.");
            window.location.href = "index.html";
            return;
        }

        console.log("✅ Admin verified:", data.name);
        initAdminDashboard();
    } catch (error) {
        console.error("Auth Error:", error);
    }
});

// --- 2. INITIALIZATION ---
function initAdminDashboard() {
    loadStats();
    loadUsers();
    startLiveClock();
}

function startLiveClock() {
    setInterval(() => {
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.innerText = new Date().toLocaleTimeString();
    }, 1000);
}

// --- 3. LOAD STATISTICS ---
function loadStats() {
    // Total Users Count
    db.ref('users').on('value', (snap) => {
        const users = snap.val() || {};
        const count = Object.keys(users).length;
        const el = document.getElementById('total-users');
        if (el) el.innerText = count;
    });

    // Total Rides & Revenue
    // Note: I'm using a flat check. If your 'completed_rides' is nested by UID, 
    // this loop handles both flat and nested structures.
    db.ref('completed_rides').on('value', (snap) => {
        const data = snap.val() || {};
        let totalRides = 0;
        let totalRevenue = 0;

        Object.values(data).forEach(item => {
            // Check if this is a ride object or a collection of rides for a user
            if (item.status === "Completed") {
                totalRides++;
                totalRevenue += parseInt(item.amount || item.price || 0);
            } else if (typeof item === 'object') {
                // If nested by UserID
                Object.values(item).forEach(ride => {
                    if (ride.status === "Completed") {
                        totalRides++;
                        totalRevenue += parseInt(ride.amount || ride.price || 0);
                    }
                });
            }
        });

        const ridesEl = document.getElementById('total-rides');
        const revEl = document.getElementById('total-revenue');
        if (ridesEl) ridesEl.innerText = totalRides;
        if (revEl) revEl.innerText = "₦" + totalRevenue.toLocaleString();
    });
}

// --- 4. LOAD USERS TABLE ---
function loadUsers() {
    const table = document.getElementById('admin-user-table');
    if (!table) return;

    db.ref('users').on('value', (snap) => {
        const users = snap.val() || {};
        table.innerHTML = ""; // Clear existing rows

        if (Object.keys(users).length === 0) {
            table.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:50px;'>No users found in database.</td></tr>";
            return;
        }

        Object.keys(users).forEach(uid => {
            const user = users[uid];
            
            // Generate row HTML
            const row = `
                <tr>
                    <td style="font-family:monospace; color:var(--gr-primary)">#${uid.slice(0, 6)}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&color=fff" style="width:30px; border-radius:8px;">
                            <b>${user.name || "Unnamed User"}</b>
                        </div>
                    </td>
                    <td><span class="role-tag ${user.role || 'passenger'}">${user.role || 'User'}</span></td>
                    <td><span class="status-tag online">${user.banned ? 'Banned' : 'Active'}</span></td>
                    <td class="action-cell">
                        <button class="action-btn" onclick="toggleDropdown(event)">⋮</button>
                        <div class="action-dropdown">
                            <div class="drop-item" onclick="triggerAction('edit', '${uid}', '${user.name || ''}')">
                                <i class="fas fa-user-pen"></i> Edit Profile
                            </div>
                            <div class="drop-item ban" onclick="triggerAction('ban', '${uid}')">
                                <i class="fas fa-user-slash"></i> Ban Account
                            </div>
                            <div class="drop-item delete" onclick="triggerAction('delete', '${uid}')">
                                <i class="fas fa-trash"></i> Terminate
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            table.insertAdjacentHTML('beforeend', row);
        });
    });
}

// --- 5. DYNAMIC PROMPT & ACTIONS ---
function triggerAction(type, uid, extra = "") {
    const promptOverlay = document.getElementById('custom-prompt');
    const confirmBtn = document.getElementById('prompt-confirm-action');
    const inputField = document.getElementById('prompt-input-field');

    // Default UI Reset
    inputField.classList.add('hidden');
    document.getElementById('prompt-icon').className = "fas fa-question";

    if (type === 'edit') {
        document.getElementById('prompt-title').innerText = "Update Identity";
        document.getElementById('prompt-message').innerText = "Change the displayed name for this account.";
        document.getElementById('prompt-icon').className = "fas fa-user-pen";
        inputField.classList.remove('hidden');
        inputField.value = extra;
        
        confirmBtn.onclick = () => {
            const newName = inputField.value.trim();
            if (newName) {
                db.ref('users/' + uid).update({ name: newName })
                    .then(() => { closePrompt(); popup("Updated", "User name changed successfully."); });
            }
        };
    } 
    else if (type === 'ban') {
        document.getElementById('prompt-title').innerText = "Ban User?";
        document.getElementById('prompt-message').innerText = "This user will no longer be able to use GoRïde services.";
        document.getElementById('prompt-icon').className = "fas fa-user-slash";
        
        confirmBtn.onclick = () => {
            db.ref('users/' + uid).update({ banned: true })
                .then(() => { closePrompt(); popup("Success", "User has been banned."); });
        };
    } 
    else if (type === 'delete') {
        document.getElementById('prompt-title').innerText = "Terminate Account";
        document.getElementById('prompt-message').innerText = "Are you sure? This action is permanent.";
        document.getElementById('prompt-icon').className = "fas fa-exclamation-triangle";
        
        confirmBtn.onclick = () => {
            db.ref('users/' + uid).remove()
                .then(() => { closePrompt(); popup("Deleted", "Account removed from database."); });
        };
    }

    promptOverlay.classList.remove('hidden');
    promptOverlay.style.display = 'flex';
}

// --- 6. LOGOUT ---
function initiateLogout() {
    const promptOverlay = document.getElementById('custom-prompt');
    document.getElementById('prompt-title').innerText = "Exit GoRïde?";
    document.getElementById('prompt-message').innerText = "Are you sure you want to logout, Heritage?";
    document.getElementById('prompt-icon').className = "fas fa-sign-out-alt";
    document.getElementById('prompt-input-field').classList.add('hidden');

    document.getElementById('prompt-confirm-action').onclick = () => {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    };

    promptOverlay.classList.remove('hidden');
    promptOverlay.style.display = 'flex';
}

// --- 7. UI HELPERS ---
function toggleDropdown(e) {
    e.stopPropagation();
    const dropdown = e.currentTarget.nextElementSibling;
    // Close others
    document.querySelectorAll('.action-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

// Close dropdowns on outside click
document.addEventListener('click', () => {
    document.querySelectorAll('.action-dropdown').forEach(d => d.classList.remove('show'));
});

function closePrompt() {
    const promptOverlay = document.getElementById('custom-prompt');
    promptOverlay.classList.add('hidden');
    promptOverlay.style.display = 'none';
}

// Your existing Popup function (assuming it's defined elsewhere, calling it here)
// If it's not defined, make sure you have the popup(title, message) code present.




function popup(title, message) {
    const alertOverlay = document.getElementById('custom-alert');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const progressBar = document.getElementById('alert-progress-bar');
    const alertCard = alertOverlay.querySelector('.alert-card');

    // 1. Set Content
    alertTitle.innerText = title;
    alertMessage.innerText = message;

    // 2. Reset Progress Bar
    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';

    // 3. Show Overlay
    alertOverlay.classList.remove('hidden');
    alertOverlay.style.display = 'block'; // Block or Flex depending on your layout

    // 4. Force Animation Trigger
    // Removing and re-adding the animation class ensures it slides every time
    alertCard.style.animation = 'none';
    alertCard.offsetHeight; /* trigger reflow */
    alertCard.style.animation = null; 

    // 5. Start Progress Bar Depletion
    setTimeout(() => {
        progressBar.style.transition = 'width 3s linear';
        progressBar.style.width = '0%';
    }, 10);

    // 6. Auto-Close
    setTimeout(() => {
        closeAlert();
    }, 3000);
}

function closeAlert() {
    const alertOverlay = document.getElementById('custom-alert');
    const alertCard = alertOverlay.querySelector('.alert-card');
    
    // Add a fade-out effect before hiding
    alertCard.style.transform = 'translateX(120%)';
    alertCard.style.transition = 'transform 0.4s ease-in, opacity 0.4s';
    alertCard.style.opacity = '0';

    setTimeout(() => {
        alertOverlay.classList.add('hidden');
        alertOverlay.style.display = 'none';
        // Reset styles for next time
        alertCard.style.transform = '';
        alertCard.style.opacity = '';
        alertCard.style.transition = '';
    }, 400);
}