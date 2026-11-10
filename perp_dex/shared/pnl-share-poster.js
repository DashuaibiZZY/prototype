/**
 * 盈亏分享海报 · 模版切换（原型示意）
 */
(function (global) {
    var STORAGE_KEY = 'forx_pnl_poster_template_v1';
    var TEMPLATES = [
        { id: 'classic', label: '经典白', swatch: 'linear-gradient(135deg,#fff 50%,#f3f4f6)' },
        { id: 'dark', label: '深色', swatch: 'linear-gradient(135deg,#111827,#374151)' },
        { id: 'gradient', label: '渐变', swatch: 'linear-gradient(135deg,#4f46e5,#9333ea)' },
        { id: 'minimal', label: '极简', swatch: 'linear-gradient(135deg,#fff 45%,#000 46%,#fff 47%)' }
    ];

    function ensureStyles() {
        if (document.getElementById('forx-pnl-poster-styles')) return;
        var style = document.createElement('style');
        style.id = 'forx-pnl-poster-styles';
        style.textContent = [
            '.pnl-template-thumb{border:2px solid transparent;border-radius:8px;padding:2px;background:#fff;cursor:pointer;transition:border-color .15s,box-shadow .15s}',
            '.pnl-template-thumb.is-active{border-color:#111827;box-shadow:0 0 0 1px #111827}',
            '.pnl-template-swatch{height:36px;border-radius:6px;border:1px solid rgba(0,0,0,.08)}',
            '.pnl-template-label{display:block;text-[8px];font-size:8px;font-weight:800;color:#6b7280;text-align:center;margin-top:4px;line-height:1.2}',
            '#pnl-poster.pnl-poster--classic{background:#fff;color:#111827}',
            '#pnl-poster.pnl-poster--dark{background:linear-gradient(160deg,#0f172a,#1e293b);color:#f8fafc}',
            '#pnl-poster.pnl-poster--dark .bg-gray-50{background:rgba(255,255,255,.08)!important}',
            '#pnl-poster.pnl-poster--dark .text-gray-900{color:#f8fafc!important}',
            '#pnl-poster.pnl-poster--dark .text-gray-400{color:#94a3b8!important}',
            '#pnl-poster.pnl-poster--dark .border-gray-100,#pnl-poster.pnl-poster--dark .border-gray-200{border-color:rgba(255,255,255,.12)!important}',
            '#pnl-poster.pnl-poster--gradient{background:linear-gradient(145deg,#312e81 0%,#6d28d9 55%,#db2777 100%);color:#fff}',
            '#pnl-poster.pnl-poster--gradient .bg-gray-50{background:rgba(255,255,255,.12)!important}',
            '#pnl-poster.pnl-poster--gradient .text-gray-900{color:#fff!important}',
            '#pnl-poster.pnl-poster--gradient .text-gray-400{color:rgba(255,255,255,.65)!important}',
            '#pnl-poster.pnl-poster--gradient .border-gray-100,#pnl-poster.pnl-poster--gradient .border-gray-200{border-color:rgba(255,255,255,.2)!important}',
            '#pnl-poster.pnl-poster--minimal{background:#fff;color:#111827;border:3px solid #111827;box-shadow:8px 8px 0 #111827}',
            '#pnl-poster.pnl-poster--minimal .bg-gray-50{background:#fafafa!important;border:1px solid #111827}'
        ].join('');
        document.head.appendChild(style);
    }

    function applyTemplate(templateId) {
        var poster = document.getElementById('pnl-poster');
        if (!poster) return;
        TEMPLATES.forEach(function (t) {
            poster.classList.remove('pnl-poster--' + t.id);
        });
        var id = templateId || 'classic';
        poster.classList.add('pnl-poster--' + id);
        try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* ignore */ }
        document.querySelectorAll('[data-pnl-template]').forEach(function (btn) {
            var active = btn.getAttribute('data-pnl-template') === id;
            btn.classList.toggle('is-active', active);
        });
    }

    function bindPicker(root) {
        if (!root) root = document;
        root.querySelectorAll('[data-pnl-template]').forEach(function (btn) {
            if (btn.dataset.pnlTemplateBound) return;
            btn.dataset.pnlTemplateBound = '1';
            btn.addEventListener('click', function () {
                applyTemplate(btn.getAttribute('data-pnl-template'));
            });
        });
    }

    function renderPickerHtml() {
        return TEMPLATES.map(function (t, i) {
            var active = i === 0 ? ' is-active' : '';
            return '<button type="button" class="pnl-template-thumb' + active + '" data-pnl-template="' + t.id + '" aria-label="' + t.label + '">' +
                '<span class="pnl-template-swatch block" style="background:' + t.swatch + '"></span>' +
                '<span class="pnl-template-label">' + t.label + '</span></button>';
        }).join('');
    }

    function init(options) {
        options = options || {};
        ensureStyles();
        var picker = document.querySelector('[data-pnl-template-picker]');
        if (picker && !picker.dataset.pnlPickerReady) {
            picker.innerHTML = renderPickerHtml();
            picker.dataset.pnlPickerReady = '1';
        }
        bindPicker(document);
        var saved = 'classic';
        try { saved = localStorage.getItem(STORAGE_KEY) || 'classic'; } catch (e) { /* ignore */ }
        if (options.resetOnOpen) applyTemplate('classic');
        else applyTemplate(saved);
    }

    function onShareOpen() {
        init({ resetOnOpen: false });
    }

    global.ForxPnlSharePoster = {
        TEMPLATES: TEMPLATES,
        init: init,
        applyTemplate: applyTemplate,
        onShareOpen: onShareOpen,
        renderPickerHtml: renderPickerHtml
    };
})(typeof window !== 'undefined' ? window : this);
