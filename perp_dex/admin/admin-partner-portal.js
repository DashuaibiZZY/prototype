/**
 * 合伙人中心后台 — 统一数据源 v3（列表 / 详情 / 返佣树一致）
 */
(function () {
    const OPS_CAP = 80;
    const DATA_VERSION = 'partner-tree-v4';

    const USERS = [
        {
            id: 'u1', wallet: '0xd593...2Dd2', uid: '100882', note: 'KOL_Global', level: 1, ratio: 70,
            parentWallet: null, rootWallet: '0xd593...2Dd2', operator: 'allen@forx.fi', bindTime: '2024-03-12',
            settleStatus: 'branch_abnormal', abnormalVol: '$820,000', abnormalLines: 2,
            vol: '$52.4M', deposit: '+$1.2M', usersTotal: 1420, usersActive: 420,
            net: '$312,400', netHint: '伞下净手续费 − 伞下触发的全部返佣',
            rebateTotal: '$12,840.50', rebateSelf: '$0.2k', rebateDirect: '$1.2k', rebateGap: '$11.6k',
            activeSubPartners: 4, totalSubPartners: 4,
            childIds: ['u2', 'u3', 'u9', 'u10'],
            directClients: [
                { time: '2024-05-20', wallet: '0x99...F4d2', vol: '$42,500', fee: '$42.50', rebate: '$29.75', status: '交易中' },
                { time: '2024-05-18', wallet: '0x77...C3a1', vol: '$18,200', fee: '$18.20', rebate: '$12.74', status: '交易中' }
            ],
            settlements: [
                { date: '2024-05-22', vol: '$4.2M', rebate: '$0.00', status: '补结算', note: '含异常修正 $3,200' },
                { date: '2024-05-21', vol: '$0', rebate: '$0.00', status: '待修正返佣后计算', note: '分支异常' },
                { date: '2024-05-20', vol: '$3.8M', rebate: '$12,400.00', status: '已发放', note: '' }
            ]
        },
        {
            id: 'u2', wallet: '0x3f...12a', uid: '100910', note: '渠道-小王', level: 2, ratio: 60,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', bindTime: '2024-05-12',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$12.5M', deposit: '+$500k', usersTotal: 1240, usersActive: 420, net: '$48,200', netHint: '伞下净手续费 − 全部返佣',
            rebateTotal: '$13,000', rebateSelf: '$0.2k', rebateDirect: '$1.2k', rebateGap: '$11.6k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['u4'],
            directClients: [{ time: '2024-05-19', wallet: '0xaa...11fe', vol: '$8,400', fee: '$8.40', rebate: '$5.04', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$1.1M', rebate: '$4,200', status: '已发放', note: '' }]
        },
        {
            id: 'u3', wallet: '0x5c...882', uid: '100915', note: '异常下级', level: 2, ratio: 75,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', bindTime: '2024-05-08',
            settleStatus: 'abnormal', abnormalVol: '$620,000', abnormalLines: 1,
            vol: '$2.1M', deposit: '-$120k', usersTotal: 12, usersActive: 0, net: '--', netHint: '异常分支暂停',
            rebateTotal: '--', rebateSelf: '--', rebateDirect: '--', rebateGap: '--',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['u5'],
            directClients: [], settlements: [{ date: '2024-05-21', vol: '$0', rebate: '$0', status: '待修正返佣后计算', note: '' }]
        },
        {
            id: 'u4', wallet: '0x88e1...4F42', uid: '100920', note: '合伙人-John', level: 3, ratio: 55,
            parentWallet: '0x3f...12a', rootWallet: '0xd593...2Dd2', bindTime: '2024-05-14',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$4.8M', deposit: '+$180k', usersTotal: 320, usersActive: 88, net: '$22,100', netHint: '含向上级级差',
            rebateTotal: '$8,420', rebateSelf: '$0.1k', rebateDirect: '$0.8k', rebateGap: '$7.5k',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [{ time: '2024-05-21', wallet: '0xcc...88ab', vol: '$125,000', fee: '$125', rebate: '$68.75', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$420k', rebate: '$1,960', status: '已发放', note: '' }]
        },
        {
            id: 'u5', wallet: '0xab12...99fe', uid: '100925', note: 'L3-小赵', level: 3, ratio: 70,
            parentWallet: '0x5c...882', rootWallet: '0xd593...2Dd2', bindTime: '2024-05-09',
            settleStatus: 'abnormal', abnormalVol: '$200,000', abnormalLines: 1,
            vol: '$0.9M', deposit: '+$12k', usersTotal: 8, usersActive: 0, net: '--', netHint: '异常分支',
            rebateTotal: '--', rebateSelf: '--', rebateDirect: '--', rebateGap: '--',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [], settlements: [{ date: '2024-05-21', vol: '$200k', rebate: '$0', status: '待修正返佣后计算', note: '比例倒挂' }]
        },
        {
            id: 'u9', wallet: '0xAaa...111', uid: '100940', note: '分支-Aaa', level: 2, ratio: 55,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', bindTime: '2024-04-20',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$3.2M', deposit: '+$90k', usersTotal: 180, usersActive: 42, net: '$15,800', netHint: '',
            rebateTotal: '$4,200', rebateSelf: '$0.1k', rebateDirect: '$0.5k', rebateGap: '$3.6k',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [], settlements: []
        },
        {
            id: 'u10', wallet: '0xBbb...222', uid: '100941', note: '分支-Bbb', level: 2, ratio: 58,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', bindTime: '2024-04-22',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$2.8M', deposit: '+$70k', usersTotal: 150, usersActive: 38, net: '$13,200', netHint: '',
            rebateTotal: '$3,800', rebateSelf: '$0.1k', rebateDirect: '$0.4k', rebateGap: '$3.3k',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [], settlements: []
        },
        {
            id: 'u8', wallet: '0xAbc...multi', uid: '100950', note: '多上级异常用户', level: 3, ratio: 50,
            parentWallet: '0xAaa...111', rootWallet: '0xd593...2Dd2', bindTime: '2024-05-05',
            parentWalletsAbnormal: ['0xAaa...111', '0xBbb...222'],
            settleStatus: 'abnormal', abnormalVol: '$340,000', abnormalLines: 2,
            vol: '$1.1M', deposit: '+$45k', usersTotal: 24, usersActive: 3, net: '--', netHint: '多上级结构异常',
            rebateTotal: '--', rebateSelf: '--', rebateDirect: '--', rebateGap: '--',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [], settlements: []
        },
        {
            id: 'u6', wallet: '0xae21...9Bc1', uid: '100901', note: 'SEA_Channel', level: 1, ratio: 65,
            parentWallet: null, rootWallet: '0xae21...9Bc1', operator: 'allen@forx.fi', bindTime: '2024-04-01',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$18.2M', deposit: '+$620k', usersTotal: 680, usersActive: 210, net: '$84,200', netHint: '',
            rebateTotal: '$6,200', rebateSelf: '$0.3k', rebateDirect: '$2.1k', rebateGap: '$3.9k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['u7'],
            directClients: [{ time: '2024-05-17', wallet: '0xde...55aa', vol: '$92,000', fee: '$92', rebate: '$59.80', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$1.1M', rebate: '$4,820', status: '已发放', note: '' }]
        },
        {
            id: 'u7', wallet: '0x7a...01b', uid: '100930', note: '越南站', level: 2, ratio: 50,
            parentWallet: '0xae21...9Bc1', rootWallet: '0xae21...9Bc1', bindTime: '2024-05-15',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$6.2M', deposit: '+$180k', usersTotal: 320, usersActive: 88, net: '$31,500', netHint: '',
            rebateTotal: '$5,100', rebateSelf: '$0.15k', rebateDirect: '$0.9k', rebateGap: '$4.0k',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [], settlements: []
        }
    ];

    const ABNORMAL_RECORDS = [
        { id: 'ap1', type: 'ratio_mismatch', rootWallet: '0xd593...2Dd2', parentWallet: '0x5c...882', childWallet: '0xab12...99fe', parentRatio: 75, childRatio: 70, pausedVol: '$200,000', label: '比例倒挂' },
        { id: 'ap2', type: 'ratio_mismatch', rootWallet: '0xd593...2Dd2', parentWallet: '0xd593...2Dd2', childWallet: '0x5c...882', parentRatio: 70, childRatio: 75, pausedVol: '$620,000', label: '比例倒挂' },
        { id: 'ap3', type: 'multi_parent', rootWallet: '0xd593...2Dd2', childWallet: '0xAbc...multi', parentWallets: ['0xAaa...111', '0xBbb...222'], pausedVol: '$340,000', label: '多直接上级' }
    ];

    const SETTLEMENT_BATCHES = [
        { date: '2024-05-23', vol: '$12,450,000', payout: '$85,140.00', status: '等待对账', rejected: false },
        { date: '2024-05-22', vol: '$10,200,000', payout: '$70,000.00', status: '已拒绝', rejected: true },
        { date: '2024-05-21', vol: '$9,800,000', payout: '$62,300.00', status: '等待对账', rejected: false }
    ];

    let currentUserId = null;
    let treeMode = 'expand';
    let treeFocusId = null;
    let treeAbnormalRecordId = null;
    let listFilterStatus = 'all';
    let listSearchQ = '';
    let treeExpandedNodes = new Set();
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
        const node = getUser(nodeId);
        if (!node) return false;
        if (nodeId === ancestorId) return true;
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
            gap: gap, gapIncome: child.settleStatus === 'abnormal' ? '-- 暂停结算' : '$1,250.00',
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
        tbody.innerHTML = USERS.filter(matchesListFilter).map(function (u) {
            const childCount = (u.childIds || []).length;
            const netHtml = u.net === '--' ? '<span class="text-slate-400">--</span>' : '<span class="text-blue-600 font-black" title="' + (u.netHint || '') + '">' + u.net + '</span>';
            const av = u.abnormalVol === '--' ? '<span class="text-slate-300">--</span>' : '<span class="text-amber-700 font-bold">' + u.abnormalVol + '</span>';
            const al = u.abnormalLines ? '<span class="text-red-600 font-black">' + u.abnormalLines + '</span>' : '<span class="text-slate-300">0</span>';
            return '<tr class="hover:bg-slate-50' + (u.settleStatus !== 'normal' ? ' bg-amber-50/20' : '') + '">' +
                '<td class="px-4 py-3"><button onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="font-black hover:text-blue-600 hover:underline">' + u.wallet + '</button><span class="block text-slate-400 text-[9px]">' + u.note + '</span></td>' +
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
                '<button onclick="PartnerPortal.showTree(\'' + u.id + '\', \'expand\')" class="text-blue-600 font-bold hover:underline">返佣树</button>' +
                '</td></tr>';
        }).join('');
    }

    function renderNodeCard(u, opts) {
        opts = opts || {};
        const pending = pendingRatioChanges.find(function (c) { return c.wallet === u.wallet; });
        const displayRatio = pending ? pending.newRatio : u.ratio;
        const border = u.settleStatus === 'abnormal' ? 'border-red-300 bg-red-50/60' : 'border-slate-200 bg-white';
        const focusCls = opts.isFocus ? ' tree-focus-ring' : '';
        const editable = !opts.readonly;
        let html = '<div class="flex items-center gap-3 p-3 rounded-lg border ' + border + focusCls + ' shadow-sm min-w-[280px]">';
        html += '<span class="text-[10px] font-bold text-slate-400">L' + u.level + '</span>';
        html += '<div class="flex-1 min-w-0"><p class="font-black font-mono text-[11px]">' + u.wallet + '</p><p class="text-[10px] text-slate-500">' + u.note + '</p></div>';
        if (editable) {
            html += '<input type="number" id="ratio-input-' + u.id + '" value="' + displayRatio + '" class="w-14 border rounded px-1 py-1 text-center font-black text-blue-600 text-sm" onchange="PartnerPortal.stageRatioChange(\'' + u.id + '\')"><span class="text-slate-400 font-bold">%</span>';
        } else {
            html += '<span class="text-lg font-black text-blue-600">' + u.ratio + '%</span>';
        }
        if (opts.isFocus) html += '<span class="text-[9px] font-black text-blue-600 uppercase">焦点</span>';
        html += '</div>';
        return html;
    }

    function renderExpandToggle(userId, expanded, childCount) {
        return '<button type="button" class="tree-expand-btn" onclick="PartnerPortal.toggleTreeExpand(\'' + userId + '\')" title="展开 ' + childCount + ' 个直属下级" aria-label="展开下级">' + (expanded ? '−' : '+') + '</button>';
    }

    /** 返佣树：上级链固定全展示；下级仅直接下级，点击逐级展开 */
    function renderRebateTree(focusId, opts) {
        opts = opts || {};
        const focus = getUser(focusId);
        if (!focus) return '';

        if (opts.upchainRecord) {
            return renderUpchainInTree(opts.upchainRecord, focus);
        }

        function renderLazyDown(parentId) {
            const parent = getUser(parentId);
            const childIds = parent.childIds || [];
            if (!childIds.length) return '';
            let h = '<div class="tree-children mt-2 space-y-2">';
            childIds.forEach(function (cid) {
                h += renderDownNode(cid);
            });
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
            h += '<div class="flex-1">' + renderNodeCard(u, { isFocus: userId === focusId }) + '</div>';
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
            h += renderNodeCard(u, { isFocus: isFocus });
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

    /** 异常诊断：同一返佣树内仅向上追溯，不展示下级（多上级分叉） */
    function renderUpchainInTree(record, focus) {
        function chainToL1(startWallet) {
            const nodes = [];
            let w = startWallet;
            while (w) {
                const n = getUserByWallet(w);
                if (!n) break;
                nodes.push(n);
                w = n.parentWallet;
            }
            return nodes.reverse();
        }

        function renderVerticalChain(nodes, label) {
            let h = '<div class="tree-children min-w-[280px]">';
            if (label) h += '<p class="text-[9px] font-bold text-slate-500 mb-2">' + label + '</p>';
            nodes.forEach(function (n, idx) {
                h += '<div class="mb-2">' + renderNodeCard(n) + '</div>';
                if (idx < nodes.length - 1) h += '<div class="text-[9px] text-slate-400 py-0.5">↓</div>';
            });
            h += '<div class="text-[9px] text-red-500 font-bold py-1">↓ 异常下级</div>';
            h += '</div>';
            return h;
        }

        let html = '<div class="w-full space-y-3">';
        html += '<p class="text-[10px] text-red-700 font-bold">异常关系诊断 · ' + record.id + ' · ' + (record.label || record.type) + '（不展示该节点下级）</p>';

        if (record.type === 'multi_parent' && record.parentWallets) {
            html += '<div class="tree-branch-split w-full">';
            record.parentWallets.forEach(function (pw) {
                html += renderVerticalChain(chainToL1(pw), '上级分支 · ' + pw);
            });
            html += '</div>';
            html += '<div class="border-t border-dashed border-red-200 pt-3">' + renderNodeCard(focus, { isFocus: true }) + '</div>';
        } else {
            const chain = chainToL1(record.parentWallet);
            chain.forEach(function (n, idx) {
                html += '<div>' + renderNodeCard(n) + '</div>';
                if (idx < chain.length - 1) html += '<div class="text-[9px] text-slate-400">↓</div>';
            });
            html += '<div class="text-[9px] text-slate-400 py-1">↓ 异常下级</div>';
            html += '<div>' + renderNodeCard(focus, { isFocus: true }) + '</div>';
        }
        html += '</div>';
        return html;
    }

    function refreshTree() {
        const root = document.getElementById('rebate-tree-root');
        if (!root || !treeFocusId) return;
        if (treeMode === 'upchain' && treeAbnormalRecordId) {
            const record = ABNORMAL_RECORDS.find(function (r) { return r.id === treeAbnormalRecordId; });
            if (record) root.innerHTML = renderRebateTree(treeFocusId, { upchainRecord: record });
        } else {
            root.innerHTML = renderRebateTree(treeFocusId);
        }
    }

    function toggleTreeExpand(userId) {
        if (treeMode === 'upchain') return;
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
        bar.innerHTML = '<div class="bg-slate-900 text-white rounded-lg p-4 flex flex-wrap justify-between gap-4">' +
            '<div><p class="font-black text-sm">待提交 (' + pendingRatioChanges.length + ')</p>' +
            '<ul class="text-[10px] mt-2 space-y-1">' +
            pendingRatioChanges.map(function (c) { return '<li>' + c.wallet + ': ' + c.oldRatio + '%→' + c.newRatio + '%</li>'; }).join('') +
            '</ul></div>' +
            '<div class="flex gap-2">' +
            '<button onclick="PartnerPortal.clearPendingChanges()" class="px-4 py-2 border border-slate-600 rounded font-bold text-[11px]">清空</button>' +
            '<button onclick="PartnerPortal.submitPendingChanges()" class="px-6 py-2 bg-blue-600 rounded font-black text-[11px]">一并提交</button></div></div>';
    }

    function renderAbnormalSection(rootWallet, forTreePage) {
        const records = ABNORMAL_RECORDS.filter(function (r) {
            if (rootWallet && r.rootWallet !== rootWallet) return false;
            return true;
        });
        if (!records.length) return '';
        let html = '<div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">' +
            '<p class="text-red-900 font-black text-sm mb-2">异常返佣线</p>' +
            '<table class="w-full text-[11px]"><thead class="text-[10px] uppercase text-red-400"><tr>' +
            '<th class="pb-2">类型</th><th class="pb-2">下级</th><th class="pb-2">上级</th><th class="pb-2 text-right">暂停额</th><th class="pb-2 text-right">操作</th></tr></thead><tbody>';
        records.forEach(function (r) {
            const parents = r.type === 'multi_parent' ? (r.parentWallets || []).join(', ') : r.parentWallet;
            const detail = r.type === 'ratio_mismatch' ? r.parentRatio + '% &lt; ' + r.childRatio + '%' : '—';
            html += '<tr class="border-t border-red-100"><td class="py-2">' + r.label + '</td>' +
                '<td class="py-2 font-mono font-bold">' + r.childWallet + '</td>' +
                '<td class="py-2 font-mono">' + parents + '<span class="block text-[9px] text-red-500">' + detail + '</span></td>' +
                '<td class="py-2 text-right font-bold">' + r.pausedVol + '</td>' +
                '<td class="py-2 text-right"><button onclick="PartnerPortal.showTreeFromAbnormal(\'' + r.id + '\')" class="text-blue-600 font-bold hover:underline">在返佣树查看</button></td></tr>';
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
        document.getElementById('detail-partner-title').textContent = u.note + ' · 数据总览';
        document.getElementById('detail-partner-sub').textContent = u.wallet + ' · UID ' + u.uid + ' · L' + u.level + ' · ' + u.ratio + '% · ' + settleLabel(u.settleStatus).replace(/<[^>]+>/g, '');
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
        const userAbnormal = ABNORMAL_RECORDS.filter(function (r) {
            return r.childWallet === u.wallet || r.parentWallet === u.wallet ||
                (r.parentWallets && r.parentWallets.indexOf(u.wallet) >= 0) ||
                r.rootWallet === u.rootWallet;
        });
        if (u.settleStatus !== 'normal' || userAbnormal.length) {
            banner.classList.remove('hidden');
            document.getElementById('detail-abnormal-vol').textContent = u.abnormalVol;
            document.getElementById('detail-abnormal-lines').textContent = u.abnormalLines;
            document.getElementById('detail-abnormal-scope').textContent = '仅相关返佣分支暂停结算；其他分支正常。';
            abnEntry.classList.remove('hidden');
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
                '<td class="px-3 py-2"><span class="font-black">' + r.wallet + '</span><span class="block text-[10px] text-slate-400">' + r.note + '</span></td>' +
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
            return '<tr><td class="px-4 py-2">' + c.time + '</td><td class="px-3 py-2 font-mono font-black">' + c.wallet + '</td>' +
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
            return '<tr><td class="px-4 py-2">' + r.date + '</td><td class="px-3 py-2 text-right">' + r.vol + '</td>' +
                '<td class="px-3 py-2 text-right font-bold">' + r.rebate + '</td>' +
                '<td class="px-3 py-2 text-center font-bold ' + cls + '">' + r.status + '</td>' +
                '<td class="px-4 py-2 text-slate-500">' + (r.note || '') + '</td></tr>';
        }).join('') : '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">暂无结算记录</td></tr>';
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

    function showTree(id, mode) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        treeFocusId = id;
        treeMode = mode || 'expand';
        treeAbnormalRecordId = null;
        treeExpandedNodes = new Set();
        window.PartnerPortal_showPage('page-rebate-tree');
        document.getElementById('tree-title').textContent = u.note + ' · 返佣关系树';
        document.getElementById('tree-sub').textContent = '上级链固定展示并可改比例；下级仅展示直接下级，点击 + 逐级展开';
        document.getElementById('tree-mode-badge').textContent = '视图：返佣关系树';
        document.getElementById('tree-data-version').textContent = '数据版本 ' + DATA_VERSION + ' · 焦点 L' + u.level + ' · 直属下级 ' + (u.childIds || []).length + ' 人';
        document.getElementById('rebate-tree-root').innerHTML = renderRebateTree(id);
        const abnSec = document.getElementById('tree-abnormal-section');
        if (abnSec) abnSec.innerHTML = renderAbnormalSection(u.rootWallet, true);
        renderPendingChangesBar();
        if (location.hash.indexOf('rebate-tree') === -1) location.hash = 'rebate-tree';
    }

    function showTreeFromAbnormal(recordId) {
        const record = ABNORMAL_RECORDS.find(function (r) { return r.id === recordId; });
        if (!record) return;
        const child = getUserByWallet(record.childWallet);
        if (!child) return;
        currentUserId = child.id;
        treeFocusId = child.id;
        treeMode = 'upchain';
        treeAbnormalRecordId = recordId;
        treeExpandedNodes = new Set();
        closeAbnormalModal();
        window.PartnerPortal_showPage('page-rebate-tree');
        document.getElementById('tree-title').textContent = child.note + ' · 返佣关系树';
        document.getElementById('tree-sub').textContent = '异常诊断：自记录下级向上追溯至一级，不展示其下级（同一返佣树页）';
        document.getElementById('tree-mode-badge').textContent = '视图：异常关系诊断';
        document.getElementById('tree-data-version').textContent = '数据版本 ' + DATA_VERSION + ' · 记录 ' + recordId;
        document.getElementById('rebate-tree-root').innerHTML = renderRebateTree(child.id, { upchainRecord: record });
        const abnSec = document.getElementById('tree-abnormal-section');
        if (abnSec) abnSec.innerHTML = renderAbnormalSection(record.rootWallet, true);
        renderPendingChangesBar();
        location.hash = 'rebate-tree?abnormal=' + recordId;
    }

    function openAbnormalModal() {
        const u = getUser(currentUserId);
        const body = document.getElementById('modal-abnormal-list-body');
        body.innerHTML = renderAbnormalSection(u ? u.rootWallet : null, false);
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
            alert('下调提示：建议检查直属下级级差 — ' + names);
        }
        renderPendingChangesBar();
    }

    function clearPendingChanges() {
        pendingRatioChanges = [];
        refreshTree();
        renderPendingChangesBar();
    }

    function submitPendingChanges() {
        if (!pendingRatioChanges.length) return;
        if (pendingRatioChanges.some(function (c) { return c.newRatio < c.oldRatio; }) &&
            !confirm('含下调比例，可能触发分支异常保护。确认一并提交？')) return;
        alert('已提交 ' + pendingRatioChanges.length + ' 项（' + DATA_VERSION + '）');
        pendingRatioChanges = [];
        renderPendingChangesBar();
    }

    function openBindModal() {
        document.getElementById('bind-wallet').value = '';
        document.getElementById('bind-ratio').value = '';
        document.getElementById('bind-note').value = '';
        document.getElementById('bind-remark').value = '';
        document.getElementById('bind-cap-hint').textContent = '配置上限 ' + OPS_CAP + '%；超过须风控+老板审批';
        document.getElementById('modal-bind-partner').classList.remove('hidden');
    }

    function closeBindModal() { document.getElementById('modal-bind-partner').classList.add('hidden'); }

    function submitBindPartner() {
        const wallet = document.getElementById('bind-wallet').value.trim();
        const ratio = parseFloat(document.getElementById('bind-ratio').value);
        const note = document.getElementById('bind-note').value.trim();
        const remark = document.getElementById('bind-remark').value.trim();
        if (!wallet || !ratio || !remark) { alert('请填写完整信息'); return; }
        if (ratio > OPS_CAP && typeof submitApprovalApplication === 'function') {
            submitApprovalApplication({
                type: 'partner_l1_bind', title: '一级合伙人绑定', applicant: 'Mkt_Allen', remark: remark,
                summary: wallet + ' · ' + ratio + '%', payload: { wallet: wallet, ratio: ratio, note: note, opsCap: OPS_CAP }
            });
            alert('已提交审批');
        } else {
            alert('绑定成功（演示）');
        }
        closeBindModal();
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
                '<td class="px-6 py-4 text-right"><button onclick="PartnerPortal.showReviewDetail(' + (b.rejected ? 'true' : 'false') + ')" class="bg-slate-900 text-white px-4 py-1.5 rounded font-black uppercase">' + (b.rejected ? '查看原因' : '查看详情') + '</button></td></tr>';
        }).join('');
    }

    function showReviewDetail(isRejected) {
        document.getElementById('view-batch-list').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
        document.getElementById('reject-banner').classList.toggle('hidden', !isRejected);
    }

    function backToSettlementList() {
        document.getElementById('view-review-detail').classList.add('hidden');
        document.getElementById('view-batch-list').classList.remove('hidden');
    }

    function applyHashTree() {
        const hash = (location.hash || '').replace('#', '');
        if (hash.indexOf('rebate-tree') === 0) {
            const m = hash.match(/abnormal=([^&]+)/);
            if (m) showTreeFromAbnormal(m[1]);
            else if (currentUserId || treeFocusId) showTree(currentUserId || treeFocusId || 'u1', 'expand');
        }
    }

    window.PartnerPortal = {
        showList: showList, showDetail: showDetail, showTree: showTree,
        showTreeFromAbnormal: showTreeFromAbnormal, openAbnormalModal: openAbnormalModal,
        closeAbnormalModal: closeAbnormalModal, switchDetailTab: switchDetailTab,
        toggleTreeExpand: toggleTreeExpand, refreshTree: refreshTree,
        filterDetailTable: filterDetailTable, setListFilter: setListFilter,
        applyListSearch: applyListSearch, stageRatioChange: stageRatioChange,
        clearPendingChanges: clearPendingChanges, submitPendingChanges: submitPendingChanges,
        openBindModal: openBindModal, closeBindModal: closeBindModal, submitBindPartner: submitBindPartner,
        filterSettlementBatches: filterSettlementBatches, showReviewDetail: showReviewDetail,
        backToSettlementList: backToSettlementList, renderPartnerList: renderPartnerList,
        getCurrentUserId: function () { return currentUserId; },
        applyHashTree: applyHashTree, DATA_VERSION: DATA_VERSION
    };

    document.addEventListener('DOMContentLoaded', function () {
        renderPartnerList();
        filterSettlementBatches();
        applyHashTree();
    });
    window.addEventListener('hashchange', applyHashTree);
})();
