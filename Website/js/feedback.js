import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const btn = document.getElementById('submitFeedback');
const txt = document.getElementById('feedbackText');
const msg = document.getElementById('feedbackMsg');

if (btn) {
    btn.addEventListener('click', async () => {
        const content = txt.value.trim();
        if (!content) {
            alert("Please enter some text.");
            return;
        }

        btn.disabled = true;
        btn.innerText = "Sending...";

        try {
            await addDoc(collection(db, "feedbacks"), {
                message: content,
                timestamp: serverTimestamp() // Use server timestamp for sorting
            });

            txt.value = "";
            msg.style.color = "green";
            msg.innerText = "Thank you! Your feedback has been recorded anonymously.";
            setTimeout(() => { msg.innerText = ""; }, 3000);
        } catch (e) {
            console.error(e);
            msg.style.color = "red";
            msg.innerText = "Error sending feedback: " + e.message;
        } finally {
            btn.disabled = false;
            btn.innerText = "Submit Anonymous Feedback";
        }
    });
}
