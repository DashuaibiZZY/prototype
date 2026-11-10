/**
 * 做市商数据看板（按团队标签汇总 · 原型 mock）
 */
(function (global) {
    'use strict';

    var PAIRS = ['BTCUSDC', 'ETHUSDC', 'SOLUSDC', 'ARBUSDC'];

    var TEAMS = {
        'Alpha MM': {
            kind: 'mm_external',
            totalAsset: 3390200,
            prevDayVolume: 89200000,
            uidCount: 3,
            uids: [
                { uid: '10031592', teamTag: 'Alpha MM', bindAt: '2025-06-12 10:00:00' },
                { uid: '10040102', teamTag: 'Alpha MM', bindAt: '2025-08-20 14:22:00' },
                { uid: '10088412', teamTag: 'Alpha MM', bindAt: '2026-01-05 11:00:00' }
            ],
            summary: {
                unrealizedPnl: -124500,
                realizedPnlYtd: 2100000,
                depositTotal: 4500000,
                withdrawTotal: 800000,
                airdropTotal: 50000,
                prevDayVolume: 89200000,
                prevDayShare: 18.6,
                uidCount: 3
            },
            tradeDays: [
                {
                    date: '2026-11-06',
                    volume: 89200000,
                    share: 18.6,
                    tradeCount: 12400,
                    takerVol: 42100000,
                    makerVol: 47100000,
                    fee: 39800,
                    funding: -1200,
                    activeUids: '10031592, 10040102, 10088412',
                    pairs: [
                        { pair: 'BTCUSDC', volume: 52000000, share: 21.2, tradeCount: 6200, takerVol: 24000000, makerVol: 28000000, fee: 24000, funding: -800, activeUids: '10031592, 10040102' },
                        { pair: 'ETHUSDC', volume: 28000000, share: 16.1, tradeCount: 4100, takerVol: 13000000, makerVol: 15000000, fee: 11000, funding: -300, activeUids: '10040102, 10088412' },
                        { pair: 'SOLUSDC', volume: 9200000, share: 12.4, tradeCount: 2100, takerVol: 5100000, makerVol: 4100000, fee: 4800, funding: -100, activeUids: '10031592' }
                    ]
                },
                {
                    date: '2026-11-05',
                    volume: 76100000,
                    share: 17.2,
                    tradeCount: 10800,
                    takerVol: 36000000,
                    makerVol: 40100000,
                    fee: 35200,
                    funding: 900,
                    activeUids: '10031592, 10040102',
                    pairs: [
                        { pair: 'BTCUSDC', volume: 48000000, share: 19.8, tradeCount: 5200, takerVol: 22000000, makerVol: 26000000, fee: 22000, funding: 600, activeUids: '10031592, 10040102' },
                        { pair: 'ETHUSDC', volume: 28100000, share: 15.0, tradeCount: 5600, takerVol: 14000000, makerVol: 14100000, fee: 13200, funding: 300, activeUids: '10031592, 10040102' }
                    ]
                }
            ],
            assetDays: [
                {
                    date: '2026-11-06',
                    totalAsset: 3390200,
                    marginUsed: 420000,
                    realized: 2100000,
                    unrealized: -124500,
                    deposit: 4500000,
                    withdraw: 800000,
                    netDeposit: 3700000,
                    airdrop: 50000,
                    pairs: [
                        { pair: 'BTCUSDC', totalAsset: 2100000, marginUsed: 280000, realized: 1200000, unrealized: -80000, deposit: 2500000, withdraw: 400000, netDeposit: 2100000, airdrop: 20000 },
                        { pair: 'ETHUSDC', totalAsset: 1290200, marginUsed: 140000, realized: 900000, unrealized: -44500, deposit: 2000000, withdraw: 400000, netDeposit: 1600000, airdrop: 30000 }
                    ]
                }
            ],
            obSnapshots: [
                {
                    time: '2026-11-06 14:00:00',
                    pair: 'BTCUSDC',
                    share: 22.4,
                    spreadBps: 1.2,
                    b10: 420000,
                    b30: 980000,
                    b50: 1500000,
                    b100: 2100000,
                    b200: 2800000,
                    b500: 3200000,
                    b1000: 3500000
                },
                {
                    time: '2026-11-06 14:00:00',
                    pair: 'ETHUSDC',
                    share: 18.1,
                    spreadBps: 1.8,
                    b10: 120000,
                    b30: 280000,
                    b50: 420000,
                    b100: 580000,
                    b200: 720000,
                    b500: 800000,
                    b1000: 820000
                }
            ]
        },
        'Desk-Quant': {
            kind: 'mm_internal',
            totalAsset: 8240000,
            prevDayVolume: 156000000,
            uidCount: 2,
            uids: [
                { uid: '10019833', teamTag: 'Desk-Quant', bindAt: '2024-11-01 09:30:00' },
                { uid: '10055201', teamTag: 'Desk-Quant', bindAt: '2025-03-18 16:45:00' }
            ],
            summary: {
                unrealizedPnl: 88000,
                realizedPnlYtd: 5200000,
                depositTotal: 12000000,
                withdrawTotal: 2000000,
                airdropTotal: 0,
                prevDayVolume: 156000000,
                prevDayShare: 32.5,
                uidCount: 2
            },
            tradeDays: [
                {
                    date: '2026-11-06',
                    volume: 156000000,
                    share: 32.5,
                    tradeCount: 28000,
                    takerVol: 72000000,
                    makerVol: 84000000,
                    fee: 62000,
                    funding: 2400,
                    activeUids: '10019833, 10055201',
                    pairs: [
                        { pair: 'BTCUSDC', volume: 98000000, share: 35.0, tradeCount: 15000, takerVol: 44000000, makerVol: 54000000, fee: 38000, funding: 1200, activeUids: '10019833, 10055201' },
                        { pair: 'ETHUSDC', volume: 58000000, share: 28.2, tradeCount: 13000, takerVol: 28000000, makerVol: 30000000, fee: 24000, funding: 1200, activeUids: '10055201' }
                    ]
                }
            ],
            assetDays: [
                {
                    date: '2026-11-06',
                    totalAsset: 8240000,
                    marginUsed: 1200000,
                    realized: 5200000,
                    unrealized: 88000,
                    deposit: 12000000,
                    withdraw: 2000000,
                    netDeposit: 10000000,
                    airdrop: 0,
                    pairs: [
                        { pair: 'BTCUSDC', totalAsset: 5200000, marginUsed: 800000, realized: 3200000, unrealized: 50000, deposit: 8000000, withdraw: 1200000, netDeposit: 6800000, airdrop: 0 },
                        { pair: 'SOLUSDC', totalAsset: 3040000, marginUsed: 400000, realized: 2000000, unrealized: 38000, deposit: 4000000, withdraw: 800000, netDeposit: 3200000, airdrop: 0 }
                    ]
                }
            ],
            obSnapshots: [
                {
                    time: '2026-11-06 14:00:00',
                    pair: 'BTCUSDC',
                    share: 31.0,
                    spreadBps: 0.8,
                    b10: 890000,
                    b30: 2100000,
                    b50: 3200000,
                    b100: 4500000,
                    b200: 5800000,
                    b500: 6200000,
                    b1000: 6500000
                }
            ]
        }
    };

    function fmtNum(n) {
        return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    function fmtUsdc(n) {
        return fmtNum(n) + ' USDC';
    }

    function fmtPct(n) {
        return fmtNum(n) + '%';
    }

    function teamKindLabel(kind) {
        if (global.AdminMmTeamStore) return AdminMmTeamStore.kindLabel(kind);
        return kind === 'mm_internal' ? '内部做市商' : '外部做市商';
    }

    function getTeamNames() {
        var names = Object.keys(TEAMS);
        if (global.AdminMmTeamStore) {
            AdminMmTeamStore.getAll().forEach(function (t) {
                if (!TEAMS[t.name]) names.push(t.name);
            });
        }
        return names.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function expandBtn(rowKey) {
        return '<button type="button" class="text-blue-600 font-black text-[10px] hover:underline mm-expand-btn" data-expand="' + escapeHtml(rowKey) + '">展开</button>';
    }

    function renderList() {
        var tbody = document.getElementById('mm-dashboard-list-body');
        if (!tbody) return;
        var filter = document.getElementById('mm-dashboard-team-filter');
        var team = filter ? filter.value : 'all';
        var rows = [];
        Object.keys(TEAMS).forEach(function (name) {
            if (team !== 'all' && team !== name) return;
            var t = TEAMS[name];
            rows.push(
                '<tr class="border-b border-slate-50 hover:bg-slate-50/80">' +
                '<td class="px-4 py-3 font-black text-slate-800">' + escapeHtml(name) +
                ' <span class="text-[10px] font-bold text-slate-400">(' + teamKindLabel(t.kind) + ')</span></td>' +
                '<td class="px-4 py-3 font-mono text-right">' + fmtUsdc(t.totalAsset) + '</td>' +
                '<td class="px-4 py-3 font-mono text-right">' + fmtUsdc(t.prevDayVolume) + '</td>' +
                '<td class="px-4 py-3 text-center font-bold">' + t.uidCount + '</td>' +
                '<td class="px-4 py-3 text-right"><a href="做市商数据详情.html?team=' + encodeURIComponent(name) + '" class="text-blue-600 font-black hover:underline">详情</a></td></tr>'
            );
        });
        tbody.innerHTML = rows.length ? rows.join('') : '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-400">暂无团队数据</td></tr>';
    }

    function initListPage() {
        var sel = document.getElementById('mm-dashboard-team-filter');
        if (sel) {
            sel.innerHTML = '<option value="all">全部团队</option>' + getTeamNames().map(function (n) {
                return '<option value="' + escapeHtml(n) + '">' + escapeHtml(n) + '</option>';
            }).join('');
        }
        var btn = document.getElementById('mm-dashboard-query');
        if (btn) btn.addEventListener('click', renderList);
        renderList();
        if (global.initAdminSidebar) global.initAdminSidebar('mm-dashboard', '登录身份: 运营管理员');
    }

  function renderDetailHeader(teamName, data) {
        var s = data.summary;
        var map = [
            ['mm-detail-team', teamName + '（' + teamKindLabel(data.kind) + '）'],
            ['mm-detail-asset', fmtUsdc(data.totalAsset)],
            ['mm-detail-unrealized', fmtUsdc(s.unrealizedPnl)],
            ['mm-detail-realized', fmtUsdc(s.realizedPnlYtd)],
            ['mm-detail-deposit', fmtUsdc(s.depositTotal)],
            ['mm-detail-withdraw', fmtUsdc(s.withdrawTotal)],
            ['mm-detail-airdrop', fmtUsdc(s.airdropTotal)],
            ['mm-detail-prev-vol', fmtUsdc(s.prevDayVolume)],
            ['mm-detail-prev-share', fmtPct(s.prevDayShare)],
            ['mm-detail-uid-count', String(s.uidCount)]
        ];
        map.forEach(function (pair) {
            var el = document.getElementById(pair[0]);
            if (el) el.textContent = pair[1];
        });
    }

    function renderUidTable(data) {
        var tbody = document.getElementById('mm-detail-uid-body');
        if (!tbody) return;
        tbody.innerHTML = data.uids.map(function (u) {
            return '<tr class="border-b border-slate-50">' +
                '<td class="px-4 py-3 font-bold">' + escapeHtml(u.teamTag) + '</td>' +
                '<td class="px-4 py-3 font-mono">' + escapeHtml(u.uid) + '</td>' +
                '<td class="px-4 py-3 text-slate-600">' + escapeHtml(u.bindAt) + '</td>' +
                '<td class="px-4 py-3 text-right"><a href="用户中心详情.html?uid=' + encodeURIComponent(u.uid) + '" class="text-blue-600 font-black hover:underline">详情</a></td></tr>';
        }).join('');
    }

    function renderTradeTable(data) {
        var tbody = document.getElementById('mm-detail-trade-body');
        if (!tbody) return;
        var html = [];
        data.tradeDays.forEach(function (row, i) {
            var key = 'trade-' + i;
            html.push(
                '<tr class="border-b border-slate-50 bg-white">' +
                '<td class="px-4 py-3">' + expandBtn(key) + ' ' + row.date + '</td>' +
                '<td class="px-4 py-3 font-mono text-right">' + fmtUsdc(row.volume) + '</td>' +
                '<td class="px-4 py-3 text-right">' + fmtPct(row.share) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtNum(row.tradeCount) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.takerVol) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.makerVol) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.fee) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.funding) + '</td>' +
                '<td class="px-4 py-3 text-[11px] text-slate-600">' + escapeHtml(row.activeUids) + '</td></tr>'
            );
            html.push('<tr id="expand-' + key + '" class="hidden bg-slate-50/80"><td colspan="9" class="px-4 py-3">' +
                '<table class="w-full text-[11px] border border-slate-200 rounded bg-white"><thead class="text-slate-400 font-black"><tr>' +
                '<th class="px-3 py-2 text-left">交易对</th><th class="px-3 py-2 text-right">成交额</th><th class="px-3 py-2 text-right">占比全站</th>' +
                '<th class="px-3 py-2 text-right">成交笔数</th><th class="px-3 py-2 text-right">吃单</th><th class="px-3 py-2 text-right">挂单</th>' +
                '<th class="px-3 py-2 text-right">手续费</th><th class="px-3 py-2 text-right">资金费用</th><th class="px-3 py-2 text-left">成交 UID</th></tr></thead><tbody>' +
                row.pairs.map(function (p) {
                    return '<tr class="border-t border-slate-100"><td class="px-3 py-2 font-bold">' + p.pair + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.volume) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtPct(p.share) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtNum(p.tradeCount) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtUsdc(p.takerVol) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtUsdc(p.makerVol) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtUsdc(p.fee) + '</td>' +
                        '<td class="px-3 py-2 text-right">' + fmtUsdc(p.funding) + '</td>' +
                        '<td class="px-3 py-2">' + escapeHtml(p.activeUids) + '</td></tr>';
                }).join('') + '</tbody></table></td></tr>');
        });
        tbody.innerHTML = html.join('');
    }

    function renderAssetTable(data) {
        var tbody = document.getElementById('mm-detail-asset-body');
        if (!tbody) return;
        var html = [];
        data.assetDays.forEach(function (row, i) {
            var key = 'asset-' + i;
            html.push(
                '<tr class="border-b border-slate-50">' +
                '<td class="px-4 py-3">' + expandBtn(key) + ' ' + row.date + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.totalAsset) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.marginUsed) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.realized) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.unrealized) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.deposit) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.withdraw) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.netDeposit) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.airdrop) + '</td></tr>'
            );
            html.push('<tr id="expand-' + key + '" class="hidden bg-slate-50/80"><td colspan="9" class="px-4 py-3">' +
                '<table class="w-full text-[11px] border border-slate-200 rounded bg-white"><thead class="text-slate-400 font-black"><tr>' +
                '<th class="px-3 py-2 text-left">交易对</th><th class="px-3 py-2 text-right">总资产</th><th class="px-3 py-2 text-right">占用保证金</th>' +
                '<th class="px-3 py-2 text-right">已实现</th><th class="px-3 py-2 text-right">未实现</th><th class="px-3 py-2 text-right">充值</th>' +
                '<th class="px-3 py-2 text-right">提现</th><th class="px-3 py-2 text-right">净充值</th><th class="px-3 py-2 text-right">空投</th></tr></thead><tbody>' +
                row.pairs.map(function (p) {
                    return '<tr class="border-t border-slate-100"><td class="px-3 py-2 font-bold">' + p.pair + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.totalAsset) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.marginUsed) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.realized) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.unrealized) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.deposit) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.withdraw) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.netDeposit) + '</td>' +
                        '<td class="px-3 py-2 text-right font-mono">' + fmtUsdc(p.airdrop) + '</td></tr>';
                }).join('') + '</tbody></table></td></tr>');
        });
        tbody.innerHTML = html.join('');
    }

    function renderObTable(data, pairFilter) {
        var tbody = document.getElementById('mm-detail-ob-body');
        if (!tbody) return;
        var rows = data.obSnapshots.filter(function (r) {
            if (pairFilter && pairFilter !== 'all' && r.pair !== pairFilter) return false;
            return true;
        });
        tbody.innerHTML = rows.map(function (r) {
            return '<tr class="border-b border-slate-50">' +
                '<td class="px-3 py-3 font-mono text-[11px]">' + r.time + '</td>' +
                '<td class="px-3 py-3 font-bold">' + r.pair + '</td>' +
                '<td class="px-3 py-3 text-right">' + fmtPct(r.share) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono">' + fmtNum(r.spreadBps) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b10) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b30) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b50) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b100) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b200) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b500) + '</td>' +
                '<td class="px-3 py-3 text-right font-mono text-[11px]">' + fmtUsdc(r.b1000) + '</td></tr>';
        }).join('') || '<tr><td colspan="11" class="px-4 py-8 text-center text-slate-400">无快照数据</td></tr>';
    }

    function bindExpand() {
        document.body.addEventListener('click', function (e) {
            var btn = e.target.closest('.mm-expand-btn');
            if (!btn) return;
            var key = btn.getAttribute('data-expand');
            var row = document.getElementById('expand-' + key);
            if (!row) return;
            var hidden = row.classList.contains('hidden');
            row.classList.toggle('hidden', !hidden);
            btn.textContent = hidden ? '收起' : '展开';
        });
    }

    function initDetailPage() {
        var params = new URLSearchParams(location.search);
        var team = params.get('team') || 'Alpha MM';
        var data = TEAMS[team];
        if (!data) {
            team = 'Alpha MM';
            data = TEAMS[team];
        }
        renderDetailHeader(team, data);
        renderUidTable(data);
        renderTradeTable(data);
        renderAssetTable(data);

        var dateInput = document.getElementById('mm-ob-date');
        var pairSel = document.getElementById('mm-ob-pair');
        if (pairSel) {
            pairSel.innerHTML = '<option value="all">全部交易对</option>' + PAIRS.map(function (p) {
                return '<option value="' + p + '">' + p + '</option>';
            }).join('');
        }
        if (dateInput) dateInput.value = '2026-11-06';

        function queryOb() {
            renderObTable(data, pairSel ? pairSel.value : 'all');
        }
        var qBtn = document.getElementById('mm-ob-query');
        if (qBtn) qBtn.addEventListener('click', queryOb);
        queryOb();
        bindExpand();
        if (global.initAdminSidebar) global.initAdminSidebar('mm-dashboard', '登录身份: 运营管理员');
    }

    global.AdminMmDashboard = {
        initListPage: initListPage,
        initDetailPage: initDetailPage
    };
})(window);
