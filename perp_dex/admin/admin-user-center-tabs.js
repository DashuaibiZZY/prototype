/**
 * 用户中心详情 · 交易数据区（筛选 + 表头与 Web 合约交易页对齐，无 mock 行、无代客操作列）
 */
(function () {
    function emptyBody(colspan) {
        return '<tr><td colspan="' + colspan + '" class="px-6 py-16 text-center text-slate-400 text-sm">暂无数据（后台只读查询，接口接入后展示）</td></tr>';
    }

    function filterBar(fieldsHtml) {
        if (!fieldsHtml) return '';
        return (
            '<div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-end gap-3 bg-slate-50/80">' +
            fieldsHtml +
            '<button type="button" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">查询</button>' +
            '<button type="button" class="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">重置</button>' +
            '</div>'
        );
    }

    function sel(label, options, extraClass, disabled) {
        const opts = options
            .map(function (o) {
                return '<option>' + o + '</option>';
            })
            .join('');
        const cls =
            'border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white min-w-[120px]' +
            (extraClass ? ' ' + extraClass : '');
        const dis = disabled ? ' disabled' : '';
        return (
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">' +
            label +
            '</label><select class="' +
            cls +
            '"' +
            dis +
            '>' +
            opts +
            '</select></div>'
        );
    }

    function periodBtns() {
        return (
            '<div class="flex items-center gap-1">' +
            '<span class="text-[10px] font-bold text-slate-500 uppercase mr-1">时间</span>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold bg-slate-900 text-white">近1日</button>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold text-slate-500 hover:bg-slate-100">近7日</button>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold text-slate-500 hover:bg-slate-100">近30日</button>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold text-slate-500 hover:bg-slate-100">近90日</button>' +
            '<span class="text-slate-300 mx-1">|</span>' +
            '<input type="date" class="border border-slate-200 rounded px-2 py-1 text-xs" />' +
            '<span class="text-slate-300">—</span>' +
            '<input type="date" class="border border-slate-200 rounded px-2 py-1 text-xs" />' +
            '</div>'
        );
    }

    function dwPeriodBtns() {
        return (
            '<div class="flex items-center gap-1">' +
            '<span class="text-[10px] font-bold text-slate-500 uppercase mr-1">时间</span>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold bg-slate-900 text-white">近7日</button>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold text-slate-500 hover:bg-slate-100">近30日</button>' +
            '<button type="button" class="px-2 py-1 rounded text-xs font-bold text-slate-500 hover:bg-slate-100">全部</button>' +
            '</div>'
        );
    }

    function contractSel() {
        return sel('合约', [
            '全部',
            'BTCUSDC',
            'BNBUSDC',
            'ETHUSDC',
            'SOLUSDC',
            'PEPEUSDC',
            'BTCUSDT',
            'BNBUSDT',
            'ETHUSDT',
            'SOLUSDT'
        ]);
    }

    function tableHead(cells) {
        const ths = cells
            .map(function (c) {
                return '<th class="px-4 py-3 whitespace-nowrap">' + c + '</th>';
            })
            .join('');
        return (
            '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead class="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">' +
            '<tr>' +
            ths +
            '</tr></thead><tbody>' +
            emptyBody(cells.length) +
            '</tbody></table></div>'
        );
    }

    /** 当前持仓（无平仓/分享/一键平仓列） */
    const POS_HEADERS = [
        '合约',
        '数量',
        '开仓均价',
        '标记价格',
        '盈亏平衡价',
        '预估强平价',
        '联合保证金率',
        '保证金',
        '盈亏 (ROE%)',
        '止盈/止损'
    ];

    const CUR_ORDER_BASE = [
        '合约',
        '委托时间',
        '交易方向',
        '委托价',
        '委托数量',
        '成交均价',
        '成交数量',
        '止盈止损',
        '订单状态',
        '订单编号'
    ];

    const CUR_ORDER_ADV = [
        '合约',
        '委托时间',
        '交易方向',
        '委托价',
        '委托数量',
        '成交均价',
        '成交数量',
        '生效类型',
        '止盈止损',
        '订单状态',
        '订单编号'
    ];

    const CUR_ORDER_TPSL = ['合约', '委托时间', '交易方向', '数量', '触发价格', '委托价格', '订单状态', '订单编号'];

    const HIST_ORDER_BASE = [
        '合约',
        '委托时间',
        '交易方向',
        '委托价',
        '委托数量',
        '成交均价',
        '成交数量',
        '手续费',
        '盈亏 (ROE%)',
        '订单状态',
        '订单编号',
        '流水详情'
    ];

    const HIST_ORDER_ADV = [
        '合约',
        '委托时间',
        '交易方向',
        '委托价',
        '委托数量',
        '成交均价',
        '成交数量',
        '生效类型',
        '手续费',
        '盈亏 (ROE%)',
        '订单状态',
        '订单编号',
        '流水详情'
    ];

    const HIST_ORDER_TPSL = ['合约', '委托时间', '交易方向', '数量', '触发价格', '委托价格', '订单状态', '订单编号'];

    const HIST_TRADE_HEADERS = [
        '发生时间',
        '账单主类型',
        '账单子类型',
        '挂单/吃单',
        '币种',
        '交易合约',
        '仓位类型',
        '数量',
        '手续费',
        '成交价',
        '收益',
        '仓位余额变动',
        '仓位余额',
        '账户余额变动',
        '账户余额'
    ];

    const TRIAL_FUND_HEADERS = ['时间', '卡券ID', '类型', '金额变动', '关联仓位ID'];

    const HIST_POS_HEADERS = [
        '合约',
        '仓位类型',
        '开仓均价',
        '平仓均价',
        '最大持仓量',
        '已平仓量',
        '已实现盈亏 (ROE%)',
        '状态',
        '开仓时间',
        '平仓时间',
        '仓位ID',
        '关联订单'
    ];

    const ASSET_LOG_HEADERS = ['时间', '币种', '账单主类型', '数量', '账户余额'];

    const FUNDING_FEE_HEADERS = ['时间', '合约', '资金费用'];

    const TRADE_BILL_MAIN_TYPES = ['划转', '交易', '保证金划转', '阶梯减仓', '资金费'];

    function histOrderHeaders(sub) {
        if (sub === 'adv') return HIST_ORDER_ADV;
        if (sub === 'tpsl') return HIST_ORDER_TPSL;
        return HIST_ORDER_BASE;
    }

    function curOrderHeaders(sub) {
        if (sub === 'adv') return CUR_ORDER_ADV;
        if (sub === 'tpsl') return CUR_ORDER_TPSL;
        return CUR_ORDER_BASE;
    }

    const panels = {
        pos: function () {
            return tableHead(POS_HEADERS);
        },
        order: function (sub) {
            return tableHead(curOrderHeaders(sub));
        },
        'hist-order': function (sub) {
            return filterBar(periodBtns()) + tableHead(histOrderHeaders(sub || 'base'));
        },
        'hist-trade': function () {
            return (
                filterBar(
                    periodBtns() +
                        contractSel() +
                        sel('账单主类型', ['账单主类型'].concat(TRADE_BILL_MAIN_TYPES)) +
                        sel('账单子类型', ['账单子类型'], 'opacity-50 cursor-not-allowed', true)
                ) + tableHead(HIST_TRADE_HEADERS)
            );
        },
        'hist-trial-fund': function () {
            return (
                filterBar(
                    periodBtns() +
                        sel('类型', ['类型', '激活', '费用抵扣', '亏损抵扣', '回收'], 'min-w-[100px]')
                ) + tableHead(TRIAL_FUND_HEADERS)
            );
        },
        'hist-pos': function () {
            return (
                filterBar(
                    periodBtns() +
                        contractSel() +
                        sel('仓位模式', ['仓位模式', '全部', '逐仓', '全仓']) +
                        sel('状态', ['状态', '全部平仓', '部分平仓'], 'min-w-[100px]')
                ) + tableHead(HIST_POS_HEADERS)
            );
        },
        'asset-log': function () {
            return (
                filterBar(
                    periodBtns() +
                        sel('账单主类型', ['账单主类型', '充值', '提币', '转入', '转出', '空投奖励', '返佣'])
                ) + tableHead(ASSET_LOG_HEADERS)
            );
        },
        'funding-fee': function () {
            return filterBar(periodBtns()) + tableHead(FUNDING_FEE_HEADERS);
        },
        dw: function (sub) {
            const dwFilter =
                sel('资产', ['全部']) +
                sel('网络', ['全部']) +
                sel('状态', ['全部']) +
                dwPeriodBtns();

            if (sub === 'auth') {
                return filterBar(dwFilter) + tableHead(['创建时间', '资产', '数量', '类型', '网络', '授权状态', '授权时间']);
            }
            return filterBar(dwFilter) + tableHead(['类型与说明', '资产与网络', '金额', '状态', '时间']);
        }
    };

    window.AdminUserCenterTabs = {
        renderPanel: function (tabId, subTab, dwSub) {
            if (tabId === 'pos') return panels.pos();
            if (tabId === 'order') return panels.order(subTab || 'base');
            if (tabId === 'hist-order') return panels['hist-order'](subTab || 'base');
            if (tabId === 'hist-trade') return panels['hist-trade']();
            if (tabId === 'hist-trial-fund') return panels['hist-trial-fund']();
            if (tabId === 'hist-pos') return panels['hist-pos']();
            if (tabId === 'asset-log') return panels['asset-log']();
            if (tabId === 'funding-fee') return panels['funding-fee']();
            if (tabId === 'dw') return panels.dw(dwSub || 'deposit');
            return '';
        },
        mainTabs: [
            { id: 'pos', label: '当前持仓' },
            { id: 'order', label: '当前委托' },
            { id: 'hist-order', label: '历史委托' },
            { id: 'hist-trade', label: '交易账单' },
            { id: 'hist-trial-fund', label: '体验金账单' },
            { id: 'hist-pos', label: '历史持仓' },
            { id: 'asset-log', label: '资金账单' },
            { id: 'funding-fee', label: '资金费用' },
            { id: 'dw', label: '充提记录' }
        ],
        dwSubTabs: [
            { id: 'deposit', label: '充值' },
            { id: 'withdraw', label: '提现' },
            { id: 'transfer', label: '划转' },
            { id: 'auth', label: '授权记录' }
        ],
        orderSubTabs: [
            { id: 'base', label: '限价｜市价' },
            { id: 'tpsl', label: '止盈止损单' },
            { id: 'adv', label: '高级限价' }
        ]
    };
})();
