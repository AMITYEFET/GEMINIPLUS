const defaultSettings = {
    linesEnabled: true, wrapEnabled: false, 
    resizerEnabled: false, scrollbarEnabled: false, 
    scrollbarColor: '#888888'
};

function debounce(func, timeout = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

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
        `;
    }
    styleTag.textContent = cssRules;
}

function injectIntegratedResizer() {
    if (!document.body.classList.contains('gemini-resizer-on')) return;
    if (document.getElementById('gemini-resizer-wrapper')) return; 

    const actionButtons = document.querySelector('.action-buttons');
    if (!actionButtons) return; 

    const icons = {
        default: `<svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg>`,
        desktop: `<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>`,
        tablet: `<svg viewBox="0 0 24 24"><path d="M18 0H4C2.9 0 2 .9 2 2v20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-1 18H5V4h12v14z"/></svg>`,
        phone: `<svg viewBox="0 0 24 24"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM7 19V5h10v14H7z"/></svg>`,
        custom: `<svg viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>`,
        check: `<svg class="check-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
    };

    const wrapper = document.createElement('div');
    wrapper.id = 'gemini-resizer-wrapper';
    wrapper.className = 'gemini-resizer-wrapper';
    
    wrapper.innerHTML = `
        <button class="gemini-resizer-btn" title="Change Resolution" id="geminiResizerToggleBtn">
            ${icons.desktop}
        </button>
        <div class="gemini-resizer-dropdown" id="geminiResizerDropdown">
            <button data-width="100%" class="active">${icons.default}<span>Default</span>${icons.check}</button>
            <button data-width="1280px">${icons.desktop}<span>Desktop Large</span>${icons.check}</button>
            <button data-width="768px">${icons.tablet}<span>Tablet</span>${icons.check}</button>
            <button data-width="375px">${icons.phone}<span>Phone</span>${icons.check}</button>
            <button id="customResizerBtn">${icons.custom}<span>Custom</span>${icons.check}</button>
        </div>
    `;
    
    actionButtons.insertBefore(wrapper, actionButtons.firstChild);

    const toggleBtn = wrapper.querySelector('#geminiResizerToggleBtn');
    const dropdown = wrapper.querySelector('#geminiResizerDropdown');

    toggleBtn.onclick = (e) => { 
        e.stopPropagation(); 
        dropdown.classList.toggle('show'); 
    };
    
    document.addEventListener('click', () => dropdown.classList.remove('show'));

    dropdown.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        let width = btn.getAttribute('data-width');
        if (btn.id === 'customResizerBtn') {
            const val = prompt("Enter width (e.g. 600px):", "600px");
            if (val) width = val; else return;
        }

        dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('iframe, .xap-monaco-container').forEach(c => {
            let target = c.tagName === 'IFRAME' ? c : c.parentElement;
            target.style.maxWidth = width;
            target.style.margin = '0 auto';
            target.style.transition = 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

function updateLineNumbers() {
    // בלוקים של קוד סטטי
    const codeBlocks = document.querySelectorAll('pre:not(.gemini-processed)');
    codeBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        if (!code || pre.closest('.monaco-editor')) return;
        pre.classList.add('gemini-processed');
        
        const content = code.innerHTML;
        const lines = content.split('\n');
        if (lines[lines.length-1] === '') lines.pop();
        
        code.innerHTML = lines.map(line => `<span class="gemini-line">${line || ' '}</span>`).join('\n');
    });

    // Monaco Editor (Canvas)
    const editors = document.querySelectorAll('.monaco-editor:not(.gemini-processed)');
    editors.forEach(editor => {
        const marginOverlays = editor.querySelector('.margin-view-overlays');
        if (!marginOverlays) return;
        editor.classList.add('gemini-processed');
        
        const refreshMonaco = () => {
            const lineDivs = Array.from(marginOverlays.children).filter(child => child.style && child.style.top);
            lineDivs.forEach(div => {
                const height = parseInt(div.style.height) || 19;
                const top = parseInt(div.style.top);
                const lineNum = Math.round(top / height) + 1;
                div.setAttribute('data-line', lineNum);
                div.classList.add('gemini-canvas-line-number');
            });
        };
        
        const monacoObs = new MutationObserver(refreshMonaco);
        monacoObs.observe(marginOverlays, { childList: true });
        refreshMonaco();
    });
}

const optimizedUpdate = debounce(() => {
    if (document.body.classList.contains('gemini-lines-on')) updateLineNumbers();
    if (document.body.classList.contains('gemini-resizer-on')) injectIntegratedResizer();
}, 150);

const observer = new MutationObserver(optimizedUpdate);
observer.observe(document.body, { childList: true, subtree: true });

// מאזין לשינוי ערכת נושא (Theme) ב-HTML של Gemini
const themeObserver = new MutationObserver(() => {
    // כשהנושא משתנה, המשתנים ב-CSS יתעדכנו אוטומטית, 
    // אבל אנחנו מוודאים שה-Resizer עדיין נראה טוב.
    optimizedUpdate();
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });