document.addEventListener('DOMContentLoaded', () => {
    // Chatbot UI Toggle
    const chatWidget = document.getElementById('chatWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatBody = document.getElementById('chatBody');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
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
        if (word.length < 4) return false; // Palabras cortas deben ser exactas
        const dist = levenshteinDistance(word, target);
        return dist <= 2; // Permite hasta 2 errores (typos)
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
    };

    const fallbackResponses = [
        "Lo siento, solo reconozco temas sobre la experiencia, estudios, habilidades tecnológicas (Python, SQL) o contacto de Gastón. ¿Podrías reformular?",
        "No estoy seguro de entender. Soy un asistente programado para hablar sobre el currículum de Gastón. ¿Te gustaría saber sobre su experiencia o sus estudios?",
        "Esa pregunta sale de mi conocimiento. Pregúntame sobre su experiencia laboral, universidad, o qué herramientas maneja."
    ];

    function getRandomResponse(responsesArray) {
        const randomIndex = Math.floor(Math.random() * responsesArray.length);
        return responsesArray[randomIndex];
    }

    function getBotResponseData(userText) {
        // Check categories using fuzzy logic
        for (const [category, data] of Object.entries(cvKnowledge)) {
            if (matchKeywords(userText, data.keywords)) {
                return { text: getRandomResponse(data.responses), category: category };
            }
        }
        return { text: getRandomResponse(fallbackResponses), category: 'unknown' };
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
                // Deshabilitar botones después de clickear uno
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

        // Simular tiempo pensando
        setTimeout(() => {
            const responseData = getBotResponseData(text);
            addMessage(responseData.text, 'bot');
            
            // Sugerir siguientes pasos
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
        addMessage("¡Hola! Soy el asistente virtual de Gastón. Puedo contarte sobre su perfil profesional. ¿Qué te gustaría saber?", 'bot');
        addQuickReplies([
            { label: 'Experiencia Laboral', text: 'Cuéntame sobre su experiencia' },
            { label: 'Estudios', text: '¿Qué estudia?' },
            { label: 'Habilidades', text: '¿Qué tecnologías maneja?' },
            { label: 'Contacto', text: '¿Cómo lo contacto?' }
        ]);
    }, 500);
});
