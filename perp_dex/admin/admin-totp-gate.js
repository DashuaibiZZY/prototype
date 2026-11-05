/**
 * 后台敏感操作 · 管理人员 GA（身份验证器）门禁
 */
(function () {
    const STORAGE_BOUND = 'forx_admin_staff_totp_bound';

    function isBound() {
        return localStorage.getItem(STORAGE_BOUND) !== '0';
    }

    function setBound(bound) {
        localStorage.setItem(STORAGE_BOUND, bound ? '1' : '0');
    }

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
    let bindStep = 'prompt';

    function close() {
        const ov = document.getElementById('admin-totp-overlay');
        if (ov) {
            ov.classList.add('hidden');
            ov.classList.remove('flex');
        }
        pendingSuccess = null;
        bindStep = 'prompt';
    }

    function open() {
        ensureShell();
        const ov = document.getElementById('admin-totp-overlay');
        ov.classList.remove('hidden');
        ov.classList.add('flex');
    }

    function renderNotBound() {
        const body = document.getElementById('admin-totp-body');
        document.getElementById('admin-totp-title').textContent = '绑定管理人员 GA';
        body.innerHTML =
            '<p class="text-[11px] text-slate-500 leading-relaxed">代用户管理 API Key、查看凭证、删除 Key 等操作需先绑定<strong class="text-slate-800">后台管理人员</strong>的身份验证器（GA）。</p>' +
            '<div class="bg-amber-50 border border-amber-100 rounded-sm p-3 text-[11px] text-amber-900">' +
            '<p class="font-bold">当前管理员账号尚未绑定 GA</p>' +
            '<p class="mt-1 text-amber-800/90">请在权限与安全设置中完成绑定后，再执行 API 相关操作。</p>' +
            '</div>' +
            '<button type="button" id="admin-totp-bind-start" class="w-full py-2.5 bg-slate-900 text-white rounded-sm font-black text-[11px]">立即绑定（原型）</button>' +
            '<button type="button" id="admin-totp-bind-cancel" class="w-full py-2.5 border border-slate-200 rounded-sm font-bold text-slate-500">取消</button>';
        document.getElementById('admin-totp-bind-cancel').onclick = function () {
            pendingSuccess = null;
            close();
        };
        document.getElementById('admin-totp-bind-start').onclick = function () {
            bindStep = 'qr';
            renderBindFlow();
        };
    }

    function renderBindFlow() {
        const body = document.getElementById('admin-totp-body');
        if (bindStep === 'qr') {
            document.getElementById('admin-totp-title').textContent = '绑定 GA';
            body.innerHTML =
                '<p class="text-[11px] text-slate-500 text-center leading-relaxed">使用身份验证器扫描二维码或输入密钥（管理人员专用）</p>' +
                '<div class="mx-auto w-36 h-36 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center text-[10px] text-slate-400 font-bold">QR CODE</div>' +
                '<button type="button" id="admin-totp-bind-next" class="w-full py-2.5 bg-slate-900 text-white rounded-sm font-black text-[11px]">下一步</button>';
            document.getElementById('admin-totp-bind-next').onclick = function () {
                bindStep = 'confirm';
                renderBindFlow();
            };
            return;
        }
        if (bindStep === 'confirm') {
            document.getElementById('admin-totp-title').textContent = '验证绑定';
            body.innerHTML =
                '<p class="text-[11px] text-slate-500 text-center">输入 GA 中的 6 位动态码</p>' +
                '<input id="admin-totp-bind-code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" class="w-full border border-slate-200 rounded-sm px-3 py-3 text-center text-lg font-black tracking-[0.3em] outline-none focus:border-slate-900" />' +
                '<button type="button" id="admin-totp-bind-confirm" class="w-full py-2.5 bg-slate-900 text-white rounded-sm font-black text-[11px]">确认绑定</button>';
            document.getElementById('admin-totp-bind-confirm').onclick = function () {
                const code = (document.getElementById('admin-totp-bind-code').value || '').replace(/\D/g, '');
                if (code.length !== 6) {
                    alert('请输入 6 位动态码');
                    return;
                }
                setBound(true);
                close();
                if (pendingSuccess) {
                    const fn = pendingSuccess;
                    pendingSuccess = null;
                    window.AdminTotpGate.require(fn.label || '继续操作', fn.callback);
                }
            };
        }
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
