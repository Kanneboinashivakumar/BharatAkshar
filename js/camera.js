// camera-ocr.js
class BharatAksharCamera {
    constructor() {
        this.stream = null;
        this.currentFacingMode = 'environment';
        this.worker = null;
        this.isProcessing = false;
        this.capturedImage = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Camera OCR...');
        this.setupEventListeners();
        await this.initializeTesseract();
    }

    async initializeTesseract() {
        try {
            console.log('🔧 Loading Tesseract.js...');
            this.worker = Tesseract.createWorker({
                logger: m => console.log(m)
            });
            await this.worker.load();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
            console.log('✅ Tesseract ready!');
        } catch (error) {
            console.error('❌ Tesseract failed:', error);
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-camera-btn');
        const switchBtn = document.getElementById('switch-camera-btn');
        const closeBtn = document.getElementById('close-camera-btn');
        const captureBtn = document.getElementById('capture-btn');
        const processBtn = document.getElementById('process-capture-btn');

        if (startBtn) startBtn.onclick = () => this.startCamera();
        if (switchBtn) switchBtn.onclick = () => this.switchCamera();
        if (closeBtn) closeBtn.onclick = () => this.closeCamera();
        if (captureBtn) captureBtn.onclick = () => this.captureImage();
        if (processBtn) processBtn.onclick = () => this.processCapture();
    }

    async startCamera() {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                alert('Camera not supported in this browser.');
                return;
            }
            if (this.stream) this.stream.getTracks().forEach(track => track.stop());

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });

            const video = document.getElementById('camera-video');
            video.srcObject = this.stream;
            await video.play();
            document.getElementById('camera-container').classList.remove('hidden');
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access camera: ' + error.message);
        }
    }

    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        await this.startCamera();
    }

    closeCamera() {
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        document.getElementById('camera-container').classList.add('hidden');
    }

    captureImage() {
        const video = document.getElementById('camera-video');
        if (!video || video.readyState !== 4) {
            alert('Camera not ready. Please wait...');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        this.grayscaleAndEnhance(ctx, canvas.width, canvas.height);

        this.capturedImage = canvas.toDataURL('image/jpeg', 0.9);
        const resultImg = document.getElementById('capture-result');
        resultImg.src = this.capturedImage;
        resultImg.classList.remove('hidden');
        document.getElementById('camera-capture-result').classList.remove('hidden');

        console.log('🖼 Image captured successfully!');
    }

    grayscaleAndEnhance(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const contrast = gray < 128 ? gray * 0.7 : Math.min(255, gray * 1.3);
            data[i] = data[i + 1] = data[i + 2] = contrast;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    dataURLtoBlob(dataURL) {
        const [header, data] = dataURL.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        return new Blob([array], { type: mime });
    }

    async processCapture() {
        if (this.isProcessing) return;
        if (!this.capturedImage) {
            alert('Capture an image first!');
            return;
        }

        this.isProcessing = true;
        const blob = this.dataURLtoBlob(this.capturedImage);

        try {
            const result = await this.worker.recognize(blob);
            let text = result.data.text || '';
            text = this.cleanText(text);

            const extractedDiv = document.getElementById('ocr-extracted-text');
            extractedDiv.innerHTML = `<pre>${text}</pre>`;
            console.log('✅ OCR text extracted:', text);
        } catch (error) {
            console.error('❌ OCR failed:', error);
            const extractedDiv = document.getElementById('ocr-extracted-text');
            extractedDiv.innerHTML = 'Error extracting text. Please try again.';
        } finally {
            this.isProcessing = false;
        }
    }

    cleanText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    async destroy() {
        this.closeCamera();
        if (this.worker) await this.worker.terminate();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharCamera = new BharatAksharCamera();
});

window.BharatAksharCamera = BharatAksharCamera;
