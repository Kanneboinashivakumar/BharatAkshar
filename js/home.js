class BharatAksharHome {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeVantaBackground();
    }

    initializeVantaBackground() {
        if (typeof VANTA !== 'undefined') {
            VANTA.GLOBE({
                el: "#vanta-bg",
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0xf97316,
                backgroundColor: 0xf9fafb,
                size: 0.8
            });
        }
    }

    setupEventListeners() {
        // Demo transliteration
        document.getElementById('demo-transliterate-btn')?.addEventListener('click', () => this.demoTransliterate());
        document.getElementById('demo-copy-btn')?.addEventListener('click', () => this.demoCopyText());
        document.getElementById('demo-speak-btn')?.addEventListener('click', () => this.demoSpeakText());
    }

    demoTransliterate() {
        const inputText = document.getElementById('demo-input-text').value.trim();
        const sourceScript = document.getElementById('demo-source-script').value;
        const targetScript = document.getElementById('demo-target-script').value;
        const demoOutput = document.getElementById('demo-output');
        const outputText = demoOutput.querySelector('p');

        if (!inputText) {
            alert('Please enter some text to transliterate');
            return;
        }

        const button = document.getElementById('demo-transliterate-btn');
        const originalText = button.innerHTML;
        button.innerHTML = 'Processing...';
        button.disabled = true;

        try {
            let result = Sanscript.t(inputText, sourceScript, targetScript);

            if (targetScript === 'itrans') {
                result = window.bharatAksharCommon.capitalizeEnglishSentence(result);
            }

            outputText.textContent = result;
            demoOutput.classList.remove('hidden');
        } catch (err) {
            outputText.textContent = 'Error: ' + err.message;
            demoOutput.classList.remove('hidden');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    demoCopyText() {
        const outputText = document.getElementById('demo-output').querySelector('p').textContent;
        navigator.clipboard.writeText(outputText).then(() => {
            window.bharatAksharCommon.showTemporaryFeedback('demo-copy-btn', '<i data-feather="check" class="w-3 h-3 inline mr-1"></i> Copied!');
        });
    }

    demoSpeakText() {
        const outputText = document.getElementById('demo-output').querySelector('p').textContent;
        const targetScript = document.getElementById('demo-target-script').value;

        if (!outputText) {
            alert('No text to speak. Please transliterate some text first.');
            return;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(outputText);
            const langMap = {
                'itrans': 'en-US', 'devanagari': 'hi-IN', 'bengali': 'bn-IN',
                'tamil': 'ta-IN', 'telugu': 'te-IN', 'kannada': 'kn-IN',
                'malayalam': 'ml-IN', 'gujarati': 'gu-IN', 'gurmukhi': 'pa-IN',
                'oriya': 'or-IN'
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharHome = new BharatAksharHome();
});