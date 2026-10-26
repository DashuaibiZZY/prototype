/**
 * 用户中心详情 · 交易数据区（仅筛选 + 表头，无 mock 行）
 */
(function () {
    function emptyBody(colspan) {
        return '<tr><td colspan="' + colspan + '" class="px-6 py-16 text-center text-slate-400 text-sm">暂无数据（后台只读查询，接口接入后展示）</td></tr>';
    }

    function filterBar(fieldsHtml) {
        return (
            '<div class="px-4 py-3 border-b border-slate-100 flex flex-wrap items-end gap-3 bg-slate-50/80">' +
            fieldsHtml +
            '<button type="button" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">查询</button>' +
            '<button type="button" class="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500">重置</button>' +
            '</div>'
        );
    }

    function sel(label, id, options) {
        const opts = options.map(function (o) {
            return '<option>' + o + '</option>';
        }).join('');
        return (
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">' +
            label +
            '</label><select class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white min-w-[120px]">' +
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
            '<input type="date" class="border border-slate-200 rounded px-2 py-1 text-xs" />' +
            '<span class="text-slate-300">—</span>' +
            '<input type="date" class="border border-slate-200 rounded px-2 py-1 text-xs" />' +
            '</div>'
        );
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

    const POS_HEADERS = [
        '合约',
        '数量',
        '开仓均价',
        '标记价格',
        '盈亏平衡价',
        '预估强平价',
        '风险率',
        '保证金',
        '盈亏 (ROE%)',
        '止盈/止损'
    ];

    const ORDER_BASE_HEADERS = [
        '时间',
        '合约',
        '类型',
        '方向',
        '成交均价',
        '价格',
        '成交数量',
        '数量',
        '触发条件',
        '止盈/止损',
        '生效时间',
        '状态'
    ];

    const ORDER_TPSL_HEADERS = [
        '时间',
        '合约',
        '类型',
        '方向',
        '成交均价',
        '价格',
        '成交数量',
        '数量',
        '触发条件',
        '止盈/止损',
        '生效时间',
        '状态'
    ];

    const HIST_ORDER_BASE_HEADERS = [
        '时间',
        '合约',
        '类型',
        '方向',
        '平均价格',
        '价格',
        '成交数量',
        '数量',
        '触发条件',
        '生效时间',
        '状态'
    ];

    const HIST_ORDER_TPSL_HEADERS = ['时间', '合约', '类型', '方向', '价格', '数量', '触发条件', '生效时间', '状态'];

    const panels = {
        pos: function () {
            return (
                '<div class="hidden-check">' +
                filterBar(
                    '<label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" class="rounded border-slate-300" /> 仅当前合约</label>' +
                        sel('合约', 'f-pos-symbol', ['全部', 'BTCUSDC', 'ETHUSDC'])
                ) +
                tableHead(POS_HEADERS) +
                '</div>'
            );
        },
        order: function (sub) {
            const isBase = sub === 'base';
            const isAdv = sub === 'adv';
            const headers = isBase || isAdv ? ORDER_BASE_HEADERS : ORDER_TPSL_HEADERS;
            let extra = '';
            if (isBase) {
                extra =
                    sel('订单类型', 'f-ord-type', ['全部', '限价', '市价', '限价止损', '市价止损']) +
                    sel('方向', 'f-ord-dir', ['全部', '买入', '卖出']);
            } else if (isAdv) {
                extra =
                    sel('生效机制', 'f-ord-adv-tif', ['全部', 'Post Only', 'FOK', 'IOC']) +
                    sel('方向', 'f-ord-adv-dir', ['全部', '买入', '卖出']);
            }
            return (
                filterBar(
                    sel('合约', 'f-ord-symbol', ['全部', 'BTCUSDC']) +
                        extra +
                        '<label class="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" class="rounded border-slate-300" /> 隐藏其他合约</label>'
                ) + tableHead(headers)
            );
        },
        'hist-order': function (sub) {
            const isBase = sub === 'base';
            const isAdv = sub === 'adv';
            const headers = isBase || isAdv ? HIST_ORDER_BASE_HEADERS : HIST_ORDER_TPSL_HEADERS;
            let extra = '';
            if (isBase) {
                extra =
                    sel('订单类型', 'f-ho-type', ['全部', '限价委托', '市价委托', '强平委托']) +
                    sel('方向', 'f-ho-dir', ['全部', '买入', '卖出']) +
                    sel('状态', 'f-ho-status', ['全部', '完全成交', '部分成交', '已取消']);
            } else if (isAdv) {
                extra =
                    sel('生效机制', 'f-ho-adv-tif', ['全部', 'Post Only', 'FOK', 'IOC']) +
                    sel('方向', 'f-ho-adv-dir', ['全部', '买入', '卖出']) +
                    sel('状态', 'f-ho-adv-status', ['全部', '完全成交', '部分成交', '已取消']);
            } else {
                extra = sel('状态', 'f-ho-tpsl-status', ['全部', '完全成交', '已取消']);
            }
            return filterBar(periodBtns() + sel('合约', 'f-ho-symbol', ['全部', 'BTCUSDC']) + extra) + tableHead(headers);
        },
        'hist-trade': function () {
            return filterBar(periodBtns() + sel('合约', 'f-ht-symbol', ['全部', 'BTCUSDC']) + sel('方向', 'f-ht-dir', ['全部', '买入', '卖出'])) + tableHead(['时间', '订单号', '合约', '方向', '成交均价', '数量', '角色', '手续费', '已实现盈亏']);
        },
        'hist-pos': function () {
            return (
                filterBar(
                    periodBtns() +
                        sel('合约', 'f-hp-symbol', ['全部', 'BTCUSDC']) +
                        sel('仓位模式', 'f-hp-mode', ['全部', '逐仓', '全仓']) +
                        sel('状态', 'f-hp-status', ['全部', '已全部平仓', '部分平仓'])
                ) +
                tableHead(['合约', '仓位模式', '杠杆', '开仓均价', '平仓均价', '持仓数量', '已平仓数量', '已平仓盈亏', '状态', '开仓时间', '最新平仓时间', '仓位 ID'])
            );
        },
        'asset-log': function () {
            return (
                filterBar(
                    periodBtns() +
                        sel('类型', 'f-al-type', ['全部', '转账', '已实现盈亏', '手续费', '资金费用', '体验金入账', '体验金回收'])
                ) + tableHead(['时间', '类型', '金额', '币种', '合约'])
            );
        },
        'funding-fee': function () {
            return filterBar(periodBtns() + sel('合约', 'f-ff-symbol', ['全部', 'BTCUSDC'])) + tableHead(['时间', '合约', '方向', '资金费用']);
        },
        dw: function (sub) {
            const dwFilter =
                sel('资产', 'f-dw-asset', ['全部', 'USDT', 'USDC']) +
                sel('网络', 'f-dw-net', ['全部', 'BSC', 'Ethereum']) +
                sel('状态', 'f-dw-status', ['全部', '处理中', '已完成', '失败']) +
                '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">时间</label><select class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white"><option>最近 7 天</option><option>最近 30 天</option><option>全部</option></select></div>';

            if (sub === 'auth') {
                return filterBar(dwFilter) + tableHead(['创建时间', '资产', '数量', '类型', '网络', '授权状态', '授权时间']);
            }
            if (sub === 'pending') {
                return filterBar(dwFilter) + tableHead(['类型与说明', '资产与网络', '金额', '状态', '操作']);
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
            { id: 'hist-trade', label: '历史成交' },
            { id: 'hist-pos', label: '历史持仓' },
            { id: 'asset-log', label: '资金流水' },
            { id: 'funding-fee', label: '资金费用' },
            { id: 'dw', label: '充提记录' }
        ],
        dwSubTabs: [
            { id: 'deposit', label: '充值' },
            { id: 'withdraw', label: '提现' },
            { id: 'transfer', label: '划转' },
            { id: 'auth', label: '授权记录' },
            { id: 'pending', label: '待处理' }
        ],
        orderSubTabs: [
            { id: 'base', label: '限价｜市价' },
            { id: 'tpsl', label: '止盈止损单' },
            { id: 'adv', label: '高级限价' }
        ]
    };
})();
