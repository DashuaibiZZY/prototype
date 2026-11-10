/**
 * Web 敏感操作 · 身份验证器（TOTP）门禁（与登录充提文档 §1.10 / §1.11 验证步骤对齐）
 */
(function () {
    const STORAGE_BOUND = 'forx_proto_totp_bound';

    function isBound() {
        return localStorage.getItem(STORAGE_BOUND) !== '0';
    }

    function setBound(bound) {
        localStorage.setItem(STORAGE_BOUND, bound ? '1' : '0');
    }

    function ensureShell() {
        if (document.getElementById('web-totp-gate-root')) return;
        const wrap = document.createElement('div');
        wrap.id = 'web-totp-gate-root';
        wrap.innerHTML =
            '<div id="web-totp-overlay" class="fixed inset-0 z-[300] hidden items-center justify-center bg-black/60 p-4 backdrop-blur-sm">' +
            '<div class="bg-white w-full max-w-[420px] rounded-lg shadow-2xl border border-gray-100 overflow-hidden text-[12px]">' +
            '<div class="px-5 py-4 border-b border-gray-50 flex justify-between items-center">' +
            '<h3 id="web-totp-title" class="text-sm font-black text-gray-900">身份验证</h3>' +
            '<button type="button" id="web-totp-close" class="text-gray-400 hover:text-black text-lg leading-none" aria-label="关闭">✕</button>' +
            '</div>' +
            '<div id="web-totp-body" class="p-5 space-y-4"></div>' +
            '</div></div>';
        document.body.appendChild(wrap);
        document.getElementById('web-totp-close').addEventListener('click', close);
        document.getElementById('web-totp-overlay').addEventListener('click', function (e) {
            if (e.target.id === 'web-totp-overlay') close();
        });
    }

    let pendingSuccess = null;
    let bindStep = 'prompt';

    function close() {
        const ov = document.getElementById('web-totp-overlay');
        if (ov) {
            ov.classList.add('hidden');
            ov.classList.remove('flex');
        }
        pendingSuccess = null;
        bindStep = 'prompt';
    }

    function open() {
        ensureShell();
        const ov = document.getElementById('web-totp-overlay');
        ov.classList.remove('hidden');
        ov.classList.add('flex');
    }

    function renderNotBound() {
        const body = document.getElementById('web-totp-body');
        document.getElementById('web-totp-title').textContent = '身份验证器 App';
        body.innerHTML =
            '<p class="text-[11px] text-gray-500 leading-relaxed">创建或查看 API 凭证、删除 API Key 等操作需要先绑定身份验证器 App（MFA）。</p>' +
            '<div class="bg-amber-50 border border-amber-100 rounded-sm p-3 text-[11px] text-amber-900">' +
            '<p class="font-bold">您尚未绑定身份验证器</p>' +
            '<p class="mt-1 text-amber-800/90">请先在个人浮窗中完成绑定，流程与 Web 登录充提文档一致：引导 → 扫码/密钥 → 验证码确认。</p>' +
            '</div>' +
            '<button type="button" id="web-totp-bind-start" class="w-full py-2.5 bg-gray-900 text-white rounded-sm font-black text-[11px]">立即绑定</button>' +
            '<button type="button" id="web-totp-bind-cancel" class="w-full py-2.5 border border-gray-200 rounded-sm font-bold text-gray-500">稍后再说</button>';
        document.getElementById('web-totp-bind-cancel').onclick = function () {
            pendingSuccess = null;
            close();
        };
        document.getElementById('web-totp-bind-start').onclick = function () {
            bindStep = 'qr';
            renderBindFlow();
        };
    }

    function renderBindFlow() {
        const body = document.getElementById('web-totp-body');
        if (bindStep === 'qr') {
            document.getElementById('web-totp-title').textContent = '绑定验证器';
            body.innerHTML =
                '<p class="text-[11px] text-gray-500 text-center leading-relaxed">使用身份验证器 App 扫描下方二维码，或手动输入密钥</p>' +
                '<div class="mx-auto w-36 h-36 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center text-[10px] text-gray-400 font-bold">QR CODE</div>' +
                '<div class="flex items-center justify-between gap-2 bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 font-mono text-[10px]">' +
                '<span class="truncate">JBSW Y3DP EHPK 3PXP</span>' +
                '<button type="button" class="text-blue-600 font-bold shrink-0" onclick="navigator.clipboard && navigator.clipboard.writeText(\'JBSWY3DPEHPK3PXP\')">复制</button>' +
                '</div>' +
                '<button type="button" id="web-totp-bind-next" class="w-full py-2.5 bg-gray-900 text-white rounded-sm font-black text-[11px]">下一步</button>';
            document.getElementById('web-totp-bind-next').onclick = function () {
                bindStep = 'confirm';
                renderBindFlow();
            };
            return;
        }
        if (bindStep === 'confirm') {
            document.getElementById('web-totp-title').textContent = '验证绑定';
            body.innerHTML =
                '<p class="text-[11px] text-gray-500 text-center">输入验证器中的 6 位验证码</p>' +
                '<input id="web-totp-bind-code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full border border-gray-200 rounded-sm px-3 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-gray-900" />' +
                '<button type="button" id="web-totp-bind-confirm" class="w-full py-2.5 bg-gray-900 text-white rounded-sm font-black text-[11px]">确认绑定</button>';
            document.getElementById('web-totp-bind-confirm').onclick = function () {
                const code = (document.getElementById('web-totp-bind-code').value || '').replace(/\D/g, '');
                if (code.length !== 6) {
                    alert('请输入 6 位动态码');
                    return;
                }
                setBound(true);
                close();
                if (typeof window.onWebTotpBoundChange === 'function') window.onWebTotpBoundChange();
                if (pendingSuccess) {
                    const fn = pendingSuccess;
                    pendingSuccess = null;
                    window.WebTotpGate.require(fn.label || '继续操作', fn.callback);
                }
            };
        }
    }

    function renderVerify(actionLabel) {
        const body = document.getElementById('web-totp-body');
        document.getElementById('web-totp-title').textContent = '身份验证器验证';
        body.innerHTML =
            '<p class="text-[11px] text-gray-500 text-center leading-relaxed">为确认「' +
            actionLabel +
            '」，请输入身份验证器 App 中的 6 位动态码。</p>' +
            '<input id="web-totp-verify-code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full border border-gray-200 rounded-sm px-3 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-gray-900" autofocus />' +
            '<button type="button" id="web-totp-verify-submit" class="w-full py-2.5 bg-gray-900 text-white rounded-sm font-black text-[11px]">验证并继续</button>';
        document.getElementById('web-totp-verify-submit').onclick = function () {
            const code = (document.getElementById('web-totp-verify-code').value || '').replace(/\D/g, '');
            if (code.length !== 6) {
                alert('请输入 6 位动态码');
                return;
            }
            const cb = pendingSuccess && pendingSuccess.callback;
            close();
            if (cb) cb();
        };
    }

    window.WebTotpGate = {
        isBound: isBound,
        setBound: setBound,
        require: function (actionLabel, onSuccess) {
            ensureShell();
            pendingSuccess = { label: actionLabel, callback: onSuccess };
            open();
            if (!isBound()) {
                renderNotBound();
            } else {
                renderVerify(actionLabel);
            }
        },
        close: close
    };
})();
