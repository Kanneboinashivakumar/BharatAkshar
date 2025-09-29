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

            const result = await Tesseract.recognize(
                file,
                'eng+hin+ben+tam+tel+kan+mal+guj+pan+ori',
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
                        }
                    }
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
            }

        } catch (error) {
            console.error('OCR Error:', error);
            extractedTextDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try with a clearer image.</p>`;
            detectedLanguageSpan.textContent = 'Error detecting language';
        } finally {
            btnText.textContent = 'Extract Text';
            loader.classList.add('hidden');
            progressSection.classList.add('hidden');
            processBtn.disabled = false;
        }
    }

    cleanExtractedText(text) {
        if (!text || text.trim().length === 0) {
            return 'No text detected in the image. Please try with a clearer image containing visible text.';
        }

        return text
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    detectLanguageFromText(text) {
        if (!text || text.trim().length < 5) {
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

        for (const [langCode, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(text)) {
                return langCode;
            }
        }

        return 'eng';
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

        if (!extractedText || extractedText.includes('Extracted text will appear here') || extractedText.includes('No text detected')) {
            alert('No text to copy. Please extract text from an image first.');
            return;
        }

        navigator.clipboard.writeText(extractedText).then(() => {
            window.bharatAksharCommon.showTemporaryFeedback('ocr-copy-btn', '<i data-feather="check" class="w-3 h-3 inline mr-1"></i> Copied!');
        });
    }

    useOCRText() {
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        if (!extractedTextDiv) return;

        const extractedText = extractedTextDiv.textContent;

        if (!extractedText || extractedText.includes('Extracted text will appear here') || extractedText.includes('No text detected')) {
            alert('No text to use. Please extract text from an image first.');
            return;
        }

        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');

        if (inputText) inputText.value = extractedText;
        if (charCount) charCount.textContent = extractedText.length;

        // Switch to text tab
        const textTab = document.getElementById('text-tab');
        const imageTab = document.getElementById('image-tab');
        const textSection = document.getElementById('text-input-section');
        const imageSection = document.getElementById('image-ocr-section');

        if (textTab && imageTab && textSection && imageSection) {
            textTab.classList.add('tab-active');
            imageTab.classList.remove('tab-active');
            textSection.classList.remove('hidden');
            imageSection.classList.add('hidden');
        }

        // Auto-select the script based on detected language
        const detectedLanguage = document.getElementById('detected-language').textContent.toLowerCase();
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
                if (detectedLanguage.includes(langName)) {
                    sourceScript.value = script;
                    break;
                }
            }
        }

        // Show success message
        alert('✅ Text successfully transferred to transliterator!');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharOCR = new BharatAksharOCR();
});