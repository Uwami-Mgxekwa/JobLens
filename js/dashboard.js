// Get data
const savedJobs = window.savedJobs || [];

// Get user preferences from localStorage
let userPreferences = null;
try {
    const stored = localStorage.getItem('userPreferences');
    userPreferences = stored ? JSON.parse(stored) : null;
} catch (error) {
    console.error('Error loading user preferences:', error);
}
// Fallback to window variable
userPreferences = userPreferences || window.userPreferences || null;
const alerts = {
    remoteDesign: false,
    highMatch: false,
    skills: false
};

// Display saved jobs
function displaySavedJobs() {
    const savedJobsList = document.getElementById('savedJobsList');
    const savedCount = document.getElementById('savedCount');
    
    savedCount.textContent = savedJobs.length;
    
    if (savedJobs.length === 0) {
        savedJobsList.innerHTML = '<p class="empty-state">No saved jobs yet. Browse jobs and save your favorites!</p>';
        return;
    }
    
    savedJobsList.innerHTML = savedJobs.map(job => `
        <div class="saved-job-item">
            <div class="saved-job-info">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong></p>
                <p>📍 ${job.location} | 💼 ${job.workType} | 💰 $${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}</p>
            </div>
            <div class="saved-job-actions">
                <a href="${job.link}" target="_blank" class="btn-view">View</a>
                <button class="btn-remove" onclick="removeJob(${job.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Remove saved job
function removeJob(jobId) {
    const index = savedJobs.findIndex(job => job.id === jobId);
    if (index > -1) {
        savedJobs.splice(index, 1);
        window.savedJobs = savedJobs;
        displaySavedJobs();
    }
}

// Display user preferences
function displayPreferences() {
    const preferencesDisplay = document.getElementById('preferencesDisplay');
    
    if (!userPreferences) {
        preferencesDisplay.innerHTML = '<p class="empty-state">No preferences set. Take the questionnaire to get started!</p>';
        return;
    }
    
    preferencesDisplay.innerHTML = `
        <div class="preference-item">
            <strong>Skills:</strong>
            <span>${userPreferences.skills.join(', ')}</span>
        </div>
        <div class="preference-item">
            <strong>Interests:</strong>
            <span>${userPreferences.interests.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(', ')}</span>
        </div>
        <div class="preference-item">
            <strong>Location:</strong>
            <span>${userPreferences.location}</span>
        </div>
        <div class="preference-item">
            <strong>Salary Range:</strong>
            <span>$${userPreferences.salaryRange.min.toLocaleString()} - $${userPreferences.salaryRange.max.toLocaleString()}</span>
        </div>
        <div class="preference-item">
            <strong>Work Type:</strong>
            <span>${userPreferences.workType.charAt(0).toUpperCase() + userPreferences.workType.slice(1)}</span>
        </div>
    `;
}

// Load alert settings
function loadAlerts() {
    const alertRemoteDesign = document.getElementById('alertRemoteDesign');
    const alertHighMatch = document.getElementById('alertHighMatch');
    const alertSkills = document.getElementById('alertSkills');
    
    // Load from memory if available
    const savedAlerts = window.jobAlerts || alerts;
    
    alertRemoteDesign.checked = savedAlerts.remoteDesign;
    alertHighMatch.checked = savedAlerts.highMatch;
    alertSkills.checked = savedAlerts.skills;
    
    // Add change listeners
    alertRemoteDesign.addEventListener('change', saveAlerts);
    alertHighMatch.addEventListener('change', saveAlerts);
    alertSkills.addEventListener('change', saveAlerts);
}

// Save alert settings
function saveAlerts() {
    const alerts = {
        remoteDesign: document.getElementById('alertRemoteDesign').checked,
        highMatch: document.getElementById('alertHighMatch').checked,
        skills: document.getElementById('alertSkills').checked
    };
    
    window.jobAlerts = alerts;
    
    // Show confirmation
    showNotification('Alert settings saved!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #39ff14;
        color: #000;
        padding: 1rem 2rem;
        border-radius: 5px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check for new job alerts on page load
function checkAlerts() {
    const alerts = window.jobAlerts;
    if (!alerts) return;
    
    let newAlerts = [];
    
    if (alerts.remoteDesign) {
        // Simulated check - in production, this would check against new jobs
        const hasRemoteDesignJobs = Math.random() > 0.7;
        if (hasRemoteDesignJobs) {
            newAlerts.push('New remote design jobs available!');
        }
    }
    
    if (alerts.highMatch) {
        const hasHighMatchJobs = Math.random() > 0.7;
        if (hasHighMatchJobs) {
            newAlerts.push('New high match jobs (85%+) found!');
        }
    }
    
    if (alerts.skills && userPreferences) {
        const hasSkillMatchJobs = Math.random() > 0.7;
        if (hasSkillMatchJobs) {
            newAlerts.push('New jobs matching your skills!');
        }
    }
    
    if (newAlerts.length > 0) {
        setTimeout(() => {
            newAlerts.forEach((alert, index) => {
                setTimeout(() => showNotification(alert), index * 500);
            });
        }, 1000);
    }
}

// Initialize dashboard
function init() {
    displaySavedJobs();
    displayPreferences();
    loadAlerts();
    checkAlerts();
}

// Start when page loads
init();