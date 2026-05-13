(function() {
    let lastLines = 'on';
    let lastWrap = 'on';

    function updateMonacoSettings(e) {
        if (e && e.detail) {
            lastLines = e.detail.linesEnabled === false ? 'off' : 'on';
            lastWrap = e.detail.wrapEnabled === false ? 'off' : 'on';
        }
        
        if (window.monaco && window.monaco.editor) {
            window.monaco.editor.getEditors().forEach(editor => {
                editor.updateOptions({
                    lineNumbers: lastLines,
                    wordWrap: lastWrap
                });
            });
        }
    }

    document.addEventListener('gemini-update-monaco', updateMonacoSettings);

    setInterval(() => {
        updateMonacoSettings();
    }, 20000);

    document.addEventListener('gemini-clear-canvas', () => {
        if (window.monaco && window.monaco.editor) {
            window.monaco.editor.getEditors().forEach(editor => {
                const model = editor.getModel();
                if (model) {
                    model.setValue('');
                }
            });
        }
    });

    document.addEventListener('gemini-go-to-line', (e) => {
        const line = parseInt(e.detail?.line, 10);
        if (!line || isNaN(line)) return;

        if (window.monaco && window.monaco.editor) {
            window.monaco.editor.getEditors().forEach(editor => {
                const model = editor.getModel();
                if (model) {
                    const maxLines = model.getLineCount();
                    const safeLine = Math.min(Math.max(1, line), maxLines);
                    
                    editor.setPosition({ lineNumber: safeLine, column: 1 });
                    editor.revealLineInCenter(safeLine);
                    editor.focus();
                }
            });
        }
    });

    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('gemini-request-sync'));
    }, 2000);
})();