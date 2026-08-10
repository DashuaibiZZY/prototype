/**
 * 合伙人中心后台 — 4 条演示数据，列表 / 详情 / 返佣树一致
 */
(function () {
    const OPS_CAP = 80;
    const DATA_VERSION = 'partner-demo-9';

    function chip(v, type) {
        if (!v || v === '—' || v === '--') return '<span class="text-slate-400">' + (v || '—') + '</span>';
        if (window.AdminCopyChip) return AdminCopyChip.render(v, { type: type || (String(v).indexOf('0x') >= 0 ? 'wallet' : 'uid') });
        return v;
    }

    function fmtMoney(n) {
        if (n == null || isNaN(n)) return '—';
        return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /** 仅列表展示的 4 个合伙人 */
    const LIST_IDS = ['p_n1', 'p_n3', 'p_a1', 'p_a4'];

    function helperUser(id, wallet, uid, note, level, ratio, parentWallet, rootWallet, childIds) {
        return {
            id: id, wallet: wallet, uid: uid, note: note, level: level, ratio: ratio,
            parentWallet: parentWallet, rootWallet: rootWallet, bindTime: '2024-04-10',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$1.2M', deposit: '+$35k', usersTotal: 80, usersActive: 22,
            net: '$6,800', netHint: '', rebateTotal: '$420', rebateSelf: '$0.02k', rebateDirect: '$0.1k', rebateGap: '$0.3k',
            activeSubPartners: (childIds || []).length, totalSubPartners: (childIds || []).length,
            childIds: childIds || [], directClients: [], settlements: []
        };
    }

    const USERS = [
        {
            id: 'p_n1', wallet: '0xNorm...L1', uid: '100801', note: '正常结算·一级返佣', level: 1, ratio: 70,
            parentWallet: null, rootWallet: '0xNorm...L1', operator: 'allen@forx.fi', bindTime: '2024-03-01',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$18.2M', deposit: '+$620k', usersTotal: 680, usersActive: 210,
            net: '$84,200', netHint: '伞下净手续费 − 伞下触发的全部返佣',
            rebateTotal: '$6,200', rebateSelf: '$0.3k', rebateDirect: '$2.1k', rebateGap: '$3.9k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_n2a', 'h_n2b'],
            directClients: [{ time: '2024-05-17', wallet: '0xde...55aa', vol: '$92,000', fee: '$92', rebate: '$64.40', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$1.1M', rebate: '$4,820', originalRebate: '$4,820', status: '已发放', note: '' }]
        },
        helperUser('h_n2a', '0xNorm...L2a', '100802', '华东渠道', 2, 55, '0xNorm...L1', '0xNorm...L1', ['p_n3', 'h_n3a']),
        helperUser('h_n2b', '0xNorm...L2b', '100802b', '华南渠道', 2, 53, '0xNorm...L1', '0xNorm...L1', ['h_n3b', 'h_n3c']),
        {
            id: 'p_n3', wallet: '0xNorm...L3', uid: '100803', note: '正常结算·三级返佣', level: 3, ratio: 45,
            parentWallet: '0xNorm...L2a', rootWallet: '0xNorm...L1', bindTime: '2024-04-02',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$4.8M', deposit: '+$180k', usersTotal: 320, usersActive: 88,
            net: '$22,100', netHint: '含向上级级差',
            rebateTotal: '$8,420', rebateSelf: '$0.1k', rebateDirect: '$0.8k', rebateGap: '$7.5k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_n4a', 'h_n4b'],
            directClients: [{ time: '2024-05-21', wallet: '0xcc...88ab', vol: '$125,000', fee: '$125', rebate: '$56.25', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$420k', rebate: '$1,960', originalRebate: '$1,960', status: '已发放', note: '' }]
        },
        helperUser('h_n3a', '0xNorm...L3a', '100803a', '华东-苏皖', 3, 42, '0xNorm...L2a', '0xNorm...L1', ['h_n4c']),
        helperUser('h_n3b', '0xNorm...L3b', '100803b', '华南-闽粤', 3, 40, '0xNorm...L2b', '0xNorm...L1', ['h_n4d']),
        helperUser('h_n3c', '0xNorm...L3c', '100803c', '华南-桂琼', 3, 38, '0xNorm...L2b', '0xNorm...L1', []),
        helperUser('h_n4a', '0xNorm...L4a', '100804a', '四级-A线', 4, 35, '0xNorm...L3', '0xNorm...L1', ['h_n5a']),
        helperUser('h_n4b', '0xNorm...L4b', '100804b', '四级-B线', 4, 33, '0xNorm...L3', '0xNorm...L1', ['h_n5b']),
        helperUser('h_n4c', '0xNorm...L4c', '100804c', '四级-C线', 4, 36, '0xNorm...L3a', '0xNorm...L1', []),
        helperUser('h_n4d', '0xNorm...L4d', '100804d', '四级-D线', 4, 34, '0xNorm...L3b', '0xNorm...L1', ['h_n5c']),
        helperUser('h_n5a', '0xNorm...L5a', '100805a', '五级-A1', 5, 28, '0xNorm...L4a', '0xNorm...L1', []),
        helperUser('h_n5b', '0xNorm...L5b', '100805b', '五级-B1', 5, 27, '0xNorm...L4b', '0xNorm...L1', []),
        helperUser('h_n5c', '0xNorm...L5c', '100805c', '五级-D1', 5, 26, '0xNorm...L4d', '0xNorm...L1', []),
        {
            id: 'p_a1', wallet: '0xAbn...L1', uid: '100811', note: '部分分支异常·一级返佣', level: 1, ratio: 68,
            parentWallet: null, rootWallet: '0xAbn...L1', operator: 'allen@forx.fi', bindTime: '2024-02-10',
            settleStatus: 'branch_abnormal', abnormalVol: '$128,000', abnormalLines: 1,
            vol: '$52.4M', deposit: '+$1.2M', usersTotal: 1420, usersActive: 420,
            net: '$312,400', netHint: '伞下净手续费 − 全部返佣',
            rebateTotal: '$12,840', rebateSelf: '$0.2k', rebateDirect: '$1.2k', rebateGap: '$11.6k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_a2a', 'h_a2b'],
            directClients: [{ time: '2024-05-18', wallet: '0x77...C3a1', vol: '$18,200', fee: '$18.20', rebate: '$12.37', status: '交易中' }],
            settlements: [
                { date: '2024-05-21', vol: '$0', rebate: '$0.00', originalRebate: null, status: '待修正返佣后计算', note: '异常分支' },
                { date: '2024-05-20', vol: '$3.8M', rebate: '$12,400', originalRebate: '$12,400', status: '已发放', note: '' }
            ]
        },
        helperUser('h_a2a', '0xAbn...L2a', '100812', '正常分支', 2, 50, '0xAbn...L1', '0xAbn...L1', ['h_a2a1', 'h_a2a2']),
        helperUser('h_a2a1', '0xAbn...L3a', '100812a', '正常分支-甲', 3, 46, '0xAbn...L2a', '0xAbn...L1', ['h_a4na']),
        helperUser('h_a2a2', '0xAbn...L3b', '100812b', '正常分支-乙', 3, 44, '0xAbn...L2a', '0xAbn...L1', ['h_a4nb', 'h_a4nc']),
        helperUser('h_a4na', '0xAbn...L4na', '100816a', '正常四级-甲', 4, 38, '0xAbn...L3a', '0xAbn...L1', []),
        helperUser('h_a4nb', '0xAbn...L4nb', '100816b', '正常四级-乙', 4, 36, '0xAbn...L3b', '0xAbn...L1', ['h_a5nb']),
        helperUser('h_a4nc', '0xAbn...L4nc', '100816c', '正常四级-丙', 4, 35, '0xAbn...L3b', '0xAbn...L1', []),
        helperUser('h_a5nb', '0xAbn...L5nb', '100817b', '正常五级-乙', 5, 30, '0xAbn...L4nb', '0xAbn...L1', []),
        {
            id: 'h_a2b', wallet: '0xAbn...L2b', uid: '100813', note: '异常分支入口', level: 2, ratio: 52,
            parentWallet: '0xAbn...L1', rootWallet: '0xAbn...L1', bindTime: '2024-03-08',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$4.1M', deposit: '+$95k', usersTotal: 180, usersActive: 48,
            net: '$19,200', netHint: '', rebateTotal: '$2,100', rebateSelf: '$0.08k', rebateDirect: '$0.4k', rebateGap: '$1.6k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['h_a3'],
            directClients: [], settlements: []
        },
        {
            id: 'h_a3', wallet: '0xAbn...L3', uid: '100814', note: '华南区', level: 3, ratio: 55,
            parentWallet: '0xAbn...L2b', rootWallet: '0xAbn...L1', bindTime: '2024-03-20',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$2.4M', deposit: '+$42k', usersTotal: 96, usersActive: 24,
            net: '$11,800', netHint: '', rebateTotal: '$1,450', rebateSelf: '$0.05k', rebateDirect: '$0.2k', rebateGap: '$1.2k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['p_a4'],
            directClients: [], settlements: []
        },
        {
            id: 'p_a4', wallet: '0xAbn...L4', uid: '100815', note: '部分分支异常·四级返佣', level: 4, ratio: 62,
            parentWallet: '0xAbn...L3', rootWallet: '0xAbn...L1', bindTime: '2024-04-01',
            settleStatus: 'branch_abnormal', abnormalVol: '$128,000', abnormalLines: 1,
            vol: '$1.6M', deposit: '+$28k', usersTotal: 48, usersActive: 12,
            net: '--', netHint: '比例倒挂，分支暂停',
            rebateTotal: '--', rebateSelf: '--', rebateDirect: '--', rebateGap: '--',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [],
            settlements: [{ date: '2024-05-21', vol: '$128k', rebate: '$0', originalRebate: null, status: '待修正返佣后计算', note: '比例倒挂' }]
        }
    ];

    const ABNORMAL_RECORDS = [
        {
            id: 'ap1', rootWallet: '0xAbn...L1',
            parentWallet: '0xAbn...L3', childWallet: '0xAbn...L4',
            parentRatio: 55, childRatio: 62, pausedVol: '$128,000', childUserId: 'p_a4'
        }
    ];

    const SETTLEMENT_BATCHES = [
        { date: '2024-05-23', vol: '$12,450,000', status: '等待对账', rejected: false },
        { date: '2024-05-22', vol: '$10,200,000', status: '已拒绝', rejected: true },
        { date: '2024-05-21', vol: '$9,800,000', status: '等待对账', rejected: false },
        { date: '2024-10-10', vol: '$8,600,000', status: '等待对账', rejected: false }
    ];

    const SETTLEMENT_BATCH_DETAILS = {
        '2024-05-23': [
            { id: 'sr1', wallet: '0xAbn...L1', uid: '100811', level: 1, ratio: 68, parentWallet: null, vol: '$1M', originalRebate: 6800, actualRebate: 6500, pendingFix: false, originalSettlementDate: '2024-05-23' },
            { id: 'sr2', wallet: '0xAbn...L4', uid: '100815', level: 4, ratio: 62, parentWallet: '0xAbn...L3', vol: '$128k', originalRebate: null, actualRebate: 0, pendingFix: true, originalSettlementDate: '2024-05-21', pendingFixNote: '当日停止结算，待修正返佣' },
            { id: 'sr3', wallet: '0xNorm...L1', uid: '100801', level: 1, ratio: 70, parentWallet: null, vol: '$2.1M', originalRebate: 4200, actualRebate: 4200, pendingFix: false, originalSettlementDate: '2024-05-23' }
        ],
        '2024-05-22': [
            { id: 'sr4', wallet: '0xNorm...L3', uid: '100803', level: 3, ratio: 45, parentWallet: '0xNorm...L2a', vol: '$800k', originalRebate: 1960, actualRebate: 1960, pendingFix: false, originalSettlementDate: '2024-05-22' }
        ],
        '2024-05-21': [
            { id: 'sr5', wallet: '0xAbn...L1', uid: '100811', level: 1, ratio: 68, parentWallet: null, vol: '$3.8M', originalRebate: 12400, actualRebate: 12400, pendingFix: false, originalSettlementDate: '2024-05-21' }
        ],
        '2024-10-10': [
            { id: 'sr6', wallet: '0xNorm...L1', uid: '100801', level: 1, ratio: 70, parentWallet: null, vol: '$1.8M', originalRebate: 3800, actualRebate: 3800, pendingFix: false, originalSettlementDate: '2024-10-10' },
            { id: 'sr7', wallet: '0xNorm...L3', uid: '100803', level: 3, ratio: 45, parentWallet: '0xNorm...L2a', vol: '$620k', originalRebate: 1520, actualRebate: 1500, pendingFix: false, originalSettlementDate: '2024-10-10' }
        ]
    };

    /** 修正返佣补发：补发执行日入账，关联原应结日 */
    const REBATE_SUPPLEMENT_FLOWS = [
        {
            id: 'sup1', payoutDate: '2024-05-23', wallet: '0xAbn...L4', uid: '100815',
            originalSettlementDate: '2024-05-21', originalRebate: 1920.00, amount: 1856.40,
            note: '5-21 比例倒挂停结，本日补发'
        },
        {
            id: 'sup2', payoutDate: '2024-10-10', wallet: '0xAbn...L4', uid: '100815',
            originalSettlementDate: '2024-10-01', originalRebate: 2400.00, amount: 2340.00,
            note: '10-01 待修正返佣后计算，10-10 修正后补发'
        },
        {
            id: 'sup3', payoutDate: '2024-10-10', wallet: '0xAbn...L1', uid: '100811',
            originalSettlementDate: '2024-10-01', originalRebate: 920.00, amount: 890.50,
            note: '异常分支修正后补发 10-01 暂停分支佣金'
        }
    ];

    /** 可迁移的普通用户（非合伙人树内） */
    const PLAIN_MIGRATE_USERS = [
        { wallet: '0xde...55aa', uid: '100990', note: '华东引流直客', directClients: [
            { wallet: '0x11...c1aa', uid: '100991' }, { wallet: '0x22...c2bb', uid: '100992' }, { wallet: '0x33...c3cc', uid: '100993' }
        ]}
    ];

    let currentSupplementEditId = null;
    let batchEditMode = 'detail';

    let currentUserId = null;
    let currentBatchDate = null;
    let batchEditRowIds = null;
    let settlementDetailTab = 'detail';
    let settlementDetailFilters = { partner: '', level: 'all', pendingFix: 'all', modified: 'all' };
    let supplementDetailFilters = { partner: '', originalDate: '' };
    let migrateState = { scenario: 'user', subjectKey: '', targetParent: '', newRatio: '', preview: null, inversionErrors: [] };
    let treeFocusId = null;
    let treeExpandedNodes = new Set();
    let treeHighlightId = null;
    let listFilterStatus = 'all';
    let listSearchQ = '';
    let pendingRatioChanges = [];
    let detailTableFilter = '';

    function getUser(id) { return USERS.find(function (u) { return u.id === id; }); }
    function getUserByWallet(w) { return USERS.find(function (u) { return u.wallet === w; }); }

    function getAncestorChain(u) {
        const chain = [];
        let w = u.parentWallet;
        while (w) {
            const p = getUserByWallet(w);
            if (!p) break;
            chain.unshift(p);
            w = p.parentWallet;
        }
        return chain;
    }

    function isDescendantOf(ancestorId, nodeId) {
        if (nodeId === ancestorId) return true;
        const node = getUser(nodeId);
        if (!node) return false;
        let w = node.parentWallet;
        while (w) {
            const p = getUserByWallet(w);
            if (!p) return false;
            if (p.id === ancestorId) return true;
            w = p.parentWallet;
        }
        return false;
    }

    function childOnPathToFocus(user, focusId) {
        return (user.childIds || []).find(function (cid) {
            return cid === focusId || isDescendantOf(cid, focusId);
        });
    }

    function settleLabel(s) {
        if (s === 'normal') return '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px]">正常结算</span>';
        if (s === 'branch_abnormal') return '<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold text-[10px]">部分分支异常</span>';
        return '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">待修正返佣后计算</span>';
    }

    function subPartnerRow(parent, child) {
        const gap = parent.ratio - child.ratio;
        return {
            time: child.bindTime, wallet: child.wallet, note: child.note, ratio: child.ratio,
            gap: gap, gapIncome: child.settleStatus !== 'normal' ? '-- 暂停结算' : '$1,250.00',
            vol: child.vol, deposit: child.deposit,
            users: child.usersTotal + ' / ' + child.usersActive,
            settle: child.settleStatus, abnormal: child.settleStatus !== 'normal'
        };
    }

    function getSubPartnerRows(u) {
        return (u.childIds || []).map(function (cid) {
            const c = getUser(cid);
            return c ? subPartnerRow(u, c) : null;
        }).filter(Boolean);
    }

    function matchesListFilter(u) {
        if (listFilterStatus === 'normal' && u.settleStatus !== 'normal') return false;
        if (listFilterStatus === 'abnormal' && u.settleStatus === 'normal') return false;
        if (!listSearchQ) return true;
        const q = listSearchQ.toLowerCase();
        return (u.wallet + u.uid + u.note).toLowerCase().indexOf(q) !== -1;
    }

    function renderPartnerList() {
        const tbody = document.getElementById('partner-list-body');
        if (!tbody) return;
        tbody.innerHTML = LIST_IDS.map(function (id) {
            const u = getUser(id);
            if (!u || !matchesListFilter(u)) return '';
            const childCount = (u.childIds || []).length;
            const netHtml = u.net === '--' ? '<span class="text-slate-400">--</span>' : '<span class="text-blue-600 font-black">' + u.net + '</span>';
            const av = u.abnormalVol === '--' ? '<span class="text-slate-300">--</span>' : '<span class="text-amber-700 font-bold">' + u.abnormalVol + '</span>';
            const al = u.abnormalLines ? '<span class="text-red-600 font-black">' + u.abnormalLines + '</span>' : '<span class="text-slate-300">0</span>';
            return '<tr class="hover:bg-slate-50' + (u.settleStatus !== 'normal' ? ' bg-amber-50/20' : '') + '">' +
                '<td class="px-4 py-3">' + chip(u.wallet, 'wallet') +
                '<span class="block mt-1">' + chip(u.uid, 'uid') + '</span>' +
                '<button type="button" onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="block mt-1 text-[10px] font-black text-blue-600 hover:underline">' + u.note + '</button></td>' +
                '<td class="px-3 py-3 text-center font-bold">L' + u.level + ' · ' + childCount + ' 直属</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.ratio + '%</td>' +
                '<td class="px-3 py-3 text-center">' + settleLabel(u.settleStatus) + '</td>' +
                '<td class="px-3 py-3 text-right">' + av + '</td>' +
                '<td class="px-3 py-3 text-center">' + al + '</td>' +
                '<td class="px-3 py-3 text-right font-bold">' + u.vol + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-green-600">' + u.deposit + '</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.usersTotal + ' <span class="text-slate-300">/ ' + u.usersActive + '</span></td>' +
                '<td class="px-3 py-3 text-right">' + netHtml + '</td>' +
                '<td class="px-3 py-3 text-slate-500">' + (u.level === 1 ? u.operator : '—') + '</td>' +
                '<td class="px-4 py-3 text-right space-x-2">' +
                '<button onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="text-slate-600 font-bold hover:underline">详情</button>' +
                '<button onclick="PartnerPortal.showTree(\'' + u.id + '\')" class="text-blue-600 font-bold hover:underline">返佣树</button>' +
                '</td></tr>';
        }).join('');
    }

    function renderNodeCard(u, opts) {
        opts = opts || {};
        const pending = pendingRatioChanges.find(function (c) { return c.wallet === u.wallet; });
        const displayRatio = pending ? pending.newRatio : u.ratio;
        const isAbn = u.settleStatus !== 'normal';
        const highlight = opts.highlight ? ' ring-2 ring-amber-400' : '';
        const border = isAbn ? 'border-red-300 bg-red-50/60' : 'border-slate-200 bg-white';
        const focusCls = opts.isFocus ? ' tree-focus-ring' : '';
        let html = '<div id="tree-node-' + u.id + '" class="flex items-center gap-3 p-3 rounded-lg border ' + border + focusCls + highlight + ' shadow-sm min-w-[280px]">';
        html += '<span class="text-[10px] font-bold text-slate-400">L' + u.level + '</span>';
        html += '<div class="flex-1 min-w-0"><p class="font-black text-[11px]">' + chip(u.wallet, 'wallet') + '</p><p class="text-[10px] text-slate-500 mt-0.5">' + chip(u.uid, 'uid') + ' · ' + u.note + '</p></div>';
        html += '<input type="number" id="ratio-input-' + u.id + '" value="' + displayRatio + '" class="w-14 border rounded px-1 py-1 text-center font-black text-blue-600 text-sm" onchange="PartnerPortal.stageRatioChange(\'' + u.id + '\')"><span class="text-slate-400 font-bold">%</span>';
        if (opts.isFocus) html += '<span class="text-[9px] font-black text-blue-600 uppercase">当前</span>';
        html += '</div>';
        return html;
    }

    function renderExpandToggle(userId, expanded, childCount) {
        return '<button type="button" class="tree-expand-btn" onclick="PartnerPortal.toggleTreeExpand(\'' + userId + '\')" title="' + childCount + ' 个直属下级" aria-label="展开下级">' + (expanded ? '−' : '+') + '</button>';
    }

    /** 上级链固定全展示；下级仅直接下级，点击 + 逐级展开 */
    function renderRebateTree(focusId) {
        const focus = getUser(focusId);
        if (!focus) return '';

        function renderLazyDown(parentId) {
            const parent = getUser(parentId);
            const childIds = parent.childIds || [];
            if (!childIds.length) return '';
            let h = '<div class="tree-children mt-2 space-y-2">';
            childIds.forEach(function (cid) { h += renderDownNode(cid); });
            h += '</div>';
            return h;
        }

        function renderDownNode(userId) {
            const u = getUser(userId);
            if (!u) return '';
            const childIds = u.childIds || [];
            const hasKids = childIds.length > 0;
            const expanded = treeExpandedNodes.has(userId);
            let h = '<div class="tree-node-down">';
            h += '<div class="flex items-start gap-1">';
            h += hasKids ? renderExpandToggle(userId, expanded, childIds.length) : '<span class="w-6 shrink-0"></span>';
            h += '<div class="flex-1">' + renderNodeCard(u, {
                isFocus: userId === focusId,
                highlight: userId === treeHighlightId
            }) + '</div>';
            h += '</div>';
            if (hasKids && expanded) h += renderLazyDown(userId);
            h += '</div>';
            return h;
        }

        function renderPathFromRoot(userId, depth) {
            const u = getUser(userId);
            if (!u) return '';
            const isFocus = userId === focusId;
            const wrapCls = depth > 0 ? 'tree-children mt-2' : '';
            let h = '<div class="' + wrapCls + '">';
            h += renderNodeCard(u, {
                isFocus: isFocus,
                highlight: userId === treeHighlightId
            });
            if (isFocus) {
                h += renderLazyDown(userId);
            } else {
                const pathChild = childOnPathToFocus(u, focusId);
                if (pathChild) h += renderPathFromRoot(pathChild, depth + 1);
            }
            h += '</div>';
            return h;
        }

        const ancestors = getAncestorChain(focus);
        const rootId = ancestors.length ? ancestors[0].id : focusId;
        return '<div class="space-y-2">' + renderPathFromRoot(rootId, 0) + '</div>';
    }

    function refreshTree() {
        const root = document.getElementById('rebate-tree-root');
        if (!root || !treeFocusId) return;
        root.innerHTML = renderRebateTree(treeFocusId);
        if (treeHighlightId) {
            const el = document.getElementById('tree-node-' + treeHighlightId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function toggleTreeExpand(userId) {
        if (treeExpandedNodes.has(userId)) treeExpandedNodes.delete(userId);
        else treeExpandedNodes.add(userId);
        refreshTree();
    }

    function renderPendingChangesBar() {
        const bar = document.getElementById('tree-pending-bar');
        if (!bar) return;
        if (!pendingRatioChanges.length) {
            bar.classList.add('hidden');
            bar.innerHTML = '';
            return;
        }
        bar.classList.remove('hidden');
        bar.innerHTML = '<div class="bg-slate-900 text-white rounded-lg p-4 flex flex-wrap justify-between gap-4 mb-4">' +
            '<div><p class="font-black text-sm">待提交修改 (' + pendingRatioChanges.length + ')</p>' +
            '<ul class="text-[10px] mt-2 space-y-1">' +
            pendingRatioChanges.map(function (c) {
                const tag = c.newRatio > OPS_CAP ? '<span class="text-amber-300">[需审批]</span>' : '<span class="text-green-300">[立即生效]</span>';
                return '<li>' + chip(c.wallet, 'wallet') + ' ' + c.oldRatio + '% → ' + c.newRatio + '% ' + tag + '</li>';
            }).join('') +
            '</ul></div>' +
            '<div class="flex gap-2">' +
            '<button onclick="PartnerPortal.clearPendingChanges()" class="px-4 py-2 border border-slate-600 rounded font-bold text-[11px]">清空</button>' +
            '<button onclick="PartnerPortal.openTreeConfirmModal()" class="px-6 py-2 bg-blue-600 rounded font-black text-[11px]">提交修改</button></div></div>';
    }

    function renderAbnormalSection(rootWallet) {
        const records = ABNORMAL_RECORDS.filter(function (r) {
            return !rootWallet || r.rootWallet === rootWallet;
        });
        if (!records.length) return '';
        let html = '<div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">' +
            '<p class="text-red-900 font-black text-sm mb-2">异常返佣线（比例倒挂）</p>' +
            '<table class="w-full text-[11px]"><thead class="text-[10px] uppercase text-red-400"><tr>' +
            '<th class="pb-2">下级</th><th class="pb-2">上级</th><th class="pb-2 text-right">暂停额</th><th class="pb-2 text-right">操作</th></tr></thead><tbody>';
        records.forEach(function (r) {
            html += '<tr class="border-t border-red-100"><td class="py-2 font-bold">' + chip(r.childWallet, 'wallet') + '</td>' +
                '<td class="py-2">' + chip(r.parentWallet, 'wallet') + '<span class="block text-[9px] text-red-500">' + r.parentRatio + '% &lt; ' + r.childRatio + '%</span></td>' +
                '<td class="py-2 text-right font-bold">' + r.pausedVol + '</td>' +
                '<td class="py-2 text-right"><button onclick="PartnerPortal.fixAbnormalRebate(\'' + r.id + '\')" class="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700">修正返佣</button></td></tr>';
        });
        html += '</tbody></table></div>';
        return html;
    }

    function showDetail(id) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        detailTableFilter = '';
        window.PartnerPortal_showPage('page-partner-detail');
        document.getElementById('detail-partner-title').textContent = u.note;
        document.getElementById('detail-partner-sub').innerHTML = chip(u.wallet, 'wallet') + ' · ' + chip(u.uid, 'uid') + ' · L' + u.level + ' · ' + u.ratio + '%';
        document.getElementById('detail-vol').textContent = u.vol;
        document.getElementById('detail-deposit').textContent = u.deposit;
        document.getElementById('detail-users').textContent = u.usersTotal + ' / ' + u.usersActive;
        document.getElementById('detail-net').textContent = u.net;
        document.getElementById('detail-net-hint').textContent = u.netHint || '';
        document.getElementById('detail-rebate-total').textContent = u.rebateTotal || '—';
        document.getElementById('detail-rebate-self').textContent = u.rebateSelf || '—';
        document.getElementById('detail-rebate-direct').textContent = u.rebateDirect || '—';
        document.getElementById('detail-rebate-gap').textContent = u.rebateGap || '—';
        document.getElementById('detail-active-subs').textContent = u.activeSubPartners + ' / ' + u.totalSubPartners;

        const banner = document.getElementById('detail-abnormal-banner');
        const abnEntry = document.getElementById('detail-abnormal-entry');
        const rootRecords = ABNORMAL_RECORDS.filter(function (r) { return r.rootWallet === u.rootWallet; });
        if (u.settleStatus !== 'normal' || rootRecords.length) {
            banner.classList.remove('hidden');
            document.getElementById('detail-abnormal-vol').textContent = u.abnormalVol;
            document.getElementById('detail-abnormal-lines').textContent = u.abnormalLines;
            document.getElementById('detail-abnormal-scope').textContent = '仅异常分支暂停结算，其他分支正常。';
            abnEntry.classList.toggle('hidden', !rootRecords.length);
        } else {
            banner.classList.add('hidden');
            abnEntry.classList.add('hidden');
        }

        renderDetailSubTable(u);
        renderDetailClientTable(u);
        renderDetailSettlements(u);
        switchDetailTab('subs');
    }

    function renderDetailSubTable(u) {
        const rows = getSubPartnerRows(u);
        const tbody = document.getElementById('detail-sub-partners');
        const q = detailTableFilter.toLowerCase();
        const filtered = rows.filter(function (r) {
            if (!q) return true;
            return (r.wallet + r.note).toLowerCase().indexOf(q) >= 0;
        });
        tbody.innerHTML = filtered.length ? filtered.map(function (r) {
            return '<tr class="' + (r.abnormal ? 'bg-red-50/40' : '') + '">' +
                '<td class="px-4 py-2 text-slate-400">' + r.time + '</td>' +
                '<td class="px-3 py-2">' + chip(r.wallet, 'wallet') + '<span class="block text-[10px] text-slate-400 mt-0.5">' + r.note + '</span></td>' +
                '<td class="px-3 py-2 text-center font-bold ' + (r.abnormal ? 'text-red-600' : '') + '">' + r.ratio + '%</td>' +
                '<td class="px-3 py-2 text-center"><span class="' + (r.gap < 0 ? 'text-red-600 font-black' : 'text-blue-600 font-bold') + '">' + r.gap + '%</span></td>' +
                '<td class="px-3 py-2 text-right font-black text-blue-600">' + r.gapIncome + '</td>' +
                '<td class="px-3 py-2 text-right">' + r.vol + '</td>' +
                '<td class="px-3 py-2 text-right">' + r.deposit + '</td>' +
                '<td class="px-3 py-2 text-center">' + r.users + '</td>' +
                '<td class="px-3 py-2 text-center">' + settleLabel(r.settle) + '</td></tr>';
        }).join('') : '<tr><td colspan="9" class="px-4 py-8 text-center text-slate-400">无直属下级合伙人</td></tr>';
    }

    function renderDetailClientTable(u) {
        const tbody = document.getElementById('detail-direct-clients');
        const clients = u.directClients || [];
        const q = detailTableFilter.toLowerCase();
        const filtered = clients.filter(function (c) { return !q || c.wallet.toLowerCase().indexOf(q) >= 0; });
        tbody.innerHTML = filtered.length ? filtered.map(function (c) {
            return '<tr><td class="px-4 py-2">' + c.time + '</td><td class="px-3 py-2">' + chip(c.wallet, 'wallet') + '</td>' +
                '<td class="px-3 py-2 text-right">' + c.vol + '</td><td class="px-3 py-2 text-right">' + c.fee + '</td>' +
                '<td class="px-3 py-2 text-right font-black text-blue-600">' + c.rebate + '</td>' +
                '<td class="px-3 py-2 text-center text-green-600 font-bold">' + c.status + '</td></tr>';
        }).join('') : '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400">暂无自邀直客</td></tr>';
    }

    function renderDetailSettlements(u) {
        const tbody = document.getElementById('detail-settlement-rows');
        const rows = u.settlements || [];
        tbody.innerHTML = rows.length ? rows.map(function (r) {
            const cls = r.status === '已发放' ? 'text-green-600' : (r.status === '补结算' ? 'text-blue-600' : 'text-amber-600');
            const origHtml = r.status === '待修正返佣后计算' || !r.originalRebate
                ? '<span class="text-amber-700 font-bold">待修正返佣后计算</span>'
                : '<span class="font-bold">' + r.originalRebate + '</span>';
            return '<tr><td class="px-4 py-2">' + r.date + '</td><td class="px-3 py-2 text-right">' + r.vol + '</td>' +
                '<td class="px-3 py-2 text-right font-bold">' + r.rebate + '</td>' +
                '<td class="px-3 py-2 text-right">' + origHtml + '</td>' +
                '<td class="px-3 py-2 text-center font-bold ' + cls + '">' + r.status + '</td>' +
                '<td class="px-4 py-2 text-slate-500">' + (r.note || '') + '</td></tr>';
        }).join('') : '<tr><td colspan="6" class="px-4 py-6 text-center text-slate-400">暂无结算记录</td></tr>';
    }

    function switchDetailTab(tab) {
        const subs = document.getElementById('detail-tab-subs');
        const clients = document.getElementById('detail-tab-clients');
        const tblSubs = document.getElementById('detail-table-subs');
        const tblClients = document.getElementById('detail-table-clients');
        if (tab === 'clients') {
            subs.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            clients.className = 'detail-tab-active pb-1 text-[11px]';
            tblSubs.classList.add('hidden');
            tblClients.classList.remove('hidden');
        } else {
            clients.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            subs.className = 'detail-tab-active pb-1 text-[11px]';
            tblClients.classList.add('hidden');
            tblSubs.classList.remove('hidden');
        }
    }

    function filterDetailTable(q) {
        detailTableFilter = q || '';
        const u = getUser(currentUserId);
        if (u) {
            renderDetailSubTable(u);
            renderDetailClientTable(u);
        }
    }

    function showTree(id) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        treeFocusId = id;
        treeHighlightId = null;
        treeExpandedNodes = new Set();
        window.PartnerPortal_showPage('page-rebate-tree');
        document.getElementById('tree-title').textContent = u.note + ' · 返佣树';
        const abnSec = document.getElementById('tree-abnormal-section');
        if (abnSec) abnSec.innerHTML = renderAbnormalSection(u.rootWallet);
        document.getElementById('rebate-tree-root').innerHTML = renderRebateTree(id);
        renderPendingChangesBar();
        if (location.hash.indexOf('rebate-tree') === -1) location.hash = 'rebate-tree';
    }

    function fixAbnormalRebate(recordId) {
        const record = ABNORMAL_RECORDS.find(function (r) { return r.id === recordId; });
        if (!record) return;
        const child = getUser(record.childUserId) || getUserByWallet(record.childWallet);
        if (!child) return;
        closeAbnormalModal();
        currentUserId = child.id;
        treeFocusId = child.id;
        treeHighlightId = child.id;
        treeExpandedNodes = new Set();
        getAncestorChain(child).forEach(function (a) {
            (a.childIds || []).forEach(function (cid) {
                if (cid === child.id || isDescendantOf(cid, child.id)) treeExpandedNodes.add(a.id);
            });
        });
        window.PartnerPortal_showPage('page-rebate-tree');
        document.getElementById('tree-title').textContent = child.note + ' · 修正返佣';
        const abnSec = document.getElementById('tree-abnormal-section');
        if (abnSec) abnSec.innerHTML = renderAbnormalSection(record.rootWallet);
        document.getElementById('rebate-tree-root').innerHTML = renderRebateTree(child.id);
        renderPendingChangesBar();
        location.hash = 'rebate-tree';
        setTimeout(function () {
            const el = document.getElementById('tree-node-' + child.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
    }

    function openAbnormalModal() {
        const u = getUser(currentUserId);
        document.getElementById('modal-abnormal-list-body').innerHTML = renderAbnormalSection(u ? u.rootWallet : null);
        document.getElementById('modal-abnormal-list').classList.remove('hidden');
    }

    function closeAbnormalModal() {
        document.getElementById('modal-abnormal-list').classList.add('hidden');
    }

    function showList() {
        currentUserId = null;
        window.PartnerPortal_showPage('page-agent-mgmt');
    }

    function setListFilter(status) {
        listFilterStatus = status;
        const sel = document.getElementById('list-status-select');
        if (sel) sel.value = status;
        renderPartnerList();
    }

    function applyListSearch(q) {
        listSearchQ = (q || '').trim();
        renderPartnerList();
    }

    function stageRatioChange(userId) {
        const u = getUser(userId);
        const input = document.getElementById('ratio-input-' + userId);
        if (!u || !input) return;
        const newRatio = parseFloat(input.value);
        if (!newRatio || newRatio <= 0) return;
        const idx = pendingRatioChanges.findIndex(function (c) { return c.wallet === u.wallet; });
        const entry = { wallet: u.wallet, oldRatio: u.ratio, newRatio: newRatio, userId: userId };
        if (idx >= 0) pendingRatioChanges[idx] = entry;
        else pendingRatioChanges.push(entry);
        if (newRatio < u.ratio && (u.childIds || []).length) {
            const names = u.childIds.map(function (cid) {
                const c = getUser(cid);
                return c ? c.wallet + '(' + c.ratio + '%)' : '';
            }).filter(Boolean).join('、');
            alert('下调提示：请确认直属下级级差 — ' + names);
        }
        renderPendingChangesBar();
    }

    function clearPendingChanges() {
        pendingRatioChanges = [];
        refreshTree();
        renderPendingChangesBar();
    }

    function openTreeConfirmModal() {
        if (!pendingRatioChanges.length) return;
        const body = document.getElementById('tree-confirm-body');
        if (!body) { submitPendingChanges(true); return; }
        const within = pendingRatioChanges.filter(function (c) { return c.newRatio <= OPS_CAP; });
        const exceed = pendingRatioChanges.filter(function (c) { return c.newRatio > OPS_CAP; });
        let html = '<ul class="text-[11px] space-y-2 mb-4">';
        pendingRatioChanges.forEach(function (c) {
            const tag = c.newRatio > OPS_CAP
                ? '<span class="text-amber-700 font-bold">超权限 · 提交审批</span>'
                : '<span class="text-green-700 font-bold">权限内 · 立即生效</span>';
            html += '<li class="border-b border-slate-100 pb-2">' + chip(c.wallet, 'wallet') + '：' + c.oldRatio + '% → <b>' + c.newRatio + '%</b> <span class="block text-[10px] mt-0.5">' + tag + '</span></li>';
        });
        html += '</ul>';
        if (within.length && exceed.length) {
            html += '<p class="text-[11px] text-slate-600 bg-blue-50 border border-blue-100 rounded p-3">' +
                '将拆分处理：<b>' + within.length + '</b> 项在运营权限内立即生效，<b>' + exceed.length + '</b> 项超上限走审批。</p>';
        } else if (exceed.length) {
            html += '<p class="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">全部修改均超过运营权限上限 ' + OPS_CAP + '%，提交后将进入审批流程。</p>';
        } else {
            html += '<p class="text-[11px] text-green-800 bg-green-50 border border-green-100 rounded p-3">全部修改在权限内，确认后将立即生效。</p>';
        }
        body.innerHTML = html;
        document.getElementById('modal-tree-confirm').classList.remove('hidden');
    }

    function closeTreeConfirmModal() {
        const modal = document.getElementById('modal-tree-confirm');
        if (modal) modal.classList.add('hidden');
    }

    function confirmTreeSubmit() {
        submitPendingChanges(true);
    }

    function submitPendingChanges(skipModal) {
        if (!pendingRatioChanges.length) return;
        if (!skipModal) {
            openTreeConfirmModal();
            return;
        }
        closeTreeConfirmModal();
        const within = pendingRatioChanges.filter(function (c) { return c.newRatio <= OPS_CAP; });
        const exceed = pendingRatioChanges.filter(function (c) { return c.newRatio > OPS_CAP; });
        if (within.some(function (c) { return c.newRatio < c.oldRatio; }) &&
            !confirm('含下调比例，可能触发分支异常。确认继续？')) return;

        within.forEach(function (c) {
            const u = getUser(c.userId);
            if (u) u.ratio = c.newRatio;
        });

        if (exceed.length && typeof submitApprovalApplication === 'function') {
            exceed.forEach(function (c) {
                submitApprovalApplication({
                    type: 'partner_ratio_change',
                    title: '合伙人返佣比例调整',
                    applicant: 'Mkt_Allen',
                    remark: c.wallet + ' ' + c.oldRatio + '% → ' + c.newRatio + '%（超运营上限）',
                    summary: chip(c.wallet, 'wallet') + ' ' + c.oldRatio + '% → ' + c.newRatio + '%',
                    payload: { wallet: c.wallet, oldRatio: c.oldRatio, newRatio: c.newRatio, opsCap: OPS_CAP }
                });
            });
        }

        let msg = '';
        if (within.length) msg += within.length + ' 项已立即生效。';
        if (exceed.length) msg += exceed.length + ' 项已提交审批。';
        alert(msg || '已提交');
        pendingRatioChanges = [];
        refreshTree();
        renderPendingChangesBar();
        if (currentUserId) {
            const u = getUser(currentUserId);
            if (u && document.getElementById('page-partner-detail') && !document.getElementById('page-partner-detail').classList.contains('hidden')) {
                showDetail(currentUserId);
            }
        }
    }

    function openBindModal() {
        document.getElementById('bind-wallet').value = '';
        document.getElementById('bind-ratio').value = '';
        document.getElementById('bind-remark').value = '';
        document.getElementById('bind-cap-hint').textContent = '配置上限 ' + OPS_CAP + '%；超过须风控+老板审批';
        document.getElementById('modal-bind-partner').classList.remove('hidden');
    }

    function closeBindModal() { document.getElementById('modal-bind-partner').classList.add('hidden'); }

    function submitBindPartner() {
        const walletInput = document.getElementById('bind-wallet').value.trim();
        const ratio = parseFloat(document.getElementById('bind-ratio').value);
        const remark = document.getElementById('bind-remark').value.trim();
        if (!walletInput || !ratio || !remark) { alert('请填写完整信息'); return; }
        const isUid = /^\d+$/.test(walletInput);
        const uid = isUid ? walletInput : '';
        const wallet = isUid ? '—' : walletInput;
        const exceedsCap = ratio > OPS_CAP;
        if (exceedsCap && typeof submitApprovalApplication === 'function') {
            submitApprovalApplication({
                type: 'partner_l1_bind', title: '一级合伙人绑定', applicant: 'Mkt_Allen', remark: remark,
                summary: (uid ? 'UID ' + uid + ' · ' : wallet + ' · ') + ratio + '%',
                payload: { uid: uid || '—', wallet: wallet, ratio: ratio, opsCap: OPS_CAP, exceedsCap: exceedsCap }
            });
            alert('已提交审批');
        } else {
            alert('绑定成功（演示）');
        }
        closeBindModal();
    }

    function getBatchRows(date) {
        return SETTLEMENT_BATCH_DETAILS[date] || [];
    }

    function getSupplementsForBatch(date) {
        return REBATE_SUPPLEMENT_FLOWS.filter(function (f) { return f.payoutDate === date; });
    }

    function getSupplementTotalForBatch(date) {
        return getSupplementsForBatch(date).reduce(function (s, f) { return s + f.amount; }, 0);
    }

    function getTodayPayoutForBatch(date) {
        return getBatchRows(date).filter(function (r) { return !r.pendingFix; }).reduce(function (s, r) { return s + (r.actualRebate || 0); }, 0);
    }

    function enrichBatch(b) {
        const supplement = getSupplementTotalForBatch(b.date);
        const today = getTodayPayoutForBatch(b.date);
        return {
            date: b.date, vol: b.vol, status: b.status, rejected: b.rejected,
            supplementPayout: supplement, todayPayout: today, totalPayout: supplement + today
        };
    }

    function isRowModified(r) {
        if (r.pendingFix) return false;
        return r.actualRebate != r.originalRebate;
    }

    function matchPartnerQuery(row, q) {
        if (!q) return true;
        const s = q.toLowerCase();
        return row.wallet.toLowerCase().indexOf(s) >= 0 || String(row.uid).indexOf(s) >= 0;
    }

    function findBatchRowByWalletOrUid(key) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return null;
        const rows = getBatchRows(currentBatchDate);
        return rows.find(function (r) {
            return r.wallet.toLowerCase() === q || r.uid === key.trim() ||
                r.wallet.toLowerCase().indexOf(q) >= 0 || q.indexOf(r.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function switchSettlementDetailTab(tab) {
        settlementDetailTab = tab;
        const tabDetail = document.getElementById('settlement-tab-detail');
        const tabSup = document.getElementById('settlement-tab-supplement');
        const filtersDetail = document.getElementById('settlement-detail-filters');
        const filtersSup = document.getElementById('settlement-supplement-filters');
        const wrapDetail = document.getElementById('settlement-table-wrap');
        const wrapSup = document.getElementById('settlement-supplement-table-wrap');
        if (tabDetail) tabDetail.className = tab === 'detail' ? 'settlement-tab-active pb-2 text-[11px] font-black' : 'text-slate-400 font-bold pb-2 text-[11px]';
        if (tabSup) tabSup.className = tab === 'supplement' ? 'settlement-tab-active pb-2 text-[11px] font-black' : 'text-slate-400 font-bold pb-2 text-[11px]';
        if (filtersDetail) filtersDetail.classList.toggle('hidden', tab !== 'detail');
        if (filtersSup) filtersSup.classList.toggle('hidden', tab !== 'supplement');
        if (wrapDetail) wrapDetail.classList.toggle('hidden', tab !== 'detail');
        if (wrapSup) wrapSup.classList.toggle('hidden', tab !== 'supplement');
        if (tab === 'detail') renderSettlementDetailRows();
        else renderSettlementSupplementRows();
    }

    function applySettlementDetailFilters() {
        settlementDetailFilters.partner = (document.getElementById('settlement-filter-partner') && document.getElementById('settlement-filter-partner').value || '').trim();
        settlementDetailFilters.level = document.getElementById('settlement-filter-level') ? document.getElementById('settlement-filter-level').value : 'all';
        settlementDetailFilters.pendingFix = document.getElementById('settlement-filter-pending') ? document.getElementById('settlement-filter-pending').value : 'all';
        settlementDetailFilters.modified = document.getElementById('settlement-filter-modified') ? document.getElementById('settlement-filter-modified').value : 'all';
        renderSettlementDetailRows();
    }

    function applySupplementDetailFilters() {
        supplementDetailFilters.partner = (document.getElementById('supplement-filter-partner') && document.getElementById('supplement-filter-partner').value || '').trim();
        supplementDetailFilters.originalDate = (document.getElementById('supplement-filter-original-date') && document.getElementById('supplement-filter-original-date').value || '').trim();
        renderSettlementSupplementRows();
    }

    function resetSettlementDetailFilters() {
        settlementDetailFilters = { partner: '', level: 'all', pendingFix: 'all', modified: 'all' };
        const p = document.getElementById('settlement-filter-partner');
        if (p) p.value = '';
        const l = document.getElementById('settlement-filter-level');
        if (l) l.value = 'all';
        const pf = document.getElementById('settlement-filter-pending');
        if (pf) pf.value = 'all';
        const m = document.getElementById('settlement-filter-modified');
        if (m) m.value = 'all';
        renderSettlementDetailRows();
    }

    function resetSupplementDetailFilters() {
        supplementDetailFilters = { partner: '', originalDate: '' };
        const p = document.getElementById('supplement-filter-partner');
        if (p) p.value = '';
        const d = document.getElementById('supplement-filter-original-date');
        if (d) d.value = '';
        renderSettlementSupplementRows();
    }

    function renderSettlementDetailRows() {
        const tbody = document.getElementById('settlement-detail-body');
        if (!tbody || !currentBatchDate) return;
        const rows = getBatchRows(currentBatchDate).filter(function (r) {
            if (!matchPartnerQuery(r, settlementDetailFilters.partner)) return false;
            if (settlementDetailFilters.level !== 'all' && String(r.level) !== settlementDetailFilters.level) return false;
            if (settlementDetailFilters.pendingFix === 'yes' && !r.pendingFix) return false;
            if (settlementDetailFilters.pendingFix === 'no' && r.pendingFix) return false;
            if (settlementDetailFilters.modified === 'yes' && !isRowModified(r)) return false;
            if (settlementDetailFilters.modified === 'no' && isRowModified(r)) return false;
            return true;
        });
        tbody.innerHTML = rows.length ? rows.map(function (r) {
            const parentCell = r.parentWallet ? chip(r.parentWallet, 'wallet') : '<span class="text-slate-500">一级</span>';
            const origCell = r.pendingFix
                ? '<span class="text-amber-700 font-bold">待修正返佣后计算</span><span class="block text-[9px] text-amber-600 mt-0.5">原应结日 ' + (r.originalSettlementDate || '—') + '</span>'
                : '<span class="font-bold">' + fmtMoney(r.originalRebate) + '</span>';
            const actualCell = r.pendingFix
                ? '<span class="text-slate-400">$0.00</span>'
                : '<span class="text-blue-600 font-black">' + fmtMoney(r.actualRebate) + '</span>' +
                (isRowModified(r) ? '<span class="block text-[9px] text-orange-600 font-bold mt-0.5">已调减</span>' : '');
            const editBtn = r.pendingFix
                ? '<span class="text-[10px] text-slate-400">不可修改</span>'
                : '<button type="button" onclick="PartnerPortal.openEditActual(\'' + r.id + '\')" class="text-blue-600 font-bold hover:underline text-[10px]">修改</button>';
            return '<tr class="' + (r.pendingFix ? 'bg-amber-50/40' : 'hover:bg-slate-50') + '">' +
                '<td class="px-4 py-4"><div class="font-bold">' + chip(r.wallet, 'wallet') + '</div><div class="mt-1">' + chip(r.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-4 text-center font-bold">L' + r.level + '</td>' +
                '<td class="px-4 py-4 text-center font-black">' + r.ratio + '%</td>' +
                '<td class="px-4 py-4 text-center">' + parentCell + '</td>' +
                '<td class="px-4 py-4 text-center">' + (r.pendingFix ? '<span class="text-amber-700 font-bold text-[10px]">是</span>' : '<span class="text-slate-500">否</span>') + '</td>' +
                '<td class="px-4 py-4 text-right font-bold">' + r.vol + '</td>' +
                '<td class="px-4 py-4 text-right">' + origCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + actualCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + editBtn + '</td></tr>';
        }).join('') : '<tr><td colspan="9" class="px-4 py-8 text-center text-slate-400">无匹配记录</td></tr>';
    }

    function renderSettlementSupplementRows() {
        const tbody = document.getElementById('settlement-supplement-body');
        if (!tbody || !currentBatchDate) return;
        const rows = getSupplementsForBatch(currentBatchDate).filter(function (f) {
            if (!matchPartnerQuery(f, supplementDetailFilters.partner)) return false;
            if (supplementDetailFilters.originalDate && f.originalSettlementDate.indexOf(supplementDetailFilters.originalDate) === -1) return false;
            return true;
        });
        tbody.innerHTML = rows.length ? rows.map(function (f) {
            const modTag = f.amount < f.originalRebate ? '<span class="block text-[9px] text-orange-600 font-bold mt-0.5">已调减</span>' : '';
            return '<tr class="hover:bg-slate-50">' +
                '<td class="px-4 py-3"><div>' + chip(f.wallet, 'wallet') + '</div><div class="mt-1">' + chip(f.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-3 font-bold text-amber-800">' + f.originalSettlementDate + '</td>' +
                '<td class="px-4 py-3 text-right font-bold">' + fmtMoney(f.originalRebate) + '</td>' +
                '<td class="px-4 py-3 text-right font-black text-blue-600">' + fmtMoney(f.amount) + modTag + '</td>' +
                '<td class="px-4 py-3 text-right"><button type="button" onclick="PartnerPortal.openEditSupplement(\'' + f.id + '\')" class="text-blue-600 font-bold hover:underline text-[10px]">修改</button></td></tr>';
        }).join('') : '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">本日无修正返佣补发流水</td></tr>';
    }

    function findSupplementById(id) {
        return REBATE_SUPPLEMENT_FLOWS.find(function (f) { return f.id === id; });
    }

    function findSupplementByMatch(walletOrUid, originalDate) {
        const q = (walletOrUid || '').trim().toLowerCase();
        const d = (originalDate || '').trim();
        return REBATE_SUPPLEMENT_FLOWS.find(function (f) {
            if (f.payoutDate !== currentBatchDate) return false;
            if (f.originalSettlementDate !== d) return false;
            return f.wallet.toLowerCase().indexOf(q) >= 0 || f.uid === walletOrUid.trim() ||
                q.indexOf(f.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function openEditSupplement(id) {
        const f = findSupplementById(id);
        if (!f) return;
        currentSupplementEditId = id;
        document.getElementById('edit-supplement-title').textContent = '修改补发佣金';
        document.getElementById('edit-supplement-hint').innerHTML = '合伙人 ' + f.wallet + ' · 原应结日 <b>' + f.originalSettlementDate + '</b> · 原始返佣 ' + fmtMoney(f.originalRebate);
        document.getElementById('edit-supplement-input').value = f.amount;
        document.getElementById('edit-supplement-input').max = f.originalRebate;
        document.getElementById('modal-edit-supplement').classList.remove('hidden');
    }

    function closeEditSupplementModal() {
        document.getElementById('modal-edit-supplement').classList.add('hidden');
        currentSupplementEditId = null;
    }

    function saveEditSupplement() {
        if (!currentSupplementEditId) return;
        const f = findSupplementById(currentSupplementEditId);
        if (!f) return;
        const val = parseFloat(document.getElementById('edit-supplement-input').value);
        if (isNaN(val) || val < 0) { alert('请输入有效金额'); return; }
        if (val > f.originalRebate) { alert('补发佣金不能高于原始返佣 ' + fmtMoney(f.originalRebate)); return; }
        f.amount = val;
        closeEditSupplementModal();
        renderSettlementSupplementRows();
        filterSettlementBatches();
        alert('补发佣金已更新（演示）');
    }

    function openBatchEditPage(mode) {
        if (!currentBatchDate) return;
        batchEditMode = mode || 'detail';
        document.getElementById('view-review-detail').classList.add('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.remove('hidden');
        const title = document.getElementById('batch-edit-title');
        const hint = document.getElementById('batch-edit-hint');
        const lines = document.getElementById('batch-edit-lines');
        if (batchEditMode === 'supplement') {
            if (title) title.textContent = '批量修改补发佣金 · ' + currentBatchDate;
            if (hint) hint.innerHTML = '每行：<strong>钱包或UID,原应结日,补发金额</strong>。补发不得高于原始返佣。匹配字段含原应结日。';
            if (lines) lines.placeholder = '0xAbn...L4,2024-05-21,1856.40\n100815,2024-10-01,2300';
        } else {
            if (title) title.textContent = '批量修改批次实发佣金 · ' + currentBatchDate;
            if (hint) hint.innerHTML = '每行：<strong>钱包或UID,实发金额</strong>。实发不得高于原始佣金；待修正返佣后计算不可修改。';
            if (lines) lines.placeholder = '0xAbn...L1,6500\n100801,4200';
        }
        if (lines) lines.value = '';
        const results = document.getElementById('batch-edit-results');
        if (results) results.innerHTML = '';
        const file = document.getElementById('batch-edit-file');
        if (file) file.value = '';
    }

    function initSettlementDatePickers() {
        if (typeof flatpickr === 'undefined') return;
        const opts = { dateFormat: 'Y-m-d', allowInput: true };
        const batchDate = document.getElementById('settlement-filter-date');
        if (batchDate && !batchDate._flatpickr) {
            flatpickr(batchDate, Object.assign({}, opts, { onChange: function () { filterSettlementBatches(); } }));
        }
        const origDate = document.getElementById('supplement-filter-original-date');
        if (origDate && !origDate._flatpickr) {
            flatpickr(origDate, Object.assign({}, opts, { onChange: function () { applySupplementDetailFilters(); } }));
        }
    }

    function setSettlementListView(inDetail) {
        const filterSec = document.getElementById('settlement-filter-section');
        if (filterSec) filterSec.classList.toggle('hidden', inDetail);
    }

    function closeBatchEditPage() {
        document.getElementById('view-batch-edit-actual').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
    }

    function renderBatchEditResults(results) {
        const el = document.getElementById('batch-edit-results');
        if (!el) return;
        const ok = results.filter(function (r) { return r.status === 'ok'; }).length;
        const fail = results.length - ok;
        let html = '<div class="px-4 py-3 border-b bg-slate-50 text-[11px]"><span class="font-bold text-green-700">成功 ' + ok + '</span> · <span class="font-bold text-red-600">失败 ' + fail + '</span></div>';
        html += '<table class="w-full text-left text-[11px]"><thead class="bg-slate-50 border-b text-[10px] uppercase text-slate-400"><tr>' +
            '<th class="px-4 py-2">匹配项</th><th class="px-4 py-2 text-right">请求金额</th><th class="px-4 py-2 text-center">结果</th><th class="px-4 py-2">说明</th></tr></thead><tbody>';
        results.forEach(function (r) {
            const stCls = r.status === 'ok' ? 'text-green-700' : 'text-red-600';
            html += '<tr class="border-t"><td class="px-4 py-2 font-mono">' + r.key + '</td><td class="px-4 py-2 text-right font-bold">' + (isNaN(r.amount) ? '—' : fmtMoney(r.amount)) + '</td>' +
                '<td class="px-4 py-2 text-center font-black ' + stCls + '">' + (r.status === 'ok' ? '成功' : '失败') + '</td>' +
                '<td class="px-4 py-2 text-slate-600">' + r.reason + '</td></tr>';
        });
        html += '</tbody></table>';
        el.innerHTML = html;
    }

    function parseBatchEditLines(text, mode) {
        const lines = (text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
        const entries = [];
        lines.forEach(function (line, idx) {
            const parts = line.split(/[,;\t]/).map(function (p) { return p.trim(); });
            if (mode === 'supplement') {
                if (parts.length < 3) {
                    entries.push({ line: idx + 1, raw: line, error: '格式错误，需：钱包或UID,原应结日,补发金额' });
                    return;
                }
                const amount = parseFloat(parts[parts.length - 1].replace(/[$,]/g, ''));
                const originalDate = parts[parts.length - 2];
                const key = parts.slice(0, parts.length - 2).join(',').trim();
                entries.push({ line: idx + 1, key: key, originalDate: originalDate, amount: amount });
            } else {
                if (parts.length < 2) {
                    entries.push({ line: idx + 1, key: line, amount: NaN, error: '格式错误，需：钱包或UID,实发金额' });
                    return;
                }
                const amount = parseFloat(parts[parts.length - 1].replace(/[$,]/g, ''));
                const key = parts.slice(0, parts.length - 1).join(',').trim();
                entries.push({ line: idx + 1, key: key, amount: amount });
            }
        });
        return entries;
    }

    function applyBatchEditEntries(entries, mode) {
        const results = [];
        entries.forEach(function (e) {
            if (e.error) {
                results.push({ key: e.raw || e.key || '', amount: e.amount, status: 'fail', reason: e.error });
                return;
            }
            if (isNaN(e.amount) || e.amount < 0) {
                results.push({ key: e.key, amount: e.amount, status: 'fail', reason: '金额无效' });
                return;
            }
            if (mode === 'supplement') {
                const f = findSupplementByMatch(e.key, e.originalDate);
                if (!f) {
                    results.push({ key: e.key + ' · ' + e.originalDate, amount: e.amount, status: 'fail', reason: '未找到本日补发记录（检查原应结日）' });
                    return;
                }
                if (e.amount > f.originalRebate) {
                    results.push({ key: f.wallet + ' · ' + f.originalSettlementDate, amount: e.amount, status: 'fail', reason: '高于原始返佣 ' + fmtMoney(f.originalRebate) });
                    return;
                }
                f.amount = e.amount;
                results.push({ key: f.wallet + ' · ' + f.originalSettlementDate, amount: e.amount, status: 'ok', reason: '已更新' });
            } else {
                const row = findBatchRowByWalletOrUid(e.key);
                if (!row) {
                    results.push({ key: e.key, amount: e.amount, status: 'fail', reason: '未找到本批次合伙人' });
                    return;
                }
                if (row.pendingFix) {
                    results.push({ key: e.key, amount: e.amount, status: 'fail', reason: '待修正返佣后计算，不可修改' });
                    return;
                }
                if (e.amount > row.originalRebate) {
                    results.push({ key: row.wallet, amount: e.amount, status: 'fail', reason: '高于原始佣金 ' + fmtMoney(row.originalRebate) });
                    return;
                }
                row.actualRebate = e.amount;
                results.push({ key: row.wallet + ' / ' + row.uid, amount: e.amount, status: 'ok', reason: '已更新' });
            }
        });
        return results;
    }

    function submitBatchEditLines() {
        const text = document.getElementById('batch-edit-lines') ? document.getElementById('batch-edit-lines').value : '';
        const entries = parseBatchEditLines(text, batchEditMode);
        if (!entries.length) { alert('请输入或上传修改数据'); return; }
        const results = applyBatchEditEntries(entries, batchEditMode);
        renderBatchEditResults(results);
        if (batchEditMode === 'supplement') {
            renderSettlementSupplementRows();
        } else {
            renderSettlementDetailRows();
        }
        filterSettlementBatches();
    }

    function handleBatchEditFile(input) {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        const mode = batchEditMode;
        reader.onload = function (ev) {
            const text = ev.target.result || '';
            const linesEl = document.getElementById('batch-edit-lines');
            if (linesEl) linesEl.value = text;
            const entries = parseBatchEditLines(text, mode);
            const results = applyBatchEditEntries(entries, mode);
            renderBatchEditResults(results);
            if (mode === 'supplement') renderSettlementSupplementRows();
            else renderSettlementDetailRows();
            filterSettlementBatches();
        };
        reader.readAsText(file);
    }

    function openEditActual(rowId) {
        const rows = getBatchRows(currentBatchDate);
        const row = rows.find(function (r) { return r.id === rowId; });
        if (!row || row.pendingFix) return;
        batchEditRowIds = [rowId];
        document.getElementById('edit-actual-title').textContent = '修改实发佣金';
        document.getElementById('edit-actual-hint').textContent = '原始佣金 ' + fmtMoney(row.originalRebate) + '，实发不得高于原始佣金。';
        document.getElementById('edit-actual-input').value = row.actualRebate;
        document.getElementById('edit-actual-input').max = row.originalRebate;
        document.getElementById('modal-edit-actual').classList.remove('hidden');
    }

    function closeEditActualModal() {
        document.getElementById('modal-edit-actual').classList.add('hidden');
        batchEditRowIds = null;
    }

    function saveEditActual() {
        if (!batchEditRowIds || !currentBatchDate) return;
        const val = parseFloat(document.getElementById('edit-actual-input').value);
        if (isNaN(val) || val < 0) { alert('请输入有效金额'); return; }
        const rows = getBatchRows(currentBatchDate);
        const targets = rows.filter(function (r) { return batchEditRowIds.indexOf(r.id) >= 0 && !r.pendingFix; });
        if (!targets.length) return;

        if (batchEditRowIds.length === 1) {
            const row = targets[0];
            if (val > row.originalRebate) { alert('实发佣金不能高于原始佣金 ' + fmtMoney(row.originalRebate)); return; }
            row.actualRebate = val;
        } else {
            targets.forEach(function (row) {
                const capped = Math.min(val, row.originalRebate);
                row.actualRebate = capped;
            });
        }
        closeEditActualModal();
        renderSettlementDetailRows();
        filterSettlementBatches();
        alert('实发佣金已更新（演示）');
    }

    function filterSettlementBatches() {
        const q = (document.getElementById('settlement-filter-date').value || '').trim();
        const st = document.getElementById('settlement-filter-status').value;
        const tbody = document.getElementById('settlement-batch-body');
        if (!tbody) return;
        tbody.innerHTML = SETTLEMENT_BATCHES.filter(function (b) {
            if (st !== 'all' && b.status !== st) return false;
            if (q && b.date.indexOf(q) === -1) return false;
            return true;
        }).map(function (b) {
            const e = enrichBatch(b);
            const stCls = b.rejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
            return '<tr class="hover:bg-slate-50' + (b.rejected ? ' bg-red-50/20' : '') + '">' +
                '<td class="px-4 py-4 font-black">' + e.date + '</td>' +
                '<td class="px-4 py-4 text-right font-bold">' + e.vol + '</td>' +
                '<td class="px-4 py-4 text-right font-bold text-amber-800">' + fmtMoney(e.supplementPayout) + '</td>' +
                '<td class="px-4 py-4 text-right font-black text-blue-600">' + fmtMoney(e.todayPayout) + '</td>' +
                '<td class="px-4 py-4 text-right font-black text-slate-900">' + fmtMoney(e.totalPayout) + '</td>' +
                '<td class="px-4 py-4 text-center"><span class="' + stCls + ' px-3 py-1 rounded-full text-[10px]">' + e.status + '</span></td>' +
                '<td class="px-4 py-4 text-right"><button type="button" onclick="PartnerPortal.showReviewDetail(\'' + e.date + '\', ' + (b.rejected ? 'true' : 'false') + ')" class="bg-slate-900 text-white px-4 py-1.5 rounded font-black uppercase text-[10px]">' + (b.rejected ? '查看原因' : '查看详情') + '</button></td></tr>';
        }).join('');
    }

    function showReviewDetail(batchDate, isRejected) {
        currentBatchDate = batchDate || SETTLEMENT_BATCHES[0].date;
        settlementDetailTab = 'detail';
        settlementDetailFilters = { partner: '', level: 'all', pendingFix: 'all', modified: 'all' };
        supplementDetailFilters = { partner: '', originalDate: '' };
        setSettlementListView(true);
        document.getElementById('view-batch-list').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.add('hidden');
        document.getElementById('reject-banner').classList.toggle('hidden', isRejected !== true && isRejected !== 'true');
        const titleEl = document.getElementById('detail-title');
        if (titleEl) titleEl.textContent = '结算批次明细 · ' + currentBatchDate;
        switchSettlementDetailTab('detail');
        resetSettlementDetailFilters();
        resetSupplementDetailFilters();
        setTimeout(function () { initSettlementDatePickers(); }, 50);
    }

    function backToSettlementList() {
        currentBatchDate = null;
        setSettlementListView(false);
        document.getElementById('view-review-detail').classList.add('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.add('hidden');
        document.getElementById('view-batch-list').classList.remove('hidden');
        filterSettlementBatches();
    }

    function applyHashTree() {
        const hash = (location.hash || '').replace('#', '');
        if (hash.indexOf('rebate-tree') === 0 && (currentUserId || treeFocusId)) {
            showTree(currentUserId || treeFocusId);
        }
    }

    function findUserByWalletOrUid(key) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return null;
        return USERS.find(function (u) {
            return u.wallet.toLowerCase() === q || String(u.uid) === key.trim() ||
                u.wallet.toLowerCase().indexOf(q) >= 0 || q.indexOf(u.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function findPlainMigrateUser(key) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return null;
        return PLAIN_MIGRATE_USERS.find(function (p) {
            return p.wallet.toLowerCase() === q || String(p.uid) === key.trim() ||
                p.wallet.toLowerCase().indexOf(q) >= 0;
        });
    }

    function collectPartnerSubtree(userId) {
        const result = [];
        function walk(id) {
            const u = getUser(id);
            if (!u) return;
            result.push(u);
            (u.childIds || []).forEach(walk);
        }
        walk(userId);
        return result;
    }

    function collectDirectClientsForPartner(userId) {
        const clients = [];
        collectPartnerSubtree(userId).forEach(function (u) {
            (u.directClients || []).forEach(function (c) { clients.push({ owner: u.wallet, wallet: c.wallet, uid: c.uid || '' }); });
        });
        return clients;
    }

    function checkSubtreeInversion(rootId, rootRatio, errors, parentLabel) {
        const u = getUser(rootId);
        if (!u) return;
        (u.childIds || []).forEach(function (cid) {
            const c = getUser(cid);
            if (!c) return;
            if (c.ratio >= rootRatio) {
                errors.push('下级 ' + c.wallet + ' (' + c.ratio + '%) 不低于上级 ' + (parentLabel || u.wallet) + ' (' + rootRatio + '%) — 返佣倒挂');
            }
            checkSubtreeInversion(cid, c.ratio, errors, c.wallet);
        });
    }

    function checkMigrateInversion() {
        const errors = [];
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        const target = findUserByWalletOrUid(targetKey);
        if (!targetKey) {
            errors.push('请填写目标上级合伙人');
            return errors;
        }
        if (!target) {
            errors.push('未找到目标上级合伙人：' + targetKey);
            return errors;
        }
        if (isNaN(ratioVal) || ratioVal <= 0) {
            errors.push('请填写有效的返佣比例');
            return errors;
        }
        if (ratioVal > target.ratio) {
            errors.push('迁移用户比例 ' + ratioVal + '% 高于上级 ' + target.wallet + ' 的 ' + target.ratio + '%');
        }
        if (ratioVal > OPS_CAP) {
            errors.push('返佣比例超过运营权限上限 ' + OPS_CAP + '%');
        }
        const preview = migrateState.preview;
        if (!preview) return errors;
        if (preview.scenario === 'partner' && preview.partnerUser) {
            if (isDescendantOf(preview.partnerUser.id, target.id) || preview.partnerUser.id === target.id) {
                errors.push('不能迁移到自身或自己的下级之下');
            }
            checkSubtreeInversion(preview.partnerUser.id, ratioVal, errors, preview.partnerUser.wallet);
        }
        return errors;
    }

    function renderMigrateScenarioButtons() {
        const btnUser = document.getElementById('migrate-scenario-user');
        const btnPartner = document.getElementById('migrate-scenario-partner');
        const active = 'px-4 py-2 rounded font-bold text-[11px] border-2 border-blue-600 bg-blue-50 text-blue-700';
        const inactive = 'px-4 py-2 rounded font-bold text-[11px] border border-slate-200 text-slate-600';
        if (btnUser) btnUser.className = migrateState.scenario === 'user' ? active : inactive;
        if (btnPartner) btnPartner.className = migrateState.scenario === 'partner' ? active : inactive;
    }

    function showMigratePage() {
        migrateState = { scenario: 'user', subjectKey: '', targetParent: '', newRatio: '', preview: null, inversionErrors: [] };
        window.PartnerPortal_showPage('page-rebate-migrate');
        const subIn = document.getElementById('migrate-subject-input');
        const targetIn = document.getElementById('migrate-target-input');
        const ratioIn = document.getElementById('migrate-ratio-input');
        if (subIn) subIn.value = '';
        if (targetIn) targetIn.value = '';
        if (ratioIn) ratioIn.value = '';
        document.getElementById('migrate-subject-card').classList.add('hidden');
        document.getElementById('migrate-form-section').classList.add('hidden');
        document.getElementById('migrate-preview-section').classList.add('hidden');
        document.getElementById('migrate-errors-section').classList.add('hidden');
        const hint = document.getElementById('migrate-ratio-hint');
        if (hint) hint.textContent = '';
        renderMigrateScenarioButtons();
        updateMigrateSubmitState();
    }

    function setMigrateScenario(scenario) {
        migrateState.scenario = scenario;
        migrateState.preview = null;
        renderMigrateScenarioButtons();
        document.getElementById('migrate-subject-card').classList.add('hidden');
        document.getElementById('migrate-form-section').classList.add('hidden');
        document.getElementById('migrate-preview-section').classList.add('hidden');
        document.getElementById('migrate-errors-section').classList.add('hidden');
        updateMigrateSubmitState();
    }

    function lookupMigrateSubject() {
        const key = (document.getElementById('migrate-subject-input') && document.getElementById('migrate-subject-input').value || '').trim();
        if (!key) { alert('请输入待迁移用户钱包或 UID'); return; }
        migrateState.subjectKey = key;
        const card = document.getElementById('migrate-subject-card');
        const formSec = document.getElementById('migrate-form-section');
        const partner = findUserByWalletOrUid(key);
        const plain = findPlainMigrateUser(key);

        if (migrateState.scenario === 'user') {
            if (!plain) {
                if (partner) {
                    card.innerHTML = '<p class="text-amber-800 font-bold">该用户已是合伙人体系内用户。请切换为「合伙人」场景，或确认钱包/UID。</p>';
                } else {
                    card.innerHTML = '<p class="text-red-700 font-bold">未找到普通用户。演示数据可试：0xde...55aa / 100990</p>';
                }
                card.classList.remove('hidden');
                formSec.classList.add('hidden');
                migrateState.preview = null;
                updateMigrateSubmitState();
                return;
            }
            migrateState.preview = {
                scenario: 'user', plainUser: plain,
                agentChain: [], directClients: (plain.directClients || []).map(function (c) {
                    return { wallet: c.wallet, uid: c.uid || '', owner: plain.wallet };
                })
            };
            card.innerHTML = '<p class="font-black text-slate-800">普通用户 · ' + chip(plain.wallet, 'wallet') + ' ' + chip(plain.uid, 'uid') + '</p>' +
                '<p class="text-slate-600 mt-2">' + (plain.note || '') + ' · 直客 ' + (plain.directClients || []).length + ' 人（将一并迁移）</p>';
        } else {
            if (!partner) {
                if (plain) {
                    card.innerHTML = '<p class="text-amber-800 font-bold">该用户为体系外普通用户。请切换为「普通用户」场景。</p>';
                } else {
                    card.innerHTML = '<p class="text-red-700 font-bold">未找到合伙人。演示可试：0xAbn...L4 / 100815（含倒挂下级）</p>';
                }
                card.classList.remove('hidden');
                formSec.classList.add('hidden');
                migrateState.preview = null;
                updateMigrateSubmitState();
                return;
            }
            const subtree = collectPartnerSubtree(partner.id);
            const clients = collectDirectClientsForPartner(partner.id);
            migrateState.preview = {
                scenario: 'partner', partnerUser: partner,
                agentChain: subtree.map(function (u) {
                    return { wallet: u.wallet, uid: u.uid, level: u.level, ratio: u.ratio, note: u.note };
                }),
                directClients: clients
            };
            card.innerHTML = '<p class="font-black text-slate-800">合伙人 · ' + chip(partner.wallet, 'wallet') + ' ' + chip(partner.uid, 'uid') + ' · L' + partner.level + '</p>' +
                '<p class="text-slate-600 mt-2">' + partner.note + ' · 当前比例 <strong>' + partner.ratio + '%</strong> · 上级 ' + (partner.parentWallet ? chip(partner.parentWallet, 'wallet') : '一级') + '</p>' +
                '<p class="text-slate-500 mt-1">代理链路 ' + subtree.length + ' 人 · 伞下直客 ' + clients.length + ' 人（均将迁移）</p>';
            const ratioIn = document.getElementById('migrate-ratio-input');
            const hint = document.getElementById('migrate-ratio-hint');
            if (ratioIn && !ratioIn.value) ratioIn.value = Math.min(partner.ratio, OPS_CAP);
            if (hint) hint.innerHTML = '建议参考当前比例 <strong>' + partner.ratio + '%</strong>；高于新上级时将无法迁移。若下级比例高于新设置值会出现倒挂。';
        }
        card.classList.remove('hidden');
        formSec.classList.remove('hidden');
        previewMigrate();
    }

    function previewMigrate() {
        const previewSec = document.getElementById('migrate-preview-section');
        const errSec = document.getElementById('migrate-errors-section');
        const body = document.getElementById('migrate-preview-body');
        if (!migrateState.preview) {
            if (previewSec) previewSec.classList.add('hidden');
            updateMigrateSubmitState();
            return;
        }
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        const target = findUserByWalletOrUid(targetKey);
        const p = migrateState.preview;

        let html = '';
        if (target) {
            html += '<p class="font-bold text-slate-800">新上级：' + chip(target.wallet, 'wallet') + ' (' + target.ratio + '%) · 新设置比例：' + (isNaN(ratioVal) ? '—' : ratioVal + '%') + '</p>';
        } else if (targetKey) {
            html += '<p class="text-amber-700 font-bold">未找到目标上级：' + targetKey + '</p>';
        }

        if (p.scenario === 'user') {
            html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">迁移主体（普通用户）</p><p>' + chip(p.plainUser.wallet, 'wallet') + '</p></div>';
            if (p.directClients.length) {
                html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">一并迁移的直客 (' + p.directClients.length + ')</p><ul class="space-y-1">';
                p.directClients.forEach(function (c) {
                    html += '<li>' + chip(c.wallet, 'wallet') + (c.uid ? ' · ' + chip(c.uid, 'uid') : '') + '</li>';
                });
                html += '</ul></div>';
            }
        } else {
            html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">代理链路 (' + p.agentChain.length + ')</p>';
            html += '<table class="w-full border text-[10px]"><thead class="bg-slate-50"><tr><th class="px-2 py-1">钱包</th><th class="px-2 py-1">层级</th><th class="px-2 py-1">比例</th><th class="px-2 py-1">备注</th></tr></thead><tbody>';
            p.agentChain.forEach(function (a) {
                const warn = !isNaN(ratioVal) && a.wallet === p.partnerUser.wallet ? '' :
                    (!isNaN(ratioVal) && a.ratio >= ratioVal && a.wallet !== p.partnerUser.wallet ? ' class="bg-red-50 text-red-700"' : '');
                html += '<tr' + warn + '><td class="px-2 py-1">' + a.wallet + '</td><td class="px-2 py-1">L' + a.level + '</td><td class="px-2 py-1 font-bold">' + a.ratio + '%</td><td class="px-2 py-1">' + (a.note || '') + '</td></tr>';
            });
            html += '</tbody></table></div>';
            if (p.directClients.length) {
                html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">伞下直客 (' + p.directClients.length + ')</p><ul class="space-y-1 max-h-32 overflow-y-auto">';
                p.directClients.slice(0, 20).forEach(function (c) {
                    html += '<li class="text-slate-600">' + c.wallet + ' <span class="text-slate-400">属 ' + c.owner + '</span></li>';
                });
                if (p.directClients.length > 20) html += '<li class="text-slate-400">… 另有 ' + (p.directClients.length - 20) + ' 人</li>';
                html += '</ul></div>';
            }
        }

        if (body) body.innerHTML = html;
        if (previewSec) previewSec.classList.remove('hidden');

        migrateState.inversionErrors = checkMigrateInversion();
        if (migrateState.inversionErrors.length) {
            const list = document.getElementById('migrate-errors-list');
            if (list) list.innerHTML = migrateState.inversionErrors.map(function (e) { return '<li>' + e + '</li>'; }).join('');
            if (errSec) errSec.classList.remove('hidden');
        } else {
            if (errSec) errSec.classList.add('hidden');
        }
        updateMigrateSubmitState();
    }

    function updateMigrateSubmitState() {
        const btn = document.getElementById('migrate-submit-btn');
        if (!btn) return;
        const ok = migrateState.preview && migrateState.inversionErrors.length === 0 &&
            (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value.trim()) &&
            !isNaN(parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value));
        btn.disabled = !ok;
        btn.className = ok ? 'bg-blue-600 text-white px-6 py-2 rounded font-black text-[11px]' :
            'bg-blue-600 text-white px-6 py-2 rounded font-black text-[11px] opacity-50 cursor-not-allowed';
    }

    function submitMigrate() {
        if (!migrateState.preview || migrateState.inversionErrors.length) {
            alert('请先修正返佣倒挂问题');
            return;
        }
        const target = findUserByWalletOrUid(document.getElementById('migrate-target-input').value);
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input').value);
        if (!target || isNaN(ratioVal)) return;
        const p = migrateState.preview;
        if (p.scenario === 'partner' && p.partnerUser) {
            p.partnerUser.parentWallet = target.wallet;
            p.partnerUser.ratio = ratioVal;
            p.partnerUser.level = target.level + 1;
            p.partnerUser.rootWallet = target.rootWallet || target.wallet;
            if (target.childIds && target.childIds.indexOf(p.partnerUser.id) < 0) target.childIds.push(p.partnerUser.id);
        }
        alert('迁移成功（演示）：' + (p.scenario === 'user' ? p.plainUser.wallet : p.partnerUser.wallet) +
            ' 已挂到 ' + target.wallet + ' 下，比例 ' + ratioVal + '%');
        showMigratePage();
    }

    window.PartnerPortal = {
        showList: showList, showDetail: showDetail, showTree: showTree,
        fixAbnormalRebate: fixAbnormalRebate, openAbnormalModal: openAbnormalModal,
        closeAbnormalModal: closeAbnormalModal, switchDetailTab: switchDetailTab,
        toggleTreeExpand: toggleTreeExpand, refreshTree: refreshTree,
        filterDetailTable: filterDetailTable, setListFilter: setListFilter,
        applyListSearch: applyListSearch, stageRatioChange: stageRatioChange,
        clearPendingChanges: clearPendingChanges, submitPendingChanges: submitPendingChanges,
        openTreeConfirmModal: openTreeConfirmModal, closeTreeConfirmModal: closeTreeConfirmModal, confirmTreeSubmit: confirmTreeSubmit,
        openBindModal: openBindModal, closeBindModal: closeBindModal, submitBindPartner: submitBindPartner,
        filterSettlementBatches: filterSettlementBatches, showReviewDetail: showReviewDetail,
        backToSettlementList: backToSettlementList, renderPartnerList: renderPartnerList,
        openEditActual: openEditActual, openBatchEditPage: openBatchEditPage, closeBatchEditPage: closeBatchEditPage,
        closeEditActualModal: closeEditActualModal, saveEditActual: saveEditActual,
        submitBatchEditLines: submitBatchEditLines, handleBatchEditFile: handleBatchEditFile,
        switchSettlementDetailTab: switchSettlementDetailTab,
        applySettlementDetailFilters: applySettlementDetailFilters, applySupplementDetailFilters: applySupplementDetailFilters,
        resetSettlementDetailFilters: resetSettlementDetailFilters, resetSupplementDetailFilters: resetSupplementDetailFilters,
        initSettlementDatePickers: initSettlementDatePickers,
        openEditSupplement: openEditSupplement, closeEditSupplementModal: closeEditSupplementModal, saveEditSupplement: saveEditSupplement,
        showMigratePage: showMigratePage, setMigrateScenario: setMigrateScenario, lookupMigrateSubject: lookupMigrateSubject,
        previewMigrate: previewMigrate, submitMigrate: submitMigrate,
        getCurrentUserId: function () { return currentUserId; },
        applyHashTree: applyHashTree, DATA_VERSION: DATA_VERSION
    };

    document.addEventListener('DOMContentLoaded', function () {
        renderPartnerList();
        filterSettlementBatches();
        initSettlementDatePickers();
        applyHashTree();
    });
    window.addEventListener('hashchange', applyHashTree);
})();
