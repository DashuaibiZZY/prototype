/**
 * ForX Web · 风险保障基金页（原型 mock + 图表/表格/分页）
 */
(function (global) {
    var PAGE_SIZE = 20;
    var state = {
        pair: 'BTCUSDC',
        txType: 'all',
        rangeDays: 7,
        tablePage: 1
    };

    var PAIR_META = {
        BTCUSDC: { reserve: 90530.54, totalShare: 90530.54 },
        ETHUSDC: { reserve: 68420.12, totalShare: 68420.12 },
        SOLUSDC: { reserve: 54650.34, totalShare: 54650.34 }
    };

    var TX_TYPES = {
        liquidation_surplus: '强平盈余注入',
        shortfall: '穿仓亏损'
    };

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function pad3(n) {
        if (n < 10) return '00' + n;
        if (n < 100) return '0' + n;
        return String(n);
    }

    function formatTableTime(d) {
        return d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) + ' ' +
            pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + '.' +
            pad3(d.getMilliseconds());
    }

    function formatAxisDate(d) {
        return pad2(d.getMonth() + 1) + '/' + pad2(d.getDate());
    }

    function buildChartSeries(pair, days) {
        var base = PAIR_META[pair] ? PAIR_META[pair].reserve : 80000;
        var out = [];
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        for (var i = days - 1; i >= 0; i--) {
            var dt = new Date(now);
            dt.setDate(dt.getDate() - i);
            var wave = Math.sin((days - i) * 0.45 + pair.length) * 1200;
            var drift = (days - i) * 35;
            out.push({ date: dt, value: Math.round((base - 1800 + drift + wave) * 100) / 100 });
        }
        return out;
    }

    function buildLedgerRows() {
        var rows = [];
        var pairs = ['BTCUSDC', 'ETHUSDC', 'SOLUSDC'];
        var balanceMap = { BTCUSDC: 90200, ETHUSDC: 68100, SOLUSDC: 54400 };
        var now = Date.now();
        for (var i = 0; i < 48; i++) {
            var pair = pairs[i % pairs.length];
            var isSurplus = i % 3 !== 1;
            var typeKey = isSurplus ? 'liquidation_surplus' : 'shortfall';
            var amount = isSurplus
                ? +(80 + (i % 7) * 12.5 + (i * 3.7) % 40).toFixed(2)
                : -(30 + (i % 5) * 8.2 + (i * 2.1) % 20).toFixed(2);
            balanceMap[pair] = Math.round((balanceMap[pair] + amount) * 100) / 100;
            var t = new Date(now - i * 3600000 * 4 - (i % 11) * 60000);
            rows.push({
                pair: pair,
                typeKey: typeKey,
                typeLabel: TX_TYPES[typeKey],
                amount: amount,
                balance: balanceMap[pair],
                time: formatTableTime(t),
                ts: t.getTime()
            });
        }
        rows.sort(function (a, b) { return b.ts - a.ts; });
        return rows;
    }

    var ALL_ROWS = buildLedgerRows();

    function filteredRows() {
        return ALL_ROWS.filter(function (row) {
            if (state.pair !== 'ALL' && row.pair !== state.pair) return false;
            if (state.txType !== 'all' && row.typeKey !== state.txType) return false;
            return true;
        });
    }

    function buildPaginationHtml(total, page, handlerName) {
        var pages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
        page = Math.max(1, Math.min(page, pages));
        var html = '<button type="button" class="web-page-btn"' + (page <= 1 ? ' disabled' : '') +
            ' onclick="' + handlerName + '(' + (page - 1) + ')">&lt;</button>';
        var nums = pages <= 7 ? Array.from({ length: pages }, function (_, i) { return i + 1; }) : [1, 2, 3, '...', pages];
        nums.forEach(function (item) {
            if (item === '...') {
                html += '<span class="web-page-ellipsis">...</span>';
            } else {
                html += '<button type="button" class="web-page-btn' + (item === page ? ' active' : '') +
                    '" onclick="' + handlerName + '(' + item + ')">' + item + '</button>';
            }
        });
        html += '<button type="button" class="web-page-btn"' + (page >= pages ? ' disabled' : '') +
            ' onclick="' + handlerName + '(' + (page + 1) + ')">&gt;</button>';
        return html;
    }

    function renderChart() {
        var svg = document.getElementById('risk-fund-chart');
        if (!svg) return;
        var pair = state.pair === 'ALL' ? 'BTCUSDC' : state.pair;
        var series = buildChartSeries(pair, state.rangeDays);
        var w = 900;
        var h = 260;
        var padL = 56;
        var padR = 24;
        var padT = 16;
        var padB = 36;
        var innerW = w - padL - padR;
        var innerH = h - padT - padB;
        var minV = Infinity;
        var maxV = -Infinity;
        series.forEach(function (p) {
            minV = Math.min(minV, p.value);
            maxV = Math.max(maxV, p.value);
        });
        if (minV === maxV) {
            minV -= 100;
            maxV += 100;
        }
        var span = maxV - minV;
        minV -= span * 0.08;
        maxV += span * 0.08;

        function xAt(i) {
            return padL + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
        }
        function yAt(v) {
            return padT + innerH - ((v - minV) / (maxV - minV)) * innerH;
        }

        var step = state.rangeDays === 7 ? 2 : 3;
        var parts = [];
        parts.push('<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>');
        for (var g = 0; g <= 4; g++) {
            var gy = padT + (innerH / 4) * g;
            var gv = maxV - ((maxV - minV) / 4) * g;
            parts.push('<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="#f3f4f6" stroke-width="1"/>');
            parts.push('<text x="' + (padL - 8) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#9ca3af" font-size="10" font-weight="700">' +
                Math.round(gv).toLocaleString() + '</text>');
        }
        series.forEach(function (p, i) {
            if (i % step !== 0 && i !== series.length - 1) return;
            var x = xAt(i);
            parts.push('<text x="' + x + '" y="' + (h - 10) + '" text-anchor="middle" fill="#6b7280" font-size="10" font-weight="700">' +
                formatAxisDate(p.date) + '</text>');
        });
        var d = series.map(function (p, i) {
            return (i === 0 ? 'M' : 'L') + xAt(i).toFixed(2) + ' ' + yAt(p.value).toFixed(2);
        }).join(' ');
        var areaD = d + ' L' + xAt(series.length - 1).toFixed(2) + ' ' + (padT + innerH) +
            ' L' + xAt(0).toFixed(2) + ' ' + (padT + innerH) + ' Z';
        parts.push('<path d="' + areaD + '" fill="rgba(37,99,235,0.08)"/>');
        parts.push('<path d="' + d + '" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>');
        series.forEach(function (p, i) {
            parts.push('<circle cx="' + xAt(i).toFixed(2) + '" cy="' + yAt(p.value).toFixed(2) +
                '" r="3" fill="#2563eb" stroke="#fff" stroke-width="1.5"/>');
        });
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.innerHTML = parts.join('');
    }

    function renderTable() {
        var rows = filteredRows();
        var total = rows.length;
        var pages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
        state.tablePage = Math.max(1, Math.min(state.tablePage, pages));
        var start = (state.tablePage - 1) * PAGE_SIZE;
        var slice = rows.slice(start, start + PAGE_SIZE);
        var tbody = document.getElementById('risk-fund-tbody');
        if (tbody) {
            tbody.innerHTML = slice.map(function (row) {
                var amtClass = row.amount >= 0 ? 'text-green-600' : 'text-red-500';
                var amtText = (row.amount >= 0 ? '+' : '') + row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDC';
                return '<tr class="hover:bg-gray-50/80 border-b border-gray-50">' +
                    '<td class="px-4 py-3 font-mono text-[11px] text-gray-600">' + row.time + '</td>' +
                    '<td class="px-4 py-3 font-bold text-gray-800">' + row.typeLabel + '</td>' +
                    '<td class="px-4 py-3 font-black ' + amtClass + '">' + amtText + '</td>' +
                    '<td class="px-4 py-3 font-bold text-gray-900">' + row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDC</td>' +
                    '</tr>';
            }).join('');
        }
        var pag = document.getElementById('risk-fund-pagination');
        if (pag) pag.innerHTML = buildPaginationHtml(total, state.tablePage, 'RiskFundPage.goTablePage');
    }

    function renderHeader() {
        var pair = state.pair === 'ALL' ? 'BTCUSDC' : state.pair;
        var meta = PAIR_META[pair] || PAIR_META.BTCUSDC;
        var labelEl = document.getElementById('risk-fund-pair-label');
        var reserveEl = document.getElementById('risk-fund-reserve');
        if (labelEl) labelEl.textContent = pair;
        if (reserveEl) {
            reserveEl.textContent = meta.reserve.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDC';
        }
    }

    function syncRangeButtons() {
        var b7 = document.getElementById('risk-range-7');
        var b30 = document.getElementById('risk-range-30');
        if (!b7 || !b30) return;
        b7.className = 'risk-range-btn' + (state.rangeDays === 7 ? ' active' : '');
        b30.className = 'risk-range-btn' + (state.rangeDays === 30 ? ' active' : '');
    }

    function refresh() {
        renderHeader();
        renderChart();
        renderTable();
        syncRangeButtons();
    }

    function setPair(val) {
        state.pair = val;
        state.tablePage = 1;
        refresh();
    }

    function setTxType(val) {
        state.txType = val;
        state.tablePage = 1;
        refresh();
    }

    function setRange(days) {
        state.rangeDays = days;
        refresh();
    }

    function goTablePage(p) {
        state.tablePage = p;
        renderTable();
    }

    function init() {
        var pairSel = document.getElementById('risk-pair-select');
        var typeSel = document.getElementById('risk-type-select');
        if (pairSel) {
            pairSel.addEventListener('change', function () { setPair(pairSel.value); });
        }
        if (typeSel) {
            typeSel.addEventListener('change', function () { setTxType(typeSel.value); });
        }
        refresh();
    }

    global.RiskFundPage = {
        init: init,
        setRange: setRange,
        goTablePage: goTablePage,
        setPair: setPair,
        setTxType: setTxType
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
