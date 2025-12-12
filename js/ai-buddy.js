// JobLens AI Buddy - Personal Career Assistant
class AIBuddy {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.userName = localStorage.getItem('userName') || null;
        this.userPreferences = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.createChatWidget();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    loadUserData() {
        try {
            const prefs = localStorage.getItem('userPreferences');
            this.userPreferences = prefs ? JSON.parse(prefs) : null;
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    createChatWidget() {
        // Create chat widget HTML
        const chatWidget = document.createElement('div');
        chatWidget.id = 'aiBuddyWidget';
        chatWidget.innerHTML = `
            <div class="chat-toggle" id="chatToggle">
                <div class="buddy-avatar">
                    <img src="assets/bot.png" alt="Career Buddy" class="avatar-image">
                    <div class="pulse-ring"></div>
                </div>
                <div class="chat-tooltip">Hi! I'm your career buddy. Ask me anything! 👋</div>
            </div>
            
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="buddy-info">
                        <div class="buddy-avatar-small">🎯</div>
                        <div class="buddy-details">
                            <h4>Career Buddy</h4>
                            <span class="status">Online • Ready to help</span>
                        </div>
                    </div>
                    <button class="close-chat" id="closeChat">×</button>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="welcome-message">
                        <div class="message buddy-message">
                            <div class="message-content">
                                <p>Hey there! 👋 I'm your personal career buddy!</p>
                                <p>I'm here to help you with:</p>
                                <ul>
                                    <li>🎯 Finding the perfect job match</li>
                                    <li>📝 Resume and interview tips</li>
                                    <li>💼 Career advice and guidance</li>
                                    <li>🚀 Skill development suggestions</li>
                                </ul>
                                <p>What would you like to know? 😊</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="quick-actions" id="quickActions">
                    <button class="quick-btn" data-action="job-tips">Job Search Tips</button>
                    <button class="quick-btn" data-action="resume-help">Resume Help</button>
                    <button class="quick-btn" data-action="interview-prep">Interview Prep</button>
                    <button class="quick-btn" data-action="salary-advice">Salary Advice</button>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <input type="text" id="chatInput" placeholder="Ask me anything about your career..." maxlength="500">
                        <button id="sendMessage" disabled>
                            <span class="send-icon">➤</span>
                        </button>
                    </div>
                    <div class="input-suggestions" id="inputSuggestions"></div>
                </div>
            </div>
        `;

        // Add styles
        this.addChatStyles();
        
        // Add to body
        document.body.appendChild(chatWidget);
        
        // Store references
        this.chatToggle = document.getElementById('chatToggle');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
    }

    addChatStyles() {
        const styles = `
            #aiBuddyWidget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
            }
            
            .chat-toggle {
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .buddy-avatar {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, var(--primary-green), var(--neon-green));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(46, 204, 113, 0.4);
                position: relative;
                animation: bounce 2s infinite;
            }
            
            .avatar-icon {
                font-size: 1.8rem;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
            }
            
            .pulse-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid var(--primary-green);
                border-radius: 50%;
                animation: pulse 2s infinite;
                opacity: 0.6;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.2); opacity: 0.3; }
                100% { transform: scale(1.4); opacity: 0; }
            }
            
            .chat-tooltip {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: var(--bg-primary);
                color: var(--text-primary);
                padding: 0.75rem 1rem;
                border-radius: 12px;
                box-shadow: 0 4px 20px var(--shadow);
                border: 1px solid var(--border-color);
                font-size: 0.9rem;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            }
            
            .chat-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                right: 20px;
                border: 8px solid transparent;
                border-top-color: var(--bg-primary);
            }
            
            .chat-toggle:hover .chat-tooltip {
                opacity: 1;
                transform: translateY(0);
            }
            
            .chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: var(--bg-primary);
                border-radius: 16px;
                box-shadow: 0 10px 40px var(--shadow-hover);
                border: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                transform: scale(0.8) translateY(20px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .chat-window.open {
                transform: scale(1) translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .chat-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, var(--primary-green), var(--neon-green));
                color: white;
                border-radius: 16px 16px 0 0;
            }
            
            .buddy-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .buddy-avatar-small {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }
            
            .buddy-details h4 {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
            }
            
            .status {
                font-size: 0.8rem;
                opacity: 0.9;
            }
            
            .close-chat {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .close-chat:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .chat-messages {
                flex: 1;
                padding: 1rem;
                overflow-y: auto;
                scroll-behavior: smooth;
            }
            
            .message {
                margin-bottom: 1rem;
                display: flex;
                flex-direction: column;
            }
            
            .buddy-message .message-content {
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 0.75rem 1rem;
                border-radius: 12px 12px 12px 4px;
                max-width: 85%;
                align-self: flex-start;
            }
            
            .user-message .message-content {
                background: linear-gradient(135deg, var(--primary-green), var(--neon-green));
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 12px 12px 4px 12px;
                max-width: 85%;
                align-self: flex-end;
            }
            
            .message-content p {
                margin: 0 0 0.5rem 0;
            }
            
            .message-content p:last-child {
                margin-bottom: 0;
            }
            
            .message-content ul {
                margin: 0.5rem 0;
                padding-left: 1.2rem;
            }
            
            .message-content li {
                margin-bottom: 0.25rem;
            }
            
            .quick-actions {
                padding: 0.75rem 1rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .quick-btn {
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                color: var(--text-primary);
                padding: 0.4rem 0.8rem;
                border-radius: 20px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .quick-btn:hover {
                background: var(--primary-green);
                color: white;
                border-color: var(--primary-green);
            }
            
            .chat-input-container {
                padding: 1rem;
                border-top: 1px solid var(--border-color);
            }
            
            .chat-input-wrapper {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            
            #chatInput {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 2px solid var(--border-color);
                border-radius: 25px;
                font-size: 0.9rem;
                background: var(--bg-primary);
                color: var(--text-primary);
                transition: border-color 0.3s ease;
            }
            
            #chatInput:focus {
                outline: none;
                border-color: var(--primary-green);
            }
            
            #sendMessage {
                width: 40px;
                height: 40px;
                background: var(--primary-green);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            #sendMessage:hover:not(:disabled) {
                background: var(--neon-green);
                transform: scale(1.1);
            }
            
            #sendMessage:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                background: var(--bg-secondary);
                border-radius: 12px 12px 12px 4px;
                max-width: 85%;
                margin-bottom: 1rem;
            }
            
            .typing-dots {
                display: flex;
                gap: 0.25rem;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                background: var(--text-secondary);
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            
            /* Mobile responsiveness */
            @media (max-width: 768px) {
                #aiBuddyWidget {
                    bottom: 10px;
                    right: 10px;
                }
                
                .chat-window {
                    width: calc(100vw - 20px);
                    height: 70vh;
                    right: -10px;
                }
                
                .chat-tooltip {
                    display: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    setupEventListeners() {
        // Toggle chat
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Close chat
        document.getElementById('closeChat').addEventListener('click', () => this.closeChat());
        
        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Enable/disable send button
        this.chatInput.addEventListener('input', () => {
            this.sendButton.disabled = !this.chatInput.value.trim();
        });
        
        // Quick action buttons
        document.getElementById('quickActions').addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !document.getElementById('aiBuddyWidget').contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatWindow.classList.add('open');
        this.chatInput.focus();
        
        // Hide tooltip
        const tooltip = document.querySelector('.chat-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
        
        // Greet user if first time
        if (!this.userName && this.conversationHistory.length === 0) {
            setTimeout(() => this.askForName(), 1000);
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('open');
        
        // Show tooltip again
        setTimeout(() => {
            const tooltip = document.querySelector('.chat-tooltip');
            if (tooltip) {
                tooltip.style.display = 'block';
            }
        }, 300);
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.sendButton.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response
        const response = await this.generateResponse(message);
        
        // Remove typing indicator and add response
        this.hideTypingIndicator();
        this.addMessage(response, 'buddy');
        
        // Save conversation
        this.saveConversation();
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessage(content)}
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({ content, sender, timestamp: Date.now() });
    }

    formatMessage(content) {
        // Convert markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>Career Buddy is typing...</span>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async generateResponse(message) {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const lowerMessage = message.toLowerCase();
        
        // Name handling
        if (!this.userName && (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ") || lowerMessage.includes("i am "))) {
            const nameMatch = message.match(/(?:my name is|i'm|i am)\s+([a-zA-Z]+)/i);
            if (nameMatch) {
                this.userName = nameMatch[1];
                localStorage.setItem('userName', this.userName);
                return `Nice to meet you, ${this.userName}! 😊 I'm excited to help you with your career journey. What would you like to know about job searching or career development?`;
            }
        }
        
        // Contextual responses based on user preferences
        if (this.userPreferences) {
            if (lowerMessage.includes('my skills') || lowerMessage.includes('what skills')) {
                return `Based on your profile, I see you have skills in: **${this.userPreferences.skills.join(', ')}**. These are great! 

To make yourself even more competitive, consider learning:
- **Cloud platforms** (AWS, Azure) - high demand
- **Data analysis** tools - valuable across industries  
- **Project management** - always needed
- **Communication skills** - essential for career growth

Would you like specific learning resources for any of these?`;
            }
            
            if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
                const avgSalary = Math.round((this.userPreferences.salaryRange.min + this.userPreferences.salaryRange.max) / 2);
                return `Your target salary range of **R${this.userPreferences.salaryRange.min.toLocaleString()} - R${this.userPreferences.salaryRange.max.toLocaleString()}** is realistic for your skills! 💰

**Salary negotiation tips:**
- Research market rates on PayScale/Glassdoor
- Highlight your unique value proposition
- Consider the full package (benefits, growth, culture)
- Practice your pitch beforehand
- Be confident but flexible

Want me to help you prepare for salary negotiations?`;
            }
        }
        
        // Job search advice
        if (lowerMessage.includes('job search') || lowerMessage.includes('find job') || lowerMessage.includes('looking for work')) {
            return `Great question! Here's my **proven job search strategy**: 🎯

**1. Optimize your online presence**
- Update LinkedIn with keywords from job descriptions
- Create a portfolio showcasing your best work
- Get recommendations from colleagues

**2. Network strategically**  
- Attend industry meetups and conferences
- Connect with people in your target companies
- Join professional groups on LinkedIn

**3. Apply smart, not hard**
- Quality over quantity - tailor each application
- Follow up within a week
- Track your applications

**4. Prepare thoroughly**
- Research the company culture and values
- Practice common interview questions
- Prepare thoughtful questions to ask them

Which area would you like me to dive deeper into?`;
        }
        
        // Resume help
        if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
            return `Let me help you create a **standout resume**! 📄

**Essential sections:**
- **Contact info** (phone, email, LinkedIn, portfolio)
- **Professional summary** (2-3 lines highlighting your value)
- **Key skills** (match job descriptions)
- **Work experience** (focus on achievements, not duties)
- **Education & certifications**

**Pro tips:**
- Use **action verbs** (achieved, implemented, optimized)
- **Quantify results** (increased sales by 25%, managed team of 8)
- Keep it **1-2 pages** max
- Use **ATS-friendly format** (simple, clean design)
- **Customize** for each application

Want me to review a specific section or help with formatting?`;
        }
        
        // Interview preparation
        if (lowerMessage.includes('interview') || lowerMessage.includes('interview prep')) {
            return `Interview prep is crucial! Let me help you **ace it**: 🌟

**Before the interview:**
- Research the company, role, and interviewer
- Prepare 5-7 thoughtful questions
- Practice your elevator pitch
- Plan your outfit and route

**Common questions to prepare:**
- "Tell me about yourself"
- "Why do you want this role?"
- "What's your greatest strength/weakness?"
- "Where do you see yourself in 5 years?"
- "Why are you leaving your current job?"

**STAR method for behavioral questions:**
- **Situation** - Set the context
- **Task** - Explain your responsibility  
- **Action** - Describe what you did
- **Result** - Share the outcome

**After the interview:**
- Send a thank-you email within 24 hours
- Reiterate your interest and key qualifications

Want to practice answering any specific questions?`;
        }
        
        // Career advice
        if (lowerMessage.includes('career') || lowerMessage.includes('growth') || lowerMessage.includes('promotion')) {
            return `Career growth is a journey, not a destination! 🚀 Here's how to **accelerate yours**:

**Short-term (3-6 months):**
- Set clear, measurable goals
- Seek feedback from your manager
- Take on stretch assignments
- Build relationships across departments

**Medium-term (6-18 months):**
- Develop leadership skills
- Mentor junior colleagues  
- Lead a project or initiative
- Expand your network outside the company

**Long-term (1-3 years):**
- Consider additional certifications
- Explore lateral moves for broader experience
- Build your personal brand
- Stay updated on industry trends

**Remember:** Career growth isn't always vertical. Sometimes the best opportunities come from sideways moves that broaden your skills!

What specific career goal are you working toward?`;
        }
        
        // Skills development
        if (lowerMessage.includes('skills') || lowerMessage.includes('learn') || lowerMessage.includes('training')) {
            return `Continuous learning is key to career success! 📚 Here are **high-impact skills** to develop:

**Technical skills (if applicable):**
- Cloud computing (AWS, Azure, Google Cloud)
- Data analysis (Python, R, SQL, Excel)
- Digital marketing (SEO, Google Analytics, social media)
- Project management tools (Asana, Jira, Monday.com)

**Soft skills (universal):**
- **Communication** - written, verbal, presentation
- **Leadership** - even if you're not a manager yet
- **Problem-solving** - critical thinking and creativity
- **Emotional intelligence** - understanding people and situations
- **Adaptability** - thriving in change

**Learning resources:**
- **Free:** Coursera, edX, YouTube, LinkedIn Learning
- **Paid:** Udemy, Pluralsight, MasterClass
- **Hands-on:** Volunteer projects, side hustles, hackathons

What skill would you like to develop first? I can suggest specific resources!`;
        }
        
        // Networking advice
        if (lowerMessage.includes('network') || lowerMessage.includes('connections')) {
            return `Networking isn't about using people - it's about **building genuine relationships**! 🤝

**Online networking:**
- **LinkedIn:** Connect with colleagues, classmates, industry leaders
- **Twitter:** Follow and engage with thought leaders
- **Industry forums:** Join discussions in your field
- **Professional groups:** Facebook groups, Slack communities

**Offline networking:**
- **Industry events:** Conferences, meetups, workshops
- **Alumni networks:** Reach out to school connections
- **Professional associations:** Join relevant organizations
- **Volunteer work:** Meet like-minded professionals

**Networking tips:**
- **Give before you get** - offer help, share resources
- **Be authentic** - people can sense fake interest
- **Follow up** - send a personalized message after meeting
- **Stay in touch** - regular check-ins, not just when you need something

**Conversation starters:**
- "What trends are you seeing in [industry]?"
- "What's the most exciting project you're working on?"
- "How did you get started in [field]?"

Want help crafting networking messages or preparing for events?`;
        }
        
        // Default responses
        const defaultResponses = [
            `That's a great question! ${this.userName ? this.userName + ', ' : ''}I'd love to help you with that. Could you be more specific about what aspect you'd like to focus on? 🤔`,
            
            `Interesting! ${this.userName ? this.userName + ', ' : ''}I want to give you the best advice possible. Can you tell me more about your specific situation? 💭`,
            
            `I'm here to help! ${this.userName ? this.userName + ', ' : ''}While I think about that, here are some areas I'm great at:
            
- **Job search strategies** and application tips
- **Resume and cover letter** optimization  
- **Interview preparation** and practice
- **Career planning** and goal setting
- **Salary negotiation** techniques
- **Networking** and relationship building
- **Skills development** recommendations

What would you like to explore? 😊`,
            
            `That's an important topic! ${this.userName ? this.userName + ', ' : ''}I want to make sure I give you actionable advice. Could you share more context about your current situation or specific challenges? 🎯`
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    handleQuickAction(action) {
        const actions = {
            'job-tips': "I'd love to share some job search tips! What specific area would you like help with - finding opportunities, applications, or interview prep?",
            'resume-help': "Let's make your resume stand out! Are you starting from scratch, updating an existing resume, or need help with a specific section?",
            'interview-prep': "Interview preparation is so important! Are you preparing for a specific interview, or would you like general interview strategies?",
            'salary-advice': "Salary discussions can be tricky! Are you negotiating a new offer, asking for a raise, or researching market rates?"
        };
        
        const message = actions[action];
        if (message) {
            this.addMessage(message, 'buddy');
            this.saveConversation();
        }
    }

    askForName() {
        const greeting = `Hi there! 👋 I'm your personal career buddy, and I'm here to help you succeed! 

I'd love to get to know you better - what's your name? This way I can personalize our conversations and give you more targeted advice! 😊`;
        
        this.addMessage(greeting, 'buddy');
        this.saveConversation();
    }

    saveConversation() {
        try {
            localStorage.setItem('aiBuddyConversation', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('aiBuddyConversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                
                // Restore messages (limit to last 10 for performance)
                const recentMessages = this.conversationHistory.slice(-10);
                recentMessages.forEach(msg => {
                    if (msg.sender !== 'system') {
                        this.addMessageToDOM(msg.content, msg.sender);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    addMessageToDOM(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessage(content)}
            </div>
        `;
        
        // Insert before welcome message
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            this.chatMessages.insertBefore(messageDiv, welcomeMessage.nextSibling);
        } else {
            this.chatMessages.appendChild(messageDiv);
        }
    }
}

// Initialize AI Buddy when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiBuddy = new AIBuddy();
});

// Export for use in other files
window.AIBuddy = AIBuddy;