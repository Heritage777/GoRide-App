








const textElement = document.getElementById('typewriter');
const phrases = ["Our Pride.", "Your Way.", "Our Mission.", "Your Freedom."];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 150;

function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        // Remove a character
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // Faster when deleting
    } else {
        // Add a character
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150; // Normal typing speed
    }

    // Logic for switching states
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Word is finished, wait before deleting
        isDeleting = true;
        typeSpeed = 2000; // Pause at the end of the word
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length; // Move to next word
        typeSpeed = 500; // Pause before starting next word
    }

    setTimeout(type, typeSpeed);
}
document.addEventListener('DOMContentLoaded', type);

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
let signupModal = document.getElementById('signup-modal')
let driverSignup = document.getElementById('driver-onboarding-view')
let loginPage = document.getElementById('login-modal')
let passengerDashboard = document.getElementById('passenger-dashboard')
let settings = document.getElementById('settings-page')
let forgotPassword = document.getElementById('forgot-password-modal')
let driverDashboard = document.getElementById('driverDashboard')
let profile = document.getElementById('user-profile-page')
let alertBox = document.getElementById('custom-alert')
let promptBox = document.getElementById('custom-prompt')
let chatBox = document.getElementById('chat-container')
let policies = document.getElementById('legal-master-container')
let support = document.getElementById('support-master-container')
let driverRegistration = document.getElementById('driverRegistration')
let wallet = document.getElementById('wallet-page')
let rideHistory = document.getElementById('rideHistoryPage')






signupModal.style.display = 'none'
driverSignup.style.display = 'none'
loginPage.style.display = 'none'
passengerDashboard.style.display = 'none'
settings.style.display = 'none'
forgotPassword.style.display = 'none'
driverDashboard.style.display = 'none'
alertBox.style.display = 'none'
promptBox.style.display = 'none'
chatBox.style.display = 'none'
policies.style.display = 'none'
support.style.display = 'none'
driverRegistration.style.display = 'none'
wallet.style.display = 'none'
rideHistory.style.display = 'none'

function removeCurrentDisplay(currentPage) {
    currentPage.style.display = 'none'
}
function displayPage(pageToBeDisplayed) {
    // removeCurrentDisplay()
    pageToBeDisplayed.style.display = 'block'
}
function displaySignup() {
    removeCurrentDisplay(loginPage)
    signupModal.style.display = 'block'
}
function becomeDriver() {
    removeCurrentDisplay(signupModal)
   driverSignup.style.display = 'block'
}

function displayProfile() {
    removeCurrentDisplay(chatBox)
    profile.style.display = 'block'
}
function popup(title, message) {
    // 1. Select the elements
    const alertOverlay = document.getElementById('custom-alert');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const progressBar = document.getElementById('alert-progress-bar');

    alertTitle.innerText = title;
    alertMessage.innerText = message;

    alertOverlay.classList.remove('hidden');
    alertOverlay.style.display = 'flex';

    progressBar.style.width = '100%';
    
    setTimeout(() => {
        closeAlert();
    }, 3000);
}

function closeAlert() {
    const alertOverlay = document.getElementById('custom-alert');
    alertOverlay.style.display = 'none';
    alertOverlay.classList.add('hidden');
}

function showPrompt() {
    promptBox.style.display = 'block'
}
function displayChatBox() {
    chatBox.style.display = 'block'
}
function logoutUser() {
    showPrompt(); 
}

function confirmLogout() {
    auth.signOut()
        .then(() => {
            popup("Logged out successfully",  `See you soon!`);

            setTimeout(() => {
               
                removeCurrentDisplay(promptBox)
                removeCurrentDisplay(passengerDashboard)
                displayPage(loginPage)
            }, 1500);
        })
        .catch((error) => {
            popup("Error", "Logout failed: " + error.message);
        });
}
function displayRegistration() {
    driverRegistration.style.display = 'flex'
}

function submitApplication() {
     popup('Sucessfully registered!', 'Logging in user')
    displayPage(driverDashboard)
}



// displayPage(settings)

// function displayHistory() {
//     removeCurrentDisplay(driverDashboard)
//     displayPage(rideHistory)
// }


function passwordReset() {
    alert('reset')
    removeCurrentDisplay(settings)
    removeCurrentDisplay(passengerDashboard)
    displayPage(forgotPassword)
}





















// Central Navigation Function
function showSection(sectionId) {
    // 1. List of all your main page IDs
    const sections = ['driverDashboard', 'wallet-page', 'settings-page', 'chatBox', 'rideHistoryPage'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // If this is the section we want, show it. Otherwise, hide it.
            if (id === sectionId) {
                el.style.display = (id === 'driverDashboard') ? 'flex' : 'block';
                el.classList.remove('hidden');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden');
            }
        }
    });
}

// Update your specific click functions to use the helper
function displayWallet() {
    showSection('wallet-page');
    // Optional: Refresh wallet data from Firebase here
    if (auth.currentUser) {
        initDriverStats(auth.currentUser.uid); 
    }
}

function displaySettings() {
    showSection('settings-page');
}

function goToDashboard() {
    showSection('driverDashboard');
}

function displayHistory() {
    showSection('rideHistoryPage');
}








// function changeMode() {
//     document.body.style.backgroundColor = 'white'
//     document.querySelector('.login-card').style.backgroundColor = '#d4d4d4'


// }
