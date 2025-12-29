import { db, auth } from "./firebase.js";
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const form = document.getElementById('volunteerForm');
const statusDiv = document.getElementById('statusDiv');
const formDiv = document.getElementById('formDiv');
const successDiv = document.getElementById('successDiv');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    checkVolunteerStatus(user.uid);
});

async function checkVolunteerStatus(uid) {
    // Real-time listener for status changes (e.g. when admin approves)
    onSnapshot(doc(db, "volunteers", uid), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if (data.status === 'pending') {
                showPendingState();
            } else if (data.status === 'approved') {
                showApprovedState(data);
            }
        }
    });
}

function showPendingState() {
    formDiv.style.display = 'none';
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
        <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px; color: #856404;">
            <h3>⏳ Application Pending</h3>
            <p>Your volunteer application is currently under review by our admin team. Please check back later.</p>
        </div>
    `;
    successDiv.style.display = 'none';
}

function showApprovedState(data) {
    formDiv.style.display = 'none';
    statusDiv.style.display = 'none';
    successDiv.style.display = 'block';

    // Add Tier Badge
    let tierColor = 'gray';
    if (data.tier === 'Tier 1') tierColor = 'gold';
    if (data.tier === 'Tier 2') tierColor = 'silver';
    if (data.tier === 'Tier 3') tierColor = '#cd7f32'; // bronze

    successDiv.innerHTML = `
        <div style="padding: 30px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; color: #155724;">
            <h1>🎉 Congratulations!</h1>
            <p>You are now an officially approved volunteer.</p>
            <div style="margin-top: 20px; font-size: 1.2rem;">
                <strong>Tier:</strong> <span style="background:${tierColor}; color:white; padding: 5px 10px; border-radius: 15px;">${data.tier}</span>
            </div>
            <p style="margin-top: 10px;">Location: ${data.city}, ${data.district}</p>
        </div>
    `;
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const age = document.getElementById('age').value;
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;
        const tier = document.getElementById('tier').value;
        const documents = document.getElementById('documents').value;

        try {
            await setDoc(doc(db, "volunteers", currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                age: age,
                city: city,
                district: district,
                tier: tier,
                documents: documents,
                status: 'pending',
                submittedAt: new Date().toISOString()
            });
            // UI update will happen via onSnapshot
        } catch (error) {
            console.error("Error submitting volunteer data:", error);
            if (error.code === 'permission-denied') {
                alert("Submission Failed: Permission Denied. Please ask the admin to enable Firestore writes.");
            } else {
                alert("Error submitting application: " + error.message);
            }
        }
    });
}
