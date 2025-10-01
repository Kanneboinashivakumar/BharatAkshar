# Contributing to BharatAkshar

We ❤️ contributions from the community! This guide will help you get started with contributing to BharatAkshar - the Indian Script Transliterator and OCR tool.

---

## **Ways to Contribute**

### 1. **Improve OCR Accuracy**
- Fix issues with incorrect text extraction for Indian scripts (Bengali, Tamil, Telugu, etc.)
- Enhance recognition of long sentences or complex script combinations
- Improve image preprocessing for better text detection
- Optimize language detection algorithms

### 2. **Enhance Transliteration**
- Ensure 100% accurate transliteration between all supported Indian scripts
- Improve handling of conjunct consonants, vowel signs, and special characters
- Add support for more transliteration schemes (IAST, Harvard-Kyoto, etc.)
- Fix edge cases in script conversion

### 3. **Text-to-Speech Improvements**
- Work on pronunciation accuracy for different Indian languages
- Add voice options or speed/pitch controls
- Support for more regional accents and dialects
- Improve speech synthesis for complex words

### 4. **Fix Bugs**
- Camera functionality issues on different devices
- UI/UX inconsistencies or responsiveness problems
- Performance optimization for large texts
- Cross-browser compatibility issues

### 5. **Add New Features**
- Support for additional Indian scripts or languages
- Offline mode for OCR or transliteration
- Batch processing for multiple images/texts
- Mobile app development
- API development for third-party integrations

### 6. **Documentation & Testing**
- Improve documentation and code comments
- Add unit tests and integration tests
- Create user guides and tutorials
- Translate documentation to Indian languages

---

## **Getting Started**

### 1. **Fork the Repository**
- Click the "Fork" button at the top-right of the [BharatAkshar repository page](https://github.com/your-username/BharatAkshar)

### 2. **Clone Your Fork**

```bash
git clone https://github.com/YOUR_USERNAME/BharatAkshar.git
cd BharatAkshar

### 3. **Create a New Branch**

git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description

4. Make Your Changes

Follow the existing code style and patterns

Test your changes thoroughly

Update documentation if needed

5. Commit Your Changes
git add .
git commit -m "Add feature: short description of changes"


Use clear, descriptive commit messages

6. Push to Your Branch
git push origin feature/your-feature-name

7. Open a Pull Request

Go to your fork on GitHub

Click "Compare & pull request"

Fill in the PR template with:

Description of changes

Related issues (if any)

Testing performed

Screenshots (for UI changes)

Development Setup
Prerequisites

Modern web browser (Chrome, Firefox, Safari, Edge)

Code editor (VS Code recommended)

Basic knowledge of HTML, CSS, JavaScript

Local Development

Open index.html in your browser

For advanced development, use a local server:

# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000

Project Structure
BharatAkshar/
├── index.html              # Main application page
├── transliterate.html      # Transliteration tool
├── contact.html            # Contact page
├── assets/                 # Images, icons, favicons
├── css/                    # Stylesheets
│   ├── style.css
│   └── animations.css
├── js/                     # JavaScript files
│   ├── main.js
│   ├── home.js
│   ├── transliterate.js    # Main transliteration logic
│   └── camera.js           # Camera and OCR functionality
└── README.md

Code Style & Guidelines
JavaScript

Use ES6+ syntax and modern JavaScript features

Follow consistent naming conventions (camelCase for variables/functions)

Use meaningful variable and function names

Comment complex logic and algorithms

Handle errors gracefully with try-catch blocks

HTML

Use semantic HTML5 elements

Ensure accessibility (alt tags, ARIA labels)

Maintain proper indentation and structure

CSS

Use Tailwind CSS utility classes when possible

Follow BEM methodology for custom CSS

Ensure responsive design for all screen sizes

Maintain consistent color scheme and typography

General

Keep functions small and focused on a single responsibility

Use async/await for asynchronous operations

Test across different browsers and devices

Optimize for performance and loading speed

Testing Your Changes
OCR Testing

Test with images containing different Indian scripts

Verify accuracy with various font sizes and styles

Test with poor quality images to ensure robustness

Transliteration Testing

Test with common words and complex sentences

Verify accuracy for all script combinations

Test edge cases (punctuation, numbers, mixed scripts)

Browser Compatibility

Test on Chrome, Firefox, Safari, and Edge

Verify mobile responsiveness

Check accessibility features

Reporting Issues

Provide a clear description

Steps to reproduce the issue

Environment (browser, device, OS)

Screenshots/video (if applicable)

Sample data triggering the issue

Issue Labels:

bug – Something isn’t working

enhancement – New feature or improvement

documentation – Documentation updates

help-wanted – Extra attention needed

good-first-issue – Good for newcomers

Pull Request Process

Ensure tests pass and code doesn’t break existing functionality

Update documentation if functionality changes

Follow PR template with clear description

Request reviews from maintainers

Address review feedback promptly

PR Review Criteria

Code quality and readability

Functionality and bug fixes

Performance implications

Browser compatibility

Accessibility considerations

Areas Needing Immediate Attention

High Priority

✅ Improve Bengali and Tamil OCR accuracy

✅ Fix camera text extraction reliability

✅ Enhance transliteration accuracy for complex words

✅ Optimize performance for large texts

Medium Priority

🔄 Add support for more Indian scripts

🔄 Improve mobile user experience

🔄 Add offline functionality

🔄 Enhance error handling and user feedback

Future Enhancements

⭐ Machine learning-based OCR improvements

⭐ Real-time collaborative features

⭐ Mobile app development

⭐ API for developers

Community
Discussion

Use GitHub Discussions for questions and ideas

Share your use cases and success stories

Suggest new features and improvements

Recognition

All contributors will be recognized in:

Contributors list in README.md

Release notes

Project documentation

Code of Conduct

Be respectful and inclusive

Use welcoming and appropriate language

Exercise consideration and respect in your speech and actions

Collaborate openly and constructively

Harassment and exclusionary behavior aren’t acceptable

Report any misconduct to maintainers

Need Help?

Check existing Issues and Discussions

Create a new issue for bugs or feature requests

Reach out to maintainers directly

License

By contributing, you agree that your contributions will be licensed under the MIT License covering the project.





