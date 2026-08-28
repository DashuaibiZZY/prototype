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
    let teamTreeModalMasked = false;

    let drillStack = [];
    let drillPeriod = '1W';
    let drillSubFilter = 'all';
    let drillSubSearch = '';
    let drillActiveTable = 'sub-agent';
    let drillSubSort = { key: null, dir: 'desc' };
    let drillClientSort = { key: null, dir: 'desc' };

    let subPartnerPage = 1;
    let directClientPage = 1;
    let drillSubPartnerPage = 1;
    let drillClientPage = 1;
    let settlementPage = 1;
    let settlementDateFilter = '';
    let settlementStatusFilter = 'all';

    const mySuperiorInfo = {
        level: 2,
        parentUid: '10085088',
        parentWallet: '0x1a2b...3c4d',
        parentWalletFull: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
        myRatio: 70
    };

    const myPartnerProfile = {
        uid: '10086000',
        wallet: '0x9f...8a1',
        walletFull: '0x9f8a1b2c3d4e5f60718293a4b5c6d7e8f9012a9f8',
        ratio: 70
    };

    const settlementRecords = [
        { date: '2024-05-23', vol: 0, rebate: 0, status: 'pending' },
        { date: '2024-05-22', vol: 1240000, rebate: 868, status: 'settled' },
        { date: '2024-05-21', vol: 980000, rebate: 686, status: 'settled' },
        { date: '2024-05-20', vol: 86800, rebate: 0, status: 'rebate_stopped' },
        { date: '2024-05-19', vol: 820000, rebate: 1345.23, violationDeduction: 342.23, status: 'settled' },
        { date: '2024-05-18', vol: 650000, rebate: 455, status: 'settled' },
        { date: '2024-05-17', vol: 420000, rebate: 294, status: 'pending' },
        { date: '2024-05-16', vol: 380000, rebate: 266, status: 'settled' },
        { date: '2024-05-15', vol: 125000, rebate: 0, status: 'rebate_stopped' },
        { date: '2024-05-14', vol: 290000, rebate: 203, status: 'settled' },
        { date: '2024-05-13', vol: 510000, rebate: 357, status: 'settled' },
        { date: '2024-05-12', vol: 0, rebate: 0, status: 'pending' }
    ];

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
        { id: 'sp1', joinDate: '2024-05-12', wallet: '0x3f...12a', walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a', remark: '渠道-小王', ratio: 60, minSubRatio: 45, gap: 10, gapIncome: 1250, totalVol: 12500000, netDeposit: 500000, totalUsers: 3680, activeUsers: 1850, settlementStatus: 'normal', name: '合伙人-小王', hasTeam: true },
        { id: 'sp2', joinDate: '2024-05-10', wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J', ratio: 50, minSubRatio: 40, gap: 20, gapIncome: 560, totalVol: 16200000, netDeposit: 820000, totalUsers: 850, activeUsers: 120, settlementStatus: 'normal', name: 'KOL-J', hasTeam: true },
        { id: 'sp3', joinDate: '2024-05-08', wallet: '0x5c...882', walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882', remark: '', ratio: 55, minSubRatio: 40, gap: 15, gapIncome: 320, totalVol: 2100000, netDeposit: -120000, totalUsers: 12, activeUsers: 0, settlementStatus: 'normal', name: '合伙人-C', hasTeam: true },
        { id: 'sp4', joinDate: '2024-05-05', wallet: '0x2a...9f1', walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1', remark: '東南亞渠道', ratio: 55, minSubRatio: 40, gap: 15, gapIncome: 890, totalVol: 8900000, netDeposit: 320000, totalUsers: 620, activeUsers: 180, settlementStatus: 'normal', name: '东南亚渠道', hasTeam: true },
        { id: 'sp5', joinDate: '2024-04-28', wallet: '0x7b...4c2', walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2', remark: '韓國KOL', ratio: 45, minSubRatio: 30, gap: 25, gapIncome: 2100, totalVol: 22400000, netDeposit: 980000, totalUsers: 1580, activeUsers: 510, settlementStatus: 'normal', name: '韩国KOL', hasTeam: true }
    ];


    const directClientsData = [
        { joinDate: '2024-05-20', wallet: '0x99...F4d2', walletFull: '0x99F4d2a1b0c9d8e7f6059483726180a9b8c7d6e5', totalVol: 42500, totalFee: 42.50, rebate: 29.75, netDeposit: 5200 },
        { joinDate: '2024-05-18', wallet: '0xAb...12cd', walletFull: '0xAb12cd9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b12cd', totalVol: 128000, totalFee: 128.00, rebate: 89.60, netDeposit: 15000 },
        { joinDate: '2024-05-15', email: 'demo.trader@forx.io', totalVol: 8900, totalFee: 8.90, rebate: 6.23, netDeposit: -1200 },
        { joinDate: '2024-05-12', wallet: '0xEf...33aa', walletFull: '0xEf33aa5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f33aa', totalVol: 256000, totalFee: 256.00, rebate: 179.20, netDeposit: 32000 }
    ];

    const drillTeams = {
        sp1: {
            name: '合伙人-小王',
            label: '渠道-小王',
            wallet: '0x3f...12a',
            walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a',
            joinDate: '2024-05-12',
            ratio: 60,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 12500000, totalRebate: 13000, selfRebate: 200, directRebate: 1200, gapRebate: 11600, teamNetDeposit: 524000, totalUsers: 3680, activeUsers: 1850 },
            abnormalText: null,
            subPartners: [
                { id: 'sp1_a', joinDate: '2024-05-11', wallet: '0x4a...b21', walletFull: '0x4ab21c32d54e67f8091a2b3c4d5e6f70891a2b21', ratio: 45, gap: 15, gapIncome: 420, totalVol: 4200000, netDeposit: 180000, totalUsers: 920, activeUsers: 310, settlementStatus: 'normal', name: '二级-KOL', hasTeam: true },
                { id: 'sp1_b', joinDate: '2024-05-09', wallet: '0x9c...a12', walletFull: '0x9ca12b34c56d78e90f1234567890abcdef9ca12', ratio: 50, gap: 10, gapIncome: 120, totalVol: 3100000, netDeposit: 95000, totalUsers: 480, activeUsers: 85, settlementStatus: 'normal', name: '下级-X', hasTeam: true },
            ],
            directClients: [
                { joinDate: '2024-05-19', wallet: '0x11...aa01', walletFull: '0x11aa01bb02cc03dd04ee05ff06gg07hh08ii01', totalVol: 52000, totalFee: 52.00, rebate: 36.40, netDeposit: 8000 },
                { joinDate: '2024-05-16', wallet: '0x22...bb02', walletFull: '0x22bb02cc03dd04ee05ff06gg07hh08ii09jj02', totalVol: 18500, totalFee: 18.50, rebate: 12.95, netDeposit: 2200 }
            ]
        },
        sp1_a: {
            name: '二级-KOL',
            label: '二级-KOL',
            wallet: '0x4a...b21',
            walletFull: '0x4ab21c32d54e67f8091a2b3c4d5e6f70891a2b21',
            joinDate: '2024-05-11',
            ratio: 45,
            superiorLevel: 3,
            superiorWallet: '0x3f...12a',
            superiorWalletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a',
            overview: { teamVol: 4200000, totalRebate: 3200, selfRebate: 80, directRebate: 400, gapRebate: 2320, teamNetDeposit: 180000, totalUsers: 920, activeUsers: 310 },
            abnormalText: null,
            subPartners: [
                { id: 'sp1_a_x', joinDate: '2024-05-07', wallet: '0x5b...c32', walletFull: '0x5bc32d43e54f60718293a4b5c6d7e8f9012a3b4c32', ratio: 35, gap: 10, gapIncome: 180, totalVol: 980000, netDeposit: 42000, totalUsers: 210, activeUsers: 68, settlementStatus: 'normal', name: '三级渠道', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-14', wallet: '0x33...cc03', walletFull: '0x33cc03dd04ee05ff06gg07hh08ii09jj10kk03', totalVol: 31000, totalFee: 31.00, rebate: 21.70, netDeposit: 4500 }
            ]
        },
        sp2: {
            name: 'KOL-J',
            label: '推特KOL-J',
            wallet: '0x8e...55c',
            walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c',
            joinDate: '2024-05-10',
            ratio: 50,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 16200000, totalRebate: 8400, selfRebate: 150, directRebate: 900, gapRebate: 6650, teamNetDeposit: 820000, totalUsers: 850, activeUsers: 120 },
            abnormalText: null,
            subPartners: [
                { id: 'sp2_a', joinDate: '2024-05-06', wallet: '0xBc...4431', walletFull: '0xBc4431a2098f7e6d5c4b3a291807f6e5d4c3b4431', ratio: 40, gap: 10, gapIncome: 0, totalVol: 5200000, netDeposit: 210000, totalUsers: 380, activeUsers: 55, settlementStatus: 'normal', name: '下级-A', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-13', wallet: '0x44...dd04', walletFull: '0x44dd04ee05ff06gg07hh08ii09jj10kk11ll04', totalVol: 72000, totalFee: 72.00, rebate: 50.40, netDeposit: 9800 }
            ]
        },
        sp4: {
            name: '东南亚渠道',
            label: '東南亞渠道',
            wallet: '0x2a...9f1',
            walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1',
            joinDate: '2024-05-05',
            ratio: 55,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 8900000, totalRebate: 5200, selfRebate: 120, directRebate: 680, gapRebate: 4000, teamNetDeposit: 320000, totalUsers: 620, activeUsers: 180 },
            abnormalText: null,
            subPartners: [],
            directClients: [
                { joinDate: '2024-05-17', wallet: '0x55...ee05', walletFull: '0x55ee05ff06gg07hh08ii09jj10kk11ll12mm05', totalVol: 44000, totalFee: 44.00, rebate: 30.80, netDeposit: 5600 },
                { joinDate: '2024-05-11', wallet: '0x66...ff06', walletFull: '0x66ff06gg07hh08ii09jj10kk11ll12mm13nn06', totalVol: 22000, totalFee: 22.00, rebate: 15.40, netDeposit: 3100 }
            ]
        },
        sp5: {
            name: '韩国KOL',
            label: '韓國KOL',
            wallet: '0x7b...4c2',
            walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2',
            joinDate: '2024-04-28',
            ratio: 45,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 22400000, totalRebate: 11200, selfRebate: 280, directRebate: 1400, gapRebate: 9520, teamNetDeposit: 980000, totalUsers: 1580, activeUsers: 510 },
            abnormalText: null,
            subPartners: [
                { id: 'sp5_a', joinDate: '2024-04-20', wallet: '0x88...0d3', walletFull: '0x880d3e4f5a6b7c8d9e0f1a2b3c4d5e6f70880d3', ratio: 35, gap: 10, gapIncome: 520, totalVol: 6800000, netDeposit: 290000, totalUsers: 420, activeUsers: 140, settlementStatus: 'normal', name: '韩国下级', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-08', wallet: '0x77...gg07', walletFull: '0x77gg07hh08ii09jj10kk11ll12mm13nn14oo07', totalVol: 98000, totalFee: 98.00, rebate: 68.60, netDeposit: 12000 }
            ]
        },
        sp3: {
            name: '异常合伙人',
            label: '异常合伙人',
            wallet: '0x5c...882',
            walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882',
            joinDate: '2024-05-08',
            ratio: 75,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 2100000, totalRebate: 0, selfRebate: 0, directRebate: 0, gapRebate: 0, teamNetDeposit: -120000, totalUsers: 12, activeUsers: 0 },
            abnormalText: null,
            subPartners: [],
            directClients: [
                { joinDate: '2024-05-07', wallet: '0xaa...0011', walletFull: '0xaa0011bb22cc33dd44ee55ff66778899aa0011', totalVol: 15000, totalFee: 15.00, rebate: 0, netDeposit: -800 }
            ]
        }
    };

    (function bootstrapPartnerUserUids() {
        let seq = 10086001;
        function ensure(row) {
            if (row && !row.uid) row.uid = String(seq++);
        }
        function walk(arr) {
            if (!arr) return;
            arr.forEach(function (row) {
                ensure(row);
                if (row.subPartners) walk(row.subPartners);
                if (row.directClients) walk(row.directClients);
            });
        }
        walk(subPartnersData);
        walk(directClientsData);
        Object.keys(drillTeams).forEach(function (k) {
            const t = drillTeams[k];
            ensure(t);
            walk(t.subPartners);
            walk(t.directClients);
        });
    })();

    const overviewBase = {
        teamVol: 52450000,
        totalRebate: 12840.50,
        selfRebate: 200,
        directRebate: 1200,
        gapRebate: 11600,
        teamNetDeposit: 1240000,
        totalTradeUsers: 3680,
        activeTradeUsers: 1850,
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
                alert('复制失败');
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

    function userScaleCell(activeUsers, totalUsers) {
        return '<span class="text-gray-900 font-black">' + fmtNum(activeUsers) + ' 交易用户</span>' +
            '<span class="text-[9px] text-gray-400 block font-bold">' + fmtNum(totalUsers) + ' 总用户</span>';
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

    function currentDrillId() {
        return drillStack.length ? drillStack[drillStack.length - 1] : null;
    }

    function currentDrillTeam() {
        const id = currentDrillId();
        return id ? drillTeams[id] : null;
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
        const activeEl = document.getElementById('overview-trade-users-active');
        if (activeEl) activeEl.innerHTML = fmtNum(activeUsers) + ' <span class="text-base font-bold text-gray-600">交易用户</span>';
        const totalEl = document.getElementById('overview-trade-users-total');
        if (totalEl) totalEl.textContent = fmtNum(totalUsers) + ' 总用户';

        updatePeriodButtons('overview-period-btn', overviewPeriod);
        renderMySuperior();
        renderSubPartnersTable({ masked: false });
        renderDirectClientsTable({ masked: false });
    }

    function renderPartnerIdentityBar(superiorElId, ratioElId, info) {
        const el = document.getElementById(superiorElId);
        if (el) {
            if (info.superiorLevel <= 1) {
                el.innerHTML = '<span class="text-blue-600 font-black">一级代理</span>';
            } else if (info.masked) {
                el.innerHTML = '<span class="font-mono font-black text-gray-900">' + esc(info.superiorUid || info.superiorWallet) + '</span>';
            } else {
                let html = '<div class="copy-chip"><span class="font-mono font-black">' + esc(info.superiorUid || '—') + '</span>' +
                    copyChipBtn(info.superiorUid || '', '上级 UID') + '</div>';
                if (info.superiorWallet) {
                    html += '<div class="copy-chip mt-1"><span class="text-[10px] text-gray-500 font-mono">' + esc(info.superiorWallet) + '</span>' +
                        copyChipBtn(info.superiorWalletFull || info.superiorWallet, '上级钱包地址') + '</div>';
                }
                el.innerHTML = html;
            }
        }
        const ratioEl = document.getElementById(ratioElId);
        if (ratioEl) ratioEl.textContent = info.ratio + '%';
    }

    function renderMySuperior() {
        renderPartnerIdentityBar('overview-my-superior', 'overview-my-ratio', {
            superiorLevel: mySuperiorInfo.level,
            superiorUid: mySuperiorInfo.parentUid,
            superiorWallet: mySuperiorInfo.parentWallet,
            superiorWalletFull: mySuperiorInfo.parentWalletFull,
            ratio: mySuperiorInfo.myRatio,
            masked: false
        });
    }

    function drillParentContext() {
        if (drillStack.length > 0) {
            const parentId = drillStack[drillStack.length - 1];
            const parentTeam = drillTeams[parentId];
            if (parentTeam) {
                return {
                    wallet: parentTeam.wallet,
                    walletFull: parentTeam.walletFull || parentTeam.wallet,
                    level: parentTeam.superiorLevel ? parentTeam.superiorLevel + 1 : 2
                };
            }
        }
        return {
            wallet: myPartnerProfile.wallet,
            walletFull: myPartnerProfile.walletFull,
            level: mySuperiorInfo.level
        };
    }

    function clampRatio(val) {
        const n = parseInt(val, 10);
        if (isNaN(n)) return 0;
        return Math.max(0, Math.min(MY_MAX_RATIO, n));
    }

    function setAdjustRatioValue(ratio) {
        ratio = clampRatio(ratio);
        const slider = document.getElementById('adjust-ratio-slider');
        const input = document.getElementById('adjust-ratio-input');
        const display = document.getElementById('adjust-ratio-display');
        if (slider) slider.value = ratio;
        if (input) input.value = ratio;
        if (display) display.textContent = ratio + '%';
        const partner = findSubPartner(adjustRatioPartnerId);
        updateAdjustRatioWarning(ratio, partner);
    }

    function settlementStatusLabel(status) {
        if (status === 'pending') return '<span class="text-amber-600 font-bold">待结算</span>';
        if (status === 'settled') return '<span class="text-green-600 font-bold">已结算</span>';
        if (status === 'rebate_stopped') return '<span class="text-red-500 font-bold">返佣异常停止结算</span>';
        return '<span class="text-gray-400">—</span>';
    }

    function rebateAmountCell(row) {
        let html = '<span class="font-black text-blue-600">' + fmtMoney(row.rebate) + '</span>';
        if (row.violationDeduction) {
            html += '<span class="block text-[9px] text-red-500 font-bold mt-0.5">违规-' + fmtMoney(row.violationDeduction) + '</span>';
        }
        return html;
    }

    function renderSettlementTable() {
        let filtered = settlementRecords.filter(function (row) {
            if (settlementDateFilter && row.date !== settlementDateFilter) return false;
            if (settlementStatusFilter !== 'all' && row.status !== settlementStatusFilter) return false;
            return true;
        });
        const sliced = slicePage(filtered, settlementPage, 10);
        settlementPage = sliced.page;

        const thead = document.getElementById('settlement-table-head');
        if (thead) {
            thead.innerHTML = '<tr>' +
                '<th class="px-6 py-4">结算日期</th>' +
                '<th class="px-6 py-4 text-right">交易额</th>' +
                '<th class="px-6 py-4 text-right text-blue-600">返佣金额</th>' +
                '<th class="px-6 py-4 text-right">结算状态</th>' +
                '</tr>';
        }

        const tbody = document.getElementById('settlement-table-body');
        if (tbody) {
            tbody.innerHTML = sliced.items.map(function (row) {
                const rowClass = row.status === 'rebate_stopped' ? 'bg-red-50/30' : (row.status === 'pending' ? 'bg-amber-50/30' : 'hover:bg-slate-50');
                return '<tr class="' + rowClass + ' transition-colors">' +
                    '<td class="px-6 py-4 text-gray-900">' + row.date + '</td>' +
                    '<td class="px-6 py-4 text-right text-gray-700">' + fmtMoney(row.vol) + '</td>' +
                    '<td class="px-6 py-4 text-right">' + rebateAmountCell(row) + '</td>' +
                    '<td class="px-6 py-4 text-right">' + settlementStatusLabel(row.status) + '</td>' +
                    '</tr>';
            }).join('');
        }

        buildPaginationHtml('settlement-pagination', sliced.page, sliced.total, 10, 'PartnerCenter.goSettlementPage');
    }

    function renderDrillOverview() {
        const team = currentDrillTeam();
        if (!team) return;
        const scale = PERIOD_SCALE[drillPeriod] || 1;
        const o = team.overview;
        const vol = o.teamVol * scale;
        const rebate = o.totalRebate * scale;
        const activeUsers = Math.round(o.activeUsers * Math.min(scale, 1.2));

        const titleEl = document.getElementById('drill-page-title');
        if (titleEl) titleEl.textContent = team.name + ' 的团队';
        const subEl = document.getElementById('drill-page-subtitle');
        if (subEl) subEl.textContent = team.wallet + ' · 加入 ' + team.joinDate + (drillStack.length > 1 ? ' · 层级 ' + drillStack.length : '');

        const set = function (id, text) { const el = document.getElementById(id); if (el) el.textContent = text; };
        set('drill-team-vol', fmtMoney(vol));
        set('drill-total-rebate', fmtMoney(rebate));
        set('drill-self-rebate', fmtMoney(o.selfRebate * scale));
        set('drill-direct-rebate', fmtMoney(o.directRebate * scale));
        set('drill-gap-rebate', fmtMoney(o.gapRebate * scale));
        set('drill-team-net', fmtMoney(o.teamNetDeposit * scale, { signed: true }));

        const activeUserEl = document.getElementById('drill-users-active');
        if (activeUserEl) activeUserEl.innerHTML = fmtNum(activeUsers) + ' <span class="text-base font-bold text-gray-600">交易用户</span>';
        set('drill-users-total', fmtNum(o.totalUsers) + ' 总用户');

        updatePeriodButtons('drill-period-btn', drillPeriod);
        renderPartnerIdentityBar('drill-my-superior', 'drill-my-ratio', {
            superiorLevel: team.superiorLevel || 2,
            superiorWallet: team.superiorWallet || myPartnerProfile.wallet,
            superiorWalletFull: team.superiorWalletFull || myPartnerProfile.walletFull,
            ratio: team.ratio || 0,
            masked: true
        });
        renderSubPartnersTable({ masked: true, drill: true });
        renderDirectClientsTable({ masked: true, drill: true });
        updateDrillTableTabs();
    }

    function settlementStatusCell(row, scale, masked) {
        return '<span class="text-[10px] text-gray-400">—</span>';
    }

    function gapIncomeCell(row, scale) {
        const gapIncome = row.gapIncome * scale;
        if (gapIncome) {
            return '<span class="font-black text-blue-600">' + fmtMoney(gapIncome) + '</span>';
        }
        return '<span class="font-black text-slate-400 italic">—</span>';
    }

    function matchUserSearch(row, q) {
        const hay = [row.uid, row.wallet, row.walletFull, row.email, row.remark, row.note].filter(Boolean).join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
    }

    function partnerUidCell(row, masked) {
        const uid = row.uid || '—';
        if (masked) {
            let html = '<span class="text-gray-900 font-black font-mono">' + esc(uid) + '</span>';
            if (row.remark) html += '<span class="block text-[10px] text-gray-400 font-bold mt-0.5">' + esc(row.remark) + '</span>';
            return html;
        }
        let html = '<div class="copy-chip"><span class="text-gray-900 font-black">' + esc(uid) + '</span>' + copyChipBtn(uid, 'UID') + '</div>';
        if (row.remark) {
            html += '<div class="copy-chip mt-1"><span class="text-[10px] text-gray-400 font-bold">' + esc(row.remark) + '</span>' + copyChipBtn(row.remark, '备注') + '</div>';
        }
        return html;
    }

    function partnerContactCell(row, masked) {
        if (masked) {
            if (row.wallet) return '<span class="text-[10px] text-gray-400 font-bold font-mono">' + esc(row.wallet) + '</span>';
            if (row.email) return '<span class="text-[10px] text-gray-400 font-bold">' + esc(row.email) + '</span>';
            return '<span class="text-gray-300">—</span>';
        }
        if (row.wallet) {
            return '<div class="copy-chip"><span class="text-[10px] text-gray-500 font-bold font-mono">' + esc(row.wallet) + '</span>' + copyChipBtn(row.walletFull || row.wallet, '钱包地址') + '</div>';
        }
        if (row.email) {
            return '<div class="copy-chip"><span class="text-[10px] text-gray-500 font-bold">' + esc(row.email) + '</span>' + copyChipBtn(row.email, '邮箱') + '</div>';
        }
        return '<span class="text-gray-300">—</span>';
    }

    function userIdentityCell(row, masked) {
        return partnerUidCell(row, masked) + '<div class="mt-1">' + partnerContactCell(row, masked) + '</div>';
    }

    function walletRemarkCell(row, masked) {
        return userIdentityCell(row, masked);
    }

    function renderSubPartnersTable(opts) {
        opts = opts || {};
        const masked = opts.masked;
        const drill = opts.drill;
        const scale = drill ? (PERIOD_SCALE[drillPeriod] || 1) : (PERIOD_SCALE[overviewPeriod] || 1);
        const sortState = drill ? drillSubSort : subPartnerSort;
        const headId = drill ? 'drill-sub-partner-table-head' : 'sub-partner-table-head';
        const bodyId = drill ? 'drill-sub-partner-table-body' : 'sub-partner-table-body';

        let list = drill ? (currentDrillTeam() ? currentDrillTeam().subPartners : []) : subPartnersData;
        const filter = drill ? drillSubFilter : subPartnerFilter;
        const search = drill ? drillSubSearch : subPartnerSearch;

        let filtered = list.filter(function (row) {
            if (filter !== 'all' && row.settlementStatus !== filter) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return matchUserSearch(row, q);
        });

        const getters = {
            gapIncome: function (r) { return r.gapIncome * scale; },
            totalVol: function (r) { return r.totalVol * scale; },
            netDeposit: function (r) { return r.netDeposit; },
            tradeUsers: function (r) { return r.activeUsers; }
        };
        filtered = applySort(filtered, sortState, getters);

        const pageKey = drill ? drillSubPartnerPage : subPartnerPage;
        const sliced = slicePage(filtered, pageKey, 10);
        if (drill) drillSubPartnerPage = sliced.page;
        else subPartnerPage = sliced.page;

        const paginationId = drill ? 'drill-sub-partner-pagination' : 'sub-partner-pagination';
        const goFn = drill ? 'PartnerCenter.goDrillSubPage' : 'PartnerCenter.goSubPartnerPage';

        const sortFn = drill ? 'PartnerCenter.setDrillSubSort' : 'PartnerCenter.setSubPartnerSort';
        const thead = document.getElementById(headId);
        if (thead) {
            const partnerCol = masked ? '下级合伙人' : '下级合伙人 UID';
            thead.innerHTML =
                '<tr>' +
                '<th class="px-6 py-4">加入时间</th>' +
                '<th class="px-6 py-4">' + partnerCol + '</th>' +
                '<th class="px-6 py-4">钱包 / 邮箱</th>' +
                '<th class="px-6 py-4 text-center">设置比例</th>' +
                '<th class="px-6 py-4 text-center">我的级差</th>' +
                '<th class="px-6 py-4">结算状态</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'gapIncome\')">贡献级差收入' + sortIconHtml('gapIncome', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'totalVol\')">总交易额' + sortIconHtml('totalVol', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'netDeposit\')">总净入金' + sortIconHtml('netDeposit', sortState) + '</th>' +
                '<th class="px-6 py-4 text-center cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'tradeUsers\')">用户规模' + sortIconHtml('tradeUsers', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById(bodyId);
        if (!tbody) return;

        tbody.innerHTML = sliced.items.map(function (row) {
            const activeUsers = Math.round(row.activeUsers * Math.min(scale, 1.2));
            const gapIncome = row.gapIncome * scale;
            const vol = row.totalVol * scale;
            const rowClass = 'hover:bg-slate-50';
            const ratioClass = 'text-gray-700 font-bold';
            const gapClass = 'gap-tag';

            let actionHtml = '';
            if (masked) {
                actionHtml = '<button type="button" onclick="PartnerCenter.openDrillTeam(\'' + row.id + '\')" class="text-blue-600 font-black hover:underline">查看团队</button>';
            } else {
                actionHtml = '<button type="button" onclick="PartnerCenter.openDrillTeam(\'' + row.id + '\')" class="text-blue-600 font-black hover:underline">查看团队</button>' +
                    '<span class="mx-2 text-gray-200">|</span>' +
                    '<button type="button" class="text-gray-400 font-black hover:text-black hover:underline" onclick="PartnerCenter.openAdjustRatioModal(\'' + row.id + '\')">调整</button>';
            }

            return '<tr class="' + rowClass + ' transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4">' + partnerUidCell(row, masked) + '</td>' +
                '<td class="px-6 py-4">' + partnerContactCell(row, masked) + '</td>' +
                '<td class="px-6 py-4 text-center ' + ratioClass + '">' + row.ratio + '%</td>' +
                '<td class="px-6 py-4 text-center"><span class="' + gapClass + '">' + row.gap + '%</span></td>' +
                '<td class="px-6 py-4">' + settlementStatusCell(row, scale, masked) + '</td>' +
                '<td class="px-6 py-4 text-right">' + gapIncomeCell(row, scale) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(vol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold text-green-500">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                '<td class="px-6 py-4 text-center">' + userScaleCell(activeUsers, row.totalUsers) + '</td>' +
                '<td class="px-6 py-4 text-right">' + actionHtml + '</td>' +
                '</tr>';
        }).join('');

        buildPaginationHtml(paginationId, sliced.page, sliced.total, 10, goFn);
    }

    function renderDirectClientsTable(opts) {
        opts = opts || {};
        const masked = opts.masked;
        const drill = opts.drill;
        const sortState = drill ? drillClientSort : directClientSort;
        const headId = drill ? 'drill-direct-client-table-head' : 'direct-client-table-head';
        const bodyId = drill ? 'drill-direct-client-table-body' : 'direct-client-table-body';

        const list = drill ? (currentDrillTeam() ? currentDrillTeam().directClients : []) : directClientsData;
        const getters = {
            totalVol: function (r) { return r.totalVol; },
            totalFee: function (r) { return r.totalFee; },
            rebate: function (r) { return r.rebate; },
            netDeposit: function (r) { return r.netDeposit; }
        };
        const sorted = applySort(list, sortState, getters);
        const pageKey = drill ? drillClientPage : directClientPage;
        const sliced = slicePage(sorted, pageKey, 10);
        if (drill) drillClientPage = sliced.page;
        else directClientPage = sliced.page;
        const paginationId = drill ? 'drill-direct-client-pagination' : 'direct-client-pagination';
        const goFn = drill ? 'PartnerCenter.goDrillClientPage' : 'PartnerCenter.goDirectClientPage';
        const sortFn = drill ? 'PartnerCenter.setDrillClientSort' : 'PartnerCenter.setDirectClientSort';

        const thead = document.getElementById(headId);
        if (thead) {
            let header = '<tr>' +
                '<th class="px-6 py-4">注册时间</th>' +
                '<th class="px-6 py-4">直客 UID</th>' +
                '<th class="px-6 py-4">钱包 / 邮箱</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'totalVol\')">累计交易额' + sortIconHtml('totalVol', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'totalFee\')">累计手续费' + sortIconHtml('totalFee', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'rebate\')">返佣金额' + sortIconHtml('rebate', sortState) + '</th>' +
                '<th class="px-6 py-4 text-right cursor-pointer hover:text-black select-none" onclick="' + sortFn + '(\'netDeposit\')">净入金' + sortIconHtml('netDeposit', sortState) + '</th>';
            if (!masked) {
                header += '<th class="px-6 py-4 text-right">操作</th>';
            }
            header += '</tr>';
            thead.innerHTML = header;
        }

        const tbody = document.getElementById(bodyId);
        if (!tbody) return;
        tbody.innerHTML = sliced.items.map(function (row) {
            const netClass = row.netDeposit >= 0 ? 'text-green-500' : 'text-red-400';
            let actionCell = '';
            if (!masked) {
                actionCell = '<td class="px-6 py-4 text-right">' +
                    '<button type="button" onclick="PartnerCenter.openAddSubPartnerModal(\'' + jsEsc(row.uid) + '\')" class="text-blue-600 font-black hover:underline">设置为下级合伙人</button>' +
                    '</td>';
            }
            return '<tr class="hover:bg-slate-50 transition-colors">' +
                '<td class="px-6 py-4 text-gray-400 font-bold">' + row.joinDate + '</td>' +
                '<td class="px-6 py-4">' + partnerUidCell(row, masked) + '</td>' +
                '<td class="px-6 py-4">' + partnerContactCell(row, masked) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalVol) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold">' + fmtMoney(row.totalFee) + '</td>' +
                '<td class="px-6 py-4 text-right font-black text-blue-600">' + fmtMoney(row.rebate) + '</td>' +
                '<td class="px-6 py-4 text-right font-bold ' + netClass + '">' + fmtMoney(row.netDeposit, { signed: true }) + '</td>' +
                actionCell + '</tr>';
        }).join('');

        buildPaginationHtml(paginationId, sliced.page, sliced.total, 10, goFn);
    }

    function findPartnerRowById(partnerId) {
        let row = findSubPartner(partnerId);
        if (row) return row;
        const team = currentDrillTeam();
        if (team) {
            row = team.subPartners.find(function (r) { return r.id === partnerId; });
            if (row) return row;
        }
        Object.keys(drillTeams).forEach(function (tid) {
            if (!row) {
                row = drillTeams[tid].subPartners.find(function (r) { return r.id === partnerId; });
            }
        });
        return row;
    }

    function ensureDrillTeam(partnerId) {
        if (drillTeams[partnerId]) return drillTeams[partnerId];
        const row = findPartnerRowById(partnerId);
        if (!row) return null;
        const parentCtx = drillParentContext();
        drillTeams[partnerId] = {
            name: row.name || row.remark || '下级团队',
            label: row.remark || row.wallet,
            wallet: row.wallet,
            walletFull: row.walletFull || row.wallet,
            joinDate: row.joinDate,
            ratio: row.ratio,
            superiorLevel: parentCtx.level,
            superiorWallet: parentCtx.wallet,
            superiorWalletFull: parentCtx.walletFull,
            overview: {
                teamVol: row.totalVol,
                totalRebate: Math.max(row.gapIncome * 4, 500),
                selfRebate: Math.max(row.gapIncome * 0.1, 50),
                directRebate: Math.max(row.gapIncome * 0.2, 80),
                gapRebate: row.gapIncome,
                teamNetDeposit: row.netDeposit,
                totalUsers: row.totalUsers,
                activeUsers: row.activeUsers
            },
            abnormalText: null,
            subPartners: [],
            directClients: [
                { joinDate: row.joinDate, wallet: '0x' + partnerId.slice(-2) + '...d01', walletFull: '0x' + partnerId + 'demo01', totalVol: Math.round(row.totalVol * 0.08), totalFee: Math.round(row.totalVol * 0.00008), rebate: Math.round(row.gapIncome * 0.3), netDeposit: Math.round(row.netDeposit * 0.1) }
            ]
        };
        return drillTeams[partnerId];
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
                '<button type="button" onclick="PartnerCenter.copyText(\'' + jsEsc(linkUrl) + '\', \'邀请链接\')" class="text-blue-600 font-black hover:underline">複製連結</button>' +
                '<button class="text-gray-300">|</button>' +
                '<button type="button" onclick="openReferralModal(\'edit\', \'' + row.remark.replace(/'/g, "\\'") + '\', \'' + row.code + '\')" class="text-gray-400 hover:text-black">修改備註</button>' +
                '</td></tr>';
        }).join('');

        const countEl = document.getElementById('links-create-count');
        if (countEl) countEl.textContent = '+ 創建新連結 (已用 ' + inviteLinksData.length + '/50)';

        updateLinksPeriodButtons();
        buildPaginationHtml('links-pagination', sliced.page, sliced.total, 10, 'PartnerCenter.goLinksPage');
    }

    function renderTeamTreeLine(line, partnerId, expanded, masked) {
        const key = partnerId + '_' + line.id;
        const isOpen = expanded[key];
        let nodesHtml = '';
        if (isOpen) {
            nodesHtml = line.nodes.map(function (node, i) {
                const pad = 12 + i * 16;
                const identityLine = masked
                    ? '<span class="font-mono font-black text-gray-900 text-[11px]">' + esc(node.uid || node.wallet) + '</span>'
                    : userIdentityCell(node, false);
                const remarkLine = masked ? '' : '<div class="copy-chip mt-0.5"><span class="text-[10px] text-gray-500 font-bold">' + esc(node.remark) + '</span>' + copyChipBtn(node.remark, '备注') + '</div>';
                return '<div class="flex items-center gap-2 py-2 border-l-2 border-amber-200 ml-3" style="padding-left:' + pad + 'px">' +
                    '<div class="flex-1 min-w-0">' + identityLine + remarkLine + '</div>' +
                    '<span class="text-[11px] font-black text-amber-700 shrink-0">' + esc(node.ratio) + '</span></div>';
            }).join('');
        }
        return '<div class="tree-line-panel">' +
            '<div class="tree-line-header flex items-center justify-between px-4 py-3 hover:bg-amber-50/80" onclick="PartnerCenter.toggleTeamTreeLine(\'' + partnerId + '\', \'' + line.id + '\')">' +
            '<div class="min-w-0 flex-1"><p class="font-black text-amber-900 text-[11px]">' + esc(line.title) + '</p>' +
            '<p class="text-[10px] text-amber-700/80 font-medium mt-0.5 truncate max-w-[520px]">' + esc(line.summary) + '</p>' +
            (line.pausedVol ? '<p class="text-[10px] text-red-600 font-black mt-1">停止结算交易额 ' + fmtMoney(line.pausedVol) + '</p>' : '') +
            '</div>' +
            '<span class="text-[10px] font-black text-amber-600 shrink-0 ml-2">' + (isOpen ? '收起' : '展开') + '</span></div>' +
            (isOpen ? '<div class="tree-line-body px-2 pb-2">' + nodesHtml + '</div>' : '') +
            '</div>';
    }

    function renderTeamTreeModalBody(partnerId) {
        const body = document.getElementById('team-tree-modal-body');
        if (!body) return;
        body.innerHTML = '<p class="text-gray-400 text-center py-6">暂无团队树明细</p>';
    }

    function openTeamTreeModal(partnerId, masked) {
        teamTreeModalMasked = !!masked;
        const partner = findSubPartner(partnerId) || findDrillSubPartner(partnerId);
        const subtitle = document.getElementById('team-tree-modal-subtitle');
        if (subtitle && partner) {
            const wallet = partner.wallet || '';
            subtitle.textContent = wallet;
        }
        teamTreeExpanded = {};
        renderTeamTreeModalBody(partnerId);
        window._teamTreeModalPartnerId = partnerId;
        toggleModal('modal-team-tree');
    }

    function findDrillSubPartner(id) {
        const team = currentDrillTeam();
        if (!team) return null;
        return team.subPartners.find(function (r) { return r.id === id; });
    }


    function updateAdjustRatioWarning(ratio, partner) {
        const warn = document.getElementById('adjust-ratio-warning');
        if (!warn || !partner) return;
        const minSub = partner.minSubRatio || 0;
        if (ratio > MY_MAX_RATIO) {
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
        if (walletEl) walletEl.textContent = partner.wallet;
        if (remarkEl && remarkRow) {
            if (partner.remark) {
                remarkEl.textContent = partner.remark;
                remarkRow.classList.remove('hidden');
            } else {
                remarkRow.classList.add('hidden');
            }
        }
        setAdjustRatioValue(partner.ratio);
        toggleModal('modal-adjust-ratio');
    }

    function updateDrillTableTabs() {
        const subTab = document.getElementById('drill-tab-sub-agent');
        const clientTab = document.getElementById('drill-tab-direct-client');
        const subTable = document.getElementById('drill-table-sub-agent');
        const clientTable = document.getElementById('drill-table-direct-client');
        const filterEl = document.getElementById('drill-sub-partner-status-filter');
        if (drillActiveTable === 'sub-agent') {
            if (subTab) subTab.className = 'tab-active pb-1';
            if (clientTab) clientTab.className = 'text-gray-400 font-bold pb-1 hover:text-black';
            if (subTable) { subTable.classList.remove('hidden'); subTable.classList.add('block'); }
            if (clientTable) { clientTable.classList.add('hidden'); clientTable.classList.remove('block'); }
            if (filterEl) filterEl.classList.remove('hidden');
        } else {
            if (clientTab) clientTab.className = 'tab-active pb-1';
            if (subTab) subTab.className = 'text-gray-400 font-bold pb-1 hover:text-black';
            if (clientTable) { clientTable.classList.remove('hidden'); clientTable.classList.add('block'); }
            if (subTable) { subTable.classList.add('hidden'); subTable.classList.remove('block'); }
            if (filterEl) filterEl.classList.add('hidden');
        }
    }

    function onTableSwitch(tableId) {
        activeOverviewTable = tableId;
        const filterEl = document.getElementById('sub-partner-status-filter');
        if (filterEl) {
            if (tableId === 'direct-client') filterEl.classList.add('hidden');
            else filterEl.classList.remove('hidden');
        }
    }

    window.PartnerCenter = {
        setOverviewPeriod: function (p) {
            overviewPeriod = p;
            renderOverview();
        },
        setDrillPeriod: function (p) {
            drillPeriod = p;
            renderDrillOverview();
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
            subPartnerPage = 1;
            renderSubPartnersTable({ masked: false });
        },
        setSubPartnerSearch: function (q) {
            subPartnerSearch = q;
            subPartnerPage = 1;
            renderSubPartnersTable({ masked: false });
        },
        setSubPartnerSort: function (key) {
            toggleSort(subPartnerSort, key);
            renderSubPartnersTable({ masked: false });
        },
        setDrillSubFilter: function (v) {
            drillSubFilter = v;
            drillSubPartnerPage = 1;
            renderSubPartnersTable({ masked: true, drill: true });
        },
        setDrillSubSearch: function (q) {
            drillSubSearch = q;
            drillSubPartnerPage = 1;
            renderSubPartnersTable({ masked: true, drill: true });
        },
        setDrillSubSort: function (key) {
            toggleSort(drillSubSort, key);
            renderSubPartnersTable({ masked: true, drill: true });
        },
        setDirectClientSort: function (key) {
            toggleSort(directClientSort, key);
            renderDirectClientsTable({ masked: false });
        },
        setDrillClientSort: function (key) {
            toggleSort(drillClientSort, key);
            renderDirectClientsTable({ masked: true, drill: true });
        },
        switchDrillTable: function (tableId) {
            drillActiveTable = tableId === 'direct-client' ? 'direct-client' : 'sub-agent';
            updateDrillTableTabs();
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
            renderTeamTreeModalBody(partnerId);
        },
        openAdjustRatioModal: openAdjustRatioModal,
        onAdjustRatioInput: function (val) {
            setAdjustRatioValue(val);
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
            const input = document.getElementById('adjust-ratio-input');
            const slider = document.getElementById('adjust-ratio-slider');
            if (!partner) return;
            const ratio = clampRatio(input ? input.value : slider ? slider.value : 0);
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
            renderSubPartnersTable({ masked: false });
        },
        openAddSubPartnerModal: function (uid) {
            const input = document.getElementById('input-add-agent-uid');
            if (input) input.value = uid || '';
            toggleModal('modal-add-agent');
        },
        addInviteLink: function (remark, code) {
            inviteLinksData.push({
                remark: remark, code: code, directCount: 0, subPartnerCount: 0,
                totalVol: 0, totalFee: 0, rebateIncome: 0, netDeposit: 0, isDefault: false
            });
            existingCodesList.push(code);
            linksPage = 1;
            renderInviteLinks();
        },
        openDrillTeam: function (partnerId) {
            if (!ensureDrillTeam(partnerId)) return;
            drillStack.push(partnerId);
            drillSubFilter = 'all';
            drillSubSearch = '';
            drillActiveTable = 'sub-agent';
            drillSubPartnerPage = 1;
            drillClientPage = 1;
            if (typeof showMainPage === 'function') showMainPage('page-drill-overview');
            renderDrillOverview();
        },
        drillBack: function () {
            if (drillStack.length > 1) {
                drillStack.pop();
                renderDrillOverview();
            } else if (drillStack.length === 1) {
                drillStack = [];
                if (typeof showMainPage === 'function') showMainPage('page-overview');
            }
        },
        onTableSwitch: onTableSwitch,
        setSettlementDateFilter: function (v) {
            settlementDateFilter = v || '';
            settlementPage = 1;
            renderSettlementTable();
        },
        setSettlementStatusFilter: function (v) {
            settlementStatusFilter = v || 'all';
            settlementPage = 1;
            renderSettlementTable();
        },
        goSettlementPage: function (p) {
            settlementPage = Math.max(1, p);
            renderSettlementTable();
        },
        goSubPartnerPage: function (p) {
            subPartnerPage = Math.max(1, p);
            renderSubPartnersTable({ masked: false });
        },
        goDirectClientPage: function (p) {
            directClientPage = Math.max(1, p);
            renderDirectClientsTable({ masked: false });
        },
        goDrillSubPage: function (p) {
            drillSubPartnerPage = Math.max(1, p);
            renderSubPartnersTable({ masked: true, drill: true });
        },
        goDrillClientPage: function (p) {
            drillClientPage = Math.max(1, p);
            renderDirectClientsTable({ masked: true, drill: true });
        },
        init: function () {
            onTableSwitch(activeOverviewTable);
            renderOverview();
            renderInviteLinks();
            renderSettlementTable();
        },
        onPageShow: function (pageId) {
            var settlementBody = document.getElementById('settlement-table-body');
            if (settlementBody && !settlementBody.innerHTML.trim()) {
                this.init();
                return;
            }
            if (pageId === 'page-overview') renderOverview();
            else if (pageId === 'page-settlement') renderSettlementTable();
            else if (pageId === 'page-links') renderInviteLinks();
            else if (pageId === 'page-drill-overview') renderDrillOverview();
        }
    };
})();
