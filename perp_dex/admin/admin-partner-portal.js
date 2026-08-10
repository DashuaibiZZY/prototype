/**
 * 合伙人中心后台 — 4 条演示数据，列表 / 详情 / 返佣树一致
 */
(function () {
    const OPS_CAP = 80;
    const DATA_VERSION = 'partner-demo-7';

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
        { date: '2024-05-23', vol: '$12,450,000', payout: '$85,140.00', status: '等待对账', rejected: false },
        { date: '2024-05-22', vol: '$10,200,000', payout: '$70,000.00', status: '已拒绝', rejected: true },
        { date: '2024-05-21', vol: '$9,800,000', payout: '$62,300.00', status: '等待对账', rejected: false }
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
        ]
    };

    /** 修正返佣后的补发流水：补发执行日 ≠ 原应结日 */
    const REBATE_SUPPLEMENT_FLOWS = [
        {
            id: 'sup1', payoutDate: '2024-05-30', wallet: '0xAbn...L4', uid: '100815',
            originalSettlementDate: '2024-05-21', amount: 1856.40,
            note: '5-21 比例倒挂暂停结算，5-30 修正返佣后补发'
        },
        {
            id: 'sup2', payoutDate: '2024-10-10', wallet: '0xAbn...L4', uid: '100815',
            originalSettlementDate: '2024-10-01', amount: 2340.00,
            note: '10-01 待修正返佣后计算，10-10 修正后补发'
        },
        {
            id: 'sup3', payoutDate: '2024-10-10', wallet: '0xAbn...L1', uid: '100811',
            originalSettlementDate: '2024-10-01', amount: 890.50,
            note: '异常分支修正后，补发 10-01 暂停分支佣金'
        }
    ];

    let currentUserId = null;
    let currentBatchDate = null;
    let batchEditRowIds = null;
    let selectedSettlementRowIds = new Set();
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

    function renderSettlementDetailRows() {
        const tbody = document.getElementById('settlement-detail-body');
        if (!tbody || !currentBatchDate) return;
        const rows = getBatchRows(currentBatchDate);
        tbody.innerHTML = rows.map(function (r) {
            const parentCell = r.parentWallet ? chip(r.parentWallet, 'wallet') : '<span class="text-slate-500">一级</span>';
            const origCell = r.pendingFix
                ? '<span class="text-amber-700 font-bold">待修正返佣后计算</span><span class="block text-[9px] text-amber-600 mt-0.5">原应结日 ' + (r.originalSettlementDate || '—') + ' · 当日停结</span>'
                : '<span class="font-bold">' + fmtMoney(r.originalRebate) + '</span>';
            const actualCell = r.pendingFix
                ? '<span class="text-slate-400">$0.00</span><span class="block text-[9px] text-slate-400 mt-0.5">修正后另日记补发流水</span>'
                : '<span class="text-blue-600 font-black">' + fmtMoney(r.actualRebate) + '</span>';
            const editBtn = r.pendingFix
                ? '<span class="text-[10px] text-slate-400">不可修改</span>'
                : '<button onclick="PartnerPortal.openEditActual(\'' + r.id + '\')" class="text-blue-600 font-bold hover:underline text-[10px]">修改</button>';
            const checked = selectedSettlementRowIds.has(r.id);
            const checkCell = r.pendingFix
                ? '<span class="text-slate-300">—</span>'
                : '<input type="checkbox" class="settlement-row-check rounded border-slate-300" data-id="' + r.id + '" ' + (checked ? 'checked' : '') + ' onchange="PartnerPortal.toggleSettlementSelect(\'' + r.id + '\', this.checked)">';
            return '<tr class="' + (r.pendingFix ? 'bg-amber-50/40' : 'hover:bg-slate-50') + '">' +
                '<td class="px-4 py-4 text-center">' + checkCell + '</td>' +
                '<td class="px-4 py-4"><div class="font-bold">' + chip(r.wallet, 'wallet') + '</div><div class="mt-1">' + chip(r.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-4 text-center font-bold">L' + r.level + '</td>' +
                '<td class="px-4 py-4 text-center font-black">' + r.ratio + '%</td>' +
                '<td class="px-4 py-4 text-center">' + parentCell + '</td>' +
                '<td class="px-4 py-4 text-right font-bold">' + r.vol + '</td>' +
                '<td class="px-4 py-4 text-right">' + origCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + actualCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + editBtn + '</td></tr>';
        }).join('');
        updateSettlementBatchEditBtn();
    }

    function toggleSettlementSelect(rowId, checked) {
        if (checked) selectedSettlementRowIds.add(rowId);
        else selectedSettlementRowIds.delete(rowId);
        updateSettlementBatchEditBtn();
    }

    function toggleSettlementSelectAll(checked) {
        const rows = getBatchRows(currentBatchDate).filter(function (r) { return !r.pendingFix; });
        selectedSettlementRowIds = new Set();
        if (checked) rows.forEach(function (r) { selectedSettlementRowIds.add(r.id); });
        renderSettlementDetailRows();
    }

    function updateSettlementBatchEditBtn() {
        const btn = document.getElementById('btn-batch-edit-actual');
        if (!btn) return;
        const n = selectedSettlementRowIds.size;
        btn.textContent = n ? '批量修改所选实发（' + n + '）' : '批量修改所选实发';
        btn.disabled = n === 0;
        btn.classList.toggle('opacity-50', n === 0);
    }

    function renderSupplementFlows() {
        const tbody = document.getElementById('supplement-flow-body');
        if (!tbody) return;
        const dateQ = (document.getElementById('supplement-filter-date') && document.getElementById('supplement-filter-date').value) || '';
        const filtered = REBATE_SUPPLEMENT_FLOWS.filter(function (f) {
            if (!dateQ) return true;
            return f.payoutDate.indexOf(dateQ) !== -1 || f.originalSettlementDate.indexOf(dateQ) !== -1;
        });
        tbody.innerHTML = filtered.length ? filtered.map(function (f) {
            return '<tr class="hover:bg-slate-50">' +
                '<td class="px-4 py-3 font-black">' + f.payoutDate + '</td>' +
                '<td class="px-4 py-3"><div>' + chip(f.wallet, 'wallet') + '</div><div class="mt-1">' + chip(f.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-3 font-bold text-amber-800">' + f.originalSettlementDate + '</td>' +
                '<td class="px-4 py-3 text-right font-black text-blue-600">' + fmtMoney(f.amount) + '</td>' +
                '<td class="px-4 py-3 text-slate-600 text-[11px]">' + f.note + '</td></tr>';
        }).join('') : '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">暂无补发流水</td></tr>';
    }

    function filterSupplementFlows() {
        renderSupplementFlows();
    }

    function initSettlementDatePickers() {
        if (typeof flatpickr === 'undefined') return;
        const opts = { dateFormat: 'Y-m-d', allowInput: true };
        const batchDate = document.getElementById('settlement-filter-date');
        if (batchDate && !batchDate._flatpickr) {
            flatpickr(batchDate, Object.assign({}, opts, { onChange: function () { filterSettlementBatches(); } }));
        }
        const supDate = document.getElementById('supplement-filter-date');
        if (supDate && !supDate._flatpickr) {
            flatpickr(supDate, Object.assign({}, opts, { onChange: function () { filterSupplementFlows(); } }));
        }
    }

    function setSettlementListView(inDetail) {
        const filterSec = document.getElementById('settlement-filter-section');
        const supplementSec = document.getElementById('settlement-supplement-section');
        if (filterSec) filterSec.classList.toggle('hidden', inDetail);
        if (supplementSec) supplementSec.classList.toggle('hidden', inDetail);
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

    function openBatchEditActual() {
        const ids = Array.from(selectedSettlementRowIds);
        if (!ids.length) { alert('请先勾选需要修改的合伙人'); return; }
        const rows = getBatchRows(currentBatchDate).filter(function (r) { return ids.indexOf(r.id) >= 0 && !r.pendingFix; });
        if (!rows.length) { alert('所选记录不可修改'); return; }
        batchEditRowIds = rows.map(function (r) { return r.id; });
        document.getElementById('edit-actual-title').textContent = '批量修改所选实发佣金';
        document.getElementById('edit-actual-hint').textContent = '已选 ' + rows.length + ' 人。统一填写实发金额，每人仍不得高于各自原始佣金。';
        document.getElementById('edit-actual-input').value = '';
        document.getElementById('edit-actual-input').removeAttribute('max');
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
            const stCls = b.rejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
            return '<tr class="hover:bg-slate-50' + (b.rejected ? ' bg-red-50/20' : '') + '">' +
                '<td class="px-6 py-4 font-black">' + b.date + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + b.vol + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + b.payout + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="' + stCls + ' px-3 py-1 rounded-full">' + b.status + '</span></td>' +
                '<td class="px-6 py-4 text-right"><button onclick="PartnerPortal.showReviewDetail(\'' + b.date + '\', ' + (b.rejected ? 'true' : 'false') + ')" class="bg-slate-900 text-white px-4 py-1.5 rounded font-black uppercase">' + (b.rejected ? '查看原因' : '查看详情') + '</button></td></tr>';
        }).join('');
    }

    function showReviewDetail(batchDate, isRejected) {
        currentBatchDate = batchDate || SETTLEMENT_BATCHES[0].date;
        selectedSettlementRowIds = new Set();
        setSettlementListView(true);
        document.getElementById('view-batch-list').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
        document.getElementById('reject-banner').classList.toggle('hidden', !isRejected);
        const titleEl = document.getElementById('detail-title');
        if (titleEl) titleEl.textContent = '结算批次明细 · ' + currentBatchDate;
        renderSettlementDetailRows();
    }

    function backToSettlementList() {
        currentBatchDate = null;
        selectedSettlementRowIds = new Set();
        setSettlementListView(false);
        document.getElementById('view-review-detail').classList.add('hidden');
        document.getElementById('view-batch-list').classList.remove('hidden');
    }

    function applyHashTree() {
        const hash = (location.hash || '').replace('#', '');
        if (hash.indexOf('rebate-tree') === 0 && (currentUserId || treeFocusId)) {
            showTree(currentUserId || treeFocusId);
        }
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
        openEditActual: openEditActual, openBatchEditActual: openBatchEditActual,
        closeEditActualModal: closeEditActualModal, saveEditActual: saveEditActual,
        toggleSettlementSelect: toggleSettlementSelect, toggleSettlementSelectAll: toggleSettlementSelectAll,
        filterSupplementFlows: filterSupplementFlows, renderSupplementFlows: renderSupplementFlows,
        initSettlementDatePickers: initSettlementDatePickers,
        getCurrentUserId: function () { return currentUserId; },
        applyHashTree: applyHashTree, DATA_VERSION: DATA_VERSION
    };

    document.addEventListener('DOMContentLoaded', function () {
        renderPartnerList();
        filterSettlementBatches();
        renderSupplementFlows();
        initSettlementDatePickers();
        applyHashTree();
    });
    window.addEventListener('hashchange', applyHashTree);
})();
