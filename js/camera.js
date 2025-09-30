class BharatAksharCamera {
    constructor() {
        this.videoStream = null;
        this.currentFacingMode = 'environment';
        this.capturedImageData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Start camera
        document.getElementById('start-camera-btn')?.addEventListener('click', () => this.startCamera());

        // Switch camera
        document.getElementById('switch-camera-btn')?.addEventListener('click', () => this.switchCamera());

        // Capture image
        document.getElementById('capture-btn')?.addEventListener('click', () => this.captureImage());

        // Close camera
        document.getElementById('close-camera-btn')?.addEventListener('click', () => this.stopCamera());

        // Process captured image
        document.getElementById('process-capture-btn')?.addEventListener('click', () => this.processCapturedImage());
    }

    async startCamera() {
        const video = document.getElementById('camera-video');
        const cameraContainer = document.getElementById('camera-container');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Camera not supported in your browser.');
            return;
        }

        try {
            // Stop existing stream if any
            if (this.videoStream) {
                this.stopCamera();
            }

            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.videoStream;

            // Show camera container
            cameraContainer.classList.remove('hidden');

            // Hide start camera button
            document.getElementById('start-camera-btn').classList.add('hidden');

            // Reset capture result
            document.getElementById('camera-capture-result').classList.add('hidden');
            this.capturedImageData = null;

            await video.play();

        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                alert('Camera access denied. Please allow camera permissions and try again.');
            } else if (err.name === 'NotFoundError') {
                alert('No camera found on your device.');
            } else {
                alert('Cannot access camera. Please check permissions and try again.');
            }
        }
    }

    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        await this.stopCamera();
        await this.startCamera();
    }

    stopCamera() {
        const video = document.getElementById('camera-video');
        const cameraContainer = document.getElementById('camera-container');

        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }

        if (video) {
            video.pause();
            video.srcObject = null;
        }

        // Hide camera container
        if (cameraContainer) {
            cameraContainer.classList.add('hidden');
        }

        // Show start camera button
        document.getElementById('start-camera-btn')?.classList.remove('hidden');
    }

    captureImage() {
        const video = document.getElementById('camera-video');
        const captureResult = document.getElementById('camera-capture-result');
        const captureImg = document.getElementById('capture-result');
        const cameraPlaceholder = document.getElementById('camera-placeholder');

        if (!video || !video.videoWidth || !video.videoHeight) {
            alert('Camera is not ready. Please wait for camera to initialize.');
            return;
        }

        try {
            // Create temporary canvas for capture
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to data URL and store
            this.capturedImageData = canvas.toDataURL('image/jpeg', 0.8);

            // Show preview
            if (captureImg) {
                captureImg.src = this.capturedImageData;
                captureImg.classList.remove('hidden');
            }

            if (cameraPlaceholder) cameraPlaceholder.classList.add('hidden');
            if (captureResult) captureResult.classList.remove('hidden');

            this.showToast('Image captured successfully! Click "Extract Text" to process.', 'success');

        } catch (err) {
            console.error('Capture error:', err);
            alert('Error capturing image. Please try again.');
        }
    }

    async processCapturedImage() {
        if (!this.capturedImageData) {
            alert('No image captured. Please capture an image first.');
            return;
        }

        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        const detectedLanguageSpan = document.getElementById('detected-language');
        const progressSection = document.getElementById('ocr-progress');
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressStatus = document.getElementById('ocr-progress-status');
        const progressPercentage = document.getElementById('ocr-progress-percentage');

        // Show progress
        progressSection.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressStatus.textContent = 'Initializing OCR...';
        progressPercentage.textContent = '0%';

        try {
            console.log('Starting OCR processing from camera...');

            // Use the OCR class if available, otherwise use direct Tesseract
            if (window.bharatAksharOCR && typeof window.bharatAksharOCR.processImageWithTesseract === 'function') {
                await window.bharatAksharOCR.processImageWithTesseract(this.capturedImageData);
            } else {
                // Fallback: Direct Tesseract processing
                await this.processWithTesseract(this.capturedImageData, extractedTextDiv, detectedLanguageSpan,
                    progressBar, progressStatus, progressPercentage);
            }

            this.showToast('Text extracted successfully!', 'success');

        } catch (error) {
            console.error('Camera OCR Processing Error:', error);
            extractedTextDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}. Please try with a clearer image.</p>`;
            detectedLanguageSpan.textContent = 'Error detecting language';
            this.showToast('Error extracting text. Please try again.', 'error');
        } finally {
            progressSection.classList.add('hidden');
        }
    }

    async processWithTesseract(imageData, extractedTextDiv, detectedLanguageSpan, progressBar, progressStatus, progressPercentage) {
        const result = await Tesseract.recognize(
            imageData,
            'eng', // Start with English only for better accuracy
            {
                logger: message => {
                    console.log('Tesseract progress:', message);
                    if (message.status === 'recognizing text') {
                        const progress = Math.round(message.progress * 100);
                        progressBar.style.width = `${progress}%`;
                        progressPercentage.textContent = `${progress}%`;
                        progressStatus.textContent = `Recognizing text... ${progress}%`;
                    } else if (message.status === 'loading tesseract core') {
                        progressStatus.textContent = 'Loading OCR engine...';
                    } else if (message.status === 'initializing tesseract') {
                        progressStatus.textContent = 'Initializing...';
                    }
                }
            }
        );

        console.log('Camera OCR completed:', result);

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
    }

    cleanExtractedText(text) {
        if (!text || text.trim().length === 0) {
            return 'No text detected in the image. Please try with a clearer image containing visible text.';
        }

        // Basic cleaning
        return text
            .replace(/\n\s*\n/g, '\n')
            .replace(/[^\S\r\n]+/g, ' ')
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
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
            'pan': /[\u0A00-\u0A7F]/, // Punjabi
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

    useTextForTransliteration(text, detectedLanguage) {
        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');
        const sourceScript = document.getElementById('source-script');

        if (inputText) {
            inputText.value = text;
        }

        if (charCount) {
            charCount.textContent = text.length;
        }

        // Auto-select source script
        if (sourceScript) {
            const languageToScriptMap = {
                'hin': 'devanagari',
                'ben': 'bengali',
                'tam': 'tamil',
                'tel': 'telugu',
                'kan': 'kannada',
                'mal': 'malayalam',
                'guj': 'gujarati',
                'pan': 'gurmukhi',
                'ori': 'oriya',
                'eng': 'itrans'
            };

            const script = languageToScriptMap[detectedLanguage];
            if (script) {
                sourceScript.value = script;
            }
        }

        this.switchToTextTab();
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
        document.querySelectorAll('.camera-toast').forEach(toast => toast.remove());

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium camera-toast ${type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    // Utility method to check if camera is active
    isCameraActive() {
        return this.videoStream !== null &&
            this.videoStream.active &&
            this.videoStream.getVideoTracks().some(track => track.readyState === 'live');
    }
}

// Initialize camera functionality
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharCamera = new BharatAksharCamera();
});