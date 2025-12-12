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

// Sample job data (will be replaced with jobs.json in production)
let allJobs = [];
let filteredJobs = [];
let savedJobs = [];

// Load jobs from API and fallback sources
async function loadJobs() {
    try {
        console.log('Loading real jobs from Adzuna API...');
        
        // Initialize job API
        const jobAPI = new JobAPI();
        
        // Search for jobs based on user preferences
        const realJobs = await jobAPI.searchJobs(userPreferences, {
            resultsPerPage: 50,
            page: 1
        });
        
        if (realJobs && realJobs.length > 0) {
            allJobs = realJobs;
            console.log('✅ Real jobs loaded successfully:', allJobs.length, 'jobs from Adzuna');
            return;
        }
        
        // If API fails, try loading from local JSON
        console.log('API returned no results, trying local jobs.json...');
        const response = await fetch('../assets/jobs.json');
        if (response.ok) {
            allJobs = await response.json();
            console.log('📁 Local jobs loaded:', allJobs.length, 'jobs');
            return;
        }
        
        throw new Error('Both API and local data failed');
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        console.log('🔄 Using fallback sample data');
        
        // Fallback sample data
        allJobs = [
            {
                id: 1,
                title: "Frontend Developer",
                company: "Tech Corp",
                location: "Remote",
                salary: { min: 105000, max: 135000 },
                workType: "remote",
                industry: "technology",
                skills: ["javascript", "react", "css"],
                description: "Build amazing web applications",
                link: "https://example.com/job1",
                source: "Sample Data"
            },
            {
                id: 2,
                title: "UX Designer",
                company: "Design Studio",
                location: "Cape Town",
                salary: { min: 97500, max: 127500 },
                workType: "hybrid",
                industry: "design",
                skills: ["figma", "ui design", "user research"],
                description: "Create beautiful user experiences",
                link: "https://example.com/job2",
                source: "Sample Data"
            },
            {
                id: 3,
                title: "Data Analyst",
                company: "Analytics Inc",
                location: "Remote",
                salary: null,
                workType: "remote",
                industry: "technology",
                skills: ["python", "sql", "data visualization"],
                description: "Analyze data and provide insights. Competitive salary package.",
                link: "https://example.com/job3",
                source: "Sample Data"
            },
            {
                id: 4,
                title: "Product Manager",
                company: "Startup XYZ",
                location: "Johannesburg",
                salary: { min: 135000, max: 180000 },
                workType: "on-site",
                industry: "technology",
                skills: ["product strategy", "agile", "communication"],
                description: "Lead product development",
                link: "https://example.com/job4",
                source: "Sample Data"
            },
            {
                id: 5,
                title: "Marketing Specialist",
                company: "Brand Co",
                location: "Durban",
                salary: { min: 82500, max: 112500 },
                workType: "hybrid",
                industry: "marketing",
                skills: ["seo", "content marketing", "social media"],
                description: "Drive marketing campaigns",
                link: "https://example.com/job5",
                source: "Sample Data"
            }
        ];
    }
}

// Calculate match score
function calculateMatchScore(job) {
    if (!userPreferences) return 50; // Default if no preferences
    
    let score = 0;
    let factors = 0;
    
    // Skills match (40% weight)
    if (userPreferences.skills && userPreferences.skills.length > 0) {
        const skillMatches = job.skills.filter(skill => 
            userPreferences.skills.some(userSkill => 
                skill.toLowerCase().includes(userSkill) || userSkill.includes(skill.toLowerCase())
            )
        ).length;
        const skillScore = (skillMatches / Math.max(job.skills.length, userPreferences.skills.length)) * 40;
        score += skillScore;
        factors++;
    }
    
    // Interest match (20% weight)
    if (userPreferences.interests && userPreferences.interests.includes(job.industry)) {
        score += 20;
    }
    factors++;
    
    // Location match (15% weight)
    if (userPreferences.location) {
        const locationMatch = job.location.toLowerCase().includes(userPreferences.location) || 
                             userPreferences.location.includes(job.location.toLowerCase()) ||
                             job.workType === 'remote' ||
                             userPreferences.location === 'remote' ||
                             userPreferences.location === 'anywhere';
        if (locationMatch) {
            score += 15;
        }
    }
    factors++;
    
    // Salary match (15% weight)
    if (userPreferences.salaryRange && job.salary) {
        const salaryOverlap = !(job.salary.max < userPreferences.salaryRange.min || 
                               job.salary.min > userPreferences.salaryRange.max);
        if (salaryOverlap) {
            score += 15;
        }
    }
    factors++;
    
    // Work type match (10% weight)
    if (userPreferences.workType === job.workType) {
        score += 10;
    }
    factors++;
    
    return Math.round(score);
}

// Create job card HTML
function createJobCard(job) {
    const matchScore = calculateMatchScore(job);
    const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    return `
        <div class="job-card" data-job-id="${job.id}">
            <div class="match-badge">${matchScore}% Match</div>
            <h3>${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <div class="job-details">
                <div class="job-detail">
                    <span class="job-detail-icon">📍</span>
                    <span>${job.location}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">R</span>
                    <span>${job.salary ? `R${job.salary.min.toLocaleString()} - R${job.salary.max.toLocaleString()}/month` : 'Salary not disclosed'}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">●</span>
                    <span>${job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">#</span>
                    <span>${job.industry.charAt(0).toUpperCase() + job.industry.slice(1)}</span>
                </div>
                ${job.source ? `<div class="job-detail">
                    <span class="job-detail-icon">🔗</span>
                    <span>${job.source}</span>
                </div>` : ''}
            </div>
            <p>${job.description}</p>
            <div class="job-actions">
                ${isSaved ? 
                    `<button class="btn-unsave" onclick="unsaveJob(${job.id})">Unsave</button>` :
                    `<button class="btn-save" onclick="saveJob(${job.id})">Save Job</button>`
                }
                <a href="${job.link}" target="_blank" class="btn-view">View Job</a>
            </div>
        </div>
    `;
}

// Display jobs
function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    const noResults = document.getElementById('noResults');
    const jobCount = document.getElementById('jobCount');
    
    if (jobs.length === 0) {
        jobsGrid.style.display = 'none';
        noResults.style.display = 'block';
        jobCount.textContent = '0';
        return;
    }
    
    jobsGrid.style.display = 'grid';
    noResults.style.display = 'none';
    jobCount.textContent = jobs.length;
    
    // Sort by match score
    const sortedJobs = jobs.sort((a, b) => {
        return calculateMatchScore(b) - calculateMatchScore(a);
    });
    
    jobsGrid.innerHTML = sortedJobs.map(job => createJobCard(job)).join('');
}

// Apply filters
function applyFilters() {
    const filterIndustry = document.getElementById('filterIndustry').value;
    const filterWorkType = document.getElementById('filterWorkType').value;
    const filterMinMatch = parseInt(document.getElementById('filterMinMatch').value);
    
    filteredJobs = allJobs.filter(job => {
        const matchScore = calculateMatchScore(job);
        
        if (filterIndustry && job.industry !== filterIndustry) return false;
        if (filterWorkType && job.workType !== filterWorkType) return false;
        if (filterMinMatch && matchScore < filterMinMatch) return false;
        
        return true;
    });
    
    displayJobs(filteredJobs);
}

// Reset filters
function resetFilters() {
    document.getElementById('filterIndustry').value = '';
    document.getElementById('filterWorkType').value = '';
    document.getElementById('filterMinMatch').value = '0';
    filteredJobs = [...allJobs];
    displayJobs(filteredJobs);
}

// Save job
function saveJob(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (job && !savedJobs.some(j => j.id === jobId)) {
        savedJobs.push(job);
        // Save to localStorage for persistence
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        window.savedJobs = savedJobs;
        displayJobs(filteredJobs); // Refresh display
        
        // Show success notification
        showNotification(`${job.title} saved successfully!`);
    }
}

// Unsave job
function unsaveJob(jobId) {
    const job = savedJobs.find(j => j.id === jobId);
    savedJobs = savedJobs.filter(job => job.id !== jobId);
    // Update localStorage
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    window.savedJobs = savedJobs;
    displayJobs(filteredJobs); // Refresh display
    
    if (job) {
        showNotification(`${job.title} removed from saved jobs.`);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-green), var(--neon-green));
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
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

// Initialize
async function init() {
    console.log('Initializing results page...');
    console.log('User preferences:', userPreferences);
    
    // Check if user has completed questionnaire
    if (!userPreferences) {
        console.log('No user preferences found');
        if (confirm('You haven\'t completed the questionnaire yet. Would you like to do that now?')) {
            window.location.href = 'questionnaire.html';
            return;
        }
    }
    
    // Load saved jobs from localStorage
    try {
        const stored = localStorage.getItem('savedJobs');
        savedJobs = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading saved jobs:', error);
        savedJobs = [];
    }
    window.savedJobs = savedJobs;
    
    // Load and display jobs
    await loadJobs();
    filteredJobs = [...allJobs];
    displayJobs(filteredJobs);
}

// Start when page loads
init();


