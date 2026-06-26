function updateOnlineStatus() {
    let status = document.getElementById("status");
    if (navigator.onLine) {
        status.innerHTML = "🟢 Online Mode";
    } else {
        status.innerHTML = "🔴 Offline Mode (Data will sync later)";
    }
}
function autoSyncApplications(){
    let applications = JSON.parse(localStorage.getItem("applications")) || [];

    applications.forEach(app => {
        if(app.status === "Pending Sync"){
            app.status = "Submitted";
        }
    });

    localStorage.setItem("applications", JSON.stringify(applications));
    displaySaved();
}

window.addEventListener('online', function(){
    updateOnlineStatus();
    autoSyncApplications();
});
window.addEventListener('offline', updateOnlineStatus);

let step = 0;
let studentData = {};

function startProcess() {
    step = 0;
    studentData = {};

    // Hide eligibility section when restarting
    document.getElementById("eligibilitySection").style.display = "none";

    // Clear old chat
    document.getElementById("chatBox").innerHTML = "";

    addMessage("Assistant", "Which class are you studying?");
}
function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = document.getElementById("language").value;

    recognition.onresult = function(event) {
        let speech = event.results[0][0].transcript;
        addMessage("You", speech);
        processAnswer(speech);
    };

    recognition.start();
}

function addMessage(sender, message) {
    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<p><strong>${sender}:</strong> ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function processAnswer(answer) {

    if(step === 0){
        studentData.class = answer;
        addMessage("Assistant", "What is your annual family income?");
        step++;
    }
    else if(step === 1){
        studentData.income = answer;
        addMessage("Assistant", "What is your category? (General/OBC/SC/ST)");
        step++;
    }
    else if(step === 2){
        studentData.category = answer;
        checkEligibility();
    }
}

function checkEligibility(){

    let income = parseInt(studentData.income);
    let category = studentData.category.toLowerCase();
    let studentClass = parseInt(studentData.class);
    if(isNaN(income) || isNaN(studentClass)){
    addMessage("Assistant", "Please enter valid numeric values for class and income.");
    return;
}

    let recommendations = [];

    let today = new Date();
    let warningMessage = "";

    // Scholarship Logic with Deadlines

    // Pre-Matric (1-10)
if(studentClass >= 1 && studentClass <= 10 &&
   income <= 250000 &&
   (category === "sc" || category === "st" || category === "obc")){
    recommendations.push({
        name: "Pre-Matric Scholarship",
        deadline: "2026-03-20"
    });
}

// Merit (11-12)
if(studentClass >= 11 && studentClass <= 12 &&
   income <= 800000){
    recommendations.push({
        name: "Central Sector Scholarship Scheme",
        deadline: "2026-05-01"
    });
}

// SC/ST Special
if(studentClass >= 1 && studentClass <= 12 &&
   income <= 300000 &&
   (category === "sc" || category === "st")){
    recommendations.push({
        name: "Post Matric Scholarship for SC/ST Students",
        deadline: "2026-04-15"
    });
}

    if(recommendations.length === 0){
        addMessage("Assistant", "No central schemes matched. Please check state-level scholarships.");
        studentData.result = "State-Level Schemes";
        return;
    }
    document.getElementById("eligibilitySection").style.display = "block";

    addMessage("Assistant", "Based on your details, you are eligible for:");

    recommendations.forEach(scholarship => {
        let deadlineDate = new Date(scholarship.deadline);
        let diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

        if(diffDays <= 15){
            warningMessage = "⚠ Hurry! Deadline approaching soon!";
        }

        addMessage("Assistant", `${scholarship.name} (Deadline: ${scholarship.deadline})`);
    });

    if(warningMessage !== ""){
        addMessage("Assistant", warningMessage);
    }

    studentData.result = recommendations.map(s => s.name).join(" | ");
}

function saveApplication(){
    let applications = JSON.parse(localStorage.getItem("applications")) || [];

    studentData.documents = {
        income: document.getElementById("incomeDoc").files.length > 0 ? "Uploaded" : "Missing",
        mark: document.getElementById("markDoc").files.length > 0 ? "Uploaded" : "Missing"
    };

    studentData.status = navigator.onLine ? "Submitted" : "Pending Sync";

    applications.push(studentData);
    localStorage.setItem("applications", JSON.stringify(applications));

    displaySaved();
}

function displaySaved(){
    let list = document.getElementById("savedList");
    list.innerHTML = "";

    let applications = JSON.parse(localStorage.getItem("applications")) || [];

    let submitted = 0;
    let pending = 0;

    applications.forEach((app, index) => {
        let li = document.createElement("li");
        li.textContent = `Application ${index+1} - ${app.result} - ${app.status}`;
        list.appendChild(li);

        if(app.status === "Submitted"){
            submitted++;
        } else {
            pending++;
        }
    });

    document.getElementById("totalCount").innerText = applications.length;
    document.getElementById("submittedCount").innerText = submitted;
    document.getElementById("pendingCount").innerText = pending;
}

function syncData(){
    alert("Data synced successfully when internet connection available.");
}

window.onload = function(){
    updateOnlineStatus();
    displaySaved();
};
function clearAll(){
    localStorage.removeItem("applications");
    displaySaved();
}
function updateStatus(id) {
    const fileInput = document.getElementById(id);
    const status = document.getElementById(id + "Status");

    if (fileInput.files.length > 0) {
        status.innerHTML = "✅ Uploaded";
        status.style.color = "green";
    } else {
        status.innerHTML = "❌ Not Uploaded";
        status.style.color = "red";
    }
}