document.addEventListener('DOMContentLoaded', () => {
    // Chatbot UI Toggle
    const chatWidget = document.getElementById('chatWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatBody = document.getElementById('chatBody');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    // Start with chat slightly open to show it exists, or fully open. Let's start open then allow collapse.
    
    chatHeader.addEventListener('click', () => {
        chatWidget.classList.toggle('collapsed');
    });

    // Chatbot Logic
    const cvKnowledge = {
        greetings: ['hola', 'buenas', 'saludos', 'que tal', 'hi'],
        experience: {
            keywords: ['experiencia', 'trabajo', 'sika', 'new reset', 'laboral'],
            response: "Actualmente trabajo como Pasante de Créditos y Cobranzas en Sika Argentina, usando SAP para conciliar cuentas y analizando balances. Antes estuve en New Reset liderando ventas y atención al público, y también tuve experiencia en Securiton y Farmacia Sirup en soporte administrativo."
        },
        education: {
            keywords: ['estudias', 'educacion', 'carrera', 'universidad', 'unlam', 'facultad'],
            response: "Soy estudiante de Licenciatura en Economía en la UNLaM (Universidad Nacional de La Matanza). También he realizado cursos de técnicas de venta y actualmente estoy profundizando en SQL, Python e Inteligencia Artificial."
        },
        skills: {
            keywords: ['habilidades', 'tecnologia', 'programacion', 'python', 'sql', 'ia', 'inteligencia artificial', 'sap', 'excel'],
            response: "Mis habilidades incluyen un fuerte conocimiento en finanzas (conciliación de cuentas, indicadores) manejado principalmente a través de SAP y Excel avanzado. Además, estoy sumando habilidades tecnológicas clave: programación en Python, bases de datos SQL y la implementación de automatizaciones e Inteligencia Artificial para el análisis de datos."
        },
        contact: {
            keywords: ['contacto', 'mail', 'email', 'telefono', 'linkedin', 'llamar'],
            response: "Puedes contactarme a mi email gastimartinez6@gmail.com, a mi teléfono celular (11-2166-9273) o visitando mi perfil de LinkedIn que está en la cabecera de esta página."
        },
        about: {
            keywords: ['quien eres', 'sobre ti', 'perfil', 'objetivo', 'quien sos'],
            response: "Soy Gastón N. Martínez, un apasionado de la economía y la tecnología. Busco aportar valor analítico y optimizar procesos internos uniendo mis conocimientos económicos/administrativos con herramientas potentes como SAP, Python, SQL y AI."
        }
    };

    const fallbackResponse = "Lo siento, soy un asistente virtual básico y solo reconozco palabras clave sobre la experiencia, estudios, habilidades tecnológicas (como Python/SQL) o información de contacto de Gastón. ¿Puedes reformular la pregunta?";

    function getBotResponse(userText) {
        const text = userText.toLowerCase();
        
        // Check greetings first
        if (cvKnowledge.greetings.some(g => text.includes(g))) {
            return "¡Hola! ¿Qué te gustaría saber sobre el perfil profesional de Gastón?";
        }

        // Check categories
        for (const [category, data] of Object.entries(cvKnowledge)) {
            if (category === 'greetings') continue;
            if (data.keywords.some(kw => text.includes(kw))) {
                return data.response;
            }
        }

        return fallbackResponse;
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSend() {
        const userText = chatInput.value.trim();
        if (userText === '') return;

        // Add user message
        addMessage(userText, 'user');
        chatInput.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            const botResponse = getBotResponse(userText);
            addMessage(botResponse, 'bot');
        }, 500);
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
});
