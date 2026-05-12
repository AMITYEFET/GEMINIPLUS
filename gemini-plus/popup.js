document.addEventListener('DOMContentLoaded', () => {
    const toggles = {
        linesEnabled: document.getElementById('linesToggle'),
        wrapEnabled: document.getElementById('wrapToggle'),
        resizerEnabled: document.getElementById('resizerToggle'),
        scrollbarEnabled: document.getElementById('scrollbarToggle')
    };
    
    const colors = {
        scrollbarColor: document.getElementById('scrollbarColor')
    };

    const defaultState = {
        linesEnabled: true, wrapEnabled: false,
        resizerEnabled: false, scrollbarEnabled: false, 
        scrollbarColor: '#888888'
    };

    chrome.storage.sync.get(defaultState, (data) => {
        for (const [key, element] of Object.entries(toggles)) if (element) element.checked = data[key];
        for (const [key, element] of Object.entries(colors)) if (element) element.value = data[key];
    });

    for (const [key, element] of Object.entries(toggles)) {
        if (element) {
            element.addEventListener('change', () => chrome.storage.sync.set({ [key]: element.checked }));
        }
    }

    for (const [key, element] of Object.entries(colors)) {
        if (element) {
            element.addEventListener('change', () => chrome.storage.sync.set({ [key]: element.value }));
        }
    }
});