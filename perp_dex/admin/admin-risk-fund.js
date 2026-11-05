(function (global) {
    'use strict';

    var STORAGE_MARKET_KEY = 'forx_admin_contract_quote_market';
    var LIST_PAGE_SIZE = 20;
    var DETAIL_PAGE_SIZE = 20;

    var SUMMARY = {
        total: 8934233,
        transferIn: 34233,
        liquidationSurplus: 34233,
        shortfall: 34233
    };

    var TX_TYPES = {
        transfer_inject: '划转注入',
        liquidation_surplus: '强平盈余注入',
        shortfall: '穿仓亏损'
    };

    var state = {
        market: '',
        listPage: 1,
        filterPair: 'all',
        detailPair: '',
        detailUid: '',
        detailTxType: 'all',
        detailRangeDays: 7,
        detailTablePage: 1,
        transferRowId: null,
        transferAmount: ''
    };

    var PAIR_RESERVE = {
        BTCUSDC: 90530.54,
        ETHUSDC: 68420.12,
        SOLUSDC: 54650.34,
        ARBUSDC: 12000,
        DOGEUSDC: 8800.5
    };

    function pad2(n) { return n < 10 ? '0' + n : String(n); }
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
    function fmtUsdc(n) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) + ' USDC';
    }
    function fmtUsdcPlain(n) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }

    function buildAccounts(market) {
        var suffix = market || 'USDC';
        var pairs = ['BTC' + suffix, 'ETH' + suffix, 'SOL' + suffix, 'ARB' + suffix, 'DOGE' + suffix];
        var rows = [];
        pairs.forEach(function (pair, pi) {
            for (var i = 0; i < 5; i++) {
                var id = pair + '-RF-' + (100001 + pi * 10 + i);
                rows.push({
                    id: id,
                    pair: pair,
                    uid: 'RF' + (880000 + pi * 100 + i),
                    fundingBalance: 1000000 - i * 12000 + pi * 5000,
                    contractBalance: (PAIR_RESERVE[pair] || 50000) - i * 800 + pi * 200,
                    cumTransfer: 12000 + i * 1500 + pi * 800,
                    cumSurplus: 8900 + i * 1100,
                    cumShortfall: 2100 + i * 400
                });
            }
        });
        return rows;
    }

    var accounts = [];

    function buildDetailLedger(pair) {
        var rows = [];
        var balance = PAIR_RESERVE[pair] || 80000;
        var keys = ['transfer_inject', 'liquidation_surplus', 'shortfall'];
        var now = Date.now();
        for (var i = 0; i < 42; i++) {
            var typeKey = keys[i % 3];
            var amount = typeKey === 'shortfall'
                ? -(20 + (i % 6) * 15.5)
                : (50 + (i % 8) * 22.3);
            balance = Math.round((balance + amount) * 100) / 100;
            var t = new Date(now - i * 7200000);
            rows.push({
                pair: pair,
                typeKey: typeKey,
                typeLabel: TX_TYPES[typeKey],
                amount: amount,
                balance: balance,
                time: formatTableTime(t),
                ts: t.getTime()
            });
        }
        rows.sort(function (a, b) { return b.ts - a.ts; });
        return rows;
    }

    function showView(id) {
        ['view-market', 'view-list', 'view-detail'].forEach(function (vid) {
            var el = document.getElementById(vid);
            if (el) el.classList.toggle('hidden', vid !== id);
        });
    }

    function populateMarketSelect() {
        var sel = document.getElementById('rf-market-select');
        if (!sel || !global.ForxAdminCoinConfig) return;
        var coins = global.ForxAdminCoinConfig.getContractMarketQuoteCoins();
        sel.innerHTML = coins.map(function (c) {
            return '<option value="' + c.symbol + '">' + c.symbol + '</option>';
        }).join('');
        var saved = localStorage.getItem(STORAGE_MARKET_KEY) || 'USDC';
        if (sel.querySelector('option[value="' + saved + '"]')) sel.value = saved;
    }

    function renderSummary(prefix) {
        prefix = prefix || 'rf';
        var map = [
            ['total', SUMMARY.total],
            ['transfer', SUMMARY.transferIn],
            ['surplus', SUMMARY.liquidationSurplus],
            ['shortfall', SUMMARY.shortfall]
        ];
        map.forEach(function (item) {
            var el = document.getElementById(prefix + '-stat-' + item[0]);
            if (el) el.textContent = fmtUsdcPlain(item[1]) + ' USDC';
        });
    }

    function getFilteredAccounts() {
        return accounts.filter(function (row) {
            if (state.filterPair !== 'all' && row.pair !== state.filterPair) return false;
            return true;
        });
    }

    function renderList() {
        var filtered = getFilteredAccounts();
        var sliced = AdminPagination.slice(filtered, state.listPage, LIST_PAGE_SIZE);
        state.listPage = sliced.page;
        var tbody = document.getElementById('rf-list-tbody');
        if (!tbody) return;
        if (!sliced.items.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-12 text-center text-slate-400 font-bold">暂无数据</td></tr>';
        } else {
            tbody.innerHTML = sliced.items.map(function (row) {
                return '<tr class="border-b border-slate-50 hover:bg-slate-50/80">' +
                    '<td class="px-4 py-3 font-black text-slate-800">' + row.pair + '</td>' +
                    '<td class="px-4 py-3 font-mono text-[11px]">' + row.uid + '</td>' +
                    '<td class="px-4 py-3 font-bold">' + fmtUsdc(row.fundingBalance) + '</td>' +
                    '<td class="px-4 py-3 font-bold text-blue-700">' + fmtUsdc(row.contractBalance) + '</td>' +
                    '<td class="px-4 py-3">' + fmtUsdc(row.cumTransfer) + '</td>' +
                    '<td class="px-4 py-3">' + fmtUsdc(row.cumSurplus) + '</td>' +
                    '<td class="px-4 py-3 text-red-600 font-bold">' + fmtUsdc(row.cumShortfall) + '</td>' +
                    '<td class="px-4 py-3 text-right space-x-3 whitespace-nowrap">' +
                    '<button type="button" class="text-blue-600 font-black hover:underline" data-action="open-transfer" data-id="' + row.id + '">划转资金</button>' +
                    '<button type="button" class="text-slate-600 font-black hover:underline" data-action="open-detail" data-id="' + row.id + '">详情</button>' +
                    '</td></tr>';
            }).join('');
        }
        var hint = document.getElementById('rf-list-hint');
        if (hint) hint.textContent = '共 ' + filtered.length + ' 条';
        AdminPagination.mount('rf-list-pagination', filtered.length, state.listPage, 'risk-fund-list', LIST_PAGE_SIZE);
    }

    function fillPairFilter() {
        var sel = document.getElementById('rf-pair-filter');
        if (!sel) return;
        var pairs = [];
        accounts.forEach(function (a) {
            if (pairs.indexOf(a.pair) === -1) pairs.push(a.pair);
        });
        pairs.sort();
        sel.innerHTML = '<option value="all">全部</option>' + pairs.map(function (p) {
            return '<option value="' + p + '">' + p + '</option>';
        }).join('');
        sel.value = state.filterPair;
    }

    function findAccount(id) {
        return accounts.filter(function (a) { return a.id === id; })[0];
    }

    function renderChart(svgId, pair, rangeDays) {
        var svg = document.getElementById(svgId);
        if (!svg) return;
        var base = PAIR_RESERVE[pair] || 80000;
        var series = [];
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        for (var i = rangeDays - 1; i >= 0; i--) {
            var dt = new Date(now);
            dt.setDate(dt.getDate() - i);
            series.push({
                date: dt,
                value: Math.round((base - 1500 + i * 40 + Math.sin(i) * 900) * 100) / 100
            });
        }
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
        var span = maxV - minV || 1;
        minV -= span * 0.08;
        maxV += span * 0.08;
        function xAt(i) {
            return padL + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
        }
        function yAt(v) {
            return padT + innerH - ((v - minV) / (maxV - minV)) * innerH;
        }
        var step = rangeDays === 7 ? 2 : 3;
        var parts = ['<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>'];
        for (var g = 0; g <= 4; g++) {
            var gy = padT + (innerH / 4) * g;
            var gv = maxV - ((maxV - minV) / 4) * g;
            parts.push('<line x1="' + padL + '" y1="' + gy + '" x2="' + (w - padR) + '" y2="' + gy + '" stroke="#f1f5f9" stroke-width="1"/>');
            parts.push('<text x="' + (padL - 8) + '" y="' + (gy + 4) + '" text-anchor="end" fill="#94a3b8" font-size="10" font-weight="700">' +
                Math.round(gv).toLocaleString() + '</text>');
        }
        series.forEach(function (p, i) {
            if (i % step !== 0 && i !== series.length - 1) return;
            parts.push('<text x="' + xAt(i) + '" y="' + (h - 10) + '" text-anchor="middle" fill="#64748b" font-size="10" font-weight="700">' +
                formatAxisDate(p.date) + '</text>');
        });
        var d = series.map(function (p, i) {
            return (i === 0 ? 'M' : 'L') + xAt(i).toFixed(2) + ' ' + yAt(p.value).toFixed(2);
        }).join(' ');
        parts.push('<path d="' + d + '" fill="none" stroke="#2563eb" stroke-width="2.5"/>');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.innerHTML = parts.join('');
    }

    function getDetailRows() {
        var all = buildDetailLedger(state.detailPair);
        return all.filter(function (row) {
            if (state.detailTxType !== 'all' && row.typeKey !== state.detailTxType) return false;
            return true;
        });
    }

    function renderDetail() {
        var title = document.getElementById('rf-detail-title');
        if (title) title.textContent = state.detailPair + ' · UID ' + state.detailUid;
        var reserveEl = document.getElementById('rf-detail-reserve');
        if (reserveEl) {
            reserveEl.textContent = fmtUsdc(PAIR_RESERVE[state.detailPair] || 0);
        }
        renderSummary('rf-detail');
        renderChart('rf-detail-chart', state.detailPair, state.detailRangeDays);
        var rows = getDetailRows();
        var sliced = AdminPagination.slice(rows, state.detailTablePage, DETAIL_PAGE_SIZE);
        state.detailTablePage = sliced.page;
        var tbody = document.getElementById('rf-detail-tbody');
        if (tbody) {
            tbody.innerHTML = sliced.items.map(function (row) {
                var cls = row.amount >= 0 ? 'text-green-600' : 'text-red-600';
                var amt = (row.amount >= 0 ? '+' : '') + fmtUsdcPlain(row.amount) + ' USDC';
                return '<tr class="border-b border-slate-50">' +
                    '<td class="px-4 py-3 font-mono text-[11px] text-slate-600">' + row.time + '</td>' +
                    '<td class="px-4 py-3 font-bold">' + row.typeLabel + '</td>' +
                    '<td class="px-4 py-3 font-black ' + cls + '">' + amt + '</td>' +
                    '<td class="px-4 py-3 font-bold">' + fmtUsdc(row.balance) + '</td></tr>';
            }).join('');
        }
        AdminPagination.mount('rf-detail-pagination', rows.length, state.detailTablePage, 'risk-fund-detail', DETAIL_PAGE_SIZE);
        var b7 = document.getElementById('rf-detail-range-7');
        var b30 = document.getElementById('rf-detail-range-30');
        if (b7) b7.className = 'rf-range-btn' + (state.detailRangeDays === 7 ? ' active' : '');
        if (b30) b30.className = 'rf-range-btn' + (state.detailRangeDays === 30 ? ' active' : '');
    }

    function openTransferModal(row) {
        state.transferRowId = row.id;
        state.transferAmount = '';
        document.getElementById('rf-transfer-from-balance').textContent = fmtUsdcPlain(row.fundingBalance) + ' USDC';
        document.getElementById('rf-transfer-to-balance').textContent = fmtUsdcPlain(row.contractBalance) + ' USDC';
        document.getElementById('rf-transfer-available').textContent = fmtUsdcPlain(row.fundingBalance);
        document.getElementById('rf-transfer-amount').value = '';
        document.getElementById('rf-transfer-modal').classList.remove('hidden');
    }

    function closeTransferModal() {
        document.getElementById('rf-transfer-modal').classList.add('hidden');
        state.transferRowId = null;
    }

    function confirmTransfer() {
        var row = findAccount(state.transferRowId);
        if (!row) return closeTransferModal();
        var amt = parseFloat(String(state.transferAmount).replace(/,/g, ''));
        if (!amt || amt < 0.000001 || amt > row.fundingBalance) {
            alert('请输入有效划转数量（最低 0.000001 USDC，且不超过可用余额）');
            return;
        }
        row.fundingBalance = Math.round((row.fundingBalance - amt) * 1000000) / 1000000;
        row.contractBalance = Math.round((row.contractBalance + amt) * 1000000) / 1000000;
        row.cumTransfer = Math.round((row.cumTransfer + amt) * 100) / 100;
        closeTransferModal();
        renderList();
        alert('划转成功（原型）');
    }

    function enterList(market) {
        state.market = market;
        localStorage.setItem(STORAGE_MARKET_KEY, market);
        accounts = buildAccounts(market);
        state.listPage = 1;
        state.filterPair = 'all';
        var label = document.getElementById('rf-current-market');
        if (label) label.textContent = market;
        fillPairFilter();
        renderSummary('rf');
        renderList();
        showView('view-list');
    }

    function openDetail(row) {
        state.detailPair = row.pair;
        state.detailUid = row.uid;
        state.detailTxType = 'all';
        state.detailRangeDays = 7;
        state.detailTablePage = 1;
        var typeSel = document.getElementById('rf-detail-type-select');
        if (typeSel) typeSel.value = 'all';
        showView('view-detail');
        renderDetail();
    }

    function bindEvents() {
        document.body.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');
            if (action === 'confirm-market') {
                var sel = document.getElementById('rf-market-select');
                if (sel && sel.value) enterList(sel.value);
            } else if (action === 'switch-market') {
                showView('view-market');
            } else if (action === 'query-list') {
                var pf = document.getElementById('rf-pair-filter');
                state.filterPair = pf ? pf.value : 'all';
                state.listPage = 1;
                renderList();
            } else if (action === 'open-transfer') {
                openTransferModal(findAccount(btn.getAttribute('data-id')));
            } else if (action === 'open-detail') {
                openDetail(findAccount(btn.getAttribute('data-id')));
            } else if (action === 'back-list') {
                showView('view-list');
                renderList();
            } else if (action === 'close-transfer') {
                closeTransferModal();
            } else if (action === 'confirm-transfer') {
                confirmTransfer();
            } else if (action === 'transfer-pct') {
                var row = findAccount(state.transferRowId);
                if (!row) return;
                var pct = parseFloat(btn.getAttribute('data-pct'));
                var amt = Math.floor(row.fundingBalance * pct * 1000000) / 1000000;
                document.getElementById('rf-transfer-amount').value = amt ? String(amt) : '';
                state.transferAmount = amt ? String(amt) : '';
            } else if (action === 'transfer-all') {
                var row2 = findAccount(state.transferRowId);
                if (!row2) return;
                document.getElementById('rf-transfer-amount').value = String(row2.fundingBalance);
                state.transferAmount = String(row2.fundingBalance);
            } else if (action === 'detail-range') {
                state.detailRangeDays = parseInt(btn.getAttribute('data-days'), 10) || 7;
                renderDetail();
            }
        });

        var amtInput = document.getElementById('rf-transfer-amount');
        if (amtInput) {
            amtInput.addEventListener('input', function () {
                state.transferAmount = amtInput.value;
            });
        }
        var detailType = document.getElementById('rf-detail-type-select');
        if (detailType) {
            detailType.addEventListener('change', function () {
                state.detailTxType = detailType.value;
                state.detailTablePage = 1;
                renderDetail();
            });
        }
    }

    function initRiskFundAdmin() {
        populateMarketSelect();
        renderSummary('rf');
        bindEvents();
        AdminPagination.register('risk-fund-list', function (p) {
            state.listPage = p;
            renderList();
        });
        AdminPagination.register('risk-fund-detail', function (p) {
            state.detailTablePage = p;
            renderDetail();
        });
        var saved = localStorage.getItem(STORAGE_MARKET_KEY);
        if (saved && global.ForxAdminCoinConfig && global.ForxAdminCoinConfig.isContractMarketQuoteCoin(saved)) {
            enterList(saved);
        } else {
            showView('view-market');
        }
    }

    global.initRiskFundAdmin = initRiskFundAdmin;
})(window);
