// typing-engine.js - Reusable engine for Typing functionality
class TypingEngine {
    constructor(config) {
        this.displayElement = config.displayElement;
        this.inputElement = config.inputElement;
        this.onProgress = config.onProgress || (() => { });
        this.onFinish = config.onFinish || (() => { });
        this.preventBackspace = config.preventBackspace || false;

        this.text = "";
        this.currentIndex = 0;
        this.mistakes = 0;
        this.backspaceCount = 0;
        this.wrongCharsCount = 0;
        this.isFinished = false;

        this._handleInput = this._handleInput.bind(this);
    }

    start(text) {
        this.text = text;
        this.currentIndex = 0;
        this.mistakes = 0;
        this.backspaceCount = 0;
        this.wrongCharsCount = 0;
        this.isFinished = false;

        this.inputElement.value = '';
        this.inputElement.disabled = false;

        this._renderText();
        this.inputElement.addEventListener('input', this._handleInput);
        this.inputElement.focus();
    }

    stop() {
        this.isFinished = true;
        this.inputElement.disabled = true;
        this.inputElement.removeEventListener('input', this._handleInput);
    }

    reset() {
        this.stop();
        this.start(this.text);
    }

    _renderText() {
        this.displayElement.innerHTML = '';
        this.text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'char';
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.innerText = char;
            }

            if (index < this.currentIndex) {
                // Correctness handled in input
            } else if (index === this.currentIndex) {
                span.classList.add('active');
            } else {
                span.classList.add('pending');
            }

            this.displayElement.appendChild(span);
        });
    }

    _handleInput(e) {
        if (this.isFinished) return;

        const inputVal = this.inputElement.value;
        const charArray = this.displayElement.querySelectorAll('.char');

        // Handle Backspace
        if (inputVal.length < this.currentIndex) {
            this.backspaceCount++;
            if (this.preventBackspace) {
                // Restore input value block
                this.inputElement.value = inputVal + this.text[this.currentIndex - 1];
                return;
            } else {
                this.currentIndex--;
                const prevChar = charArray[this.currentIndex];
                prevChar.className = 'char active';
                if (this.currentIndex + 1 < this.text.length) {
                    charArray[this.currentIndex + 1].className = 'char pending';
                }
                this.onProgress(this._getStats());
                return;
            }
        }

        const currentExpectedChar = this.text[this.currentIndex];
        const typedChar = inputVal[inputVal.length - 1];

        if (this.currentIndex >= this.text.length) {
            this.stop();
            this.onFinish(this._getStats());
            return;
        }

        if (typedChar === currentExpectedChar) {
            charArray[this.currentIndex].className = 'char correct';
        } else {
            charArray[this.currentIndex].className = 'char incorrect';
            this.mistakes++;
            this.wrongCharsCount++;

            // In tutorial/practice modes we might want to prevent advancing on a mistake
            if (this.preventBackspace) {
                charArray[this.currentIndex].classList.add('active');
                this.inputElement.value = inputVal.slice(0, -1);
                this.onProgress(this._getStats());
                return; // Stop right there, don't advance
            }
        }

        this.currentIndex++;

        if (this.currentIndex < this.text.length) {
            charArray[this.currentIndex].className = 'char active';

            // Auto scroll container logic
            const activeChar = charArray[this.currentIndex];
            const containerRect = this.displayElement.getBoundingClientRect();
            const charRect = activeChar.getBoundingClientRect();

            if (charRect.bottom > containerRect.bottom - 20) {
                this.displayElement.scrollTop += 40;
            }
        } else {
            this.stop();
            this.onFinish(this._getStats());
        }

        this.onProgress(this._getStats());
    }

    _getStats() {
        const accuracy = this.currentIndex > 0
            ? Math.round(((this.currentIndex - this.mistakes) / this.currentIndex) * 100)
            : 100;

        return {
            currentIndex: this.currentIndex,
            totalChars: this.text.length,
            mistakes: this.mistakes,
            backspaces: this.backspaceCount,
            wrongChars: this.wrongCharsCount,
            accuracy: Math.max(0, accuracy)
        };
    }
}

// Global Export
window.TypingEngine = TypingEngine;
