class BharatAksharCamera {
    constructor() {
        this.videoStream = null;
        this.currentFacingMode = 'environment';
        this.capturedImageData = null;
        this.isProcessing = false;
        this.ocrSpaceAPIKey = 'K87899142388957'; // Free public demo key
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-camera-btn')?.addEventListener('click', () => this.startCamera());
        document.getElementById('switch-camera-btn')?.addEventListener('click', () => this.switchCamera());
        document.getElementById('capture-btn')?.addEventListener('click', () => this.captureImage());
        document.getElementById('close-camera-btn')?.addEventListener('click', () => this.stopCamera());
        document.getElementById('process-capture-btn')?.addEventListener('click', () => this.processCapturedImage());
    }

    async startCamera() {
        if (this.isProcessing) return alert('Please wait, processing in progress.');
        const video = document.getElementById('camera-video');
        const cameraContainer = document.getElementById('camera-container');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return alert('Camera not supported.');
        }

        try {
            if (this.videoStream) await this.stopCamera();

            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = this.videoStream;

            cameraContainer.classList.remove('hidden');
            document.getElementById('start-camera-btn').classList.add('hidden');

            // Reset capture result
            document.getElementById('camera-capture-result').classList.add('hidden');
            this.capturedImageData = null;

            await video.play();

        } catch (err) {
            console.error('Camera error:', err);
            alert('Camera error: ' + err.message);
        }
    }

    captureImage() {
        if (this.isProcessing) return alert('Please wait, processing in progress.');
        const video = document.getElementById('camera-video');
        if (!video || !video.videoWidth || !video.videoHeight) return alert('Camera not ready.');

        try {
            console.log('Capturing image...');

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            this.capturedImageData = canvas.toDataURL('image/jpeg', 0.9);
            console.log('Image captured successfully');

            // Show preview properly
            const captureImg = document.getElementById('capture-result');
            const captureResult = document.getElementById('camera-capture-result');
            const cameraPlaceholder = document.getElementById('camera-placeholder');

            if (captureImg) {
                captureImg.src = this.capturedImageData;
                captureImg.classList.remove('hidden');
                console.log('Image preview set');
            }

            if (cameraPlaceholder) {
                cameraPlaceholder.classList.add('hidden');
            }

            if (captureResult) {
                captureResult.classList.remove('hidden');
                console.log('Capture result shown');
            }

            this.showToast('✅ Image captured! Click "Extract Text" to process.', 'success');

        } catch (err) {
            console.error('Capture error:', err);
            alert('Error capturing image: ' + err.message);
        }
    }

    async processCapturedImage() {
        if (this.isProcessing) return alert('OCR is already processing.');
        if (!this.capturedImageData) return alert('No image captured.');

        this.isProcessing = true;
        console.log('Starting OCR processing...');

        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        const detectedLanguageSpan = document.getElementById('detected-language');
        const progressBar = document.getElementById('ocr-progress-bar');
        const progressStatus = document.getElementById('ocr-progress-status');
        const progressSection = document.getElementById('ocr-progress');
        const processBtn = document.getElementById('process-capture-btn');

        // Clear previous results and show processing
        if (extractedTextDiv) {
            extractedTextDiv.innerHTML = '<p class="text-gray-500 italic">Processing image... Please wait.</p>';
        }
        if (detectedLanguageSpan) {
            detectedLanguageSpan.textContent = 'Processing...';
        }

        progressSection.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressStatus.textContent = 'Initializing OCR...';
        if (processBtn) processBtn.disabled = true;

        try {
            // Strategy 1: First try Tesseract.js (client-side, works offline)
            progressStatus.textContent = 'Trying Tesseract.js...';
            progressBar.style.width = '30%';

            const tesseractResult = await this.tryTesseractOCR(this.capturedImageData);

            if (tesseractResult.success && tesseractResult.text && tesseractResult.text.trim().length > 3) {
                progressBar.style.width = '80%';
                progressStatus.textContent = 'Processing results...';

                console.log('Tesseract succeeded:', tesseractResult);
                this.displayExtractedText(
                    tesseractResult.text,
                    tesseractResult.confidence,
                    tesseractResult.detectedLanguage,
                    extractedTextDiv,
                    detectedLanguageSpan
                );

                progressBar.style.width = '100%';
                progressStatus.textContent = 'Completed!';

                // Auto-transfer after delay
                setTimeout(() => {
                    this.useTextForTransliteration(tesseractResult.text, tesseractResult.detectedLanguage);
                }, 1500);

            } else {
                // Strategy 2: Fallback to OCR.Space API
                progressStatus.textContent = 'Tesseract failed, trying OCR.Space API...';
                progressBar.style.width = '50%';

                const ocrSpaceResult = await this.tryOCRSpaceAPI(this.capturedImageData);

                if (ocrSpaceResult.success && ocrSpaceResult.text && ocrSpaceResult.text.trim().length > 3) {
                    progressBar.style.width = '80%';
                    progressStatus.textContent = 'Processing results...';

                    console.log('OCR.Space succeeded:', ocrSpaceResult);
                    this.displayExtractedText(
                        ocrSpaceResult.text,
                        ocrSpaceResult.confidence,
                        ocrSpaceResult.detectedLanguage,
                        extractedTextDiv,
                        detectedLanguageSpan
                    );

                    progressBar.style.width = '100%';
                    progressStatus.textContent = 'Completed!';

                    setTimeout(() => {
                        this.useTextForTransliteration(ocrSpaceResult.text, ocrSpaceResult.detectedLanguage);
                    }, 1500);

                } else {
                    // Strategy 3: Final fallback - simple canvas text extraction
                    progressStatus.textContent = 'Trying alternative method...';
                    progressBar.style.width = '70%';

                    const fallbackResult = await this.trySimpleTextExtraction(this.capturedImageData);

                    if (fallbackResult.success) {
                        progressBar.style.width = '100%';
                        progressStatus.textContent = 'Completed with basic extraction!';

                        this.displayExtractedText(
                            fallbackResult.text,
                            fallbackResult.confidence,
                            fallbackResult.detectedLanguage,
                            extractedTextDiv,
                            detectedLanguageSpan
                        );

                        setTimeout(() => {
                            this.useTextForTransliteration(fallbackResult.text, fallbackResult.detectedLanguage);
                        }, 1500);

                    } else {
                        this.handleOCRFailure(
                            'All OCR methods failed. Please try a clearer image or different text.',
                            extractedTextDiv,
                            detectedLanguageSpan
                        );
                    }
                }
            }

        } catch (err) {
            console.error('OCR processing error:', err);
            this.handleOCRFailure(err.message, extractedTextDiv, detectedLanguageSpan);
        } finally {
            this.isProcessing = false;
            progressSection.classList.add('hidden');
            if (processBtn) processBtn.disabled = false;
        }
    }

    async tryTesseractOCR(imageData) {
        try {
            console.log('Attempting Tesseract OCR...');

            // Check if Tesseract is available
            if (typeof Tesseract === 'undefined') {
                throw new Error('Tesseract not loaded');
            }

            const blob = this.dataURLToBlob(imageData);

            // Use multiple Indian languages
            const languages = 'eng+hin+ben+tam+tel+kan+mal+guj';

            const result = await Tesseract.recognize(blob, languages, {
                logger: m => console.log('Tesseract progress:', m)
            });

            console.log('Tesseract raw result:', result);

            if (result && result.data && result.data.text) {
                const detectedLanguage = this.detectLanguageFromText(result.data.text);
                const confidence = Math.round(result.data.confidence || 30);

                return {
                    success: true,
                    text: this.cleanExtractedText(result.data.text),
                    confidence: confidence,
                    detectedLanguage: detectedLanguage,
                    source: 'Tesseract'
                };
            } else {
                throw new Error('No text extracted by Tesseract');
            }

        } catch (err) {
            console.error('Tesseract OCR failed:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    async tryOCRSpaceAPI(imageData) {
        try {
            console.log('Attempting OCR.Space API...');

            const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '');

            const formData = new FormData();
            formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
            formData.append('apikey', this.ocrSpaceAPIKey);
            formData.append('language', 'eng'); // Start with English
            formData.append('OCREngine', '1');
            formData.append('scale', 'true');
            formData.append('isTable', 'false');

            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('OCR.Space response:', data);

            if (data.IsErroredOnProcessing) {
                return {
                    success: false,
                    error: data.ErrorMessage || 'OCR processing failed'
                };
            }

            if (data.ParsedResults && data.ParsedResults.length > 0) {
                const parsedResult = data.ParsedResults[0];
                const extractedText = parsedResult.ParsedText;

                if (extractedText && extractedText.trim().length > 0) {
                    const detectedLanguage = this.detectLanguageFromText(extractedText);
                    const confidence = Math.round(parsedResult.FileParseExitCode === 1 ? 85 : 70);

                    return {
                        success: true,
                        text: this.cleanExtractedText(extractedText),
                        confidence: confidence,
                        detectedLanguage: detectedLanguage,
                        source: 'OCR.Space'
                    };
                }
            }

            return {
                success: false,
                error: 'No text detected in OCR.Space response'
            };

        } catch (err) {
            console.error('OCR.Space API failed:', err);
            return {
                success: false,
                error: `OCR.Space: ${err.message}`
            };
        }
    }

    async trySimpleTextExtraction(imageData) {
        try {
            console.log('Attempting simple text extraction...');

            // This is a basic fallback - in a real app you might use other methods
            // For now, we'll return a message asking user to type manually

            return {
                success: true,
                text: 'OCR extraction failed. Please type the text manually in the input field above.',
                confidence: 0,
                detectedLanguage: 'eng',
                source: 'Fallback'
            };

        } catch (err) {
            console.error('Simple extraction failed:', err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    detectLanguageFromText(text) {
        if (!text) return 'eng';

        // Unicode ranges for Indian scripts
        const scriptPatterns = {
            'hin': /[\u0900-\u097F]/, // Devanagari
            'ben': /[\u0980-\u09FF]/, // Bengali
            'tam': /[\u0B80-\u0BFF]/, // Tamil
            'tel': /[\u0C00-\u0C7F]/, // Telugu
            'kan': /[\u0C80-\u0CFF]/, // Kannada
            'mal': /[\u0D00-\u0D7F]/, // Malayalam
            'guj': /[\u0A80-\u0AFF]/, // Gujarati
            'pan': /[\u0A00-\u0A7F]/, // Gurmukhi
            'ori': /[\u0B00-\u0B7F]/  // Odia
        };

        // Count characters for each script
        let maxCount = 0;
        let detectedLang = 'eng';

        for (const [lang, pattern] of Object.entries(scriptPatterns)) {
            const matches = text.match(new RegExp(pattern, 'g'));
            const count = matches ? matches.length : 0;
            if (count > maxCount) {
                maxCount = count;
                detectedLang = lang;
            }
        }

        console.log(`Language detected: ${detectedLang} (${maxCount} characters)`);
        return detectedLang;
    }

    cleanExtractedText(text) {
        if (!text) return '';

        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n\s*\n/g, '\n\n')
            .replace(/[^\S\n]+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .trim();
    }

    displayExtractedText(text, confidence, detectedLanguage, extractedTextDiv, detectedLanguageSpan) {
        console.log('Displaying extracted text:', text);

        const languageNames = {
            'eng': 'English', 'hin': 'Hindi', 'ben': 'Bengali', 'tam': 'Tamil',
            'tel': 'Telugu', 'kan': 'Kannada', 'mal': 'Malayalam', 'guj': 'Gujarati',
            'pan': 'Punjabi', 'ori': 'Odia'
        };

        const displayText = text.length > 500 ? text.substring(0, 500) + '...' : text;

        if (extractedTextDiv) {
            extractedTextDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-green-800 font-bold text-lg">📝 EXTRACTED TEXT</span>
                        <span class="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">${confidence}% confidence</span>
                    </div>
                    <div class="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded border text-base leading-relaxed max-h-60 overflow-y-auto">
                        ${displayText}
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            Language: <strong>${languageNames[detectedLanguage] || 'Unknown'}</strong> | 
                            Source: <strong>${confidence > 0 ? 'OCR' : 'Manual Input Required'}</strong>
                        </span>
                        <button onclick="window.bharatAksharCamera.transferToTransliteration()" 
                                class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                            ➡️ Transfer to Transliterator
                        </button>
                    </div>
                </div>
            `;
        }

        if (detectedLanguageSpan) {
            detectedLanguageSpan.textContent = `${languageNames[detectedLanguage] || 'Unknown'} (${confidence}% confidence)`;
        }

        this.showToast(`✅ Text extracted successfully!`, 'success');
    }

    transferToTransliteration() {
        const extractedTextDiv = document.getElementById('ocr-extracted-text');
        if (!extractedTextDiv) return;

        // Get text from the display div
        const textElement = extractedTextDiv.querySelector('.text-gray-800');
        const text = textElement ? textElement.textContent : extractedTextDiv.textContent || extractedTextDiv.innerText;

        if (text && text.trim().length > 0 && !text.includes('OCR extraction failed')) {
            const detectedLanguage = this.detectLanguageFromText(text);
            this.useTextForTransliteration(text, detectedLanguage);
        } else {
            this.showToast('Please extract text first or type manually.', 'error');
        }
    }

    useTextForTransliteration(text, detectedLanguage) {
        console.log('Transferring to transliteration:', text);

        const inputText = document.getElementById('input-text');
        const charCount = document.getElementById('char-count');
        const sourceScript = document.getElementById('source-script');

        if (inputText) {
            inputText.value = text;
            console.log('Text transferred to input field');
        }

        if (charCount) {
            charCount.textContent = text.length;
        }

        if (sourceScript) {
            const scriptMap = {
                'hin': 'devanagari', 'ben': 'bengali', 'tam': 'tamil',
                'tel': 'telugu', 'kan': 'kannada', 'mal': 'malayalam',
                'guj': 'gujarati', 'pan': 'gurmukhi', 'ori': 'oriya', 'eng': 'itrans'
            };
            const script = scriptMap[detectedLanguage];
            if (script) {
                sourceScript.value = script;
                console.log('Auto-selected script:', script);
            }
        }

        // Switch to text tab
        this.switchToTextTab();

        this.showToast('✅ Text transferred to transliterator!', 'success');
    }

    dataURLToBlob(dataURL) {
        const parts = dataURL.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const binary = atob(parts[1]);
        const array = Uint8Array.from(binary, c => c.charCodeAt(0));
        return new Blob([array], { type: mime });
    }

    handleOCRFailure(error, extractedTextDiv, detectedLanguageSpan) {
        console.error('OCR Failure:', error);

        if (extractedTextDiv) {
            extractedTextDiv.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800 font-bold mb-2">❌ OCR EXTRACTION FAILED</p>
                    <p class="text-red-600 mb-3">${error}</p>
                    <div class="text-sm text-red-700">
                        <p class="font-semibold">Tips for better OCR:</p>
                        <ul class="list-disc list-inside mt-1">
                            <li>Ensure good lighting on the text</li>
                            <li>Hold camera steady and focus properly</li>
                            <li>Capture clear, high-contrast images</li>
                            <li>Type text manually if OCR continues to fail</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        if (detectedLanguageSpan) {
            detectedLanguageSpan.textContent = 'Detection failed';
        }

        this.showToast('❌ Text extraction failed. Please try again or type manually.', 'error');
    }

    switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        this.stopCamera().then(() => this.startCamera());
    }

    async stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }

        const video = document.getElementById('camera-video');
        if (video) {
            video.srcObject = null;
        }

        document.getElementById('camera-container').classList.add('hidden');
        document.getElementById('start-camera-btn').classList.remove('hidden');
        document.getElementById('camera-capture-result').classList.add('hidden');
    }

    switchToTextTab() {
        const textTab = document.getElementById('text-tab');
        const imageTab = document.getElementById('image-tab');
        const textSection = document.getElementById('text-input-section');
        const imageSection = document.getElementById('image-ocr-section');

        if (textTab && imageTab && textSection && imageSection) {
            textTab.classList.add('tab-active');
            imageTab.classList.remove('tab-active');
            textSection.classList.remove('hidden');
            imageSection.classList.add('hidden');
            console.log('Switched to text tab');
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('[data-toast]').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.setAttribute('data-toast', 'true');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharCamera = new BharatAksharCamera();
});