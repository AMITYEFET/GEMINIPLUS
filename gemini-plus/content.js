const defaultSettings = {
    linesEnabled: true, wrapEnabled: false, 
    resizerEnabled: false, scrollbarEnabled: false, 
    scrollbarColor: '#888888'
};

chrome.storage.sync.get(defaultSettings, (data) => updateUI(data));

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        chrome.storage.sync.get(defaultSettings, (data) => updateUI(data));
    }
});

function updateUI(data) {
    document.body.classList.toggle('gemini-lines-on', data.linesEnabled);
    document.body.classList.toggle('gemini-wrap-on', data.wrapEnabled);
    document.body.classList.toggle('gemini-resizer-on', data.resizerEnabled);
    
    if (!data.resizerEnabled) {
        const existing = document.getElementById('gemini-resizer-wrapper');
        if (existing) existing.remove();
    }

    let styleTag = document.getElementById('gemini-dynamic-colors');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'gemini-dynamic-colors';
        document.head.appendChild(styleTag);
    }
    
    let cssRules = '';
    
    // פתרון 100% לעיצוב פסי הגלילה בעזרת כוכבית שמשפיעה גם על אזורים פנימיים
    if (data.scrollbarEnabled) {
        cssRules += `
            ::-webkit-scrollbar, *::-webkit-scrollbar { width: 10px !important; height: 10px !important; }
            ::-webkit-scrollbar-track, *::-webkit-scrollbar-track { background: transparent !important; }
            ::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb { 
                background-color: ${data.scrollbarColor} !important; 
                border-radius: 10px !important; 
                border: 2px solid transparent !important; 
                background-clip: padding-box !important; 
            }
            ::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:hover { opacity: 0.8 !important; }
        `;
    }

    styleTag.textContent = cssRules;
}

// --- Dropdown Canvas Resizer with Checkmarks ---
function injectIntegratedResizer() {
    if (!document.body.classList.contains('gemini-resizer-on')) return;
    if (document.getElementById('gemini-resizer-wrapper')) return; 

    const actionButtons = document.querySelector('.action-buttons');
    if (!actionButtons) return; 

    const wrapper = document.createElement('div');
    wrapper.id = 'gemini-resizer-wrapper';
    wrapper.className = 'gemini-resizer-wrapper';
    
    const checkIcon = `<svg class="check-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

    wrapper.innerHTML = `
        <button class="gemini-resizer-btn" title="Change Resolution" id="geminiResizerToggleBtn">
            <svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>
        </button>
        <div class="gemini-resizer-dropdown" id="geminiResizerDropdown">
            <button data-width="100%" class="active">
                <svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg> 
                <span>Default</span>
                ${checkIcon}
            </button>
            <button data-width="1024px">
                <svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg> 
                <span>Desktop</span>
                ${checkIcon}
            </button>
            <button data-width="768px">
                <svg viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 14c-.83 0-1.5-.67-1.5-1.5S11.17 15 12 15s1.5.67 1.5 1.5S12.83 18 12 18zm7-4H5V6h14v8z"/></svg> 
                <span>Tablet</span>
                ${checkIcon}
            </button>
            <button data-width="375px">
                <svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg> 
                <span>Phone</span>
                ${checkIcon}
            </button>
            <button id="customResizerBtn">
                <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.05-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.11.2-.06.47.12.61l2.03 1.58c-.04.3-.06.62-.06.94 0 .32.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg> 
                <span>Custom Width</span>
                ${checkIcon}
            </button>
        </div>
    `;
    
    actionButtons.insertBefore(wrapper, actionButtons.firstChild);

    const toggleBtn = wrapper.querySelector('#geminiResizerToggleBtn');
    const dropdown = wrapper.querySelector('#geminiResizerDropdown');

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) dropdown.classList.remove('show');
    });

    dropdown.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        dropdown.classList.remove('show');
        
        let width = btn.getAttribute('data-width');
        if (btn.id === 'customResizerBtn') {
            const userInput = prompt("Enter width (e.g., 500px or 60%):", "500px");
            if (userInput) width = userInput;
            else return;
        }

        // עדכון סימון ה-V
        dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const containers = document.querySelectorAll('iframe, .xap-monaco-container');
        containers.forEach(container => {
            let targetNode = container.tagName === 'IFRAME' ? container : container.parentElement;
            targetNode.style.width = '100%';
            targetNode.style.maxWidth = width;
            targetNode.style.margin = '0 auto';
            targetNode.style.transition = 'max-width 0.3s ease';
        });
    });
}

// --- Line Numbers Logic ---
function updateLineNumbers() {
    const codeBlocks = document.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        if (!code || pre.closest('.monaco-editor')) return; 

        pre.classList.add('has-line-numbers');
        const lineCount = code.textContent.split('\n').length;
        let gutter = pre.querySelector('.gemini-code-gutter');
        
        if (!gutter) {
            gutter = document.createElement('div');
            gutter.className = 'gemini-code-gutter';
            pre.insertBefore(gutter, pre.firstChild);
        }

        const validCount = Math.max(1, code.textContent.endsWith('\n') ? lineCount - 1 : lineCount);
        if (gutter.children.length !== validCount) {
            let numbersHTML = '';
            for (let i = 1; i <= validCount; i++) numbersHTML += `<span>${i}</span>`;
            gutter.innerHTML = numbersHTML;
        }
    });

    const editors = document.querySelectorAll('.monaco-editor');
    editors.forEach(editor => {
        const marginOverlays = editor.querySelector('.margin-view-overlays');
        if (!marginOverlays) return;
        const lineDivs = Array.from(marginOverlays.children).filter(child => child.style && child.style.top);
        if (lineDivs.length === 0) return;

        if (!marginOverlays.dataset.baseTop) marginOverlays.dataset.baseTop = parseInt(lineDivs[0].style.top);
        const baseTop = parseInt(marginOverlays.dataset.baseTop) || 0;

        lineDivs.forEach(div => {
            const top = parseInt(div.style.top);
            const heightMatch = div.style.height.match(/(\d+)px/);
            const height = heightMatch ? parseInt(heightMatch[1]) : 19;
            const lineNum = Math.round((top - baseTop) / height) + 1;

            if (div.getAttribute('data-line') != lineNum) {
                div.setAttribute('data-line', lineNum);
                div.classList.add('gemini-canvas-line-number');
            }
        });
    });
}

const observer = new MutationObserver(() => {
    observer.disconnect();
    
    if (document.body.classList.contains('gemini-lines-on')) updateLineNumbers();
    if (document.body.classList.contains('gemini-resizer-on')) injectIntegratedResizer();
    
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});
observer.observe(document.body, { childList: true, subtree: true, characterData: true });