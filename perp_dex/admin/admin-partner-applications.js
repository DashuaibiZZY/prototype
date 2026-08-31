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
            contactChannel: 'Telegram',
            contactAccount: '@alpha_kol',
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
            inviteVolTotal: 1850000,
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
            contactChannel: 'Discord',
            contactAccount: 'beta_trade#1024',
            x: '',
            youtube: '',
            experience: 'Discord 华语交易群 2200 人，以现货+合约混合推广为主。',
            attachments: [],
            vol30d: 420000,
            inviteCount: 18,
            inviteVol30d: 185000,
            inviteVolTotal: 520000,
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
            contactChannel: 'Telegram',
            contactAccount: '@gamma_official',
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
            inviteVolTotal: 4200000,
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
            contactChannel: 'Line',
            contactAccount: 'delta_small',
            x: '@delta_x',
            youtube: '',
            experience: '',
            attachments: [],
            vol30d: 85000,
            inviteCount: 5,
            inviteVol30d: 22000,
            inviteVolTotal: 68000,
            accountEquity: 3200,
            netDeposit: 8500,
            inviteNetDeposit: 12000,
            status: 'rejected',
            rejectReason: '社群规模与推广经验资料不足，建议补充渠道证明后重新申请。',
            appliedAt: '2026-08-20 11:00'
        }
    ];

    let appListPage = 1;
    let appListFilters = { q: '', contact: '', x: '', youtube: '' };
    let currentApplicationId = null;
    let appBindState = { applicationId: null, operatorSearch: '', operatorOpen: false };
    let appRejectState = { applicationId: null };

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
        if (appListFilters.contact) {
            const contactHay = formatContactText(app).toLowerCase();
            if (contactHay.indexOf(appListFilters.contact.trim().toLowerCase()) < 0) return false;
        }
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

    function formatContactText(app) {
        if (!app) return '';
        const channel = app.contactChannel || '';
        const account = app.contactAccount || '';
        if (channel && account) return channel + ' · ' + account;
        return channel || account || '';
    }

    function formatContactDisplay(app) {
        const text = formatContactText(app);
        if (!text) return '—';
        return text;
    }

    function formatWalletEmail(wallet, email) {
        const parts = [];
        if (wallet) parts.push(chip(wallet, 'wallet'));
        if (email) parts.push(chip(email, 'email'));
        if (!parts.length) return '<span class="text-slate-400">—</span>';
        return parts.join('<span class="text-slate-300 mx-1">/</span>');
    }

    function isMultiLevelPartner(identity) {
        return identity && identity !== '普通用户';
    }

    function canShowSetL1Button(app) {
        return app && (app.status === 'pending' || app.status === 'reviewing') && !isMultiLevelPartner(app.partnerIdentity);
    }

    function canRejectApplication(app) {
        return app && (app.status === 'pending' || app.status === 'reviewing');
    }

    function renderSetL1Action(app, className) {
        if (!canShowSetL1Button(app)) return '';
        return '<button type="button" onclick="PartnerApplications.openSetL1Modal(\'' + app.id + '\')" class="' + className + '">设置成一级代理</button>';
    }

    function renderRejectAction(app, className) {
        if (!canRejectApplication(app)) return '';
        return '<button type="button" onclick="PartnerApplications.openRejectModal(\'' + app.id + '\')" class="' + className + '">驳回申请</button>';
    }

    function renderListActions(app) {
        const parts = [
            '<button type="button" onclick="PartnerApplications.showApplicationDetail(\'' + app.id + '\')" class="text-blue-600 font-bold hover:underline">查看详情</button>'
        ];
        const setL1 = renderSetL1Action(app, 'text-slate-900 font-bold hover:underline');
        const reject = renderRejectAction(app, 'text-red-600 font-bold hover:underline');
        if (setL1) parts.push(setL1);
        if (reject) parts.push(reject);
        if (app.status === 'approved') parts.push('<span class="text-slate-400 text-[10px]">已绑定</span>');
        else if (isMultiLevelPartner(app.partnerIdentity) && !setL1 && !reject) parts.push('<span class="text-slate-400 text-[10px]">已是合伙人</span>');
        else if (app.status === 'rejected') parts.push('<span class="text-slate-400 text-[10px]">已驳回</span>');
        return parts.join('<span class="text-slate-300 mx-2">|</span>');
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
            tbody.innerHTML = '<tr><td colspan="16" class="px-4 py-12 text-center text-slate-400 font-bold">暂无申请记录</td></tr>';
        } else {
            tbody.innerHTML = pageItems.map(function (a) {
                return '<tr class="hover:bg-slate-50 border-b">' +
                    '<td class="px-4 py-3 whitespace-nowrap font-bold text-slate-700">' + (a.appliedAt || '—') + '</td>' +
                    '<td class="px-3 py-3">' + chip(a.uid, 'uid') + '</td>' +
                    '<td class="px-3 py-3">' + formatPartnerIdentity(a.partnerIdentity) + '</td>' +
                    '<td class="px-3 py-3">' + formatAdminOperator(a.adminOperator) + '</td>' +
                    '<td class="px-3 py-3">' + chip(a.wallet, 'wallet') + '</td>' +
                    '<td class="px-3 py-3">' + (a.email ? chip(a.email, 'email') : '<span class="text-slate-400">—</span>') + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.socialFollowers) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.communitySize) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.monthlyVolEstimate) + '</td>' +
                    '<td class="px-3 py-3">' + formatContactDisplay(a) + '</td>' +
                    '<td class="px-3 py-3">' + (a.x || '—') + '</td>' +
                    '<td class="px-3 py-3">' + (a.youtube || '—') + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.vol30d) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtNum(a.inviteCount) + '</td>' +
                    '<td class="px-3 py-3 text-right font-bold">' + fmtMoney(a.inviteVol30d) + '</td>' +
                    '<td class="px-3 py-3 whitespace-nowrap">' + renderListActions(a) + '</td></tr>';
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

        const rejectBanner = document.getElementById('app-detail-reject-banner');
        if (rejectBanner) {
            if (a.status === 'rejected' && a.rejectReason) {
                rejectBanner.classList.remove('hidden');
                rejectBanner.innerHTML = '<p class="text-[10px] font-bold text-red-500 uppercase mb-1">驳回原因</p><p class="text-[12px] text-red-800 leading-relaxed">' + a.rejectReason + '</p>';
            } else {
                rejectBanner.classList.add('hidden');
                rejectBanner.innerHTML = '';
            }
        }

        renderFieldGrid('app-detail-apply-grid', [
            ['申请时间', a.appliedAt || '—'],
            ['社交账号粉丝数', fmtNum(a.socialFollowers)],
            ['社区管理人数', fmtNum(a.communitySize)],
            ['团队月交易额预估', fmtMoney(a.monthlyVolEstimate)],
            ['即时联系渠道', a.contactChannel || '—'],
            ['联系账号', a.contactAccount || '—'],
            ['X 账号', a.x || '—'],
            ['YouTube', a.youtube || '—']
        ]);

        renderFieldGrid('app-detail-data-grid', [
            ['UID', chip(a.uid, 'uid')],
            ['钱包/邮箱地址', formatWalletEmail(a.wallet, a.email)],
            ['合伙人身份', formatPartnerIdentity(a.partnerIdentity)],
            ['后台管理人员', formatAdminOperator(a.adminOperator)],
            ['近 30 日交易额', fmtMoney(a.vol30d)],
            ['下级邀请人数', fmtNum(a.inviteCount)],
            ['近 30 日下级邀请交易额', fmtMoney(a.inviteVol30d)],
            ['累计下级邀请交易额', fmtMoney(a.inviteVolTotal)],
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
            const actions = [];
            if (canShowSetL1Button(a)) {
                actions.push('<button type="button" onclick="PartnerApplications.openSetL1Modal(\'' + a.id + '\')" class="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700">设置成一级代理</button>');
            } else if (a.status === 'approved') {
                actions.push('<span class="text-green-700 font-bold text-[11px]">该申请已绑定为一级合伙人</span>');
            } else if (isMultiLevelPartner(a.partnerIdentity)) {
                actions.push('<span class="text-slate-500 font-bold text-[11px]">该用户已是多层合伙人，无需设置一级代理</span>');
            }
            if (canRejectApplication(a)) {
                actions.push('<button type="button" onclick="PartnerApplications.openRejectModal(\'' + a.id + '\')" class="border border-red-200 text-red-600 px-5 py-2 rounded font-bold hover:bg-red-50">驳回申请</button>');
            } else if (a.status === 'rejected') {
                actions.push('<span class="text-red-600 font-bold text-[11px]">该申请已驳回</span>');
            }
            btnWrap.innerHTML = actions.length
                ? '<div class="flex flex-wrap gap-2">' + actions.join('') + '</div>'
                : '';
        }
    }

    function applyAppFilters() {
        appListPage = 1;
        appListFilters.q = (document.getElementById('app-filter-q') || {}).value || '';
        appListFilters.contact = (document.getElementById('app-filter-contact') || {}).value || '';
        appListFilters.x = (document.getElementById('app-filter-x') || {}).value || '';
        appListFilters.youtube = (document.getElementById('app-filter-youtube') || {}).value || '';
        renderApplicationList();
    }

    function resetAppFilters() {
        ['app-filter-q', 'app-filter-contact', 'app-filter-x', 'app-filter-youtube'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        appListFilters = { q: '', contact: '', x: '', youtube: '' };
        appListPage = 1;
        renderApplicationList();
    }

    function getOperatorLabel(email) {
        if (!email) return '';
        const op = ADMIN_OPERATORS.find(function (item) { return item.email === email; });
        return op ? op.label + ' · ' + op.email : email;
    }

    function updateOperatorTriggerLabel(email) {
        const labelEl = document.getElementById('app-bind-operator-trigger-label');
        if (!labelEl) return;
        if (!email) {
            labelEl.textContent = '请选择负责运营';
            labelEl.className = 'truncate text-slate-500';
            return;
        }
        labelEl.textContent = getOperatorLabel(email);
        labelEl.className = 'truncate text-slate-900';
    }

    function setOperatorDropdownOpen(open) {
        appBindState.operatorOpen = !!open;
        const panel = document.getElementById('app-bind-operator-panel');
        const trigger = document.getElementById('app-bind-operator-trigger');
        if (panel) panel.classList.toggle('hidden', !open);
        if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            const searchEl = document.getElementById('app-bind-operator-search');
            if (searchEl) {
                searchEl.value = appBindState.operatorSearch || '';
                setTimeout(function () { searchEl.focus(); }, 0);
            }
        }
    }

    function renderOperatorOptions(search) {
        const q = (search || '').trim().toLowerCase();
        appBindState.operatorSearch = search || '';
        const list = ADMIN_OPERATORS.filter(function (op) {
            if (!q) return true;
            return op.email.toLowerCase().indexOf(q) >= 0 || op.label.toLowerCase().indexOf(q) >= 0;
        });
        const hiddenEl = document.getElementById('app-bind-operator');
        const optionsEl = document.getElementById('app-bind-operator-options');
        const current = hiddenEl ? hiddenEl.value : '';
        if (!optionsEl) return;
        if (!list.length) {
            optionsEl.innerHTML = '<p class="px-3 py-2 text-[11px] text-slate-400">无匹配运营人员</p>';
            return;
        }
        optionsEl.innerHTML = list.map(function (op) {
            const selected = current === op.email;
            return '<button type="button" onclick="PartnerApplications.selectOperator(\'' + op.email + '\')" class="app-operator-combobox-option w-full text-left px-3 py-2 text-[11px] font-bold ' +
                (selected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50') + '">' +
                op.label + ' · ' + op.email + '</button>';
        }).join('');
    }

    function toggleOperatorDropdown() {
        setOperatorDropdownOpen(!appBindState.operatorOpen);
    }

    function selectOperator(email) {
        const hiddenEl = document.getElementById('app-bind-operator');
        if (hiddenEl) hiddenEl.value = email || '';
        updateOperatorTriggerLabel(email);
        appBindState.operatorSearch = '';
        renderOperatorOptions('');
        setOperatorDropdownOpen(false);
    }

    function closeOperatorDropdown() {
        if (appBindState.operatorOpen) setOperatorDropdownOpen(false);
    }

    function openSetL1Modal(applicationId) {
        const app = getApplication(applicationId);
        if (!app) return;
        if (!canShowSetL1Button(app)) return;
        appBindState = { applicationId: applicationId, operatorSearch: '', operatorOpen: false };

        const uidEl = document.getElementById('app-bind-uid');
        const ratioEl = document.getElementById('app-bind-ratio');
        const remarkEl = document.getElementById('app-bind-remark');
        const operatorEl = document.getElementById('app-bind-operator');
        const previewEl = document.getElementById('app-bind-subject-preview');

        if (uidEl) { uidEl.value = app.uid; uidEl.readOnly = true; }
        if (ratioEl) ratioEl.value = '';
        if (remarkEl) remarkEl.value = '合伙人计划申请通过 · ' + (formatContactText(app) || app.uid);
        if (operatorEl) operatorEl.value = '';
        updateOperatorTriggerLabel('');
        renderOperatorOptions('');
        setOperatorDropdownOpen(false);

        if (previewEl) {
            previewEl.innerHTML =
                '<div class="grid grid-cols-2 gap-3 text-[11px]">' +
                '<div><span class="text-slate-400 font-bold">申请人 UID</span><p class="font-black mt-0.5">' + app.uid + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">即时联系方式</span><p class="font-black mt-0.5">' + formatContactDisplay(app) + '</p></div>' +
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
        closeOperatorDropdown();
        document.getElementById('modal-app-set-l1').classList.add('hidden');
        appBindState = { applicationId: null, operatorSearch: '', operatorOpen: false };
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

    function openRejectModal(applicationId) {
        const app = getApplication(applicationId);
        if (!app || !canRejectApplication(app)) return;
        appRejectState = { applicationId: applicationId };
        const previewEl = document.getElementById('app-reject-preview');
        const reasonEl = document.getElementById('app-reject-reason');
        if (previewEl) {
            previewEl.innerHTML =
                '<div class="grid grid-cols-2 gap-3">' +
                '<div><span class="text-slate-400 font-bold">申请人 UID</span><p class="font-black mt-0.5">' + app.uid + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">申请时间</span><p class="font-black mt-0.5">' + (app.appliedAt || '—') + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">即时联系方式</span><p class="font-black mt-0.5">' + formatContactDisplay(app) + '</p></div>' +
                '<div><span class="text-slate-400 font-bold">审核状态</span><p class="font-black mt-0.5">' + (app.status === 'reviewing' ? '审核中' : '待审核') + '</p></div>' +
                '</div>';
        }
        if (reasonEl) reasonEl.value = '';
        document.getElementById('modal-app-reject').classList.remove('hidden');
    }

    function closeRejectModal() {
        document.getElementById('modal-app-reject').classList.add('hidden');
        appRejectState = { applicationId: null };
    }

    function submitReject() {
        const app = getApplication(appRejectState.applicationId);
        const reasonEl = document.getElementById('app-reject-reason');
        const reason = reasonEl ? reasonEl.value.trim() : '';
        if (!app) { alert('申请不存在'); return; }
        if (!reason) { alert('请填写驳回原因'); return; }
        app.status = 'rejected';
        app.rejectReason = reason;
        alert('演示：已驳回 UID ' + app.uid + ' 的合伙人计划申请');
        closeRejectModal();
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
        toggleOperatorDropdown: toggleOperatorDropdown,
        selectOperator: selectOperator,
        filterOperatorDropdown: filterOperatorDropdown,
        submitSetL1: submitSetL1,
        openRejectModal: openRejectModal,
        closeRejectModal: closeRejectModal,
        submitReject: submitReject,
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
        document.addEventListener('click', function (e) {
            const combobox = document.getElementById('app-bind-operator-combobox');
            if (!combobox || combobox.contains(e.target)) return;
            closeOperatorDropdown();
        });
    });
})();
