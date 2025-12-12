// JobLens Service Worker
const CACHE_NAME = 'joblens-v1.2';
const STATIC_CACHE = 'joblens-static-v1.2';
const DYNAMIC_CACHE = 'joblens-dynamic-v1.2';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/pages/questionnaire.html',
    '/pages/results.html',
    '/pages/dashboard.html',
    '/pages/about.html',
    '/css/base.css',
    '/css/landing.css',
    '/css/questionnaire.css',
    '/css/results.css',
    '/css/dashboard.css',
    '/css/about.css',
    '/js/questionnaire.js',
    '/js/results.js',
    '/js/dashboard.js',
    '/js/theme.js',
    '/js/job-api.js',
    '/assets/logo.jpeg',
    '/assets/jobs.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    co