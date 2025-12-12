# JobLens API Setup Guide

## 🚀 Getting Real Job Data

### Step 1: Get Adzuna API Credentials (FREE)

1. **Sign up at Adzuna Developer Portal**
   - Go to: https://developer.adzuna.com/
   - Create free account
   - Get your `APP_ID` and `API_KEY`
   - Free tier: 1000 API calls/month

2. **Update your credentials in `js/job-api.js`**
   ```javascript
   this.adzunaAppId = 'YOUR_ACTUAL_APP_ID';
   this.adzunaApiKey = 'YOUR_ACTUAL_API_KEY';
   ```

### Step 2: Update Results.js to Use Real Data

Replace the sample job loading in `js/results.js`:

```javascript
// Replace the loadJobs() function with:
async function loadJobs() {
    try {
        const jobAPI = new JobAPI();
        
        // Search for jobs based on user preferences
        allJobs = await jobAPI.searchJobs(userPreferences, {
            resultsPerPage: 50,
            page: 1
        });
        
        console.log('Real jobs loaded:', allJobs.length);
        
        // Fallback to sample data if API fails
        if (allJobs.length === 0) {
            console.log('Using fallback sample data');
            // Keep your existing sample data as fallback
        }
        
    } catch (error) {
        console.error('Error loading real jobs:', error);
        // Use sample data as fallback
    }
}
```

### Step 3: Add API Script to HTML Files

Add this line to all your HTML files (before other JS files):

```html
<script src="../js/job-api.js"></script>
```

### Step 4: Test the Integration

1. **Start your local server**: `start-server.bat`
2. **Open browser console** (F12)
3. **Complete questionnaire** - should fetch real SA jobs
4. **Check console logs** for API responses

## 🔧 Advanced Features

### Search by Location
```javascript
// Cape Town tech jobs
const jobs = await jobAPI.searchJobs(null, {
    what: 'developer',
    where: 'cape town',
    resultsPerPage: 20
});
```

### Search by Salary Range
```javascript
// High-paying jobs (R100k+ monthly = R1.2M+ annual)
const jobs = await jobAPI.searchJobs(null, {
    salaryMin: 1200000,
    resultsPerPage: 20
});
```

### Filter by Keywords
```javascript
// Remote JavaScript jobs
const jobs = await jobAPI.searchJobs(null, {
    what: 'javascript remote',
    resultsPerPage: 20
});
```

## 📊 Expected Results

With Adzuna API, you'll get:
- ✅ **Real South African jobs** from major job sites
- ✅ **Up-to-date listings** (posted within days/weeks)
- ✅ **Salary information** (when available)
- ✅ **Company details** and direct application links
- ✅ **1000+ jobs per month** on free tier

## 🚨 Important Notes

1. **Rate Limits**: Free tier = 1000 calls/month
2. **CORS**: May need to implement server-side proxy for production
3. **Backup Data**: Always keep sample data as fallback
4. **Legal**: Adzuna API is legal and designed for this use case

## 🔄 Next Steps

1. **Get API credentials** (5 minutes)
2. **Update job-api.js** with your keys
3. **Test integration** 
4. **Add more job sources** (Indeed, LinkedIn APIs)
5. **Build employer portal** for direct job submissions

## 💡 Pro Tips

- **Cache API responses** to reduce API calls
- **Implement pagination** for better UX
- **Add job freshness indicators** (posted 2 days ago)
- **Store popular searches** to optimize API usage
- **Consider upgrading** to paid tier for production (£149/month for unlimited)

Ready to get real job data? Start with Step 1! 🎯