class BharatAksharOCR {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Image upload
        document.getElementById('ocr-image-upload')?.addEventListener('change', (e) => this.handleImageUpload(e));

        // OCR processing
        document.getElementById('ocr-process-btn')?.addEventListener('click', () => this.processOCR());
        document.getElementById('ocr-cancel-btn')?.addEventListener('click', () => this.cancelOCR());

        // OCR text actions
        document.getElementById('ocr-copy-btn')?.addEventListener('click', () => this.copyOCRText());
        document.getElementById('ocr-use-btn')?.addEventListener('click', () => this.useOCRText());
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.type, file.size);

            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit. Please choose a smaller file.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                console.log('Image loaded successfully');
                const preview = document.getElementById('image-preview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Preview" class="max-h-48 mx-auto rounded-lg shadow-md">`;

                // Enable process button
                document.getElementById('ocr-process-btn').disabled = false;
            };

            reader.onerror = () => {
                console.error('Error reading file');
                alert('Error reading image file. Please try another image.');
            };

            reader.readAsDataURL(file);

            document.getElementById('detected-language').textContent = 'Auto-detecting...';
        } else {
            console.log('No file selected');
        }
    }

    async processOCR() {
        const fileInput = document.getElementById('ocr-image-upload');

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please upload an image first');
            return;
        }

        const file = fileInput.files[0];
        console.log('Processing file:', file.name);

        const loader = document.getElementById('ocr-loader');
        const btnText = document.getElementById('ocr-btn-text');
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        const progressSection = document.getElementById('ocr-progress');
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressStatus = document.getElementById('ocr-progress-status');
        const progressPercentage = document.getElementById('ocr-progress-percentage');
        const detectedLanguageSpan = document.getElementById('detected-language');
        const processBtn = document.getElementById('ocr-process-btn');

        btnText.textContent = 'Processing';
        loader.classList.remove('hidden');
        progressSection.classList.remove('hidden');
        processBtn.disabled = true;

        try {
            detectedLanguageSpan.textContent = 'Detecting language...';

            // Enhanced OCR configuration for better accuracy
            const result = await Tesseract.recognize(
                file,
                'eng+hin+ben+tam+tel+kan+mal+guj+pan+ori', // All Indian languages
                {
                    logger: message => {
                        console.log('Tesseract progress:', message);
                        if (message.status === 'recognizing text') {
                            const progress = Math.round(message.progress * 100);
                            progressBar.style.width = `${progress}%`;
                            progressPercentage.textContent = `${progress}%`;

                            if (message.progress === 1) {
                                progressStatus.textContent = 'Finalizing...';
                            } else {
                                progressStatus.textContent = 'Recognizing text...';
                            }
                        } else if (message.status === 'loading language traineddata') {
                            progressStatus.textContent = `Loading ${message.lang}...`;
                        }
                    },
                    // Enhanced OCR settings for better accuracy
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?\'\"-()[]{}:;@#$%^&*+=/\\|<>~`',
                    preserve_interword_spaces: '1',
                    tessedit_create_hocr: '0',
                    tessedit_create_tsv: '0',
                    tessedit_create_pdf: '0'
                }
            );

            console.log('OCR result:', result);

            // Clean and display the extracted text
            const extractedText = this.cleanExtractedText(result.data.text);
            extractedTextDiv.innerHTML = `<p class="text-gray-800 whitespace-pre-wrap">${extractedText}</p>`;

            const detectedLanguage = this.detectLanguageFromText(extractedText);
            detectedLanguageSpan.textContent = this.getLanguageName(detectedLanguage);

            // Show confidence score if available
            if (result.data.confidence) {
                const confidence = Math.round(result.data.confidence);
                detectedLanguageSpan.textContent += ` (${confidence}% confidence)`;

                // If confidence is too low, show warning
                if (confidence < 50) {
                    this.showToast('Low confidence in text detection. Try a clearer image.', 'warning');
                }
            }

        } catch (error) {
            console.error('OCR Error:', error);
            extractedTextDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try with a clearer image.</p>`;
            detectedLanguageSpan.textContent = 'Error detecting language';
            this.showToast('OCR processing failed. Please try again.', 'error');
        } finally {
            btnText.textContent = 'Extract Text';
            loader.classList.add('hidden');
            progressSection.classList.add('hidden');
            processBtn.disabled = false;
        }
    }

    // Method for camera.js to use
    async processImageWithTesseract(imageData) {
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        const detectedLanguageSpan = document.getElementById('detected-language');
        const progressSection = document.getElementById('ocr-progress');
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressStatus = document.getElementById('ocr-progress-status');
        const progressPercentage = document.getElementById('ocr-progress-percentage');

        // Show progress
        progressSection?.classList.remove('hidden');
        progressBar && (progressBar.style.width = '0%');
        progressStatus && (progressStatus.textContent = 'Initializing OCR...');
        progressPercentage && (progressPercentage.textContent = '0%');

        try {
            console.log('Processing image from camera...');

            const result = await Tesseract.recognize(
                imageData,
                'eng+hin+ben+tam+tel+kan+mal+guj+pan+ori',
                {
                    logger: message => {
                        console.log('Tesseract progress:', message);
                        if (message.status === 'recognizing text') {
                            const progress = Math.round(message.progress * 100);
                            progressBar && (progressBar.style.width = `${progress}%`);
                            progressPercentage && (progressPercentage.textContent = `${progress}%`);
                            progressStatus && (progressStatus.textContent = `Recognizing text... ${progress}%`);
                        }
                    },
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    preserve_interword_spaces: '1'
                }
            );

            console.log('Camera OCR result:', result);

            // Clean and display extracted text
            const extractedText = this.cleanExtractedText(result.data.text);
            extractedTextDiv.innerHTML = `<p class="text-gray-800 whitespace-pre-wrap">${extractedText}</p>`;

            // Detect language
            const detectedLanguage = this.detectLanguageFromText(extractedText);
            const languageName = this.getLanguageName(detectedLanguage);
            const confidence = Math.round(result.data.confidence || 0);

            detectedLanguageSpan.textContent = `${languageName} (${confidence}% confidence)`;

            // Auto-fill transliteration input
            this.useTextForTransliteration(extractedText, detectedLanguage);

            return result;

        } catch (error) {
            console.error('Camera OCR Error:', error);
            extractedTextDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try with a clearer image.</p>`;
            detectedLanguageSpan.textContent = 'Error detecting language';
            throw error;
        } finally {
            progressSection?.classList.add('hidden');
        }
    }

    cleanExtractedText(text) {
        console.log('Raw OCR text before cleaning:', text);

        if (!text) {
            return 'No text detected in the image. Please try with a clearer image containing visible text.';
        }

        const trimmedText = text.trim();

        if (trimmedText.length === 0) {
            return 'No text detected in the image. Please try with a clearer image containing visible text.';
        }

        // Check if the text contains any actual words/characters
        const hasMeaningfulContent = this.hasMeaningfulContent(trimmedText);
        if (!hasMeaningfulContent) {
            return 'No readable text detected. The image might be blurry, contain handwriting, or the text is too small. Please try with clear printed text.';
        }

        // Basic cleaning
        let cleaned = trimmedText
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
            .trim();

        return cleaned
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    hasMeaningfulContent(text) {
        if (!text || text.length < 2) return false;

        // Count alphabetic characters (including Indian scripts)
        const alphaChars = text.match(/[a-zA-Z\u0900-\u0DFF]/g);
        if (!alphaChars || alphaChars.length < 3) return false;

        // Check if there are any words (sequences of 2+ characters)
        const words = text.split(/\s+/).filter(word => word.length >= 2);
        return words.length > 0;
    }

    detectLanguageFromText(text) {
        if (!text || text.trim().length < 3) {
            return 'eng';
        }

        const languagePatterns = {
            'hin': /[\u0900-\u097F]/, // Devanagari
            'ben': /[\u0980-\u09FF]/, // Bengali
            'tam': /[\u0B80-\u0BFF]/, // Tamil
            'tel': /[\u0C00-\u0C7F]/, // Telugu
            'kan': /[\u0C80-\u0CFF]/, // Kannada
            'mal': /[\u0D00-\u0D7F]/, // Malayalam
            'guj': /[\u0A80-\u0AFF]/, // Gujarati
            'pan': /[\u0A00-\u0A7F]/, // Punjabi (Gurmukhi)
            'ori': /[\u0B00-\u0B7F]/  // Odia
        };

        // Count characters for each language
        const scores = {};
        for (const [langCode, pattern] of Object.entries(languagePatterns)) {
            const matches = text.match(pattern);
            scores[langCode] = matches ? matches.length : 0;
        }

        // Find language with highest score
        const detectedLang = Object.entries(scores).reduce((max, [lang, score]) =>
            score > max.score ? { lang, score } : max,
            { lang: 'eng', score: 0 }
        );

        return detectedLang.score > 0 ? detectedLang.lang : 'eng';
    }

    getLanguageName(langCode) {
        const languageNames = {
            'eng': 'English',
            'hin': 'Hindi',
            'ben': 'Bengali',
            'tam': 'Tamil',
            'tel': 'Telugu',
            'kan': 'Kannada',
            'mal': 'Malayalam',
            'guj': 'Gujarati',
            'pan': 'Punjabi',
            'ori': 'Odia'
        };
        return languageNames[langCode] || 'Unknown';
    }

    cancelOCR() {
        const fileInput = document.getElementById('ocr-image-upload');
        const preview = document.getElementById('image-preview');
        const textDiv = document.getElementById('ocr-extracted-text');
        const languageSpan = document.getElementById('detected-language');
        const progressSection = document.getElementById('ocr-progress');
        const processBtn = document.getElementById('ocr-process-btn');

        if (fileInput) fileInput.value = '';
        if (preview) preview.innerHTML = '<p class="text-gray-400 italic">Image preview will appear here...</p>';
        if (textDiv) textDiv.innerHTML = '<p class="text-gray-400 italic">Extracted text will appear here...</p>';
        if (languageSpan) languageSpan.textContent = 'Auto-detecting...';
        if (progressSection) progressSection.classList.add('hidden');
        if (processBtn) processBtn.disabled = true;
    }

    copyOCRText() {
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        if (!extractedTextDiv) return;

        const extractedText = extractedTextDiv.textContent;

        if (!extractedText || extractedText.includes('Extracted text will appear here') || extractedText.includes('No text detected') || extractedText.includes('No readable text')) {
            alert('No text to copy. Please extract text from an image first.');
            return;
        }

        navigator.clipboard.writeText(extractedText).then(() => {
            if (window.bharatAksharCommon && typeof window.bharatAksharCommon.showTemporaryFeedback === 'function') {
                window.bharatAksharCommon.showTemporaryFeedback('ocr-copy-btn', '<i data-feather="check" class="w-3 h-3 inline mr-1"></i> Copied!');
            } else {
                this.showTemporaryFeedback('ocr-copy-btn', '<i data-feather="check" class="w-3 h-3 inline mr-1"></i> Copied!');
            }
        });
    }

    useOCRText() {
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        if (!extractedTextDiv) return;

        const extractedText = extractedTextDiv.textContent;

        if (!extractedText || extractedText.includes('Extracted text will appear here') || extractedText.includes('No text detected') || extractedText.includes('No readable text')) {
            alert('No text to use. Please extract text from an image first.');
            return;
        }

        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');

        if (inputText) inputText.value = extractedText;
        if (charCount) charCount.textContent = extractedText.length;

        // Switch to text tab
        this.switchToTextTab();

        // Auto-select the script based on detected language
        const detectedLanguageElement = document.getElementById('detected-language');
        const detectedLanguageText = detectedLanguageElement ? detectedLanguageElement.textContent.toLowerCase() : '';

        const languageToScriptMap = {
            'hindi': 'devanagari',
            'bengali': 'bengali',
            'tamil': 'tamil',
            'telugu': 'telugu',
            'kannada': 'kannada',
            'malayalam': 'malayalam',
            'gujarati': 'gujarati',
            'punjabi': 'gurmukhi',
            'odia': 'oriya',
            'english': 'itrans'
        };

        const sourceScript = document.getElementById('source-script');
        if (sourceScript) {
            for (const [langName, script] of Object.entries(languageToScriptMap)) {
                if (detectedLanguageText.includes(langName)) {
                    sourceScript.value = script;
                    break;
                }
            }
        }

        // ✅ AUTO-TRANSLITERATE AFTER SETTING THE TEXT
        this.autoTransliterate();

        this.showToast('✅ Text successfully transferred and transliterated!', 'success');
    }

    // New method to automatically trigger transliteration
    autoTransliterate() {
        // Wait a brief moment for the DOM to update
        setTimeout(() => {
            const transliterateBtn = document.getElementById('transliterate-btn');
            if (transliterateBtn && !transliterateBtn.disabled) {
                console.log('Auto-triggering transliteration...');
                // Trigger the transliteration
                transliterateBtn.click();
            } else {
                console.warn('Transliterate button not found or disabled');
                // Fallback: try to call the transliterate method directly
                if (window.bharatAksharTransliterate && typeof window.bharatAksharTransliterate.transliterateText === 'function') {
                    window.bharatAksharTransliterate.transliterateText();
                }
            }
        }, 300);
    }

    switchToTextTab() {
        const textTab = document.getElementById('text-tab');
        const imageTab = document.getElementById('image-tab');
        const textSection = document.getElementById('text-input-section');
        const imageSection = document.getElementById('image-ocr-section');

        if (textTab && imageTab && textSection && imageSection) {
            // Update tabs
            textTab.classList.add('tab-active');
            textTab.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            imageTab.classList.remove('tab-active');
            imageTab.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');

            // Update sections
            textSection.classList.remove('hidden');
            imageSection.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.ocr-toast').forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ocr-toast ${type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 4000);
    }

    showTemporaryFeedback(buttonId, feedbackText) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const originalText = button.innerHTML;
        button.innerHTML = feedbackText;

        // Replace feather icons if available
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        setTimeout(() => {
            button.innerHTML = originalText;
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 2000);
    }

    // Utility method to test OCR with simple image
    async testOCRWithSimpleImage() {
        console.log('Testing OCR with simple configuration...');

        const fileInput = document.getElementById('ocr-image-upload');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please upload an image first for testing');
            return;
        }

        const file = fileInput.files[0];

        try {
            // Simple test with English only
            const result = await Tesseract.recognize(file, 'eng');

            console.log('TEST RESULT - Full data:', result);
            console.log('TEST RESULT - Text:', result.data.text);
            console.log('TEST RESULT - Confidence:', result.data.confidence);

            if (result.data.text && result.data.text.trim().length > 0) {
                document.getElementById('ocr-extracted-text').innerHTML =
                    `<p class="text-green-600">Success! Extracted text:</p>
                     <p class="text-gray-800 whitespace-pre-wrap mt-2">${result.data.text}</p>`;
            } else {
                document.getElementById('ocr-extracted-text').innerHTML =
                    `<p class="text-red-600">No text found. Confidence: ${result.data.confidence || 'N/A'}</p>`;
            }

        } catch (error) {
            console.error('TEST ERROR:', error);
            document.getElementById('ocr-extracted-text').innerHTML =
                `<p class="text-red-600">Error: ${error.message}</p>`;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharOCR = new BharatAksharOCR();
});