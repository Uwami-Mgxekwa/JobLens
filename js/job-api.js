// JobLens API Integration
class JobAPI {
    constructor() {
        // Adzuna API credentials
        this.adzunaAppId = '8fa2433c';
        this.adzunaApiKey = '7bfe90f41e1a4956c6107888929dd5ee';
        this.baseUrl = 'https://api.adzuna.com/v1/api/jobs/za/search';
    }

    // Fetch jobs from Adzuna API
    async fetchAdzunaJobs(params = {}) {
        const {
            what = '',           // Job title/keywords
            where = '',          // Location
            page = 1,           // Page number
            resultsPerPage = 20, // Results per page
            salaryMin = null,   // Minimum salary
            salaryMax = null,   // Maximum salary
            category = null     // Job category
        } = params;

        const url = new URL(`${this.baseUrl}/${page}`);
        url.searchParams.append('app_id', this.adzunaAppId);
        url.searchParams.append('app_key', this.adzunaApiKey);
        url.searchParams.append('results_per_page', resultsPerPage);
        url.searchParams.append('content-type', 'application/json');

        if (what) url.searchParams.append('what', what);
        if (where) url.searchParams.append('where', where);
        if (salaryMin) url.searchParams.append('salary_min', salaryMin);
        if (salaryMax) url.searchParams.append('salary_max', salaryMax);
        if (category) url.searchParams.append('category', category);

        try {
            console.log('Fetching from:', url.toString());
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.transformAdzunaJobs(data.results || []);
        } catch (error) {
            console.error('Error fetching Adzuna jobs:', error);
            return [];
        }
    }

    // Transform Adzuna job format to JobLens format with freshness indicators
    transformAdzunaJobs(adzunaJobs) {
        return adzunaJobs.map((job, index) => ({
            id: `adzuna_${job.id || Date.now() + index}`,
            title: job.title || 'No title',
            company: job.company?.display_name || 'Company not specified',
            location: this.parseLocation(job.location?.display_name || 'South Africa'),
            salary: this.parseSalary(job.salary_min, job.salary_max),
            workType: this.guessWorkType(job.title, job.description),
            industry: this.mapCategory(job.category?.label),
            skills: this.extractSkills(job.description || ''),
            description: this.cleanDescription(job.description || 'No description available'),
            link: job.redirect_url || '#',
            source: 'Adzuna',
            datePosted: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
            freshness: this.calculateFreshness(job.created),
            freshnessScore: this.getFreshnessScore(job.created)
        }));
    }

    // Calculate job freshness indicator
    calculateFreshness(dateCreated) {
        if (!dateCreated) return 'Recently posted';
        
        const now = new Date();
        const posted = new Date(dateCreated);
        const diffMs = now - posted;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) return 'Posted less than 1 hour ago';
        if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Posted ${months} month${months > 1 ? 's' : ''} ago`;
        }
        
        return 'Posted over a year ago';
    }

    // Get freshness score for sorting (higher = fresher)
    getFreshnessScore(dateCreated) {
        if (!dateCreated) return 50;
        
        const now = new Date();
        const posted = new Date(dateCreated);
        const diffHours = (now - posted) / (1000 * 60 * 60);
        
        if (diffHours < 1) return 100;
        if (diffHours < 24) return 90;
        if (diffHours < 72) return 80;
        if (diffHours < 168) return 70; // 1 week
        if (diffHours < 720) return 60; // 1 month
        
        return Math.max(10, 60 - Math.floor(diffHours / 720) * 10);
    }

    // Parse location and determine work type
    parseLocation(locationStr) {
        const saLocations = [
            'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
            'Bloemfontein', 'East London', 'Pietermaritzburg', 'Kimberley', 'Polokwane'
        ];
        
        for (const city of saLocations) {
            if (locationStr.toLowerCase().includes(city.toLowerCase())) {
                return city;
            }
        }
        
        if (locationStr.toLowerCase().includes('remote')) {
            return 'Remote';
        }
        
        return locationStr || 'South Africa';
    }

    // Parse salary information
    parseSalary(salaryMin, salaryMax) {
        if (!salaryMin && !salaryMax) return null;
        
        // Convert annual to monthly (divide by 12)
        const min = salaryMin ? Math.round(salaryMin / 12) : null;
        const max = salaryMax ? Math.round(salaryMax / 12) : null;
        
        if (min && max) {
            return { min, max };
        } else if (min) {
            return { min, max: min * 1.5 }; // Estimate max as 1.5x min
        } else if (max) {
            return { min: Math.round(max * 0.7), max }; // Estimate min as 0.7x max
        }
        
        return null;
    }

    // Guess work type from job title and description
    guessWorkType(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        
        if (text.includes('remote') || text.includes('work from home')) {
            return 'remote';
        } else if (text.includes('hybrid') || text.includes('flexible')) {
            return 'hybrid';
        } else {
            return 'on-site';
        }
    }

    // Map Adzuna categories to JobLens industries
    mapCategory(categoryLabel) {
        if (!categoryLabel) return 'technology';
        
        const category = categoryLabel.toLowerCase();
        const mappings = {
            'it jobs': 'technology',
            'engineering jobs': 'engineering',
            'healthcare & nursing jobs': 'healthcare',
            'teaching jobs': 'education',
            'sales jobs': 'sales',
            'marketing jobs': 'marketing',
            'finance jobs': 'finance',
            'design jobs': 'design'
        };
        
        return mappings[category] || 'technology';
    }

    // Extract skills from job description
    extractSkills(description) {
        const commonSkills = [
            'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'html', 'css', 'typescript', 'php', 'laravel',
            'django', 'flask', 'spring', 'figma', 'sketch', 'photoshop',
            'illustrator', 'excel', 'powerpoint', 'project management', 'agile',
            'scrum', 'marketing', 'seo', 'social media', 'content writing'
        ];
        
        const text = description.toLowerCase();
        const foundSkills = commonSkills.filter(skill => 
            text.includes(skill.toLowerCase())
        );
        
        return foundSkills.length > 0 ? foundSkills : ['communication', 'teamwork'];
    }

    // Clean up job description
    cleanDescription(description) {
        return description
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim()
            .substring(0, 300) + (description.length > 300 ? '...' : '');
    }

    // Enhanced search with multiple strategies for better job variety
    async searchJobsWithVariety(userPreferences = null, maxJobs = 100) {
        console.log('🔍 Searching for diverse job opportunities...');
        
        let allJobs = [];
        const searchStrategies = this.generateSearchStrategies(userPreferences);
        
        // Check cache first
        const cacheKey = this.generateCacheKey(userPreferences, maxJobs);
        const cachedJobs = this.getFromCache(cacheKey);
        if (cachedJobs) {
            console.log('📦 Using cached jobs:', cachedJobs.length);
            return cachedJobs;
        }
        
        // Execute multiple search strategies
        for (const strategy of searchStrategies) {
            try {
                console.log(`🎯 Searching: ${strategy.description}`);
                const jobs = await this.fetchAdzunaJobs(strategy.params);
                allJobs = allJobs.concat(jobs);
                
                // Stop if we have enough jobs
                if (allJobs.length >= maxJobs) break;
                
                // Small delay to respect rate limits
                await this.delay(200);
                
            } catch (error) {
                console.warn(`⚠️ Strategy failed: ${strategy.description}`, error);
            }
        }
        
        // Remove duplicates and limit results
        const uniqueJobs = this.removeDuplicates(allJobs).slice(0, maxJobs);
        
        // Cache the results
        this.saveToCache(cacheKey, uniqueJobs);
        
        console.log('✅ Job search complete:', uniqueJobs.length, 'unique jobs found');
        return uniqueJobs;
    }

    // Generate diverse search strategies based on user preferences
    generateSearchStrategies(userPreferences) {
        const strategies = [];
        
        // Base search terms for South African job market
        const baseTerms = [
            'developer software engineer programmer',
            'manager analyst coordinator',
            'designer creative marketing',
            'sales consultant representative',
            'administrator assistant clerk',
            'technician specialist expert',
            'consultant advisor analyst',
            'executive director manager'
        ];
        
        // Location-based searches
        const saLocations = [
            'cape town', 'johannesburg', 'durban', 'pretoria', 
            'port elizabeth', 'bloemfontein', 'remote'
        ];
        
        // Industry-specific terms
        const industries = {
            technology: ['javascript', 'python', 'java', 'react', 'angular', 'node.js', 'php', 'c#'],
            finance: ['accounting', 'financial', 'banking', 'investment', 'audit'],
            healthcare: ['nurse', 'medical', 'healthcare', 'clinical', 'pharmacy'],
            education: ['teacher', 'education', 'training', 'academic', 'tutor'],
            marketing: ['marketing', 'digital', 'social media', 'content', 'seo'],
            sales: ['sales', 'business development', 'account manager', 'retail'],
            engineering: ['engineer', 'mechanical', 'electrical', 'civil', 'industrial'],
            design: ['designer', 'graphic', 'ui', 'ux', 'creative', 'art']
        };
        
        // Strategy 1: User preference-based search
        if (userPreferences) {
            if (userPreferences.skills && userPreferences.skills.length > 0) {
                strategies.push({
                    description: 'User skills-based search',
                    params: {
                        what: userPreferences.skills.slice(0, 3).join(' OR '),
                        where: userPreferences.location !== 'anywhere' ? userPreferences.location : '',
                        resultsPerPage: 25
                    }
                });
            }
            
            if (userPreferences.interests && userPreferences.interests.length > 0) {
                userPreferences.interests.forEach(interest => {
                    if (industries[interest]) {
                        strategies.push({
                            description: `${interest} industry search`,
                            params: {
                                what: industries[interest].slice(0, 3).join(' OR '),
                                resultsPerPage: 15
                            }
                        });
                    }
                });
            }
        }
        
        // Strategy 2: General broad searches
        baseTerms.forEach(term => {
            strategies.push({
                description: `General search: ${term}`,
                params: {
                    what: term,
                    resultsPerPage: 15
                }
            });
        });
        
        // Strategy 3: Location-specific searches
        saLocations.forEach(location => {
            strategies.push({
                description: `Location search: ${location}`,
                params: {
                    where: location,
                    resultsPerPage: 12
                }
            });
        });
        
        // Strategy 4: Recent high-paying jobs
        strategies.push({
            description: 'High-paying positions',
            params: {
                salaryMin: 600000, // R50k+ monthly
                resultsPerPage: 20
            }
        });
        
        // Strategy 5: Remote work opportunities
        strategies.push({
            description: 'Remote work opportunities',
            params: {
                what: 'remote work from home',
                resultsPerPage: 20
            }
        });
        
        // Shuffle strategies for variety
        return this.shuffleArray(strategies).slice(0, 8); // Limit to 8 strategies to manage API calls
    }

    // Search jobs with user preferences (legacy method for compatibility)
    async searchJobs(userPreferences = null, searchParams = {}) {
        return await this.searchJobsWithVariety(userPreferences, 50);
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    removeDuplicates(jobs) {
        const seen = new Set();
        return jobs.filter(job => {
            const key = `${job.title}-${job.company}`.toLowerCase().replace(/\s+/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    // Get job categories for filters
    getJobCategories() {
        return [
            { value: 'technology', label: 'Technology' },
            { value: 'engineering', label: 'Engineering' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'education', label: 'Education' },
            { value: 'finance', label: 'Finance' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'design', label: 'Design' }
        ];
    }
}

// Export for use in other files
window.JobAPI = JobAPI;