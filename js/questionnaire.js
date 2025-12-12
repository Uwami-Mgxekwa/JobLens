// Current step tracking
let currentStep = 1;
const totalSteps = 5;

// Update progress bar
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Move to next step
function nextStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentStepElement.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
            }
        } else if (input.tagName === 'SELECT' && input.multiple) {
            if (input.selectedOptions.length === 0) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
            } else {
                input.style.borderColor = '';
            }
        } else if (!input.value) {
            isValid = false;
            input.style.borderColor = '#e74c3c';
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (currentStep < totalSteps) {
        currentStepElement.classList.remove('active');
        currentStep++;
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// Move to previous step
function prevStep() {
    if (currentStep > 1) {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// Geolocation functionality
function initGeolocation() {
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const locationStatus = document.getElementById('locationStatus');
    const locationSelect = document.getElementById('location');
    
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                showLocationStatus('Geolocation is not supported by this browser.', 'error');
                return;
            }
            
            this.classList.add('loading');
            this.innerHTML = '<span class="location-icon">⏳</span><span>Getting location...</span>';
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoords(latitude, longitude);
                        
                        if (city) {
                            locationSelect.value = city.toLowerCase();
                            showLocationStatus(`✅ Location detected: ${city}`, 'success');
                        } else {
                            showLocationStatus('📍 Location detected, but city not recognized. Please select manually.', 'error');
                        }
                    } catch (error) {
                        showLocationStatus('❌ Could not determine city. Please select manually.', 'error');
                    }
                    
                    this.classList.remove('loading');
                    this.innerHTML = '<span class="location-icon">📍</span><span>Use Current Location</span>';
                },
                (error) => {
                    let message = 'Location access denied. Please select manually.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location access denied. Please select manually.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location unavailable. Please select manually.';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out. Please select manually.';
                            break;
                        default:
                            message = 'Location error occurred. Please select manually.';
                            break;
                    }
                    
                    showLocationStatus(`❌ ${message}`, 'error');
                    this.classList.remove('loading');
                    this.innerHTML = '<span class="location-icon">📍</span><span>Use Current Location</span>';
                },
                { 
                    timeout: 15000, 
                    enableHighAccuracy: false, // Less accurate but faster
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    }
}

function showLocationStatus(message, type) {
    const locationStatus = document.getElementById('locationStatus');
    if (locationStatus) {
        locationStatus.textContent = message;
        locationStatus.className = `location-status ${type}`;
        locationStatus.style.display = 'block';
        
        setTimeout(() => {
            locationStatus.style.display = 'none';
        }, 5000);
    }
}

async function getCityFromCoords(lat, lon) {
    // Simple reverse geocoding - in production, use a proper service
    const saCities = {
        'johannesburg': { lat: -26.2041, lon: 28.0473 },
        'cape town': { lat: -33.9249, lon: 18.4241 },
        'durban': { lat: -29.8587, lon: 31.0218 },
        'pretoria': { lat: -25.7479, lon: 28.2293 },
        'port elizabeth': { lat: -33.9608, lon: 25.6022 },
        'bloemfontein': { lat: -29.0852, lon: 26.1596 }
    };
    
    let closestCity = null;
    let minDistance = Infinity;
    
    for (const [city, coords] of Object.entries(saCities)) {
        const distance = Math.sqrt(
            Math.pow(lat - coords.lat, 2) + Math.pow(lon - coords.lon, 2)
        );
        
        if (distance < minDistance && distance < 1) { // Within ~100km
            minDistance = distance;
            closestCity = city;
        }
    }
    
    return closestCity;
}

// Form submission with enhanced data collection
document.getElementById('preferencesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const skills = document.getElementById('skills').value;
    
    // Get selected interests from checkboxes
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(interestCheckboxes).map(cb => cb.value);
    
    const location = document.getElementById('location').value;
    const workArrangement = document.querySelector('input[name="workArrangement"]:checked')?.value || 'no-preference';
    const minSalary = parseInt(document.getElementById('minSalary').value);
    const maxSalary = parseInt(document.getElementById('maxSalary').value);
    const workType = document.querySelector('input[name="workType"]:checked').value;
    
    // Validation
    if (interests.length === 0) {
        alert('Please select at least one career interest');
        return;
    }
    
    if (minSalary > maxSalary) {
        alert('Minimum salary cannot be greater than maximum salary');
        return;
    }
    
    // Create enhanced preferences object
    const preferences = {
        skills: skills.split(',').map(skill => skill.trim().toLowerCase()),
        interests: interests,
        location: location.toLowerCase(),
        workArrangement: workArrangement,
        salaryRange: {
            min: minSalary,
            max: maxSalary
        },
        workType: workType,
        completedAt: new Date().toISOString()
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    window.userPreferences = preferences;
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Finding Your Perfect Jobs...';
    submitBtn.disabled = true;
    
    // Redirect with delay for UX
    setTimeout(() => {
        window.location.href = 'results.html';
    }, 1000);
});

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    initGeolocation();
});