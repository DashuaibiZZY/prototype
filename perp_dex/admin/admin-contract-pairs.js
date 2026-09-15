(function (global) {
    'use strict';

    var STORAGE_MARKET_KEY = 'forx_admin_contract_quote_market';

    /** 币种配置表（原型 mock；仅 USDC 可选为市场计价货币） */
    var COIN_CONFIG = [
        { symbol: 'USDC', name: 'USD Coin', status: 'enabled', selectable: true },
        { symbol: 'USDT', name: 'Tether USD', status: 'enabled', selectable: false },
        { symbol: 'BTC', name: 'Bitcoin', status: 'enabled', selectable: false },
        { symbol: 'ETH', name: 'Ethereum', status: 'enabled', selectable: false },
        { symbol: 'SOL', name: 'Solana', status: 'enabled', selectable: false },
        { symbol: 'BNB', name: 'BNB', status: 'enabled', selectable: false },
        { symbol: 'XRP', name: 'Ripple', status: 'enabled', selectable: false },
        { symbol: 'DOGE', name: 'Dogecoin', status: 'enabled', selectable: false },
        { symbol: 'NEW', name: 'New Coin', status: 'enabled', selectable: false }
    ];

    var INDEX_SOURCE_OPTIONS = ['binance', 'okx', 'bybit', 'hyperliquid'];
    var MAX_INDEX_SOURCES = 4;

    var TAG_PRICE_CALCULATE_TYPES = [
        { value: 1, label: '采取中位数' },
        { value: 2, label: '采用最新价' },
        { value: 3, label: '采用中间价合理价' },
        { value: 4, label: '采用资金费率溢价' }
    ];

    var TAG_OPTIONS = ['perpetual', 'hot', 'new', 'meme'];

    var STATUS_LABELS = { enabled: '启用', disabled: '禁用' };

    var pairsByMarket = {
        USDC: [
            defaultPair('BTCUSDC', 'BTC'),
            defaultPair('ETHUSDC', 'ETH'),
            (function () {
                var p = defaultPair('SOLUSDC', 'SOL');
                p.front_hidden = true;
                p.status = 'disabled';
                p.allow_trade_start_time = '2026-10-01T08:00';
                return p;
            })()
        ]
    };

    var selectedMarket = '';
    var editingProduct = null;
    var tagModalOpen = false;

    function defaultPair(productName, baseCoin) {
        return {
            product_name: productName,
            icon_url: 'https://static.example.com/icons/' + baseCoin.toLowerCase() + '.png',
            swap_value: '0.001',
            base_coin_name: baseCoin,
            coin_precision: 4,
            quote_precision: 2,
            price_precision: 1,
            maintenance_margin_rate: [
                { min_quantity: '0', max_quantity: '50', max_level: 50, maintenance_margin_rate: '0.004' },
                { min_quantity: '50', max_quantity: '200', max_level: 25, maintenance_margin_rate: '0.005' },
                { min_quantity: '200', max_quantity: '0', max_level: 10, maintenance_margin_rate: '0.01' }
            ],
            front_hidden: false,
            status: 'enabled',
            quote_enable: false,
            quote_sort: 1,
            create_time: '2026-09-01 10:00:00',
            update_time: '2026-09-10 14:30:00',
            allow_trade_start_time: '2026-09-01T00:00',
            sort: 1,
            depth_level: 10,
            tags: ['perpetual', 'hot'],
            limit_config: {
                market_max_deeps: 5,
                price_unit: 1,
                price_range: '0.05',
                circuit_rate: '0.02',
                max_once_limit_cost: '100000',
                min_once_limit_cost: '1',
                split_market_cost: '20000',
                max_hold_amount: '1000',
                max_book_num: 200
            },
            funding_rate_config: {
                is_mm_admin: false,
                funds_rate_precision: 6,
                funds_rate_max: '0.0075',
                funds_rate_min: '-0.0075',
                funds_rate_interests: '0.0001',
                funds_interval_hour: 8,
                funds_init_ts: 1750000000
            },
            account_config: {
                risk_account_min: '10000',
                risk_threshold: '5000',
                risk_reserve_coverage_limit: '0.02'
            },
            index_config: {
                enable: true,
                source: [
                    { weight: 60, source_name: 'binance', sub_base_coin_name: baseCoin, sub_value_coin_name: 'USDT' },
                    { weight: 40, source_name: 'okx', sub_base_coin_name: baseCoin, sub_value_coin_name: 'USDT' }
                ]
            },
            tag_price_config: {
                basis_move_cycle: 20,
                tag_price_calculate_type: 1
            },
            fee_rate_config: {
                enable: true,
                taker_fee: '0.0005',
                maker_fee: '0.0002'
            }
        };
    }

    function getStoredMarket() {
        try { return sessionStorage.getItem(STORAGE_MARKET_KEY) || ''; } catch (e) { return ''; }
    }

    function setStoredMarket(symbol) {
        try { sessionStorage.setItem(STORAGE_MARKET_KEY, symbol); } catch (e) { /* noop */ }
    }

    function getPairs() {
        if (!selectedMarket) return [];
        if (!pairsByMarket[selectedMarket]) pairsByMarket[selectedMarket] = [];
        return pairsByMarket[selectedMarket];
    }

    function findPair(name) {
        return getPairs().filter(function (p) { return p.product_name === name; })[0] || null;
    }

    function showView(id) {
        ['view-market', 'view-list', 'view-form'].forEach(function (v) {
            var el = document.getElementById(v);
            if (el) el.classList.toggle('hidden', v !== id);
        });
    }

    function fmtBool(v) {
        return v ? '是' : '否';
    }

    function fmtStatus(s) {
        return STATUS_LABELS[s] || s;
    }

    function fmtDateTime(v) {
        if (!v) return '—';
        return String(v).replace('T', ' ');
    }

    function renderMarketView() {
        var select = document.getElementById('market-coin-select');
        if (!select) return;
        select.innerHTML = COIN_CONFIG.map(function (c) {
            var disabled = !c.selectable ? ' disabled' : '';
            var hint = c.selectable ? '' : '（不可选）';
            return '<option value="' + c.symbol + '"' + disabled + '>' + c.symbol + ' · ' + c.name + hint + '</option>';
        }).join('');
        select.value = 'USDC';
        var btn = document.getElementById('btn-market-confirm');
        if (btn) btn.disabled = select.value !== 'USDC';
        select.onchange = function () {
            if (btn) btn.disabled = select.value !== 'USDC';
        };
    }

    function renderList() {
        var tbody = document.getElementById('pair-list-body');
        var hint = document.getElementById('pair-list-hint');
        var marketLabel = document.getElementById('current-market-label');
        if (marketLabel) marketLabel.textContent = selectedMarket;
        var pairs = getPairs();
        if (hint) hint.textContent = '共 ' + pairs.length + ' 条 · 计价市场 ' + selectedMarket;
        if (!tbody) return;
        if (!pairs.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400 font-bold">暂无交易对，点击「+ 新增交易对」添加</td></tr>';
            return;
        }
        tbody.innerHTML = pairs.map(function (p) {
            return '<tr class="hover:bg-slate-50/80">' +
                '<td class="px-6 py-4 font-black text-slate-800">' + p.product_name + '</td>' +
                '<td class="px-6 py-4 text-center">' + fmtBool(p.front_hidden) + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="status-pill ' + (p.status === 'enabled' ? 'status-on' : 'status-off') + '">' + fmtStatus(p.status) + '</span></td>' +
                '<td class="px-6 py-4 text-slate-600">' + fmtDateTime(p.allow_trade_start_time) + '</td>' +
                '<td class="px-6 py-4 text-slate-500">' + fmtDateTime(p.create_time) + '</td>' +
                '<td class="px-6 py-4 text-slate-500">' + fmtDateTime(p.update_time) + '</td>' +
                '<td class="px-6 py-4 text-right"><button type="button" class="text-blue-600 font-black hover:underline" data-action="edit-pair" data-name="' + p.product_name + '">编辑</button></td>' +
                '</tr>';
        }).join('');
    }

    function renderBaseCoinSelect(selected) {
        var select = document.getElementById('form-base-coin');
        if (!select) return;
        select.innerHTML = COIN_CONFIG.map(function (c) {
            var sel = selected && c.symbol === selected ? ' selected' : '';
            return '<option value="' + c.symbol + '"' + sel + '>' + c.symbol + ' · ' + c.name + '</option>';
        }).join('');
        if (selected) select.value = selected;
    }

    function renderTagPriceCalcTypeSelect(selected) {
        var select = document.getElementById('form-tp-calc-type');
        if (!select) return;
        select.innerHTML = TAG_PRICE_CALCULATE_TYPES.map(function (t) {
            return '<option value="' + t.value + '">' + t.value + ' · ' + t.label + '</option>';
        }).join('');
        if (selected != null) select.value = String(selected);
    }

    function updateAddIndexButton(rows) {
        var btn = document.getElementById('btn-add-index');
        if (!btn) return;
        var count = (rows || []).length;
        var atMax = count >= MAX_INDEX_SOURCES;
        btn.disabled = atMax;
        btn.classList.toggle('opacity-40', atMax);
        btn.classList.toggle('cursor-not-allowed', atMax);
        btn.title = atMax ? '最多添加 ' + MAX_INDEX_SOURCES + ' 个指数源' : '';
    }

    function emptyPair() {
        var base = defaultPair('NEWUSDC', 'NEW');
        base.product_name = '';
        base.create_time = '';
        base.update_time = '';
        base.allow_trade_start_time = '';
        base.sort = getPairs().length + 1;
        base.quote_sort = getPairs().length + 1;
        return base;
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function renderMarginRows(rows) {
        var tbody = document.getElementById('margin-tier-body');
        if (!tbody) return;
        tbody.innerHTML = (rows || []).map(function (row, idx) {
            return '<tr>' +
                '<td><input class="field-input" data-margin="min_quantity" data-idx="' + idx + '" value="' + row.min_quantity + '"></td>' +
                '<td><input class="field-input" data-margin="max_quantity" data-idx="' + idx + '" value="' + row.max_quantity + '" placeholder="0=无上限"></td>' +
                '<td><input class="field-input" data-margin="max_level" data-idx="' + idx + '" value="' + row.max_level + '"></td>' +
                '<td><input class="field-input" data-margin="maintenance_margin_rate" data-idx="' + idx + '" value="' + row.maintenance_margin_rate + '"></td>' +
                '<td class="text-right"><button type="button" class="text-red-500 font-bold" data-action="remove-margin" data-idx="' + idx + '">删除</button></td>' +
                '</tr>';
        }).join('');
    }

    function buildIndexSourceOptions(rows, idx) {
        var used = {};
        (rows || []).forEach(function (r, i) {
            if (i !== idx && r.source_name) used[r.source_name] = true;
        });
        var current = rows[idx] && rows[idx].source_name;
        return INDEX_SOURCE_OPTIONS.filter(function (s) {
            return !used[s] || s === current;
        }).map(function (s) {
            return '<option value="' + s + '"' + (current === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('');
    }

    function renderIndexRows(rows) {
        var tbody = document.getElementById('index-source-body');
        var weightHint = document.getElementById('index-weight-hint');
        if (!tbody) return;
        rows = rows || [];
        var total = rows.reduce(function (s, r) { return s + (Number(r.weight) || 0); }, 0);
        if (weightHint) {
            weightHint.textContent = '权重合计 ' + total + '%' + (total === 100 ? '' : '（须等于 100%）');
            weightHint.className = 'text-[10px] font-bold ' + (total === 100 ? 'text-green-600' : 'text-red-500');
        }
        tbody.innerHTML = rows.map(function (row, idx) {
            return '<tr>' +
                '<td><input class="field-input w-20" type="number" data-index="weight" data-idx="' + idx + '" value="' + row.weight + '"></td>' +
                '<td><select class="field-input" data-index="source_name" data-idx="' + idx + '">' + buildIndexSourceOptions(rows, idx) + '</select></td>' +
                '<td><input class="field-input" data-index="sub_base_coin_name" data-idx="' + idx + '" value="' + row.sub_base_coin_name + '"></td>' +
                '<td><input class="field-input" data-index="sub_value_coin_name" data-idx="' + idx + '" value="' + row.sub_value_coin_name + '"></td>' +
                '<td class="text-right"><button type="button" class="text-red-500 font-bold" data-action="remove-index" data-idx="' + idx + '">删除</button></td>' +
                '</tr>';
        }).join('');
        updateAddIndexButton(rows);
    }

    function renderTagCheckboxes(selected) {
        var wrap = document.getElementById('tag-checkbox-wrap');
        if (!wrap) return;
        wrap.innerHTML = TAG_OPTIONS.map(function (tag) {
            var checked = (selected || []).indexOf(tag) >= 0 ? ' checked' : '';
            return '<label class="inline-flex items-center gap-1 mr-3 mb-2 font-bold text-slate-600"><input type="checkbox" data-tag="' + tag + '"' + checked + '> ' + tag + '</label>';
        }).join('');
    }

    function setField(id, val) {
        var el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!val;
        else el.value = val == null ? '' : val;
    }

    function getField(id) {
        var el = document.getElementById(id);
        if (!el) return '';
        if (el.type === 'checkbox') return el.checked;
        return el.value;
    }

    function loadForm(pair) {
        document.getElementById('form-product-name').disabled = !!editingProduct;
        setField('form-product-name', pair.product_name);
        setField('form-icon-url', pair.icon_url);
        setField('form-swap-value', pair.swap_value);
        renderBaseCoinSelect(pair.base_coin_name);
        setField('form-coin-precision', pair.coin_precision);
        setField('form-quote-precision', pair.quote_precision);
        setField('form-price-precision', pair.price_precision);
        setField('form-front-hidden', pair.front_hidden);
        setField('form-status', pair.status);
        setField('form-quote-enable', pair.quote_enable);
        setField('form-quote-sort', pair.quote_sort);
        setField('form-allow-trade-start', pair.allow_trade_start_time);
        setField('form-sort', pair.sort);
        setField('form-depth-level', pair.depth_level);
        var lc = pair.limit_config || {};
        setField('form-lc-market-max-deeps', lc.market_max_deeps);
        setField('form-lc-price-unit', lc.price_unit);
        setField('form-lc-price-range', lc.price_range);
        setField('form-lc-circuit-rate', lc.circuit_rate);
        setField('form-lc-max-once', lc.max_once_limit_cost);
        setField('form-lc-min-once', lc.min_once_limit_cost);
        setField('form-lc-split-market', lc.split_market_cost);
        setField('form-lc-max-hold', lc.max_hold_amount);
        setField('form-lc-max-book', lc.max_book_num);

        var fc = pair.funding_rate_config || {};
        setField('form-fr-mm-admin', fc.is_mm_admin);
        setField('form-fr-precision', fc.funds_rate_precision);
        setField('form-fr-max', fc.funds_rate_max);
        setField('form-fr-min', fc.funds_rate_min);
        setField('form-fr-interests', fc.funds_rate_interests);
        setField('form-fr-interval', fc.funds_interval_hour);
        setField('form-fr-init-ts', fc.funds_init_ts);

        var ac = pair.account_config || {};
        setField('form-ac-risk-min', ac.risk_account_min);
        setField('form-ac-risk-threshold', ac.risk_threshold);
        setField('form-ac-coverage', ac.risk_reserve_coverage_limit);

        var ic = pair.index_config || { enable: true, source: [] };
        setField('form-ic-enable', ic.enable);
        renderIndexRows(ic.source || []);

        var tp = pair.tag_price_config || {};
        setField('form-tp-basis-cycle', tp.basis_move_cycle);
        renderTagPriceCalcTypeSelect(tp.tag_price_calculate_type);

        var fee = pair.fee_rate_config || {};
        setField('form-fee-enable', fee.enable);
        setField('form-fee-taker', fee.taker_fee);
        setField('form-fee-maker', fee.maker_fee);

        renderMarginRows(pair.maintenance_margin_rate || []);
        renderTagCheckboxes(pair.tags || []);

        document.getElementById('form-page-title').textContent = editingProduct ? '编辑交易对 · ' + editingProduct : '新增交易对';
        document.getElementById('form-market-badge').textContent = '计价市场 · ' + selectedMarket;
    }

    function readMarginFromDom() {
        var rows = [];
        document.querySelectorAll('#margin-tier-body tr').forEach(function (tr) {
            var idx = tr.querySelector('[data-margin]');
            if (!idx) return;
            var i = idx.getAttribute('data-idx');
            rows.push({
                min_quantity: tr.querySelector('[data-margin="min_quantity"]').value.trim(),
                max_quantity: tr.querySelector('[data-margin="max_quantity"]').value.trim(),
                max_level: Number(tr.querySelector('[data-margin="max_level"]').value),
                maintenance_margin_rate: tr.querySelector('[data-margin="maintenance_margin_rate"]').value.trim()
            });
        });
        return rows;
    }

    function readIndexFromDom() {
        var rows = [];
        document.querySelectorAll('#index-source-body tr').forEach(function (tr) {
            rows.push({
                weight: Number(tr.querySelector('[data-index="weight"]').value),
                source_name: tr.querySelector('[data-index="source_name"]').value,
                sub_base_coin_name: tr.querySelector('[data-index="sub_base_coin_name"]').value.trim(),
                sub_value_coin_name: tr.querySelector('[data-index="sub_value_coin_name"]').value.trim()
            });
        });
        return rows;
    }

    function readTagsFromDom() {
        var tags = [];
        document.querySelectorAll('#tag-checkbox-wrap input[data-tag]:checked').forEach(function (el) {
            tags.push(el.getAttribute('data-tag'));
        });
        return tags;
    }

    function collectForm() {
        var sources = readIndexFromDom();
        if (sources.length > MAX_INDEX_SOURCES) {
            alert('指数源最多 ' + MAX_INDEX_SOURCES + ' 个');
            return null;
        }
        var sourceNames = sources.map(function (r) { return r.source_name; });
        var dupSource = sourceNames.filter(function (s, i) { return sourceNames.indexOf(s) !== i; })[0];
        if (dupSource) {
            alert('指数源 source_name 不可重复：' + dupSource);
            return null;
        }
        var weightSum = sources.reduce(function (s, r) { return s + (Number(r.weight) || 0); }, 0);
        if (getField('form-ic-enable') && weightSum !== 100) {
            alert('指数源权重合计须为 100%，当前为 ' + weightSum + '%');
            return null;
        }
        var existingPair = editingProduct ? findPair(editingProduct) : null;
        var name = getField('form-product-name').trim().toUpperCase();
        if (!name) {
            alert('请填写产品名称');
            return null;
        }
        if (!editingProduct && findPair(name)) {
            alert('该产品名称已存在');
            return null;
        }
        return {
            product_name: name,
            icon_url: getField('form-icon-url').trim(),
            swap_value: getField('form-swap-value').trim(),
            base_coin_name: getField('form-base-coin').trim().toUpperCase(),
            coin_precision: Number(getField('form-coin-precision')),
            quote_precision: Number(getField('form-quote-precision')),
            price_precision: Number(getField('form-price-precision')),
            maintenance_margin_rate: readMarginFromDom(),
            front_hidden: getField('form-front-hidden'),
            status: getField('form-status'),
            quote_enable: getField('form-quote-enable'),
            quote_sort: Number(getField('form-quote-sort')),
            create_time: editingProduct && existingPair ? existingPair.create_time : new Date().toISOString().slice(0, 19).replace('T', ' '),
            update_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            allow_trade_start_time: getField('form-allow-trade-start'),
            sort: Number(getField('form-sort')),
            depth_level: Number(getField('form-depth-level')),
            tags: readTagsFromDom(),
            limit_config: {
                market_max_deeps: Number(getField('form-lc-market-max-deeps')),
                price_unit: Number(getField('form-lc-price-unit')),
                price_range: getField('form-lc-price-range').trim(),
                circuit_rate: getField('form-lc-circuit-rate').trim(),
                max_once_limit_cost: getField('form-lc-max-once').trim(),
                min_once_limit_cost: getField('form-lc-min-once').trim(),
                split_market_cost: getField('form-lc-split-market').trim(),
                max_hold_amount: getField('form-lc-max-hold').trim(),
                max_book_num: Number(getField('form-lc-max-book'))
            },
            funding_rate_config: {
                is_mm_admin: getField('form-fr-mm-admin'),
                funds_rate_precision: Number(getField('form-fr-precision')),
                funds_rate_max: getField('form-fr-max').trim(),
                funds_rate_min: getField('form-fr-min').trim(),
                funds_rate_interests: getField('form-fr-interests').trim(),
                funds_interval_hour: Number(getField('form-fr-interval')),
                funds_init_ts: Number(getField('form-fr-init-ts'))
            },
            account_config: {
                risk_account_min: getField('form-ac-risk-min').trim(),
                risk_threshold: getField('form-ac-risk-threshold').trim(),
                risk_reserve_coverage_limit: getField('form-ac-coverage').trim()
            },
            index_config: {
                enable: getField('form-ic-enable'),
                source: sources
            },
            tag_price_config: {
                basis_move_cycle: Number(getField('form-tp-basis-cycle')),
                tag_price_calculate_type: Number(getField('form-tp-calc-type'))
            },
            fee_rate_config: {
                enable: getField('form-fee-enable'),
                taker_fee: getField('form-fee-taker').trim(),
                maker_fee: getField('form-fee-maker').trim()
            }
        };
    }

    function openForm(isNew, productName) {
        editingProduct = isNew ? null : productName;
        var pair = isNew ? emptyPair() : clone(findPair(productName));
        if (!pair && !isNew) return;
        loadForm(pair);
        showView('view-form');
        location.hash = isNew ? '#new' : '#edit=' + encodeURIComponent(productName);
    }

    function saveForm() {
        var data = collectForm();
        if (!data) return;
        var list = getPairs();
        if (editingProduct) {
            var idx = list.findIndex(function (p) { return p.product_name === editingProduct; });
            if (idx >= 0) list[idx] = data;
        } else {
            list.push(data);
        }
        alert('保存成功（原型演示）');
        goList();
    }

    function goList() {
        location.hash = '#list';
        applyRoute();
    }

    function goMarket() {
        location.hash = '#market';
        applyRoute();
    }

    function confirmMarket() {
        var select = document.getElementById('market-coin-select');
        if (!select || select.value !== 'USDC') {
            alert('当前仅支持选择 USDC 作为市场计价货币');
            return;
        }
        selectedMarket = select.value;
        setStoredMarket(selectedMarket);
        goList();
    }

    function switchMarket() {
        if (confirm('切换市场将返回市场选择页，是否继续？')) {
            selectedMarket = '';
            try { sessionStorage.removeItem(STORAGE_MARKET_KEY); } catch (e) { /* noop */ }
            goMarket();
        }
    }

    function openTagModal() {
        var list = document.getElementById('tag-modal-list');
        if (!list) return;
        list.innerHTML = TAG_OPTIONS.map(function (t, i) {
            return '<div class="flex items-center gap-2 mb-2"><input class="field-input flex-1" data-tag-edit="' + i + '" value="' + t + '"><button type="button" class="text-red-500 font-bold text-[10px]" data-action="delete-tag" data-idx="' + i + '">删除</button></div>';
        }).join('');
        document.getElementById('tag-modal').classList.remove('hidden');
        tagModalOpen = true;
    }

    function closeTagModal() {
        document.getElementById('tag-modal').classList.add('hidden');
        tagModalOpen = false;
    }

    function saveTagsFromModal() {
        var inputs = document.querySelectorAll('[data-tag-edit]');
        var next = [];
        inputs.forEach(function (el) {
            var v = el.value.trim();
            if (v && next.indexOf(v) < 0) next.push(v);
        });
        if (!next.length) {
            alert('至少保留一个标签');
            return;
        }
        TAG_OPTIONS = next;
        closeTagModal();
        renderTagCheckboxes(readTagsFromDom());
    }

    function addTagInModal() {
        TAG_OPTIONS.push('new_tag');
        openTagModal();
    }

    function applyRoute() {
        var hash = (location.hash || '').replace('#', '');
        selectedMarket = getStoredMarket();

        if (hash === 'market' || !selectedMarket) {
            if (!selectedMarket || hash === 'market') {
                renderMarketView();
                showView('view-market');
                return;
            }
        }

        if (hash.indexOf('edit=') === 0) {
            selectedMarket = getStoredMarket();
            if (!selectedMarket) { goMarket(); return; }
            openForm(false, decodeURIComponent(hash.slice(5)));
            return;
        }

        if (hash === 'new') {
            selectedMarket = getStoredMarket();
            if (!selectedMarket) { goMarket(); return; }
            openForm(true);
            return;
        }

        selectedMarket = getStoredMarket();
        if (!selectedMarket) {
            renderMarketView();
            showView('view-market');
            return;
        }
        renderList();
        showView('view-list');
    }

    function bindEvents() {
        document.body.addEventListener('click', function (e) {
            var t = e.target.closest('[data-action]');
            if (!t) return;
            var action = t.getAttribute('data-action');
            if (action === 'confirm-market') confirmMarket();
            if (action === 'switch-market') switchMarket();
            if (action === 'add-pair') { location.hash = '#new'; applyRoute(); }
            if (action === 'back-list') goList();
            if (action === 'save-pair') saveForm();
            if (action === 'edit-pair') openForm(false, t.getAttribute('data-name'));
            if (action === 'add-margin') {
                var rows = readMarginFromDom();
                rows.push({ min_quantity: '0', max_quantity: '0', max_level: 10, maintenance_margin_rate: '0.01' });
                renderMarginRows(rows);
            }
            if (action === 'remove-margin') {
                var idx = Number(t.getAttribute('data-idx'));
                var mrows = readMarginFromDom();
                mrows.splice(idx, 1);
                renderMarginRows(mrows);
            }
            if (action === 'add-index') {
                var irows = readIndexFromDom();
                if (irows.length >= MAX_INDEX_SOURCES) {
                    alert('指数源最多 ' + MAX_INDEX_SOURCES + ' 个');
                    return;
                }
                var usedSources = {};
                irows.forEach(function (r) { usedSources[r.source_name] = true; });
                var nextSource = INDEX_SOURCE_OPTIONS.filter(function (s) { return !usedSources[s]; })[0];
                if (!nextSource) {
                    alert('已无可用指数源');
                    return;
                }
                irows.push({ weight: 0, source_name: nextSource, sub_base_coin_name: getField('form-base-coin') || 'BTC', sub_value_coin_name: 'USDT' });
                renderIndexRows(irows);
            }
            if (action === 'remove-index') {
                var iidx = Number(t.getAttribute('data-idx'));
                var ir = readIndexFromDom();
                ir.splice(iidx, 1);
                renderIndexRows(ir);
            }
            if (action === 'edit-tags') openTagModal();
            if (action === 'close-tag-modal') closeTagModal();
            if (action === 'save-tags') saveTagsFromModal();
            if (action === 'add-tag-row') addTagInModal();
            if (action === 'delete-tag') {
                var ti = Number(t.getAttribute('data-idx'));
                TAG_OPTIONS.splice(ti, 1);
                openTagModal();
            }
        });

        document.body.addEventListener('input', function (e) {
            if (e.target.matches('[data-index="weight"]')) {
                renderIndexRows(readIndexFromDom());
            }
        });

        document.body.addEventListener('change', function (e) {
            if (e.target.matches('[data-index="source_name"]')) {
                renderIndexRows(readIndexFromDom());
            }
        });
    }

    function init() {
        bindEvents();
        window.addEventListener('hashchange', applyRoute);
        applyRoute();
    }

    global.initContractPairsAdmin = init;
})(window);
