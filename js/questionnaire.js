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

// Form submission
document.getElementById('preferencesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const skills = document.getElementById('skills').value;
    const interestsSelect = document.getElementById('interests');
    const interests = Array.from(interestsSelect.selectedOptions).map(option => option.value);
    const location = document.getElementById('location').value;
    const minSalary = parseInt(document.getElementById('minSalary').value);
    const maxSalary = parseInt(document.getElementById('maxSalary').value);
    const workType = document.querySelector('input[name="workType"]:checked').value;
    
    // Validate salary range
    if (minSalary > maxSalary) {
        alert('Minimum salary cannot be greater than maximum salary');
        return;
    }
    
    // Create preferences object
    const preferences = {
        skills: skills.split(',').map(skill => skill.trim().toLowerCase()),
        interests: interests,
        location: location.toLowerCase(),
        salaryRange: {
            min: minSalary,
            max: maxSalary
        },
        workType: workType
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    window.userPreferences = preferences;
    
    // Redirect to results page
    window.location.href = 'results.html';
});

// Initialize progress bar
updateProgress();