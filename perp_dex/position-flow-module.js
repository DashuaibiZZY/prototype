/**
 * 合约交易页 · 持仓管理+流水模块：演示数据与筛选交互
 * @version 2026-09-03-details-modify-fav
 */
(function () {
    window.POSITION_FLOW_MODULE_VERSION = '2026-09-03-details-modify-fav';
    const PF_CONTRACT_OPTIONS = [
        'BTCUSDC', 'BNBUSDC', 'ETHUSDC', 'SOLUSDC', 'PEPEUSDC',
        'BTCUSDT', 'BNBUSDT', 'ETHUSDT', 'SOLUSDT',
    ];

    function buildContractFilterOptionsHtml(filterId) {
        return PF_CONTRACT_OPTIONS.map(function (symbol) {
            const esc = symbol.replace(/'/g, "\\'");
            return '<button type="button" class="pf-contract-filter-item w-full text-left px-3 py-1.5 hover:bg-gray-50 font-mono" data-symbol="' + symbol + '" onclick="PositionFlow.selectContractFilter(\'' + filterId + '\', \'' + esc + '\')">' + symbol + '</button>';
        }).join('');
    }

    function buildContractFilterHtml(filterId) {
        return '<div class="relative pf-contract-filter-root" id="' + filterId + '" data-value="">' +
            '<button type="button" class="pf-contract-filter-trigger border border-gray-200 rounded-sm px-2 py-1 bg-white text-[10px] font-bold flex items-center gap-1 min-w-[76px] hover:border-gray-400" onclick="PositionFlow.toggleContractFilter(\'' + filterId + '\')">' +
            '<span class="pf-contract-filter-label text-gray-500">合约</span>' +
            '<svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>' +
            '</button>' +
            '<div class="pf-contract-filter-panel absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm hidden z-[250] w-[148px]">' +
            '<div class="p-2 border-b border-gray-100">' +
            '<input type="text" class="pf-contract-filter-search w-full border border-gray-200 rounded-sm px-2 py-1 text-[10px] outline-none focus:border-black" placeholder="搜索合约" oninput="PositionFlow.filterContractOptions(\'' + filterId + '\', this.value)" onclick="event.stopPropagation()">' +
            '</div>' +
            '<div class="pf-contract-filter-list max-h-[180px] overflow-y-auto py-1 text-[10px]">' +
            '<button type="button" class="pf-contract-filter-item w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-500" data-symbol="" onclick="PositionFlow.selectContractFilter(\'' + filterId + '\', \'\')">全部</button>' +
            buildContractFilterOptionsHtml(filterId) +
            '</div></div></div>';
    }

    const DEMO_END = new Date('2026-06-15T12:00:00');
    const FILL_PAGE_SIZE = 10;
    const RELATED_ORDERS_PAGE_SIZE = 10;
    let fillDetailState = { orderId: null, page: 1 };
    let relatedOrdersState = { posId: null, page: 1 };

    const SYMBOL_BNBUSDC_ISOLATED = 'BNBUSDC <span class="text-gray-500 font-bold">逐仓</span> <span class="text-green-500 bg-green-50 px-1 rounded-[1px] text-[10px]">20x</span>';
    const SYMBOL_BTCUSDC_ISOLATED = 'BTCUSDC <span class="text-gray-500 font-bold">逐仓</span> <span class="text-green-500 bg-green-50 px-1 rounded-[1px] text-[10px]">20x</span>';
    const BTN_BASE = 'inline-flex items-center gap-0.5 border border-gray-200 px-2 py-0.5 rounded-sm text-[10px] font-bold hover:bg-gray-50 transition-colors';
    const CANCEL_ALL_TH = '<th class="px-4 py-2 cursor-pointer" onclick="openCancelAllConfirm(\'base\')"><span class="flex items-center space-x-1 text-red-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>全部撤单</span></th>';

    const CURRENT_ORDER_BASE = [
        {
            time: '2024-05-24 14:20:15', symbol: SYMBOL_BNBUSDC_ISOLATED,
            dir: '买入开多', dirClass: 'text-green-500',
            price: '620.00', qty: '1.00', avg: '--', filled: '0.00',
            tpslTp: '800.123', tpslSl: '600.234',
            status: '未成交', statusClass: 'text-blue-600', orderId: 'OR_882910',
            titleSymbol: 'BNBUSDC', titleDir: '买入开多 全仓 3x', titleDirClass: 'text-green-500',
            modifyLastPrice: '606.31',
        },
        {
            time: '2024-05-24 15:32:08', symbol: SYMBOL_BNBUSDC_ISOLATED,
            dir: '卖出平多', dirClass: 'text-red-500',
            price: '625.50', qty: '0.80', avg: '624.20', filled: '0.35',
            tpslTp: null, tpslSl: null,
            status: '部分成交', statusClass: 'text-gray-600', orderId: 'OR_882911',
            titleSymbol: 'BNBUSDC', titleDir: '卖出平多 逐仓 20x', titleDirClass: 'text-red-500',
            modifyLastPrice: '606.31',
        },
    ];

    const HIST_ORDER_BASE = [
        { time: '2026-06-15 14:20:15', symbol: SYMBOL_BNBUSDC_ISOLATED, dir: '买入开多', dirClass: 'text-green-500', price: '620.00', qty: '1.00', avg: '618.50', filled: '1.00', fee: '0.619 USDC', pnl: '+124.52 USDC', pnlClass: 'text-green-500', status: '全部成交', statusClass: 'text-gray-900', orderId: 'OR_1041927385473' },
        { time: '2026-06-15 11:05:42', symbol: SYMBOL_BTCUSDC_ISOLATED, dir: '卖出平多', dirClass: 'text-red-500', price: '65,500.0', qty: '0.50', avg: '65,420.0', filled: '0.35', fee: '1.145 USDC', pnl: '+184.32 USDC', pnlClass: 'text-green-500', status: '部分成交', statusClass: 'text-gray-600', orderId: 'OR_1041927385120' },
        { time: '2026-06-14 22:18:03', symbol: SYMBOL_BNBUSDC_ISOLATED, dir: '买入平空', dirClass: 'text-green-500', price: '2,380.0', qty: '2.00', avg: '--', filled: '0.00', fee: '--', pnl: '--', pnlClass: 'text-gray-400', status: '已取消', statusClass: 'text-gray-400', statusTip: '用户手动取消', orderId: 'OR_1041927384001' },
        { time: '2026-06-14 09:12:55', symbol: SYMBOL_BNBUSDC_ISOLATED, dir: '卖出平多', dirClass: 'text-red-500', price: '635.00', qty: '0.80', avg: '--', filled: '0.00', fee: '--', pnl: '--', pnlClass: 'text-gray-400', status: '已取消', statusClass: 'text-gray-400', statusTip: '订单过期', orderId: 'OR_1041927383888' },
        { time: '2026-06-13 20:33:28', symbol: SYMBOL_BTCUSDC_ISOLATED, dir: '买入开多', dirClass: 'text-green-500', price: '64,900.0', qty: '0.20', avg: '64,980.0', filled: '0.12', fee: '0.390 USDC', pnl: '-8.15 USDC', pnlClass: 'text-red-500', status: '部分成交', statusClass: 'text-gray-600', orderId: 'OR_1041927383777' },
    ];

    function buildFillRows(count, basePrice, baseQty) {
        const rows = [];
        for (let i = 0; i < count; i++) {
            const price = (basePrice + i * 0.5).toFixed(2);
            const qty = (baseQty / count).toFixed(3);
            const amount = (Number(price) * Number(qty)).toFixed(2);
            rows.push({
                time: '2026-06-15 14:20:' + String(10 + i).padStart(2, '0'),
                qty: qty + ' BNB',
                price: price,
                amount: amount + ' USDC',
                role: i % 2 === 0 ? '吃单方' : '挂单方',
                fee: (Number(amount) * 0.001).toFixed(3) + ' USDC',
            });
        }
        return rows;
    }

    const ORDER_FILL_DETAILS = {
        OR_1041927385473: {
            titleSymbol: 'BNBUSDC', titleDir: '买入开多 逐仓 20x', titleDirClass: 'text-green-500',
            fills: buildFillRows(12, 618.0, 1.0),
        },
        OR_1041927385120: {
            titleSymbol: 'BTCUSDC', titleDir: '卖出平多 逐仓 20x', titleDirClass: 'text-red-500',
            fills: [
                { time: '2026-06-15 11:05:43', qty: '0.20 BTC', price: '65,420.0', amount: '13,084.00 USDC', role: '挂单方', fee: '6.542 USDC' },
                { time: '2026-06-15 11:05:44', qty: '0.15 BTC', price: '65,418.0', amount: '9,812.70 USDC', role: '吃单方', fee: '4.906 USDC' },
            ],
        },
        OR_1041927384001: { titleSymbol: 'BNBUSDC', titleDir: '买入平空 逐仓 20x', titleDirClass: 'text-green-500', fills: [] },
        OR_1041927383888: { titleSymbol: 'BNBUSDC', titleDir: '卖出平多 逐仓 20x', titleDirClass: 'text-red-500', fills: [] },
        OR_1041927383777: {
            titleSymbol: 'BTCUSDC', titleDir: '买入开多 逐仓 20x', titleDirClass: 'text-green-500',
            fills: [
                { time: '2026-06-13 20:33:29', qty: '0.12 BTC', price: '64,980.0', amount: '7,797.60 USDC', role: '挂单方', fee: '3.899 USDC' },
            ],
        },
    };

    const HIST_ORDER_TPSL = [
        {
            time: '2026-06-15 13:55:00', symbol: 'BNBUSDT', dir: '卖出平多', dirClass: 'text-red-500', qty: '0.80 BNB',
            triggerLines: ['800.23<span class="text-gray-400 font-normal">(最新)</span>', '600.48<span class="text-gray-400 font-normal">(最新)</span>'],
            priceLines: ['<span class="text-green-600 font-bold">止盈</span> 市价', '<span class="text-red-500 font-bold">止损</span> 598.23'],
            status: '已完成', statusClass: 'text-green-600', orderId: 'TPSL_1041927385473',
        },
        {
            time: '2026-06-15 10:20:15', symbol: 'BTCUSDT', dir: '买入平空', dirClass: 'text-green-500', qty: '0.35 BTC',
            triggerLines: ['64,200.0<span class="text-gray-400 font-normal">(最新)</span>'],
            priceLines: ['<span class="text-red-500 font-bold">止损</span> 市价'],
            status: '已完成', statusClass: 'text-green-600', orderId: 'TPSL_1041927385120',
        },
        {
            time: '2026-06-14 18:45:33', symbol: 'ETHUSDT', dir: '卖出平多', dirClass: 'text-red-500', qty: '2.00 ETH',
            triggerLines: ['2,520.0<span class="text-gray-400 font-normal">(最新)</span>'],
            priceLines: ['<span class="text-green-600 font-bold">止盈</span> 2,520.0'],
            status: '已取消', statusClass: 'text-gray-400', orderId: 'TPSL_1041927384001', statusTip: '用户手动取消',
        },
        {
            time: '2026-06-14 08:10:19', symbol: 'SOLUSDT', dir: '买入平空', dirClass: 'text-green-500', qty: '80 SOL',
            triggerLines: ['138.5<span class="text-gray-400 font-normal">(标记)</span>'],
            priceLines: ['<span class="text-red-500 font-bold">止损</span> 138.5'],
            status: '已取消', statusClass: 'text-gray-400', orderId: 'TPSL_1041927383888',
            statusTip: '仓位止盈订单触发，关联持仓已完全平仓',
        },
        {
            time: '2026-06-13 23:58:44', symbol: 'BNBUSDT', dir: '卖出平多', dirClass: 'text-red-500', qty: '0.50 BNB',
            triggerLines: ['610.00<span class="text-gray-400 font-normal">(最新)</span>'],
            priceLines: ['<span class="text-green-600 font-bold">止盈</span> 市价'],
            status: '已完成', statusClass: 'text-green-600', orderId: 'TPSL_1041927383777',
        },
    ];

    const CURRENT_ORDER_TPSL = [
        {
            time: '2024-05-24 14:20:15',
            symbol: 'BNBUSDC <span class="text-gray-500 font-bold">逐仓</span> <span class="text-green-500 bg-green-50 px-1 rounded-[1px] text-[10px]">20x</span>',
            dir: '卖出平多', dirClass: 'text-red-500', qty: '0.142 BNB',
            triggerLines: ['800.23<span class="text-gray-400 font-normal">(最新)</span>', '600.48<span class="text-gray-400 font-normal">(最新)</span>'],
            priceLines: ['<span class="text-green-600 font-bold">止盈</span> 市价', '<span class="text-red-500 font-bold">止损</span> 598.23'],
            status: '未触发', statusClass: 'text-blue-600', orderId: 'TPSL_882910',
        },
        {
            time: '2024-05-24 15:02:08',
            symbol: 'BNBUSDC <span class="text-gray-500 font-bold">逐仓</span> <span class="text-green-500 bg-green-50 px-1 rounded-[1px] text-[10px]">20x</span>',
            dir: '卖出平多', dirClass: 'text-red-500', qty: '0.050 BNB',
            triggerLines: ['620.00<span class="text-gray-400 font-normal">(标记)</span>'],
            priceLines: ['<span class="text-green-600 font-bold">止盈</span> 625.00'],
            status: '未触发', statusClass: 'text-blue-600', orderId: 'TPSL_882911',
        },
    ];

    const HIST_TRADES = [
        { time: '2026-06-15 14:20:16', qty: '1.00 BNB', price: '618.50', amount: '618.50 USDC', role: '吃单方', fee: '0.619 USDC', flowId: 'TR_104192738547301' },
        { time: '2026-06-15 11:05:43', qty: '0.35 BTC', price: '65,420.0', amount: '22,897.00 USDC', role: '挂单方', fee: '1.145 USDC', flowId: 'TR_104192738512001' },
        { time: '2026-06-14 16:40:12', qty: '120 SOL', price: '142.80', amount: '17,136.00 USDC', role: '吃单方', fee: '0.856 USDC', flowId: 'TR_104192738400102' },
        { time: '2026-06-14 09:30:05', qty: '2.00 ETH', price: '2,410.5', amount: '4,821.00 USDC', role: '吃单方', fee: '0.241 USDC', flowId: 'TR_104192738388801' },
        { time: '2026-06-13 20:33:29', qty: '0.12 BTC', price: '64,980.0', amount: '7,797.60 USDC', role: '挂单方', fee: '0.390 USDC', flowId: 'TR_104192738377701' },
    ];

    const HIST_POSITIONS = [
        {
            id: 'hp1', symbol: 'ETHUSDT', positionType: '全仓 (20x)', subtitle: 'ETHUSDT 全仓 20x',
            openAvg: '2,400.0', closeAvg: '2,450.0', maxQty: '10.0 ETH', closedQty: '10.0 ETH',
            pnlKey: 'hist', status: '全部平仓', openTime: '2026-06-10 10:00:00', closeTime: '2026-06-11 11:47:17',
        },
        {
            id: 'hp2', symbol: 'BNBUSDT', positionType: '逐仓 (15x)', subtitle: 'BNBUSDT 逐仓 15x',
            openAvg: '592.15', closeAvg: '604.22', maxQty: '1.02 BNB', closedQty: '0.68 BNB',
            pnlKey: 'histBn', status: '部分平仓', openTime: '2026-06-11 18:59:05', closeTime: '2026-06-12 09:15:40',
        },
        {
            id: 'hp3', symbol: 'BTCUSDT', positionType: '逐仓 (10x)', subtitle: 'BTCUSDT 逐仓 10x',
            openAvg: '65,100.5', closeAvg: '65,800.0', maxQty: '0.50 BTC', closedQty: '0.50 BTC',
            pnlKey: 'histBtc', status: '全部平仓', openTime: '2026-06-08 08:30:00', closeTime: '2026-06-09 16:20:11',
        },
        {
            id: 'hp4', symbol: 'SOLUSDT', positionType: '全仓 (25x)', subtitle: 'SOLUSDT 全仓 25x',
            openAvg: '148.20', closeAvg: '145.60', maxQty: '200 SOL', closedQty: '120 SOL',
            pnlKey: 'histSol', status: '部分平仓', openTime: '2026-06-12 14:05:22', closeTime: '2026-06-13 11:40:33',
        },
    ];

    function buildRelatedOrderRows(count, base) {
        const rows = [];
        for (let i = 0; i < count; i++) {
            rows.push({
                dir: base.dir,
                dirClass: base.dirClass,
                qty: base.qty,
                price: base.price,
                pnl: base.pnl,
                pnlClass: base.pnlClass,
                fee: base.fee,
                orderId: base.orderIdPrefix + String(i + 1).padStart(2, '0'),
                time: '2026-06-12 09:' + String(10 + i).padStart(2, '0') + ':40',
            });
        }
        return rows;
    }

    const POSITION_RELATED_ORDERS = {
        hp1: {
            subtitle: 'ETHUSDT 全仓 20x',
            orders: [
                { dir: '买入开多', dirClass: 'text-green-500', qty: '10.0 ETH', price: '2,400.0', pnl: '--', pnlClass: 'text-gray-400', fee: '2.400 USDC', orderId: 'OR_1041927389001', time: '2026-06-10 10:00:00' },
                { dir: '卖出平多', dirClass: 'text-red-500', qty: '6.0 ETH', price: '2,448.0', pnl: '+288.00 USDC', pnlClass: 'text-green-500', fee: '1.468 USDC', orderId: 'OR_1041927389002', time: '2026-06-11 11:47:17' },
                { dir: '卖出平多', dirClass: 'text-red-500', qty: '4.0 ETH', price: '2,453.0', pnl: '+212.00 USDC', pnlClass: 'text-green-500', fee: '0.981 USDC', orderId: 'OR_1041927389003', time: '2026-06-11 10:22:05' },
            ],
        },
        hp2: {
            subtitle: 'BNBUSDT 逐仓 15x',
            orders: buildRelatedOrderRows(12, {
                dir: '卖出平多', dirClass: 'text-red-500', qty: '0.05 BNB', price: '605.10',
                pnl: '+0.65 USDC', pnlClass: 'text-green-500', fee: '0.015 USDC', orderIdPrefix: 'OR_10419273891',
            }),
        },
        hp3: {
            subtitle: 'BTCUSDT 逐仓 10x',
            orders: [
                { dir: '买入开多', dirClass: 'text-green-500', qty: '0.50 BTC', price: '65,100.5', pnl: '--', pnlClass: 'text-gray-400', fee: '16.275 USDC', orderId: 'OR_1041927389201', time: '2026-06-08 08:30:00' },
                { dir: '卖出平多', dirClass: 'text-red-500', qty: '0.50 BTC', price: '65,800.0', pnl: '+349.75 USDC', pnlClass: 'text-green-500', fee: '16.450 USDC', orderId: 'OR_1041927389202', time: '2026-06-09 16:20:11' },
            ],
        },
        hp4: {
            subtitle: 'SOLUSDT 全仓 25x',
            orders: [
                { dir: '卖出开空', dirClass: 'text-red-500', qty: '200 SOL', price: '148.20', pnl: '--', pnlClass: 'text-gray-400', fee: '2.964 USDC', orderId: 'OR_1041927389301', time: '2026-06-12 14:05:22' },
                { dir: '买入平空', dirClass: 'text-green-500', qty: '80 SOL', price: '146.10', pnl: '-96.00 USDC', pnlClass: 'text-red-500', fee: '1.169 USDC', orderId: 'OR_1041927389302', time: '2026-06-13 11:40:33' },
                { dir: '买入平空', dirClass: 'text-green-500', qty: '40 SOL', price: '145.20', pnl: '-40.00 USDC', pnlClass: 'text-red-500', fee: '0.581 USDC', orderId: 'OR_1041927389303', time: '2026-06-12 20:18:44' },
            ],
        },
    };

    const ASSET_LOGS = [
        { time: '2026-06-15 08:00:00', type: '資金費用', amount: '-0.45202481 USDC', amountClass: 'text-red-500', coin: 'USDC', symbol: 'BNBUSDT' },
        { time: '2026-06-14 18:22:15', type: '已實現盈虧', amount: '+124.52 USDC', amountClass: 'text-green-500', coin: 'USDC', symbol: 'BTCUSDT' },
        { time: '2026-06-14 10:05:33', type: '手續費', amount: '-1.24500000 USDC', amountClass: 'text-red-500', coin: 'USDC', symbol: 'BNBUSDT' },
        { time: '2026-06-13 16:40:08', type: '轉帳', amount: '+500.00 USDC', amountClass: 'text-green-500', coin: 'USDC', symbol: '--' },
        { time: '2026-06-13 09:12:44', type: '爆倉清算', amount: '-88.40 USDC', amountClass: 'text-red-500', coin: 'USDC', symbol: 'SOLUSDT' },
        { time: '2026-06-12 21:30:19', type: '邀請返佣', amount: '+12.80 USDC', amountClass: 'text-green-500', coin: 'USDC', symbol: '--' },
        { time: '2026-06-12 15:00:00', type: '體驗金入帳', amount: '+200.00 USDC', amountClass: 'text-green-500', coin: 'USDC', symbol: '--' },
        { time: '2026-06-11 23:59:59', type: '體驗金回收', amount: '-50.00 USDC', amountClass: 'text-red-500', coin: 'USDC', symbol: '--' },
    ];

    const FUNDING_FEES = [
        { time: '2026-06-15 08:00:00', symbol: 'BNBUSDT', dir: '多頭支付空頭', fee: '-0.45202481 USDC', feeClass: 'text-red-500' },
        { time: '2026-06-14 08:00:00', symbol: 'BTCUSDT', dir: '空頭支付多頭', fee: '+0.12840000 USDC', feeClass: 'text-green-500' },
        { time: '2026-06-13 08:00:00', symbol: 'ETHUSDT', dir: '多頭支付空頭', fee: '-0.08620000 USDC', feeClass: 'text-red-500' },
        { time: '2026-06-12 08:00:00', symbol: 'SOLUSDT', dir: '多頭支付空頭', fee: '-0.03150000 USDC', feeClass: 'text-red-500' },
    ];

    const PNL_BREAKDOWN_EXTRA = {
        histBn: { total: -12.45, closePnl: -8.20, funding: 1.05, fee: -5.30 },
        histBtc: { total: 349.75, closePnl: 355.00, funding: -2.10, fee: -3.15 },
        histSol: { total: -136.00, closePnl: -128.00, funding: -4.50, fee: -7.50 },
    };

    function formatDemoDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function statusCellHtml(row) {
        const tip = row.statusTip ? ` title="${row.statusTip}"` : '';
        return `<span class="font-bold ${row.statusClass}"${tip}>${row.status}</span>`;
    }

    function renderTpslStackCell(lines) {
        if (!lines || !lines.length) return '--';
        return lines.map(function (line) {
            return `<div class="leading-5 whitespace-nowrap font-mono text-[11px]">${line}</div>`;
        }).join('');
    }

    function renderOrderIdCopyCell(orderId) {
        const esc = String(orderId).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return '<span class="inline-flex items-center gap-1 font-mono text-[10px] text-gray-600">' + orderId +
            '<button type="button" class="text-gray-400 hover:text-blue-600 p-0.5 leading-none" onclick="PositionFlow.copyOrderId(\'' + esc + '\')" title="复制订单编号">📋</button></span>';
    }

    function renderTpslOrderRow(row, opts) {
        opts = opts || {};
        const btnBase = 'inline-flex items-center gap-0.5 border border-gray-200 px-2 py-0.5 rounded-sm text-[10px] font-bold hover:bg-gray-50 transition-colors';
        const actions = opts.withActions ? (
            '<td class="px-4 py-3 whitespace-nowrap">' +
            '<div class="flex items-center gap-2">' +
            '<button type="button" class="' + btnBase + ' text-blue-600" onclick="openPositionTpslEdit()">修改</button>' +
            '<button type="button" class="' + btnBase + ' text-red-500" onclick="openCancelConfirm(\'' + row.orderId.replace(/'/g, "\\'") + '\')">' +
            '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>撤销</button>' +
            '</div></td>'
        ) : '';
        return '<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[11px]">' +
            '<td class="px-4 py-3 font-black text-gray-900 whitespace-nowrap">' + row.symbol + '</td>' +
            '<td class="px-4 py-3 text-gray-400 whitespace-nowrap">' + row.time + '</td>' +
            '<td class="px-4 py-3 font-bold uppercase tracking-tighter text-[12px] whitespace-nowrap ' + row.dirClass + '">' + row.dir + '</td>' +
            '<td class="px-4 py-3 font-mono font-bold whitespace-nowrap">' + row.qty + '</td>' +
            '<td class="px-4 py-3 align-top">' + renderTpslStackCell(row.triggerLines) + '</td>' +
            '<td class="px-4 py-3 align-top">' + renderTpslStackCell(row.priceLines) + '</td>' +
            '<td class="px-4 py-3 whitespace-nowrap">' + statusCellHtml(row) + '</td>' +
            '<td class="px-4 py-3 whitespace-nowrap">' + renderOrderIdCopyCell(row.orderId) + '</td>' +
            actions +
            '</tr>';
    }

    function renderOrderSummaryTitleHtml(symbol, dir, dirClass) {
        return '<span class="font-black text-gray-900">' + symbol + '</span> <span class="font-bold ' + dirClass + '">' + dir + '</span>';
    }

    const TPSL_SETUP_BTN = '<button type="button" onclick="toggleModal(\'modal-order-tpsl\')" class="text-blue-500 hover:text-blue-700 inline-flex items-center shrink-0 text-[10px] font-bold whitespace-nowrap">' +
        '<svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>设置</button>';

    function renderBaseOrderTpslCell(row, opts) {
        opts = opts || {};
        const hasTpsl = row.tpslTp || row.tpslSl;
        let pricesHtml = '';
        if (hasTpsl) {
            pricesHtml = '<div class="leading-5">';
            if (row.tpslTp) {
                pricesHtml += '<div class="font-mono text-[10px] text-green-600 font-bold whitespace-nowrap">' + row.tpslTp + '</div>';
            }
            if (row.tpslSl) {
                pricesHtml += '<div class="font-mono text-[10px] text-red-500 font-bold whitespace-nowrap">' + row.tpslSl + '</div>';
            }
            pricesHtml += '</div>';
        } else {
            pricesHtml = '<span class="text-gray-400">--</span>';
        }
        if (!opts.withSetup) return pricesHtml;
        return '<div class="flex items-start gap-2">' + pricesHtml + TPSL_SETUP_BTN + '</div>';
    }

    function renderBaseOrderActionCell(orderId) {
        const esc = String(orderId).replace(/'/g, "\\'");
        return '<td class="px-4 py-3 whitespace-nowrap"><div class="flex items-center gap-2">' +
            '<button type="button" class="' + BTN_BASE + ' text-blue-600" onclick="openModifyBaseOrder(\'' + esc + '\')">修改</button>' +
            '<button type="button" class="' + BTN_BASE + ' text-red-500" onclick="openCancelConfirm(\'' + esc + '\')">' +
            '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>撤单</button>' +
            '</div></td>';
    }

    function renderBaseOrderCoreCells(row, opts) {
        opts = opts || {};
        return '<td class="px-4 py-3 font-black text-gray-900 whitespace-nowrap">' + row.symbol + '</td>' +
            '<td class="px-4 py-3 text-gray-400 whitespace-nowrap">' + row.time + '</td>' +
            '<td class="px-4 py-3 font-bold uppercase tracking-tighter text-[12px] whitespace-nowrap ' + row.dirClass + '">' + row.dir + '</td>' +
            '<td class="px-4 py-3 font-mono font-bold whitespace-nowrap">' + row.price + '</td>' +
            '<td class="px-4 py-3 font-mono font-bold whitespace-nowrap">' + row.qty + '</td>' +
            '<td class="px-4 py-3 font-mono whitespace-nowrap">' + row.avg + '</td>' +
            '<td class="px-4 py-3 font-mono whitespace-nowrap">' + row.filled + '</td>' +
            (opts.includeFeePnl ? '<td class="px-4 py-3 font-mono whitespace-nowrap">' + (row.fee || '--') + '</td>' +
            '<td class="px-4 py-3 font-mono font-bold whitespace-nowrap ' + (row.pnlClass || 'text-gray-400') + '">' + (row.pnl || '--') + '</td>' : '') +
            (opts.includeTpsl ? '<td class="px-4 py-3 align-top whitespace-nowrap">' + renderBaseOrderTpslCell(row, { withSetup: opts.withTpslSetup }) + '</td>' : '') +
            '<td class="px-4 py-3 whitespace-nowrap">' + statusCellHtml(row) + '</td>' +
            '<td class="px-4 py-3 whitespace-nowrap">' + renderOrderIdCopyCell(row.orderId) + '</td>';
    }

    function renderCurrentOrderBaseRows() {
        return CURRENT_ORDER_BASE.map(function (r) {
            return '<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[11px]">' +
                renderBaseOrderCoreCells(r, { includeTpsl: true, withTpslSetup: true }) + renderBaseOrderActionCell(r.orderId) +
                '</tr>';
        }).join('');
    }

    function renderHistOrderBaseRows() {
        return HIST_ORDER_BASE.map(function (r) {
            const esc = String(r.orderId).replace(/'/g, "\\'");
            return '<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors text-[11px]">' +
                renderBaseOrderCoreCells(r, { includeTpsl: false, includeFeePnl: true }) +
                '<td class="px-4 py-3 whitespace-nowrap">' +
                '<button type="button" class="' + BTN_BASE + ' text-blue-600" onclick="openOrderFillDetail(\'' + esc + '\')">查看详情</button>' +
                '</td></tr>';
        }).join('');
    }

    function renderHistOrderTpslRows() {
        return HIST_ORDER_TPSL.map(function (r) { return renderTpslOrderRow(r, { withActions: false }); }).join('');
    }

    function renderCurrentOrderTpslRows() {
        return CURRENT_ORDER_TPSL.map(function (r) { return renderTpslOrderRow(r, { withActions: true }); }).join('');
    }

    function renderHistTradeRows() {
        return HIST_TRADES.map(function (r) {
            return `<tr class="border-b border-gray-50 hover:bg-gray-50 text-[11px]">
                <td class="px-4 py-3 text-gray-400 whitespace-nowrap">${r.time}</td>
                <td class="px-4 py-3 font-mono whitespace-nowrap">${r.qty}</td>
                <td class="px-4 py-3 font-mono font-bold whitespace-nowrap">${r.price}</td>
                <td class="px-4 py-3 font-mono whitespace-nowrap">${r.amount}</td>
                <td class="px-4 py-3 whitespace-nowrap">${r.role}</td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">${r.fee}</td>
                <td class="px-4 py-3 font-mono text-[10px] text-gray-600 whitespace-nowrap">${r.flowId}</td>
            </tr>`;
        }).join('');
    }

    function renderHistPosRows(helpers) {
        const renderPnl = helpers.renderRealizedPnlHoverCell;
        const demo = helpers.REALIZED_PNL_BREAKDOWN_DEMO;
        const extra = PNL_BREAKDOWN_EXTRA;
        return HIST_POSITIONS.map(function (p) {
            const pnlData = extra[p.pnlKey] || demo[p.pnlKey] || demo.hist;
            const esc = String(p.id).replace(/'/g, "\\'");
            return `<tr class="border-b border-gray-50 hover:bg-gray-50 text-[11px]">
                <td class="px-4 py-3 font-bold whitespace-nowrap">${p.symbol}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">${p.positionType}</td>
                <td class="px-4 py-3 whitespace-nowrap">${p.openAvg}</td>
                <td class="px-4 py-3 whitespace-nowrap">${p.closeAvg}</td>
                <td class="px-4 py-3 whitespace-nowrap">${p.maxQty}</td>
                <td class="px-4 py-3 whitespace-nowrap">${p.closedQty}</td>
                <td class="px-4 py-3 whitespace-nowrap"><div class="flex items-center space-x-1">${renderPnl(pnlData, 'text-[11px]')}<button onclick="toggleModal('modal-share-pnl')" class="text-gray-400 hover:text-blue-600 p-0.5 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></td>
                <td class="px-4 py-3 whitespace-nowrap"><span class="font-bold text-gray-700">${p.status}</span></td>
                <td class="px-4 py-3 whitespace-nowrap">${p.openTime}</td>
                <td class="px-4 py-3 whitespace-nowrap">${p.closeTime}</td>
                <td class="px-4 py-3 whitespace-nowrap"><button type="button" class="${BTN_BASE} text-blue-600" onclick="openHistPosRelatedOrders('${esc}')">关联订单</button></td>
            </tr>`;
        }).join('');
    }

    function renderAssetLogRows() {
        return ASSET_LOGS.map(function (r) {
            return `<tr class="border-b border-gray-50 text-[11px]">
                <td class="px-4 py-3 text-gray-400 whitespace-nowrap">${r.time}</td>
                <td class="px-4 py-3 whitespace-nowrap">${r.type}</td>
                <td class="px-4 py-3 font-mono whitespace-nowrap ${r.amountClass}">${r.amount}</td>
                <td class="px-4 py-3 whitespace-nowrap">${r.coin}</td>
                <td class="px-4 py-3 whitespace-nowrap">${r.symbol}</td>
            </tr>`;
        }).join('');
    }

    function renderFundingFeeRows() {
        return FUNDING_FEES.map(function (r) {
            return `<tr class="border-b border-gray-50 text-[11px]">
                <td class="px-4 py-3 text-gray-400 whitespace-nowrap">${r.time}</td>
                <td class="px-4 py-3 font-bold whitespace-nowrap">${r.symbol}</td>
                <td class="px-4 py-3 whitespace-nowrap ${r.feeClass.includes('green') ? 'text-green-500' : 'text-green-500'}">${r.dir}</td>
                <td class="px-4 py-3 font-mono whitespace-nowrap ${r.feeClass}">${r.fee}</td>
            </tr>`;
        }).join('');
    }

    window.PositionFlow = {
        PNL_BREAKDOWN_EXTRA: PNL_BREAKDOWN_EXTRA,

        renderHistOrderHeader: function (subTab) {
            if (subTab === 'base') {
                return '<th class="px-4 py-2">合約</th><th class="px-4 py-2">委託時間</th><th class="px-4 py-2">交易方向</th><th class="px-4 py-2">委託價</th><th class="px-4 py-2">委託數量</th><th class="px-4 py-2">成交均價</th><th class="px-4 py-2">成交數量</th><th class="px-4 py-2">手續費</th><th class="px-4 py-2">盈亏</th><th class="px-4 py-2">訂單狀態</th><th class="px-4 py-2">訂單編號</th><th class="px-4 py-2">流水详情</th>';
            }
            return '<th class="px-4 py-2">合約</th><th class="px-4 py-2">委託時間</th><th class="px-4 py-2">交易方向</th><th class="px-4 py-2">數量</th><th class="px-4 py-2">觸發價格</th><th class="px-4 py-2">委託價格</th><th class="px-4 py-2">訂單狀態</th><th class="px-4 py-2">訂單編號</th>';
        },

        renderCurrentOrderBaseHeader: function () {
            return '<th class="px-4 py-2">合約</th><th class="px-4 py-2">委託時間</th><th class="px-4 py-2">交易方向</th><th class="px-4 py-2">委託價</th><th class="px-4 py-2">委託數量</th><th class="px-4 py-2">成交均價</th><th class="px-4 py-2">成交數量</th><th class="px-4 py-2 text-blue-600">止盈止损</th><th class="px-4 py-2">訂單狀態</th><th class="px-4 py-2">訂單編號</th>' + CANCEL_ALL_TH;
        },

        renderCurrentOrderBaseBody: function () {
            return renderCurrentOrderBaseRows();
        },

        renderCurrentOrderTpslHeader: function () {
            return '<th class="px-4 py-2">合約</th><th class="px-4 py-2">委託時間</th><th class="px-4 py-2">交易方向</th><th class="px-4 py-2">數量</th><th class="px-4 py-2">觸發價格</th><th class="px-4 py-2">委託價格</th><th class="px-4 py-2">訂單狀態</th><th class="px-4 py-2">訂單編號</th>' +
                '<th class="px-4 py-2 cursor-pointer" onclick="openCancelAllConfirm(\'tpsl\')"><span class="flex items-center space-x-1 text-red-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>全部撤销</span></th>';
        },

        renderCurrentOrderTpslBody: function () {
            return renderCurrentOrderTpslRows();
        },

        /** 统一渲染当前/历史委托表格（基础单 + 止盈止损单） */
        renderOrderTabTable: function (tabKind, subTab, headerEl, bodyEl) {
            if (!headerEl || !bodyEl) return false;
            if (tabKind === 'current' && subTab === 'base') {
                headerEl.innerHTML = this.renderCurrentOrderBaseHeader();
                bodyEl.innerHTML = this.renderCurrentOrderBaseBody();
                return true;
            }
            if (tabKind === 'current' && subTab === 'tpsl') {
                headerEl.innerHTML = this.renderCurrentOrderTpslHeader();
                bodyEl.innerHTML = this.renderCurrentOrderTpslBody();
                return true;
            }
            if (tabKind === 'hist' && subTab === 'tpsl') {
                headerEl.innerHTML = this.renderHistOrderHeader('tpsl');
                bodyEl.innerHTML = this.renderHistOrderBody('tpsl');
                return true;
            }
            return false;
        },

        copyOrderId: function (orderId) {
            if (!orderId) return;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(orderId);
                }
            } catch (e) { /* ignore */ }
            if (typeof showError === 'function') showError('订单编号已复制');
        },

        renderHistOrderBody: function (subTab) {
            return subTab === 'base' ? renderHistOrderBaseRows() : renderHistOrderTpslRows();
        },

        renderHistTradeHeader: function () {
            return '<th class="px-4 py-2">成交时间</th><th class="px-4 py-2">数量</th><th class="px-4 py-2">价格</th><th class="px-4 py-2">成交金额</th><th class="px-4 py-2">角色</th><th class="px-4 py-2">手续费</th><th class="px-4 py-2">流水编号</th>';
        },

        renderHistTradeBody: function () {
            return renderHistTradeRows();
        },

        renderHistPosHeader: function () {
            return '<th class="px-4 py-2">合約</th><th class="px-4 py-2">仓位类型</th><th class="px-4 py-2">開倉均價</th><th class="px-4 py-2">平倉均價</th><th class="px-4 py-2"><span class="market-hint-wrap dashed-hint">最大持仓量<div class="market-hint-tip th-col-tip">您的持仓曾达到的最大规模 (非累积计算)</div></span></th><th class="px-4 py-2">已平仓量</th><th class="px-4 py-2">已实现盈亏</th><th class="px-4 py-2">狀態</th><th class="px-4 py-2">開倉時間</th><th class="px-4 py-2">平倉時間</th><th class="px-4 py-2">关联订单</th>';
        },

        renderHistPosBody: function (helpers) {
            return renderHistPosRows(helpers);
        },

        renderAssetLogHeader: function () {
            return '<th class="px-4 py-2">時間</th><th class="px-4 py-2">類型</th><th class="px-4 py-2">金額</th><th class="px-4 py-2">幣種</th><th class="px-4 py-2">合約</th>';
        },

        renderAssetLogBody: function () {
            return renderAssetLogRows();
        },

        renderFundingFeeHeader: function () {
            return '<th class="px-4 py-2">時間</th><th class="px-4 py-2">合約</th><th class="px-4 py-2">方向</th><th class="px-4 py-2">資金費用</th>';
        },

        renderFundingFeeBody: function () {
            return renderFundingFeeRows();
        },

        openRelatedOrders: function (posId) {
            relatedOrdersState = { posId: posId, page: 1 };
            this.renderRelatedOrdersPage();
            if (typeof window.toggleModal === 'function') {
                window.toggleModal('modal-hist-pos-related-orders');
            }
        },

        setRelatedOrdersPage: function (page) {
            const data = POSITION_RELATED_ORDERS[relatedOrdersState.posId];
            if (!data) return;
            const totalPages = Math.max(1, Math.ceil(data.orders.length / RELATED_ORDERS_PAGE_SIZE));
            relatedOrdersState.page = Math.min(Math.max(1, page), totalPages);
            this.renderRelatedOrdersPage();
        },

        renderRelatedOrdersPage: function () {
            const data = POSITION_RELATED_ORDERS[relatedOrdersState.posId];
            const titleEl = document.getElementById('related-orders-subtitle');
            const bodyEl = document.getElementById('related-orders-body');
            const pagerEl = document.getElementById('related-orders-pager');
            if (!data || !titleEl || !bodyEl) return;
            titleEl.textContent = data.subtitle;
            const orders = data.orders || [];
            if (!orders.length) {
                bodyEl.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-400">暂无关联订单</td></tr>';
                if (pagerEl) pagerEl.innerHTML = '';
                return;
            }
            const totalPages = Math.ceil(orders.length / RELATED_ORDERS_PAGE_SIZE);
            const start = (relatedOrdersState.page - 1) * RELATED_ORDERS_PAGE_SIZE;
            const pageOrders = orders.slice(start, start + RELATED_ORDERS_PAGE_SIZE);
            bodyEl.innerHTML = pageOrders.map(function (o) {
                const pnlClass = o.pnlClass || (String(o.pnl || '').indexOf('-') === 0 ? 'text-red-500' : 'text-green-500');
                return '<tr class="border-b border-gray-50 text-[11px]">' +
                    '<td class="px-3 py-2 font-bold whitespace-nowrap ' + o.dirClass + '">' + o.dir + '</td>' +
                    '<td class="px-3 py-2 font-mono whitespace-nowrap">' + o.qty + '</td>' +
                    '<td class="px-3 py-2 font-mono font-bold whitespace-nowrap">' + o.price + '</td>' +
                    '<td class="px-3 py-2 font-mono font-bold whitespace-nowrap ' + pnlClass + '">' + (o.pnl || '--') + '</td>' +
                    '<td class="px-3 py-2 font-mono whitespace-nowrap">' + o.fee + '</td>' +
                    '<td class="px-3 py-2 font-mono text-[10px] text-gray-600 whitespace-nowrap">' + o.orderId + '</td>' +
                    '<td class="px-3 py-2 text-gray-400 whitespace-nowrap">' + o.time + '</td>' +
                    '</tr>';
            }).join('');
            if (!pagerEl) return;
            let pagerHtml = '';
            if (relatedOrdersState.page > 1) {
                pagerHtml += '<button type="button" class="px-2 py-1 border border-gray-200 rounded-sm" onclick="PositionFlow.setRelatedOrdersPage(' + (relatedOrdersState.page - 1) + ')">上一页</button>';
            }
            pagerHtml += '<span class="text-gray-500">第 ' + relatedOrdersState.page + ' / ' + totalPages + ' 页</span>';
            if (relatedOrdersState.page < totalPages) {
                pagerHtml += '<button type="button" class="px-2 py-1 border border-gray-200 rounded-sm" onclick="PositionFlow.setRelatedOrdersPage(' + (relatedOrdersState.page + 1) + ')">下一页</button>';
            }
            pagerEl.innerHTML = pagerHtml;
        },

        setPeriod: function (btn, days) {
            const container = btn.closest('[id$="-filters"]');
            if (!container) return;
            container.querySelectorAll('.pf-period-btn').forEach(function (b) {
                b.className = 'pf-period-btn px-2 py-1 rounded-sm text-gray-400 hover:bg-gray-100';
            });
            btn.className = 'pf-period-btn px-2 py-1 rounded-sm bg-gray-900 text-white';
            const end = new Date(DEMO_END);
            const start = new Date(end);
            start.setDate(start.getDate() - (days - 1));
            const startStr = formatDemoDate(start);
            const endStr = formatDemoDate(end);
            const trigger = container.querySelector('[data-date-trigger]');
            if (trigger) {
                const parts = trigger.querySelectorAll('[data-date-part]');
                if (parts[0]) parts[0].textContent = startStr;
                if (parts[1]) parts[1].textContent = endStr;
            }
            const picker = container.querySelector('[id$="-date-picker"]');
            if (picker) {
                const sel = picker.querySelector('[data-selected-range]');
                if (sel) sel.innerHTML = `<span class="font-black text-gray-900">${startStr}</span> <span class="text-gray-300">至</span> <span class="font-black text-gray-900">${endStr}</span>`;
            }
        },

        closeDatePanel: function (btn) {
            const panel = btn.closest('[id$="-date-picker"]');
            if (panel) {
                panel.classList.add('hidden');
                panel.classList.remove('picker-fixed');
                panel.style.top = '';
                panel.style.left = '';
                panel.style.width = '';
            }
        },

        confirmDatePanel: function (btn) {
            const panel = btn.closest('[id$="-date-picker"]');
            if (panel) {
                panel.classList.add('hidden');
                panel.classList.remove('picker-fixed');
                panel.style.top = '';
                panel.style.left = '';
                panel.style.width = '';
            }
            const container = btn.closest('[id$="-filters"]');
            if (container) {
                container.querySelectorAll('.pf-period-btn').forEach(function (b) {
                    b.className = 'pf-period-btn px-2 py-1 rounded-sm text-gray-400 hover:bg-gray-100';
                });
            }
        },

        prepareModifyBaseOrder: function (orderId) {
            const row = CURRENT_ORDER_BASE.find(function (r) { return r.orderId === orderId; }) || CURRENT_ORDER_BASE[0];
            if (!row) return;
            const titleEl = document.getElementById('modify-base-order-title');
            const priceHintEl = document.getElementById('modify-base-order-last-price');
            const priceInput = document.getElementById('modify-base-order-price');
            const qtyInput = document.getElementById('modify-base-order-qty');
            if (titleEl) titleEl.innerHTML = renderOrderSummaryTitleHtml(row.titleSymbol, row.titleDir, row.titleDirClass);
            if (priceHintEl) priceHintEl.textContent = '最新价 ' + (row.modifyLastPrice || '606.31');
            if (priceInput) priceInput.value = row.price === '市价' ? '' : row.price.replace(/,/g, '');
            if (qtyInput) qtyInput.value = row.qty;
            const tpslCheck = document.getElementById('modify-base-order-tpsl-check');
            const tpslInputs = document.getElementById('modify-base-order-tpsl-inputs');
            const tpInput = document.getElementById('modify-base-order-tp-price');
            const slInput = document.getElementById('modify-base-order-sl-price');
            const hasTpsl = row.tpslTp || row.tpslSl;
            if (tpslCheck) tpslCheck.checked = hasTpsl;
            if (tpslInputs) tpslInputs.style.display = hasTpsl ? 'block' : 'none';
            if (tpInput) tpInput.value = row.tpslTp || '';
            if (slInput) slInput.value = row.tpslSl || '';
            if (typeof window.updateModifyBaseOrderEstimates === 'function') {
                window.updateModifyBaseOrderEstimates();
            }
        },

        openFillDetail: function (orderId) {
            fillDetailState = { orderId: orderId, page: 1 };
            this.renderFillDetailPage();
            if (typeof window.toggleModal === 'function') {
                window.toggleModal('modal-order-fill-detail');
            }
        },

        setFillDetailPage: function (page) {
            const data = ORDER_FILL_DETAILS[fillDetailState.orderId];
            if (!data) return;
            const totalPages = Math.max(1, Math.ceil(data.fills.length / FILL_PAGE_SIZE));
            fillDetailState.page = Math.min(Math.max(1, page), totalPages);
            this.renderFillDetailPage();
        },

        renderFillDetailPage: function () {
            const data = ORDER_FILL_DETAILS[fillDetailState.orderId];
            const titleEl = document.getElementById('fill-detail-title');
            const bodyEl = document.getElementById('fill-detail-body');
            const pagerEl = document.getElementById('fill-detail-pager');
            if (!data || !titleEl || !bodyEl) return;
            titleEl.innerHTML = renderOrderSummaryTitleHtml(data.titleSymbol, data.titleDir, data.titleDirClass);
            const fills = data.fills || [];
            if (!fills.length) {
                bodyEl.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-400">暂无成交记录</td></tr>';
                if (pagerEl) pagerEl.innerHTML = '';
                return;
            }
            const totalPages = Math.ceil(fills.length / FILL_PAGE_SIZE);
            const start = (fillDetailState.page - 1) * FILL_PAGE_SIZE;
            const pageFills = fills.slice(start, start + FILL_PAGE_SIZE);
            bodyEl.innerHTML = pageFills.map(function (f) {
                return '<tr class="border-b border-gray-50 text-[11px]">' +
                    '<td class="px-3 py-2 text-gray-400 whitespace-nowrap">' + f.time + '</td>' +
                    '<td class="px-3 py-2 font-mono whitespace-nowrap">' + f.qty + '</td>' +
                    '<td class="px-3 py-2 font-mono font-bold whitespace-nowrap">' + f.price + '</td>' +
                    '<td class="px-3 py-2 font-mono whitespace-nowrap">' + f.amount + '</td>' +
                    '<td class="px-3 py-2 whitespace-nowrap">' + f.role + '</td>' +
                    '<td class="px-3 py-2 font-mono whitespace-nowrap">' + f.fee + '</td>' +
                    '</tr>';
            }).join('');
            if (!pagerEl) return;
            let pagerHtml = '';
            if (fillDetailState.page > 1) {
                pagerHtml += '<button type="button" class="px-2 py-1 border border-gray-200 rounded-sm" onclick="PositionFlow.setFillDetailPage(' + (fillDetailState.page - 1) + ')">上一页</button>';
            }
            pagerHtml += '<span class="text-gray-500">第 ' + fillDetailState.page + ' / ' + totalPages + ' 页</span>';
            if (fillDetailState.page < totalPages) {
                pagerHtml += '<button type="button" class="px-2 py-1 border border-gray-200 rounded-sm" onclick="PositionFlow.setFillDetailPage(' + (fillDetailState.page + 1) + ')">下一页</button>';
            }
            pagerEl.innerHTML = pagerHtml;
        },

        initContractFilters: function () {
            document.querySelectorAll('[data-pf-contract-filter]').forEach(function (slot, index) {
                const filterId = slot.dataset.pfContractFilter || ('pf-contract-filter-' + index);
                slot.dataset.pfContractFilter = filterId;
                slot.innerHTML = buildContractFilterHtml(filterId);
            });
            if (this._contractFilterDocBound) return;
            this._contractFilterDocBound = true;
            document.addEventListener('click', function (e) {
                if (e.target.closest('.pf-contract-filter-root')) return;
                document.querySelectorAll('.pf-contract-filter-panel').forEach(function (panel) {
                    panel.classList.add('hidden');
                });
            });
        },

        toggleContractFilter: function (filterId) {
            const root = document.getElementById(filterId);
            if (!root) return;
            const panel = root.querySelector('.pf-contract-filter-panel');
            if (!panel) return;
            const willOpen = panel.classList.contains('hidden');
            document.querySelectorAll('.pf-contract-filter-panel').forEach(function (p) { p.classList.add('hidden'); });
            if (willOpen) {
                panel.classList.remove('hidden');
                const input = panel.querySelector('.pf-contract-filter-search');
                if (input) {
                    input.value = '';
                    this.filterContractOptions(filterId, '');
                    setTimeout(function () { input.focus(); }, 0);
                }
            }
        },

        filterContractOptions: function (filterId, query) {
            const root = document.getElementById(filterId);
            if (!root) return;
            const q = String(query || '').trim().toUpperCase();
            root.querySelectorAll('.pf-contract-filter-item').forEach(function (item) {
                const symbol = (item.dataset.symbol || '').toUpperCase();
                const label = item.textContent.trim().toUpperCase();
                const match = !q || symbol.indexOf(q) >= 0 || label.indexOf(q) >= 0;
                item.classList.toggle('hidden', !match);
            });
        },

        selectContractFilter: function (filterId, symbol) {
            const root = document.getElementById(filterId);
            if (!root) return;
            root.dataset.value = symbol || '';
            const labelEl = root.querySelector('.pf-contract-filter-label');
            if (labelEl) {
                labelEl.textContent = symbol || '合约';
                labelEl.className = 'pf-contract-filter-label ' + (symbol ? 'text-gray-900 font-mono' : 'text-gray-500');
            }
            const panel = root.querySelector('.pf-contract-filter-panel');
            if (panel) panel.classList.add('hidden');
        },
    };
})();
