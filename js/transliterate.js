class BharatAksharTransliterate {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharacterCount();
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('text-tab')?.addEventListener('click', (e) => this.switchTab(e, 'text'));
        document.getElementById('image-tab')?.addEventListener('click', (e) => this.switchTab(e, 'image'));

        // Transliteration button
        document.getElementById('transliterate-btn')?.addEventListener('click', () => this.transliterateText());

        // Copy, Speak, Download buttons
        document.getElementById('copy-btn')?.addEventListener('click', () => this.copyText());
        document.getElementById('speak-btn')?.addEventListener('click', () => this.speakText());
        document.getElementById('download-btn')?.addEventListener('click', () => this.downloadText());

        // Speech input
        document.getElementById('speech-input-btn')?.addEventListener('click', () => this.startSpeechInput());

        // Script change listeners
        document.getElementById('source-script')?.addEventListener('change', () => this.updateScriptInfo());
        document.getElementById('target-script')?.addEventListener('change', () => this.updateScriptInfo());
    }

    switchTab(e, tabName) {
        e.preventDefault();

        const textTab = document.getElementById('text-tab');
        const imageTab = document.getElementById('image-tab');
        const textSection = document.getElementById('text-input-section');
        const imageSection = document.getElementById('image-ocr-section');

        if (tabName === 'text') {
            textTab.classList.add('tab-active');
            imageTab.classList.remove('tab-active');
            textSection.classList.remove('hidden');
            imageSection.classList.add('hidden');
        } else {
            imageTab.classList.add('tab-active');
            textTab.classList.remove('tab-active');
            imageSection.classList.remove('hidden');
            textSection.classList.add('hidden');
        }
    }

    initializeCharacterCount() {
        const inputText = document.getElementById('input-text');
        if (inputText) {
            inputText.addEventListener('input', () => {
                document.getElementById('char-count').textContent = inputText.value.length;
            });
        }
    }

    async transliterateText() {
        const inputText = document.getElementById('input-text').value.trim();
        const sourceScript = document.getElementById('source-script').value;
        const targetScript = document.getElementById('target-script').value;

        if (!inputText) {
            alert('Please enter some text to transliterate');
            return;
        }

        this.updateScriptInfo();

        const button = document.getElementById('transliterate-btn');
        const originalButtonText = button.innerHTML;

        button.innerHTML = '<i data-feather="loader" class="w-5 h-5 mr-2 animate-spin"></i> Processing...';
        button.disabled = true;
        feather.replace();

        try {
            let result = this.enhancedTransliteration(inputText, sourceScript, targetScript);

            if (targetScript === 'itrans') {
                result = window.bharatAksharCommon.capitalizeEnglishSentence(result);
            }

            document.getElementById('output-text').innerHTML = `<p class="text-gray-800">${result}</p>`;
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('output-text').innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
        } finally {
            button.innerHTML = originalButtonText;
            button.disabled = false;
            feather.replace();
        }
    }

    // Add this method to your BharatAksharTransliterate class
    enhancedTransliteration(text, sourceScript, targetScript) {
        // Advanced word mappings for better accuracy
        const wordMappings = {
            'tamil-itrans': {
                'வணக்கம்': 'vanakkam', 'நன்றி': 'nandri', 'சென்னை': 'chennai',
                'மதுரை': 'madurai', 'கோயம்புத்தூர்': 'coimbatore', 'தமிழ்நாடு': 'tamilnadu',
                'இந்தியா': 'indiya', 'உலகம்': 'ulagam', 'பள்ளி': 'palli', 'மாணவர்': 'manavar'
            },
            'hindi-itrans': {
                'नमस्ते': 'namaste', 'धन्यवाद': 'dhanyavaad', 'दिल्ली': 'delhi',
                'मुंबई': 'mumbai', 'भारत': 'bharat', 'हिंदी': 'hindi', 'पानी': 'paani',
                'किताब': 'kitaab', 'स्कूल': 'school', 'छात्र': 'chhaatra'
            },
            'bengali-itrans': {
                'নমস্কার': 'nomoskar', 'ধন্যবাদ': 'dhonyobaad', 'কলকাতা': 'kolkata',
                'ভারত': 'bharat', 'বাংলা': 'bangla', 'জল': 'jal', 'বই': 'boi',
                'বিদ্যালয়': 'bidyalay', 'ছাত্র': 'chhatro'
            },
            'telugu-itrans': {
                'నమస్కారం': 'namaskaaram', 'ధన్యవాదాలు': 'dhanyavaadaalu', 'హైదరాబాద్': 'hyderabad',
                'ఆంధ్రప్రదేశ్': 'andhrapradesh', 'తెలుగు': 'telugu'
            },
            'kannada-itrans': {
                'ನಮಸ್ಕಾರ': 'namaskaara', 'ಧನ್ಯವಾದ': 'dhanyavaada', 'ಬೆಂಗಳೂರು': 'bengaluru',
                'ಕರ್ನಾಟಕ': 'karnataka', 'ಕನ್ನಡ': 'kannada'
            },
            'malayalam-itrans': {
                'നമസ്കാരം': 'namaskaaram', 'നന്ദി': 'nandi', 'തിരുവനന്തപുരം': 'thiruvananthapuram',
                'കേരളം': 'kerala', 'മലയാളം': 'malayalam'
            },
            'gujarati-itrans': {
                'નમસ્તે': 'namaste', 'આભાર': 'aabhaar', 'અમદાવાદ': 'ahmedabad',
                'ગુજરાત': 'gujarat', 'ગુજરાતી': 'gujarati'
            },
            'gurmukhi-itrans': {
                'ਸਤ ਸ੍ਰੀ ਅਕਾਲ': 'sat sri akaal', 'ਧੰਨਵਾਦ': 'dhannavaad', 'ਚੰਡੀਗੜ੍ਹ': 'chandigarh',
                'ਪੰਜਾਬ': 'punjab', 'ਪੰਜਾਬੀ': 'punjabi'
            }
        };

        let result = text;
        const mappingKey = `${sourceScript}-${targetScript}`;

        // Apply word mappings if available
        if (wordMappings[mappingKey]) {
            for (const [sourceWord, targetWord] of Object.entries(wordMappings[mappingKey])) {
                const regex = new RegExp(sourceWord, 'g');
                result = result.replace(regex, targetWord);
            }
        }

        // Use Sanscript for the remaining text with error handling
        try {
            return Sanscript.t(result, sourceScript, targetScript);
        } catch (error) {
            console.error('Transliteration error:', error);
            return result; // Return original text if transliteration fails
        }
    }

    async copyText() {
        const outputText = document.getElementById('output-text').textContent;

        if (!outputText || outputText.includes('Transliterated text will appear here')) {
            alert('No text to copy. Please transliterate some text first.');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText);
            window.bharatAksharCommon.showTemporaryFeedback('copy-btn', '<i data-feather="check" class="w-4 h-4 mr-1"></i> Copied!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text. Please try again.');
        }
    }

    speakText() {
        const outputText = document.getElementById('output-text').textContent;
        const targetScript = document.getElementById('target-script').value;

        if (!outputText || outputText.includes('Transliterated text will appear here')) {
            alert('No text to speak. Please transliterate some text first.');
            return;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(outputText);
            const langMap = {
                'devanagari': 'hi-IN', 'bengali': 'bn-IN', 'tamil': 'ta-IN',
                'telugu': 'te-IN', 'kannada': 'kn-IN', 'malayalam': 'ml-IN',
                'gujarati': 'gu-IN', 'gurmukhi': 'pa-IN', 'itrans': 'en-US'
            };

            utterance.lang = langMap[targetScript] || 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;

            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.lang === utterance.lang && voice.localService === true
            );

            if (preferredVoice) utterance.voice = preferredVoice;
            speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser');
        }
    }

    downloadText() {
        const outputText = document.getElementById('output-text').textContent;

        if (!outputText || outputText.includes('Transliterated text will appear here')) {
            alert('No text to download. Please transliterate some text first.');
            return;
        }

        const sourceScript = document.getElementById('source-script').value;
        const targetScript = document.getElementById('target-script').value;
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `transliteration-${sourceScript}-to-${targetScript}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    startSpeechInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            const sourceScript = document.getElementById('source-script').value;
            const langMap = {
                'devanagari': 'hi-IN', 'bengali': 'bn-IN', 'tamil': 'ta-IN',
                'telugu': 'te-IN', 'kannada': 'kn-IN', 'malayalam': 'ml-IN',
                'gujarati': 'gu-IN', 'gurmukhi': 'pa-IN', 'itrans': 'en-US'
            };

            recognition.lang = langMap[sourceScript] || 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('input-text').value = transcript;
                document.getElementById('char-count').textContent = transcript.length;
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                alert(event.error === 'not-allowed' ?
                    'Microphone access is not allowed. Please enable microphone permissions.' :
                    'Error with speech recognition: ' + event.error);
            };

            recognition.start();
        } else {
            alert('Speech recognition is not supported in your browser');
        }
    }

    updateScriptInfo() {
        const sourceScript = document.getElementById('source-script').value;
        const targetScript = document.getElementById('target-script').value;

        document.getElementById('source-script-name').textContent = window.bharatAksharCommon.getScriptName(sourceScript);
        document.getElementById('target-script-name').textContent = window.bharatAksharCommon.getScriptName(targetScript);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharTransliterate = new BharatAksharTransliterate();
});