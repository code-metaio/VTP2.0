/* Reusable inline script injected dynamically */
function initTutorialPage(levelKey) {
    const data = VTP_DATA.tutorials[levelKey];
    if (!data) return;

    document.getElementById('tut-title').textContent = data.title;
    document.getElementById('tut-desc').textContent = data.text.split(' ')[0] + '...'; // basic desc

    const engine = new TypingEngine({
        displayElement: document.getElementById('text-display'),
        inputElement: document.getElementById('typing-input'),
        preventBackspace: true,
        onProgress: (stats) => {
            document.getElementById('tut-accuracy').textContent = `${stats.accuracy}%`;
            // Keep Focus
            document.getElementById('typing-input').focus();
        },
        onFinish: (stats) => {
            document.getElementById('tut-accuracy').textContent = `${stats.accuracy}%`;
            alert('Tutorial Level Completed!');
        }
    });

    engine.start(data.text);

    // Wire up refresh
    window.resetCurrentPage = () => {
        engine.reset();
        document.getElementById('tut-accuracy').textContent = `100%`;
    };

    document.querySelector('.typing-workspace').addEventListener('click', () => {
        document.getElementById('typing-input').focus();
    });
}
