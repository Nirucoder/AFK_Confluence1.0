import { db, auth } from "./firebase.js";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const loginOverlay = document.getElementById('loginOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const msg = document.getElementById('loginMsg');
const pendingTab = document.getElementById('pendingTab');
const membersTab = document.getElementById('membersTab');
const crisisTab = document.getElementById('crisisTab');
const feedbackTab = document.getElementById('feedbackTab');

// HARDCODED AUTH because user requested "admin / admin123"
window.adminLogin = async function () {
    const u = document.getElementById('admUser').value;
    const p = document.getElementById('admPass').value;

    if (u === 'admin' && p === 'admin') {
        // Just proceed. If rules are open, it works. If not, we'll see permission error.
        loginOverlay.style.display = 'none';
        adminDashboard.style.display = 'block';

        // Show debug info
        document.getElementById('debugInfo').innerHTML = `
            <p><strong>Auth State:</strong> ${auth.currentUser ? auth.currentUser.email : 'Not Logged In'}</p>
            <button onclick="createTestVolunteer()" style="background:orange; padding:5px;">create Test Volunteer</button>
        `;

        loadPending();
    } else {
        msg.innerText = "Invalid credentials";
    }
}

window.createTestVolunteer = async function () {
    try {
        const testId = "test_" + Date.now();
        await setDoc(doc(db, "volunteers", testId), {
            uid: testId,
            email: "test_admin@demo.com",
            age: 99,
            city: "TestCity",
            district: "TestDistrict",
            tier: "Tier 1",
            documents: "http://example.com",
            status: "pending",
            submittedAt: new Date().toISOString()
        });
        alert("Test Volunteer Created! Refreshing list...");
        loadPending();
    } catch (e) {
        alert("Failed to create test data: " + e.message);
    }
}

window.showPending = function () {
    document.getElementById('sectionPending').style.display = 'block';
    document.getElementById('sectionMembers').style.display = 'none';
    document.getElementById('sectionFeedbacks').style.display = 'none';
    pendingTab.classList.add('active');
    membersTab.classList.remove('active');
    feedbackTab.classList.remove('active');
    loadPending();
}

window.showMembers = function () {
    document.getElementById('sectionPending').style.display = 'none';
    document.getElementById('sectionMembers').style.display = 'block';
    document.getElementById('sectionFeedbacks').style.display = 'none';
    pendingTab.classList.remove('active');
    membersTab.classList.add('active');
    feedbackTab.classList.remove('active');
    loadMembers();
}

window.showFeedbacks = function () {
    document.getElementById('sectionPending').style.display = 'none';
    document.getElementById('sectionMembers').style.display = 'none';
    document.getElementById('sectionCrisis').style.display = 'none';
    document.getElementById('sectionFeedbacks').style.display = 'block';
    pendingTab.classList.remove('active');
    membersTab.classList.remove('active');
    crisisTab.classList.remove('active');
    feedbackTab.classList.add('active');
    loadFeedbacks();
}

window.showCrisis = function () {
    document.getElementById('sectionPending').style.display = 'none';
    document.getElementById('sectionMembers').style.display = 'none';
    document.getElementById('sectionFeedbacks').style.display = 'none';
    document.getElementById('sectionCrisis').style.display = 'block';
    pendingTab.classList.remove('active');
    membersTab.classList.remove('active');
    feedbackTab.classList.remove('active');
    crisisTab.classList.add('active');
    loadCrisisReports();
}

window.approveUser = async function (uid) {
    if (!confirm("Approve this volunteer?")) return;

    try {
        const ref = doc(db, "volunteers", uid);
        await updateDoc(ref, {
            status: "approved"
        });
        alert("Approved!");
        loadPending(); // Refresh list
    } catch (e) {
        alert("Error: " + e.message);
    }
}

window.deleteUser = async function (uid) {
    if (!confirm("Are you sure you want to DELETE this volunteer? This cannot be undone.")) return;

    try {
        await deleteDoc(doc(db, "volunteers", uid));
        alert("Volunteer deleted.");
        // Refresh currently visible list
        if (document.getElementById('sectionPending').style.display !== 'none') {
            loadPending();
        } else {
            loadMembers();
        }
    } catch (e) {
        alert("Error deleting: " + e.message);
    }
}

async function loadPending() {
    const list = document.getElementById('pendingList');
    list.innerHTML = "<p>Loading...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "volunteers"));

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No volunteers found in database (Collection is empty).</p>";
            return;
        }

        let html = '<table class="admin-table"><thead><tr><th>User Info</th><th>Tier</th><th>Status</th><th>Docs</th><th>Action</th></tr></thead><tbody>';

        let pendingCount = 0;
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            if (d.status === 'pending') {
                pendingCount++;
                html += `
                    <tr>
                        <td>${d.email}<br><small>Age: ${d.age}</small></td>
                        <td>${d.tier}</td>
                        <td><span style="color:orange">${d.status}</span></td>
                        <td><a href="${d.documents}" target="_blank">View Docs</a></td>
                        <td>
                            <button class="approve-btn" onclick="approveUser('${d.uid}')">Approve</button>
                            <button class="delete-btn" onclick="deleteUser('${d.uid}')" style="background:#dc3545; margin-left:5px;">❌</button>
                        </td>
                    </tr>
                `;
            }
        });

        if (pendingCount === 0) {
            list.innerHTML = "<p>Database connected, but no 'pending' applications found.</p>";
        } else {
            html += '</tbody></table>';
            list.innerHTML = html;
        }

    } catch (e) {
        console.error("Error loading pending users:", e);
        if (e.code === 'permission-denied') {
            list.innerHTML = "<p style='color:red;'>Error: Permission Denied. Check Firestore Rules.</p>";
        } else {
            list.innerHTML = `<p style='color:red;'>Error loading data: ${e.message}</p>`;
        }
    }
}

async function loadMembers() {
    const list = document.getElementById('membersList');
    list.innerHTML = "<p>Loading...</p>";

    try {
        const q = query(collection(db, "volunteers"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No members yet.</p>";
            return;
        }

        let html = '<table class="admin-table"><thead><tr><th>User</th><th>Tier</th><th>Location</th><th>Joined</th><th>Action</th></tr></thead><tbody>';

        querySnapshot.forEach((doc) => {
            const d = doc.data();
            let tierColor = '#ccc';
            if (d.tier === 'Tier 1') tierColor = 'gold';
            if (d.tier === 'Tier 2') tierColor = 'silver';
            if (d.tier === 'Tier 3') tierColor = '#cd7f32';

            html += `
                <tr>
                    <td>${d.email}</td>
                    <td><span style="background:${tierColor}; color:black; padding:2px 8px; border-radius:10px; font-size:0.8rem">${d.tier}</span></td>
                    <td>${d.city}, ${d.district}</td>
                    <td>${new Date(d.submittedAt).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteUser('${d.uid}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        list.innerHTML = html;
    } catch (e) {
        console.error(e);
        list.innerHTML = "Error loading members.";
    }
}

window.deleteFeedback = async function (id) {
    if (!confirm("Delete this feedback?")) return;
    try {
        await deleteDoc(doc(db, "feedbacks", id));
        loadFeedbacks();
    } catch (e) {
        alert("Error deleting feedback: " + e.message);
    }
}

async function loadFeedbacks() {
    const list = document.getElementById('feedbackList');
    list.innerHTML = "<p>Loading feedbacks...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "feedbacks"));

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No feedback received yet.</p>";
            return;
        }

        let html = '';
        const data = [];
        querySnapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });

        data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        data.forEach(d => {
            const date = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleString() : 'Just now';
            html += `
                <div style="background:white; padding:15px; margin-bottom:10px; border-left:4px solid var(--primary-color); box-shadow:0 1px 3px rgba(0,0,0,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <p style="font-size:1.1rem; margin-bottom:5px;">"${d.message}"</p>
                        <small style="color:grey;">Received: ${date}</small>
                    </div>
                    <button onclick="deleteFeedback('${d.id}')" style="background:none; border:none; cursor:pointer; font-size:1.2rem;" title="Delete Feedback">🗑️</button>
                </div>
             `;
        });

        list.innerHTML = html;
    } catch (e) {
        list.innerHTML = `<p style="color:red">Error loading feedback: ${e.message}</p>`;
    }
}


window.deleteCrisis = async function (id) {
    if (!confirm("Delete this report?")) return;
    try {
        await deleteDoc(doc(db, "crisis_reports", id));
        loadCrisisReports();
    } catch (e) {
        alert("Error deleting report: " + e.message);
    }
}

async function loadCrisisReports() {
    const list = document.getElementById('crisisList');
    list.innerHTML = "<p>Loading reports...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "crisis_reports"));

        if (querySnapshot.empty) {
            list.innerHTML = "<p>No crisis reports found.</p>";
            return;
        }

        let html = '';
        const data = [];
        querySnapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });

        // Sort by timestamp if available
        data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        data.forEach(d => {
            const date = d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Date';
            html += `
                <div style="background:white; padding:15px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px; display:flex; gap:15px; align-items:start;">
                    <a href="${d.imageUrl}" target="_blank">
                        <img src="${d.imageUrl}" style="width:120px; height:120px; object-fit:cover; border-radius:5px; border:1px solid #ccc;">
                    </a>
                    <div style="flex-grow:1;">
                        <p><strong>Reported By:</strong> ${d.email}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Status:</strong> <span style="background:red; color:white; padding:2px 6px; font-size:0.8rem; border-radius:4px;">${d.status || 'Open'}</span></p>
                    </div>
                    <div>
                        <button onclick="deleteCrisis('${d.id}')" style="background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Delete</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (e) {
        console.error(e);
        list.innerHTML = `<p style="color:red">Error loading reports: ${e.message}</p>`;
    }
}
