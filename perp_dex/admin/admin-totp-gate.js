/**
 * 后台敏感操作 · 管理人员 GA（身份验证器）门禁
 * 原型假定：能登录后台的管理员均已绑定 GA，敏感操作仅需输入动态码。
 */
(function () {
    function ensureShell() {
        if (document.getElementById('admin-totp-gate-root')) return;
        const wrap = document.createElement('div');
        wrap.id = 'admin-totp-gate-root';
        wrap.innerHTML =
            '<div id="admin-totp-overlay" class="fixed inset-0 z-[300] hidden items-center justify-center bg-black/60 p-4 backdrop-blur-sm">' +
            '<div class="bg-white w-full max-w-[420px] rounded-lg shadow-2xl border border-gray-100 overflow-hidden text-[12px]">' +
            '<div class="px-5 py-4 border-b border-gray-50 flex justify-between items-center">' +
            '<h3 id="admin-totp-title" class="text-sm font-black text-gray-900">GA 验证</h3>' +
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

    let pendingSuccess = null;

    function close() {
        const ov = document.getElementById('admin-totp-overlay');
        if (ov) {
            ov.classList.add('hidden');
            ov.classList.remove('flex');
        }
        pendingSuccess = null;
    }

    function open() {
        ensureShell();
        const ov = document.getElementById('admin-totp-overlay');
        ov.classList.remove('hidden');
        ov.classList.add('flex');
    }

    function renderVerify(actionLabel) {
        const body = document.getElementById('admin-totp-body');
        document.getElementById('admin-totp-title').textContent = 'GA 验证';
        body.innerHTML =
            '<p class="text-[11px] text-slate-500 text-center leading-relaxed">为确认「' +
            actionLabel +
            '」，请输入<strong class="text-slate-800">后台管理人员</strong>身份验证器中的 6 位动态码。</p>' +
            '<input id="admin-totp-verify-code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full border border-slate-200 rounded-sm px-3 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-slate-900" autofocus />' +
            '<button type="button" id="admin-totp-verify-submit" class="w-full py-2.5 bg-slate-900 text-white rounded-sm font-black text-[11px]">验证并继续</button>';
        document.getElementById('admin-totp-verify-submit').onclick = function () {
            const code = (document.getElementById('admin-totp-verify-code').value || '').replace(/\D/g, '');
            if (code.length !== 6) {
                alert('请输入 6 位动态码');
                return;
            }
            const cb = pendingSuccess && pendingSuccess.callback;
            close();
            if (cb) cb();
        };
    }

    window.AdminTotpGate = {
        require: function (actionLabel, onSuccess) {
            ensureShell();
            pendingSuccess = { label: actionLabel, callback: onSuccess };
            open();
            renderVerify(actionLabel);
        },
        close: close
    };
})();
