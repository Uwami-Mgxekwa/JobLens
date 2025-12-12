// JobLens API Integration
class JobAPI {
    constructor() {
        // Adzuna API credentials (get from https://developer.adzuna.com/)
        this.adzunaAppId = 'YOUR_APP_ID'; // Replace with your credentials
        this.adzunaApiKey = 'YOUR_API_KEY';
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

    // Transform Adzuna job format to JobLens format
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
            datePosted: job.created ? new Date(job.created).toISOString() : new Date().toISOString()
        }));
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

    // Search jobs with user preferences
    async searchJobs(userPreferences = null, searchParams = {}) {
        const params = { ...searchParams };
        
        if (userPreferences) {
            // Use user preferences to enhance search
            if (userPreferences.skills && userPreferences.skills.length > 0) {
                params.what = userPreferences.skills.join(' OR ');
            }
            
            if (userPreferences.location && userPreferences.location !== 'anywhere') {
                params.where = userPreferences.location;
            }
            
            if (userPreferences.salaryRange) {
                params.salaryMin = userPreferences.salaryRange.min * 12; // Convert monthly to annual
                params.salaryMax = userPreferences.salaryRange.max * 12;
            }
        }
        
        return await this.fetchAdzunaJobs(params);
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