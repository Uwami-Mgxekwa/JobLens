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

// Load jobs with enhanced variety and caching
async function loadJobs() {
    try {
        console.log('🚀 Loading diverse job opportunities...');
        
        // Initialize job API
        const jobAPI = new JobAPI();
        
        // Use enhanced search with variety and caching
        const realJobs = await jobAPI.searchJobsWithVariety(userPreferences, 100);
        
        if (realJobs && realJobs.length > 0) {
            allJobs = realJobs;
            console.log('✅ Enhanced job search complete:', allJobs.length, 'diverse jobs loaded');
            
            // Show cache status
            const cacheUsed = realJobs.some(job => job.fromCache);
            if (cacheUsed) {
                console.log('📦 Some results served from cache for faster loading');
            }
            return;
        }
        
        // If enhanced API fails, try basic search
        console.log('🔄 Enhanced search failed, trying basic search...');
        const basicJobs = await jobAPI.searchJobs(userPreferences, {
            resultsPerPage: 50,
            page: 1
        });
        
        if (basicJobs && basicJobs.length > 0) {
            allJobs = basicJobs;
            console.log('✅ Basic search successful:', allJobs.length, 'jobs loaded');
            return;
        }
        
        // If API fails, try loading from local JSON
        console.log('🔄 API search failed, trying local jobs.json...');
        const response = await fetch('../assets/jobs.json');
        if (response.ok) {
            allJobs = await response.json();
            // Add freshness data to local jobs
            allJobs = allJobs.map(job => ({
                ...job,
                freshness: 'Recently posted',
                freshnessScore: 60,
                source: job.source || 'Local Data'
            }));
            console.log('📁 Local jobs loaded:', allJobs.length, 'jobs');
            return;
        }
        
        throw new Error('All job loading methods failed');
        
    } catch (error) {
        console.error('❌ Error loading jobs:', error);
        console.log('🔄 Using fallback sample data');
        
        // Enhanced fallback sample data with freshness
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
                description: "Build amazing web applications with modern frameworks",
                link: "https://example.com/job1",
                source: "Sample Data",
                freshness: "Posted 2 hours ago",
                freshnessScore: 95
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
                description: "Create beautiful user experiences for digital products",
                link: "https://example.com/job2",
                source: "Sample Data",
                freshness: "Posted 1 day ago",
                freshnessScore: 80
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
                source: "Sample Data",
                freshness: "Posted 3 days ago",
                freshnessScore: 70
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
                description: "Lead product development from concept to launch",
                link: "https://example.com/job4",
                source: "Sample Data",
                freshness: "Posted 1 week ago",
                freshnessScore: 60
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
                description: "Drive marketing campaigns and brand awareness",
                link: "https://example.com/job5",
                source: "Sample Data",
                freshness: "Posted 2 weeks ago",
                freshnessScore: 50
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

// Create job card HTML with freshness indicators
function createJobCard(job) {
    const matchScore = calculateMatchScore(job);
    const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    // Freshness styling
    const freshnessClass = getFreshnessClass(job.freshnessScore);
    const freshnessIcon = getFreshnessIcon(job.freshnessScore);
    
    return `
        <div class="job-card ${freshnessClass}" data-job-id="${job.id}" data-freshness="${job.freshnessScore || 50}">
            <div class="job-badges">
                <div class="match-badge">${matchScore}% Match</div>
                ${job.freshness ? `<div class="freshness-badge ${freshnessClass}">
                    <span class="freshness-icon">${freshnessIcon}</span>
                    <span class="freshness-text">${job.freshness}</span>
                </div>` : ''}
            </div>
            <h3>${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <div class="job-details">
                <div class="job-detail">
                    <span class="job-detail-icon">📍</span>
                    <span>${job.location}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">💰</span>
                    <span>${job.salary ? `R${job.salary.min.toLocaleString()} - R${job.salary.max.toLocaleString()}/month` : 'Salary not disclosed'}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">🏢</span>
                    <span>${job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-icon">🏷️</span>
                    <span>${job.industry.charAt(0).toUpperCase() + job.industry.slice(1)}</span>
                </div>
                ${job.source ? `<div class="job-detail">
                    <span class="job-detail-icon">🔗</span>
                    <span>${job.source}</span>
                </div>` : ''}
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-actions">
                <div class="primary-actions">
                    ${isSaved ? 
                        `<button class="btn-unsave" onclick="unsaveJob('${job.id}')">Unsave</button>` :
                        `<button class="btn-save" onclick="saveJob('${job.id}')">Save Job</button>`
                    }
                    <a href="${job.link}" target="_blank" class="btn-view">View Job</a>
                </div>
                <div class="share-actions">
                    <button class="btn-share" onclick="toggleShareMenu('${job.id}')" title="Share Job">
                        <span class="share-icon">📤</span>
                    </button>
                    <div class="share-menu" id="shareMenu${job.id}" style="display: none;">
                        <button class="share-option" onclick="copyJobLink('${job.id}')" title="Copy Link">
                            <span class="share-option-icon">🔗</span>
                            <span>Copy Link</span>
                        </button>
                        <button class="share-option" onclick="shareViaWhatsApp('${job.id}')" title="Share on WhatsApp">
                            <span class="share-option-icon">💬</span>
                            <span>WhatsApp</span>
                        </button>
                        <button class="share-option" onclick="shareViaEmail('${job.id}')" title="Share via Email">
                            <span class="share-option-icon">📧</span>
                            <span>Email</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get freshness CSS class
function getFreshnessClass(freshnessScore) {
    if (!freshnessScore) return '';
    if (freshnessScore >= 90) return 'fresh-hot';
    if (freshnessScore >= 70) return 'fresh-new';
    if (freshnessScore >= 50) return 'fresh-recent';
    return 'fresh-old';
}

// Get freshness icon
function getFreshnessIcon(freshnessScore) {
    if (!freshnessScore) return '📅';
    if (freshnessScore >= 90) return '🔥';
    if (freshnessScore >= 70) return '✨';
    if (freshnessScore >= 50) return '📅';
    return '⏰';
}

// Show results status with cache and freshness info
function showResultsStatus(jobs) {
    const statusElement = document.getElementById('resultsStatus');
    if (!statusElement) return;
    
    const freshJobs = jobs.filter(job => (job.freshnessScore || 0) >= 70).length;
    const cachedJobs = jobs.filter(job => job.fromCache).length;
    const realJobs = jobs.filter(job => job.source === 'Adzuna').length;
    
    let statusText = '';
    let statusClass = '';
    
    if (realJobs > 0) {
        statusText = `${realJobs} live jobs`;
        if (freshJobs > 0) {
            statusText += `, ${freshJobs} fresh`;
        }
        if (cachedJobs > 0) {
            statusText += ` (${cachedJobs} cached for speed)`;
        }
        statusClass = 'status-live';
    } else {
        statusText = 'Sample data - complete questionnaire for real jobs';
        statusClass = 'status-sample';
    }
    
    statusElement.querySelector('.status-text').textContent = statusText;
    statusElement.className = `results-status ${statusClass}`;
    statusElement.style.display = 'flex';
}

// Job sharing functionality
window.toggleShareMenu = function toggleShareMenu(jobId) {
    console.log('📤 Toggle share menu called with ID:', jobId);
    const shareMenu = document.getElementById(`shareMenu${jobId}`);
    console.log('📋 Found share menu:', shareMenu);
    
    if (!shareMenu) {
        console.error('❌ Share menu not found for job ID:', jobId);
        return;
    }
    
    const allShareMenus = document.querySelectorAll('.share-menu');
    
    // Close all other share menus
    allShareMenus.forEach(menu => {
        if (menu.id !== `shareMenu${jobId}`) {
            menu.style.display = 'none';
        }
    });
    
    // Toggle current menu
    if (shareMenu.style.display === 'none' || shareMenu.style.display === '') {
        shareMenu.style.display = 'block';
        console.log('✅ Share menu opened');
    } else {
        shareMenu.style.display = 'none';
        console.log('✅ Share menu closed');
    }
};

window.copyJobLink = function copyJobLink(jobId) {
    const job = allJobs.find(j => j.id == jobId);
    if (!job) return;
    
    const jobUrl = job.link;
    
    // Try to copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(jobUrl).then(() => {
            showShareNotification('✅ Job link copied to clipboard!');
        }).catch(() => {
            fallbackCopyTextToClipboard(jobUrl);
        });
    } else {
        fallbackCopyTextToClipboard(jobUrl);
    }
    
    // Close share menu
    document.getElementById(`shareMenu${jobId}`).style.display = 'none';
};

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareNotification('✅ Job link copied to clipboard!');
    } catch (err) {
        showShareNotification('❌ Could not copy link. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
}

window.shareViaWhatsApp = function shareViaWhatsApp(jobId) {
    const job = allJobs.find(j => j.id == jobId);
    if (!job) return;
    
    const message = `🎯 Check out this job opportunity I found on JobLens!

*${job.title}* at *${job.company}*
📍 ${job.location}
💰 ${job.salary ? `R${job.salary.min.toLocaleString()} - R${job.salary.max.toLocaleString()}/month` : 'Salary not disclosed'}
🏢 ${job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}

${job.description.substring(0, 100)}...

Apply here: ${job.link}

---
Find your perfect job match at JobLens! 🚀`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Close share menu
    document.getElementById(`shareMenu${jobId}`).style.display = 'none';
};

window.shareViaEmail = function shareViaEmail(jobId) {
    const job = allJobs.find(j => j.id == jobId);
    if (!job) return;
    
    const subject = `Job Opportunity: ${job.title} at ${job.company}`;
    const body = `Hi there!

I found this great job opportunity on JobLens and thought you might be interested:

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary ? `R${job.salary.min.toLocaleString()} - R${job.salary.max.toLocaleString()}/month` : 'Salary not disclosed'}
Work Type: ${job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}

Description:
${job.description}

Apply here: ${job.link}

---
This job was found using JobLens - an AI-powered job matching platform for South African professionals. Find your perfect career match at: ${window.location.origin}

Best regards!`;
    
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    
    // Close share menu
    document.getElementById(`shareMenu${jobId}`).style.display = 'none';
};

function showShareNotification(message) {
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

// Close share menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.share-actions')) {
        const allShareMenus = document.querySelectorAll('.share-menu');
        allShareMenus.forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Display jobs with smart sorting
function displayJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    const noResults = document.getElementById('noResults');
    const jobCount = document.getElementById('jobCount');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    if (jobs.length === 0) {
        jobsGrid.style.display = 'none';
        noResults.style.display = 'block';
        jobCount.textContent = '0';
        return;
    }
    
    jobsGrid.style.display = 'grid';
    noResults.style.display = 'none';
    jobCount.textContent = jobs.length;
    
    // Smart sorting: combine match score and freshness
    const sortedJobs = jobs.sort((a, b) => {
        const aMatchScore = calculateMatchScore(a);
        const bMatchScore = calculateMatchScore(b);
        const aFreshness = a.freshnessScore || 50;
        const bFreshness = b.freshnessScore || 50;
        
        // Weighted score: 70% match, 30% freshness
        const aScore = (aMatchScore * 0.7) + (aFreshness * 0.3);
        const bScore = (bMatchScore * 0.7) + (bFreshness * 0.3);
        
        return bScore - aScore;
    });
    
    // Show results status
    showResultsStatus(jobs);
    
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
window.saveJob = function saveJob(jobId) {
    console.log('💾 Save job called with ID:', jobId);
    const job = allJobs.find(j => j.id === jobId);
    console.log('📋 Found job:', job);
    
    if (job && !savedJobs.some(j => j.id === jobId)) {
        savedJobs.push(job);
        // Save to localStorage for persistence
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        window.savedJobs = savedJobs;
        displayJobs(filteredJobs); // Refresh display
        
        // Show success notification
        showNotification(`${job.title} saved successfully!`);
        console.log('✅ Job saved successfully');
    } else {
        console.log('❌ Job not found or already saved');
    }
};

// Unsave job
window.unsaveJob = function unsaveJob(jobId) {
    const job = savedJobs.find(j => j.id === jobId);
    savedJobs = savedJobs.filter(job => job.id !== jobId);
    // Update localStorage
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    window.savedJobs = savedJobs;
    displayJobs(filteredJobs); // Refresh display
    
    if (job) {
        showNotification(`${job.title} removed from saved jobs.`);
    }
};

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

// Load more jobs with different search terms
async function loadMoreJobs() {
    try {
        const jobAPI = new JobAPI();
        
        // Try different search strategies to get more variety
        const searchStrategies = [
            { what: 'developer software engineer', resultsPerPage: 20 },
            { what: 'manager analyst', resultsPerPage: 15 },
            { what: 'designer marketing', resultsPerPage: 15 },
            { where: 'cape town johannesburg', resultsPerPage: 20 },
            { where: 'remote', resultsPerPage: 20 }
        ];
        
        let additionalJobs = [];
        
        for (const strategy of searchStrategies) {
            const jobs = await jobAPI.fetchAdzunaJobs(strategy);
            additionalJobs = additionalJobs.concat(jobs);
        }
        
        // Remove duplicates based on title and company
        const uniqueJobs = [];
        const seen = new Set();
        
        [...allJobs, ...additionalJobs].forEach(job => {
            const key = `${job.title}-${job.company}`.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueJobs.push(job);
            }
        });
        
        allJobs = uniqueJobs;
        console.log('📈 Expanded job list to:', allJobs.length, 'unique jobs');
        
    } catch (error) {
        console.error('Error loading additional jobs:', error);
    }
}

// Initialize
async function init() {
    console.log('🚀 Initializing JobLens Results...');
    console.log('👤 User preferences:', userPreferences);
    
    // Check if user has completed questionnaire
    if (!userPreferences) {
        console.log('❌ No user preferences found');
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
    
    // Load additional jobs for better variety
    if (allJobs.length > 0 && allJobs[0].source === 'Adzuna') {
        await loadMoreJobs();
    }
    
    filteredJobs = [...allJobs];
    displayJobs(filteredJobs);
    
    console.log('✅ JobLens initialized with', allJobs.length, 'jobs');
}

// Test function to verify functions are accessible
window.testFunctions = function() {
    console.log('🧪 Testing functions...');
    console.log('saveJob:', typeof window.saveJob);
    console.log('unsaveJob:', typeof window.unsaveJob);
    console.log('toggleShareMenu:', typeof window.toggleShareMenu);
    console.log('copyJobLink:', typeof window.copyJobLink);
    console.log('shareViaWhatsApp:', typeof window.shareViaWhatsApp);
    console.log('shareViaEmail:', typeof window.shareViaEmail);
};

// Start when page loads
init();


