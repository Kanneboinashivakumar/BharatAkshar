class BharatAksharTransliterate {
    constructor() {
        this.speechRecognition = null;
        this.isListening = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharacterCount();
        this.updateScriptInfo();
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
        document.getElementById('speech-input-btn')?.addEventListener('click', () => this.toggleSpeechInput());

        // Script change listeners
        document.getElementById('source-script')?.addEventListener('change', () => this.updateScriptInfo());
        document.getElementById('target-script')?.addEventListener('change', () => this.updateScriptInfo());

        // Real-time transliteration on input (optional)
        document.getElementById('input-text')?.addEventListener('input', () => {
            // You can enable real-time transliteration here if desired
            // this.transliterateText();
        });
    }

    switchTab(e, tabName) {
        e.preventDefault();

        const textTab = document.getElementById('text-tab');
        const imageTab = document.getElementById('image-tab');
        const textSection = document.getElementById('text-input-section');
        const imageSection = document.getElementById('image-ocr-section');

        if (!textTab || !imageTab || !textSection || !imageSection) return;

        if (tabName === 'text') {
            textTab.classList.add('tab-active');
            textTab.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            imageTab.classList.remove('tab-active');
            imageTab.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            textSection.classList.remove('hidden');
            imageSection.classList.add('hidden');
        } else {
            imageTab.classList.add('tab-active');
            imageTab.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            textTab.classList.remove('tab-active');
            textTab.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            imageSection.classList.remove('hidden');
            textSection.classList.add('hidden');
        }
    }

    initializeCharacterCount() {
        const inputText = document.getElementById('input-text');
        if (inputText) {
            inputText.addEventListener('input', () => {
                const charCount = document.getElementById('char-count');
                if (charCount) {
                    charCount.textContent = inputText.value.length;
                }
            });
        }
    }

    async transliterateText() {
        const inputText = document.getElementById('input-text');
        const sourceScript = document.getElementById('source-script');
        const targetScript = document.getElementById('target-script');

        if (!inputText || !sourceScript || !targetScript) {
            this.showAlert('Transliteration elements not found');
            return;
        }

        const text = inputText.value.trim();
        const source = sourceScript.value;
        const target = targetScript.value;

        if (!text) {
            this.showAlert('Please enter some text to transliterate');
            return;
        }

        this.updateScriptInfo();

        const button = document.getElementById('transliterate-btn');
        const outputText = document.getElementById('output-text');

        if (!button || !outputText) return;

        const originalButtonText = button.innerHTML;

        // Show loading state
        button.innerHTML = '<i data-feather="loader" class="w-5 h-5 mr-2 animate-spin"></i> Processing...';
        button.disabled = true;
        feather.replace();

        try {
            let result;

            // Use enhanced transliteration for better accuracy
            result = this.enhancedTransliteration(text, source, target);

            // Capitalize English sentences if output is Latin script
            if (target === 'itrans') {
                result = this.capitalizeEnglishSentence(result);
            }

            // Display result
            outputText.innerHTML = `<div class="text-gray-800 whitespace-pre-wrap">${result}</div>`;

        } catch (error) {
            console.error('Transliteration Error:', error);
            outputText.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try different text.</p>`;
        } finally {
            // Restore button state
            button.innerHTML = originalButtonText;
            button.disabled = false;
            feather.replace();
        }
    }

    enhancedTransliteration(text, sourceScript, targetScript) {
        try {
            // First, try direct Sanscript transliteration
            let result = Sanscript.t(text, sourceScript, targetScript);

            // Apply post-processing for common issues
            result = this.postProcessTransliteration(result, sourceScript, targetScript);

            return result;

        } catch (error) {
            console.warn('Sanscript transliteration failed, using fallback:', error);

            // Fallback: return original text with error message
            return `[Transliteration Error] ${text}`;
        }
    }

    postProcessTransliteration(text, sourceScript, targetScript) {
        if (!text) return text;

        // Common post-processing fixes
        let result = text;

        // Fix common spacing issues
        result = result.replace(/\s+/g, ' ').trim();

        // Fix common character mapping issues
        const commonFixes = {
            'devanagari-itrans': [
                [/shri/gi, 'shrii'],
                [/om/gi, 'aum']
            ],
            'tamil-itrans': [
                [/aa/gi, 'ā'],
                [/ii/gi, 'ī'],
                [/uu/gi, 'ū']
            ]
        };

        const mappingKey = `${sourceScript}-${targetScript}`;
        if (commonFixes[mappingKey]) {
            commonFixes[mappingKey].forEach(([pattern, replacement]) => {
                result = result.replace(pattern, replacement);
            });
        }

        return result;
    }

    capitalizeEnglishSentence(text) {
        if (!text) return text;

        // Use common utility if available, otherwise use local method
        if (window.bharatAksharCommon && typeof window.bharatAksharCommon.capitalizeEnglishSentence === 'function') {
            return window.bharatAksharCommon.capitalizeEnglishSentence(text);
        }

        // Fallback implementation
        const sentences = text.split(/([.!?]+)/);
        let result = '';

        for (let i = 0; i < sentences.length; i++) {
            if (i % 2 === 0) {
                let sentence = sentences[i].trim();
                if (sentence.length > 0) {
                    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
                }
                result += sentence;
            } else {
                result += sentences[i];
            }

            if (i < sentences.length - 1 && sentences[i].length > 0) {
                result += ' ';
            }
        }

        return result.trim();
    }

    async copyText() {
        const outputText = document.getElementById('output-text');
        if (!outputText) return;

        const text = outputText.textContent || outputText.innerText;

        if (!text || text.includes('Transliterated text will appear here')) {
            this.showAlert('No text to copy. Please transliterate some text first.');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showTemporaryFeedback('copy-btn', '<i data-feather="check" class="w-4 h-4 mr-1"></i> Copied!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showAlert('Failed to copy text. Please try again.');
        }
    }

    speakText() {
        const outputText = document.getElementById('output-text');
        if (!outputText) return;

        const text = outputText.textContent || outputText.innerText;
        const targetScript = document.getElementById('target-script')?.value;

        if (!text || text.includes('Transliterated text will appear here')) {
            this.showAlert('No text to speak. Please transliterate some text first.');
            return;
        }

        if (!('speechSynthesis' in window)) {
            this.showAlert('Text-to-speech is not supported in your browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = {
            'devanagari': 'hi-IN', 'bengali': 'bn-IN', 'tamil': 'ta-IN',
            'telugu': 'te-IN', 'kannada': 'kn-IN', 'malayalam': 'ml-IN',
            'gujarati': 'gu-IN', 'gurmukhi': 'pa-IN', 'oriya': 'or-IN',
            'itrans': 'en-US'
        };

        utterance.lang = langMap[targetScript] || 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find appropriate voice
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            const preferredVoice = voices.find(voice =>
                voice.lang === utterance.lang && voice.localService === true
            ) || voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0])) || voices[0];

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.showAlert('Error speaking text. Please try again.');
        };

        speechSynthesis.speak(utterance);
    }

    downloadText() {
        const outputText = document.getElementById('output-text');
        if (!outputText) return;

        const text = outputText.textContent || outputText.innerText;
        const sourceScript = document.getElementById('source-script')?.value;
        const targetScript = document.getElementById('target-script')?.value;

        if (!text || text.includes('Transliterated text will appear here')) {
            this.showAlert('No text to download. Please transliterate some text first.');
            return;
        }

        try {
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `transliteration-${sourceScript}-to-${targetScript}-${new Date().getTime()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            this.showAlert('Failed to download text. Please try again.');
        }
    }

    toggleSpeechInput() {
        if (this.isListening) {
            this.stopSpeechInput();
        } else {
            this.startSpeechInput();
        }
    }

    startSpeechInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showAlert('Speech recognition is not supported in your browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRecognition();

        const sourceScript = document.getElementById('source-script')?.value;
        const langMap = {
            'devanagari': 'hi-IN', 'bengali': 'bn-IN', 'tamil': 'ta-IN',
            'telugu': 'te-IN', 'kannada': 'kn-IN', 'malayalam': 'ml-IN',
            'gujarati': 'gu-IN', 'gurmukhi': 'pa-IN', 'oriya': 'or-IN',
            'itrans': 'en-US'
        };

        this.speechRecognition.lang = langMap[sourceScript] || 'en-US';
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.maxAlternatives = 1;

        const speechButton = document.getElementById('speech-input-btn');
        const originalText = speechButton.innerHTML;

        this.speechRecognition.onstart = () => {
            this.isListening = true;
            speechButton.innerHTML = '<i data-feather="mic" class="w-4 h-4 inline mr-1 animate-pulse text-red-500"></i> Listening...';
            feather.replace();
        };

        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const inputText = document.getElementById('input-text');
            const charCount = document.getElementById('char-count');

            if (inputText) {
                inputText.value = transcript;
            }
            if (charCount) {
                charCount.textContent = transcript.length;
            }
        };

        this.speechRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'not-allowed') {
                this.showAlert('Microphone access is not allowed. Please enable microphone permissions in your browser settings.');
            } else if (event.error === 'audio-capture') {
                this.showAlert('No microphone found. Please ensure a microphone is connected.');
            } else {
                this.showAlert('Speech recognition error: ' + event.error);
            }
        };

        this.speechRecognition.onend = () => {
            this.stopSpeechInput();
        };

        try {
            this.speechRecognition.start();
        } catch (err) {
            console.error('Speech recognition start error:', err);
            this.showAlert('Failed to start speech recognition. Please try again.');
        }
    }

    stopSpeechInput() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
        this.isListening = false;

        const speechButton = document.getElementById('speech-input-btn');
        if (speechButton) {
            speechButton.innerHTML = '<i data-feather="mic" class="w-4 h-4 inline mr-1"></i> Speech Input';
            feather.replace();
        }
    }

    updateScriptInfo() {
        const sourceScript = document.getElementById('source-script')?.value;
        const targetScript = document.getElementById('target-script')?.value;
        const sourceScriptName = document.getElementById('source-script-name');
        const targetScriptName = document.getElementById('target-script-name');

        if (sourceScriptName) {
            sourceScriptName.textContent = this.getScriptName(sourceScript);
        }
        if (targetScriptName) {
            targetScriptName.textContent = this.getScriptName(targetScript);
        }
    }

    getScriptName(code) {
        const scripts = {
            'devanagari': 'Devanagari (Hindi)',
            'bengali': 'Bengali',
            'tamil': 'Tamil',
            'telugu': 'Telugu',
            'kannada': 'Kannada',
            'malayalam': 'Malayalam',
            'gujarati': 'Gujarati',
            'gurmukhi': 'Gurmukhi (Punjabi)',
            'oriya': 'Odia',
            'itrans': 'Latin (English)'
        };
        return scripts[code] || code;
    }

    showTemporaryFeedback(buttonId, feedbackText) {
        if (window.bharatAksharCommon && typeof window.bharatAksharCommon.showTemporaryFeedback === 'function') {
            window.bharatAksharCommon.showTemporaryFeedback(buttonId, feedbackText);
        } else {
            // Fallback implementation
            const button = document.getElementById(buttonId);
            if (!button) return;

            const originalText = button.innerHTML;
            button.innerHTML = feedbackText;
            feather.replace();

            setTimeout(() => {
                button.innerHTML = originalText;
                feather.replace();
            }, 2000);
        }
    }

    showAlert(message) {
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharTransliterate = new BharatAksharTransliterate();
});