/**
 * 合伙人申请管理 — 列表 / 详情 / 设置一级代理
 */
(function () {
    const ADMIN_OPERATORS = [
        { email: 'allen@forx.fi', label: 'Allen · 市场运营' },
        { email: 'bob@forx.fi', label: 'Bob · 市场运营' },
        { email: 'carol@forx.fi', label: 'Carol · 市场运营' },
        { email: 'dave@forx.fi', label: 'Dave · 市场运营' }
    ];

    const PARTNER_APPLICATIONS = [
        {
            id: 'APP20260828001',
            uid: '100920',
            wallet: '0xKol...Alpha',
            email: 'kol.alpha@forx.io',
            partnerIdentity: '普通用户',
            adminOperator: '',
            socialFollowers: 125000,
            communitySize: 8500,
            monthlyVolEstimate: 2500000,
            telegram: '@alpha_kol',
            x: '@alpha_forx',
            youtube: 'AlphaTradingCN',
            experience: '运营 Telegram 合约交易社群 3 年，月活 8000+，专注华语合约教育与带单。',
            attachments: [
                { name: 'TG群成员截图.png', type: 'image' },
                { name: '渠道介绍.pdf', type: 'pdf' }
            ],
            vol30d: 1850000,
            inviteCount: 42,
            inviteVol30d: 620000,
            accountEquity: 98500,
            netDeposit: 125000,
            inviteNetDeposit: 480000,
            status: 'pending',
            appliedAt: '2026-08-28 14:30'
        },
        {
            id: 'APP20260827002',
            uid: '100803',
            wallet: '0xNorm...L3',
            email: '',
            partnerIdentity: '三级合伙人',
            adminOperator: 'bob@forx.fi',
            socialFollowers: 48000,
            communitySize: 2200,
            monthlyVolEstimate: 680000,
            telegram: '@beta_trade',
            x: '',
            youtube: '',
            experience: 'Discord 华语交易群 2200 人，以现货+合约混合推广为主。',
            attachments: [],
            vol30d: 420000,
            inviteCount: 18,
            inviteVol30d: 185000,
            accountEquity: 15200,
            netDeposit: 28000,
            inviteNetDeposit: 95000,
            status: 'pending',
            appliedAt: '2026-08-27 09:15'
        },
        {
            id: 'APP20260825003',
            uid: '100922',
            wallet: '0xKol...Gamma',
            email: 'gamma.channel@forx.io',
            partnerIdentity: '二级合伙人',
            adminOperator: 'bob@forx.fi',
            socialFollowers: 320000,
            communitySize: 12000,
            monthlyVolEstimate: 5200000,
            telegram: '@gamma_official',
            x: '@gamma_perp',
            youtube: 'GammaPerp',
            experience: 'YouTube 合约频道 28 万订阅 + TG 付费群 1.2 万人，月推广成交额稳定 500 万 USDT 以上。',
            attachments: [
                { name: '频道数据截图.jpg', type: 'image' },
                { name: '合作案例.docx', type: 'doc' },
                { name: '月度流水.xlsx', type: 'excel' }
            ],
            vol30d: 4100000,
            inviteCount: 156,
            inviteVol30d: 1280000,
            accountEquity: 245000,
            netDeposit: 380000,
            inviteNetDeposit: 920000,
            status: 'reviewing',
            appliedAt: '2026-08-25 16:40'
        },
        {
            id: 'APP20260820004',
            uid: '100923',
            wallet: '0xKol...Delta',
            email: 'delta@forx.io',
            partnerIdentity: '普通用户',
            adminOperator: '',
            socialFollowers: 8500,
            communitySize: 450,
            monthlyVolEstimate: 120000,
            telegram: '@delta_small',
            x: '@delta_x',
            youtube: '',
            experience: '',
            attachments: [],
            vol30d: 85000,
            inviteCount: 5,
            inviteVol30d: 22000,
            accountEquity: 3200,
            netDeposit: 8500,
            inviteNetDeposit: 12000,
            status: 'rejected',
            appliedAt: '2026-08-20 11:00'
        }
    ];

    let appListPage = 1;
    let appListFilters = { q: '', telegram: '', x: '', youtube: '' };
    let currentApplicationId = null;
    let appBindState = { applicationId: null, operatorSearch: '' };

    function fmtNum(n) {
        if (n == null || isNaN(n)) return '—';
        return Number(n).toLocaleString('en-US');
    }

    function fmtMoney(n) {
        if (n == null || isNaN(n)) return '—';
        return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function chip(v, type) {
        if (!v || v === '—') return '<span class="text-slate-400">—</span>';
        if (window.AdminCopyChip) return AdminCopyChip.render(v, { type: type || (String(v).indexOf('0x') >= 0 ? 'wallet' : 'uid') });
        return v;
    }

    function getApplication(id) {
        return PARTNER_APPLICATIONS.find(function (a) { return a.id === id; });
    }

    function matchesAppFilters(app) {
        const q = (appListFilters.q || '').trim().toLowerCase();
        if (q) {
            const hay = [app.uid, app.wallet, app.email, app.id].join(' ').toLowerCase();
            if (hay.indexOf(q) < 0) return false;
        }
        if (appListFilters.telegram && (app.telegram || '').toLowerCase().indexOf(appListFilters.telegram.trim().toLowerCase()) < 0) return false;
        if (appListFilters.x && (app.x || '').toLowerCase().indexOf(appListFilters.x.trim().toLowerCase()) < 0) return false;
        if (appListFilters.youtube && (app.youtube || '').toLowerCase().indexOf(appListFilters.youtube.trim().toLowerCase()) < 0) return false;
        return true;
    }

    function formatPartnerIdentity(identity) {
        if (!identity || identity === '普通用户') return '<span class="text-slate-600 font-bold">普通用户</span>';
        return '<span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">' + identity + '</span>';
    }

    function formatAdminOperator(op) {
        if (!op) return '<span class="text-slate-400">—</span>';
        return '<span class="font-bold text-slate-700">' + op + '</span>';
    }

    function renderAttachments(attachments) {
        const list = attachments || [];
        if (!list.length) return '<span class="text-slate-400 text-[12px]">—（未上传）</span>';
        return list.map(function (f) {
            const icon = f.type === 'image' ? '🖼' : f.type === 'pdf' ? '📄' : f.type === 'excel' ? '📊' : '📝';
            return '<a href="#" class="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100">' +
                icon + ' ' + f.name + '</a>';
        }).join('');
    }

    function renderFieldGrid(containerId, fields) {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.innerHTML = fields.map(function (pair) {
            return '<div class="bg-white border rounded-lg p-4"><p class="text-[10px] font-bold text-slate-400 uppercase mb-1">' + pair[0] + '</p><div class="text-[13px] font-bold text-slate-900">' + pair[1] + '</div></div>';
        }).join('');
    }

    function statusBadge(status) {
        const map = {
            pending: '<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">待审核</span>',
            reviewing: '<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">审核中</span>',
            approved: '<span class="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[10px]">已通过</span>',
            rejected: '<span class="px-2 py-0.5 rounded bg-red-50 text-red-600 font-bold text-[10px]">已驳回</span>'
        };
        return map[status] || status;
    }

    function showApplicationList() {
        currentApplicationId = null;
        if (window.PartnerPortal_showPage) PartnerPortal_showPage('page-partner-applications');
        if (location.hash.replace('#', '').split('?')[0] !== 'partner-applications') {
            location.hash = 'partner-applications';
        }
        renderApplicationList();
    }

    function showApplicationDetail(id) {
        currentApplicationId = id;
        if (window.PartnerPortal_showPage) PartnerPortal_showPage('page-partner-application-detail');
        if (location.hash.replace('#', '').split('?')[0] !== 'partner-application-detail') {
            location.hash = 'partner-application-detail';
        }
        renderApplicationDetail(id);
    }

    function renderApplicationList() {
        const filtered = PARTNER_APPLICATIONS.filter(matchesAppFilters);
        const pageSize = 10;
        const total = filtered.length;
        const start = (appListPage - 1) * pageSize;
        const pageItems = filtered.slice(start, start + pageSize);

        const tbody = document.getElementById('partner-app-list-body');
        if (!tbody) return;

        if (!pageItems.length) {
            tbody.innerHTML = '<tr><td colspan="15" class="px-4 py-12 text-center text-slate-400 font-bold">暂无申请记录</td></tr>';
        } else {
            tbody.innerHTML = pageItems.map(function (a) {
                return '<tr class="hover:bg-slate-50 border-b">' +
                    '<td class="px-4 py-3">' + chip(a.uid, 'uid') + '</td>' +
                    '<td class="px-3 py-3">' + formatPartnerIdentity(a.partnerIdentity) + '</td>' +
                    '<td class="px-3 py-3">' + formatAdminOperator(a.adminOperator) + '</td>' +
                    '<td class="px-3 py-3">' + chip(a.wallet, 'wallet') + '</td>' +
                    '<td class="px-3 py-3">' + (a.email ? chip(a.email, 'email') : '<span class="text-slate-400">—</span>') + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.socialFollowers) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.communitySize) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.monthlyVolEstimate) + '</td>' +
                    '<td class="px-3 py-3">' + (a.telegram || '—') + '</td>' +
                    '<td class="px-3 py-3">' + (a.x || '—') + '</td>' +
                    '<td class="px-3 py-3">' + (a.youtube || '—') + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.vol30d) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.inviteCount) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.inviteVol30d) + '</td>' +
                    '<td class="px-3 py-3 whitespace-nowrap">' +
                    '<button type="button" onclick="PartnerApplications.showApplicationDetail(\'' + a.id + '\')" class="text-blue-600 font-bold hover:underline mr-3">查看详情</button>' +
                    (a.status !== 'approved' ? '<button type="button" onclick="PartnerApplications.openSetL1Modal(\'' + a.id + '\')" class="text-slate-900 font-bold hover:underline">设置成一级代理</button>' : '<span class="text-slate-400 text-[10px]">已绑定</span>') +
                    '</td></tr>';
            }).join('');
        }

        if (window.AdminPagination) {
            AdminPagination.mount('partner-app-list-pagination', total, appListPage, 'partner-app-list', 10);
        }
    }

    function renderApplicationDetail(id) {
        const a = getApplication(id);
        if (!a) return;

        const set = function (elId, html) {
            const el = document.getElementById(elId);
            if (el) el.innerHTML = html;
        };

        set('app-detail-title', '合伙人申请 · UID ' + a.uid);
        set('app-detail-sub', '申请单 ' + a.id + ' · 提交于 ' + a.appliedAt + ' · ' + statusBadge(a.status));

        renderFieldGrid('app-detail-apply-grid', [
            ['UID', chip(a.uid, 'uid')],
            ['钱包地址', chip(a.wallet, 'wallet')],
            ['邮箱', a.email ? chip(a.email, 'email') : '—'],
            ['合伙人身份', formatPartnerIdentity(a.partnerIdentity)],
            ['后台操作人员', formatAdminOperator(a.adminOperator)],
            ['社交账号粉丝数', fmtNum(a.socialFollowers)],
            ['社区管理人数', fmtNum(a.communitySize)],
            ['团队月交易额预估', fmtMoney(a.monthlyVolEstimate)],
            ['Telegram', a.telegram || '—'],
            ['X 账号', a.x || '—'],
            ['YouTube', a.youtube || '—']
        ]);

        renderFieldGrid('app-detail-data-grid', [
            ['近 30 日交易额', fmtMoney(a.vol30d)],
            ['下级邀请人数', fmtNum(a.inviteCount)],
            ['近 30 日下级邀请交易额', fmtMoney(a.inviteVol30d)],
            ['账户总权益', fmtMoney(a.accountEquity)],
            ['资产净充值金额', fmtMoney(a.netDeposit)],
            ['下级邀请好友净充值', fmtMoney(a.inviteNetDeposit)]
        ]);

        const expEl = document.getElementById('app-detail-experience');
        if (expEl) expEl.textContent = a.experience || '—（未填写）';

        const attachEl = document.getElementById('app-detail-attachments');
        if (attachEl) attachEl.innerHTML = renderAttachments(a.attachments);

        const btnWrap = document.getElementById('app-detail-actions');
        if (btnWrap) {
            btnWrap.innerHTML = a.status !== 'approved'
                ? '<button type="button" onclick="PartnerApplications.openSetL1Modal(\'' + a.id + '\')" class="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700">设置成一级代理</button>'
                : '<span class="text-green-700 font-bold text-[11px]">该申请已绑定为一级合伙人</span>';
        }
    }

    function applyAppFilters() {
        appListPage = 1;
        appListFilters.q = (document.getElementById('app-filter-q') || {}).value || '';
        appListFilters.telegram = (document.getElementById('app-filter-telegram') || {}).value || '';
        appListFilters.x = (document.getElementById('app-filter-x') || {}).value || '';
        appListFilters.youtube = (document.getElementById('app-filter-youtube') || {}).value || '';
        renderApplicationList();
    }

    function resetAppFilters() {
        ['app-filter-q', 'app-filter-telegram', 'app-filter-x', 'app-filter-youtube'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        appListFilters = { q: '', telegram: '', x: '', youtube: '' };
        appListPage = 1;
        renderApplicationList();
    }

    function renderOperatorOptions(search) {
        const q = (search || '').trim().toLowerCase();
        const list = ADMIN_OPERATORS.filter(function (op) {
            if (!q) return true;
            return op.email.toLowerCase().indexOf(q) >= 0 || op.label.toLowerCase().indexOf(q) >= 0;
        });
        const sel = document.getElementById('app-bind-operator');
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '<option value="">请选择负责运营</option>' +
            list.map(function (op) {
                return '<option value="' + op.email + '"' + (current === op.email ? ' selected' : '') + '>' + op.label + ' · ' + op.email + '</option>';
            }).join('');
    }

    function openSetL1Modal(applicationId) {
        const app = getApplication(applicationId);
        if (!app) return;
        appBindState = { applicationId: applicationId, operatorSearch: '' };

        const uidEl = document.getElementById('app-bind-uid');
        const ratioEl = document.getElementById('app-bind-ratio');
        const remarkEl = document.getElementById('app-bind-remark');
        const searchEl = document.getElementById('app-bind-operator-search');
        const previewEl = document.getElementById('app-bind-subject-preview');

        if (uidEl) { uidEl.value = app.uid; uidEl.readOnly = true; }
        if (ratioEl) ratioEl.value = '';
        if (remarkEl) remarkEl.value = '合伙人计划申请通过 · ' + (app.telegram || app.uid);
        if (searchEl) searchEl.value = '';

        if (previewEl) {
            previewEl.innerHTML =
                '<div class="grid grid-cols-2 gap-3 text-[11px]">' +
                '<div><span class="text-slate-400 font-bold">申请人 UID</span><p class="font-black mt-0.5">' + app.uid + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">Telegram</span><p class="font-black mt-0.5">' + (app.telegram || '—') + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">粉丝数</span><p class="font-black mt-0.5">' + fmtNum(app.socialFollowers) + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">月交易额预估</span><p class="font-black mt-0.5">' + fmtMoney(app.monthlyVolEstimate) + '</p></div>' +
                '</div>';
        }

        renderOperatorOptions('');
        document.getElementById('modal-app-set-l1').classList.remove('hidden');

        if (window.PartnerPortal && PartnerPortal.previewBindPartnerFromUid) {
            PartnerPortal.previewBindPartnerFromUid(app.uid, 'app-bind-subject-card', 'app-bind-ratio-hint');
        }
    }

    function closeSetL1Modal() {
        document.getElementById('modal-app-set-l1').classList.add('hidden');
        appBindState = { applicationId: null, operatorSearch: '' };
    }

    function filterOperatorDropdown() {
        const searchEl = document.getElementById('app-bind-operator-search');
        renderOperatorOptions(searchEl ? searchEl.value : '');
    }

    function submitSetL1() {
        const app = getApplication(appBindState.applicationId);
        const ratioEl = document.getElementById('app-bind-ratio');
        const remarkEl = document.getElementById('app-bind-remark');
        const operatorEl = document.getElementById('app-bind-operator');
        const ratio = ratioEl ? parseFloat(ratioEl.value) : NaN;
        const remark = remarkEl ? remarkEl.value.trim() : '';
        const operator = operatorEl ? operatorEl.value : '';

        if (!app) { alert('申请不存在'); return; }
        if (!operator) { alert('请选择负责该合伙人的后台运营人员'); return; }
        if (!ratio || isNaN(ratio) || ratio <= 0) { alert('请填写有效的一级合伙人返佣比例'); return; }
        if (!remark) { alert('请填写申请备注'); return; }

        if (window.PartnerPortal && PartnerPortal.applyL1BindFromApplication) {
            PartnerPortal.applyL1BindFromApplication({
                uid: app.uid,
                ratio: ratio,
                remark: remark,
                operator: operator,
                applicationId: app.id
            });
        } else {
            app.status = 'approved';
            alert('演示：已将 UID ' + app.uid + ' 设置为一级合伙人（' + ratio + '%），负责运营 ' + operator);
        }

        closeSetL1Modal();
        if (currentApplicationId) renderApplicationDetail(currentApplicationId);
        else renderApplicationList();
    }

    window.PartnerApplications = {
        showApplicationList: showApplicationList,
        showApplicationDetail: showApplicationDetail,
        renderApplicationList: renderApplicationList,
        applyAppFilters: applyAppFilters,
        resetAppFilters: resetAppFilters,
        openSetL1Modal: openSetL1Modal,
        closeSetL1Modal: closeSetL1Modal,
        filterOperatorDropdown: filterOperatorDropdown,
        submitSetL1: submitSetL1,
        getApplication: getApplication,
        getCurrentId: function () { return currentApplicationId; },
        markApproved: function (applicationId) {
            const app = getApplication(applicationId);
            if (app) app.status = 'approved';
        }
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (window.AdminPagination) {
            AdminPagination.register('partner-app-list', function (p) {
                appListPage = p;
                renderApplicationList();
            });
        }
    });
})();
