/* Reusable script for Practice Pages */
function initPracticePage(modeKey) {
    const list = window.VTP_DATA.practices[modeKey];
    if (!list || list.length === 0) return;

    let currentIndexInList = Math.floor(Math.random() * list.length);
    let currentText = list[currentIndexInList];

    // UI Elements
    const progressBarFill = document.getElementById('prac-progress-bar');
    const progressText = document.getElementById('prac-progress-text');

    const engine = new TypingEngine({
        displayElement: document.getElementById('text-display'),
        inputElement: document.getElementById('typing-input'),
        preventBackspace: false, // Practice mode allows backspace generally
        onProgress: (stats) => {
            const percentage = stats.totalChars === 0 ? 0 : Math.round((stats.currentIndex / stats.totalChars) * 100);
            if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = `${percentage}%`;
        },
        onFinish: (stats) => {
            const percentage = stats.totalChars === 0 ? 0 : Math.round((stats.currentIndex / stats.totalChars) * 100);
            if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
            if (progressText) progressText.textContent = `${percentage}%`;

            // Auto advance logic or simple alert
            setTimeout(() => {
                if (confirm(`Great job! Accuracy: ${stats.accuracy}%. Try another paragraph?`)) {
                    window.resetCurrentPage();
                }
            }, 500);
        }
    });

    engine.start(currentText);

    // Wire up refresh to pick a new random paragraph instantly
    window.resetCurrentPage = () => {
        currentIndexInList = Math.floor(Math.random() * list.length);
        currentText = list[currentIndexInList];
        engine.start(currentText);
        if (progressBarFill) progressBarFill.style.width = `0%`;
        if (progressText) progressText.textContent = `0%`;
        document.getElementById('typing-input').focus();
    };

    document.querySelector('.typing-workspace').addEventListener('click', () => {
        document.getElementById('typing-input').focus();
    });

    const btnNext = document.getElementById('btn-next-prac');
    if (btnNext) {
        btnNext.addEventListener('click', window.resetCurrentPage);
    }
}
