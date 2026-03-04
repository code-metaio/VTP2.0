/* Reusable script for Timed Test Pages */
function initTestPage(durationMinutes) {
    const totalSeconds = durationMinutes * 60;
    let timeLeft = totalSeconds;
    let timerInterval = null;
    let isActive = false;
    let engine = null;
    let testText = window.getTestTextForDuration(durationMinutes);

    // UI
    const overlay = document.getElementById('test-overlay');
    const btnStart = document.getElementById('btn-start-test');
    const btnStop = document.getElementById('btn-stop-test');
    const elTimeLeft = document.getElementById('time-left');
    const elWpm = document.getElementById('wpm');
    const elAcc = document.getElementById('accuracy');
    const testDisplay = document.getElementById('text-display');
    const testInput = document.getElementById('typing-input');

    // Modal UI
    const modal = document.getElementById('results-modal');

    // Format mm:ss
    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    elTimeLeft.textContent = formatTime(timeLeft);

    engine = new TypingEngine({
        displayElement: testDisplay,
        inputElement: testInput,
        preventBackspace: false,
        onProgress: (stats) => {
            const timeElapsedMin = (totalSeconds - timeLeft) / 60;
            if (timeElapsedMin > 0) {
                const wordsTyped = stats.currentIndex / 5;
                elWpm.textContent = Math.round(wordsTyped / timeElapsedMin);
            }
            elAcc.textContent = `${stats.accuracy}%`;
        },
        onFinish: (stats) => {
            finishTest(stats);
        }
    });

    function startTest() {
        if (isActive) return;
        isActive = true;
        overlay.classList.add('hidden');
        testDisplay.classList.remove('blurred-test');
        testDisplay.style.filter = 'none';
        btnStop.disabled = false;

        testText = window.getTestTextForDuration(durationMinutes); // regenerate random text
        engine.start(testText);

        timerInterval = setInterval(() => {
            timeLeft--;
            elTimeLeft.textContent = formatTime(timeLeft);

            // Re-calculate WPM on tick just in case they aren't typing
            const timeElapsedMin = (totalSeconds - timeLeft) / 60;
            if (timeElapsedMin > 0) {
                const wordsTyped = engine.currentIndex / 5;
                elWpm.textContent = Math.round(wordsTyped / timeElapsedMin);
            }

            if (timeLeft <= 0) {
                engine.stop();
                finishTest(engine._getStats());
            }
        }, 1000);
    }

    function stopTest() {
        if (!isActive) return;
        engine.stop();
        finishTest(engine._getStats());
    }

    function finishTest(stats) {
        clearInterval(timerInterval);
        isActive = false;
        btnStop.disabled = true;

        const timeElapsedMin = (totalSeconds - timeLeft) / 60;
        const wordsTyped = stats.currentIndex / 5;
        const finalWpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;

        // Show Modal
        document.getElementById('final-wpm').innerHTML = `${finalWpm} <small>WPM</small>`;
        document.getElementById('final-accuracy').innerHTML = `${stats.accuracy}%`;
        document.getElementById('final-chars').innerHTML = `${stats.currentIndex}/${testText.length}`;

        const elBS = document.getElementById('final-backspaces');
        if (elBS) elBS.innerHTML = `${stats.backspaces}`;

        const elWrong = document.getElementById('final-wrong');
        if (elWrong) elWrong.innerHTML = `${stats.wrongChars}`;

        modal.classList.remove('hidden');
    }

    function resetWorkspace() {
        clearInterval(timerInterval);
        isActive = false;
        timeLeft = totalSeconds;
        elTimeLeft.textContent = formatTime(timeLeft);
        elWpm.textContent = "0";
        elAcc.textContent = "100%";
        btnStop.disabled = true;

        testDisplay.innerHTML = 'Loading text...';
        testDisplay.classList.add('blurred-test');
        testDisplay.style.filter = 'blur(4px)';
        testInput.value = '';
        testInput.disabled = true;
        overlay.classList.remove('hidden');
        modal.classList.add('hidden');
    }

    // Bindings
    btnStart.addEventListener('click', startTest);
    btnStop.addEventListener('click', stopTest);

    document.getElementById('btn-close-modal').addEventListener('click', resetWorkspace);
    document.getElementById('btn-modal-close').addEventListener('click', resetWorkspace);
    document.getElementById('btn-restart-test-modal').addEventListener('click', () => {
        resetWorkspace();
        setTimeout(startTest, 300);
    });

    window.resetCurrentPage = resetWorkspace;

    document.querySelector('.test-workspace').addEventListener('click', () => {
        if (isActive) testInput.focus();
    });
}
