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
                    <span class="avatar-icon">🤖</span>
                    <div class="pulse-ring"></div>
                </div>
                <div class="chat-tooltip">Hi! I'm your career buddy. Ask me anything! 👋</div>
            </div>
            
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="buddy-info">
                        <div class="buddy-avatar-small">🤖</div>
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
   