/**
 * 后台 UID / 地址缩写展示 + 一键复制
 */
(function () {
    function isWallet(v) {
        return /^0x/i.test(v) || (v.indexOf('0x') >= 0);
    }

    function abbreviateWallet(v) {
        if (!v) return v;
        if (v.indexOf('...') >= 0) return v;
        if (v.length <= 12) return v;
        return v.slice(0, 6) + '...' + v.slice(-4);
    }

    function abbreviateUid(v) {
        if (!v) return v;
        if (v.length <= 10) return v;
        return v.slice(0, 4) + '...' + v.slice(-4);
    }

    function abbreviate(v, type) {
        if (!v) return v;
        if (type === 'wallet') return abbreviateWallet(v);
        if (type === 'uid') return abbreviateUid(v);
        return isWallet(v) ? abbreviateWallet(v) : abbreviateUid(v);
    }

    function escAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function copySvg() {
        return '<svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
    }

    function render(fullValue, opts) {
        opts = opts || {};
        const v = fullValue == null ? '' : String(fullValue).trim();
        if (!v || v === '—' || v === '--') {
            return '<span class="text-slate-400">' + (v || '—') + '</span>';
        }
        const type = opts.type || (isWallet(v) ? 'wallet' : 'uid');
        const display = opts.display || abbreviate(v, type);
        const extraCls = opts.className || '';
        return '<span class="inline-flex items-center gap-0.5 admin-copy-chip ' + extraCls + '">' +
            '<span class="font-mono text-[11px] leading-tight">' + display + '</span>' +
            '<button type="button" class="admin-copy-btn inline-flex items-center justify-center p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0" data-copy="' + escAttr(v) + '" title="复制">' + copySvg() + '</button>' +
            '</span>';
    }

    function copy(value) {
        if (!value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
        } else {
            fallbackCopy(value);
        }
    }

    function fallbackCopy(value) {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.admin-copy-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const val = btn.getAttribute('data-copy');
        if (!val) return;
        copy(val);
        const orig = btn.title;
        btn.title = '已复制';
        setTimeout(function () { btn.title = orig || '复制'; }, 1200);
    });

    function userIdentity(user, opts) {
        opts = opts || {};
        user = user || {};
        const uid = user.uid != null ? String(user.uid).trim() : '';
        const wallet = user.wallet != null ? String(user.wallet).trim() : '';
        const email = user.email != null ? String(user.email).trim() : '';
        const secondary = wallet || email;
        const secondaryType = wallet ? 'wallet' : (email ? 'email' : '');
        const secondaryLabel = wallet ? '钱包地址' : (email ? '邮箱' : '');
        const secondaryFull = wallet ? (user.walletFull || wallet) : email;
        const stackCls = opts.stackClass || 'block mt-0.5';
        if (!uid && !secondary) {
            return '<span class="text-slate-400">—</span>';
        }
        let html = uid ? render(uid, { type: 'uid', className: opts.uidClass || 'font-black text-slate-900' }) : '';
        if (secondary) {
            const secHtml = secondaryType === 'wallet'
                ? render(secondaryFull, { type: 'wallet', display: abbreviateWallet(secondary), className: opts.secondaryClass || 'text-[10px] text-slate-500' })
                : '<span class="inline-flex items-center gap-0.5 admin-copy-chip ' + (opts.secondaryClass || 'text-[10px] text-slate-500') + '"><span class="leading-tight">' + secondary + '</span><button type="button" class="admin-copy-btn inline-flex items-center justify-center p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0" data-copy="' + escAttr(secondaryFull) + '" title="复制' + secondaryLabel + '">' + copySvg() + '</button></span>';
            html += (html ? '<span class="' + stackCls + '">' + secHtml + '</span>' : secHtml);
        }
        return html;
    }

    window.AdminCopyChip = {
        render: render,
        abbreviate: abbreviate,
        copy: copy,
        uid: function (v, className) { return render(v, { type: 'uid', className: className || '' }); },
        wallet: function (v, className) { return render(v, { type: 'wallet', className: className || '' }); },
        userIdentity: userIdentity,
        enhanceTables: function (selector) {
            const root = selector ? document.querySelector(selector) : document.body;
            if (!root) return;
            root.querySelectorAll('td').forEach(function (td) {
                if (td.querySelector('.admin-copy-chip') || td.children.length > 0) return;
                const t = (td.textContent || '').trim();
                if (!t) return;
                if (/^\d{5,}$/.test(t)) td.innerHTML = render(t, { type: 'uid' });
                else if (/^0x/i.test(t) && t.length >= 10) td.innerHTML = render(t, { type: 'wallet' });
            });
        },
        setField: function (el, value, type) {
            if (!el) return;
            if (!value) { el.textContent = '—'; return; }
            el.innerHTML = render(value, { type: type || 'auto' });
        }
    };
})();
