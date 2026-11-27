/**
 * 法币汇率配置（平台配置 · 原型）
 */
(function (global) {
    'use strict';

  /** 支持 Cobo 直接链上充值入账的币种（与 App 充值原型 enabled 列表对齐） */
    var COBO_DEPOSIT_SYMBOLS = [
        { symbol: 'USDC', name: 'USD Coin' },
        { symbol: 'USDT', name: 'Tether USD' },
        { symbol: 'BTC', name: 'Bitcoin' },
        { symbol: 'ETH', name: 'Ethereum' },
        { symbol: 'XRP', name: 'Ripple' }
    ];

    var MOCK_LATEST_PRICE = {
        USDC: { USD: '1.0000', CNY: '7.2418', JPY: '154.52' },
        USDT: { USD: '0.9998', CNY: '7.2391', JPY: '154.47' },
        BTC: { USD: '67,432.18', CNY: '488,512.00', JPY: '10,423,450.00' },
        ETH: { USD: '2,456.32', CNY: '17,789.40', JPY: '379,802.00' },
        XRP: { USD: '0.6234', CNY: '4.5130', JPY: '96.32' }
    };

    var rows = [
        {
            id: 'fr-001',
            coin: 'USDT',
            targetFiat: 'USD',
            latestPrice: '0.9998',
            coingeckoIds: 'tether',
            coingeckoVs: 'usd'
        },
        {
            id: 'fr-002',
            coin: 'BTC',
            targetFiat: 'USD',
            latestPrice: '67,432.18',
            coingeckoIds: 'bitcoin',
            coingeckoVs: 'usd'
        },
        {
            id: 'fr-003',
            coin: 'ETH',
            targetFiat: 'CNY',
            latestPrice: '17,789.40',
            coingeckoIds: 'ethereum',
            coingeckoVs: 'cny'
        }
    ];

    function $(id) { return document.getElementById(id); }

    function toast(msg) {
        var el = $('fiat-rate-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.add('hidden'); }, 2200);
    }

    function formatLatestPrice(coin, targetFiat) {
        var c = String(coin || '').toUpperCase();
        var f = String(targetFiat || '').toUpperCase();
        if (MOCK_LATEST_PRICE[c] && MOCK_LATEST_PRICE[c][f]) return MOCK_LATEST_PRICE[c][f];
        return '—';
    }

    function renderTable() {
        var tbody = $('fiat-rate-tbody');
        var countEl = $('fiat-rate-count');
        if (!tbody) return;
        if (countEl) countEl.textContent = '共 ' + rows.length + ' 条';

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-16 text-center text-slate-400 font-medium">暂无法币汇率配置，请点击右上角新增</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(function (r) {
            return '<tr class="hover:bg-slate-50/80 transition-colors">' +
                '<td class="px-6 py-4 font-bold text-slate-800">' + r.coin + '</td>' +
                '<td class="px-6 py-4 font-mono text-slate-700">' + r.targetFiat + '</td>' +
                '<td class="px-6 py-4 text-right font-mono font-bold text-slate-900 tabular-nums">' + r.latestPrice + '</td>' +
                '</tr>';
        }).join('');
    }

    function populateCoinSelect() {
        var sel = $('fiat-form-coin');
        if (!sel) return;
        sel.innerHTML = COBO_DEPOSIT_SYMBOLS.map(function (c) {
            return '<option value="' + c.symbol + '">' + c.symbol + ' · ' + c.name + '</option>';
        }).join('');
    }

    function openModal() {
        var modal = $('modal-fiat-rate-add');
        if (!modal) return;
        $('fiat-form-coin').value = COBO_DEPOSIT_SYMBOLS[0].symbol;
        $('fiat-form-target').value = '';
        $('fiat-form-coingecko-id').value = '';
        $('fiat-form-coingecko-vs').value = '';
        $('fiat-form-target-err').classList.add('hidden');
        modal.classList.remove('hidden');
    }

    function closeModal() {
        $('modal-fiat-rate-add')?.classList.add('hidden');
    }

    function bindUppercaseTarget() {
        var input = $('fiat-form-target');
        if (!input) return;
        input.addEventListener('input', function () {
            var filtered = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
            if (filtered !== input.value) input.value = filtered;
        });
    }

    function confirmAdd() {
        var coin = $('fiat-form-coin').value;
        var target = $('fiat-form-target').value.trim().toUpperCase();
        var cgId = $('fiat-form-coingecko-id').value.trim();
        var cgVs = $('fiat-form-coingecko-vs').value.trim();
        var err = $('fiat-form-target-err');

        if (!target) {
            err.textContent = '请填写目标法币币种（仅大写英文字母）';
            err.classList.remove('hidden');
            return;
        }
        if (!/^[A-Z]+$/.test(target)) {
            err.textContent = '目标法币币种仅支持大写英文字母';
            err.classList.remove('hidden');
            return;
        }
        err.classList.add('hidden');

        var dup = rows.some(function (r) { return r.coin === coin && r.targetFiat === target; });
        if (dup) {
            toast('已存在相同币种与目标法币组合');
            return;
        }

        var nextId = 'fr-' + String(rows.length + 1).padStart(3, '0');
        rows.unshift({
            id: nextId,
            coin: coin,
            targetFiat: target,
            latestPrice: formatLatestPrice(coin, target),
            coingeckoIds: cgId || '—',
            coingeckoVs: cgVs || '—'
        });
        renderTable();
        closeModal();
        toast('已新增法币汇率配置（原型演示）');
    }

    function initFiatRateAdmin() {
        populateCoinSelect();
        bindUppercaseTarget();
        renderTable();

        $('btn-fiat-rate-add')?.addEventListener('click', openModal);
        $('btn-fiat-rate-cancel')?.addEventListener('click', closeModal);
        $('btn-fiat-rate-confirm')?.addEventListener('click', confirmAdd);
        $('modal-fiat-rate-add')?.addEventListener('click', function (e) {
            if (e.target.id === 'modal-fiat-rate-add') closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    global.initFiatRateAdmin = initFiatRateAdmin;
})(window);