/**
 * 合伙人中心（用户侧）原型交互逻辑
 */
(function () {
    const PERIOD_SCALE = { '1D': 0.14, '1W': 1, '1M': 4.2, '3M': 12 };

    const SORT_ICON = ' <span class="sort-icon text-gray-300">↕</span>';

    let overviewPeriod = '1W';
    let linksPeriod = '1W';
    let linksPage = 1;
    let linksSearch = '';
    let linksSort = { key: null, dir: 'desc' };
    let subPartnerFilter = 'all';
    let subPartnerSearch = '';
    let subPartnerSort = { key: null, dir: 'desc' };
    let directClientSort = { key: null, dir: 'desc' };

    const inviteLinksData = [
        { remark: '預設連結', code: 'E6DL28G', directCount: 124, subPartnerCount: 42, totalVol: 5200000, totalFee: 5200, rebateIncome: 3640, netDeposit: 420000, isDefault: true },
        { remark: '推特推廣-01', code: 'FORX99', directCount: 12, subPartnerCount: 0, totalVol: 850000, totalFee: 850, rebateIncome: 595, netDeposit: 62000, isDefault: false },
        { remark: 'YouTube-KOL', code: 'YT2024', directCount: 56, subPartnerCount: 3, totalVol: 2100000, totalFee: 2100, rebateIncome: 1470, netDeposit: 185000, isDefault: false },
        { remark: 'Discord社群', code: 'DSC001', directCount: 89, subPartnerCount: 5, totalVol: 1680000, totalFee: 1680, rebateIncome: 1176, netDeposit: 92000, isDefault: false },
        { remark: '亞洲渠道-A', code: 'ASIA01', directCount: 34, subPartnerCount: 2, totalVol: 980000, totalFee: 980, rebateIncome: 686, netDeposit: 45000, isDefault: false },
        { remark: '歐洲渠道-B', code: 'EUR002', directCount: 21, subPartnerCount: 1, totalVol: 720000, totalFee: 720, rebateIncome: 504, netDeposit: 38000, isDefault: false },
        { remark: '線下活動-深圳', code: 'SZ2405', directCount: 45, subPartnerCount: 0, totalVol: 560000, totalFee: 560, rebateIncome: 392, netDeposit: 28000, isDefault: false },
        { remark: '線下活動-新加坡', code: 'SG2406', directCount: 18, subPartnerCount: 0, totalVol: 430000, totalFee: 430, rebateIncome: 301, netDeposit: 22000, isDefault: false },
        { remark: 'KOL合作-03', code: 'KOL003', directCount: 67, subPartnerCount: 4, totalVol: 1450000, totalFee: 1450, rebateIncome: 1015, netDeposit: 76000, isDefault: false },
        { remark: '媒體投放-01', code: 'MED001', directCount: 9, subPartnerCount: 0, totalVol: 320000, totalFee: 320, rebateIncome: 224, netDeposit: 15000, isDefault: false },
        { remark: '媒體投放-02', code: 'MED002', directCount: 14, subPartnerCount: 0, totalVol: 410000, totalFee: 410, rebateIncome: 287, netDeposit: 19000, isDefault: false },
        { remark: '社群裂變', code: 'VIRAL1', directCount: 102, subPartnerCount: 6, totalVol: 2890000, totalFee: 2890, rebateIncome: 2023, netDeposit: 156000, isDefault: false }
    ];

    const existingCodesList = inviteLinksData.map(function (r) { return r.code; });

    const subPartnersData = [
        { id: 'sp1', joinDate: '2024-05-12', wallet: '0x3f...12a', remark: '渠道-小王', ratio: 60, gap: 10, gapIncome: 1250, totalVol: 12500000, netDeposit: 500000, totalUsers: 1240, activeUsers: 420, settlementStatus: 'normal', name: '合伙人-小王' },
        { id: 'sp2', joinDate: '2024-05-10', wallet: '0x8e...55c', remark: '推特KOL-J', ratio: 50, gap: 20, gapIncome: 0, totalVol: 16200000, netDeposit: 820000, totalUsers: 850, activeUsers: 120, settlementStatus: 'team_tree_abnormal', paused: true, abnormalLines: 2, name: 'KOL-J' },
        { id: 'sp3', joinDate: '2024-05-08', wallet: '0x5c...882', remark: '', ratio: 75, gap: -5, gapIncome: 0, totalVol: 2100000, netDeposit: -120000, totalUsers: 12, activeUsers: 0, settlementStatus: 'direct_inversion', name: '异常合伙人' },
        { id: 'sp4', joinDate: '2024-05-05', wallet: '0x2a...9f1', remark: '東南亞渠道', ratio: 55, gap: 15, gapIncome: 890, totalVol: 8900000, netDeposit: 320000, totalUsers: 620, activeUsers: 180, settlementStatus: 'normal', name: '东南亚渠道' },
        { id: 'sp5', joinDate: '2024-04-28', wallet: '0x7b...4c2', remark: '韓國KOL', ratio: 45, gap: 25, gapIncome: 2100, totalVol: 22400000, netDeposit: 980000, totalUsers: 1580, activeUsers: 510, settlementStatus: 'normal', name: '韩国KOL' }
    ];

    const teamTreeAbnormalData = {
        sp2: [
            {
                title: '异常返佣线 1',
                nodes: [
                    { wallet: '0x8e...55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                    { wallet: '0xBc...4431', remark: '下级合伙人-A', ratio: '55%' },
                    { wallet: '0x7a...E912', remark: '交易用户', ratio: '40%' }
                ]
            },
            {
                title: '异常返佣线 2',
                nodes: [
                    { wallet: '0x8e...55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                    { wallet: '0xDe...8821', remark: '下级合伙人-B', ratio: '52%' },
                    { wallet: '0xF1...009a', remark: '交易用户', ratio: '48%' }
                ]
            }
        ]
    };

    const directClientsData = [
        { joinDate: '2024-05-20', wallet: '0x99...F4d2', totalVol: 42500, totalFee: 42.50, rebate: 29.75, netDeposit: 5200 },
        { joinDate: '2024-05-18', wallet: '0xAb...12cd', totalVol: 128000, totalFee: 128.00, rebate: 89.60, netDeposit: 15000 },
        { joinDate: '2024-05-15', wallet: '0xCd...88ef', totalVol: 8900, totalFee: 8.90, rebate: 6.23, netDeposit: -1200 },
        { joinDate: '2024-05-12', wallet: '0xEf...33aa', totalVol: 256000, totalFee: 256.00, rebate: 179.20, netDeposit: 32000 }
    ];

    const overviewBase = {
        teamVol: 52450000,
        totalRebate: 12840.50,
        selfRebate: 200,
        directRebate: 1200,
        gapRebate: 11600,
        teamNetDeposit: 1240000,
        activeSubPartners: 42,
        totalSubPartners: 120,
        volChange: 12.4
    };

    function fmtMoney(n, opts) {
        opts = opts || {};
        const abs = Math.abs(n);
        let str;
        if (abs >= 1000000) str = '$' + (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        else if (abs >= 1000) str = '$' + Math.round(n).toLocaleString();
        else str = '$' + n.toFixed(2);
        if (opts.signed && n > 0) str = '+' + str;
        if (opts.signed && n < 0) str = '-' + str.replace('-', '');
        return str;
    }

    function fmtNum(n) {
        return Math.round(n).toLocaleString();
    }

    function periodValue(base, period) {
        return base * (PERIOD_SCALE[period] || 1);
    }

    function sortIconHtml(key, sortState) {
        if (sortState.key !== key) return ' <span class="sort-icon text-gray-300">↕</span>';
        return ' <span class="sort-icon text-blue-600 font-black">' + (sortState.dir === 'asc' ? '↑' : '↓') + '</span>';
    }

    function toggleSort(sortState, key) {
        if (sortState.key === key) sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        else { sortState.key = key; sortState.dir = 'desc'; }
    }

    function applySort(items, sortState, getters) {
        if (!sortState.key) return items;
        const getter = getters[sortState.key];
        if (!getter) return items;
        const dir = sortState.dir === 'asc' ? 1 : -1;
        return items.slice().sort(function (a, b) {
            return (getter(a) - getter(b)) * dir;
        });
    }

    function slicePage(items, page, perPage) {
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        const p = Math.max(1, Math.min(page, pages));
        const start = (p - 1) * perPage;
        return { items: items.slice(start, start + perPage), page: p, total: total, pages: pages };
    }

    function buildPaginationHtml(containerId, page, total, perPage, goFnName) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const pages = Math.max(1, Math.ceil(total / perPage) || 1);
        page = total > 0 ? Math.max(1, Math.min(page, pages)) : 1;
        let html = '<div class="flex items-center justify-center gap-1 py-4 border-t border-gray-50 text-[11px]">';
        html += '<button type="button" class="px-2.5 py-1 rounded border border-gray-200 font-bold' + (page <= 1 ? ' opacity-40 pointer-events-none' : '') + '" onclick="' + goFnName + '(' + (page - 1) + ')">&lt;</button>';
        for (let i = 1; i <= pages; i++) {
            const active = i === page;
            html += '<button type="button" class="min-w-[28px] px-2 py-1 rounded border font-bold ' + (active ? 'bg-black text-white border-black' : 'border-gray-200 hover:bg-gray-50') + '" onclick="' + goFnName + '(' + i + ')">' + i + '</button>';
        }
        html += '<button type="button" class="px-2.5 py-1 rounded border border-gray-200 font-bold' + (page >= pages || !total ? ' opacity-40 pointer-events-none' : '') + '" onclick="' + goFnName + '(' + (page + 1) + ')">&gt;</button>';
        html += '</div>';
        el.innerHTML = html;
    }

    function updatePeriodButtons(groupClass, activePeriod) {
        document.querySelectorAll('.' + groupClass).forEach(function (btn) {
            const p = btn.getAttribute('data-period');
            if (p === activePeriod) {
                btn.className = groupClass + ' px-4 py-1 text-[10px] font-bold bg-black text-white rounded-sm shadow-md';
            } else {
                btn.className = groupClass + ' px-4 py-1 text-[10px] font-bold hover:bg-gray-50';
            }
        });
    }

    function renderOverview() {
        const scale = PERIOD_SCALE[overviewPeriod] || 1;
        const vol = overviewBase.teamVol * scale;
        const rebate = overviewBase.totalRebate * scale;
        const self = overviewBase.selfRebate * scale;
        const direct = overviewBase.directRebate * scale;
        const gap = overviewBase.gapRebate * scale;
        const net = overviewBase.teamNetDeposit * scale;
        const activeSubs = Math.round(overviewBase.activeSubPartners * Math.min(scale, 1.2));
        const totalSubs = overviewBase.totalSubPartners;

        const volEl = document.getElementById('overview-team-vol');
        if (volEl) volEl.textContent = fmtMoney(vol);
        const rebateEl = document.getElementById('overview-total-rebate');
        if (rebateEl) rebateEl.textContent = fmtMoney(rebate);
        const selfEl = document.getElementById('overview-self-rebate');
        if (selfEl) selfEl.textContent = fmtMoney(self);
        const directEl = document.getElementById('overview-direct-rebate');
        if (directEl) directEl.textContent = fmtMoney(direct);
        const gapEl = document.getElementById('overview-gap-rebate');
        if (gapEl) gapEl.textContent = fmtMoney(gap);
        const netEl = document.getElementById('overview-team-net');
        if (netEl) netEl.textContent = fmtMoney(net, { signed: true });
        const activeEl = document.getElementById('overview-active-subs');
        if (activeEl) activeEl.innerHTML = activeSubs + ' <span class="text-sm text-gray-300">/ ' + totalSubs + '</span>';
        const activeHint = document.getElementById('overview-active-subs-hint');
        if (activeHint) activeHint.textContent = '本周期内有交易的下级合伙人 ' + activeSubs + ' / 总计 ' + totalSubs;

        updatePeriodButtons('overview-period-btn', overviewPeriod);
        renderSubPartners();
        renderDirectClients();
    }

    function renderInviteLinks() {
        let filtered = inviteLinksData.filter(function (row) {
            if (!linksSearch) return true;
            const q = linksSearch.toLowerCase();
            return row.remark.toLowerCase().includes(q) || row.code.toLowerCase().includes(q);
        });

        const scale = PERIOD_SCALE[linksPeriod] || 1;
        const getters = {
            directCount: function (r) { return r.directCount; },
            subPartnerCount: function (r) { return r.subPartnerCount; },
            totalVol: function (r) { return r.totalVol * scale; },
            rebateIncome: function (r) { return r.rebateIncome * scale; },
            netDeposit: function (r) { return r.netDeposit; }
        };
        filtered = applySort(filtered, linksSort, getters);
        const sliced = slicePage(filtered, linksPage, 10);
        linksPage = sliced.page;

        const thead = document.getElementById('links-table-head');
        if (thead) {
            thead.innerHTML =
                '<tr>' +
                '<th class="px-6 py-4">備註名稱</th>' +
                '<th class="px-6 py-4">邀請碼</th>' +
                '<th class="px-6 py-4">邀請連結</th>' +
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'directCount\')">直邀人數' + sortIconHtml('directCount', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'subPartnerCount\')">下級合伙人數' + sortIconHtml('subPartnerCount', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'totalVol\')">总交易额' + sortIconHtml('totalVol', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right">合计手续费</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'rebateIncome\')">合计返佣收入' + sortIconHtml('rebateIncome', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'netDeposit\')">总净入金' + sortIconHtml('netDeposit', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('links-table-body');
        if (!tbody) return;
        tbody.innerHTML = sliced.items.map(function (row) {
            const vol = row.totalVol * scale;
            const rebate = row.rebateIncome * scale;
            const link = 'forx.finance/?ref=' + row.code;
            return '<tr class="hover:bg-slate-50 transition-colors">' +
                '<td class="px-6 py-4 font-black">' + row.remark + '</td>' +
                '<td class="px-6 py-4 font-mono text-blue-600">' + row.code + '</td>' +
                '<td class="px-6 py-4 text-gray-400">' + link + '</td>' +
                '<td class="px-6 py-4 text-center font-bold">' + row.directCount + '</td>' +
                '<td class="px-6 py-4 text-center font-bold">' + row.subPartnerCount + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(vol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalFee) + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + fmtMoney(rebate) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold text-green-500">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-right space-x-2">' +
                '<button type="button" onclick="alert(\'連結已複製\')" class="text-blue-600 font-black hover:underline">複製連結</button>' +
                '<button class="text-gray-300">|</button>' +
                '<button type="button" onclick="openReferralModal(\'edit\', \'' + row.remark.replace(/'/g, "\\'") + '\', \'' + row.code + '\')" class="text-gray-400 hover:text-black">修改備註</button>' +
                '</td></tr>';
        }).join('');

        const countEl = document.getElementById('links-create-count');
        if (countEl) countEl.textContent = '+ 創建新連結 (已用 ' + inviteLinksData.length + '/50)';

        updatePeriodButtons('links-period-btn', linksPeriod);
        buildPaginationHtml('links-pagination', sliced.page, sliced.total, 10, 'PartnerCenter.goLinksPage');
    }

    function settlementStatusCell(row) {
        if (row.settlementStatus === 'direct_inversion') {
            return '<span class="text-[10px] text-red-500 font-bold leading-snug">⚠️ 返佣比例已高于您，请立即调整</span>';
        }
        if (row.settlementStatus === 'team_tree_abnormal') {
            const n = row.abnormalLines || 1;
            return '<button type="button" onclick="PartnerCenter.openTeamTreeModal(\'' + row.id + '\')" class="text-[10px] text-amber-700 font-bold hover:underline text-left">⚠️ 团队返佣树异常（' + n + ' 条）</button>';
        }
        return '<span class="text-[10px] text-gray-400">—</span>';
    }

    function renderSubPartners() {
        const scale = PERIOD_SCALE[overviewPeriod] || 1;
        let filtered = subPartnersData.filter(function (row) {
            if (subPartnerFilter !== 'all' && row.settlementStatus !== subPartnerFilter) return false;
            if (!subPartnerSearch) return true;
            const q = subPartnerSearch.toLowerCase();
            return row.wallet.toLowerCase().includes(q) || (row.remark && row.remark.toLowerCase().includes(q));
        });

        const getters = {
            gapIncome: function (r) { return r.gapIncome * scale; },
            totalVol: function (r) { return r.totalVol * scale; },
            netDeposit: function (r) { return r.netDeposit; },
            tradeUsers: function (r) { return r.activeUsers; }
        };
        filtered = applySort(filtered, subPartnerSort, getters);

        const thead = document.getElementById('sub-partner-table-head');
        if (thead) {
            thead.innerHTML =
                '<tr>' +
                '<th class="px-6 py-4">加入时间</th>' +
                '<th class="px-6 py-4">下级合伙人 (备注)</th>' +
                '<th class="px-6 py-4 text-center">设置比例</th>' +
                '<th class="px-6 py-4 text-center">我的级差</th>' +
                '<th class="px-6 py-4">结算状态</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setSubPartnerSort(\'gapIncome\')">贡献级差收入' + sortIconHtml('gapIncome', subPartnerSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setSubPartnerSort(\'totalVol\')">总交易额' + sortIconHtml('totalVol', subPartnerSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setSubPartnerSort(\'netDeposit\')">总净入金' + sortIconHtml('netDeposit', subPartnerSort) + '</th>' +
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setSubPartnerSort(\'tradeUsers\')">交易用户规模' + sortIconHtml('tradeUsers', subPartnerSort) + '</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('sub-partner-table-body');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(function (row) {
            const isDirectBad = row.settlementStatus === 'direct_inversion';
            const paused = row.paused || isDirectBad;
            const activeUsers = Math.round(row.activeUsers * Math.min(scale, 1.2));
            const gapIncome = row.gapIncome * scale;
            const vol = row.totalVol * scale;
            const rowClass = isDirectBad ? 'bg-red-50/30' : 'hover:bg-slate-50';
            const remarkHtml = row.remark ? '<span class="block text-[10px] text-gray-400 font-bold">' + row.remark + '</span>' : '';
            const ratioClass = isDirectBad ? 'text-red-600 underline font-black' : 'text-gray-700 font-bold';
            const gapClass = row.gap < 0 ? 'bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-sm' : 'gap-tag';
            const incomeHtml = paused && !gapIncome ? '<span class="font-black text-slate-400 italic">-- 暂停结算</span>' : '<span class="font-black text-blue-600">' + fmtMoney(gapIncome) + '</span>';
            const drillData = JSON.stringify({
                name: row.name,
                uid: row.wallet,
                joinTime: row.joinDate,
                totalVol: fmtMoney(vol),
                netDeposit: fmtMoney(row.netDeposit, { signed: true }),
                activeUsers: activeUsers,
                totalUsers: row.totalUsers,
                profitSelf: fmtMoney(200 * scale),
                profitDirect: fmtMoney(1200 * scale),
                profitGap: fmtMoney(gapIncome),
                totalProfit: fmtMoney(gapIncome + 1400 * scale)
            }).replace(/"/g, '&quot;');
            const teamBtn = isDirectBad
                ? '<button disabled class="text-gray-300 font-black cursor-not-allowed" title="数据异常，请先修复比例配置">查看团队</button>'
                : '<button type="button" onclick="drillDownToTeam(' + drillData + ')" class="text-blue-600 font-black hover:underline">查看团队</button>';

            return '<tr class="' + rowClass + ' transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4"><span class="text-gray-900 font-black">' + row.wallet + '</span>' + remarkHtml + '</td>' +
                '<td class="px-6 py-4 text-center ' + ratioClass + '">' + row.ratio + '%</td>' +
                '<td class="px-6 py-4 text-center"><span class="' + gapClass + '">' + row.gap + '%</span></td>' +
                '<td class="px-6 py-4">' + settlementStatusCell(row) + '</td>' +
                '<td class="px-6 py-4 text-right">' + incomeHtml + '</td>' +
                '<td class="px-6 py-4 text-right font-bold' + (paused && isDirectBad ? ' text-gray-400' : '') + '">' + fmtMoney(vol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold text-green-500">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="text-gray-900 font-black">' + fmtNum(row.totalUsers) + '</span><span class="text-[9px] text-gray-400 block font-bold">' + fmtNum(activeUsers) + ' 本周期交易</span></td>' +
                '<td class="px-6 py-4 text-right">' + teamBtn +
                '<span class="mx-2 text-gray-200">|</span>' +
                '<button type="button" class="text-gray-400 font-black hover:text-black' + (isDirectBad ? ' text-blue-600 hover:underline' : '') + '" onclick="' + (isDirectBad ? 'alert(\'即将进入调整页面以修复比例倒挂问题\')' : 'alert(\'调整比例\')') + '">调整</button></td>' +
                '</tr>';
        }).join('');
    }

    function renderDirectClients() {
        const getters = {
            totalVol: function (r) { return r.totalVol; },
            totalFee: function (r) { return r.totalFee; },
            rebate: function (r) { return r.rebate; }
        };
        const sorted = applySort(directClientsData, directClientSort, getters);

        const thead = document.getElementById('direct-client-table-head');
        if (thead) {
            thead.innerHTML =
                '<tr>' +
                '<th class="px-6 py-4">注册时间</th>' +
                '<th class="px-6 py-4">直客钱包地址</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setDirectClientSort(\'totalVol\')">累计交易额' + sortIconHtml('totalVol', directClientSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setDirectClientSort(\'totalFee\')">累计手续费' + sortIconHtml('totalFee', directClientSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setDirectClientSort(\'rebate\')">返佣金额' + sortIconHtml('rebate', directClientSort) + '</th>' +
                '<th class="px-6 py-4 text-right">净入金</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('direct-client-table-body');
        if (!tbody) return;
        tbody.innerHTML = sorted.map(function (row) {
            const netClass = row.netDeposit >= 0 ? 'text-green-500' : 'text-red-400';
            return '<tr class="hover:bg-slate-50 transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4 font-black text-gray-900">' + row.wallet + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalVol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalFee) + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + fmtMoney(row.rebate) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold ' + netClass + '">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-right">' +
                '<button type="button" onclick="PartnerCenter.openAddSubPartnerModal(\'' + row.wallet + '\')" class="text-blue-600 font-black hover:underline">设置为下级合伙人</button>' +
                '</td></tr>';
        }).join('');
    }

    function openTeamTreeModal(partnerId) {
        const lines = teamTreeAbnormalData[partnerId] || [];
        const body = document.getElementById('team-tree-modal-body');
        if (!body) return;
        body.innerHTML = lines.map(function (line, idx) {
            const nodesHtml = line.nodes.map(function (node, i) {
                const indent = i * 16;
                return '<div class="flex items-center py-2 border-l-2 border-amber-200 ml-' + (i > 0 ? '4' : '0') + '" style="padding-left:' + (indent + 12) + 'px">' +
                    '<div class="flex-1"><span class="font-mono font-black text-gray-900">' + node.wallet + '</span>' +
                    '<span class="text-[10px] text-gray-400 font-bold ml-2">' + node.remark + '</span></div>' +
                    '<span class="text-[11px] font-black text-amber-700">' + node.ratio + '</span></div>';
            }).join('');
            return '<div class="mb-6 border border-amber-100 rounded-sm bg-amber-50/30 p-4">' +
                '<p class="text-[11px] font-black text-amber-800 uppercase mb-3">' + line.title + '</p>' +
                '<div class="space-y-1">' + nodesHtml + '</div></div>';
        }).join('');
        toggleModal('modal-team-tree');
    }

    window.PartnerCenter = {
        setOverviewPeriod: function (p) {
            overviewPeriod = p;
            renderOverview();
        },
        setLinksPeriod: function (p) {
            linksPeriod = p;
            renderInviteLinks();
        },
        setLinksSort: function (key) {
            toggleSort(linksSort, key);
            renderInviteLinks();
        },
        setLinksSearch: function (q) {
            linksSearch = q;
            linksPage = 1;
            renderInviteLinks();
        },
        goLinksPage: function (p) {
            linksPage = Math.max(1, p);
            renderInviteLinks();
        },
        setSubPartnerFilter: function (v) {
            subPartnerFilter = v;
            renderSubPartners();
        },
        setSubPartnerSearch: function (q) {
            subPartnerSearch = q;
            renderSubPartners();
        },
        setSubPartnerSort: function (key) {
            toggleSort(subPartnerSort, key);
            renderSubPartners();
        },
        setDirectClientSort: function (key) {
            toggleSort(directClientSort, key);
            renderDirectClients();
        },
        openTeamTreeModal: openTeamTreeModal,
        openAddSubPartnerModal: function (wallet) {
            const input = document.getElementById('input-add-agent-wallet');
            if (input) input.value = wallet || '';
            toggleModal('modal-add-agent');
        },
        addInviteLink: function (remark, code) {
            inviteLinksData.push({
                remark: remark,
                code: code,
                directCount: 0,
                subPartnerCount: 0,
                totalVol: 0,
                totalFee: 0,
                rebateIncome: 0,
                netDeposit: 0,
                isDefault: false
            });
            existingCodesList.push(code);
            linksPage = 1;
            renderInviteLinks();
        },
        init: function () {
            renderOverview();
            renderInviteLinks();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { PartnerCenter.init(); });
    } else {
        PartnerCenter.init();
    }
})();
