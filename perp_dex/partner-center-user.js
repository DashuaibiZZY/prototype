/**
 * 合伙人中心（用户侧）原型交互逻辑
 */
(function () {
    const PERIOD_SCALE = { '1D': 0.14, '1W': 1, '1M': 4.2, '3M': 12 };
    const MY_MAX_RATIO = 70;

    let overviewPeriod = '1W';
    let linksPeriod = '1W';
    let linksPage = 1;
    let linksSearch = '';
    let linksSort = { key: null, dir: 'desc' };
    let subPartnerFilter = 'all';
    let subPartnerSearch = '';
    let subPartnerSort = { key: null, dir: 'desc' };
    let directClientSort = { key: null, dir: 'desc' };
    let activeOverviewTable = 'sub-agent';
    let adjustRatioPartnerId = null;
    let teamTreeExpanded = {};

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
        { id: 'sp1', joinDate: '2024-05-12', wallet: '0x3f...12a', walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a', remark: '渠道-小王', ratio: 60, minSubRatio: 45, gap: 10, gapIncome: 1250, totalVol: 12500000, netDeposit: 500000, totalUsers: 1240, activeUsers: 420, settlementStatus: 'normal', name: '合伙人-小王' },
        { id: 'sp2', joinDate: '2024-05-10', wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J', ratio: 50, minSubRatio: 55, gap: 20, gapIncome: 980, gapIncomeUnsettled: 420, totalVol: 16200000, netDeposit: 820000, totalUsers: 850, activeUsers: 120, settlementStatus: 'team_tree_abnormal', abnormalLines: 5, name: 'KOL-J' },
        { id: 'sp3', joinDate: '2024-05-08', wallet: '0x5c...882', walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882', remark: '', ratio: 75, minSubRatio: 60, gap: -5, gapIncome: 0, totalVol: 2100000, netDeposit: -120000, totalUsers: 12, activeUsers: 0, settlementStatus: 'direct_inversion', name: '异常合伙人' },
        { id: 'sp4', joinDate: '2024-05-05', wallet: '0x2a...9f1', walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1', remark: '東南亞渠道', ratio: 55, minSubRatio: 40, gap: 15, gapIncome: 890, totalVol: 8900000, netDeposit: 320000, totalUsers: 620, activeUsers: 180, settlementStatus: 'normal', name: '东南亚渠道' },
        { id: 'sp5', joinDate: '2024-04-28', wallet: '0x7b...4c2', walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2', remark: '韓國KOL', ratio: 45, minSubRatio: 30, gap: 25, gapIncome: 2100, totalVol: 22400000, netDeposit: 980000, totalUsers: 1580, activeUsers: 510, settlementStatus: 'normal', name: '韩国KOL' }
    ];

    const teamTreeAbnormalData = {
        sp2: [
            { id: 'line1', title: '异常返佣线 1', summary: '0x8e...55c → 0xBc...4431 → 0x7a...E912', nodes: [
                { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                { wallet: '0xBc...4431', walletFull: '0xBc4431a2098f7e6d5c4b3a291807f6e5d4c3b4431', remark: '下级合伙人-A', ratio: '55%' },
                { wallet: '0x7a...E912', walletFull: '0x7aE912f6059483726180a9b8c7d6e5f4a3b2c1912', remark: '交易用户', ratio: '40%' }
            ]},
            { id: 'line2', title: '异常返佣线 2', summary: '0x8e...55c → 0xDe...8821 → 0xF1...009a', nodes: [
                { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                { wallet: '0xDe...8821', walletFull: '0xDe8821a0b9c8d7e6f504938271605948372618821', remark: '下级合伙人-B', ratio: '52%' },
                { wallet: '0xF1...009a', walletFull: '0xF1009a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3a', remark: '交易用户', ratio: '48%' }
            ]},
            { id: 'line3', title: '异常返佣线 3', summary: '0x8e...55c → 0xAa...1102 → 0x22...cc44', nodes: [
                { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                { wallet: '0xAa...1102', walletFull: '0xAa1102b3c4d5e6f708192a3b4c5d6e7f8091a1102', remark: '下级合伙人-C', ratio: '58%' },
                { wallet: '0x22...cc44', walletFull: '0x22cc44d5e6f708192a3b4c5d6e7f8091a2b3c4cc44', remark: '交易用户', ratio: '45%' }
            ]},
            { id: 'line4', title: '异常返佣线 4', summary: '0x8e...55c → 0x33...dd55 → 0x44...ee66', nodes: [
                { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                { wallet: '0x33...dd55', walletFull: '0x33dd55e6f708192a3b4c5d6e7f8091a2b3c4d5dd55', remark: '下级合伙人-D', ratio: '54%' },
                { wallet: '0x44...ee66', walletFull: '0x44ee66f708192a3b4c5d6e7f8091a2b3c4d5e6ee66', remark: '交易用户', ratio: '46%' }
            ]},
            { id: 'line5', title: '异常返佣线 5', summary: '0x8e...55c → 0x55...ff77 → 0x66...0088', nodes: [
                { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J（直属下级）', ratio: '50%' },
                { wallet: '0x55...ff77', walletFull: '0x55ff7708192a3b4c5d6e7f8091a2b3c4d5e6f7ff77', remark: '下级合伙人-E', ratio: '53%' },
                { wallet: '0x66...0088', walletFull: '0x660088192a3b4c5d6e7f8091a2b3c4d5e6f70880088', remark: '交易用户', ratio: '47%' }
            ]}
        ]
    };

    const directClientsData = [
        { joinDate: '2024-05-20', wallet: '0x99...F4d2', walletFull: '0x99F4d2a1b0c9d8e7f6059483726180a9b8c7d6e5', totalVol: 42500, totalFee: 42.50, rebate: 29.75, netDeposit: 5200 },
        { joinDate: '2024-05-18', wallet: '0xAb...12cd', walletFull: '0xAb12cd9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b12cd', totalVol: 128000, totalFee: 128.00, rebate: 89.60, netDeposit: 15000 },
        { joinDate: '2024-05-15', wallet: '0xCd...88ef', walletFull: '0xCd88ef7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d88ef', totalVol: 8900, totalFee: 8.90, rebate: 6.23, netDeposit: -1200 },
        { joinDate: '2024-05-12', wallet: '0xEf...33aa', walletFull: '0xEf33aa5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f33aa', totalVol: 256000, totalFee: 256.00, rebate: 179.20, netDeposit: 32000 }
    ];

    const overviewBase = {
        teamVol: 52450000,
        totalRebate: 12840.50,
        selfRebate: 200,
        directRebate: 1200,
        gapRebate: 11600,
        teamNetDeposit: 1240000,
        totalTradeUsers: 4850,
        activeTradeUsers: 1680,
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

    function esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function copyText(text, label) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                alert((label || '内容') + '已复制');
            }).catch(function () {
                alert('复制失败，请手动复制');
            });
        } else {
            alert('已复制: ' + text);
        }
    }

    function jsEsc(s) {
        return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }

    function copyChipBtn(text, label) {
        return '<button type="button" class="copy-chip-btn" title="复制" onclick="PartnerCenter.copyText(\'' + jsEsc(text) + '\', \'' + jsEsc(label || '内容') + '\')">📋</button>';
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

    function updateLinksPeriodButtons() {
        document.querySelectorAll('.links-period-btn').forEach(function (btn) {
            const p = btn.getAttribute('data-period');
            if (p === linksPeriod) {
                btn.className = 'links-period-btn px-3 py-1 text-[10px] font-bold bg-black text-white rounded-sm shadow-md';
            } else {
                btn.className = 'links-period-btn px-3 py-1 text-[10px] font-bold hover:bg-gray-50';
            }
        });
    }

    function findSubPartner(id) {
        return subPartnersData.find(function (r) { return r.id === id; });
    }

    function renderOverview() {
        const scale = PERIOD_SCALE[overviewPeriod] || 1;
        const vol = overviewBase.teamVol * scale;
        const rebate = overviewBase.totalRebate * scale;
        const self = overviewBase.selfRebate * scale;
        const direct = overviewBase.directRebate * scale;
        const gap = overviewBase.gapRebate * scale;
        const net = overviewBase.teamNetDeposit * scale;
        const totalUsers = overviewBase.totalTradeUsers;
        const activeUsers = Math.round(overviewBase.activeTradeUsers * Math.min(scale, 1.2));

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
        const totalEl = document.getElementById('overview-trade-users-total');
        if (totalEl) totalEl.textContent = fmtNum(totalUsers);
        const activeEl = document.getElementById('overview-trade-users-active');
        if (activeEl) activeEl.textContent = fmtNum(activeUsers) + ' 本周期交易';

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
            totalFee: function (r) { return r.totalFee * scale; },
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
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'directCount\')">直邀人數' + sortIconHtml('directCount', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'subPartnerCount\')">下級合伙人數' + sortIconHtml('subPartnerCount', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'totalVol\')">总交易额' + sortIconHtml('totalVol', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'totalFee\')">合计手续费' + sortIconHtml('totalFee', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'rebateIncome\')">合计返佣收入' + sortIconHtml('rebateIncome', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setLinksSort(\'netDeposit\')">总净入金' + sortIconHtml('netDeposit', linksSort) + '</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('links-table-body');
        if (!tbody) return;
        tbody.innerHTML = sliced.items.map(function (row) {
            const vol = row.totalVol * scale;
            const fee = row.totalFee * scale;
            const rebate = row.rebateIncome * scale;
            const linkUrl = 'https://forx.finance/?ref=' + row.code;
            return '<tr class="hover:bg-slate-50 transition-colors">' +
                '<td class="px-6 py-4 font-black">' + esc(row.remark) + '</td>' +
                '<td class="px-6 py-4 font-mono text-blue-600">' + esc(row.code) + '</td>' +
                '<td class="px-6 py-4 text-center font-bold">' + row.directCount + '</td>' +
                '<td class="px-6 py-4 text-center font-bold">' + row.subPartnerCount + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(vol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(fee) + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + fmtMoney(rebate) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold text-green-500">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-right space-x-2">' +
                '<button type="button" onclick="PartnerCenter.copyText(\'' + linkUrl + '\', \'邀请链接\')" class="text-blue-600 font-black hover:underline">複製連結</button>' +
                '<button class="text-gray-300">|</button>' +
                '<button type="button" onclick="openReferralModal(\'edit\', \'' + row.remark.replace(/'/g, "\\'") + '\', \'' + row.code + '\')" class="text-gray-400 hover:text-black">修改備註</button>' +
                '</td></tr>';
        }).join('');

        const countEl = document.getElementById('links-create-count');
        if (countEl) countEl.textContent = '+ 創建新連結 (已用 ' + inviteLinksData.length + '/50)';

        updateLinksPeriodButtons();
        buildPaginationHtml('links-pagination', sliced.page, sliced.total, 10, 'PartnerCenter.goLinksPage');
    }

    function settlementStatusCell(row) {
        if (row.settlementStatus === 'direct_inversion') {
            return '<span class="text-[10px] text-red-500 font-bold leading-snug">⚠️ 返佣比例已高于您，请立即调整</span>';
        }
        if (row.settlementStatus === 'team_tree_abnormal') {
            const n = row.abnormalLines || 1;
            return '<button type="button" onclick="PartnerCenter.openTeamTreeModal(\'' + row.id + '\')" class="text-[10px] text-amber-700 font-bold underline hover:text-amber-900 text-left">⚠️ 团队返佣树异常（' + n + ' 条）</button>';
        }
        return '<span class="text-[10px] text-gray-400">—</span>';
    }

    function gapIncomeCell(row, scale) {
        const gapIncome = row.gapIncome * scale;
        if (row.settlementStatus === 'direct_inversion' && !gapIncome) {
            return '<span class="font-black text-slate-400 italic">-- 暂停结算</span>';
        }
        if (row.settlementStatus === 'team_tree_abnormal' && row.gapIncomeUnsettled) {
            const unsettled = row.gapIncomeUnsettled * scale;
            return '<div><span class="font-black text-blue-600">' + fmtMoney(gapIncome) + '</span>' +
                '<span class="block text-[9px] text-amber-700 font-bold mt-0.5">含 ' + fmtMoney(unsettled) + ' 未结算</span></div>';
        }
        if (gapIncome) {
            return '<span class="font-black text-blue-600">' + fmtMoney(gapIncome) + '</span>';
        }
        return '<span class="font-black text-slate-400 italic">-- 暂停结算</span>';
    }

    function walletRemarkCell(row) {
        let html = '<div class="copy-chip"><span class="text-gray-900 font-black">' + esc(row.wallet) + '</span>' + copyChipBtn(row.walletFull || row.wallet, '钱包地址') + '</div>';
        if (row.remark) {
            html += '<div class="copy-chip mt-1"><span class="text-[10px] text-gray-400 font-bold">' + esc(row.remark) + '</span>' + copyChipBtn(row.remark, '备注') + '</div>';
        }
        return html;
    }

    function buildDrillData(row, scale, activeUsers, gapIncome) {
        const vol = row.totalVol * scale;
        return JSON.stringify({
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
            const activeUsers = Math.round(row.activeUsers * Math.min(scale, 1.2));
            const gapIncome = row.gapIncome * scale;
            const vol = row.totalVol * scale;
            const rowClass = isDirectBad ? 'bg-red-50/30' : 'hover:bg-slate-50';
            const ratioClass = isDirectBad ? 'text-red-600 underline font-black' : 'text-gray-700 font-bold';
            const gapClass = row.gap < 0 ? 'bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-sm' : 'gap-tag';
            const drillData = buildDrillData(row, scale, activeUsers, gapIncome);
            const teamBtn = '<button type="button" onclick="drillDownToTeam(' + drillData + ')" class="text-blue-600 font-black hover:underline">查看团队</button>';

            return '<tr class="' + rowClass + ' transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4">' + walletRemarkCell(row) + '</td>' +
                '<td class="px-6 py-4 text-center ' + ratioClass + '">' + row.ratio + '%</td>' +
                '<td class="px-6 py-4 text-center"><span class="' + gapClass + '">' + row.gap + '%</span></td>' +
                '<td class="px-6 py-4">' + settlementStatusCell(row) + '</td>' +
                '<td class="px-6 py-4 text-right">' + gapIncomeCell(row, scale) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold' + (isDirectBad ? ' text-gray-400' : '') + '">' + fmtMoney(vol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold text-green-500">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="text-gray-900 font-black">' + fmtNum(row.totalUsers) + '</span><span class="text-[9px] text-gray-400 block font-bold">' + fmtNum(activeUsers) + ' 本周期交易</span></td>' +
                '<td class="px-6 py-4 text-right">' + teamBtn +
                '<span class="mx-2 text-gray-200">|</span>' +
                '<button type="button" class="text-gray-400 font-black hover:text-black hover:underline" onclick="PartnerCenter.openAdjustRatioModal(\'' + row.id + '\')">调整</button></td>' +
                '</tr>';
        }).join('');
    }

    function renderDirectClients() {
        const getters = {
            totalVol: function (r) { return r.totalVol; },
            totalFee: function (r) { return r.totalFee; },
            rebate: function (r) { return r.rebate; },
            netDeposit: function (r) { return r.netDeposit; }
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
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="PartnerCenter.setDirectClientSort(\'netDeposit\')">净入金' + sortIconHtml('netDeposit', directClientSort) + '</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('direct-client-table-body');
        if (!tbody) return;
        tbody.innerHTML = sorted.map(function (row) {
            const netClass = row.netDeposit >= 0 ? 'text-green-500' : 'text-red-400';
            return '<tr class="hover:bg-slate-50 transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4"><div class="copy-chip"><span class="font-black text-gray-900">' + esc(row.wallet) + '</span>' + copyChipBtn(row.walletFull || row.wallet, '钱包地址') + '</div></td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalVol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalFee) + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + fmtMoney(row.rebate) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold ' + netClass + '">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-right">' +
                '<button type="button" onclick="PartnerCenter.openAddSubPartnerModal(\'' + row.wallet + '\')" class="text-blue-600 font-black hover:underline">设置为下级合伙人</button>' +
                '</td></tr>';
        }).join('');
    }

    function renderTeamTreeLine(line, partnerId, expanded) {
        const key = partnerId + '_' + line.id;
        const isOpen = expanded[key];
        let nodesHtml = '';
        if (isOpen) {
            nodesHtml = line.nodes.map(function (node, i) {
                const pad = 12 + i * 16;
                return '<div class="flex items-center gap-2 py-2 border-l-2 border-amber-200 ml-3" style="padding-left:' + pad + 'px">' +
                    '<div class="flex-1 min-w-0">' +
                    '<div class="copy-chip"><span class="font-mono font-black text-gray-900 text-[11px]">' + esc(node.wallet) + '</span>' + copyChipBtn(node.walletFull || node.wallet, '钱包地址') + '</div>' +
                    '<div class="copy-chip mt-0.5"><span class="text-[10px] text-gray-500 font-bold">' + esc(node.remark) + '</span>' + copyChipBtn(node.remark, '备注') + '</div>' +
                    '</div>' +
                    '<span class="text-[11px] font-black text-amber-700 shrink-0">' + esc(node.ratio) + '</span></div>';
            }).join('');
        }
        return '<div class="tree-line-panel">' +
            '<div class="tree-line-header flex items-center justify-between px-4 py-3 hover:bg-amber-50/80" onclick="PartnerCenter.toggleTeamTreeLine(\'' + partnerId + '\', \'' + line.id + '\')">' +
            '<div><p class="font-black text-amber-900 text-[11px]">' + esc(line.title) + '</p>' +
            '<p class="text-[10px] text-amber-700/80 font-medium mt-0.5 truncate max-w-[520px]">' + esc(line.summary) + '</p></div>' +
            '<span class="text-[10px] font-black text-amber-600 shrink-0 ml-2">' + (isOpen ? '收起' : '展开') + '</span></div>' +
            (isOpen ? '<div class="tree-line-body px-2 pb-2">' + nodesHtml + '</div>' : '') +
            '</div>';
    }

    function renderTeamTreeModalBody(partnerId) {
        const lines = teamTreeAbnormalData[partnerId] || [];
        const body = document.getElementById('team-tree-modal-body');
        if (!body) return;
        body.innerHTML = lines.map(function (line) {
            return renderTeamTreeLine(line, partnerId, teamTreeExpanded);
        }).join('');
    }

    function openTeamTreeModal(partnerId) {
        const partner = findSubPartner(partnerId);
        const subtitle = document.getElementById('team-tree-modal-subtitle');
        if (subtitle && partner) {
            subtitle.textContent = partner.wallet + (partner.remark ? ' · ' + partner.remark : '') + ' · 共 ' + (partner.abnormalLines || linesCount(partnerId)) + ' 条异常线';
        }
        teamTreeExpanded = {};
        renderTeamTreeModalBody(partnerId);
        window._teamTreeModalPartnerId = partnerId;
        toggleModal('modal-team-tree');
    }

    function linesCount(partnerId) {
        return (teamTreeAbnormalData[partnerId] || []).length;
    }

    function updateAdjustRatioWarning(ratio, partner) {
        const warn = document.getElementById('adjust-ratio-warning');
        if (!warn || !partner) return;
        const minSub = partner.minSubRatio || 0;
        if (ratio < minSub) {
            warn.classList.remove('hidden');
            warn.innerHTML = '当前设置 <strong>' + ratio + '%</strong> 低于其下级最高比例 <strong>' + minSub + '%</strong>，将触发返佣倒挂并暂停相关交易额结算。请确认已与下级沟通后再调整。';
        } else if (ratio > MY_MAX_RATIO) {
            warn.classList.remove('hidden');
            warn.textContent = '返佣比例不能超过您的最高比例 ' + MY_MAX_RATIO + '%。';
        } else {
            warn.classList.add('hidden');
            warn.textContent = '';
        }
    }

    function openAdjustRatioModal(partnerId) {
        const partner = findSubPartner(partnerId);
        if (!partner) return;
        adjustRatioPartnerId = partnerId;
        const walletEl = document.getElementById('adjust-ratio-wallet');
        const remarkEl = document.getElementById('adjust-ratio-remark');
        const remarkRow = document.getElementById('adjust-ratio-remark-row');
        const slider = document.getElementById('adjust-ratio-slider');
        const display = document.getElementById('adjust-ratio-display');
        if (walletEl) walletEl.textContent = partner.wallet;
        if (remarkEl && remarkRow) {
            if (partner.remark) {
                remarkEl.textContent = partner.remark;
                remarkRow.classList.remove('hidden');
            } else {
                remarkRow.classList.add('hidden');
            }
        }
        if (slider) slider.value = partner.ratio;
        if (display) display.textContent = partner.ratio + '%';
        updateAdjustRatioWarning(partner.ratio, partner);
        toggleModal('modal-adjust-ratio');
    }

    function onTableSwitch(tableId) {
        activeOverviewTable = tableId;
        const filterEl = document.getElementById('sub-partner-status-filter');
        if (filterEl) {
            if (tableId === 'direct-client') {
                filterEl.classList.add('hidden');
            } else {
                filterEl.classList.remove('hidden');
            }
        }
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
        copyText: copyText,
        openTeamTreeModal: openTeamTreeModal,
        toggleTeamTreeLine: function (partnerId, lineId) {
            const key = partnerId + '_' + lineId;
            teamTreeExpanded[key] = !teamTreeExpanded[key];
            renderTeamTreeModalBody(partnerId);
        },
        expandAllTeamTrees: function () {
            const partnerId = window._teamTreeModalPartnerId;
            if (!partnerId) return;
            (teamTreeAbnormalData[partnerId] || []).forEach(function (line) {
                teamTreeExpanded[partnerId + '_' + line.id] = true;
            });
            renderTeamTreeModalBody(partnerId);
        },
        openAdjustRatioModal: openAdjustRatioModal,
        onAdjustRatioInput: function (val) {
            const display = document.getElementById('adjust-ratio-display');
            if (display) display.textContent = val + '%';
            const partner = findSubPartner(adjustRatioPartnerId);
            updateAdjustRatioWarning(parseInt(val, 10), partner);
        },
        copyAdjustWallet: function () {
            const partner = findSubPartner(adjustRatioPartnerId);
            if (partner) copyText(partner.walletFull || partner.wallet, '钱包地址');
        },
        copyAdjustRemark: function () {
            const partner = findSubPartner(adjustRatioPartnerId);
            if (partner && partner.remark) copyText(partner.remark, '备注');
        },
        submitAdjustRatio: function () {
            const partner = findSubPartner(adjustRatioPartnerId);
            const slider = document.getElementById('adjust-ratio-slider');
            if (!partner || !slider) return;
            const ratio = parseInt(slider.value, 10);
            if (ratio > MY_MAX_RATIO) {
                alert('返佣比例不能超过 ' + MY_MAX_RATIO + '%');
                return;
            }
            if (ratio < (partner.minSubRatio || 0)) {
                if (!confirm('当前比例低于下级最高比例，将暂停相关返佣结算。是否确认调整？')) return;
            }
            partner.ratio = ratio;
            partner.gap = MY_MAX_RATIO - ratio;
            if (ratio >= partner.minSubRatio && ratio <= MY_MAX_RATIO) {
                partner.settlementStatus = 'normal';
            }
            toggleModal('modal-adjust-ratio');
            alert('返佣比例已更新为 ' + ratio + '%');
            renderSubPartners();
        },
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
        onTableSwitch: onTableSwitch,
        init: function () {
            onTableSwitch(activeOverviewTable);
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
