// Common functionality across all pages
class BharatAksharCommon {
    constructor() {
        this.init();
    }

    init() {
        this.initializeFeatherIcons();
        this.initializeAOS();
        this.setupMobileMenu();
        this.loadVoices();
    }

    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });
        }
    }

    setupMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                // Toggle mobile menu visibility
                if (mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.remove('hidden');
                    mobileMenu.classList.add('block');
                } else {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('block');
                }

                // Toggle menu icon
                const menuIcon = mobileMenuButton.querySelector('i');
                if (menuIcon) {
                    if (mobileMenu.classList.contains('hidden')) {
                        menuIcon.setAttribute('data-feather', 'menu');
                    } else {
                        menuIcon.setAttribute('data-feather', 'x');
                    }
                    feather.replace();
                }
            });

            // Close menu when clicking on links
            const mobileMenuLinks = mobileMenu.querySelectorAll('a');
            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('block');
                    // Reset menu icon
                    const menuIcon = mobileMenuButton.querySelector('i');
                    if (menuIcon) {
                        menuIcon.setAttribute('data-feather', 'menu');
                        feather.replace();
                    }
                });
            });
        }
    }

    loadVoices() {
        if ('speechSynthesis' in window) {
            // Force voice loading by calling getVoices
            speechSynthesis.getVoices();

            // Set up listener for when voices are loaded
            speechSynthesis.onvoiceschanged = () => {
                console.log('Voices loaded:', speechSynthesis.getVoices().length);
            };
        }
    }

    capitalizeEnglishSentence(text) {
        if (!text) return text;

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

    getScriptName(code) {
        const scripts = {
            'devanagari': 'Hindi (Devanagari)',
            'bengali': 'Bengali',
            'tamil': 'Tamil',
            'telugu': 'Telugu',
            'kannada': 'Kannada',
            'malayalam': 'Malayalam',
            'gujarati': 'Gujarati',
            'gurmukhi': 'Punjabi (Gurmukhi)',
            'oriya': 'Odia',
            'itrans': 'English (Latin)',
            'auto': 'Auto Detect'
        };
        return scripts[code] || code;
    }

    showTemporaryFeedback(buttonId, feedbackText) {
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

// Initialize common functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bharatAksharCommon = new BharatAksharCommon();
});