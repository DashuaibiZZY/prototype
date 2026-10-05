/**
 * App 持仓 · 多条止盈止损（列表 / 空态 / 表单子弹窗）
 * 供 合约交易.html、交易流水頁面.html 共用
 */
(function (global) {
    const ORDERS_DEMO = [
        {
            id: 'o1',
            tpTrigger: '300.00', tpTriggerType: 'latest', tpDelegate: 'market', tpLimitPrice: '',
            slTrigger: '80.00', slTriggerType: 'latest', slDelegate: 'market', slLimitPrice: '',
            qtyUsdt: 8.87, qtyLabel: '8.87 USDT', estTp: '+12.12', estSl: '-3.28',
        },
        {
            id: 'o2',
            tpTrigger: '250.00', tpTriggerType: 'latest', tpDelegate: 'market', tpLimitPrice: '',
            slTrigger: '', slTriggerType: 'latest', slDelegate: 'market', slLimitPrice: '',
            qtyUsdt: 8.87, qtyLabel: '8.87 USDT', estTp: '+8.62', estSl: '',
        },
    ];

    let orders = ORDERS_DEMO.map(function (o) { return Object.assign({}, o); });
    let editingId = null;
    let totalQtyUsdt = 1245.8;

    function cloneDemo() {
        return ORDERS_DEMO.map(function (o) { return Object.assign({}, o); });
    }

    function triggerTypeLabel(key) {
        return key === 'mark' ? '标记' : '最新';
    }

    function delegateLabel(delegate, limitPrice) {
        if (delegate === 'limit') return limitPrice || '限价';
        return '市价';
    }

    function getCellSummary() {
        if (!orders.length) {
            return { empty: true, text: '止盈止损：<span class="text-gray-400 font-mono">-- / --</span>' };
        }
        const tpVals = orders.map(function (o) { return parseFloat(o.tpTrigger); }).filter(Number.isFinite);
        const slVals = orders.map(function (o) { return parseFloat(o.slTrigger); }).filter(Number.isFinite);
        const tp = tpVals.length ? Math.min.apply(null, tpVals).toFixed(2) : '--';
        const sl = slVals.length ? Math.max.apply(null, slVals).toFixed(2) : '--';
        const countSuffix = orders.length > 1 ? ' <span class="text-gray-400 font-bold">(' + orders.length + ')</span>' : '';
        return {
            empty: false,
            tp: tp,
            sl: sl,
            count: orders.length,
            text: '止盈止损：<span class="text-green-600 font-mono">' + tp + '</span> / <span class="text-red-500 font-mono">' + sl + '</span>' + countSuffix,
        };
    }

    function renderOrderCard(order) {
        const tpLine = order.tpTrigger
            ? order.tpTrigger + ' <span class="text-gray-400 font-bold">(' + triggerTypeLabel(order.tpTriggerType) + ')</span>'
            : '<span class="text-gray-300">--</span>';
        const slLine = order.slTrigger
            ? order.slTrigger + ' <span class="text-gray-400 font-bold">(' + triggerTypeLabel(order.slTriggerType) + ')</span>'
            : '<span class="text-gray-300">--</span>';
        const estSl = order.estSl
            ? '<span class="text-red-500">' + order.estSl + '</span>'
            : '<span class="text-gray-400">--</span>';
        return (
            '<div class="app-pos-tpsl-order-card" data-order-id="' + order.id + '">' +
            '<div class="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">' +
            '<div><p class="text-gray-400 font-bold mb-0.5">止盈触发价</p><p class="font-mono font-bold text-gray-900">' + tpLine + '</p></div>' +
            '<div class="text-right"><p class="text-gray-400 font-bold mb-0.5">止盈委托价</p><p class="font-bold">' + delegateLabel(order.tpDelegate, order.tpLimitPrice) + '</p></div>' +
            '<div><p class="text-gray-400 font-bold mb-0.5">止损触发价</p><p class="font-mono font-bold text-gray-900">' + slLine + '</p></div>' +
            '<div class="text-right"><p class="text-gray-400 font-bold mb-0.5">止损委托价</p><p class="font-bold">' + (order.slTrigger ? delegateLabel(order.slDelegate, order.slLimitPrice) : '<span class="text-gray-300">--</span>') + '</p></div>' +
            '<div class="col-span-2 flex justify-between items-center pt-1 border-t border-gray-100">' +
            '<span class="text-gray-400 font-bold">数量</span><span class="font-mono font-bold">' + order.qtyLabel + '</span></div>' +
            '</div>' +
            '<p class="text-[9px] font-bold text-gray-500 mt-2">预估收益 (USDT) <span class="text-green-600">' + (order.estTp || '--') + '</span><span class="text-gray-300"> / </span>' + estSl + '</p>' +
            '<div class="flex justify-end gap-4 mt-2 text-[11px] font-black">' +
            '<button type="button" class="text-blue-600" onclick="AppPositionTpsl.openForm(\'edit\', \'' + order.id + '\')">修改</button>' +
            '<button type="button" class="text-red-500" onclick="AppPositionTpsl.cancelOrder(\'' + order.id + '\')">撤单</button>' +
            '</div></div>'
        );
    }

    function renderOrdersList() {
        const container = document.getElementById('app-pos-tpsl-orders-container');
        const countEl = document.getElementById('app-pos-tpsl-order-count');
        if (countEl) countEl.textContent = '(' + orders.length + ')';
        if (container) container.innerHTML = orders.map(renderOrderCard).join('');
    }

    function refreshInlineSummaries() {
        const summary = getCellSummary();
        ['pos-tpsl-inline-iso', 'pos-tpsl-inline-cross'].forEach(function (id, idx) {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'pos-tpsl-inline-cross') {
                el.innerHTML = '止盈止损：<span class="text-gray-400 font-mono">-- / --</span>';
                return;
            }
            el.innerHTML = summary.text;
        });
    }

    function refreshModalView() {
        renderOrdersList();
        const listEl = document.getElementById('app-pos-tpsl-list');
        const emptyEl = document.getElementById('app-pos-tpsl-empty');
        const hasOrders = orders.length > 0;
        if (listEl) listEl.classList.toggle('hidden', !hasOrders);
        if (emptyEl) emptyEl.classList.toggle('hidden', hasOrders);
        refreshInlineSummaries();
    }

    function getDelegateFromDom(leg) {
        const wrap = document.getElementById('app-pos-' + leg + '-limit-input');
        return wrap && !wrap.classList.contains('hidden') ? 'limit' : 'market';
    }

    function readTriggerTypeKey(leg) {
        const label = document.getElementById('app-pos-' + leg + '-trigger-label')?.textContent || '';
        return label.indexOf('标记') >= 0 ? 'mark' : 'latest';
    }

    function fillForm(order) {
        if (!order) {
            resetForm();
            return;
        }
        editingId = order.id;
        const tpIn = document.getElementById('app-pos-tpsl-tp-trigger');
        const slIn = document.getElementById('app-pos-tpsl-sl-trigger');
        const tpLim = document.getElementById('app-pos-tpsl-tp-limit');
        const slLim = document.getElementById('app-pos-tpsl-sl-limit');
        if (tpIn) tpIn.value = order.tpTrigger || '';
        if (slIn) slIn.value = order.slTrigger || '';
        if (tpLim) tpLim.value = order.tpLimitPrice || '';
        if (slLim) slLim.value = order.slLimitPrice || '';
        const tpLabel = document.getElementById('app-pos-tp-trigger-label');
        const slLabel = document.getElementById('app-pos-sl-trigger-label');
        if (tpLabel) tpLabel.textContent = order.tpTriggerType === 'mark' ? '标记价格' : '最新价格';
        if (slLabel) slLabel.textContent = order.slTriggerType === 'mark' ? '标记价格' : '最新价格';
        if (typeof switchPositionTPSLType === 'function') {
            switchPositionTPSLType('tp', order.tpDelegate === 'limit' ? 'limit' : 'market', 'app-pos-');
            switchPositionTPSLType('sl', order.slDelegate === 'limit' ? 'limit' : 'market', 'app-pos-');
        }
        const pct = Math.min(100, Math.max(0, Math.round((order.qtyUsdt / totalQtyUsdt) * 100)));
        syncQtyPct(pct);
    }

    function resetForm() {
        editingId = null;
        ['app-pos-tpsl-tp-trigger', 'app-pos-tpsl-sl-trigger', 'app-pos-tpsl-tp-limit', 'app-pos-tpsl-sl-limit'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const tpLabel = document.getElementById('app-pos-tp-trigger-label');
        const slLabel = document.getElementById('app-pos-sl-trigger-label');
        if (tpLabel) tpLabel.textContent = '最新价格';
        if (slLabel) slLabel.textContent = '最新价格';
        if (typeof switchPositionTPSLType === 'function') {
            switchPositionTPSLType('tp', 'market', 'app-pos-');
            switchPositionTPSLType('sl', 'market', 'app-pos-');
        }
        syncQtyPct(100);
    }

    function buildOrderFromForm(existing) {
        const tpTrigger = document.getElementById('app-pos-tpsl-tp-trigger')?.value?.trim() || '';
        const slTrigger = document.getElementById('app-pos-tpsl-sl-trigger')?.value?.trim() || '';
        const tpLimit = document.getElementById('app-pos-tpsl-tp-limit')?.value?.trim() || '';
        const slLimit = document.getElementById('app-pos-tpsl-sl-limit')?.value?.trim() || '';
        const qtyRaw = parseFloat(document.getElementById('app-pos-tpsl-qty-input')?.value);
        const qtyUsdt = Number.isFinite(qtyRaw) ? qtyRaw : totalQtyUsdt;
        return {
            id: existing?.id || ('o' + Date.now()),
            tpTrigger: tpTrigger,
            tpTriggerType: readTriggerTypeKey('tp'),
            tpDelegate: getDelegateFromDom('tp'),
            tpLimitPrice: tpLimit,
            slTrigger: slTrigger,
            slTriggerType: readTriggerTypeKey('sl'),
            slDelegate: getDelegateFromDom('sl'),
            slLimitPrice: slLimit,
            qtyUsdt: qtyUsdt,
            qtyLabel: qtyUsdt.toFixed(2) + ' USDT',
            estTp: existing?.estTp || (tpTrigger ? '+0.00' : ''),
            estSl: existing?.estSl || (slTrigger ? '-0.00' : ''),
        };
    }

    function persistFromForm() {
        const existing = editingId ? orders.find(function (o) { return o.id === editingId; }) : null;
        const next = buildOrderFromForm(existing);
        if (editingId) {
            orders = orders.map(function (o) { return o.id === editingId ? next : o; });
        } else {
            orders = orders.concat([next]);
        }
        editingId = null;
        refreshModalView();
    }

    function syncQtyPct(pct) {
        const slider = document.getElementById('app-pos-tpsl-qty-slider');
        const input = document.getElementById('app-pos-tpsl-qty-input');
        if (slider) slider.value = pct;
        if (input) input.value = (totalQtyUsdt * pct / 100).toFixed(2);
    }

    global.AppPositionTpsl = {
        get orders() { return orders; },
        setTotalQtyUsdt: function (val) { totalQtyUsdt = val; },
        getCellSummary: getCellSummary,
        refreshModalView: refreshModalView,
        refreshInlineSummaries: refreshInlineSummaries,
        openForm: function (mode, orderId) {
            const main = document.getElementById('app-pos-tpsl-main-view');
            const form = document.getElementById('app-pos-tpsl-form-view');
            const title = document.getElementById('app-pos-tpsl-form-title');
            if (main) main.classList.add('hidden');
            if (form) form.classList.remove('hidden');
            if (title) title.textContent = mode === 'edit' ? '修改止盈止损' : '添加止盈止损';
            if (mode === 'edit' && orderId) {
                fillForm(orders.find(function (o) { return o.id === orderId; }));
            } else {
                resetForm();
            }
        },
        closeForm: function () {
            const main = document.getElementById('app-pos-tpsl-main-view');
            const form = document.getElementById('app-pos-tpsl-form-view');
            if (main) main.classList.remove('hidden');
            if (form) form.classList.add('hidden');
            editingId = null;
        },
        cancelOrder: function (orderId) {
            orders = orders.filter(function (o) { return o.id !== orderId; });
            refreshModalView();
            if (typeof showProtoToast === 'function') showProtoToast('已撤销该止盈止损委托');
        },
        cancelAll: function () {
            orders = [];
            refreshModalView();
            if (typeof showProtoToast === 'function') showProtoToast('已撤销全部止盈止损委托');
        },
        setDemoState: function (state) {
            orders = state === 'empty' ? [] : cloneDemo();
            AppPositionTpsl.closeForm();
            refreshModalView();
        },
        persistFromForm: persistFromForm,
        syncQtyPct: syncQtyPct,
        resetOrdersDemo: function () { orders = cloneDemo(); refreshModalView(); },
    };
})(typeof window !== 'undefined' ? window : globalThis);
