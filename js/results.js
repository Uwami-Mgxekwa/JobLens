// Get user preferences
const userPreferences = window.userPreferences || null;

// Sample job data (will be replaced with jobs.json in production)
let allJobs = [];
let filteredJobs = [];
let savedJobs = [];

// Load jobs from JSON file
async function loadJobs() {
    try {
        const response = await fetch('assets/jobs.json');
        allJobs = await response.json();
    } catch (error) {
        console.error('Error loading jobs:', error);
        // Fallback sample data
        allJobs = [
            {
                id: 1,
                title: "Frontend Developer",
                company: "Tech Corp",
                location: "Remote",
                salary: { min: 70000, max: 90000 },
                workType: "remote",
                industry: "technology",
                skills: ["javascript", "react", "css"],
                description: "Build amazing web applications",
                link: "https://example.com/job1"
            },
            {
                id: 2,
                title: "UX Designer",
                company: "Design Studio",
                location: "New York",
                salary: { min: 65000, max: 85000 },
                workType: "hybrid",
                industry: "design",
                skills: ["figma", "ui design", "user research"],
                description: "Create beautiful user experiences",
                link: "https://example.com/job2"
            },
            {
                id: 3,
                title: "Data Analyst",
                company: "Analytics Inc",
                location: "Remote",
                salary: { min: 60000, max: 80000 },
                workType: "remote",
                industry: "technology",
                skills: ["python", "sql", "data visualization"],
                description: "Analyze data and provide insights",
                link: "https://example.com/job3"
            },
            {
                id: 4,
                title: "Product Manager",
                company: "Startup XYZ",
                location: "San Francisco",
                salary: { min: 90000, max: 120000 },
                workType: "on-site",
                industry: "technology",
                skills: ["product strategy", "agile", "communication"],
                description: "Lead product development",
                link: "https://example.com/job4"
            },
            {
                id: 5,
                title: "Marketing Specialist",
                company: "Brand Co",
                location: "Los Angeles",
                salary: { min: 55000, max: 75000 },
                workType: "hybrid",
                industry: "marketing",
                skills: ["seo", "content marketing", "social media"],
                description: "Drive marketing campaigns",
                link: "https://example.com/job5"
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
    if (userPreferences.salaryRange) {
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
                    <span class="job-detail-icon">💰</span>
                    <span>$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">💼</span>
                    <span>${job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">🏷️</span>
                    <span>${job.industry.charAt(0).toUpperCase() + job.industry.slice(1)}</span>
                </div>
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
        window.savedJobs = savedJobs;
        displayJobs(filteredJobs); // Refresh display
    }
}

// Unsave job
function unsaveJob(jobId) {
    savedJobs = savedJobs.filter(job => job.id !== jobId);
    window.savedJobs = savedJobs;
    displayJobs(filteredJobs); // Refresh display
}

// Initialize
async function init() {
    // Check if user has completed questionnaire
    if (!userPreferences) {
        if (confirm('You haven\'t completed the questionnaire yet. Would you like to do that now?')) {
            window.location.href = 'questionnaire.html';
            return;
        }
    }
    
    // Load saved jobs
    savedJobs = window.savedJobs || [];
    
    // Load and display jobs
    await loadJobs();
    filteredJobs = [...allJobs];
    displayJobs(filteredJobs);
}

// Start when page loads
init();


