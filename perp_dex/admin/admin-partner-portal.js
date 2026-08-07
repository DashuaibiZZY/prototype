/**
 * 合伙人中心后台 — 列表 / 详情 / 返佣树 / 批量比例提交
 */
(function () {
    const OPS_CAP = 80;

    const USERS = [
        {
            id: 'u1', wallet: '0xd593...2Dd2', uid: '100882', note: 'KOL_Global', level: 1, ratio: 70,
            parentWallet: null, rootWallet: '0xd593...2Dd2', operator: 'allen@forx.fi', bindTime: '2024-03-12',
            settleStatus: 'branch_abnormal',
            abnormalVol: '$820,000', abnormalLines: 2,
            vol: '$52.4M', deposit: '+$1.2M', usersTotal: 1420, usersActive: 420,
            net: '$312,400', netHint: '一级：伞下净手续费 − 伞内全部返佣支出',
            childIds: ['u2', 'u3']
        },
        {
            id: 'u2', wallet: '0x3f...12a', uid: '100910', note: '渠道-小王', level: 2, ratio: 60,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', operator: '—', bindTime: '2024-05-12',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$12.5M', deposit: '+$500k', usersTotal: 1240, usersActive: 420,
            net: '$48,200', netHint: '该节点伞下：净手续费 − 由该伞下交易触发的全部返佣（含向上级级差）',
            childIds: ['u4']
        },
        {
            id: 'u3', wallet: '0x5c...882', uid: '100915', note: '异常下级', level: 2, ratio: 75,
            parentWallet: '0xd593...2Dd2', rootWallet: '0xd593...2Dd2', operator: '—', bindTime: '2024-05-08',
            settleStatus: 'abnormal', abnormalVol: '$620,000', abnormalLines: 1,
            vol: '$2.1M', deposit: '-$120k', usersTotal: 12, usersActive: 0,
            net: '--', netHint: '异常分支暂停结算期间不计入净利润',
            childIds: ['u5']
        },
        {
            id: 'u4', wallet: '0x88e1...4F42', uid: '100920', note: '合伙人-John', level: 3, ratio: 55,
            parentWallet: '0x3f...12a', rootWallet: '0xd593...2Dd2', operator: '—', bindTime: '2024-05-14',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$4.8M', deposit: '+$180k', usersTotal: 320, usersActive: 88,
            net: '$22,100', netHint: '三级示例：伞下净手续费 − 该伞下交易产生的全部返佣（含给一级、二级级差）',
            childIds: []
        },
        {
            id: 'u5', wallet: '0xab12...99fe', uid: '100925', note: 'L3-小赵', level: 3, ratio: 70,
            parentWallet: '0x5c...882', rootWallet: '0xd593...2Dd2', operator: '—', bindTime: '2024-05-09',
            settleStatus: 'abnormal', abnormalVol: '$200,000', abnormalLines: 1,
            vol: '$0.9M', deposit: '+$12k', usersTotal: 8, usersActive: 0,
            net: '--', netHint: '处于异常返佣分支，暂停结算',
            childIds: []
        },
        {
            id: 'u6', wallet: '0xae21...9Bc1', uid: '100901', note: 'SEA_Channel', level: 1, ratio: 65,
            parentWallet: null, rootWallet: '0xae21...9Bc1', operator: 'allen@forx.fi', bindTime: '2024-04-01',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$18.2M', deposit: '+$620k', usersTotal: 680, usersActive: 210,
            net: '$84,200', netHint: '一级：伞下净手续费 − 伞内全部返佣支出',
            childIds: ['u7']
        },
        {
            id: 'u7', wallet: '0x7a...01b', uid: '100930', note: '越南站', level: 2, ratio: 50,
            parentWallet: '0xae21...9Bc1', rootWallet: '0xae21...9Bc1', operator: '—', bindTime: '2024-05-15',
            settleStatus: 'normal', abnormalVol: '--', abnormalLines: 0,
            vol: '$6.2M', deposit: '+$180k', usersTotal: 320, usersActive: 88,
            net: '$31,500', netHint: '该节点伞下：净手续费 − 由该伞下交易触发的全部返佣',
            childIds: []
        }
    ];

    const ABNORMAL_PAIRS = [
        { id: 'ap1', rootWallet: '0xd593...2Dd2', parentWallet: '0x5c...882', childWallet: '0xab12...99fe', parentRatio: 75, childRatio: 70, pausedVol: '$200,000' },
        { id: 'ap2', rootWallet: '0xd593...2Dd2', parentWallet: '0xd593...2Dd2', childWallet: '0x5c...882', parentRatio: 70, childRatio: 75, pausedVol: '$620,000' }
    ];

    const SETTLEMENT_BATCHES = [
        { date: '2024-05-23', vol: '$12,450,000', payout: '$85,140.00', status: '等待对账', rejected: false },
        { date: '2024-05-22', vol: '$10,200,000', payout: '$70,000.00', status: '已拒绝', rejected: true },
        { date: '2024-05-21', vol: '$9,800,000', payout: '$62,300.00', status: '等待对账', rejected: false }
    ];

    let currentUserId = null;
    let treeMode = 'expand';
    let listFilterStatus = 'all';
    let listSearchQ = '';
    let pendingRatioChanges = [];

    function getUser(id) {
        return USERS.find(function (u) { return u.id === id; });
    }

    function getUserByWallet(w) {
        return USERS.find(function (u) { return u.wallet === w; });
    }

    function settleLabel(s) {
        if (s === 'normal') return '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px]">正常结算</span>';
        if (s === 'branch_abnormal') return '<span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold text-[10px]">部分分支异常</span>';
        return '<span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">待修正返佣后计算</span>';
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
        const rows = USERS.filter(matchesListFilter);
        tbody.innerHTML = rows.map(function (u) {
            const netHtml = u.net === '--'
                ? '<span class="text-slate-400">--</span>'
                : '<span class="text-blue-600 font-black" title="' + (u.netHint || '') + '">' + u.net + '</span>';
            const av = u.abnormalVol === '--' ? '<span class="text-slate-300">--</span>' : '<span class="text-amber-700 font-bold">' + u.abnormalVol + '</span>';
            const al = u.abnormalLines ? '<span class="text-red-600 font-black">' + u.abnormalLines + '</span>' : '<span class="text-slate-300">0</span>';
            return '<tr class="hover:bg-slate-50' + (u.settleStatus !== 'normal' ? ' bg-amber-50/20' : '') + '">' +
                '<td class="px-4 py-3"><button onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="font-black text-slate-900 hover:text-blue-600 hover:underline">' + u.wallet + '</button>' +
                '<span class="block text-slate-400 text-[9px]">' + u.note + '</span></td>' +
                '<td class="px-3 py-3 text-center font-bold text-slate-500">L' + u.level + '</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.ratio + '%</td>' +
                '<td class="px-3 py-3 text-center">' + settleLabel(u.settleStatus) + '</td>' +
                '<td class="px-3 py-3 text-right">' + av + '</td>' +
                '<td class="px-3 py-3 text-center">' + al + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-slate-600">' + u.vol + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-green-600">' + u.deposit + '</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.usersTotal + ' <span class="text-slate-300 font-normal">/ ' + u.usersActive + '</span></td>' +
                '<td class="px-3 py-3 text-right">' + netHtml + '</td>' +
                '<td class="px-3 py-3 text-slate-500">' + (u.level === 1 ? u.operator : '—') + '</td>' +
                '<td class="px-4 py-3 text-right space-x-2">' +
                '<button onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="text-slate-600 font-bold hover:underline">详情</button>' +
                '<button onclick="PartnerPortal.showTree(\'' + u.id + '\', \'expand\')" class="text-blue-600 font-bold hover:underline">返佣树</button>' +
                '</td></tr>';
        }).join('');
    }

    function renderAncestors(u) {
        if (u.level <= 1) return '';
        const chain = [];
        let w = u.parentWallet;
        while (w) {
            const p = getUserByWallet(w);
            if (p) chain.unshift(p);
            w = p ? p.parentWallet : null;
        }
        return '<div class="flex flex-wrap items-center gap-2 text-[11px] mb-4">' +
            '<span class="text-slate-400 font-bold">上级链路</span>' +
            chain.map(function (a, i) {
                return '<span class="bg-slate-100 px-2 py-1 rounded font-mono">L' + a.level + ' ' + a.wallet + ' (' + a.ratio + '%)</span>' +
                    (i < chain.length - 1 ? '<span class="text-slate-300">→</span>' : '');
            }).join('') +
            '<span class="text-slate-300">→</span>' +
            '<span class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono font-bold">当前 L' + u.level + '</span>' +
            '</div>';
    }

    function renderAbnormalPairList(rootWallet, onPairClick) {
        const pairs = ABNORMAL_PAIRS.filter(function (p) { return p.rootWallet === rootWallet; });
        if (!pairs.length) return '';
        let html = '<div class="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">' +
            '<p class="text-red-900 font-black text-sm mb-2">异常返佣线（仅以下分支暂停结算，非整棵一级树）</p>' +
            '<p class="text-red-700 text-[10px] mb-3">每条为一对上下级比例倒挂；暂停范围为该分支及其下级，其他分支正常结算。</p>' +
            '<table class="w-full text-left text-[11px]"><thead class="text-[10px] uppercase text-red-400"><tr>' +
            '<th class="pb-2">上级地址</th><th class="pb-2">下级地址</th><th class="pb-2 text-center">比例</th><th class="pb-2 text-right">暂停交易额</th><th class="pb-2 text-right">操作</th></tr></thead><tbody>';
        pairs.forEach(function (p) {
            html += '<tr class="border-t border-red-100">' +
                '<td class="py-2 font-mono font-bold">' + p.parentWallet + '</td>' +
                '<td class="py-2 font-mono font-bold">' + p.childWallet + '</td>' +
                '<td class="py-2 text-center text-red-600 font-black">' + p.parentRatio + '% &lt; ' + p.childRatio + '%</td>' +
                '<td class="py-2 text-right font-bold">' + p.pausedVol + '</td>' +
                '<td class="py-2 text-right"><button onclick="PartnerPortal.showTreeUpchain(\'' + p.childWallet + '\')" class="text-blue-600 font-bold hover:underline">查看该分支</button></td></tr>';
        });
        html += '</tbody></table></div>';
        return html;
    }

    function renderExpandNode(userId, depth) {
        const u = getUser(userId);
        if (!u) return '';
        const pending = pendingRatioChanges.find(function (c) { return c.wallet === u.wallet; });
        const displayRatio = pending ? pending.newRatio : u.ratio;
        const isAbnormalNode = u.settleStatus === 'abnormal';
        const border = isAbnormalNode ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-white';
        const children = u.childIds || [];
        const hasKids = children.length > 0;
        const expanded = depth < 2;

        let html = '<div class="mb-2" data-node="' + u.id + '">';
        html += '<div class="flex items-center gap-3 p-3 rounded-lg border ' + border + ' shadow-sm">';
        html += '<span class="text-[10px] font-bold text-slate-400 w-8">L' + u.level + '</span>';
        html += '<div class="flex-1 min-w-0"><p class="font-black font-mono">' + u.wallet + '</p><p class="text-[10px] text-slate-500">' + u.note + '</p></div>';
        html += '<div class="flex items-center gap-2">';
        html += '<input type="number" id="ratio-input-' + u.id + '" value="' + displayRatio + '" class="w-16 border rounded px-2 py-1 text-center font-black text-blue-600 text-sm" min="0" max="100" onchange="PartnerPortal.stageRatioChange(\'' + u.id + '\')">';
        html += '<span class="text-slate-400 font-bold">%</span>';
        html += '</div>';
        if (isAbnormalNode) html += '<span class="text-[10px] font-bold text-red-600">分支暂停</span>';
        if (hasKids) {
            html += '<button type="button" onclick="PartnerPortal.toggleChildren(\'' + u.id + '\')" class="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-2">下级 (' + children.length + ')</button>';
        }
        html += '</div>';
        if (hasKids) {
            html += '<div id="children-' + u.id + '" class="tree-children mt-2' + (expanded ? '' : ' hidden') + '">';
            children.forEach(function (cid) { html += renderExpandNode(cid, depth + 1); });
            html += '</div>';
        }
        html += '</div>';
        return html;
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
        bar.innerHTML = '<div class="bg-slate-900 text-white rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">' +
            '<div><p class="font-black text-sm">待提交比例变更 (' + pendingRatioChanges.length + ')</p>' +
            '<p class="text-[10px] text-slate-400 mt-1">返佣树内修改一并提交，次日 00:00 生效；下调将提示受影响下级</p>' +
            '<ul class="text-[10px] mt-2 space-y-1">' +
            pendingRatioChanges.map(function (c) {
                return '<li>' + c.wallet + '：' + c.oldRatio + '% → <b class="text-blue-300">' + c.newRatio + '%</b></li>';
            }).join('') + '</ul></div>' +
            '<div class="flex gap-2">' +
            '<button onclick="PartnerPortal.clearPendingChanges()" class="px-4 py-2 border border-slate-600 rounded font-bold text-[11px]">清空</button>' +
            '<button onclick="PartnerPortal.submitPendingChanges()" class="px-6 py-2 bg-blue-600 rounded font-black text-[11px] hover:bg-blue-500">一并提交变更</button>' +
            '</div></div>';
    }

    function showDetail(id) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        window.PartnerPortal_showPage('page-partner-detail');
        document.getElementById('detail-partner-title').textContent = u.note + ' · 合伙人详情';
        document.getElementById('detail-partner-sub').textContent = u.wallet + ' · UID ' + u.uid + ' · L' + u.level;
        document.getElementById('detail-uid').textContent = u.uid;
        document.getElementById('detail-wallet').textContent = u.wallet;
        document.getElementById('detail-ratio').textContent = u.ratio + '%';
        document.getElementById('detail-level').textContent = 'L' + u.level;
        document.getElementById('detail-operator').textContent = u.level === 1 ? u.operator : '—';
        document.getElementById('detail-bind-time').textContent = u.bindTime;
        document.getElementById('detail-vol').textContent = u.vol;
        document.getElementById('detail-deposit').textContent = u.deposit;
        document.getElementById('detail-users').textContent = u.usersTotal + ' / ' + u.usersActive;
        document.getElementById('detail-net').textContent = u.net;
        document.getElementById('detail-net-hint').textContent = u.netHint || '';
        document.getElementById('detail-settle-status').innerHTML = settleLabel(u.settleStatus);
        const banner = document.getElementById('detail-abnormal-banner');
        if (u.settleStatus !== 'normal') {
            banner.classList.remove('hidden');
            document.getElementById('detail-abnormal-vol').textContent = u.abnormalVol;
            document.getElementById('detail-abnormal-lines').textContent = u.abnormalLines;
            document.getElementById('detail-abnormal-scope').textContent = u.settleStatus === 'branch_abnormal'
                ? '仅异常返佣分支暂停结算，该一级下其他分支仍正常。'
                : '当前节点所在返佣分支暂停结算。';
        } else {
            banner.classList.add('hidden');
        }
        document.getElementById('detail-ancestors').innerHTML = renderAncestors(u);
        const subs = u.childIds.map(function (cid) { return getUser(cid); }).filter(Boolean);
        document.getElementById('detail-sub-partners').innerHTML = subs.length
            ? subs.map(function (s) {
                return '<tr><td class="px-4 py-2 font-mono font-black">' + s.wallet + '</td>' +
                    '<td class="px-3 py-2">' + s.note + '</td>' +
                    '<td class="px-3 py-2 text-center">' + s.ratio + '%</td>' +
                    '<td class="px-3 py-2 text-center">' + settleLabel(s.settleStatus) + '</td></tr>';
            }).join('')
            : '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">无直属下级合伙人</td></tr>';
    }

    function showTree(id, mode) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        treeMode = mode || 'expand';
        window.PartnerPortal_showPage('page-rebate-tree');
        document.getElementById('tree-title').textContent = u.note + ' · 返佣关系';
        document.getElementById('tree-sub').textContent = mode === 'upchain'
            ? '自异常节点向上展开至一级，再向下展示该分支'
            : '自当前节点向下展开下级；非一级时展示上级链路';
        document.getElementById('tree-ancestors').innerHTML = renderAncestors(u);
        document.getElementById('tree-abnormal-section').innerHTML = renderAbnormalPairList(u.rootWallet);
        const root = document.getElementById('rebate-tree-root');
        if (mode === 'upchain') {
            const leaf = u;
            let html = '';
            const chainUp = [];
            let w = leaf.wallet;
            while (w) {
                const n = getUserByWallet(w);
                if (n) chainUp.unshift(n);
                w = n && n.parentWallet ? n.parentWallet : null;
            }
            chainUp.forEach(function (n, idx) {
                html += '<div class="text-[10px] font-bold text-slate-400 mb-1">— 向上链路 L' + n.level + ' —</div>';
                html += renderExpandNode(n.id, 0);
                if (idx === chainUp.length - 1 && n.childIds.length) {
                    html += '<div class="text-[10px] font-bold text-slate-400 mt-3 mb-1">— 该分支下级 —</div>';
                    n.childIds.forEach(function (cid) { html += renderExpandNode(cid, 1); });
                }
            });
            root.innerHTML = html;
        } else {
            root.innerHTML = renderExpandNode(u.id, 0);
        }
        renderPendingChangesBar();
    }

    function showTreeUpchain(wallet) {
        const u = getUserByWallet(wallet);
        if (u) showTree(u.id, 'upchain');
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
        const entry = { wallet: u.wallet, note: u.note, oldRatio: u.ratio, newRatio: newRatio, userId: userId };
        if (idx >= 0) pendingRatioChanges[idx] = entry;
        else pendingRatioChanges.push(entry);
        if (newRatio < u.ratio) {
            const affected = (u.childIds || []).map(function (cid) {
                const c = getUser(cid);
                return c ? c.wallet + ' (' + c.ratio + '%)' : '';
            }).filter(Boolean);
            if (affected.length) {
                alert('下调提示：可能影响直属下级级差。建议一并检查：' + affected.join('、'));
            }
        }
        renderPendingChangesBar();
    }

    function clearPendingChanges() {
        pendingRatioChanges = [];
        if (currentUserId) showTree(currentUserId, treeMode);
        renderPendingChangesBar();
    }

    function submitPendingChanges() {
        if (!pendingRatioChanges.length) return;
        const hasDown = pendingRatioChanges.some(function (c) { return c.newRatio < c.oldRatio; });
        if (hasDown) {
            if (!confirm('存在下调比例，可能触发异常返佣分支保护。确认一并提交？')) return;
        }
        alert('已提交 ' + pendingRatioChanges.length + ' 项比例变更（原型演示），将于次日 00:00 生效。');
        pendingRatioChanges = [];
        renderPendingChangesBar();
    }

    function toggleChildren(userId) {
        const el = document.getElementById('children-' + userId);
        if (el) el.classList.toggle('hidden');
    }

    function openBindModal() {
        document.getElementById('bind-wallet').value = '';
        document.getElementById('bind-ratio').value = '';
        document.getElementById('bind-note').value = '';
        document.getElementById('bind-remark').value = '';
        document.getElementById('bind-cap-hint').textContent = '您的配置上限：' + OPS_CAP + '%；超过上限须风控 + 老板审批';
        document.getElementById('modal-bind-partner').classList.remove('hidden');
    }

    function closeBindModal() {
        document.getElementById('modal-bind-partner').classList.add('hidden');
    }

    function submitBindPartner() {
        const wallet = document.getElementById('bind-wallet').value.trim();
        const ratio = parseFloat(document.getElementById('bind-ratio').value);
        const note = document.getElementById('bind-note').value.trim();
        const remark = document.getElementById('bind-remark').value.trim();
        if (!wallet || !ratio) { alert('请填写钱包/UID 与返佣比例'); return; }
        if (!remark) { alert('请填写申请备注'); return; }
        if (ratio > OPS_CAP) {
            if (typeof submitApprovalApplication !== 'function') {
                alert('超过运营上限 ' + OPS_CAP + '%，须走审批（演示环境未加载审批模块）');
                return;
            }
            submitApprovalApplication({
                type: 'partner_l1_bind',
                title: '一级合伙人绑定',
                applicant: 'Mkt_Allen',
                remark: remark,
                summary: wallet + ' · ' + ratio + '% · ' + (note || '一级合伙人'),
                payload: { wallet: wallet, ratio: ratio, note: note, opsCap: OPS_CAP, exceedsCap: true }
            });
            alert('返佣比例超过运营上限，已提交风控 + 老板审批');
            closeBindModal();
            return;
        }
        alert('绑定成功（原型）：' + wallet + ' @ ' + ratio + '%');
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
                '<td class="px-6 py-4 text-right font-bold text-slate-600">' + b.vol + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + b.payout + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="' + stCls + ' px-3 py-1 rounded-full">' + b.status + '</span></td>' +
                '<td class="px-6 py-4 text-right">' +
                '<button onclick="PartnerPortal.showReviewDetail(' + (b.rejected ? 'true' : 'false') + ')" class="' +
                (b.rejected ? 'bg-red-600' : 'bg-slate-900') + ' text-white px-4 py-1.5 rounded font-black uppercase">' +
                (b.rejected ? '查看原因' : '查看详情') + '</button></td></tr>';
        }).join('');
    }

    function showReviewDetail(isRejected) {
        document.getElementById('view-batch-list').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
        document.getElementById('reject-banner').classList.toggle('hidden', !isRejected);
        document.getElementById('abnormal-banner').classList.toggle('hidden', isRejected);
    }

    function backToSettlementList() {
        document.getElementById('view-review-detail').classList.add('hidden');
        document.getElementById('view-batch-list').classList.remove('hidden');
    }

    window.PartnerPortal = {
        showList: showList,
        showDetail: showDetail,
        showTree: showTree,
        showTreeUpchain: showTreeUpchain,
        setListFilter: setListFilter,
        applyListSearch: applyListSearch,
        stageRatioChange: stageRatioChange,
        clearPendingChanges: clearPendingChanges,
        submitPendingChanges: submitPendingChanges,
        toggleChildren: toggleChildren,
        openBindModal: openBindModal,
        closeBindModal: closeBindModal,
        submitBindPartner: submitBindPartner,
        filterSettlementBatches: filterSettlementBatches,
        showReviewDetail: showReviewDetail,
        backToSettlementList: backToSettlementList,
        renderPartnerList: renderPartnerList,
        getCurrentUserId: function () { return currentUserId; },
        OPS_CAP: OPS_CAP
    };

    document.addEventListener('DOMContentLoaded', function () {
        renderPartnerList();
        filterSettlementBatches();
    });
})();
