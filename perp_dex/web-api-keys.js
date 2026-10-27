/**
 * Web · API Key 管理页逻辑
 */
(function () {
    const STORAGE_KEYS = 'forx_web_api_keys_v1';
    const MAX_KEYS = 50;
    const API_DOC_HREF = '做市商/rest-api.md';

    const DEFAULT_KEYS = [
        {
            id: 'k1',
            label: '量化策略 A',
            apiKey: 'ds232ds2dsadwq2',
            secret: 'kdaswecgw29323d',
            createdAt: '2026-10-27 11:34:34'
        },
        {
            id: 'k2',
            label: '行情同步',
            apiKey: 'fx_market_8f2a91bc',
            secret: 'sk_live_x9m2p4q7n1w8',
            createdAt: '2026-10-26 09:00:00'
        }
    ];

    let keys = [];
    let revealedIds = {};
    let detailId = null;
    let pendingDeleteId = null;
    let pendingCreate = null;

    function loadKeys() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    function saveKeys() {
        localStorage.setItem(STORAGE_KEYS, JSON.stringify(keys));
    }

    function randomId() {
        return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function randomCredential(prefix, len) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let s = prefix;
        for (let i = s.length; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
        return s;
    }

    function formatCreatedDisplay(isoLike) {
        if (!isoLike) return '—';
        const m = isoLike.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
        if (m) return m[1] + '年' + parseInt(m[2], 10) + '月' + parseInt(m[3], 10) + '日 ' + m[4];
        return isoLike;
    }

    function formatCreatedRowHtml(isoLike) {
        if (!isoLike) {
            return '<div class="api-created-row text-[10px] text-gray-400"><span>创建日期</span><span>—</span></div>';
        }
        const m = isoLike.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
        if (!m) {
            return (
                '<div class="api-created-row text-[10px]"><span class="text-gray-400">创建日期</span>' +
                '<span class="api-created-datetime">' + isoLike + '</span></div>'
            );
        }
        const dateTime = m[1] + '年' + parseInt(m[2], 10) + '月' + parseInt(m[3], 10) + '日 ' + m[4];
        return (
            '<div class="api-created-row text-[10px]">' +
            '<span class="text-gray-400 shrink-0">创建日期</span>' +
            '<span class="api-created-datetime">' + dateTime + '</span>' +
            '</div>'
        );
    }

    function nowCreatedAt() {
        const d = new Date();
        const p = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }

    function validatePassphrase(pw) {
        if (!pw || pw.length < 8 || pw.length > 32) return false;
        if (!/[a-z]/.test(pw)) return false;
        if (!/[A-Z]/.test(pw)) return false;
        if (!/[0-9]/.test(pw)) return false;
        if (!/[^A-Za-z0-9]/.test(pw)) return false;
        return true;
    }

    function copyText(text) {
        if (!text) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
        } catch (e) { /* ignore */ }
    }

    function copyIconBtn(text) {
        const esc = String(text).replace(/'/g, "\\'");
        return '<button type="button" class="copy-icon-btn" onclick="WebApiKeys.copy(\'' + esc + '\')" title="复制" aria-label="复制">' +
            '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button>';
    }

    function setView(view) {
        const listShell = document.getElementById('api-shell-list');
        const createShell = document.getElementById('api-shell-create');
        if (listShell) listShell.classList.toggle('hidden', view !== 'list');
        if (createShell) createShell.classList.toggle('hidden', view !== 'create');
        if (view === 'create') {
            try { history.replaceState(null, '', '#create'); } catch (e) { /* ignore */ }
        } else if (location.hash === '#create') {
            try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
        }
    }

    function renderList() {
        const emptyEl = document.getElementById('api-empty-state');
        const tableWrap = document.getElementById('api-table-wrap');
        const countEl = document.getElementById('api-key-count');
        const tbody = document.getElementById('api-key-tbody');
        const createBtn = document.getElementById('api-btn-create-top');
        const n = keys.length;

        if (countEl) countEl.textContent = n + '/' + MAX_KEYS + ' 个 API Key';
        if (createBtn) createBtn.disabled = n >= MAX_KEYS;

        if (!n) {
            emptyEl?.classList.remove('hidden');
            tableWrap?.classList.add('hidden');
            return;
        }
        emptyEl?.classList.add('hidden');
        tableWrap?.classList.remove('hidden');
        if (!tbody) return;
        tbody.innerHTML = keys
            .slice()
            .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })
            .map(function (k) {
                return '<tr class="border-b border-gray-50 hover:bg-gray-50/80">' +
                    '<td class="px-4 py-3 font-bold text-gray-900">' + k.label + '</td>' +
                    '<td class="px-4 py-3 text-gray-500 whitespace-nowrap">' + formatCreatedDisplay(k.createdAt) + '</td>' +
                    '<td class="px-4 py-3 text-right space-x-3 whitespace-nowrap">' +
                    '<button type="button" class="text-blue-600 font-bold hover:underline" data-api-detail="' + k.id + '">详情</button>' +
                    '<button type="button" class="text-red-500 font-bold hover:underline" data-api-delete="' + k.id + '">删除</button>' +
                    '</td></tr>';
            })
            .join('');
        tbody.querySelectorAll('[data-api-detail]').forEach(function (btn) {
            btn.addEventListener('click', function () { openDetail(btn.getAttribute('data-api-detail')); });
        });
        tbody.querySelectorAll('[data-api-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () { openDeleteConfirm(btn.getAttribute('data-api-delete')); });
        });
    }

    function openCreate() {
        if (keys.length >= MAX_KEYS) return;
        document.getElementById('api-field-label').value = '';
        document.getElementById('api-field-passphrase').value = '';
        document.getElementById('api-passphrase-error').classList.add('hidden');
        setView('create');
    }

    function submitCreate() {
        const label = (document.getElementById('api-field-label').value || '').trim();
        const pw = document.getElementById('api-field-passphrase').value || '';
        const err = document.getElementById('api-passphrase-error');
        if (!label) {
            alert('请填写备注名');
            return;
        }
        if (!validatePassphrase(pw)) {
            err.classList.remove('hidden');
            return;
        }
        err.classList.add('hidden');
        pendingCreate = {
            label: label,
            passphrase: pw,
            apiKey: randomCredential('fk_', 16),
            secret: randomCredential('sk_', 24),
            createdAt: nowCreatedAt()
        };
        window.WebTotpGate.require('创建 API Key', function () {
            const item = {
                id: randomId(),
                label: pendingCreate.label,
                apiKey: pendingCreate.apiKey,
                secret: pendingCreate.secret,
                createdAt: pendingCreate.createdAt
            };
            keys.unshift(item);
            saveKeys();
            pendingCreate = null;
            setView('list');
            renderList();
            openSuccessModal(item);
        });
    }

    function credentialBlock(key, revealed) {
        const mask = '***********';
        return {
            apiKey: revealed ? key.apiKey : mask,
            secret: revealed ? key.secret : mask,
            revealed: revealed
        };
    }

    function modalBtn(classes, label, dataName, disabled) {
        const dis = disabled ? ' disabled' : '';
        return '<button type="button" class="' + classes + '" ' + dataName + '=""' + dis + '>' + label + '</button>';
    }

    function buildCredentialModalHtml(key, opts) {
        opts = opts || {};
        const revealed = !!opts.revealed;
        const cred = credentialBlock(key, revealed);
        let footer = '';
        if (opts.mode === 'success') {
            footer =
                '<div class="pt-1">' +
                modalBtn('api-modal-btn api-modal-btn-primary', '一键复制', 'data-copy-all') +
                '</div>';
        } else if (opts.showDelete) {
            const revealLink = revealed
                ? ''
                : '<div class="text-right"><button type="button" class="text-[11px] font-bold text-blue-600 hover:underline" data-reveal-cred>查看凭证</button></div>';
            footer =
                revealLink +
                '<div class="api-modal-actions">' +
                modalBtn('api-modal-btn api-modal-btn-danger', '删除', 'data-detail-delete') +
                modalBtn('api-modal-btn api-modal-btn-copy', '一键复制', 'data-copy-all', !revealed) +
                '</div>';
        }
        return (
            '<div class="space-y-4">' +
            '<p class="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-sm px-3 py-2 font-bold">切勿向任何人透露您的 API 凭证。</p>' +
            '<div class="space-y-2 text-[11px]">' +
            '<div class="flex items-center justify-between gap-2">' +
            '<span class="text-gray-400 shrink-0">API Key</span>' +
            '<div class="flex items-center gap-1 min-w-0 font-mono font-bold text-gray-900 truncate">' +
            cred.apiKey +
            (revealed ? copyIconBtn(key.apiKey) : '') +
            '</div></div>' +
            '<div class="flex items-center justify-between gap-2">' +
            '<span class="text-gray-400 shrink-0">密钥</span>' +
            '<div class="flex items-center gap-1 min-w-0 font-mono font-bold text-gray-900 truncate">' +
            cred.secret +
            (revealed ? copyIconBtn(key.secret) : '') +
            '</div></div></div>' +
            formatCreatedRowHtml(key.createdAt) +
            footer +
            '</div>'
        );
    }

    function openModal(id, title, bodyHtml) {
        const modal = document.getElementById(id);
        if (!modal) return;
        const titleEl = modal.querySelector('[data-modal-title]');
        if (titleEl) titleEl.textContent = title;
        const bodyEl = modal.querySelector('[data-modal-body]');
        if (bodyEl) bodyEl.innerHTML = bodyHtml;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function openSuccessModal(key) {
        openModal('api-modal-success', key.label, buildCredentialModalHtml(key, { revealed: true, mode: 'success' }));
        const body = document.querySelector('#api-modal-success [data-modal-body]');
        body.querySelector('[data-copy-all]')?.addEventListener('click', function () {
            copyText('API Key: ' + key.apiKey + '\n密钥: ' + key.secret);
        });
    }

    function openDetail(id) {
        const key = keys.find(function (k) { return k.id === id; });
        if (!key) return;
        detailId = id;
        const revealed = !!revealedIds[id];
        openModal('api-modal-detail', key.label, buildCredentialModalHtml(key, { revealed: revealed, showDelete: true }));
        wireDetailModal(key);
    }

    function wireDetailModal(key) {
        const body = document.querySelector('#api-modal-detail [data-modal-body]');
        if (!body) return;
        body.querySelector('[data-reveal-cred]')?.addEventListener('click', function () {
            window.WebTotpGate.require('查看 API 凭证', function () {
                revealedIds[key.id] = true;
                openDetail(key.id);
            });
        });
        body.querySelector('[data-copy-all]')?.addEventListener('click', function () {
            copyText('API Key: ' + key.apiKey + '\n密钥: ' + key.secret);
        });
        body.querySelector('[data-detail-delete]')?.addEventListener('click', function () {
            closeModal('api-modal-detail');
            openDeleteConfirm(key.id);
        });
    }

    function openDeleteConfirm(id) {
        const key = keys.find(function (k) { return k.id === id; });
        if (!key) return;
        pendingDeleteId = id;
        const modal = document.getElementById('api-modal-delete');
        if (!modal) return;
        const bodyEl = modal.querySelector('[data-modal-body]');
        if (bodyEl) {
            bodyEl.innerHTML =
                '<p class="text-[13px] font-black text-gray-900 text-center leading-relaxed">要删除 <span class="text-blue-600">' + key.label + '</span> API Key 吗？</p>' +
                '<p class="text-[11px] text-gray-500 text-center mt-2">API Key 删除后将不可恢复</p>';
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function confirmDelete() {
        if (!pendingDeleteId) return;
        const id = pendingDeleteId;
        window.WebTotpGate.require('删除 API Key', function () {
            keys = keys.filter(function (k) { return k.id !== id; });
            delete revealedIds[id];
            saveKeys();
            pendingDeleteId = null;
            closeModal('api-modal-delete');
            closeModal('api-modal-detail');
            renderList();
        });
    }

    function initDemoToolbar() {
        const bar = document.getElementById('api-demo-bar');
        if (!bar) return;
        bar.querySelectorAll('[data-demo-keys]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const mode = btn.getAttribute('data-demo-keys');
                if (mode === 'empty') {
                    keys = [];
                } else {
                    keys = DEFAULT_KEYS.map(function (k) { return Object.assign({}, k); });
                }
                saveKeys();
                revealedIds = {};
                setView('list');
                renderList();
            });
        });
        bar.querySelectorAll('[data-demo-mfa]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const bound = btn.getAttribute('data-demo-mfa') === 'bound';
                window.WebTotpGate.setBound(bound);
                if (typeof window.onWebTotpBoundChange === 'function') window.onWebTotpBoundChange();
            });
        });
    }

    function bindUi() {
        document.getElementById('api-btn-create-empty')?.addEventListener('click', openCreate);
        document.getElementById('api-btn-create-top')?.addEventListener('click', openCreate);
        document.getElementById('api-btn-back')?.addEventListener('click', function () { setView('list'); });
        document.getElementById('api-btn-submit-create')?.addEventListener('click', submitCreate);
        document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const target = btn.getAttribute('data-modal-close');
                if (target === 'api-modal-delete') pendingDeleteId = null;
                closeModal(target);
            });
        });
        document.getElementById('api-delete-confirm')?.addEventListener('click', confirmDelete);
        document.getElementById('api-delete-cancel')?.addEventListener('click', function () {
            pendingDeleteId = null;
            closeModal('api-modal-delete');
        });
    }

    function initFromQuery() {
        const q = new URLSearchParams(location.search).get('demo');
        const stored = loadKeys();
        if (stored) {
            keys = stored;
        } else if (q === 'empty') {
            keys = [];
        } else {
            keys = DEFAULT_KEYS.map(function (k) { return Object.assign({}, k); });
        }
        saveKeys();
    }

    window.WebApiKeys = {
        copy: copyText,
        init: function () {
            initFromQuery();
            bindUi();
            initDemoToolbar();
            if (location.hash === '#create') {
                setView('create');
            } else {
                setView('list');
            }
            renderList();
        },
        API_DOC_HREF: API_DOC_HREF
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (document.getElementById('api-page-root')) window.WebApiKeys.init();
    });

    window.addEventListener('hashchange', function () {
        if (!document.getElementById('api-page-root')) return;
        if (location.hash === '#create') setView('create');
        else setView('list');
    });
})();
