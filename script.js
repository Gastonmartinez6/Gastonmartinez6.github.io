document.addEventListener('DOMContentLoaded', () => {
    // Language Toggle Logic
    const langToggle = document.getElementById('langToggle');
    const chatInput = document.getElementById('chatInput');
    let currentLang = 'es';

    langToggle.addEventListener('click', () => {
        if (currentLang === 'es') {
            document.body.classList.remove('lang-es');
            document.body.classList.add('lang-en');
            langToggle.textContent = 'ES';
            currentLang = 'en';
            chatInput.placeholder = chatInput.getAttribute('data-placeholder-en');
            addMessage("Hi! I'm Gastón's virtual assistant. I can tell you about his professional profile. What would you like to know?", 'bot');
            addQuickReplies([
                { label: 'Work Experience', text: 'Tell me about his experience' },
                { label: 'Education', text: 'What does he study?' },
                { label: 'Skills', text: 'What technologies does he use?' },
                { label: 'Contact', text: 'How can I contact him?' }
            ]);
        } else {
            document.body.classList.remove('lang-en');
            document.body.classList.add('lang-es');
            langToggle.textContent = 'EN';
            currentLang = 'es';
            chatInput.placeholder = chatInput.getAttribute('data-placeholder-es');
            addMessage("¡Hola! Soy el asistente virtual de Gastón. Puedo contarte sobre su perfil profesional. ¿Qué te gustaría saber?", 'bot');
            addQuickReplies([
                { label: 'Experiencia Laboral', text: 'Cuéntame sobre su experiencia' },
                { label: 'Estudios', text: '¿Qué estudia?' },
                { label: 'Habilidades', text: '¿Qué tecnologías maneja?' },
                { label: 'Contacto', text: '¿Cómo lo contacto?' }
            ]);
        }
    });

    // Chatbot UI Toggle
    const chatWidget = document.getElementById('chatWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatBody = document.getElementById('chatBody');
    const chatMessages = document.getElementById('chatMessages');
    const chatSend = document.getElementById('chatSend');

    chatHeader.addEventListener('click', () => {
        chatWidget.classList.toggle('collapsed');
    });

    // --- Motor Lógico Avanzado Local ---

    // 1. Distancia de Levenshtein para Búsqueda Difusa
    function levenshteinDistance(a, b) {
        if(a.length == 0) return b.length; 
        if(b.length == 0) return a.length; 

        var matrix = [];
        for(var i = 0; i <= b.length; i++) matrix[i] = [i];
        for(var j = 0; j <= a.length; j++) matrix[0][j] = j;

        for(var i = 1; i <= b.length; i++){
            for(var j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function isFuzzyMatch(word, target) {
        if (word === target) return true;
        if (word.length < 4) return false; 
        const dist = levenshteinDistance(word, target);
        return dist <= 2; 
    }

    function matchKeywords(text, keywords) {
        const words = text.toLowerCase().replace(/[?,!.]/g, '').split(' ');
        for (let word of words) {
            for (let kw of keywords) {
                if (isFuzzyMatch(word, kw)) return true;
            }
        }
        return false;
    }

    // 2. Base de Conocimiento con Múltiples Respuestas
    const cvKnowledge = {
        es: {
            greetings: {
                keywords: ['hola', 'buenas', 'saludos', 'hi', 'buen'],
                responses: [
                    "¡Hola! ¿Qué te gustaría saber sobre Gastón? Puedes preguntarme por su experiencia, estudios o habilidades.",
                    "¡Saludos! Soy el asistente de Gastón. ¿En qué puedo ayudarte hoy?"
                ]
            },
            experience: {
                keywords: ['experiencia', 'trabajo', 'sika', 'laboral', 'trabajaste', 'cv'],
                responses: [
                    "Actualmente Gastón trabaja como Pasante de Créditos y Cobranzas en Sika Argentina, usando SAP para conciliar cuentas. Antes lideró ventas en New Reset.",
                    "Su experiencia más reciente es en Sika Argentina (Marzo 2025 - Actualidad) manejando cuentas en SAP. Previamente tuvo roles de liderazgo en ventas y soporte administrativo en otras empresas."
                ]
            },
            education: {
                keywords: ['estudias', 'educacion', 'carrera', 'universidad', 'unlam', 'facultad', 'estudios'],
                responses: [
                    "Es estudiante de Licenciatura en Economía en la UNLaM (Universidad Nacional de La Matanza). Además, se encuentra estudiando tecnologías como SQL, Python y Data Science.",
                    "Estudia Economía en la UNLaM. Complementa su formación universitaria aprendiendo de forma activa Python, bases de datos SQL e Inteligencia Artificial."
                ]
            },
            skills: {
                keywords: ['habilidades', 'tecnologia', 'programacion', 'python', 'sql', 'ia', 'inteligencia', 'sap', 'excel', 'tecnologias', 'herramientas'],
                responses: [
                    "Tiene un perfil híbrido: fuerte en finanzas (SAP, Excel avanzado, conciliación de cuentas) y actualmente aprendiendo herramientas tecnológicas de datos (Python, SQL, Ciencia de Datos).",
                    "Maneja muy bien Excel y SAP para la parte financiera/administrativa. En el ámbito tecnológico, está iniciándose y aprendiendo Python, SQL y herramientas de IA."
                ]
            },
            contact: {
                keywords: ['contacto', 'mail', 'email', 'telefono', 'linkedin', 'llamar', 'contactar'],
                responses: [
                    "Puedes escribirle a su correo: gastimartinez6@gmail.com o conectar a través de su LinkedIn (enlace en la parte superior de la página).",
                    "La mejor forma de contactarlo es por email a gastimartinez6@gmail.com. ¡También revisa su LinkedIn frecuentemente!"
                ]
            },
            about: {
                keywords: ['quien', 'sobre', 'perfil', 'objetivo', 'acerca'],
                responses: [
                    "Gastón es un estudiante de Economía apasionado por unir el mundo financiero con la tecnología. Su objetivo es aportar valor analítico usando herramientas que está aprendiendo, como Python y SQL.",
                    "Es un profesional con experiencia en créditos y cobranzas que está transicionando hacia un perfil más analítico, combinando su base económica con Data Science y programación."
                ]
            }
        },
        en: {
            greetings: {
                keywords: ['hello', 'hi', 'greetings', 'morning', 'afternoon'],
                responses: [
                    "Hello! What would you like to know about Gastón? You can ask me about his experience, education, or skills.",
                    "Greetings! I'm Gastón's assistant. How can I help you today?"
                ]
            },
            experience: {
                keywords: ['experience', 'work', 'job', 'sika', 'worked', 'cv', 'resume'],
                responses: [
                    "Currently, Gastón works as a Credit and Collections Intern at Sika Argentina, using SAP for account reconciliation. Previously, he led sales at New Reset.",
                    "His most recent experience is at Sika Argentina (March 2025 - Present) managing accounts in SAP. He previously had roles in sales leadership and administrative support."
                ]
            },
            education: {
                keywords: ['study', 'studying', 'education', 'career', 'university', 'college', 'degree'],
                responses: [
                    "He is an Economics undergraduate student at UNLaM. In addition, he is studying technologies like SQL, Python, and Data Science.",
                    "He studies Economics at UNLaM. He complements his university education by actively learning Python, SQL databases, and Artificial Intelligence."
                ]
            },
            skills: {
                keywords: ['skills', 'technology', 'programming', 'python', 'sql', 'ai', 'artificial', 'intelligence', 'sap', 'excel', 'technologies', 'tools'],
                responses: [
                    "He has a hybrid profile: strong in finance (SAP, Advanced Excel, account reconciliation) and currently learning data tech tools (Python, SQL, Data Science).",
                    "He handles Excel and SAP very well for financial/administrative tasks. In the tech field, he is starting to learn Python, SQL, and AI tools."
                ]
            },
            contact: {
                keywords: ['contact', 'mail', 'email', 'phone', 'linkedin', 'call', 'reach'],
                responses: [
                    "You can write to his email: gastimartinez6@gmail.com or connect via LinkedIn (link at the top of the page).",
                    "The best way to contact him is by email at gastimartinez6@gmail.com. Check out his LinkedIn too!"
                ]
            },
            about: {
                keywords: ['who', 'about', 'profile', 'objective', 'goal'],
                responses: [
                    "Gastón is an Economics student passionate about merging the financial world with technology. His goal is to provide analytical value using tools he is learning, such as Python and SQL.",
                    "He is a professional with experience in credit and collections transitioning towards a more analytical profile, combining his economic background with Data Science and programming."
                ]
            }
        }
    };

    const fallbackResponses = {
        es: [
            "Lo siento, solo reconozco temas sobre la experiencia, estudios, habilidades tecnológicas (Python, SQL) o contacto de Gastón. ¿Podrías reformular?",
            "No estoy seguro de entender. Soy un asistente programado para hablar sobre el currículum de Gastón. ¿Te gustaría saber sobre su experiencia o sus estudios?",
            "Esa pregunta sale de mi conocimiento. Pregúntame sobre su experiencia laboral, universidad, o qué herramientas maneja."
        ],
        en: [
            "Sorry, I only recognize topics about Gastón's experience, education, tech skills (Python, SQL), or contact info. Could you rephrase?",
            "I'm not sure I understand. I'm an assistant programmed to talk about Gastón's resume. Would you like to know about his experience or studies?",
            "That question is outside my knowledge base. Ask me about his work experience, university, or what tools he uses."
        ]
    };

    function getRandomResponse(responsesArray) {
        const randomIndex = Math.floor(Math.random() * responsesArray.length);
        return responsesArray[randomIndex];
    }

    function getBotResponseData(userText) {
        const knowledge = cvKnowledge[currentLang];
        for (const [category, data] of Object.entries(knowledge)) {
            if (matchKeywords(userText, data.keywords)) {
                return { text: getRandomResponse(data.responses), category: category };
            }
        }
        return { text: getRandomResponse(fallbackResponses[currentLang]), category: 'unknown' };
    }

    // 3. UI Helpers
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addQuickReplies(replies) {
        const repliesDiv = document.createElement('div');
        repliesDiv.classList.add('quick-replies');
        
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.classList.add('quick-reply-btn');
            btn.textContent = reply.label;
            btn.addEventListener('click', () => {
                const allBtns = repliesDiv.querySelectorAll('.quick-reply-btn');
                allBtns.forEach(b => {
                    b.disabled = true;
                    b.style.opacity = '0.5';
                    b.style.cursor = 'default';
                });
                
                handleUserMessage(reply.text);
            });
            repliesDiv.appendChild(btn);
        });
        
        chatMessages.appendChild(repliesDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleUserMessage(text) {
        if (text === '') return;
        addMessage(text, 'user');
        chatInput.value = '';

        setTimeout(() => {
            const responseData = getBotResponseData(text);
            addMessage(responseData.text, 'bot');
            
            if (currentLang === 'es') {
                if(responseData.category === 'experience') {
                    addQuickReplies([
                        { label: 'Ver Estudios', text: 'Háblame de sus estudios' },
                        { label: 'Ver Habilidades', text: '¿Qué herramientas usa?' }
                    ]);
                } else if (responseData.category === 'education') {
                    addQuickReplies([
                        { label: 'Ver Experiencia', text: '¿Cuál es su experiencia laboral?' },
                        { label: 'Ver Habilidades', text: '¿Qué tecnologías estudia?' }
                    ]);
                } else if (responseData.category === 'unknown') {
                    addQuickReplies([
                        { label: 'Experiencia', text: 'experiencia' },
                        { label: 'Estudios', text: 'estudios' },
                        { label: 'Contacto', text: 'contacto' }
                    ]);
                } else if (responseData.category === 'greetings') {
                    addQuickReplies([
                        { label: 'Experiencia Laboral', text: 'Cuéntame sobre su experiencia' },
                        { label: 'Estudios', text: '¿Qué estudia?' },
                        { label: 'Habilidades', text: '¿Qué tecnologías maneja?' }
                    ]);
                }
            } else {
                if(responseData.category === 'experience') {
                    addQuickReplies([
                        { label: 'View Education', text: 'Tell me about his studies' },
                        { label: 'View Skills', text: 'What tools does he use?' }
                    ]);
                } else if (responseData.category === 'education') {
                    addQuickReplies([
                        { label: 'View Experience', text: 'What is his work experience?' },
                        { label: 'View Skills', text: 'What technologies does he study?' }
                    ]);
                } else if (responseData.category === 'unknown') {
                    addQuickReplies([
                        { label: 'Experience', text: 'experience' },
                        { label: 'Education', text: 'education' },
                        { label: 'Contact', text: 'contact' }
                    ]);
                } else if (responseData.category === 'greetings') {
                    addQuickReplies([
                        { label: 'Work Experience', text: 'Tell me about his experience' },
                        { label: 'Education', text: 'What does he study?' },
                        { label: 'Skills', text: 'What technologies does he use?' }
                    ]);
                }
            }
        }, 600);
    }

    function handleSend() {
        const userText = chatInput.value.trim();
        handleUserMessage(userText);
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // 4. Initial Greeting
    setTimeout(() => {
        if (currentLang === 'es') {
            addMessage("¡Hola! Soy el asistente virtual de Gastón. Puedo contarte sobre su perfil profesional. ¿Qué te gustaría saber?", 'bot');
            addQuickReplies([
                { label: 'Experiencia Laboral', text: 'Cuéntame sobre su experiencia' },
                { label: 'Estudios', text: '¿Qué estudia?' },
                { label: 'Habilidades', text: '¿Qué tecnologías maneja?' },
                { label: 'Contacto', text: '¿Cómo lo contacto?' }
            ]);
        } else {
            addMessage("Hi! I'm Gastón's virtual assistant. I can tell you about his professional profile. What would you like to know?", 'bot');
            addQuickReplies([
                { label: 'Work Experience', text: 'Tell me about his experience' },
                { label: 'Education', text: 'What does he study?' },
                { label: 'Skills', text: 'What technologies does he use?' },
                { label: 'Contact', text: 'How can I contact him?' }
            ]);
        }
    }, 500);
});