const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const nextScenarioBtn = document.getElementById('next-scenario-btn');
const inputArea = document.getElementById('input-area');
const clearBtn = document.getElementById('clear-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const infoBtn = document.getElementById('info-btn');
const toolsModal = document.getElementById('tools-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const creditBtn = document.getElementById('credit-btn');
const creditModal = document.getElementById('credit-modal');
const closeCreditBtn = document.getElementById('close-credit-btn');
const addScenarioBtn = document.getElementById('add-scenario-btn');
const submitScenarioModal = document.getElementById('submit-scenario-modal');
const closeSubmitModalBtn = document.getElementById('close-submit-modal-btn');
const scenarioTextInput = document.getElementById('scenario-text-input');
const charCounter = document.getElementById('char-counter');
const submitScenarioBtn = document.getElementById('submit-scenario-btn');
const submitFormView = document.getElementById('submit-form-view');
const submitSuccessView = document.getElementById('submit-success-view');
const practiceNowBtn = document.getElementById('practice-now-btn');
const practiceLaterBtn = document.getElementById('practice-later-btn');

let completedSimulations = 0;
let sessionId = Math.random().toString(36).substring(2, 15);
let currentDifficulty = 'medium'; // default
let isGenerating = false; // מונע שליחות כפולות ומרובות

// Called by the difficulty buttons in welcome screen
window.startSimulation = function(difficulty) {
    currentDifficulty = difficulty;
    welcomeScreen.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    
    // Hide input area initially for 'easy' mode until we know if options are needed, 
    // actually, let's just send the message.
    if (difficulty === 'easy') {
        inputArea.classList.add('hidden');
    }
    sendMessage("התחל סימולציה ראשונה");
};

nextScenarioBtn.addEventListener('click', () => {
    nextScenarioBtn.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.classList.add('hidden');
    
    if (currentDifficulty !== 'easy') {
        inputArea.classList.remove('hidden');
    }
    
    sendMessage("מוכנה לתרחיש הבא. הצג תרחיש חדש ושאלה.");
});

if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
        analyzeBtn.classList.add('hidden');
        nextScenarioBtn.classList.add('hidden');
        completedSimulations = 0; // איפוס המונה כדי שהכפתור יופיע רק בעוד 3 סימולציות
        sendMessage("[ANALYZE_PATTERNS]");
    });
}

if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        toolsModal.classList.remove('hidden');
    });
}

// ===== Scenario Submission =====
let lastSubmittedScenario = null;

if (addScenarioBtn) {
    addScenarioBtn.addEventListener('click', () => {
        // Reset modal state
        submitFormView.classList.remove('hidden');
        submitSuccessView.classList.add('hidden');
        scenarioTextInput.value = '';
        charCounter.textContent = '0 / 300';
        submitScenarioModal.classList.remove('hidden');
    });
}

if (closeSubmitModalBtn) {
    closeSubmitModalBtn.addEventListener('click', () => {
        submitScenarioModal.classList.add('hidden');
    });
}

if (scenarioTextInput) {
    scenarioTextInput.addEventListener('input', () => {
        const len = scenarioTextInput.value.length;
        charCounter.textContent = `${len} / 300`;
        charCounter.style.color = len > 270 ? '#EF4444' : 'var(--text-muted)';
        scenarioTextInput.style.borderColor = len > 0 ? 'var(--primary-color)' : '#D1D5DB';
    });
}

if (submitScenarioBtn) {
    submitScenarioBtn.addEventListener('click', async () => {
        const text = scenarioTextInput.value.trim();
        if (text.length < 10) {
            scenarioTextInput.style.borderColor = '#EF4444';
            return;
        }
        submitScenarioBtn.disabled = true;
        submitScenarioBtn.textContent = 'שומרת...';
        try {
            const res = await fetch('/api/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.success) {
                lastSubmittedScenario = data.scenario;
                submitFormView.classList.add('hidden');
                submitSuccessView.classList.remove('hidden');
            }
        } catch(e) {
            alert('שגיאה בשמירת התרחיש. נסי שוב.');
        }
        submitScenarioBtn.disabled = false;
        submitScenarioBtn.textContent = 'שלחי תרחיש';
    });
}

if (practiceNowBtn) {
    practiceNowBtn.addEventListener('click', () => {
        submitScenarioModal.classList.add('hidden');
        if (lastSubmittedScenario) {
            startSimulationOnScenario(lastSubmittedScenario.text, 'medium');
        }
    });
}

if (practiceLaterBtn) {
    practiceLaterBtn.addEventListener('click', () => {
        submitScenarioModal.classList.add('hidden');
    });
}

window.startSimulationOnScenario = function(scenarioText, difficulty) {
    currentDifficulty = difficulty;
    welcomeScreen.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    if (difficulty === 'easy') {
        inputArea.classList.add('hidden');
    } else {
        inputArea.classList.remove('hidden');
    }
    sendMessage(`התחל סימולציה על בסיס התרחיש הבא: ${scenarioText}`);
};

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        toolsModal.classList.add('hidden');
        document.getElementById('tools-list-view').classList.remove('hidden');
        document.getElementById('tool-detail-view').classList.add('hidden');
    });
}

if (creditBtn) {
    creditBtn.addEventListener('click', () => {
        creditModal.classList.remove('hidden');
    });
}

if (closeCreditBtn) {
    closeCreditBtn.addEventListener('click', () => {
        creditModal.classList.add('hidden');
    });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === toolsModal) {
        toolsModal.classList.add('hidden');
        document.getElementById('tools-list-view').classList.remove('hidden');
        document.getElementById('tool-detail-view').classList.add('hidden');
    }
    if (e.target === creditModal) {
        creditModal.classList.add('hidden');
    }
});

// Tools Data
const toolsData = [
    { 
        name: 'אפר"ת', 
        purpose: 'מניעת תגובות אוטומטיות ואמוציונליות.', 
        steps: [
            '<strong>אירוע:</strong> מה קרה באופן אובייקטיבי?',
            '<strong>פרשנות:</strong> איזו משמעות אישית נתתי לזה?',
            '<strong>רגש:</strong> מה הרגשתי בעקבות הפרשנות?',
            '<strong>תגובה:</strong> איך הגבתי בסוף?'
        ]
    },
    { 
        name: 'פירמידת התגובות', 
        purpose: 'התערבות הדרגתית, שקטה ומינימלית.', 
        steps: [
            'התעלמות מכוונת (אם אפשרי).',
            'תגובה לא מילולית (מבט, התקרבות פיזית).',
            'תגובה מילולית שקטה (לחישה, הוראה אישית).',
            'רק אם אין ברירה - הסלמה ועצירת השיעור.'
        ]
    },
    { 
        name: 'משמעת טעונה', 
        purpose: 'הצבת גבול מיידי במצב טעון במקום להישאב לאמוציות ולמאבקי כוח.', 
        steps: [
            'להעביר את המסר באופן קצר, ברור ונטול רגש (כמו "רובוט").',
            'לדלג על מילות שאלה: "למה אתה בטלפון?", "כמה פעמים אמרתי?"',
            'דוגמה: "טל, את הטלפון בבקשה להכניס לתיק עכשיו"',
            'חזרה עקבית על ההוראה ("התקליט השבור") אם הילד מנסה לגרור לויכוח ("לא מעניין אותי מי התחיל, תניח את המספריים").'
        ]
    },
    { 
        name: 'תוצאות הגיוניות', 
        purpose: 'ללמד את הילד לקחת אחריות על מעשיו דרך קשר לוגי.', 
        steps: [
            'התוצאה חייבת להיות קשורה למעשה (לכלכך -> לנקות).',
            'התוצאה צריכה להיות סבירה והגיונית (ולא עונש שרירותי או מוגזם).',
            'יידוע מראש - "אם תמשיך להפריע עם הכדור, תצטרך לשים אותו בצד".'
        ]
    },
    { 
        name: 'MtC (Moment to Choose)', 
        purpose: 'יצירת "רווח" בין הגירוי לתגובה כדי להחזיר שליטה עצמית.', 
        steps: [
            'זיהוי טריגר פיזי או רגשי (דופק עולה, כעס).',
            'עצירה אקטיבית: נשימה, ספירה עד 3, או התרחקות.',
            'בחירת התגובה ממקום רציונלי ומקצועי.'
        ]
    },
    { 
        name: 'גישור צעיר', 
        purpose: 'העברת האחריות לפתרון הסכסוך מהמורה אל התלמידים.', 
        steps: [
            'המורה אינו "שופט" שקובע מי אשם.',
            'כל צד מקבל הזדמנות לדבר בלי הפרעה.',
            'התלמידים מתבקשים להציע פתרונות בעצמם לבעיה.'
        ]
    },
    { 
        name: 'L.A.S.T (שיחות הורים)', 
        purpose: 'מודל 4 שלבים לניהול שיחות קשות או טעונות עם הורים.', 
        steps: [
            '<strong>Listen:</strong> הקשבה מלאה לטענות (ללא קטיעה והתגוננות).',
            '<strong>Acknowledge:</strong> מתן תוקף לקושי ("אני מבינה שאתם מודאגים").',
            '<strong>Solve:</strong> מעבר לחשיבה על פתרון משותף ("איך נוכל לעזור לו יחד?").',
            '<strong>Thank:</strong> הודיה על השיתוף והאכפתיות.'
        ]
    },
    { 
        name: 'שיטת ה.ג.ב', 
        purpose: 'הצבת גבול תקיף אך מכיל, שמונע התנגדות אקטיבית.', 
        steps: [
            '<strong>הכרה:</strong> שיקוף הרגש והצורך ("אני מבינה שאתה נורא כועס עכשיו").',
            '<strong>גבול:</strong> ענייני וברור ("אבל אסור להכות חברים בכיתה").',
            '<strong>בחירה:</strong> מתן אלטרנטיבה ("אתה יכול לצייר, או לצאת להירגע בחוץ").'
        ]
    },
    { 
        name: 'להפוך קושי לצורך', 
        purpose: 'ללמוד לדבר במונחים של צרכים במקום תלונות (רלוונטי גם בתקשורת של מבוגרים).', 
        steps: [
            'כאשר עולה תלונה ("קשה לי", "לקחו לי", "לא פייר").',
            'יש לכוון ולשאול: "הבנתי שקשה, אבל מה אתה <strong>צריך</strong> כרגע כדי להצליח".',
            'לעודד את התלמיד/האדם לומר בעצמו למה הוא זקוק (למשל: "אני צריך מקום שקט", "אני זקוקה שיקשיבו לי", "אני צריך עזרה/ליווי").'
        ]
    }
];

const toolsLinksContainer = document.getElementById('tools-links-container');
const toolsListView = document.getElementById('tools-list-view');
const toolDetailView = document.getElementById('tool-detail-view');
const backToToolsBtn = document.getElementById('back-to-tools-btn');
const toolDetailTitle = document.getElementById('tool-detail-title');
const toolDetailContent = document.getElementById('tool-detail-content');

// Populate the tools menu
toolsData.forEach(tool => {
    const link = document.createElement('a');
    link.className = 'tool-link';
    link.innerText = tool.name;
    link.onclick = () => {
        toolsListView.classList.add('hidden');
        toolDetailView.classList.remove('hidden');
        
        if (tool.subtitle) {
            toolDetailTitle.innerHTML = `${tool.name}<div style="font-size: 1.1rem; font-weight: 600; color: var(--text-muted); margin-top: 5px;">${tool.subtitle}</div>`;
        } else {
            toolDetailTitle.innerText = tool.name;
        }
        
        let contentHtml = `<strong class="section-title">מטרה:</strong> ${tool.purpose}`;
        contentHtml += `<strong class="section-title">שלבים ונקודות מרכזיות:</strong><ul>`;
        tool.steps.forEach(step => {
            contentHtml += `<li>${step}</li>`;
        });
        contentHtml += `</ul>`;
        
        toolDetailContent.innerHTML = contentHtml;
    };
    toolsLinksContainer.appendChild(link);
});

// Back button logic
backToToolsBtn.onclick = () => {
    toolsListView.classList.remove('hidden');
    toolDetailView.classList.add('hidden');
};

sendBtn.addEventListener('click', () => {
    if (isGenerating) return;
    const text = userInput.value.trim();
    if (text) {
        addMessageToChat(text, 'user');
        userInput.value = '';
        sendMessage(text);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!isGenerating) {
            sendBtn.click();
        }
    }
});

window.sendOption = function(text) {
    if (isGenerating) return; // מניעת לחיצה כפולה מהירה
    
    // Remove the buttons from the chat to prevent double clicking
    const optionsContainers = document.querySelectorAll('.options-container');
    optionsContainers.forEach(container => {
        container.style.display = 'none';
    });
    
    addMessageToChat(text, 'user');
    sendMessage(text);
};

function addMessageToChat(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender + '-message');
    
    let formattedText = text.replace(/\n/g, '<br>');
    // Replace **text** with <strong>text</strong> (handles newlines too)
    formattedText = formattedText.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
    // Replace *text* with <strong>text</strong> (AI sometimes uses single asterisks for bold)
    formattedText = formattedText.replace(/(^|\s)\*([^\*\s][^\*]*[^\*\s]|[^\*\s])\*(\s|$)/g, '$1<strong>$2</strong>$3');
    // Replace bullet point asterisks with real bullets
    formattedText = formattedText.replace(/(<br>|^)\*\s/g, '$1• ');
    // Parse Easy Mode Options: [אפשרות 1: טקסט]
    const optionRegex = /\[אפשרות \d:\s*(.*?)\]/g;
    let match;
    let options = [];
    
    if (sender === 'model' && currentDifficulty === 'easy') {
        while ((match = optionRegex.exec(text)) !== null) {
            options.push(match[1]);
        }
        // Remove the option brackets from the displayed text
        formattedText = formattedText.replace(/\[אפשרות \d:\s*(.*?)\]/g, '');
    }

    msgDiv.innerHTML = formattedText;
    chatBox.appendChild(msgDiv);
    
    // If there are options, append buttons below the message
    if (options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options-container');
        optionsDiv.style.display = 'flex';
        optionsDiv.style.flexDirection = 'column';
        optionsDiv.style.gap = '8px';
        optionsDiv.style.marginTop = '15px';
        
        const borderColors = ['#3B82F6', '#8B5CF6', '#10B981']; // כחול, סגול, ירוק
        const bgColors = ['#EFF6FF', '#F5F3FF', '#ECFDF5']; // רקעים תואמים בהירים

        options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn option-btn';
            btn.style.backgroundColor = bgColors[index % 3];
            btn.style.color = '#1F2937';
            btn.style.textAlign = 'right';
            btn.style.border = `2px solid ${borderColors[index % 3]}`;
            btn.style.padding = '14px 18px';
            btn.style.borderRadius = '12px';
            btn.style.fontSize = '1.05rem';
            btn.style.lineHeight = '1.5';
            btn.style.fontWeight = '600';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            btn.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            // Hover effect is now handled purely via CSS
            
            // Handle asterisks in button text
            let btnText = opt.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
            btnText = btnText.replace(/\*/g, ''); // strip any remaining stray asterisks
            btn.innerHTML = btnText;
            
            btn.onclick = () => window.sendOption(opt.replace(/\*/g, ''));
            optionsDiv.appendChild(btn);
        });
        chatBox.appendChild(optionsDiv);
        inputArea.classList.add('hidden'); // Ensure text input is hidden
    } else if (sender === 'model' && currentDifficulty === 'easy' && !text.includes("הסימולציה הסתיימה")) {
        // Fallback: If the AI failed to generate options in easy mode, show the text box so they aren't stuck
        inputArea.classList.remove('hidden');
    } else if (sender === 'model' && currentDifficulty !== 'easy' && !text.includes("הסימולציה הסתיימה")) {
        inputArea.classList.remove('hidden');
    }

    if (sender === 'user') {
        setTimeout(scrollToBottom, 50);
    } else {
        setTimeout(() => {
            chatBox.scrollTo({
                top: msgDiv.offsetTop - 20,
                behavior: 'smooth'
            });
        }, 100);
    }
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(indicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        chatBox.innerHTML = '';
        sessionId = Math.random().toString(36).substring(2, 15);
        completedSimulations = 0;
        welcomeScreen.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        inputArea.classList.remove('hidden');
        nextScenarioBtn.classList.add('hidden');
        if (analyzeBtn) analyzeBtn.classList.add('hidden');
    });
}

async function sendMessage(message) {
    if (isGenerating) return;
    isGenerating = true;
    sendBtn.disabled = true;
    showTypingIndicator();
    
    try {
        const response = await fetch('https://aklim-backend.onrender.com/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, message, difficulty: currentDifficulty })
        });
        
        const data = await response.json();
        hideTypingIndicator();
        
        if (data.error) {
            addMessageToChat('אירעה שגיאה. נסי שוב מאוחר יותר.', 'model');
        } else {
            addMessageToChat(data.text, 'model');
            
            if (data.text.includes("הסימולציה הסתיימה")) {
                completedSimulations++;
                setTimeout(() => {
                    inputArea.classList.add('hidden');
                    nextScenarioBtn.classList.remove('hidden');
                    if (completedSimulations >= 3 && analyzeBtn) {
                        analyzeBtn.classList.remove('hidden');
                    }
                }, 1000);
            } else if (message === "[ANALYZE_PATTERNS]") {
                setTimeout(() => {
                    if (currentDifficulty !== 'easy') {
                        inputArea.classList.remove('hidden');
                    }
                    nextScenarioBtn.classList.remove('hidden');
                }, 1000);
            }
        }
    } catch (error) {
        console.error("Error connecting to server", error);
        hideTypingIndicator();
        addMessageToChat('שגיאת תקשורת עם השרת.', 'model');
    }
    
    isGenerating = false;
    sendBtn.disabled = false;
    if (currentDifficulty !== 'easy' && !document.getElementById('input-area').classList.contains('hidden')) {
        userInput.focus();
    }
}
