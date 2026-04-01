//SIGNUP LOGIC
const signupBtn = document.getElementById("signupButton");
if (signupBtn) {
  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passInput = document.getElementById("signup-pass");
    const confirmInput = document.getElementById("signup-confirm");

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!fullName || !email || !password) {
      popup("Empty field(s)", "All fields are mandatory");
      displayPage(signup);
      return;
    }

    if (fullName.length < 3) {
      popup("Too short", "Full name must be at least 3 characters.");
      return;
    }

    const namePattern = /^[A-Za-z]{2,}\s[A-Za-z]{2,}$/;
    if (!namePattern.test(fullName)) {
      popup("2 names required", "Please enter your first and last name.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      popup("Invalid Email", "Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      popup("Too short", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      popup("Different Passwords", "Passwords do not match.");
      return;
    }

    signupBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating Account...`;
    signupBtn.disabled = true;

    try {
      await registerPassenger(email, password, fullName);

      nameInput.value = "";
      emailInput.value = "";
      passInput.value = "";
      confirmInput.value = "";

      passInput.type = "password";
      confirmInput.type = "password";

      console.log("Signup successful and fields cleared.");
    } catch (error) {
      console.error("Signup failed:", error);
      popup("Signup Error", error.message || "Failed to create account.");
    } finally {
      signupBtn.innerHTML = `Register as Passenger`;
      signupBtn.disabled = false;
    }
  });
}

function registerPassenger(email, password, fullName) {
  return auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("AUTH SUCCESS");
      const userId = userCredential.user.uid;

      return db.ref("users/" + userId).set({
        name: fullName,
        email: email,
        role: "passenger",
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    })
    .then(() => {
      console.log("DATABASE WRITE SUCCESS");
      alert(`Signup Successful, ${fullName}!`);
      displayPage(loginPage);
    })
    .catch((error) => {
      console.error("FAILED OPERATION:", error.code, error.message);
      alert(error.message);
      throw error;
    });
}

//HIDE AND SHOW PASSWORD
function toggleSignupPassword(inputId, iconElement) {
  const passwordField = document.getElementById(inputId);

  if (!passwordField) {
    console.error("Could not find input with ID:", inputId);
    return;
  }

  if (passwordField.type === "password") {
    passwordField.type = "text";

    // 3. Update the icon look
    iconElement.classList.remove("fa-eye");
    iconElement.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";

    // 4. Reset the icon look
    iconElement.classList.remove("fa-eye-slash");
    iconElement.classList.add("fa-eye");
  }
}

// DRIVER SIGNUP HIDE AND SHOW PASSWORD
document.querySelectorAll(".password-container .toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const container = this.closest(".password-container");
      const input = container.querySelector("input");

      if (input.type === "password") {
        input.type = "text";
        this.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        this.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

//SHOW AND HIDE PASSWORD FOR LOGIN
document.querySelectorAll(".password-container .toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const container = this.closest(".password-container");
      const input = container.querySelector("login-pass");

      if (input.type === "password") {
        input.type = "text";
        this.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        this.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  });

//FORGOT PASSWORD LOGIC
function handlePasswordReset() {
  const email = document.getElementById("reset-email").value.trim();
  const resetPassword = document.getElementById("reset-password-btn");

  if (!email) {
    popup("Missing Email", "Please enter your email address.");
    displayPage(forgotPassword);
    email = "";
    return;
  }

  // 2. Firebase Reset Call
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      // Success!
      popup("Success", `Password reset link sent to ${email}`);
      // Move back to login after a delay
      setTimeout(() => {
        displayPage(loginPage);
      }, 3000);
    })
    .catch((error) => {
      // Handle Errors
      let errorMessage = "Could not send reset email.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }

      popup("Reset Failed", errorMessage);
      console.error(error.message);
    });
}
resetPassword.addEventListener("click", handlePasswordReset);

//LOGIN LOGIC
async function handleLogin() {
  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-pass");
  const loginButton = document.getElementById("loginButton");
  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    popup("Missing Info", "Please enter both email and password.");
    return;
  }

  // 2. UI Feedback
  loginButton.innerText = "Verifying...";
  loginButton.disabled = true;

  // 3. Firebase Auth Call
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;

      // 4. Fetch User Data from 'users' path
      db.ref("users/" + userId)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();

          if (!userData) {
            popup("Error", "No user data found in database.");
            resetLoginButton();
            return;
          }

          // SUCCESS: CLEAR THE FIELDS HERE
          emailInput.value = "";
          passInput.value = "";

          const fullName = userData.name || "User";
          const role = userData.role;

          // 6. Update the Avatar/Name (DD and Dele Dele)
          updateDriverProfile(fullName);

          // 7. Role-Based Routing
          if (role === "admin") {
            popup(`Welcome, ${fullName}!`, "Loading Admin Dashboard...");
            setTimeout(() => {
              // displayPage(adminDashboard);
              // adminDashboard.style.display = "flex";
              window.location.href = "admin.html";
              initAdminDashboard();
            }, 1200);
          } else if (role === "driver") {
            // if (role === 'driver') {
            popup(`Welcome, ${fullName}!`, "Loading Driver Dashboard...");
            setTimeout(() => {
              displayPage(driverDashboard);
              driverDashboard.style.display = "grid";
            }, 1200);
          } else if (role === "passenger") {
            popup(`Welcome, ${fullName}!`, "Loading Passenger Dashboard...");
            setTimeout(() => {
              displayPage(passengerDashboard);
            }, 1200);
          } else {
            popup("Access Denied", "Account role is undefined.");
            resetLoginButton();
          }
        });
      loginButton.innerHTML = `<button type="submit" class="signup-submit-btn" id="loginButton">
                Log In to GoRïde
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M472-110v-118h260v-504H472v-118h260q49.7 0 83.85 34.15Q850-781.7 850-732v504q0 49.7-34.15 83.85Q781.7-110 732-110H472ZM369-264l-84-82 75-75H110v-118h250l-75-75 84-82 215 216-215 216Z"/></svg>
            </button>`;
      loginButton.disabled = false;
    })
    .catch((error) => {
      resetLoginButton();
      popup("Login Failed", error.message);
    });

  function resetLoginButton() {
    loginButton.innerText = "Log In";
    loginButton.disabled = false;
  }
}
loginButton.addEventListener("click", handleLogin);

//GOOGLE LOGIN
function handleGoogleLogin() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const googleButton = document.getElementById("googleButton");
  auth
    .signInWithPopup(googleProvider)
    .then((result) => {
      const user = result.user;
      const isNewUser = result.additionalUserInfo.isNewUser;

      if (isNewUser) {
        db.ref("users/" + user.uid).set({
          name: user.displayName,
          email: user.email,
          role: "passenger",
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        });
      }

      const firstName = user.displayName.split(" ")[0];
      popup(`Welcome, ${firstName}!`, "Google Login Successful");

      setTimeout(() => {
        if (typeof displayPage === "function") displayPage(passengerDashboard);
      }, 1500);
    })
    .catch((error) => {
      console.error("Google Auth Error:", error.code);

      if (error.code === "auth/popup-closed-by-user") {
        popup("Login cancelled. Please try again.", "warning", "Cancelled");
      } else {
        popup("Google Login Failed", error.message);
      }
    });
}
googleButton.addEventListener("click", handleGoogleLogin);

// PASSENGER DASHBOARD PROFILE
function updateDashboardProfile() {
  const user = auth.currentUser;

  if (user) {
    const userId = user.uid;

    db.ref("users/" + userId)
      .once("value")
      .then((snapshot) => {
        const userData = snapshot.val();

        if (userData && userData.name) {
          const fullName = userData.name.trim();

          const nameParts = fullName.toLowerCase().split(/\s+/);
          const titleCaseName = nameParts
            .map((part) => {
              return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join(" ");

          let initials = "";
          if (nameParts.length >= 2) {
            initials =
              nameParts[0].charAt(0) +
              nameParts[nameParts.length - 1].charAt(0);
          } else {
            initials = nameParts[0].charAt(0);
          }

          const nameElement = document.querySelector(".u-name");
          const avatarElement = document.querySelector(".avatar-circle");

          if (nameElement) nameElement.innerText = titleCaseName;
          if (avatarElement) avatarElement.innerText = initials.toUpperCase();

          const emailInput = document.getElementById("login-email");
          const passInput = document.getElementById("login-pass");
          if (emailInput) emailInput.value = "";
          if (passInput) passInput.value = "";

          console.log(`Dashboard personalized for: ${titleCaseName}`);
        }
      })
      .catch((error) => {
        console.error("Firebase Profile Error:", error);
      });
  }
}
auth.onAuthStateChanged((user) => {
  if (user) {
    updateDashboardProfile();
  } else {
    console.log("Waiting for login...");
  }
});

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User detected:", user.displayName);

    const nameToUse = user.displayName || "New User";

    updateDriverProfile(nameToUse);
  } else {
    console.log("No user logged in.");
  }
});

//CREATE DRIVER ACCOUNT
const driverForm = document.getElementById("driver-onboarding-view");

if (driverForm) {
  driverForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector(".signup-submit-btn");

    const fNameInput = document.getElementById("driverFirstName");
    const lNameInput = document.getElementById("driverLastName");
    const emailInput = document.getElementById("driverEmail");
    const passInput = document.getElementById("driverPassword");
    const confirmInput = document.getElementById("driverConfirm");
    const termsCheck = document.getElementById("dr-terms-check");

    const fName = fNameInput.value.trim();
    const lName = lNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!fName || !lName || !email || !password) {
      popup("Empty Field(s)", "All fields are mandatory!");
      return;
    }

    if (password !== confirmPassword) {
      popup("Mismatch", "Passwords do not match.");
      return;
    }

    if (!termsCheck.checked) {
      popup("Terms Required", "Please accept the Terms & Conditions.");
      return;
    }

    const fullName = fName + " " + lName;

    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating account...`;
    btn.disabled = true;

    try {
      await registerDriver(email, password, fullName);

      popup("Account Created", "Continue driver registration");

      fNameInput.value = "";
      lNameInput.value = "";
      emailInput.value = "";
      passInput.value = "";
      confirmInput.value = "";
      termsCheck.checked = false;

      setTimeout(() => {
        displayPage(driverRegistration);
      }, 1500);
    } catch (error) {
      popup("Signup Error", error.message);
    }

    // Reset button
    btn.innerHTML = "Create Account";
    btn.disabled = false;
  });
}

//REGISTER THE DRIVERS
function registerDriver(email, password, fullName) {
  return auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;

      return db.ref("users/" + userId).set({
        name: fullName,
        email: email,
        role: "driver",
        profileComplete: false, // 🔥 IMPORTANT
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    });
}

function completeDriverRegistration(extraData) {
  const user = auth.currentUser;
  if (!user) return;

  db.ref("users/" + user.uid)
    .update({
      ...extraData,
      profileComplete: true,
    })
    .then(() => {
      popup("Registration Complete", "Welcome Driver!");

      setTimeout(() => {
        displayPage(driverDashboard);
      }, 1500);
    });
}

//AVATAR LOGIC
function updateDriverProfile(fullName) {
  const avatarDiv = document.getElementById("userInitialsAvatar");
  const nameDisplay = document.getElementById("driverNameDisplay");

  if (!avatarDiv || !nameDisplay) return; // Safety check

  if (fullName && fullName.trim() !== "") {
    // Update the Name
    const titleCaseName = fullName
      .toLowerCase()
      .split(" ")
      .map((name) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
      })
      .join(" ");

    nameDisplay.innerText = `${titleCaseName}`;

    const names = fullName.trim().split(/\s+/);
    let initials = "";

    if (names.length >= 2) {
      initials = names[0].charAt(0) + names[names.length - 1].charAt(0);
    } else if (names.length === 1) {
      initials = names[0].charAt(0) + (names[0].charAt(1) || "");
    }

    avatarDiv.innerText = initials.toUpperCase();
  } else {
    nameDisplay.innerText = "Driver";
    avatarDiv.innerText = "GD";
  }
}

// SIGNING IN DRIVERS
function submitApplication() {
  const event = window.event;
  if (event) event.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    popup("Error", "No active session found. Please sign up again.");
    return;
  }

  const driverData = {
    fullName: document.getElementById("driverName").value.trim(),
    phone: document.getElementById("dr-phone").value.trim(),
    carModel: document.getElementById("dr-car-model").value.trim(),
    carYear: document.getElementById("dr-car-year").value.trim(),
    plateNumber: document.getElementById("dr-plate").value.trim(),
    licenseId: document.getElementById("dr-license-id").value.trim(),
    registrationDate: firebase.database.ServerValue.TIMESTAMP,
    status: "pending_review",
  };

  if (Object.values(driverData).some((val) => val === "")) {
    popup("Missing Info", "Please fill all fields before submitting.");
    return;
  }

  const btn = document.querySelector(".driver-submit-btn");
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Finalizing...`;
  btn.disabled = true;

  db.ref("registered_drivers/" + user.uid)
    .set(driverData)
    .then(() => {
      popup("Registration complete!", "Start earning with GoRïde");

      setTimeout(() => {
        removeCurrentDisplay(driverRegistration);
        displayPage(loginPage);
        //  showSection(loginPage)
      }, 2000);
    })
    .catch((error) => {
      console.error("Storage Error:", error);
      popup("Error", "Could not save registration details.");
      btn.disabled = false;
      btn.innerHTML = "Submit Application";
    });
}

//LOG OUT LOGIC
function initiateLogout() {
  const promptBox = document.getElementById("custom-prompt");
  const title = document.getElementById("prompt-title");
  const msg = document.getElementById("prompt-message");

  if (
    typeof driverDashboard !== "undefined" &&
    driverDashboard.style.display !== "none"
  ) {
    title.innerText = "Driver Exit";
    msg.innerText = "Are you sure you want to go offline and logout?";
  } else {
    title.innerText = "Exit GoRïde?";
    msg.innerText = "Are you sure you want to log out of your account?";
  }

  promptBox.classList.remove("hidden");
  promptBox.style.display = "flex";
}

async function executeLogout() {
  try {
    const promptBox = document.getElementById("custom-prompt");
    promptBox.classList.add("hidden");
    promptBox.style.display = "none";

    await auth.signOut();

    if (document.getElementById("driverNameDisplay"))
      document.getElementById("driverNameDisplay").innerText = "Loading...";
    if (document.getElementById("userInitialsAvatar"))
      document.getElementById("userInitialsAvatar").innerText = "--";

    const emailField = document.getElementById("login-email");
    const passField = document.getElementById("login-pass");
    if (emailField) emailField.value = "";
    if (passField) passField.value = "";

    displayPage(loginPage);

    console.log("Logged out successfully.");
  } catch (error) {
    console.error("Logout Error:", error);
  }
}

function cancelLogout() {
  const promptBox = document.getElementById("custom-prompt");
  promptBox.classList.add("hidden");
  promptBox.style.display = "none";
}

// DRIVER LOGOUT
function initiateDriverLogout() {
  if (isRideOngoing) {
    return popup(
      "⚠️ Active Ride",
      "Please complete your current trip before going offline.",
    );
  }

  const title = "Driver Exit";
  const msg =
    "Are you sure you want to go offline and stop receiving ride requests?";

  showDynamicPrompt("fas fa-power-off", title, msg, () => {
    executeDriverLogout();
  });
}

async function executeDriverLogout() {
  try {
    if (typeof db !== "undefined") {
      db.ref("active_requests").off();
      db.ref("completed_rides").off();
      db.ref("driver_profiles").off();
    }

    clearDriverUI();

    localStorage.removeItem("current_ride_data");
    isRideOngoing = false;

    if (typeof auth !== "undefined") {
      await auth.signOut();
    }

    // 5. REDIRECT TO LOGIN PAGE
    if (typeof displayPage === "function") {
      removeCurrentDisplay(driverDashboard);
      displayPage(loginPage);
    } else {
      document.getElementById("driverDashboard").style.display = "none";
      document.getElementById("loginPage").style.display = "block";
    }

    console.log("Driver session terminated. Redirected to login.");
  } catch (error) {
    console.error("Driver Logout Error:", error);
    popup("Error", "Logout failed. Please refresh the page.");
  }
}

function clearDriverUI() {
  // Reset Stat Cards to 0
  const statsCards = document.querySelectorAll(".gr-card h2");
  statsCards.forEach((card) => (card.innerText = "0"));

  if (statsCards[0]) statsCards[0].innerText = "₦0";

  const tableBody = document.getElementById("driver-request-body");
  if (tableBody) {
    tableBody.innerHTML = `<tr id="no-request-msg"><td colspan="4" style="text-align:center; padding: 40px; color: #666;">Offline...</td></tr>`;
  }

  const historyBody = document.getElementById("history-body");
  if (historyBody) historyBody.innerHTML = "";

  if (document.getElementById("driverNameDisplay"))
    document.getElementById("driverNameDisplay").innerText = "Loading...";
  if (document.getElementById("userInitialsAvatar"))
    document.getElementById("userInitialsAvatar").innerText = "--";
}

//PASSENGER DASHBOARD AVATAR
auth.onAuthStateChanged((user) => {
  if (user) {
    db.ref("users/" + user.uid)
      .once("value")
      .then((snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.name) {
          setupChatUser(userData.name);
        }
      });
  }
});

function setupChatUser(fullName) {
  const avatarElement = document.getElementById("chat-user-avatar");
  const nameElement = document.getElementById("chat-header-name");

  if (!avatarElement || !nameElement) {
    console.error("Chat elements not found in DOM");
    return;
  }

  nameElement.innerText = fullName;

  const nameParts = fullName.trim().split(/\s+/);
  let initials = "";

  if (nameParts.length >= 2) {
    initials =
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
  } else if (nameParts.length === 1) {
    initials = nameParts[0].charAt(0);
  }

  avatarElement.innerText = initials.toUpperCase();
}

let isRideOngoing = false;
let acceptanceRate = 70;

window.onload = () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;

      db.ref(`drivers/${uid}/acceptanceRate`).once("value", (snapshot) => {
        if (snapshot.exists()) {
          acceptanceRate = snapshot.val();
          const rateDisplay = document.querySelectorAll(".gr-card h2")[2];
          if (rateDisplay) rateDisplay.innerText = acceptanceRate + "%";
        }
      });

      const savedRide = localStorage.getItem("current_ride_data");
      if (savedRide) {
        const ride = JSON.parse(savedRide);
        isRideOngoing = true;

        startSimulatedRide(
          ride.name,
          ride.price,
          ride.dest,
          ride.id,
          ride.time,
        );
        popup("Welcome Back", "Resuming your active journey...");
      }

      initDriverRequestListener();
      initDriverStats(uid);
      loadRideHistory(uid);
    }
  });
};

function initDriverStats(uid) {
  const statsCards = document.querySelectorAll(".gr-card h2");
  if (statsCards.length < 2) return;

  db.ref(`completed_rides/${uid}`).on("value", (snapshot) => {
    const rides = snapshot.val();
    let totalEarnings = 0;
    let tripCount = 0;

    if (rides) {
      const today = new Date().toISOString().split("T")[0];
      Object.keys(rides).forEach((key) => {
        const ride = rides[key];
        if (ride.status === "Completed") {
          tripCount++;
          if (ride.completedAt && ride.completedAt.startsWith(today)) {
            totalEarnings += parseInt(ride.amount || ride.price || 0);
          }
        }
      });
    }
    statsCards[0].innerText = `₦${totalEarnings.toLocaleString()}`;
    statsCards[1].innerText = tripCount;
  });
}

function confirmBooking() {
  if (isRideOngoing)
    return popup("⚠️ Active Ride", "You already have an ongoing ride!");
  const dest = document.getElementById("destination").value;
  if (!dest) return popup("Missing Info", "Please enter a destination");

  showDynamicPrompt(
    "fas fa-route",
    "Confirm Broadcast",
    `Request a ride to ${dest}?`,
    () => executeBroadcast(dest),
  );
}

function executeBroadcast(dest) {
  const uid = auth.currentUser.uid;
  const passengerName =
    document.querySelector(".u-name")?.innerText || "Passenger";
  const randomPrice = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
  const requestId = "req_" + Date.now();
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rideData = {
    requestId: requestId,
    passengerName: passengerName,
    destination: dest,
    price: randomPrice,
    status: "Waiting...",
    timestamp: new Date().toISOString(),
    timeLabel: currentTime,
    passengerId: uid,
  };

  db.ref("active_requests/" + requestId).set(rideData);
  db.ref(`completed_rides/${uid}/${requestId}`)
    .set(rideData)
    .then(() => {
      popup("Broadcast Sent", "Finding a driver...");
      listenForRideAcceptance(requestId);
    });
}

function listenForRideAcceptance(requestId) {
  const uid = auth.currentUser.uid;
  const rideRef = db.ref("active_requests/" + requestId);
  rideRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data && data.status === "ongoing") {
      isRideOngoing = true;
      updateRowStatus(requestId, "Ongoing", "#f19e39");

      db.ref(`completed_rides/${uid}/${requestId}/status`).set("Ongoing");

      localStorage.setItem(
        "current_ride_data",
        JSON.stringify({
          id: requestId,
          name: data.passengerName,
          price: data.price,
          dest: data.destination,
          time: data.timeLabel,
        }),
      );

      popup("🚀 Driver Found", `Your trip to ${data.destination} has started!`);
      startSimulatedRide(
        data.passengerName,
        data.price,
        data.destination,
        requestId,
        data.timeLabel,
      );
      rideRef.off();
    }
  });
}

function initDriverRequestListener() {
  const tableBody = document.getElementById("driver-request-body");
  if (!tableBody) return;

  db.ref("active_requests").on("value", (snapshot) => {
    tableBody.innerHTML = "";
    const requests = snapshot.val();
    if (!requests) {
      tableBody.innerHTML = `<tr id="no-request-msg"><td colspan="4" style="text-align:center; padding: 40px; color: #666;">Waiting for new requests...</td></tr>`;
      return;
    }
    Object.keys(requests).forEach((key) => {
      const req = requests[key];
      if (req.status === "Waiting...") {
        const row = `
                    <tr id="${key}">
                        <td>${req.passengerName}</td>
                        <td>${req.destination}</td>
                        <td>₦${req.price.toLocaleString()}</td>
                        <td>
                            <button class="gr-mini-btn" onclick="triggerClaim('${key}', '${req.passengerName}', ${req.price}, '${req.destination}', '${req.timeLabel}')">
                                Claim Ride
                            </button>
                        </td>
                    </tr>`;
        tableBody.insertAdjacentHTML("afterbegin", row);
      }
    });
  });
}

function triggerClaim(id, name, price, dest, time) {
  if (isRideOngoing)
    return popup("⚠️ Busy", "You are currently in an active ride!");
  showDynamicPrompt(
    "fas fa-car",
    "Claim Ride",
    `Accept trip for ${name}?`,
    () => {
      executeClaim(id, name, price, dest, time);
    },
  );
}

function executeClaim(requestId, passengerName, price, destination, timeLabel) {
  const uid = auth.currentUser.uid;
  const rideRef = db.ref("active_requests/" + requestId);

  rideRef.transaction(
    (currentData) => {
      if (currentData && currentData.status === "Waiting...") {
        currentData.status = "ongoing";
        currentData.driverId = uid;
        return currentData;
      }
    },
    (error, committed, snapshot) => {
      if (committed && snapshot.val()) {
        isRideOngoing = true;
        updateAcceptanceRate(uid);
        localStorage.setItem(
          "current_ride_data",
          JSON.stringify({
            id: requestId,
            name: passengerName,
            price: price,
            dest: destination,
            time: timeLabel,
          }),
        );
        popup("✅ Ride Claimed", "Drive safely!");
        startSimulatedRide(
          passengerName,
          price,
          destination,
          requestId,
          timeLabel,
        );
      } else {
        popup("⚠️ Too Late", "Another driver picked this up.");
      }
    },
  );
}

function updateAcceptanceRate(uid) {
  if (acceptanceRate < 100) {
    acceptanceRate += 1;
    db.ref(`drivers/${uid}/acceptanceRate`).set(acceptanceRate);
  }
  const rateDisplay = document.querySelectorAll(".gr-card h2")[2];
  if (rateDisplay) rateDisplay.innerText = acceptanceRate + "%";
}

function loadRideHistory(uid) {
  const historyPageBody = document.getElementById("history-table-body");
  const dashboardBody = document.getElementById("history-body");

  db.ref(`completed_rides/${uid}`).on("value", (snapshot) => {
    const rides = snapshot.val();

    if (historyPageBody) historyPageBody.innerHTML = "";
    if (dashboardBody) dashboardBody.innerHTML = "";

    if (!rides) {
      const emptyRow = `
                <tr>
                    <td colspan="6" style="text-align:center; padding:20px; color:#666;">
                        No ride history yet
                    </td>
                </tr>
            `;
      if (historyPageBody) historyPageBody.innerHTML = emptyRow;
      if (dashboardBody) dashboardBody.innerHTML = emptyRow;
      return;
    }

    let index = 1;

    Object.keys(rides)
      .reverse()
      .forEach((key) => {
        const ride = rides[key];

        const statusColor =
          ride.status === "Completed"
            ? "lime"
            : ride.status === "Ongoing"
              ? "#f19e39"
              : "#888";

        const date = ride.timestamp
          ? new Date(ride.timestamp).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
          : "--";

        const time = ride.timeLabel || "--:--";

        const amount = `₦${parseInt(ride.price || ride.amount || 0).toLocaleString()}`;

        if (historyPageBody) {
          const row1 = `
                    <tr>
                        <td>${date}</td>
                        <td>${ride.passenger || ride.passengerName || "—"}</td>
                        <td>${ride.destination || "—"}</td>
                        <td>${amount}</td>
                        <td style="color:${statusColor}; font-weight:bold;">
                            ${ride.status || "—"}
                        </td>
                    </tr>
                `;
          historyPageBody.insertAdjacentHTML("beforeend", row1);
        }

        if (dashboardBody) {
          const row2 = `
                    <tr>
                        <td>${index++}</td>
                        <td>${date}</td>
                        <td>${time}</td>
                        <td>${ride.destination || "—"}</td>
                        <td>${amount}</td>
                        <td style="color:${statusColor}; font-weight:bold;">
                            ${ride.status || "—"}
                        </td>
                    </tr>
                `;
          dashboardBody.insertAdjacentHTML("beforeend", row2);
        }
      });
  });
}

function updateRowStatus(requestId, newStatus, color) {
  const statusCell = document.querySelector(`#hist_${requestId} .status-cell`);

  if (statusCell) {
    statusCell.innerText = newStatus;
    statusCell.style.color = color;
  }

  const uid = auth.currentUser.uid;
  db.ref(`completed_rides/${uid}/${requestId}/status`).set(newStatus);
}

function startSimulatedRide(name, price, destination, requestId, timeLabel) {
  const timer = document.getElementById("timer-seconds");
  const car = document.getElementById("moving-car");
  let time = 30;

  const countdown = setInterval(() => {
    time--;
    if (timer) timer.innerText = time;
    if (car) car.style.left = ((30 - time) / 30) * 100 + "%";
    if (time <= 0) {
      clearInterval(countdown);
      handleRideCompletion(name, price, destination, requestId);
    }
  }, 1000);
}

function handleRideCompletion(name, price, destination, requestId) {
  const uid = auth.currentUser.uid;
  popup("🏁 Arrived", "Trip completed!");
  isRideOngoing = false;
  localStorage.removeItem("current_ride_data");
  updateRowStatus(requestId, "Completed", "lime");

  db.ref("active_requests/" + requestId).once("value", (snap) => {
    const rideData = snap.val() || {};
    const pId = rideData.passengerId || uid;

    const completionData = {
      passenger: name,
      destination: destination,
      amount: price,
      price: price,
      status: "Completed",
      completedAt: new Date().toISOString(),
      timestamp: rideData.timestamp || new Date().toISOString(),
      timeLabel: rideData.timeLabel || "--:--",
    };

    db.ref(`completed_rides/${uid}/${requestId}`).set(completionData);
    if (pId !== uid) {
      db.ref(`completed_rides/${pId}/${requestId}`).set(completionData);
    }

    db.ref("active_requests/" + requestId).remove();
  });
}

function showDynamicPrompt(icon, title, msg, onConfirm) {
  const overlay = document.getElementById("custom-prompt");
  const confirmBtn = document.getElementById("prompt-confirm-action");
  document.getElementById("prompt-icon").className = icon;
  document.getElementById("prompt-title").innerText = title;
  document.getElementById("prompt-message").innerText = msg;

  confirmBtn.removeAttribute("onclick");
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", () => {
    onConfirm();
    closePrompt();
  });

  overlay.style.display = "flex";
  overlay.classList.remove("hidden");
}

function closePrompt() {
  const overlay = document.getElementById("custom-prompt");
  overlay.style.display = "none";
  overlay.classList.add("hidden");
}

function cancelLogout() {
  closePrompt();
}

function popup(title, message) {
  const alert = document.getElementById("custom-alert");
  document.getElementById("alert-title").innerText = title;
  document.getElementById("alert-message").innerText = message;
  alert.style.display = "flex";
  alert.classList.remove("hidden");

  const bar = document.getElementById("alert-progress-bar");
  bar.style.transition = "none";
  bar.style.width = "0%";
  setTimeout(() => {
    bar.style.transition = "width 3s linear";
    bar.style.width = "100%";
  }, 50);
  setTimeout(() => {
    alert.style.display = "none";
    alert.classList.add("hidden");
  }, 3000);
}
function popup(title, message) {
  const alert = document.getElementById("custom-alert");
  document.getElementById("alert-title").innerText = title;
  document.getElementById("alert-message").innerText = message;
  alert.style.display = "flex";
  alert.classList.remove("hidden");

  const bar = document.getElementById("alert-progress-bar");
  bar.style.transition = "none";
  bar.style.width = "0%";
  setTimeout(() => {
    bar.style.transition = "width 3s linear";
    bar.style.width = "100%";
  }, 50);
  setTimeout(() => {
    alert.style.display = "none";
    alert.classList.add("hidden");
  }, 3000);
}

// WALLET LOGIC
function initDriverStats(uid) {
  const totalBalanceEl = document.getElementById("wallet-total-balance");
  const todayEl = document.getElementById("earn-today");
  const weekEl = document.getElementById("earn-week");
  const monthEl = document.getElementById("earn-month");
  const transactionList = document.getElementById("wallet-transaction-list");

  const statsCards = document.querySelectorAll(".gr-card h2");

  db.ref(`completed_rides/${uid}`).on("value", (snapshot) => {
    const rides = snapshot.val();

    let totalBalance = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let tripCount = 0;
    let transactionHTML = "";

    if (rides) {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const rideKeys = Object.keys(rides).reverse();

      rideKeys.forEach((key) => {
        const ride = rides[key];
        const amount = parseInt(ride.amount || ride.price || 0);
        const rideDate = new Date(ride.completedAt || ride.timestamp);

        if (ride.status === "Completed") {
          tripCount++;
          totalBalance += amount;

          if (ride.completedAt && ride.completedAt.startsWith(todayStr)) {
            todayEarnings += amount;
          }

          if (rideDate >= startOfWeek) {
            weekEarnings += amount;
          }

          if (rideDate >= startOfMonth) {
            monthEarnings += amount;
          }

          if (rideKeys.indexOf(key) < 5) {
            transactionHTML += `
                            <div class="transaction-item">
                                <div class="tx-main">
                                    <h4>Trip to ${ride.destination}</h4>
                                    <p>${ride.timeLabel || "Completed"}</p>
                                </div>
                                <div class="tx-val">+₦${amount.toLocaleString()}</div>
                            </div>`;
          }
        }
      });
    }

    if (statsCards.length > 0) {
      statsCards[0].innerText = `₦${todayEarnings.toLocaleString()}`;
      statsCards[1].innerText = tripCount;
    }

    if (totalBalanceEl)
      totalBalanceEl.innerText = `₦${totalBalance.toLocaleString()}`;
    if (todayEl) todayEl.innerText = `₦${todayEarnings.toLocaleString()}`;
    if (weekEl) weekEl.innerText = `₦${weekEarnings.toLocaleString()}`;
    if (monthEl) monthEl.innerText = `₦${monthEarnings.toLocaleString()}`;

    if (transactionList) {
      transactionList.innerHTML =
        transactionHTML ||
        `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No recent transactions to display.</p>
                </div>`;
    }
  });
}

function printStatement() {
  const driverName =
    document.getElementById("driverNameDisplay")?.innerText || "Driver";
  const totalBalance =
    document.getElementById("wallet-total-balance")?.innerText || "₦0";
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const printHeader = `
        <div id="print-header" style="display:none;">
            <div style="text-align:center; margin-bottom: 20px;">
                <h1 style="color: #000; margin: 0;">GoRïde Financial Statement</h1>
                <p style="color: #666;">Account Holder: ${driverName}</p>
                <p style="color: #666;">Generated on: ${date}</p>
                <hr style="border: 0.5px solid #eee; margin: 20px 0;">
                <h2 style="margin: 0;">Total Earnings: ${totalBalance}</h2>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("afterbegin", printHeader);

  window.print();

  document.getElementById("print-header").remove();
}

// PROFILE LOGIC
function loadUserProfile() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;

      db.ref(`users/${uid}`).on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          document.getElementById("profile-display-name").innerText =
            data.name || "User";
          document.getElementById("edit-name").value = data.name || "";
          document.getElementById("edit-email").value = user.email; // Email from Auth
          document.getElementById("profile-role").innerText =
            data.role || "Passenger";

          if (data.profilePic) {
            document.getElementById("profile-img-display").src =
              data.profilePic;
          }
        }
      });

      db.ref(`completed_rides/${uid}`).on("value", (snapshot) => {
        const count = snapshot.exists()
          ? Object.keys(snapshot.val()).length
          : 0;
        document.getElementById("total-rides-count").innerText = count;
      });
    }
  });
}

function saveProfileChanges() {
  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById("edit-name").value;
  const newPic = document.getElementById("profile-img-display").src;

  if (!newName) return popup("Error", "Name cannot be empty");

  db.ref(`users/${user.uid}`)
    .update({
      name: newName,
      profilePic: newPic,
    })
    .then(() => {
      popup("Success", "Profile updated!");
    });
}

function requestPasswordReset() {
  const email = auth.currentUser.email;
  showDynamicPrompt(
    "fas fa-key",
    "Reset Password?",
    `We will send a reset link to ${email}. Continue?`,
    () => {
      auth.sendPasswordResetEmail(email).then(() => {
        popup("Email Sent", "Check your inbox to reset your password.");
      });
    },
  );
}

function confirmDeleteAccount() {
  showDynamicPrompt(
    "fas fa-exclamation-triangle",
    "Delete Account?",
    "This is permanent. All your ride history will be lost.",
    () => {
      const user = auth.currentUser;
      db.ref(`users/${user.uid}`)
        .remove()
        .then(() => {
          user
            .delete()
            .then(() => {
              window.location.reload();
            })
            .catch(() => {
              popup(
                "Error",
                "Please logout and login again to delete your account for security.",
              );
            });
        });
    },
  );
}

function closeProfile() {
  const profilePage = document.getElementById("user-profile-page");
  const dashboard = document.getElementById("passenger-dashboard"); // Ensure this ID is correct

  profilePage.style.display = "none";
  profilePage.classList.add("hidden");

  if (dashboard) {
    dashboard.style.display = "block";
    dashboard.classList.remove("hidden");
  }
}

document.getElementById("img-upload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) =>
      (document.getElementById("profile-img-display").src =
        event.target.result);
    reader.readAsDataURL(file);
  }
});

loadUserProfile();

document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  window.sendQuick = function (msg) {
    addMessage(msg, "outgoing");
    simulateDriverReply(msg);
  };

  function addMessage(text, type = "incoming") {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", type);

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = text;

    const timeEl = document.createElement("span");
    timeEl.classList.add("time");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}`;

    messageEl.appendChild(bubble);
    messageEl.appendChild(timeEl);

    chatBox.appendChild(messageEl);

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    const msg = messageInput.value.trim();
    if (!msg) return;
    addMessage(msg, "outgoing");
    messageInput.value = "";
    simulateDriverReply(msg);
  });

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
      e.preventDefault();
    }
  });

  function simulateDriverReply(passengerMsg) {
    setTimeout(
      () => {
        let reply = "";
        const msg = passengerMsg.toLowerCase();

        if (msg.includes("outside"))
          reply = "Great! I'm coming to pick you up.";
        else if (msg.includes("suitcase") || msg.includes("luggage"))
          reply = "No problem, I can handle your luggage.";
        else if (msg.includes("where")) reply = "I'm parked near the pharmacy.";
        else reply = "Roger that!";

        addMessage(reply, "incoming");
      },
      1000 + Math.random() * 1000,
    ); 
  }

  addMessage(
    "Trip started • " +
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    "system",
  );
});


document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("goride-theme");
  const isLightMode = savedTheme === "light";

  if (isLightMode) {
    document.body.classList.add("light-mode");
  }

  const darkModeSwitch = document.getElementById("pref-darkmode");
  if (darkModeSwitch) {
    darkModeSwitch.checked = !isLightMode;

    darkModeSwitch.addEventListener("change", function () {
      changeMode();
    });
  }
});

function changeMode() {
  const isNowLight = document.body.classList.toggle("light-mode");

  localStorage.setItem("goride-theme", isNowLight ? "light" : "dark");

  const themeIcon = document.querySelector(".theme-toggle i");
  if (themeIcon) {
    themeIcon.className = isNowLight ? "fas fa-moon" : "fas fa-sun";
  }

  const settingsSwitch = document.getElementById("pref-darkmode");
  if (settingsSwitch) {
    settingsSwitch.checked = !isNowLight;
  }
}

// NEWSLETTER
function subscribeToNewsletter() {
  let newsLetterInput = document
    .getElementById("newsLetterInput")
    .value.trim()
    .toLowerCase();
  if (!newsLetterInput) {
    popup("Input your email", "Field cannot be empty");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newsLetterInput)) {
    popup(
      "Invalid Email",
      "Please enter a valid email address (e.g., name@gmail.com)",
    );
    return;
  }
  if (newsLetterInput.length < 6) {
    popup("Too Short", "This doesn’t look like a real email address.");
    return;
  }
  const blacklisted = ["test@test.com", "abc@abc.com", "123@123.com"];
  if (blacklisted.includes(newsLetterInput)) {
    popup("Nice Try!", "Please provide a genuine email address.");
    return;
  }
  popup(
    "Thank you for signing up!",
    "You shall hear from us soon with exclusive GoRïde promos.",
  );
  document.getElementById("newsLetterInput").value = "";
}
