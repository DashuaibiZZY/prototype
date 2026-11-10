/**
 * 后台敏感操作 · 管理人员 GA 验证码（登录后台即已绑定 GA，无绑定流程）
 */
(function () {
    var GATE_VERSION = 'verify-only-v2';

    function ensureShell() {
        if (document.getElementById('admin-totp-gate-root')) return;
        var wrap = document.createElement('div');
        wrap.id = 'admin-totp-gate-root';
        wrap.setAttribute('data-gate-version', GATE_VERSION);
        wrap.innerHTML =
            '<div id="admin-totp-overlay" class="fixed inset-0 z-[300] hidden items-center justify-center bg-black/60 p-4 backdrop-blur-sm">' +
            '<div class="bg-white w-full max-w-[400px] rounded-lg shadow-2xl border border-gray-100 overflow-hidden text-[12px]">' +
            '<div class="px-5 py-4 border-b border-gray-50 flex justify-between items-center">' +
            '<h3 id="admin-totp-title" class="text-sm font-black text-gray-900">GA 验证码</h3>' +
            '<button type="button" id="admin-totp-close" class="text-gray-400 hover:text-black text-lg leading-none" aria-label="关闭">✕</button>' +
            '</div>' +
            '<div id="admin-totp-body" class="p-5 space-y-4"></div>' +
            '</div></div>';
        document.body.appendChild(wrap);
        document.getElementById('admin-totp-close').addEventListener('click', close);
        document.getElementById('admin-totp-overlay').addEventListener('click', function (e) {
            if (e.target.id === 'admin-totp-overlay') close();
        });
    }

    var pendingSuccess = null;

    function close() {
        var ov = document.getElementById('admin-totp-overlay');
        if (ov) {
            ov.classList.add('hidden');
            ov.classList.remove('flex');
        }
        pendingSuccess = null;
    }

    function open() {
        ensureShell();
        var ov = document.getElementById('admin-totp-overlay');
        ov.classList.remove('hidden');
        ov.classList.add('flex');
    }

    function submitVerify() {
        var input = document.getElementById('admin-totp-verify-code');
        var code = (input && input.value ? input.value : '').replace(/\D/g, '');
        if (code.length !== 6) {
            alert('请输入 6 位 GA 验证码');
            return;
        }
        var cb = pendingSuccess && pendingSuccess.callback;
        close();
        if (cb) cb();
    }

    function renderVerify(actionLabel) {
        var body = document.getElementById('admin-totp-body');
        document.getElementById('admin-totp-title').textContent = 'GA 验证码';
        body.innerHTML =
            '<p class="text-[11px] text-slate-500 text-center leading-relaxed">' +
            '确认「<span class="font-bold text-slate-800">' + actionLabel + '</span>」，请输入 Google Authenticator 6 位验证码。</p>' +
            '<input id="admin-totp-verify-code" type="text" inputmode="numeric" maxlength="6" placeholder="请输入 6 位验证码" ' +
            'class="w-full border border-slate-200 rounded-sm px-3 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-slate-900" autofocus />' +
            '<button type="button" id="admin-totp-verify-submit" class="w-full py-2.5 bg-slate-900 text-white rounded-sm font-black text-[11px]">确认</button>';
        document.getElementById('admin-totp-verify-submit').onclick = submitVerify;
        var input = document.getElementById('admin-totp-verify-code');
        if (input) {
            input.onkeydown = function (e) {
                if (e.key === 'Enter') submitVerify();
            };
        }
    }

    window.AdminTotpGate = {
        version: GATE_VERSION,
        require: function (actionLabel, onSuccess) {
            ensureShell();
            pendingSuccess = { label: actionLabel, callback: onSuccess };
            open();
            renderVerify(actionLabel);
        },
        close: close
    };

    try {
        localStorage.removeItem('forx_admin_staff_totp_bound');
    } catch (e) { /* ignore */ }
})();
