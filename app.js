// Constants & State
const state = {
    theme: localStorage.getItem('vtp_theme') || 'light',
    currentSection: 'landing',
    
    // Tutorial State
    tutorial: {
        currentLevel: 'home-row',
        text: 'asdf jkl; asdf jkl;',
        currentIndex: 0,
        mistakes: 0,
        isFinished: false
    },
    
    // Practice State
    practice: {
        mode: 'middle',
        texts: {
            middle: "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. Consistency is key when learning to type faster.",
            heavy: "Synchronous operations block instructions until the task is completed, while asynchronous operations can execute without blocking other operations. Understanding the event loop in JavaScript is crucial for developing performant web applications that handle multiple concurrent I/O requests efficiently."
        },
        currentText: '',
        currentIndex: 0,
        mistakes: 0,
        isFinished: false
    },
    
    // Test State
    test: {
        duration: 300, // 5 minutes in seconds
        timeLeft: 300,
        timer: null,
        isActive: false,
        text: "The technology industry is constantly evolving at a rapid pace. New frameworks, languages, and paradigms emerge frequently, demanding continuous learning from software engineers. To stay relevant, one must develop a strong foundation in computer science principles, such as data structures, algorithms, and system design. Moreover, soft skills like communication, collaboration, and problem-solving are equally important. Working in agile teams requires the ability to articulate complex technical concepts to non-technical stakeholders clearly. Furthermore, embracing version control systems like Git and understanding CI/CD pipelines are essential for modern software development workflows. Ultimately, the journey of a developer is a marathon, not a sprint, requiring dedication, curiosity, and a passion for building elegant solutions to complex problems.",
        currentIndex: 0,
        mistakes: 0,
        totalTyped: 0
    }
};

// DOM Elements
const els = {
    // Theme
    themeSwitch: document.getElementById('checkbox'),
    htmlElement: document.documentElement,
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.view-section'),
    pageTitle: document.getElementById('current-page-title'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    sidebar: document.getElementById('sidebar'),
    featureLinks: document.querySelectorAll('.feature-link'),
    btnStartTest: document.getElementById('btn-start-typing'),
    btnLearnBasics: document.getElementById('btn-learn-basics'),
    
    // Tutorial
    tutTitle: document.getElementById('tut-title'),
    tutDesc: document.getElementById('tut-desc'),
    tutTextDisplay: document.getElementById('tut-text'),
    tutInput: document.getElementById('tut-input'),
    tutAccuracy: document.getElementById('tut-accuracy'),
    tutResetBtn: document.getElementById('btn-reset-tut'),
    levelBtns: document.querySelectorAll('.level-btn'),
    
    // Practice
    pracTabs: document.querySelectorAll('.tab-btn'),
    pracTextDisplay: document.getElementById('prac-text-display'),
    pracInput: document.getElementById('prac-input'),
    pracProgressBar: document.getElementById('prac-progress-bar'),
    pracProgressText: document.getElementById('prac-progress-text'),
    btnNextPrac: document.getElementById('btn-next-prac'),
    
    // Test
    testDurationSelect: document.getElementById('test-duration'),
    testOverlay: document.getElementById('test-overlay'),
    btnStartTestOverlay: document.getElementById('btn-start-test'),
    btnStopTest: document.getElementById('btn-stop-test'),
    testTextDisplay: document.getElementById('test-text-display'),
    testInput: document.getElementById('test-input'),
    timeLeftDisplay: document.getElementById('time-left'),
    wpmDisplay: document.getElementById('wpm'),
    accuracyDisplay: document.getElementById('accuracy'),
    
    // Modal
    resultsModal: document.getElementById('results-modal'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnRestartModal: document.getElementById('btn-restart-test-modal'),
    finalWpm: document.getElementById('final-wpm'),
    finalAccuracy: document.getElementById('final-accuracy'),
    finalChars: document.getElementById('final-chars')
};

// Initialize Application
function init() {
    initTheme();
    initNavigation();
    initTutorial();
    initPractice();
    initTest();
}

// ==========================================
// Theme Management
// ==========================================
function initTheme() {
    els.htmlElement.setAttribute('data-theme', state.theme);
    els.themeSwitch.checked = state.theme === 'dark';
    
    els.themeSwitch.addEventListener('change', (e) => {
        state.theme = e.target.checked ? 'dark' : 'light';
        els.htmlElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('vtp_theme', state.theme);
    });
}

// ==========================================
// Navigation & SPA Logic
// ==========================================
function initNavigation() {
    // Topbar Mobile Menu
    els.mobileMenuBtn.addEventListener('click', () => {
        els.sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!els.sidebar.contains(e.target) && !els.mobileMenuBtn.contains(e.target)) {
                els.sidebar.classList.remove('active');
            }
        }
    });

    // Sidebar Links
    els.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchToSection(target);
            if (window.innerWidth <= 768) {
                els.sidebar.classList.remove('active');
            }
        });
    });

    // Landing Page Links
    els.featureLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-link');
            switchToSection(target);
        });
    });

    els.btnStartTest.addEventListener('click', () => switchToSection('test'));
    els.btnLearnBasics.addEventListener('click', () => switchToSection('tutorials'));
}

function switchToSection(sectionId) {
    if (state.currentSection === sectionId) return;
    
    // Pause test if navigating away
    if (state.currentSection === 'test' && state.test.isActive) {
        stopTest();
    }
    
    state.currentSection = sectionId;

    // Update Nav Activity
    els.navItems.forEach(item => {
        if (item.getAttribute('data-target') === sectionId) {
            item.classList.add('active');
            els.pageTitle.textContent = item.querySelector('span').textContent;
        } else {
            item.classList.remove('active');
        }
    });

    // Update Sections Activity
    els.sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Auto-focus logic based on section
    setTimeout(() => {
        if(sectionId === 'tutorials') {
            els.tutInput.focus();
        } else if(sectionId === 'practices') {
            els.pracInput.focus();
        }
    }, 100);
}

// ==========================================
// Utility: Render Text for Typing
// ==========================================
function renderTextForTyping(text, container, currentIndex) {
    container.innerHTML = '';
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        if (char === ' ') {
            span.innerHTML = '&nbsp;';
        } else {
            span.innerText = char;
        }

        if (index < currentIndex) {
            // Evaluated previously, correctness logic handled in input event
            span.classList.add('correct'); // simplified for rendering, actual correctness state is maintained dynamically
        } else if (index === currentIndex) {
            span.classList.add('active');
        } else {
            span.classList.add('pending');
        }
        
        container.appendChild(span);
    });
}

// ==========================================
// Tutorials Logic
// ==========================================
const tutorialLevels = {
    'home-row': { title: 'Home Row Basics', desc: 'A S D F J K L ;', text: 'asdf jkl; asdf jkl; asdf jkl;' },
    'top-row': { title: 'Top Row Reach', desc: 'Q W E R T Y U I O P', text: 'qwer yuiop qwer yuiop' },
    'bottom-row': { title: 'Bottom Row Reach', desc: 'Z X C V B N M , . /', text: 'zxcv bnm,. zxcv bnm,.' },
    'symbols': { title: 'Common Symbols', desc: '! @ # $ % & * ( )', text: '!@#$ %&*() !@#$ %&*()' }
};

function initTutorial() {
    loadTutorialLevel(state.tutorial.currentLevel);

    els.levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadTutorialLevel(btn.getAttribute('data-level'));
            els.tutInput.focus();
        });
    });

    els.tutResetBtn.addEventListener('click', () => {
        loadTutorialLevel(state.tutorial.currentLevel);
        els.tutInput.focus();
    });

    els.tutInput.addEventListener('input', handleTutorialInput);
    
    // Keep focus
    document.querySelector('.tutorial-workspace').addEventListener('click', () => {
        if(!state.tutorial.isFinished) els.tutInput.focus();
    });
}

function loadTutorialLevel(levelKey) {
    state.tutorial.currentLevel = levelKey;
    const levelData = tutorialLevels[levelKey];
    
    state.tutorial.text = levelData.text;
    state.tutorial.currentIndex = 0;
    state.tutorial.mistakes = 0;
    state.tutorial.isFinished = false;
    
    els.tutTitle.textContent = levelData.title;
    els.tutDesc.textContent = levelData.desc;
    els.tutAccuracy.textContent = '100%';
    els.tutInput.value = '';
    
    renderTextForTyping(state.tutorial.text, els.tutTextDisplay, state.tutorial.currentIndex);
}

function handleTutorialInput(e) {
    if (state.tutorial.isFinished) return;
    
    const inputVal = els.tutInput.value;
    const charArray = els.tutTextDisplay.querySelectorAll('.char');
    const currentExpectedChar = state.tutorial.text[state.tutorial.currentIndex];
    const typedChar = inputVal[inputVal.length - 1];
    
    // Prevent typing if length is less than expected (backspace handled differently usually, but we lock it here)
    if(inputVal.length < state.tutorial.currentIndex) {
        els.tutInput.value = els.tutInput.value + currentExpectedChar; // prevent backspace
        return;
    }

    if (typedChar === currentExpectedChar) {
        // Correct
        charArray[state.tutorial.currentIndex].className = 'char correct';
        state.tutorial.currentIndex++;
        
        if (state.tutorial.currentIndex < state.tutorial.text.length) {
            charArray[state.tutorial.currentIndex].className = 'char active';
        } else {
            // Finished
            state.tutorial.isFinished = true;
            markTutorialLevelComplete(state.tutorial.currentLevel);
        }
    } else {
        // Incorrect
        charArray[state.tutorial.currentIndex].className = 'char incorrect active';
        state.tutorial.mistakes++;
        // Revert input value so they have to type the correct one
        els.tutInput.value = inputVal.slice(0, -1);
    }
    
    // Update Accuracy
    const totalAttempted = state.tutorial.currentIndex + state.tutorial.mistakes;
    let accuracy = 100;
    if (totalAttempted > 0) {
        accuracy = Math.round(((totalAttempted - state.tutorial.mistakes) / totalAttempted) * 100);
    }
    els.tutAccuracy.textContent = `${accuracy}%`;
}

function markTutorialLevelComplete(levelKey) {
    els.levelBtns.forEach(btn => {
        if(btn.getAttribute('data-level') === levelKey) {
            btn.classList.add('completed');
        }
    });
}

// ==========================================
// Practices Logic
// ==========================================
function initPractice() {
    loadPracticeMode(state.practice.mode);

    els.pracTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            els.pracTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadPracticeMode(tab.getAttribute('data-mode'));
            els.pracInput.focus();
        });
    });
    
    els.btnNextPrac.addEventListener('click', () => {
        loadPracticeMode(state.practice.mode);
        els.pracInput.focus();
    });

    els.pracInput.addEventListener('input', handlePracticeInput);
    
    document.querySelector('.practice-workspace').addEventListener('click', () => {
        if(!state.practice.isFinished) els.pracInput.focus();
    });
}

function loadPracticeMode(mode) {
    state.practice.mode = mode;
    state.practice.currentText = state.practice.texts[mode]; // In a real app, pick randomly from an array
    state.practice.currentIndex = 0;
    state.practice.mistakes = 0;
    state.practice.isFinished = false;
    
    els.pracInput.value = '';
    updatePracticeProgress();
    renderTextForTyping(state.practice.currentText, els.pracTextDisplay, state.practice.currentIndex);
}

function handlePracticeInput(e) {
    if (state.practice.isFinished) return;
    
    const inputVal = els.pracInput.value;
    const charArray = els.pracTextDisplay.querySelectorAll('.char');
    const currentExpectedChar = state.practice.currentText[state.practice.currentIndex];
    const typedChar = inputVal[inputVal.length - 1];
    
    if(inputVal.length < state.practice.currentIndex) {
        els.pracInput.value = els.pracInput.value + currentExpectedChar; 
        return;
    }

    if (typedChar === currentExpectedChar) {
        charArray[state.practice.currentIndex].className = 'char correct';
        state.practice.currentIndex++;
        
        if (state.practice.currentIndex < state.practice.currentText.length) {
            charArray[state.practice.currentIndex].className = 'char active';
        } else {
            state.practice.isFinished = true;
        }
        updatePracticeProgress();
    } else {
        charArray[state.practice.currentIndex].className = 'char incorrect active';
        state.practice.mistakes++;
        els.pracInput.value = inputVal.slice(0, -1);
    }
}

function updatePracticeProgress() {
    const total = state.practice.currentText.length;
    const current = state.practice.currentIndex;
    const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
    
    els.pracProgressBar.style.width = `${percentage}%`;
    els.pracProgressText.textContent = `${percentage}%`;
}


// ==========================================
// Typing Test Logic
// ==========================================
function initTest() {
    els.testDurationSelect.addEventListener('change', (e) => {
        state.test.duration = parseInt(e.target.value) * 60;
        resetTest();
    });

    els.btnStartTestOverlay.addEventListener('click', startTest);
    els.btnStopTest.addEventListener('click', stopTest);
    els.testInput.addEventListener('input', handleTestInput);
    
    // Modal buttons
    els.btnCloseModal.addEventListener('click', hideModal);
    els.btnModalClose.addEventListener('click', hideModal);
    els.btnRestartModal.addEventListener('click', () => {
        hideModal();
        resetTest();
    });
    
    document.querySelector('.test-workspace').addEventListener('click', () => {
        if(state.test.isActive) els.testInput.focus();
    });
    
    resetTest();
}

function resetTest() {
    clearInterval(state.test.timer);
    state.test.isActive = false;
    state.test.timeLeft = state.test.duration;
    state.test.currentIndex = 0;
    state.test.mistakes = 0;
    state.test.totalTyped = 0;
    
    els.testInput.value = '';
    els.testInput.disabled = true;
    
    updateTestUI();
    renderTextForTyping(state.test.text, els.testTextDisplay, 0);
    
    els.testOverlay.classList.remove('hidden');
    els.btnStopTest.disabled = true;
    els.testDurationSelect.disabled = false;
}

function startTest() {
    if(state.test.isActive) return;
    
    state.test.isActive = true;
    els.testOverlay.classList.add('hidden');
    els.testInput.disabled = false;
    els.testInput.focus();
    els.btnStopTest.disabled = false;
    els.testDurationSelect.disabled = true;
    
    renderTextForTyping(state.test.text, els.testTextDisplay, 0);
    
    state.test.timer = setInterval(() => {
        state.test.timeLeft--;
        updateTestUI();
        
        if(state.test.timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

function stopTest() {
    clearInterval(state.test.timer);
    finishTest();
}

function finishTest() {
    state.test.isActive = false;
    els.testInput.disabled = true;
    els.btnStopTest.disabled = true;
    
    // Calculate final stats
    const timeElapsedSec = state.test.duration - state.test.timeLeft;
    const timeElapsedMin = timeElapsedSec / 60;
    
    const wordsTyped = state.test.currentIndex / 5; // Standard: 5 chars = 1 word
    const wpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;
    
    const accuracy = state.test.currentIndex > 0 
        ? Math.round(((state.test.currentIndex - state.test.mistakes) / state.test.currentIndex) * 100) 
        : 0;
        
    // Show Modal
    els.finalWpm.innerHTML = `${wpm} <small>WPM</small>`;
    els.finalAccuracy.innerHTML = `${Math.max(0, accuracy)}%`;
    els.finalChars.innerHTML = `${state.test.currentIndex}/${state.test.text.length}`;
    
    els.resultsModal.classList.remove('hidden');
}

function hideModal() {
    els.resultsModal.classList.add('hidden');
}

function updateTestUI() {
    // Format Time
    const m = Math.floor(state.test.timeLeft / 60).toString().padStart(2, '0');
    const s = (state.test.timeLeft % 60).toString().padStart(2, '0');
    els.timeLeftDisplay.textContent = `${m}:${s}`;
    
    // Calculate Live Stats
    const timeElapsedSec = state.test.duration - state.test.timeLeft;
    const timeElapsedMin = timeElapsedSec / 60;
    
    if (timeElapsedMin > 0) {
        const wordsTyped = state.test.currentIndex / 5;
        const wpm = Math.round(wordsTyped / timeElapsedMin);
        els.wpmDisplay.textContent = wpm;
    }
    
    const accuracy = state.test.currentIndex > 0 
        ? Math.round(((state.test.currentIndex - state.test.mistakes) / state.test.currentIndex) * 100) 
        : 100;
        
    els.accuracyDisplay.textContent = `${Math.max(0, accuracy)}%`;
}

function handleTestInput(e) {
    if (!state.test.isActive) return;
    
    const inputVal = els.testInput.value;
    const charArray = els.testTextDisplay.querySelectorAll('.char');
    
    // Handle backspace properly for test mode
    if (inputVal.length < state.test.currentIndex) {
        // User pressed backspace
        state.test.currentIndex--;
        const prevChar = charArray[state.test.currentIndex];
        
        // Remove correct/incorrect classes, make it pending/active
        prevChar.className = 'char active';
        if (state.test.currentIndex + 1 < state.test.text.length) {
            charArray[state.test.currentIndex + 1].className = 'char pending';
        }
        return;
    }

    const currentExpectedChar = state.test.text[state.test.currentIndex];
    const typedChar = inputVal[inputVal.length - 1];
    
    if (state.test.currentIndex >= state.test.text.length) {
        finishTest();
        return;
    }

    if (typedChar === currentExpectedChar) {
        charArray[state.test.currentIndex].className = 'char correct';
    } else {
        charArray[state.test.currentIndex].className = 'char incorrect';
        state.test.mistakes++;
    }
    
    state.test.currentIndex++;
    state.test.totalTyped++;
    
    if (state.test.currentIndex < state.test.text.length) {
        charArray[state.test.currentIndex].className = 'char active';
        
        // Auto-scroll text if needed (basic implementation)
        const activeChar = charArray[state.test.currentIndex];
        const containerRect = els.testTextDisplay.getBoundingClientRect();
        const charRect = activeChar.getBoundingClientRect();
        
        if(charRect.bottom > containerRect.bottom - 20) {
            els.testTextDisplay.scrollTop += 40;
        }
    } else {
        finishTest();
    }
    
    updateTestUI();
}

// Start Application
document.addEventListener('DOMContentLoaded', init);
