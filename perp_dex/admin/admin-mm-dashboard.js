/**
 * 做市商数据看板（按团队标签汇总 · 原型 mock）
 */
(function (global) {
    'use strict';

    var PAIRS = ['BTCUSDC', 'ETHUSDC', 'SOLUSDC', 'ARBUSDC'];
    var MAX_RANGE_DAYS = 90;
    var DRILL_PAGE_SIZE = 10;

    var TEAMS = {
        'Alpha MM': null,
        'Desk-Quant': null
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

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseIsoDate(s) {
        var parts = String(s || '').split('-');
        if (parts.length !== 3) return null;
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function formatIsoDate(d) {
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function daysBetween(start, end) {
        var ms = end.getTime() - start.getTime();
        return Math.floor(ms / 86400000) + 1;
    }

    function downloadCsv(filename, headers, rows) {
        var lines = [headers.join(',')];
        rows.forEach(function (row) {
            lines.push(row.map(function (cell) {
                var s = String(cell == null ? '' : cell);
                if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
                return s;
            }).join(','));
        });
        var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function renderDetailGrid(containerId, fields) {
        var el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = fields.map(function (f) {
            return '<div><p class="detail-label">' + escapeHtml(f.label) + '</p><div class="detail-value">' + f.value + '</div></div>';
        }).join('');
    }

    function teamKindLabel(kind) {
        if (global.AdminMmTeamStore) return AdminMmTeamStore.kindLabel(kind);
        return kind === 'mm_internal' ? '内部做市商' : '外部做市商';
    }

    function buildUidTradeRows(uids, scale) {
        return uids.map(function (u, i) {
            var vol = Math.round(28000000 * scale * (0.9 + i * 0.15));
            var taker = Math.round(vol * 0.46);
            var maker = vol - taker;
            return {
                uid: u.uid,
                volume: vol,
                share: 12 + i * 2.1,
                tradeCount: Math.round(vol / 7200),
                takerVol: taker,
                makerVol: maker,
                realizedPnl: Math.round(vol * 0.008),
                unrealizedPnl: Math.round(-12000 + i * 8000),
                fee: Math.round(vol * 0.00045),
                funding: Math.round((i % 2 ? 1 : -1) * vol * 0.00002)
            };
        });
    }

    function buildUidPairVolRows(uidRows) {
        var out = [];
        uidRows.forEach(function (u) {
            PAIRS.slice(0, 2 + (Number(u.uid.slice(-1)) % 2)).forEach(function (pair, pi) {
                var share = 0.35 + pi * 0.25;
                var vol = Math.round(u.volume * share);
                out.push({
                    uid: u.uid,
                    pair: pair,
                    volume: vol,
                    takerVol: Math.round(vol * 0.48),
                    makerVol: vol - Math.round(vol * 0.48),
                    fee: Math.round(vol * 0.00042)
                });
            });
        });
        return out;
    }

    function buildPairRows(scale) {
        return [
            { pair: 'BTCUSDC', volume: Math.round(52000000 * scale), share: 21.2, tradeCount: Math.round(6200 * scale), takerVol: Math.round(24000000 * scale), makerVol: Math.round(28000000 * scale), fee: Math.round(24000 * scale), funding: Math.round(-800 * scale), activeUids: '10031592, 10040102' },
            { pair: 'ETHUSDC', volume: Math.round(28000000 * scale), share: 16.1, tradeCount: Math.round(4100 * scale), takerVol: Math.round(13000000 * scale), makerVol: Math.round(15000000 * scale), fee: Math.round(11000 * scale), funding: Math.round(-300 * scale), activeUids: '10040102, 10088412' },
            { pair: 'SOLUSDC', volume: Math.round(9200000 * scale), share: 12.4, tradeCount: Math.round(2100 * scale), takerVol: Math.round(5100000 * scale), makerVol: Math.round(4100000 * scale), fee: Math.round(4800 * scale), funding: Math.round(-100 * scale), activeUids: '10031592' }
        ];
    }

    function buildUidAssetRows(uids, scale) {
        return uids.map(function (u, i) {
            var asset = Math.round(1100000 * (1.2 + i * 0.55) * scale);
            var margin = Math.round(asset * 0.14);
            return {
                uid: u.uid,
                totalAsset: asset,
                marginUsed: margin,
                realized: Math.round(asset * 0.62),
                unrealized: Math.round(-8000 + i * 12000),
                deposit: Math.round(asset * 1.4),
                withdraw: Math.round(asset * 0.22),
                netDeposit: Math.round(asset * 1.18)
            };
        });
    }

    function synthesizeTradeDay(dateStr, base, uids, scale) {
        var uidRows = buildUidTradeRows(uids, scale);
        var volume = uidRows.reduce(function (s, r) { return s + r.volume; }, 0);
        var realized = uidRows.reduce(function (s, r) { return s + r.realizedPnl; }, 0);
        var unrealized = uidRows.reduce(function (s, r) { return s + r.unrealizedPnl; }, 0);
        var takerVol = uidRows.reduce(function (s, r) { return s + r.takerVol; }, 0);
        var makerVol = uidRows.reduce(function (s, r) { return s + r.makerVol; }, 0);
        return {
            date: dateStr,
            volume: volume,
            share: base.share * (0.92 + scale * 0.12),
            tradeCount: uidRows.reduce(function (s, r) { return s + r.tradeCount; }, 0),
            takerVol: takerVol,
            makerVol: makerVol,
            realizedPnl: realized,
            unrealizedPnl: unrealized,
            fee: Math.round(volume * 0.00044),
            funding: Math.round((scale % 2 ? 1 : -1) * volume * 0.000015),
            activeUids: uidRows.map(function (r) { return r.uid; }).join(', '),
            pairs: buildPairRows(scale),
            uidRows: uidRows,
            uidPairVol: buildUidPairVolRows(uidRows)
        };
    }

    function synthesizeAssetDay(dateStr, base, uids, scale) {
        var uidRows = buildUidAssetRows(uids, scale);
        return {
            date: dateStr,
            totalAsset: uidRows.reduce(function (s, r) { return s + r.totalAsset; }, 0),
            marginUsed: uidRows.reduce(function (s, r) { return s + r.marginUsed; }, 0),
            realized: uidRows.reduce(function (s, r) { return s + r.realized; }, 0),
            unrealized: uidRows.reduce(function (s, r) { return s + r.unrealized; }, 0),
            deposit: uidRows.reduce(function (s, r) { return s + r.deposit; }, 0),
            withdraw: uidRows.reduce(function (s, r) { return s + r.withdraw; }, 0),
            netDeposit: uidRows.reduce(function (s, r) { return s + r.netDeposit; }, 0),
            airdrop: scale % 3 === 0 ? 50000 : 0,
            uidRows: uidRows
        };
    }

    function buildTeamData(name, cfg) {
        var uids = cfg.uids;
        var tradeDays = [];
        var assetDays = [];
        var anchor = parseIsoDate('2026-11-06');
        for (var i = 0; i < cfg.dayCount; i++) {
            var d = new Date(anchor.getTime());
            d.setDate(d.getDate() - i);
            var dateStr = formatIsoDate(d);
            var scale = 0.88 + (i % 7) * 0.04;
            tradeDays.push(synthesizeTradeDay(dateStr, cfg.tradeBase, uids, scale));
            assetDays.push(synthesizeAssetDay(dateStr, cfg.assetBase, uids, scale));
        }
        var obSnapshots = [];
        PAIRS.forEach(function (pair, pi) {
            for (var h = 0; h < 8; h++) {
                var mult = 1 + h * 0.03;
                obSnapshots.push({
                    time: '2026-11-06 ' + String(8 + h).padStart(2, '0') + ':00:00',
                    pair: pair,
                    share: cfg.obBase.share + pi,
                    spreadBps: cfg.obBase.spread + pi * 0.3,
                    b10: Math.round(cfg.obBase.b10 * mult),
                    b30: Math.round(cfg.obBase.b30 * mult),
                    b50: Math.round(cfg.obBase.b50 * mult),
                    b100: Math.round(cfg.obBase.b100 * mult),
                    b200: Math.round(cfg.obBase.b200 * mult),
                    b500: Math.round(cfg.obBase.b500 * mult),
                    b1000: Math.round(cfg.obBase.b1000 * mult)
                });
            }
        });
        return {
            kind: cfg.kind,
            totalAsset: cfg.totalAsset,
            prevDayVolume: tradeDays[0].volume,
            uidCount: uids.length,
            uids: uids,
            summary: cfg.summary,
            tradeDays: tradeDays,
            assetDays: assetDays,
            obSnapshots: obSnapshots
        };
    }

    function initTeams() {
        TEAMS['Alpha MM'] = buildTeamData('Alpha MM', {
            kind: 'mm_external',
            totalAsset: 3390200,
            dayCount: 28,
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
            tradeBase: { share: 18.6 },
            assetBase: {},
            obBase: { share: 22.4, spread: 1.2, b10: 420000, b30: 980000, b50: 1500000, b100: 2100000, b200: 2800000, b500: 3200000, b1000: 3500000 }
        });
        TEAMS['Desk-Quant'] = buildTeamData('Desk-Quant', {
            kind: 'mm_internal',
            totalAsset: 8240000,
            dayCount: 24,
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
            tradeBase: { share: 32.5 },
            assetBase: {},
            obBase: { share: 31.0, spread: 0.8, b10: 890000, b30: 2100000, b50: 3200000, b100: 4500000, b200: 5800000, b500: 6200000, b1000: 6500000 }
        });
    }

    initTeams();

    function getTeamNames() {
        var names = Object.keys(TEAMS);
        if (global.AdminMmTeamStore) {
            AdminMmTeamStore.getAll().forEach(function (t) {
                if (!TEAMS[t.name]) names.push(t.name);
            });
        }
        return names.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    }

    function getTeamData(teamName) {
        return TEAMS[teamName] || TEAMS['Alpha MM'];
    }

    function filterRowsByDateRange(rows, fromVal, toVal) {
        var from = parseIsoDate(fromVal);
        var to = parseIsoDate(toVal);
        if (!from || !to) return rows.slice();
        if (from > to) {
            var tmp = from; from = to; to = tmp;
        }
        return rows.filter(function (r) {
            var d = parseIsoDate(r.date);
            return d && d >= from && d <= to;
        });
    }

    function validateDateRange(fromVal, toVal, hintEl) {
        var from = parseIsoDate(fromVal);
        var to = parseIsoDate(toVal);
        if (!from || !to) {
            if (hintEl) hintEl.textContent = '请选择开始与结束日期';
            return null;
        }
        if (from > to) {
            var t = from; from = to; to = t;
        }
        var span = daysBetween(from, to);
        if (span > MAX_RANGE_DAYS) {
            if (hintEl) hintEl.textContent = '区间不能超过 ' + MAX_RANGE_DAYS + ' 天（当前 ' + span + ' 天）';
            return null;
        }
        if (hintEl) hintEl.textContent = '已选 ' + span + ' 天 · 单次最多 ' + MAX_RANGE_DAYS + ' 天';
        return { from: formatIsoDate(from), to: formatIsoDate(to) };
    }

    function tradeDrillUrl(team, date, mode) {
        return '做市商数据详情-日交易额展开.html?team=' + encodeURIComponent(team) +
            '&date=' + encodeURIComponent(date) + '&mode=' + encodeURIComponent(mode);
    }

    function assetDrillUrl(team, date) {
        return '做市商数据详情-日资产展开.html?team=' + encodeURIComponent(team) +
            '&date=' + encodeURIComponent(date);
    }

    function tradeOpCell(team, date) {
        return '<td class="px-4 py-3 text-right"><div class="flex flex-col items-end gap-1">' +
            '<a class="mm-op-btn" href="' + tradeDrillUrl(team, date, 'pair') + '">按交易对展开</a>' +
            '<a class="mm-op-btn" href="' + tradeDrillUrl(team, date, 'uid') + '">按 UID 展开</a>' +
            '<a class="mm-op-btn" href="' + tradeDrillUrl(team, date, 'uid_vol') + '">按 UID&amp;交易额展开</a>' +
            '</div></td>';
    }

    var paginationRunners = {};

    function renderPaginatedTable(opts) {
        if (!global.AdminPagination) {
            if (opts.renderBody) opts.renderBody(opts.rows);
            return { items: opts.rows, page: 1, total: opts.rows.length };
        }
        var pageSize = opts.pageSize || DRILL_PAGE_SIZE;
        var page = opts.page || 1;
        var sliced = AdminPagination.slice(opts.rows, page, pageSize);
        if (opts.renderBody) opts.renderBody(sliced.items);
        if (opts.paginationEl && opts.handlerId) {
            paginationRunners[opts.handlerId] = opts;
            AdminPagination.register(opts.handlerId, function (p) {
                var cfg = paginationRunners[opts.handlerId];
                if (!cfg) return;
                cfg.page = p;
                renderPaginatedTable(cfg);
            });
            AdminPagination.mount(opts.paginationEl, sliced.total, sliced.page, opts.handlerId, pageSize);
        }
        opts.page = sliced.page;
        return sliced;
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

    function renderDetailProfile(teamName, data) {
        var s = data.summary;
        renderDetailGrid('mm-detail-team-grid', [
            { label: '团队标签', value: escapeHtml(teamName) },
            { label: '做市商类型', value: escapeHtml(teamKindLabel(data.kind)) },
            { label: '团队账号数', value: String(s.uidCount) },
            { label: '当前总资产', value: fmtUsdc(data.totalAsset) }
        ]);
        renderDetailGrid('mm-detail-asset-grid', [
            { label: '当前总未实现盈亏', value: fmtUsdc(s.unrealizedPnl) },
            { label: '累计已实现盈亏（截止昨日）', value: fmtUsdc(s.realizedPnlYtd) },
            { label: '累计充值金额', value: fmtUsdc(s.depositTotal) },
            { label: '累计提现金额', value: fmtUsdc(s.withdrawTotal) },
            { label: '累计空投金额', value: fmtUsdc(s.airdropTotal) }
        ]);
        renderDetailGrid('mm-detail-trade-grid', [
            { label: '前一日总交易额', value: fmtUsdc(s.prevDayVolume) },
            { label: '前一日交易额占比全站', value: fmtPct(s.prevDayShare) }
        ]);
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

    var detailState = {
        team: 'Alpha MM',
        data: null,
        tradeFiltered: [],
        tradePage: 1,
        assetFiltered: [],
        assetPage: 1,
        obFiltered: [],
        obPage: 1
    };

    function renderTradeRows(rows, team) {
        var tbody = document.getElementById('mm-detail-trade-body');
        if (!tbody) return;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="12" class="px-4 py-10 text-center text-slate-400">该日期区间无数据</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(function (row) {
            return '<tr class="border-b border-slate-50 hover:bg-slate-50/50">' +
                '<td class="px-4 py-3 font-mono">' + row.date + '</td>' +
                '<td class="px-4 py-3 font-mono text-right">' + fmtUsdc(row.volume) + '</td>' +
                '<td class="px-4 py-3 text-right">' + fmtPct(row.share) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtNum(row.tradeCount) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.takerVol) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.makerVol) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.realizedPnl) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.unrealizedPnl) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.fee) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.funding) + '</td>' +
                '<td class="px-4 py-3 text-[11px] text-slate-600">' + escapeHtml(row.activeUids) + '</td>' +
                tradeOpCell(team, row.date) +
                '</tr>';
        }).join('');
    }

    function renderAssetRows(rows, team) {
        var tbody = document.getElementById('mm-detail-asset-body');
        if (!tbody) return;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="10" class="px-4 py-10 text-center text-slate-400">该日期区间无数据</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(function (row) {
            return '<tr class="border-b border-slate-50 hover:bg-slate-50/50">' +
                '<td class="px-4 py-3 font-mono">' + row.date + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.totalAsset) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.marginUsed) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.realized) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.unrealized) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.deposit) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.withdraw) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.netDeposit) + '</td>' +
                '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(row.airdrop) + '</td>' +
                '<td class="px-4 py-3 text-right"><a class="mm-op-btn" href="' + assetDrillUrl(team, row.date) + '">按 UID 展开</a></td></tr>';
        }).join('');
    }

    function renderObRows(rows) {
        var tbody = document.getElementById('mm-detail-ob-body');
        if (!tbody) return;
        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="11" class="px-4 py-8 text-center text-slate-400">无快照数据</td></tr>';
            return;
        }
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
        }).join('');
    }

    function downloadTradeCsv(rows) {
        downloadCsv('mm_team_trade.csv',
            ['统计日期', '总成交额', '占比全站%', '总成交笔数', '吃单成交额', '挂单成交额', '总已实现盈亏', '总未实现盈亏', '手续费', '资金费用', '有成交账号'],
            rows.map(function (r) {
                return [r.date, r.volume, r.share, r.tradeCount, r.takerVol, r.makerVol, r.realizedPnl, r.unrealizedPnl, r.fee, r.funding, r.activeUids];
            }));
    }

    function downloadAssetCsv(rows) {
        downloadCsv('mm_team_asset.csv',
            ['统计日期', '总资产', '占用保证金', '已实现', '未实现', '充值', '提现', '净充值', '空投'],
            rows.map(function (r) {
                return [r.date, r.totalAsset, r.marginUsed, r.realized, r.unrealized, r.deposit, r.withdraw, r.netDeposit, r.airdrop];
            }));
    }

    function downloadObCsv(rows) {
        downloadCsv('mm_team_ob.csv',
            ['快照时间', '交易对', '挂单占比%', 'spread_bps', '10bps', '30bps', '50bps', '100bps', '200bps', '500bps', '1000bps'],
            rows.map(function (r) {
                return [r.time, r.pair, r.share, r.spreadBps, r.b10, r.b30, r.b50, r.b100, r.b200, r.b500, r.b1000];
            }));
    }

    function refreshTradeSection() {
        var fromEl = document.getElementById('mm-trade-date-from');
        var toEl = document.getElementById('mm-trade-date-to');
        var hint = document.getElementById('mm-trade-range-hint');
        var range = validateDateRange(fromEl && fromEl.value, toEl && toEl.value, hint);
        if (!range) return;
        detailState.tradeFiltered = filterRowsByDateRange(detailState.data.tradeDays, range.from, range.to);
        detailState.tradePage = 1;
        var sliced = renderPaginatedTable({
            rows: detailState.tradeFiltered,
            page: detailState.tradePage,
            paginationEl: 'mm-trade-pagination',
            handlerId: 'mm-trade-pg',
            renderBody: function (items) { renderTradeRows(items, detailState.team); }
        });
        detailState.tradePage = sliced.page;
    }

    function refreshAssetSection() {
        var fromEl = document.getElementById('mm-asset-date-from');
        var toEl = document.getElementById('mm-asset-date-to');
        var range = validateDateRange(fromEl && fromEl.value, toEl && toEl.value, null);
        if (!range) return;
        detailState.assetFiltered = filterRowsByDateRange(detailState.data.assetDays, range.from, range.to);
        detailState.assetPage = 1;
        var sliced = renderPaginatedTable({
            rows: detailState.assetFiltered,
            page: detailState.assetPage,
            paginationEl: 'mm-asset-pagination',
            handlerId: 'mm-asset-pg',
            renderBody: function (items) { renderAssetRows(items, detailState.team); }
        });
        detailState.assetPage = sliced.page;
    }

    function refreshObSection() {
        var dateInput = document.getElementById('mm-ob-date');
        var pairSel = document.getElementById('mm-ob-pair');
        var dateVal = dateInput ? dateInput.value : '';
        var pair = pairSel ? pairSel.value : 'all';
        detailState.obFiltered = detailState.data.obSnapshots.filter(function (r) {
            if (pair && pair !== 'all' && r.pair !== pair) return false;
            if (dateVal && r.time.indexOf(dateVal) !== 0) return false;
            return true;
        });
        detailState.obPage = 1;
        var sliced = renderPaginatedTable({
            rows: detailState.obFiltered,
            page: detailState.obPage,
            paginationEl: 'mm-ob-pagination',
            handlerId: 'mm-ob-pg',
            renderBody: renderObRows
        });
        detailState.obPage = sliced.page;
    }

    function defaultRangeInputs(fromId, toId, days) {
        var toEl = document.getElementById(toId);
        var fromEl = document.getElementById(fromId);
        var end = parseIsoDate('2026-11-06');
        var start = new Date(end.getTime());
        start.setDate(start.getDate() - (days - 1));
        if (toEl) toEl.value = formatIsoDate(end);
        if (fromEl) fromEl.value = formatIsoDate(start);
    }

    function initDetailPage() {
        var params = new URLSearchParams(location.search);
        var team = params.get('team') || 'Alpha MM';
        var data = getTeamData(team);
        detailState.team = team;
        detailState.data = data;

        renderDetailProfile(team, data);
        renderUidTable(data);

        defaultRangeInputs('mm-trade-date-from', 'mm-trade-date-to', 14);
        defaultRangeInputs('mm-asset-date-from', 'mm-asset-date-to', 14);

        var tradeQuery = document.getElementById('mm-trade-query');
        var tradeDl = document.getElementById('mm-trade-download');
        var assetQuery = document.getElementById('mm-asset-query');
        var assetDl = document.getElementById('mm-asset-download');
        var obQuery = document.getElementById('mm-ob-query');
        var obDl = document.getElementById('mm-ob-download');

        if (tradeQuery) tradeQuery.addEventListener('click', refreshTradeSection);
        if (assetQuery) assetQuery.addEventListener('click', refreshAssetSection);
        if (obQuery) obQuery.addEventListener('click', refreshObSection);
        if (tradeDl) tradeDl.addEventListener('click', function () { downloadTradeCsv(detailState.tradeFiltered); });
        if (assetDl) assetDl.addEventListener('click', function () { downloadAssetCsv(detailState.assetFiltered); });
        if (obDl) obDl.addEventListener('click', function () { downloadObCsv(detailState.obFiltered); });

        var dateInput = document.getElementById('mm-ob-date');
        var pairSel = document.getElementById('mm-ob-pair');
        if (pairSel) {
            pairSel.innerHTML = '<option value="all">全部交易对</option>' + PAIRS.map(function (p) {
                return '<option value="' + p + '">' + p + '</option>';
            }).join('');
        }
        if (dateInput) dateInput.value = '2026-11-06';

        refreshTradeSection();
        refreshAssetSection();
        refreshObSection();

        if (global.initAdminSidebar) global.initAdminSidebar('mm-dashboard', '登录身份: 运营管理员');
    }

    function findTradeDay(team, date) {
        var data = getTeamData(team);
        for (var i = 0; i < data.tradeDays.length; i++) {
            if (data.tradeDays[i].date === date) return data.tradeDays[i];
        }
        return null;
    }

    function findAssetDay(team, date) {
        var data = getTeamData(team);
        for (var i = 0; i < data.assetDays.length; i++) {
            if (data.assetDays[i].date === date) return data.assetDays[i];
        }
        return null;
    }

    var drillTitles = { pair: '按交易对展开', uid: '按 UID 展开', uid_vol: '按 UID & 交易额展开' };

    function initTradeDrillPage() {
        var params = new URLSearchParams(location.search);
        var team = params.get('team') || 'Alpha MM';
        var date = params.get('date') || '2026-11-06';
        var mode = params.get('mode') || 'pair';
        var day = findTradeDay(team, date);

        var back = document.getElementById('mm-drill-back');
        if (back) back.href = '做市商数据详情.html?team=' + encodeURIComponent(team);
        var title = document.getElementById('mm-drill-title');
        if (title) title.textContent = (drillTitles[mode] || '日交易额明细') + ' · ' + team;
        var meta = document.getElementById('mm-drill-meta');
        if (meta) meta.textContent = '统计日期 ' + date + ' · ' + (drillTitles[mode] || mode);

        var thead = document.getElementById('mm-drill-thead');
        var headers;
        var rows = [];
        if (!day) {
            document.getElementById('mm-drill-tbody').innerHTML = '<tr><td class="px-4 py-8 text-center text-slate-400" colspan="12">无该日数据</td></tr>';
            return;
        }

        if (mode === 'pair') {
            headers = ['交易对', '成交额', '占比全站%', '成交笔数', '吃单成交额', '挂单成交额', '手续费', '资金费用', '成交 UID'];
            if (thead) thead.innerHTML = '<tr>' + headers.map(function (h, i) {
                return '<th class="px-4 py-3' + (i > 0 ? ' text-right' : '') + '">' + h + '</th>';
            }).join('') + '</tr>';
            rows = day.pairs;
            renderPaginatedTable({
                rows: rows,
                page: 1,
                paginationEl: 'mm-drill-pagination',
                handlerId: 'mm-trade-drill-pg',
                renderBody: function (items) {
                    var tbody = document.getElementById('mm-drill-tbody');
                    tbody.innerHTML = items.map(function (p) {
                        return '<tr class="border-b border-slate-50"><td class="px-4 py-3 font-bold">' + p.pair + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(p.volume) + '</td>' +
                            '<td class="px-4 py-3 text-right">' + fmtPct(p.share) + '</td>' +
                            '<td class="px-4 py-3 text-right">' + fmtNum(p.tradeCount) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(p.takerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(p.makerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(p.fee) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(p.funding) + '</td>' +
                            '<td class="px-4 py-3 text-[11px]">' + escapeHtml(p.activeUids) + '</td></tr>';
                    }).join('');
                }
            });
            var dl = document.getElementById('mm-drill-download');
            if (dl) dl.onclick = function () {
                downloadCsv('mm_trade_pair_' + date + '.csv', headers, rows.map(function (p) {
                    return [p.pair, p.volume, p.share, p.tradeCount, p.takerVol, p.makerVol, p.fee, p.funding, p.activeUids];
                }));
            };
        } else if (mode === 'uid') {
            headers = ['UID', '成交额', '占比全站%', '成交笔数', '吃单成交额', '挂单成交额', '已实现盈亏', '未实现盈亏', '手续费', '资金费用'];
            if (thead) thead.innerHTML = '<tr>' + headers.map(function (h, i) {
                return '<th class="px-4 py-3' + (i > 0 ? ' text-right' : '') + '">' + h + '</th>';
            }).join('') + '</tr>';
            rows = day.uidRows;
            renderPaginatedTable({
                rows: rows,
                page: 1,
                paginationEl: 'mm-drill-pagination',
                handlerId: 'mm-trade-drill-pg',
                renderBody: function (items) {
                    document.getElementById('mm-drill-tbody').innerHTML = items.map(function (u) {
                        return '<tr class="border-b border-slate-50"><td class="px-4 py-3 font-mono font-bold">' + u.uid + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.volume) + '</td>' +
                            '<td class="px-4 py-3 text-right">' + fmtPct(u.share) + '</td>' +
                            '<td class="px-4 py-3 text-right">' + fmtNum(u.tradeCount) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.takerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.makerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.realizedPnl) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.unrealizedPnl) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.fee) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.funding) + '</td></tr>';
                    }).join('');
                }
            });
            document.getElementById('mm-drill-download').onclick = function () {
                downloadCsv('mm_trade_uid_' + date + '.csv', headers, rows.map(function (u) {
                    return [u.uid, u.volume, u.share, u.tradeCount, u.takerVol, u.makerVol, u.realizedPnl, u.unrealizedPnl, u.fee, u.funding];
                }));
            };
        } else {
            headers = ['UID', '交易对', '成交额', '吃单成交额', '挂单成交额', '手续费'];
            if (thead) thead.innerHTML = '<tr>' + headers.map(function (h, i) {
                return '<th class="px-4 py-3' + (i > 0 ? ' text-right' : '') + '">' + h + '</th>';
            }).join('') + '</tr>';
            rows = day.uidPairVol;
            renderPaginatedTable({
                rows: rows,
                page: 1,
                paginationEl: 'mm-drill-pagination',
                handlerId: 'mm-trade-drill-pg',
                renderBody: function (items) {
                    document.getElementById('mm-drill-tbody').innerHTML = items.map(function (r) {
                        return '<tr class="border-b border-slate-50"><td class="px-4 py-3 font-mono">' + r.uid + '</td>' +
                            '<td class="px-4 py-3 font-bold">' + r.pair + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(r.volume) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(r.takerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(r.makerVol) + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(r.fee) + '</td></tr>';
                    }).join('');
                }
            });
            document.getElementById('mm-drill-download').onclick = function () {
                downloadCsv('mm_trade_uid_pair_' + date + '.csv', headers, rows.map(function (r) {
                    return [r.uid, r.pair, r.volume, r.takerVol, r.makerVol, r.fee];
                }));
            };
        }

        if (global.initAdminSidebar) global.initAdminSidebar('mm-dashboard', '登录身份: 运营管理员');
    }

    function initAssetDrillPage() {
        var params = new URLSearchParams(location.search);
        var team = params.get('team') || 'Alpha MM';
        var date = params.get('date') || '2026-11-06';
        var day = findAssetDay(team, date);

        var back = document.getElementById('mm-drill-back');
        if (back) back.href = '做市商数据详情.html?team=' + encodeURIComponent(team);
        var meta = document.getElementById('mm-drill-meta');
        if (meta) meta.textContent = '快照日期 ' + date + ' · 团队 ' + team;

        if (!day) {
            document.getElementById('mm-drill-tbody').innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-slate-400">无该日数据</td></tr>';
            return;
        }

        var rows = day.uidRows;
        var headers = ['UID', '总资产', '占用保证金', '已实现', '未实现', '充值', '提现', '净充值'];
        renderPaginatedTable({
            rows: rows,
            page: 1,
            paginationEl: 'mm-drill-pagination',
            handlerId: 'mm-asset-drill-pg',
            renderBody: function (items) {
                document.getElementById('mm-drill-tbody').innerHTML = items.map(function (u) {
                    return '<tr class="border-b border-slate-50"><td class="px-4 py-3 font-mono font-bold">' + u.uid + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.totalAsset) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.marginUsed) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.realized) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.unrealized) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.deposit) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.withdraw) + '</td>' +
                        '<td class="px-4 py-3 text-right font-mono">' + fmtUsdc(u.netDeposit) + '</td></tr>';
                }).join('');
            }
        });
        var dl = document.getElementById('mm-drill-download');
        if (dl) dl.onclick = function () {
            downloadCsv('mm_asset_uid_' + date + '.csv', headers, rows.map(function (u) {
                return [u.uid, u.totalAsset, u.marginUsed, u.realized, u.unrealized, u.deposit, u.withdraw, u.netDeposit];
            }));
        };

        if (global.initAdminSidebar) global.initAdminSidebar('mm-dashboard', '登录身份: 运营管理员');
    }

    global.AdminMmDashboard = {
        initListPage: initListPage,
        initDetailPage: initDetailPage,
        initTradeDrillPage: initTradeDrillPage,
        initAssetDrillPage: initAssetDrillPage,
        getTeamData: getTeamData
    };
})(window);
