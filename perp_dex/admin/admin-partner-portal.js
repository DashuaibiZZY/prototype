/**
 * 合伙人中心后台 — 4 条演示数据，列表 / 详情 / 返佣树一致
 */
(function () {
    const OPS_CAP = 80;
    const DATA_VERSION = 'partner-demo-26';
    const USER_SCALE_TIP = '交易用户数据每天 UTC+8 0 点更新';
    const RECONCILIATION_DOWNLOAD_COOLDOWN_MS = 10 * 60 * 1000;
    let lastReconciliationDownloadAt = 0;

    function chip(v, type) {
        if (!v || v === '—' || v === '--') return '<span class="text-slate-400">' + (v || '—') + '</span>';
        if (window.AdminCopyChip) return AdminCopyChip.render(v, { type: type || (String(v).indexOf('0x') >= 0 ? 'wallet' : 'uid') });
        return v;
    }

    function fmtMoney(n) {
        if (n == null || isNaN(n)) return '—';
        return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtSignedMoney(n) {
        if (n == null || isNaN(n)) return '—';
        if (n === 0) return fmtMoney(0);
        const abs = fmtMoney(Math.abs(n));
        return n < 0 ? '-' + abs : '+' + abs;
    }

    function csvEscape(val) {
        const s = String(val == null ? '' : val);
        if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) return '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    function downloadCsvFile(filename, headers, rows) {
        const lines = [headers.map(csvEscape).join(',')].concat(
            rows.map(function (r) { return r.map(csvEscape).join(','); })
        );
        const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
    }

    /** 仅列表展示的 4 个合伙人 */
    const LIST_IDS = ['p_n1', 'p_n3', 'p_a1', 'p_a4'];

    function helperUser(id, wallet, uid, note, level, ratio, parentWallet, rootWallet, childIds) {
        return {
            id: id, wallet: wallet, uid: uid, note: note, level: level, ratio: ratio,
            parentWallet: parentWallet, rootWallet: rootWallet, bindTime: '2024-04-10',
            settleStatus: 'normal',
            vol: '$1.2M', deposit: '+$35k', usersTotal: 80, usersActive: 22,
            net: '$6,800', netHint: '', rebateTotal: '$420', rebateSelf: '$0.02k', rebateDirect: '$0.1k', rebateGap: '$0.3k',
            activeSubPartners: (childIds || []).length, totalSubPartners: (childIds || []).length,
            childIds: childIds || [], directClients: [], settlements: []
        };
    }

    const USERS = [
        {
            id: 'p_n1', wallet: '0xNorm...L1', uid: '100801', note: '正常结算·一级返佣', level: 1, ratio: 70,
            parentWallet: null, rootWallet: '0xNorm...L1', operator: 'allen@forx.fi', bindTime: '2024-03-01',
            settleStatus: 'normal',
            vol: '$18.2M', deposit: '+$620k', usersTotal: 680, usersActive: 210,
            net: '$84,200', netHint: '伞下净手续费 − 伞下触发的全部返佣',
            rebateTotal: '$6,200', rebateSelf: '$0.3k', rebateDirect: '$2.1k', rebateGap: '$3.9k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_n2a', 'h_n2b'],
            directClients: [{ time: '2024-05-17', wallet: '0xde...55aa', vol: '$92,000', fee: '$92', rebate: '$64.40', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$1.1M', rebate: '$4,820', originalRebate: '$4,820', status: '已发放', note: '' }]
        },
        helperUser('h_n2a', '0xNorm...L2a', '100802', '华东渠道', 2, 55, '0xNorm...L1', '0xNorm...L1', ['p_n3', 'h_n3a']),
        helperUser('h_n2b', '0xNorm...L2b', '100802b', '华南渠道', 2, 53, '0xNorm...L1', '0xNorm...L1', ['h_n3b', 'h_n3c']),
        {
            id: 'p_n3', wallet: '0xNorm...L3', uid: '100803', note: '正常结算·三级返佣', level: 3, ratio: 45,
            parentWallet: '0xNorm...L2a', rootWallet: '0xNorm...L1', bindTime: '2024-04-02',
            settleStatus: 'normal',
            vol: '$4.8M', deposit: '+$180k', usersTotal: 320, usersActive: 88,
            net: '$22,100', netHint: '含向上级级差',
            rebateTotal: '$8,420', rebateSelf: '$0.1k', rebateDirect: '$0.8k', rebateGap: '$7.5k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_n4a', 'h_n4b'],
            directClients: [{ time: '2024-05-21', wallet: '0xcc...88ab', vol: '$125,000', fee: '$125', rebate: '$56.25', status: '交易中' }],
            settlements: [{ date: '2024-05-20', vol: '$420k', rebate: '$1,960', originalRebate: '$1,960', status: '已发放', note: '' }]
        },
        helperUser('h_n3a', '0xNorm...L3a', '100803a', '华东-苏皖', 3, 42, '0xNorm...L2a', '0xNorm...L1', ['h_n4c']),
        helperUser('h_n3b', '0xNorm...L3b', '100803b', '华南-闽粤', 3, 40, '0xNorm...L2b', '0xNorm...L1', ['h_n4d']),
        helperUser('h_n3c', '0xNorm...L3c', '100803c', '华南-桂琼', 3, 38, '0xNorm...L2b', '0xNorm...L1', []),
        helperUser('h_n4a', '0xNorm...L4a', '100804a', '四级-A线', 4, 35, '0xNorm...L3', '0xNorm...L1', ['h_n5a']),
        helperUser('h_n4b', '0xNorm...L4b', '100804b', '四级-B线', 4, 33, '0xNorm...L3', '0xNorm...L1', ['h_n5b']),
        helperUser('h_n4c', '0xNorm...L4c', '100804c', '四级-C线', 4, 36, '0xNorm...L3a', '0xNorm...L1', []),
        helperUser('h_n4d', '0xNorm...L4d', '100804d', '四级-D线', 4, 34, '0xNorm...L3b', '0xNorm...L1', ['h_n5c']),
        helperUser('h_n5a', '0xNorm...L5a', '100805a', '五级-A1', 5, 28, '0xNorm...L4a', '0xNorm...L1', []),
        helperUser('h_n5b', '0xNorm...L5b', '100805b', '五级-B1', 5, 27, '0xNorm...L4b', '0xNorm...L1', []),
        helperUser('h_n5c', '0xNorm...L5c', '100805c', '五级-D1', 5, 26, '0xNorm...L4d', '0xNorm...L1', []),
        {
            id: 'p_a1', wallet: '0xAbn...L1', uid: '100811', note: '演示·一级返佣（原异常演示位）', level: 1, ratio: 68,
            parentWallet: null, rootWallet: '0xAbn...L1', operator: 'allen@forx.fi', bindTime: '2024-02-10',
            settleStatus: 'normal',
            vol: '$52.4M', deposit: '+$1.2M', usersTotal: 1420, usersActive: 420,
            net: '$312,400', netHint: '伞下净手续费 − 全部返佣',
            rebateTotal: '$12,840', rebateSelf: '$0.2k', rebateDirect: '$1.2k', rebateGap: '$11.6k',
            activeSubPartners: 2, totalSubPartners: 2, childIds: ['h_a2a', 'h_a2b'],
            directClients: [{ time: '2024-05-18', wallet: '0x77...C3a1', vol: '$18,200', fee: '$18.20', rebate: '$12.37', status: '交易中' }],
            settlements: [
                { date: '2024-05-21', vol: '$3.2M', rebate: '$10,200', originalRebate: '$10,200', status: '已发放', note: '' },
                { date: '2024-05-20', vol: '$3.8M', rebate: '$12,400', originalRebate: '$12,400', status: '已发放', note: '' }
            ]
        },
        helperUser('h_a2a', '0xAbn...L2a', '100812', '正常分支', 2, 50, '0xAbn...L1', '0xAbn...L1', ['h_a2a1', 'h_a2a2']),
        helperUser('h_a2a1', '0xAbn...L3a', '100812a', '正常分支-甲', 3, 46, '0xAbn...L2a', '0xAbn...L1', ['h_a4na']),
        helperUser('h_a2a2', '0xAbn...L3b', '100812b', '正常分支-乙', 3, 44, '0xAbn...L2a', '0xAbn...L1', ['h_a4nb', 'h_a4nc']),
        helperUser('h_a4na', '0xAbn...L4na', '100816a', '正常四级-甲', 4, 38, '0xAbn...L3a', '0xAbn...L1', []),
        helperUser('h_a4nb', '0xAbn...L4nb', '100816b', '正常四级-乙', 4, 36, '0xAbn...L3b', '0xAbn...L1', ['h_a5nb']),
        helperUser('h_a4nc', '0xAbn...L4nc', '100816c', '正常四级-丙', 4, 35, '0xAbn...L3b', '0xAbn...L1', []),
        helperUser('h_a5nb', '0xAbn...L5nb', '100817b', '正常五级-乙', 5, 30, '0xAbn...L4nb', '0xAbn...L1', []),
        {
            id: 'h_a2b', wallet: '0xAbn...L2b', uid: '100813', note: '异常分支入口', level: 2, ratio: 52,
            parentWallet: '0xAbn...L1', rootWallet: '0xAbn...L1', bindTime: '2024-03-08',
            settleStatus: 'normal',
            vol: '$4.1M', deposit: '+$95k', usersTotal: 180, usersActive: 48,
            net: '$19,200', netHint: '', rebateTotal: '$2,100', rebateSelf: '$0.08k', rebateDirect: '$0.4k', rebateGap: '$1.6k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['h_a3'],
            directClients: [], settlements: []
        },
        {
            id: 'h_a3', wallet: '0xAbn...L3', uid: '100814', note: '华南区', level: 3, ratio: 55,
            parentWallet: '0xAbn...L2b', rootWallet: '0xAbn...L1', bindTime: '2024-03-20',
            settleStatus: 'normal',
            vol: '$2.4M', deposit: '+$42k', usersTotal: 96, usersActive: 24,
            net: '$11,800', netHint: '', rebateTotal: '$1,450', rebateSelf: '$0.05k', rebateDirect: '$0.2k', rebateGap: '$1.2k',
            activeSubPartners: 1, totalSubPartners: 1, childIds: ['p_a4'],
            directClients: [], settlements: []
        },
        {
            id: 'p_a4', wallet: '0xAbn...L4', uid: '100815', note: '四级返佣', level: 4, ratio: 50,
            parentWallet: '0xAbn...L3', rootWallet: '0xAbn...L1', bindTime: '2024-04-01',
            settleStatus: 'normal',
            vol: '$1.6M', deposit: '+$28k', usersTotal: 48, usersActive: 12,
            net: '$8,200', netHint: '含向上级级差',
            rebateTotal: '$1,920', rebateSelf: '$0.02k', rebateDirect: '$0.1k', rebateGap: '$1.8k',
            activeSubPartners: 0, totalSubPartners: 0, childIds: [],
            directClients: [],
            settlements: [{ date: '2024-05-21', vol: '$128k', rebate: '$640', originalRebate: '$640', status: '已发放', note: '' }]
        }
    ];

    const PERIOD_SCALES = { '1D': 0.04, '1W': 0.22, '1M': 0.48, '3M': 0.78, 'ALL': 1 };

    function parseMoneyToNum(s) {
        if (!s || s === '--' || s === '—') return 0;
        let t = String(s).replace(/\s/g, '').replace(/,/g, '');
        const neg = t.indexOf('-') === 0;
        t = t.replace(/^[-+]/, '').replace(/^\$/, '');
        let mult = 1;
        if (/m/i.test(t)) { mult = 1e6; t = t.replace(/m/i, ''); }
        else if (/k/i.test(t)) { mult = 1e3; t = t.replace(/k/i, ''); }
        const n = parseFloat(t);
        if (isNaN(n)) return 0;
        return neg ? -n * mult : n * mult;
    }

    function initUserPeriodStats() {
        USERS.forEach(function (u) {
            const volN = parseMoneyToNum(u.vol);
            const rebateN = parseMoneyToNum(u.rebateTotal === '--' ? 0 : u.rebateTotal);
            let netN = u.net === '--' ? 0 : parseMoneyToNum(u.net);
            const feeN = volN > 0 ? volN * 0.01 : 0;
            if (!netN && feeN && u.net !== '--') netN = feeN - rebateN;
            const base = { vol: volN, fee: feeN, rebate: rebateN, netIncome: netN };
            u.statsByPeriod = {};
            Object.keys(PERIOD_SCALES).forEach(function (p) {
                const sc = PERIOD_SCALES[p];
                u.statsByPeriod[p] = {
                    vol: base.vol * sc,
                    fee: base.fee * sc,
                    rebate: base.rebate * sc,
                    netIncome: base.netIncome * sc
                };
            });
        });
    }

    function getUserPeriodStats(u, period) {
        period = period || 'ALL';
        if (!u || !u.statsByPeriod) return { vol: 0, fee: 0, rebate: 0, netIncome: 0 };
        return u.statsByPeriod[period] || u.statsByPeriod.ALL;
    }

    function formatStatMoney(n, dashIfZero) {
        if (dashIfZero && !n) return '--';
        return fmtMoney(n);
    }

    initUserPeriodStats();


    const SETTLEMENT_BATCHES = [
        { date: '2024-05-23', vol: '$12,450,000', status: '等待对账', rejected: false },
        { date: '2024-05-22', vol: '$10,200,000', status: '已拒绝', rejected: true },
        { date: '2024-05-21', vol: '$9,800,000', status: '等待对账', rejected: false },
        { date: '2024-10-10', vol: '$8,600,000', status: '等待对账', rejected: false }
    ];

    const SETTLEMENT_BATCH_DETAILS = {
        '2024-05-23': [
            { id: 'sr1', wallet: '0xAbn...L1', uid: '100811', level: 1, ratio: 68, parentWallet: null, vol: '$1M', originalRebate: 6800, actualRebate: 6500, originalSettlementDate: '2024-05-23' },
            { id: 'sr2', wallet: '0xAbn...L4', uid: '100815', level: 4, ratio: 50, parentWallet: '0xAbn...L3', vol: '$128k', originalRebate: 640, actualRebate: 640, originalSettlementDate: '2024-05-23' },
            { id: 'sr3', wallet: '0xNorm...L1', uid: '100801', level: 1, ratio: 70, parentWallet: null, vol: '$2.1M', originalRebate: 4200, actualRebate: 4200, originalSettlementDate: '2024-05-23' }
        ],
        '2024-05-22': [
            { id: 'sr4', wallet: '0xNorm...L3', uid: '100803', level: 3, ratio: 45, parentWallet: '0xNorm...L2a', vol: '$800k', originalRebate: 1960, actualRebate: 1960, originalSettlementDate: '2024-05-22' }
        ],
        '2024-05-21': [
            { id: 'sr5', wallet: '0xAbn...L1', uid: '100811', level: 1, ratio: 68, parentWallet: null, vol: '$3.8M', originalRebate: 12400, actualRebate: 12400, originalSettlementDate: '2024-05-21' }
        ],
        '2024-10-10': [
            { id: 'sr6', wallet: '0xNorm...L1', uid: '100801', level: 1, ratio: 70, parentWallet: null, vol: '$1.8M', originalRebate: 3800, actualRebate: 3800, originalSettlementDate: '2024-10-10' },
            { id: 'sr7', wallet: '0xNorm...L3', uid: '100803', level: 3, ratio: 45, parentWallet: '0xNorm...L2a', vol: '$620k', originalRebate: 1520, actualRebate: 1500, originalSettlementDate: '2024-10-10' }
        ]
    };

    /** 修正返佣补发：补发执行日入账，关联原应结日 */
    const REBATE_SUPPLEMENT_FLOWS = [
        {
            id: 'sup1', payoutDate: '2024-05-23', wallet: '0xNorm...L1', uid: '100801',
            originalSettlementDate: '2024-05-20', originalRebate: 320.00, amount: 300.00,
            note: '历史批次补发调整'
        }
    ];

    /** 迁移演示：可接收迁移的上级合伙人 */
    const MIGRATE_TARGET_PARTNERS = [
        { id: 'mt_l1', wallet: '0xTo...L1', uid: '200001', level: 1, ratio: 72, note: '演示·一级接收方', parentWallet: null, rootWallet: '0xTo...L1', childIds: ['mt_l2'] },
        { id: 'mt_l2', wallet: '0xTo...L2', uid: '200002', level: 2, ratio: 56, note: '演示·二级接收方', parentWallet: '0xTo...L1', rootWallet: '0xTo...L1', childIds: [] }
    ];

    function migAgent(id, wallet, uid, level, ratio, note, parentWallet, rootWallet, childIds, directClients) {
        return {
            id: id, wallet: wallet, uid: uid, level: level, ratio: ratio, note: note,
            parentWallet: parentWallet, rootWallet: rootWallet,
            childIds: childIds || [], directClients: directClients || []
        };
    }

    /** 构建 5 层代理分支（相对迁移主体的向下 5 层） */
    function migBranch(prefix, tag, rootWallet, baseLevel, l2Ratio, l3Ratio, l4Ratio, l5Ratio) {
        const idP = 'mig_' + prefix;
        const wP = '0xMig...' + tag;
        const l2 = migAgent(idP + '_l2', wP + 'L2', '20' + tag + '02', baseLevel + 1, l2Ratio, tag + '·支路', rootWallet, rootWallet, [idP + '_l3']);
        const l3 = migAgent(idP + '_l3', wP + 'L3', '20' + tag + '03', baseLevel + 2, l3Ratio, tag + '·支路', l2.wallet, rootWallet, [idP + '_l4']);
        const l4 = migAgent(idP + '_l4', wP + 'L4', '20' + tag + '04', baseLevel + 3, l4Ratio, tag + '·支路', l3.wallet, rootWallet, [idP + '_l5']);
        const l5 = migAgent(idP + '_l5', wP + 'L5', '20' + tag + '05', baseLevel + 4, l5Ratio, tag + '·支路', l4.wallet, rootWallet, [], [
            { wallet: wP + 'C1', uid: '20' + tag + 'c1' }
        ]);
        return [l2, l3, l4, l5];
    }

  /** 3.1 普通用户（仅直客） */
    const MIGRATE_PLAIN_USERS = [
        {
            wallet: '0xPlain...U1', uid: '200101', note: '演示·普通用户（仅直客）',
            directClients: [
                { wallet: '0xPlain...C1', uid: '200111' }, { wallet: '0xPlain...C2', uid: '200112' },
                { wallet: '0xPlain...C3', uid: '200113' }, { wallet: '0xPlain...C4', uid: '200114' }
            ]
        }
    ];

    /** 3.1b 普通用户（可作迁移接收方 · 非合伙人） */
    const MIGRATE_PLAIN_HOSTS = [
        {
            wallet: '0xPlain...Host', uid: '200102', note: '演示·普通用户（可作迁移接收方）',
            directClients: [{ wallet: '0xPlain...Hc1', uid: '200121' }]
        }
    ];

    /** 升级为 L1 演示：合伙人直客 */
    const BIND_SUBJECT_DIRECT_CLIENTS = [
        {
            wallet: '0xde...55aa', uid: '100855', note: '演示·一级伞下直客',
            parentPartnerWallet: '0xNorm...L1', parentPartnerUid: '100801',
            directClients: [{ wallet: '0xde...55bb', uid: '100856' }]
        }
    ];

    /** 3.2 正常代理：系统 L2 · 3 条向下 5 层 */
    const MIGRATE_AGENT_OK_ROOT = migAgent('mig_ok_l1', '0xMig...Ok', '200201', 2, 58, '演示·正常代理（系统L2·4×5层）', null, '0xMig...Ok', ['mig_a_l2', 'mig_b_l2', 'mig_c_l2', 'mig_d_l2'], [
        { wallet: '0xMig...OkD1', uid: '200201d' }
    ]);
    const MIGRATE_AGENTS_OK = [MIGRATE_AGENT_OK_ROOT]
        .concat(migBranch('a', 'OkA', '0xMig...Ok', 2, 50, 42, 35, 28))
        .concat(migBranch('b', 'OkB', '0xMig...Ok', 2, 49, 41, 34, 27))
        .concat(migBranch('c', 'OkC', '0xMig...Ok', 2, 48, 40, 33, 26))
        .concat(migBranch('d', 'OkD', '0xMig...Ok', 2, 47, 39, 32, 25));

    const MIGRATE_AGENT_USERS = MIGRATE_AGENTS_OK;

    let currentSupplementEditId = null;
    let batchEditMode = 'detail';
    let currentUserId = null;
    let currentBatchDate = null;
    let batchEditRowIds = null;
    let settlementDetailTab = 'detail';
    let settlementDetailFilters = { partner: '', level: 'all', modified: 'all' };
    let supplementDetailFilters = { partner: '', originalDate: '' };
    let migrateState = { subjectKey: '', preview: null, validationErrors: [], treePage: 0, clientsPage: 0 };
    let migrateTreeExpanded = new Set();
    let migrateRatioOverrides = {};
    let migrateAttachments = [];
    let bindAttachments = [];
    let bindState = { preview: null };
    let treeAttachments = [];
    const MIGRATE_TREE_PAGE_SIZE = 10;
    let treeFocusId = null;
    let treeEntryId = null;
    let treeBranchPage = 1;
    let treeExpandedNodes = new Set();
    let treeHighlightId = null;
    let listFilterStatus = 'all';
    let listSearchQ = '';
    let pendingRatioChanges = [];
    let detailTableFilter = '';
    let listPage = 1;
    let detailSubPage = 1;
    let detailClientPage = 1;
    let drillSubPage = 1;
    let drillClientPage = 1;
    let detailSettlementPage = 1;
    let detailEntryId = null;
    let detailDrillStack = [];
    let detailSubFilter = 'all';
    let drillSubFilter = 'all';
    let drillSubSearch = '';
    let drillStatsPeriod = 'ALL';
    let teamTreeExpanded = {};
    let teamTreeModalPartnerId = null;
    let settlementBatchPage = 1;
    let settlementDetailPage = 1;
    let supplementDetailPage = 1;
    let migrateTreeHighlightId = null;
    let listStatsPeriod = 'ALL';
    let detailStatsPeriod = 'ALL';
    let listSortKey = null;
    let listSortDir = 'desc';

    function paginate(items, page) {
        if (window.AdminPagination) return AdminPagination.slice(items, page);
        const pageSize = 10;
        const total = items.length;
        const p = Math.max(1, Math.min(page || 1, Math.max(1, Math.ceil(total / pageSize))));
        const start = (p - 1) * pageSize;
        return { items: items.slice(start, start + pageSize), page: p, total: total };
    }

    function mountListPagination(containerId, total, page, handlerId) {
        if (window.AdminPagination) AdminPagination.mount(containerId, total, page, handlerId);
    }

    function getUser(id) { return USERS.find(function (u) { return u.id === id; }); }
    function getUserByWallet(w) { return USERS.find(function (u) { return u.wallet === w; }); }

    function getAncestorChain(u) {
        const chain = [];
        let w = u.parentWallet;
        while (w) {
            const p = getUserByWallet(w);
            if (!p) break;
            chain.unshift(p);
            w = p.parentWallet;
        }
        return chain;
    }

    function isDescendantOf(ancestorId, nodeId) {
        if (nodeId === ancestorId) return true;
        const node = getUser(nodeId);
        if (!node) return false;
        let w = node.parentWallet;
        while (w) {
            const p = getUserByWallet(w);
            if (!p) return false;
            if (p.id === ancestorId) return true;
            w = p.parentWallet;
        }
        return false;
    }

    function childOnPathToFocus(user, focusId) {
        return (user.childIds || []).find(function (cid) {
            return cid === focusId || isDescendantOf(cid, focusId);
        });
    }

    function settleLabel(s) {
        return '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px]">正常结算</span>';
    }

    function resolveSubSettlementStatus(parent, child) {
        return 'normal';
    }

    function subPartnerRow(parent, child) {
        const gap = parent.ratio - child.ratio;
        const gapIncomeNum = gap > 0 ? 1250 : 0;
        return {
            id: child.id, time: child.bindTime, wallet: child.wallet, uid: child.uid, note: child.note,
            ratio: child.ratio, gap: gap, gapIncome: gapIncomeNum,
            vol: parseMoneyToNum(child.vol), deposit: parseMoneyToNum(child.deposit),
            activeUsers: child.usersActive, totalUsers: child.usersTotal,
            settlementStatus: 'normal'
        };
    }


    function mirrorEl(prefix, name) {
        return document.getElementById(prefix + '-' + name);
    }

    function renderPartnerSuperiorBar(u, prefix) {
        const superiorEl = mirrorEl(prefix, 'my-superior');
        const ratioEl = mirrorEl(prefix, 'my-ratio');
        if (ratioEl) ratioEl.textContent = u.ratio + '%';
        if (!superiorEl) return;
        if (!u.parentWallet || u.level === 1) {
            superiorEl.innerHTML = '<span class="text-blue-600 font-black">一级代理</span>';
        } else {
            const parent = getUserByWallet(u.parentWallet);
            superiorEl.innerHTML = chip(parent ? parent.uid : '', 'uid') +
                (parent ? '<span class="block text-[10px] text-slate-400 mt-1 font-bold">' +
                (parent.wallet ? chip(u.parentWallet, 'wallet') + ' · ' : '') + escHtml(parent.note) + '</span>' : '');
        }
    }

    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function matchUserSearch(row, q) {
        q = (q || '').toLowerCase();
        const hay = [row.uid, row.wallet, row.email, row.note, row.remark].filter(Boolean).join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
    }


    function renderPartnerMirrorMetrics(u, prefix, period) {
        const stats = getUserPeriodStats(u, period);
        const sc = PERIOD_SCALES[period] || 1;
        const volEl = mirrorEl(prefix, 'vol');
        if (volEl) volEl.textContent = formatStatMoney(stats.vol);
        const rebateEl = mirrorEl(prefix, 'rebate-total');
        if (rebateEl) rebateEl.textContent = formatStatMoney(stats.rebate, u.rebateTotal === '--');
        const selfN = parseMoneyToNum(u.rebateSelf === '--' ? 0 : u.rebateSelf) * sc;
        const directN = parseMoneyToNum(u.rebateDirect === '--' ? 0 : u.rebateDirect) * sc;
        const gapN = parseMoneyToNum(u.rebateGap === '--' ? 0 : u.rebateGap) * sc;
        const selfEl = mirrorEl(prefix, 'rebate-self');
        if (selfEl) selfEl.textContent = u.rebateSelf === '--' ? '--' : formatStatMoney(selfN);
        const directEl = mirrorEl(prefix, 'rebate-direct');
        if (directEl) directEl.textContent = u.rebateDirect === '--' ? '--' : formatStatMoney(directN);
        const gapEl = mirrorEl(prefix, 'rebate-gap');
        if (gapEl) gapEl.textContent = u.rebateGap === '--' ? '--' : formatStatMoney(gapN);
        const depN = parseMoneyToNum(u.deposit) * sc;
        const depEl = mirrorEl(prefix, 'deposit');
        if (depEl) depEl.textContent = fmtSignedMoney(depN);
        const activeUsers = Math.round(u.usersActive * Math.min(sc, 1.2));
        const activeEl = mirrorEl(prefix, 'users-active');
        if (activeEl) activeEl.innerHTML = activeUsers.toLocaleString() + ' <span class="text-base font-bold text-slate-600">交易用户</span>';
        const totalEl = mirrorEl(prefix, 'users-total');
        if (totalEl) totalEl.textContent = u.usersTotal.toLocaleString() + ' 总用户';
    }

    function mirrorSettlementStatusCell(row, scale) {
        return '<span class="text-[10px] text-slate-400">—</span>';
    }

    function mirrorGapIncomeCell(row, scale) {
        const gapIncome = row.gapIncome * scale;
        if (gapIncome) {
            return '<span class="font-black text-blue-600">' + fmtMoney(gapIncome) + '</span>';
        }
        return '<span class="font-black text-slate-400 italic">—</span>';
    }

    function mirrorPartnerUidCell(row, opts) {
        opts = opts || {};
        let html = chip(row.uid, 'uid');
        if (opts.level != null) {
            html += '<span class="block mt-0.5 text-[10px] font-bold text-slate-600">L' + opts.level + (opts.childCount != null ? ' · ' + opts.childCount + ' 直属' : '') + '</span>';
        }
        if (row.note) {
            html += '<span class="block text-[10px] text-slate-400 mt-0.5 font-bold">' + escHtml(row.note) + '</span>';
        } else if (row.remark) {
            html += '<span class="block text-[10px] text-slate-400 mt-0.5 font-bold">' + escHtml(row.remark) + '</span>';
        }
        return html;
    }

    function mirrorPartnerContactCell(row) {
        if (row.wallet) return chip(row.wallet, 'wallet');
        if (row.email) return '<span class="text-[10px] text-slate-500 font-bold">' + escHtml(row.email) + '</span>';
        return '<span class="text-slate-300">—</span>';
    }

    function mirrorWalletRemarkCell(row) {
        return mirrorPartnerUidCell(row) + '<span class="block mt-1">' + mirrorPartnerContactCell(row) + '</span>';
    }

    function mirrorUserScaleCell(activeUsers, totalUsers) {
        return '<span class="font-black">' + activeUsers.toLocaleString() + '</span>' +
            ' <span class="text-slate-300">/ ' + totalUsers.toLocaleString() + '</span>';
    }

    function userScaleHeaderHtml() {
        return '<span class="user-scale-hint-wrap">' +
            '<span class="user-scale-hint-label">用户规模</span>' +
            '<span class="user-scale-hint-pop" role="tooltip">' + USER_SCALE_TIP + '</span>' +
            '</span>';
    }

    function renderMirrorSubTable(parent, opts) {
        opts = opts || {};
        const prefix = opts.prefix || 'detail';
        const period = opts.period || 'ALL';
        const scale = PERIOD_SCALES[period] || 1;
        const filter = opts.subFilter || 'all';
        const search = (opts.search || '').toLowerCase();
        const page = opts.subPage || 1;
        const isDrill = opts.isDrill;

        const rows = getSubPartnerRows(parent);
        const filtered = rows.filter(function (r) {
            if (filter !== 'all' && r.settlementStatus !== filter) return false;
            if (!search) return true;
            return (r.wallet + r.note + r.uid).toLowerCase().indexOf(search) >= 0;
        });
        const sliced = paginate(filtered, page);
        if (opts.subPageKey === 'drill') drillSubPage = sliced.page;
        else detailSubPage = sliced.page;

        const headId = prefix + '-sub-partner-table-head';
        const tbodyId = prefix === 'detail' ? 'detail-sub-partners' : 'drill-sub-partners';
        const paginationId = prefix + '-sub-pagination';
        const thead = document.getElementById(headId);
        if (thead) {
            thead.innerHTML = '<tr>' +
                '<th class="px-4 py-3">加入时间</th>' +
                '<th class="px-3 py-3">下级合伙人</th>' +
                '<th class="px-3 py-3">钱包 / 邮箱</th>' +
                '<th class="px-3 py-3 text-center">设置比例</th>' +
                '<th class="px-3 py-3 text-center">上级级差</th>' +
                '<th class="px-3 py-3">结算状态</th>' +
                '<th class="px-3 py-3 text-right">贡献级差收入</th>' +
                '<th class="px-3 py-3 text-right">总交易额</th>' +
                '<th class="px-3 py-3 text-right">总净入金</th>' +
                '<th class="px-3 py-3 text-center">' + userScaleHeaderHtml() + '</th>' +
                '<th class="px-3 py-3 text-right">操作</th>' +
                '</tr>';
        }

        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = sliced.items.length ? sliced.items.map(function (row) {
            const activeUsers = Math.round(row.activeUsers * Math.min(scale, 1.2));
            const vol = row.vol * scale;
            const rowClass = '';
            const ratioClass = 'font-bold';
            const gapClass = 'text-blue-600 font-bold';
            const drillFn = isDrill ? 'PartnerPortal.openDrillTeam' : 'PartnerPortal.openDrillTeam';
            return '<tr class="' + rowClass + '">' +
                '<td class="px-4 py-2 text-slate-400">' + row.time + '</td>' +
                '<td class="px-3 py-2">' + mirrorPartnerUidCell(row) + '</td>' +
                '<td class="px-3 py-2">' + mirrorPartnerContactCell(row) + '</td>' +
                '<td class="px-3 py-2 text-center ' + ratioClass + '">' + row.ratio + '%</td>' +
                '<td class="px-3 py-2 text-center"><span class="' + gapClass + '">' + row.gap + '%</span></td>' +
                '<td class="px-3 py-2">' + mirrorSettlementStatusCell(row, scale) + '</td>' +
                '<td class="px-3 py-2 text-right">' + mirrorGapIncomeCell(row, scale) + '</td>' +
                '<td class="px-3 py-2 text-right font-bold">' + fmtMoney(vol) + '</td>' +
                '<td class="px-3 py-2 text-right font-bold text-green-600">' + fmtSignedMoney(row.deposit) + '</td>' +
                '<td class="px-3 py-2 text-center">' + mirrorUserScaleCell(activeUsers, row.totalUsers) + '</td>' +
                '<td class="px-3 py-2 text-right">' +
                '<button type="button" onclick="' + drillFn + '(\'' + row.id + '\')" class="text-blue-600 font-black hover:underline">查看团队</button>' +
                '</td></tr>';
        }).join('') : '<tr><td colspan="11" class="px-4 py-8 text-center text-slate-400">无直属下级合伙人</td></tr>';

        const pageKey = opts.subPageKey === 'drill' ? 'detail-drill-sub' : 'detail-sub';
        mountListPagination(paginationId, sliced.total, sliced.page, pageKey);
    }

    function renderMirrorClientTable(u, opts) {
        opts = opts || {};
        const prefix = opts.prefix || 'detail';
        const page = opts.clientPage || 1;
        const search = (opts.search || '').toLowerCase();
        const clients = u.directClients || [];
        const filtered = clients.filter(function (c) {
            if (!search) return true;
            return matchUserSearch(c, search);
        });
        const sliced = paginate(filtered, page);
        if (opts.clientPageKey === 'drill') drillClientPage = sliced.page;
        else detailClientPage = sliced.page;

        const headId = prefix + '-direct-client-table-head';
        const tbodyId = prefix === 'detail' ? 'detail-direct-clients' : 'drill-direct-clients';
        const paginationId = prefix + '-clients-pagination';
        const thead = document.getElementById(headId);
        if (thead) {
            thead.innerHTML = '<tr>' +
                '<th class="px-4 py-3">注册时间</th>' +
                '<th class="px-3 py-3">直客 UID</th>' +
                '<th class="px-3 py-3">钱包 / 邮箱</th>' +
                '<th class="px-3 py-3 text-right">累计交易额</th>' +
                '<th class="px-3 py-3 text-right">累计手续费</th>' +
                '<th class="px-3 py-3 text-right text-blue-600">返佣金额</th>' +
                '<th class="px-3 py-3 text-center">状态</th>' +
                '</tr>';
        }

        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = sliced.items.length ? sliced.items.map(function (c) {
            const uidCell = chip(c.uid, 'uid');
            const contactCell = mirrorPartnerContactCell(c);
            return '<tr><td class="px-4 py-2">' + c.time + '</td><td class="px-3 py-2">' + uidCell + '</td><td class="px-3 py-2">' + contactCell + '</td>' +
                '<td class="px-3 py-2 text-right">' + c.vol + '</td><td class="px-3 py-2 text-right">' + c.fee + '</td>' +
                '<td class="px-3 py-2 text-right font-black text-blue-600">' + c.rebate + '</td>' +
                '<td class="px-3 py-2 text-center text-green-600 font-bold">' + c.status + '</td></tr>';
        }).join('') : '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">暂无自邀直客</td></tr>';

        const pageKey = opts.clientPageKey === 'drill' ? 'detail-drill-clients' : 'detail-clients';
        mountListPagination(paginationId, sliced.total, sliced.page, pageKey);
    }

    function renderPartnerDetailMirror(u) {
        renderPartnerSuperiorBar(u, 'detail');
        renderPartnerMirrorMetrics(u, 'detail', detailStatsPeriod);
        renderMirrorSubTable(u, {
            prefix: 'detail', period: detailStatsPeriod, subFilter: detailSubFilter,
            search: detailTableFilter, subPage: detailSubPage, subPageKey: 'detail',
            clientPage: detailClientPage, clientPageKey: 'detail'
        });
        renderMirrorClientTable(u, {
            prefix: 'detail', search: detailTableFilter, clientPage: detailClientPage, clientPageKey: 'detail'
        });
    }

    function renderPartnerDrillMirror(u) {
        renderPartnerSuperiorBar(u, 'drill');
        renderPartnerMirrorMetrics(u, 'drill', drillStatsPeriod);
        renderMirrorSubTable(u, {
            prefix: 'drill', period: drillStatsPeriod, subFilter: drillSubFilter,
            search: drillSubSearch, subPage: drillSubPage, subPageKey: 'drill', isDrill: true,
            clientPage: drillClientPage, clientPageKey: 'drill'
        });
        renderMirrorClientTable(u, {
            prefix: 'drill', search: drillSubSearch, clientPage: drillClientPage, clientPageKey: 'drill'
        });
    }

    function getSubPartnerRows(u) {
        return (u.childIds || []).map(function (cid) {
            const c = getUser(cid);
            return c ? subPartnerRow(u, c) : null;
        }).filter(Boolean);
    }

    function matchesListFilter(u) {
        if (!listSearchQ) return true;
        const q = listSearchQ.toLowerCase();
        return (u.wallet + u.uid + u.note).toLowerCase().indexOf(q) !== -1;
    }

    function renderPartnerList() {
        const tbody = document.getElementById('partner-list-body');
        if (!tbody) return;
        let ids = LIST_IDS.filter(function (id) {
            const u = getUser(id);
            return u && matchesListFilter(u);
        });
        ids = sortListIds(ids);
        const sliced = paginate(ids, listPage);
        listPage = sliced.page;
        tbody.innerHTML = sliced.items.map(function (id) {
            const u = getUser(id);
            if (!u) return '';
            const stats = getUserPeriodStats(u, listStatsPeriod);
            const childCount = (u.childIds || []).length;
            const netDash = u.net === '--';
            return '<tr class="hover:bg-slate-50">' +
                '<td class="px-4 py-3">' + mirrorPartnerUidCell(u, { level: u.level, childCount: childCount }) +
                '<button type="button" onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="block mt-1 text-[10px] font-black text-blue-600 hover:underline">' + u.note + '</button></td>' +
                '<td class="px-3 py-3">' + mirrorPartnerContactCell(u) + '</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.ratio + '%</td>' +
                '<td class="px-3 py-3 text-center">' + settleLabel(u.settleStatus) + '</td>' +
                '<td class="px-3 py-3 text-right font-bold">' + formatStatMoney(stats.vol) + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-slate-700">' + formatStatMoney(stats.fee) + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-amber-700">' + formatStatMoney(stats.rebate, u.rebateTotal === '--') + '</td>' +
                '<td class="px-3 py-3 text-right font-black text-blue-600">' + formatStatMoney(stats.netIncome, netDash && listStatsPeriod === 'ALL') + '</td>' +
                '<td class="px-3 py-3 text-right font-bold text-green-600">' + u.deposit + '</td>' +
                '<td class="px-3 py-3 text-center font-black">' + u.usersActive + ' <span class="text-slate-300">/ ' + u.usersTotal + '</span></td>' +
                '<td class="px-3 py-3 text-slate-500">' + (u.level === 1 ? u.operator : '—') + '</td>' +
                '<td class="px-4 py-3 text-right space-x-2">' +
                '<button onclick="PartnerPortal.showDetail(\'' + u.id + '\')" class="text-slate-600 font-bold hover:underline">详情</button>' +
                '<button onclick="PartnerPortal.showTree(\'' + u.id + '\')" class="text-blue-600 font-bold hover:underline">返佣树</button>' +
                '</td></tr>';
        }).join('');
        updateListSortIcons();
        mountListPagination('partner-list-pagination', sliced.total, listPage, 'partner-list');
    }

    function sortListIds(ids) {
        if (!listSortKey) return ids;
        const period = listStatsPeriod;
        const dir = listSortDir === 'asc' ? 1 : -1;
        return ids.slice().sort(function (a, b) {
            const sa = getUserPeriodStats(getUser(a), period)[listSortKey] || 0;
            const sb = getUserPeriodStats(getUser(b), period)[listSortKey] || 0;
            return (sa - sb) * dir;
        });
    }

    function setListSort(key) {
        if (listSortKey === key) listSortDir = listSortDir === 'asc' ? 'desc' : 'asc';
        else { listSortKey = key; listSortDir = 'desc'; }
        listPage = 1;
        renderPartnerList();
    }

    function updateListSortIcons() {
        ['vol', 'fee', 'rebate', 'netIncome'].forEach(function (k) {
            const el = document.getElementById('list-sort-' + k);
            if (!el) return;
            if (listSortKey === k) el.textContent = listSortDir === 'asc' ? '↑' : '↓';
            else el.textContent = '';
        });
    }

    function updatePeriodTabUi(prefix, period) {
        document.querySelectorAll('.' + prefix + '-period-btn').forEach(function (btn) {
            const active = btn.getAttribute('data-period') === period;
            btn.className = prefix + '-period-btn px-3 py-1 rounded border text-[11px] font-bold' +
                (active ? ' bg-slate-900 text-white border-slate-900' : ' border-slate-200 text-slate-600 hover:bg-slate-50');
        });
    }

    function setListStatsPeriod(period) {
        listStatsPeriod = period || 'ALL';
        updatePeriodTabUi('list', listStatsPeriod);
        renderPartnerList();
    }

    function setDetailStatsPeriod(period) {
        detailStatsPeriod = period || 'ALL';
        updatePeriodTabUi('detail', detailStatsPeriod);
        const u = getUser(currentUserId);
        if (u) renderPartnerDetailMirror(u);
    }

    function refreshDetailMetrics(u) {
        renderPartnerDetailMirror(u);
    }

    function renderNodeCard(u, opts) {
        opts = opts || {};
        const pending = pendingRatioChanges.find(function (c) { return c.wallet === u.wallet; });
        const displayRatio = pending ? pending.newRatio : u.ratio;
        const highlight = opts.highlight ? ' ring-2 ring-amber-400' : '';
        const border = 'border-slate-200 bg-white';
        const focusCls = opts.isFocus ? ' tree-focus-ring' : '';
        let html = '<div id="tree-node-' + u.id + '" class="flex items-center gap-3 p-3 rounded-lg border ' + border + focusCls + highlight + ' shadow-sm min-w-[280px]">';
        html += '<span class="text-[10px] font-bold text-slate-400">L' + u.level + '</span>';
        html += '<div class="flex-1 min-w-0"><p class="font-black text-[11px]">' + chip(u.wallet, 'wallet') + '</p><p class="text-[10px] text-slate-500 mt-0.5">' + chip(u.uid, 'uid') + ' · ' + u.note + '</p></div>';
        html += '<input type="number" id="ratio-input-' + u.id + '" value="' + displayRatio + '" class="w-14 border rounded px-1 py-1 text-center font-black text-blue-600 text-sm" onchange="PartnerPortal.stageRatioChange(\'' + u.id + '\')"><span class="text-slate-400 font-bold">%</span>';
        if (opts.isFocus) html += '<span class="text-[9px] font-black text-blue-600 uppercase">当前</span>';
        html += '</div>';
        return html;
    }

    function renderExpandToggle(userId, expanded, childCount) {
        return '<button type="button" class="tree-expand-btn" onclick="PartnerPortal.toggleTreeExpand(\'' + userId + '\')" title="' + childCount + ' 个直属下级" aria-label="展开下级">' + (expanded ? '−' : '+') + '</button>';
    }

    /** 返佣树：对齐迁移树 — 主体固定 + 直接下级支路分页，定位不切换为单一路径 */
    function renderAncestorChainBar(u) {
        const chain = getAncestorChain(u);
        if (!chain.length && u.level === 1) return '';
        let html = '<p class="text-[10px] text-slate-500 mb-3 bg-white border border-slate-100 rounded p-2"><span class="font-bold text-slate-600">上级链：</span> ';
        chain.forEach(function (a, i) {
            html += chip(a.wallet, 'wallet');
            if (i < chain.length - 1) html += '<span class="text-slate-300 mx-1">→</span>';
        });
        if (chain.length) html += '<span class="text-slate-300 mx-1">→</span>';
        html += chip(u.wallet, 'wallet');
        html += '</p>';
        return html;
    }

    function renderTreeBranchNode(userId, depth) {
        const u = getUser(userId);
        if (!u) return '';
        const childIds = u.childIds || [];
        const hasKids = childIds.length > 0;
        const expanded = treeExpandedNodes.has(userId);
        let h = '<div class="tree-node-down mb-2">';
        h += '<div class="flex items-start gap-1">';
        h += hasKids ? renderExpandToggle(userId, expanded, childIds.length) : '<span class="w-6 shrink-0"></span>';
        h += '<div class="flex-1">' + renderNodeCard(u, { highlight: userId === treeHighlightId }) + '</div>';
        h += '</div>';
        if (hasKids && expanded) {
            h += '<div class="tree-children ml-4 mt-1 space-y-2">';
            childIds.forEach(function (cid) { h += renderTreeBranchNode(cid, depth + 1); });
            h += '</div>';
        }
        h += '</div>';
        return h;
    }

    function renderRebateTree(entryId) {
        const entry = getUser(entryId);
        if (!entry) return '';
        let html = renderAncestorChainBar(entry);
        html += '<div class="bg-slate-50 border rounded-lg p-3">';
        html += '<div class="flex items-start gap-1 mb-2">';
        html += '<span class="w-6 shrink-0"></span>';
        html += '<div class="flex-1">' + renderNodeCard(entry, {
            isFocus: true,
            highlight: entry.id === treeHighlightId
        }) + '</div></div>';
        const directIds = entry.childIds || [];
        const branchPag = paginate(directIds, treeBranchPage);
        treeBranchPage = branchPag.page;
        if (directIds.length) {
            html += '<div class="mt-3 border-t pt-3">';
            html += '<p class="text-[10px] font-bold text-slate-500 mb-2">直接下级支路（本页 ' + branchPag.items.length + ' / 总 ' + directIds.length + '）</p>';
            branchPag.items.forEach(function (cid) { html += renderTreeBranchNode(cid, 1); });
            html += '<div id="rebate-tree-branch-pagination"></div></div>';
        }
        html += '</div>';
        return html;
    }

    function refreshTree() {
        const root = document.getElementById('rebate-tree-root');
        if (!root || !treeEntryId) return;
        root.innerHTML = renderRebateTree(treeEntryId);
        const entry = getUser(treeEntryId);
        if (entry) {
            mountListPagination('rebate-tree-branch-pagination', (entry.childIds || []).length, treeBranchPage, 'rebate-tree-branches');
        }
        if (treeHighlightId) {
            const el = document.getElementById('tree-node-' + treeHighlightId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function locateInRebateTree(userId) {
        const user = getUser(userId);
        if (!user) return false;
        let entryId = treeEntryId || resolveTreeEntryId(userId);
        const entry = getUser(entryId);
        if (!entry || user.rootWallet !== entry.rootWallet) {
            entryId = resolveTreeEntryId(userId);
        } else if (userId !== entryId && !isDescendantOf(entryId, userId)) {
            entryId = resolveTreeEntryId(userId);
        }
        treeEntryId = entryId;
        const entryNow = getUser(treeEntryId);
        if (!entryNow) return false;
        treeFocusId = treeEntryId;
        treeHighlightId = userId;
        treeExpandedNodes = new Set();

        const path = [];
        let u = user;
        while (u && u.id !== entryNow.id) {
            path.unshift(u);
            u = u.parentWallet ? getUserByWallet(u.parentWallet) : null;
        }
        path.forEach(function (node, i) {
            if (i < path.length - 1 && (node.childIds || []).length) treeExpandedNodes.add(node.id);
        });
        if (path.length) {
            const directBranch = path[0];
            const siblings = entryNow.childIds || [];
            const idx = siblings.indexOf(directBranch.id);
            const pageSize = window.AdminPagination ? AdminPagination.PAGE_SIZE : 10;
            if (idx >= 0) treeBranchPage = Math.floor(idx / pageSize) + 1;
        }
        refreshTree();
        return true;
    }

    function focusTreeOnUser(userId) {
        return locateInRebateTree(userId);
    }

    function searchRebateTree() {
        const input = document.getElementById('tree-search-input');
        const q = input && input.value;
        const entry = getUser(treeEntryId);
        if (!q || !entry) return;
        const found = USERS.find(function (u) {
            return u.rootWallet === entry.rootWallet && matchWalletOrUid(q, u.wallet, u.uid);
        });
        if (!found) {
            alert('未在当前一级伞（' + entry.rootWallet + '）内找到匹配的钱包或 UID');
            return;
        }
        locateInRebateTree(found.id);
    }

    function setRebateTreeBranchPage(p) {
        treeBranchPage = Math.max(1, p);
        refreshTree();
    }

    function toggleTreeExpand(userId) {
        if (treeExpandedNodes.has(userId)) treeExpandedNodes.delete(userId);
        else treeExpandedNodes.add(userId);
        refreshTree();
    }

    function renderPendingChangesBar() {
        const bar = document.getElementById('tree-pending-bar');
        if (!bar) return;
        if (!pendingRatioChanges.length) {
            bar.classList.add('hidden');
            bar.innerHTML = '';
            return;
        }
        bar.classList.remove('hidden');
        bar.innerHTML = '<div class="bg-slate-900 text-white rounded-lg p-4 flex flex-wrap justify-between gap-4 mb-4">' +
            '<div><p class="font-black text-sm">待提交修改 (' + pendingRatioChanges.length + ')</p>' +
            '<ul class="text-[10px] mt-2 space-y-1">' +
            pendingRatioChanges.map(function (c) {
                const tag = c.newRatio > OPS_CAP ? '<span class="text-amber-300">[需审批]</span>' : '<span class="text-green-300">[即刻生效]</span>';
                return '<li>' + chip(c.wallet, 'wallet') + ' ' + c.oldRatio + '% → ' + c.newRatio + '% ' + tag + '</li>';
            }).join('') +
            '</ul></div>' +
            '<div class="flex gap-2">' +
            '<button onclick="PartnerPortal.clearPendingChanges()" class="px-4 py-2 border border-slate-600 rounded font-bold text-[11px]">清空</button>' +
            '<button onclick="PartnerPortal.openTreeConfirmModal()" class="px-6 py-2 bg-blue-600 rounded font-black text-[11px]">提交修改</button></div></div>';
    }


    function showDetail(id) {
        const u = getUser(id);
        if (!u) return;
        detailEntryId = id;
        detailDrillStack = [];
        currentUserId = id;
        detailTableFilter = '';
        detailSubFilter = 'all';
        detailSubPage = 1;
        detailClientPage = 1;
        detailStatsPeriod = listStatsPeriod;
        updatePeriodTabUi('detail', detailStatsPeriod);
        const searchEl = document.getElementById('detail-sub-search');
        if (searchEl) searchEl.value = '';
        const filterEl = document.getElementById('detail-sub-status-filter');
        if (filterEl) filterEl.value = 'all';
        window.PartnerPortal_showPage('page-partner-detail');
        document.getElementById('detail-partner-title').textContent = u.note;
        document.getElementById('detail-partner-sub').innerHTML = chip(u.wallet, 'wallet') + ' · ' + chip(u.uid, 'uid') + ' · L' + u.level + ' · ' + u.ratio + '%';

        renderPartnerDetailMirror(u);
        switchDetailTab('subs');
    }

    function showDetailDrill() {
        const u = getUser(currentUserId);
        if (!u) return;
        drillStatsPeriod = detailStatsPeriod;
        updatePeriodTabUi('drill', drillStatsPeriod);
        window.PartnerPortal_showPage('page-partner-detail-drill');
        const titleEl = document.getElementById('drill-partner-title');
        if (titleEl) titleEl.textContent = u.note + ' 的团队';
        const subEl = document.getElementById('drill-partner-sub');
        if (subEl) {
            subEl.innerHTML = chip(u.wallet, 'wallet') + ' · ' + chip(u.uid, 'uid') +
                ' · 加入 ' + u.bindTime + (detailDrillStack.length > 1 ? ' · 层级 ' + detailDrillStack.length : '');
        }
        renderPartnerDrillMirror(u);
        switchDrillTab('subs');
    }

    function openDrillTeam(childId) {
        if (!getUser(childId)) return;
        detailDrillStack.push(childId);
        currentUserId = childId;
        drillSubPage = 1;
        drillClientPage = 1;
        drillSubFilter = 'all';
        drillSubSearch = '';
        const searchEl = document.getElementById('drill-sub-search');
        if (searchEl) searchEl.value = '';
        const filterEl = document.getElementById('drill-sub-status-filter');
        if (filterEl) filterEl.value = 'all';
        showDetailDrill();
    }

    function detailDrillBack() {
        if (detailDrillStack.length > 1) {
            detailDrillStack.pop();
            currentUserId = detailDrillStack[detailDrillStack.length - 1];
            showDetailDrill();
        } else if (detailDrillStack.length === 1) {
            detailDrillStack = [];
            currentUserId = detailEntryId;
            showDetail(detailEntryId);
        } else if (detailEntryId) {
            showDetail(detailEntryId);
        } else {
            showList();
        }
    }

    function setDetailSubFilter(val) {
        detailSubFilter = val || 'all';
        detailSubPage = 1;
        const u = getUser(currentUserId);
        if (u) renderMirrorSubTable(u, {
            prefix: 'detail', period: detailStatsPeriod, subFilter: detailSubFilter,
            search: detailTableFilter, subPage: detailSubPage, subPageKey: 'detail'
        });
    }

    function setDrillStatsPeriod(period) {
        drillStatsPeriod = period || 'ALL';
        updatePeriodTabUi('drill', drillStatsPeriod);
        const u = getUser(currentUserId);
        if (u) renderPartnerDrillMirror(u);
    }

    function setDrillSubFilter(val) {
        drillSubFilter = val || 'all';
        drillSubPage = 1;
        const u = getUser(currentUserId);
        if (u) renderMirrorSubTable(u, {
            prefix: 'drill', period: drillStatsPeriod, subFilter: drillSubFilter,
            search: drillSubSearch, subPage: drillSubPage, subPageKey: 'drill', isDrill: true
        });
    }

    function setDrillSubSearch(val) {
        drillSubSearch = val || '';
        drillSubPage = 1;
        drillClientPage = 1;
        const u = getUser(currentUserId);
        if (u) renderPartnerDrillMirror(u);
    }

    function switchDrillTab(tab) {
        const subs = document.getElementById('drill-tab-subs');
        const clients = document.getElementById('drill-tab-clients');
        const tblSubs = document.getElementById('drill-table-subs');
        const tblClients = document.getElementById('drill-table-clients');
        if (tab === 'clients') {
            if (subs) subs.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            if (clients) clients.className = 'detail-tab-active pb-1 text-[11px]';
            if (tblSubs) tblSubs.classList.add('hidden');
            if (tblClients) tblClients.classList.remove('hidden');
        } else {
            if (clients) clients.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            if (subs) subs.className = 'detail-tab-active pb-1 text-[11px]';
            if (tblClients) tblClients.classList.add('hidden');
            if (tblSubs) tblSubs.classList.remove('hidden');
        }
    }

    function renderTeamTreeLine(line, partnerId) {
        const key = partnerId + '_' + line.id;
        const isOpen = teamTreeExpanded[key];
        let nodesHtml = '';
        if (isOpen) {
            nodesHtml = line.nodes.map(function (node, i) {
                const pad = 12 + i * 16;
                const walletLine = chip(node.wallet, 'wallet');
                const remarkLine = node.remark ? '<span class="block text-[10px] text-slate-500 font-bold mt-0.5">' + escHtml(node.remark) + '</span>' : '';
                const uidLine = node.uid ? '<span class="block text-[10px] text-slate-400">' + chip(node.uid, 'uid') + '</span>' : '';
                return '<div class="flex items-center gap-2 py-2 border-l-2 border-amber-200 ml-3" style="padding-left:' + pad + 'px">' +
                    '<div class="flex-1 min-w-0">' + walletLine + uidLine + remarkLine + '</div>' +
                    '<span class="text-[11px] font-black text-amber-700 shrink-0">' + escHtml(node.ratio) + '</span></div>';
            }).join('');
        }
        return '<div class="tree-line-panel border border-amber-100 rounded">' +
            '<div class="tree-line-header flex items-center justify-between px-4 py-3 hover:bg-amber-50/80 cursor-pointer" onclick="PartnerPortal.toggleTeamTreeLine(\'' + partnerId + '\', \'' + line.id + '\')">' +
            '<div class="min-w-0 flex-1"><p class="font-black text-amber-900 text-[11px]">' + escHtml(line.title) + '</p>' +
            '<p class="text-[10px] text-amber-700/80 font-medium mt-0.5 truncate max-w-[520px]">' + escHtml(line.summary) + '</p>' +
            (line.pausedVol ? '<p class="text-[10px] text-red-600 font-black mt-1">停止结算交易额 ' + fmtMoney(line.pausedVol) + '</p>' : '') +
            '</div>' +
            '<span class="text-[10px] font-black text-amber-600 shrink-0 ml-2">' + (isOpen ? '收起' : '展开') + '</span></div>' +
            (isOpen ? '<div class="tree-line-body px-2 pb-2">' + nodesHtml + '</div>' : '') +
            '</div>';
    }

    function renderTeamTreeModalBody(partnerId) {
        const body = document.getElementById('team-tree-modal-body');
        if (!body) return;
        body.innerHTML = '<p class="text-slate-400 text-center py-6">暂无团队树明细</p>';
    }

    function openTeamTreeModal(partnerId) {
        teamTreeModalPartnerId = partnerId;
        const child = getUser(partnerId);
        const subtitle = document.getElementById('team-tree-modal-subtitle');
        if (subtitle && child) {
            subtitle.innerHTML = chip(child.wallet, 'wallet');
        }
        teamTreeExpanded = {};
        renderTeamTreeModalBody(partnerId);
        document.getElementById('modal-team-tree').classList.remove('hidden');
    }

    function closeTeamTreeModal() {
        document.getElementById('modal-team-tree').classList.add('hidden');
    }

    function toggleTeamTreeLine(partnerId, lineId) {
        const key = partnerId + '_' + lineId;
        teamTreeExpanded[key] = !teamTreeExpanded[key];
        renderTeamTreeModalBody(partnerId);
    }

    function expandAllTeamTrees() {
        if (!teamTreeModalPartnerId) return;
        [].forEach(function (line) {
            teamTreeExpanded[teamTreeModalPartnerId + '_' + line.id] = true;
        });
        renderTeamTreeModalBody(teamTreeModalPartnerId);
    }

    function switchDetailTab(tab) {
        const subs = document.getElementById('detail-tab-subs');
        const clients = document.getElementById('detail-tab-clients');
        const tblSubs = document.getElementById('detail-table-subs');
        const tblClients = document.getElementById('detail-table-clients');
        if (tab === 'clients') {
            subs.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            clients.className = 'detail-tab-active pb-1 text-[11px]';
            tblSubs.classList.add('hidden');
            tblClients.classList.remove('hidden');
        } else {
            clients.className = 'text-slate-400 font-bold pb-1 text-[11px]';
            subs.className = 'detail-tab-active pb-1 text-[11px]';
            tblClients.classList.add('hidden');
            tblSubs.classList.remove('hidden');
        }
    }

    function filterDetailTable(q) {
        detailTableFilter = q || '';
        detailSubPage = 1;
        detailClientPage = 1;
        const u = getUser(currentUserId);
        if (u) renderPartnerDetailMirror(u);
    }

    function resolveTreeEntryId(userId) {
        const u = getUser(userId);
        if (!u) return userId;
        const chain = getAncestorChain(u);
        if (chain.length) return chain[0].id;
        if (u.level === 1) return u.id;
        const l1 = USERS.find(function (x) { return x.wallet === u.rootWallet && x.level === 1; });
        return l1 ? l1.id : userId;
    }

    function showTree(id) {
        const u = getUser(id);
        if (!u) return;
        currentUserId = id;
        treeEntryId = resolveTreeEntryId(id);
        treeFocusId = treeEntryId;
        treeHighlightId = null;
        treeBranchPage = 1;
        treeExpandedNodes = new Set();
        window.PartnerPortal_showPage('page-rebate-tree');
        const entry = getUser(treeEntryId);
        const titleSuffix = entry && entry.id !== u.id ? u.note + ' · ' + entry.note : (entry ? entry.note : u.note);
        document.getElementById('tree-title').textContent = titleSuffix + ' · 返佣树';
        refreshTree();
        if (id !== treeEntryId) locateInRebateTree(id);
        renderPendingChangesBar();
        if (location.hash.indexOf('rebate-tree') === -1) location.hash = 'rebate-tree';
    }


    function showList() {
        currentUserId = null;
        window.PartnerPortal_showPage('page-agent-mgmt');
    }

    function setListFilter(status) {
        listFilterStatus = status;
        listPage = 1;
        const sel = document.getElementById('list-status-select');
        if (sel) sel.value = status;
        renderPartnerList();
    }

    function applyListSearch(q) {
        listSearchQ = (q || '').trim();
        listPage = 1;
        renderPartnerList();
    }

    function stageRatioChange(userId) {
        const u = getUser(userId);
        const input = document.getElementById('ratio-input-' + userId);
        if (!u || !input) return;
        const newRatio = parseFloat(input.value);
        if (!newRatio || newRatio <= 0) return;
        const idx = pendingRatioChanges.findIndex(function (c) { return c.wallet === u.wallet; });
        const entry = { wallet: u.wallet, oldRatio: u.ratio, newRatio: newRatio, userId: userId };
        if (idx >= 0) pendingRatioChanges[idx] = entry;
        else pendingRatioChanges.push(entry);
        if (newRatio < u.ratio && (u.childIds || []).length) {
            const names = u.childIds.map(function (cid) {
                const c = getUser(cid);
                return c ? c.wallet + '(' + c.ratio + '%)' : '';
            }).filter(Boolean).join('、');
            alert('下调提示：请确认直属下级级差 — ' + names);
        }
        renderPendingChangesBar();
    }

    function clearPendingChanges() {
        pendingRatioChanges = [];
        refreshTree();
        renderPendingChangesBar();
    }

    function openTreeConfirmModal() {
        if (!pendingRatioChanges.length) return;
        const body = document.getElementById('tree-confirm-body');
        const remarkEl = document.getElementById('tree-confirm-remark');
        if (remarkEl) remarkEl.value = '';
        treeAttachments = [];
        renderTreeAttachmentPreview();
        const fileEl = document.getElementById('tree-attachment-input');
        if (fileEl) fileEl.value = '';
        if (!body) { submitPendingChanges(true); return; }
        const within = pendingRatioChanges.filter(function (c) { return c.newRatio <= OPS_CAP; });
        const exceed = pendingRatioChanges.filter(function (c) { return c.newRatio > OPS_CAP; });
        let html = '<ul class="text-[11px] space-y-2 mb-4">';
        pendingRatioChanges.forEach(function (c) {
            const tag = c.newRatio > OPS_CAP
                ? '<span class="text-amber-700 font-bold">超权限 · 提交审批</span>'
                : '<span class="text-green-700 font-bold">权限内 · 即刻生效</span>';
            html += '<li class="border-b border-slate-100 pb-2">' + chip(c.wallet, 'wallet') + '：' + c.oldRatio + '% → <b>' + c.newRatio + '%</b> <span class="block text-[10px] mt-0.5">' + tag + '</span></li>';
        });
        html += '</ul>';
        if (within.length && exceed.length) {
            html += '<p class="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded p-3">' +
                '<b>存在超上限调整：</b>仅超上限项将进入审批流程；<b>' + within.length + '</b> 项权限内修改将被<strong>自动放弃</strong>，不会生效。请先处理超上限申请。</p>';
        } else if (exceed.length) {
            html += '<p class="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded p-3">全部修改均超过运营权限上限 ' + OPS_CAP + '%，提交后将进入审批流程。</p>';
        } else {
            html += '<p class="text-[11px] text-green-800 bg-green-50 border border-green-100 rounded p-3">全部修改在权限内，确认后将<strong>即刻生效</strong>。</p>';
        }
        body.innerHTML = html;
        document.getElementById('modal-tree-confirm').classList.remove('hidden');
    }

    function closeTreeConfirmModal() {
        const modal = document.getElementById('modal-tree-confirm');
        if (modal) modal.classList.add('hidden');
        const remarkEl = document.getElementById('tree-confirm-remark');
        if (remarkEl) remarkEl.value = '';
        treeAttachments = [];
        renderTreeAttachmentPreview();
        const fileEl = document.getElementById('tree-attachment-input');
        if (fileEl) fileEl.value = '';
    }

    function renderTreeAttachmentPreview() {
        const el = document.getElementById('tree-attachment-preview');
        if (!el) return;
        if (!treeAttachments.length) {
            el.innerHTML = '';
            return;
        }
        el.innerHTML = treeAttachments.map(function (a, i) {
            return '<div class="relative group border rounded overflow-hidden w-16 h-16 bg-white">' +
                '<img src="' + a.dataUrl + '" alt="' + a.name + '" class="w-full h-full object-cover">' +
                '<button type="button" onclick="PartnerPortal.removeTreeAttachment(' + i + ')" class="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 leading-none opacity-90">×</button>' +
                '<span class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 truncate">' + a.name + '</span></div>';
        }).join('');
    }

    function handleTreeAttachmentFiles(input) {
        if (!input || !input.files) return;
        const files = Array.from(input.files);
        const remain = 4 - treeAttachments.length;
        if (remain <= 0) {
            alert('最多上传 4 张图片');
            input.value = '';
            return;
        }
        const toAdd = files.slice(0, remain);
        if (files.length > remain) alert('最多上传 4 张图片，已忽略超出部分');
        let pending = toAdd.length;
        if (!pending) {
            input.value = '';
            return;
        }
        toAdd.forEach(function (file) {
            if (!file.type || file.type.indexOf('image/') !== 0) {
                pending--;
                if (pending === 0) input.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (ev) {
                treeAttachments.push({ name: file.name, dataUrl: ev.target.result });
                renderTreeAttachmentPreview();
                pending--;
                if (pending === 0) input.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    function removeTreeAttachment(index) {
        treeAttachments.splice(index, 1);
        renderTreeAttachmentPreview();
        const fileEl = document.getElementById('tree-attachment-input');
        if (fileEl) fileEl.value = '';
    }

    function confirmTreeSubmit() {
        submitPendingChanges(true);
    }

    function revertTreeRatioInputs(changes) {
        (changes || []).forEach(function (c) {
            const u = getUser(c.userId);
            const input = document.getElementById('ratio-input-' + c.userId);
            if (u && input) input.value = u.ratio;
        });
    }

    function submitPendingChanges(skipModal) {
        if (!pendingRatioChanges.length) return;
        if (!skipModal) {
            openTreeConfirmModal();
            return;
        }
        const remarkEl = document.getElementById('tree-confirm-remark');
        const changeRemark = remarkEl ? remarkEl.value.trim() : '';
        if (!changeRemark) {
            alert('请填写修改原因备注');
            return;
        }
        closeTreeConfirmModal();
        const within = pendingRatioChanges.filter(function (c) { return c.newRatio <= OPS_CAP; });
        const exceed = pendingRatioChanges.filter(function (c) { return c.newRatio > OPS_CAP; });
        const hasBoth = within.length && exceed.length;

        if (hasBoth) {
            if (!confirm('存在超上限调整：仅超上限项将进入审批，' + within.length + ' 项权限内修改将被系统放弃。确认继续？')) return;
        } else if (within.some(function (c) { return c.newRatio < c.oldRatio; }) &&
            !confirm('含下调比例，可能触发分支异常。确认继续？')) return;

        if (!hasBoth && within.length) {
            within.forEach(function (c) {
                const u = getUser(c.userId);
                if (u) u.ratio = c.newRatio;
            });
        } else if (hasBoth) {
            revertTreeRatioInputs(within);
        }

        if (exceed.length && typeof submitApprovalApplication === 'function') {
            const attachmentNames = treeAttachments.map(function (a) { return a.name; });
            const attachmentPreviews = {};
            treeAttachments.forEach(function (a) { attachmentPreviews[a.name] = a.dataUrl; });
            exceed.forEach(function (c) {
                const u = getUser(c.userId);
                submitApprovalApplication({
                    type: 'partner_ratio_change',
                    title: '返佣比例调整（超出上限）',
                    flowProfile: 'risk_boss',
                    applicant: 'Mkt_Allen',
                    remark: changeRemark,
                    summary: chip(c.wallet, 'wallet') + ' ' + c.oldRatio + '% → ' + c.newRatio + '%',
                    payload: {
                        wallet: c.wallet,
                        uid: u ? (u.uid || '—') : '—',
                        oldRatio: c.oldRatio,
                        newRatio: c.newRatio,
                        opsCap: OPS_CAP,
                        exceedsCap: true,
                        changeRemark: changeRemark,
                        attachments: attachmentNames,
                        attachmentPreviews: attachmentPreviews
                    }
                });
            });
        }

        let msg = '';
        if (hasBoth) {
            msg = '已提交 ' + exceed.length + ' 项超上限审批；' + within.length + ' 项权限内修改已放弃。';
        } else {
            if (within.length) msg += within.length + ' 项已即刻生效。';
            if (exceed.length) msg += exceed.length + ' 项已提交审批，审批通过后将即刻生效。';
        }
        alert(msg || '已提交');
        pendingRatioChanges = [];
        refreshTree();
        renderPendingChangesBar();
        if (currentUserId) {
            const u = getUser(currentUserId);
            if (u && document.getElementById('page-partner-detail') && !document.getElementById('page-partner-detail').classList.contains('hidden')) {
                renderPartnerDetailMirror(u);
            }
            if (u && document.getElementById('page-partner-detail-drill') && !document.getElementById('page-partner-detail-drill').classList.contains('hidden')) {
                renderPartnerDrillMirror(u);
            }
        }
    }

    function openBindModal() {
        bindState = { preview: null };
        document.getElementById('bind-wallet').value = '';
        document.getElementById('bind-ratio').value = '';
        document.getElementById('bind-remark').value = '';
        bindAttachments = [];
        renderBindAttachmentPreview();
        const fileEl = document.getElementById('bind-attachment-input');
        if (fileEl) fileEl.value = '';
        document.getElementById('bind-cap-hint').textContent = '支持将普通用户 / 合伙人直客 / N 级代理升级为一级；配置上限 ' + OPS_CAP + '%，超过须风控+老板审批';
        const card = document.getElementById('bind-subject-card');
        const preview = document.getElementById('bind-preview-section');
        if (card) card.classList.add('hidden');
        if (preview) preview.classList.add('hidden');
        const submitBtn = document.querySelector('#modal-bind-partner button[onclick="PartnerPortal.submitBindPartner()"]');
        if (submitBtn) submitBtn.disabled = false;
        document.getElementById('modal-bind-partner').classList.remove('hidden');
    }

    function closeBindModal() { document.getElementById('modal-bind-partner').classList.add('hidden'); }

    function renderBindAttachmentPreview() {
        const el = document.getElementById('bind-attachment-preview');
        if (!el) return;
        if (!bindAttachments.length) {
            el.innerHTML = '';
            return;
        }
        el.innerHTML = bindAttachments.map(function (a, i) {
            return '<div class="relative group border rounded overflow-hidden w-16 h-16 bg-white">' +
                '<img src="' + a.dataUrl + '" alt="' + a.name + '" class="w-full h-full object-cover">' +
                '<button type="button" onclick="PartnerPortal.removeBindAttachment(' + i + ')" class="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 leading-none opacity-90">×</button>' +
                '<span class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 truncate">' + a.name + '</span></div>';
        }).join('');
    }

    function handleBindAttachmentFiles(input) {
        if (!input || !input.files) return;
        const files = Array.from(input.files);
        const remain = 4 - bindAttachments.length;
        if (remain <= 0) {
            alert('最多上传 4 张图片');
            input.value = '';
            return;
        }
        const toAdd = files.slice(0, remain);
        if (files.length > remain) alert('最多上传 4 张图片，已忽略超出部分');
        let pending = toAdd.length;
        if (!pending) {
            input.value = '';
            return;
        }
        toAdd.forEach(function (file) {
            if (!file.type || file.type.indexOf('image/') !== 0) {
                pending--;
                if (pending === 0) input.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (ev) {
                bindAttachments.push({ name: file.name, dataUrl: ev.target.result });
                renderBindAttachmentPreview();
                pending--;
                if (pending === 0) input.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    function removeBindAttachment(index) {
        bindAttachments.splice(index, 1);
        renderBindAttachmentPreview();
        const fileEl = document.getElementById('bind-attachment-input');
        if (fileEl) fileEl.value = '';
    }

    function submitBindPartner() {
        const walletInput = document.getElementById('bind-wallet').value.trim();
        const ratio = parseFloat(document.getElementById('bind-ratio').value);
        const remark = document.getElementById('bind-remark').value.trim();
        if (!walletInput || !ratio || !remark) { alert('请填写完整信息'); return; }
        previewBindPartner();
        const subject = bindState.preview;
        if (subject && subject.kind === 'already_l1') {
            alert('该用户已是一级代理');
            return;
        }
        if (!subject) {
            if (!confirm('未识别到演示身份，将按新 UID 绑定一级（演示）。继续？')) return;
        }
        const isUid = /^\d+$/.test(walletInput);
        const uid = isUid ? walletInput : (subject && subject.user.uid) || '';
        const wallet = isUid ? (subject && subject.user.wallet) || '—' : walletInput;
        const exceedsCap = ratio > OPS_CAP;
        const attachmentNames = bindAttachments.map(function (a) { return a.name; });
        const attachmentPreviews = {};
        bindAttachments.forEach(function (a) { attachmentPreviews[a.name] = a.dataUrl; });
        const subjectKind = subject ? subject.kind : 'unknown';
        const payloadBase = {
            uid: uid || '—', wallet: wallet, ratio: ratio, opsCap: OPS_CAP, exceedsCap: exceedsCap,
            subjectKind: subjectKind,
            subjectLabel: subject ? subject.identityLabel : '未识别',
            upgradeScope: subjectKind === 'partner_n' ? '整伞返佣树' : (subjectKind === 'plain' || subjectKind === 'direct_client' ? '直客一并迁移' : '—'),
            directClientCount: subject ? (subject.directClients || []).length : 0,
            treeNodeCount: subject ? subject.treeNodes || 0 : 0,
            attachments: attachmentNames,
            attachmentPreviews: attachmentPreviews
        };
        if (exceedsCap && typeof submitApprovalApplication === 'function') {
            submitApprovalApplication({
                type: 'partner_l1_bind', title: '一级合伙人绑定', applicant: 'Mkt_Allen', remark: remark,
                summary: (subject ? subject.identityLabel + ' · ' : '') + (uid ? 'UID ' + uid + ' · ' : wallet + ' · ') + ratio + '%',
                payload: payloadBase
            });
            alert('已提交审批，审批通过后将即刻生效（演示）');
        } else {
            applyL1BindPayload(payloadBase);
            alert('升级成功，已即刻生效（演示）' + (attachmentNames.length ? '，已附 ' + attachmentNames.length + ' 张图片' : ''));
        }
        closeBindModal();
    }

    function findUserByWalletOrUid(wallet, uid) {
        return USERS.find(function (u) {
            return (wallet && wallet !== '—' && u.wallet === wallet) || (uid && uid !== '—' && u.uid === uid);
        });
    }

    function applyL1BindPayload(p) {
        if (!p) return;
        const wallet = p.wallet && p.wallet !== '—' ? p.wallet : ('0xBind...' + String(p.uid || 'new').slice(-4));
        let u = findUserByWalletOrUid(p.wallet, p.uid);
        if (u) {
            u.ratio = p.ratio;
            if (u.level !== 1) {
                u.level = 1;
                u.parentWallet = null;
                u.rootWallet = u.wallet;
            }
        } else {
            USERS.push({
                id: 'p_bind_' + Date.now(),
                wallet: wallet,
                uid: p.uid || '—',
                note: '绑定·一级合伙人',
                level: 1,
                ratio: p.ratio,
                parentWallet: null,
                rootWallet: wallet,
                operator: 'allen@forx.fi',
                bindTime: new Date().toISOString().slice(0, 10),
                settleStatus: 'normal',
                vol: '$0', deposit: '+$0', usersTotal: 0, usersActive: 0,
                net: '$0', netHint: '', rebateTotal: '$0', rebateSelf: '$0', rebateDirect: '$0', rebateGap: '$0',
                activeSubPartners: 0, totalSubPartners: 0, childIds: [], directClients: [], settlements: []
            });
        }
        renderPartnerList();
        refreshTree();
    }

    function applyPartnerApprovalEffect(app) {
        if (!app || app.status !== 'approved') return;
        const p = app.payload || {};
        if (app.type === 'partner_ratio_change') {
            const u = findUserByWalletOrUid(p.wallet, p.uid);
            if (u && p.newRatio != null) {
                u.ratio = p.newRatio;
                refreshTree();
                renderPartnerList();
                if (currentUserId) {
                    const cu = getUser(currentUserId);
                    if (cu && document.getElementById('page-partner-detail') && !document.getElementById('page-partner-detail').classList.contains('hidden')) {
                        renderPartnerDetailMirror(cu);
                    }
                    if (cu && document.getElementById('page-partner-detail-drill') && !document.getElementById('page-partner-detail-drill').classList.contains('hidden')) {
                        renderPartnerDrillMirror(cu);
                    }
                }
            }
        } else if (app.type === 'partner_l1_bind') {
            applyL1BindPayload(p);
        }
    }

    function getBatchRows(date) {
        return SETTLEMENT_BATCH_DETAILS[date] || [];
    }

    function getSupplementsForBatch(date) {
        return REBATE_SUPPLEMENT_FLOWS.filter(function (f) { return f.payoutDate === date; });
    }

    function getSupplementTotalForBatch(date) {
        return getSupplementsForBatch(date).reduce(function (s, f) { return s + f.amount; }, 0);
    }

    function getTodayPayoutForBatch(date) {
        return getBatchRows(date).reduce(function (s, r) { return s + (r.actualRebate || 0); }, 0);
    }

    function enrichBatch(b) {
        const supplement = getSupplementTotalForBatch(b.date);
        const today = getTodayPayoutForBatch(b.date);
        return {
            date: b.date, vol: b.vol, status: b.status, rejected: b.rejected,
            supplementPayout: supplement, todayPayout: today, totalPayout: supplement + today
        };
    }

    function isRowModified(r) {
        return r.actualRebate != r.originalRebate;
    }

    function matchPartnerQuery(row, q) {
        if (!q) return true;
        const s = q.toLowerCase();
        return row.wallet.toLowerCase().indexOf(s) >= 0 || String(row.uid).indexOf(s) >= 0;
    }

    function findBatchRowByWalletOrUid(key) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return null;
        const rows = getBatchRows(currentBatchDate);
        return rows.find(function (r) {
            return r.wallet.toLowerCase() === q || r.uid === key.trim() ||
                r.wallet.toLowerCase().indexOf(q) >= 0 || q.indexOf(r.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function switchSettlementDetailTab(tab) {
        settlementDetailTab = tab;
        const tabDetail = document.getElementById('settlement-tab-detail');
        const tabSup = document.getElementById('settlement-tab-supplement');
        const filtersDetail = document.getElementById('settlement-detail-filters');
        const filtersSup = document.getElementById('settlement-supplement-filters');
        const wrapDetail = document.getElementById('settlement-table-wrap');
        const wrapSup = document.getElementById('settlement-supplement-table-wrap');
        if (tabDetail) tabDetail.className = tab === 'detail' ? 'settlement-tab-active pb-2 text-[11px] font-black' : 'text-slate-400 font-bold pb-2 text-[11px]';
        if (tabSup) tabSup.className = tab === 'supplement' ? 'settlement-tab-active pb-2 text-[11px] font-black' : 'text-slate-400 font-bold pb-2 text-[11px]';
        if (filtersDetail) filtersDetail.classList.toggle('hidden', tab !== 'detail');
        if (filtersSup) filtersSup.classList.toggle('hidden', tab !== 'supplement');
        if (wrapDetail) wrapDetail.classList.toggle('hidden', tab !== 'detail');
        if (wrapSup) wrapSup.classList.toggle('hidden', tab !== 'supplement');
        if (tab === 'detail') renderSettlementDetailRows();
        else renderSettlementSupplementRows();
    }

    function applySettlementDetailFilters() {
        settlementDetailFilters.partner = (document.getElementById('settlement-filter-partner') && document.getElementById('settlement-filter-partner').value || '').trim();
        settlementDetailFilters.level = document.getElementById('settlement-filter-level') ? document.getElementById('settlement-filter-level').value : 'all';
        settlementDetailFilters.modified = document.getElementById('settlement-filter-modified') ? document.getElementById('settlement-filter-modified').value : 'all';
        settlementDetailPage = 1;
        renderSettlementDetailRows();
    }

    function applySupplementDetailFilters() {
        supplementDetailFilters.partner = (document.getElementById('supplement-filter-partner') && document.getElementById('supplement-filter-partner').value || '').trim();
        supplementDetailFilters.originalDate = (document.getElementById('supplement-filter-original-date') && document.getElementById('supplement-filter-original-date').value || '').trim();
        supplementDetailPage = 1;
        renderSettlementSupplementRows();
    }

    function resetSettlementDetailFilters() {
        settlementDetailFilters = { partner: '', level: 'all', modified: 'all' };
        settlementDetailPage = 1;
        const p = document.getElementById('settlement-filter-partner');
        if (p) p.value = '';
        const l = document.getElementById('settlement-filter-level');
        if (l) l.value = 'all';
        const m = document.getElementById('settlement-filter-modified');
        if (m) m.value = 'all';
        renderSettlementDetailRows();
    }

    function resetSupplementDetailFilters() {
        supplementDetailFilters = { partner: '', originalDate: '' };
        supplementDetailPage = 1;
        const p = document.getElementById('supplement-filter-partner');
        if (p) p.value = '';
        const d = document.getElementById('supplement-filter-original-date');
        if (d) d.value = '';
        renderSettlementSupplementRows();
    }

    function renderSettlementDetailRows() {
        const tbody = document.getElementById('settlement-detail-body');
        if (!tbody || !currentBatchDate) return;
        const rows = getBatchRows(currentBatchDate).filter(function (r) {
            if (!matchPartnerQuery(r, settlementDetailFilters.partner)) return false;
            if (settlementDetailFilters.level !== 'all' && String(r.level) !== settlementDetailFilters.level) return false;
            if (settlementDetailFilters.modified === 'yes' && !isRowModified(r)) return false;
            if (settlementDetailFilters.modified === 'no' && isRowModified(r)) return false;
            return true;
        });
        const sliced = paginate(rows, settlementDetailPage);
        settlementDetailPage = sliced.page;
        tbody.innerHTML = sliced.items.length ? sliced.items.map(function (r) {
            const parentCell = r.parentWallet ? chip(r.parentWallet, 'wallet') : '<span class="text-slate-500">一级</span>';
            const origCell = '<span class="font-bold">' + fmtMoney(r.originalRebate) + '</span>';
            const actualCell = '<span class="text-blue-600 font-black">' + fmtMoney(r.actualRebate) + '</span>' +
                (isRowModified(r) ? '<span class="block text-[9px] text-orange-600 font-bold mt-0.5">已调减</span>' : '');
            const editBtn = '<button type="button" onclick="PartnerPortal.openEditActual(\'' + r.id + '\')" class="text-blue-600 font-bold hover:underline text-[10px]">修改</button>';
            return '<tr class="hover:bg-slate-50">' +
                '<td class="px-4 py-4"><div class="font-bold">' + chip(r.wallet, 'wallet') + '</div><div class="mt-1">' + chip(r.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-4 text-center font-bold">L' + r.level + '</td>' +
                '<td class="px-4 py-4 text-center font-black">' + r.ratio + '%</td>' +
                '<td class="px-4 py-4 text-center">' + parentCell + '</td>' +
                '<td class="px-4 py-4 text-right font-bold">' + r.vol + '</td>' +
                '<td class="px-4 py-4 text-right">' + origCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + actualCell + '</td>' +
                '<td class="px-4 py-4 text-right">' + editBtn + '</td></tr>';
        }).join('') : '<tr><td colspan="8" class="px-4 py-8 text-center text-slate-400">无匹配记录</td></tr>';
        mountListPagination('settlement-detail-pagination', sliced.total, settlementDetailPage, 'settlement-detail');
    }


    function parseVolToNumber(volStr) {
        if (!volStr) return 0;
        let s = String(volStr).replace(/[$,\s]/g, '');
        let mult = 1;
        if (/k$/i.test(s)) {
            mult = 1000;
            s = s.replace(/k$/i, '');
        } else if (/m$/i.test(s)) {
            mult = 1000000;
            s = s.replace(/m$/i, '');
        }
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n * mult;
    }

    function buildSettlementCsvExports(batchDate) {
        const batch = SETTLEMENT_BATCHES.find(function (b) { return b.date === batchDate; });
        const rows = getBatchRows(batchDate);
        const volNum = batch ? parseVolToNumber(batch.vol) : 0;
        const netFee = volNum * 0.01;
        const totalPayout = rows.reduce(function (s, r) {
            return s + (r.originalRebate || 0);
        }, 0);
        const payablePayout = getTodayPayoutForBatch(batchDate);
        const periodStart = batchDate + ' 00:00:00';
        const periodEnd = batchDate + ' 23:59:59';
        const platformRetain = netFee - totalPayout;
        const ratioPct = netFee > 0 ? ((totalPayout / netFee) * 100).toFixed(4) : '0';

        const table1Headers = [
            '结算日期', '计算周期开始', '计算周期结束', '平台总成交额(USDT)', '全站可参与返佣手续费_NetFee(USDT)',
            '全站返佣总预算_TotalPayout(USDT)', '返佣手续费占比(%)', '平台留存收入(USDT)', '本批次可发放实发合计(USDT)'
        ];
        const table1Rows = [[
            batchDate, periodStart, periodEnd,
            volNum.toFixed(2), netFee.toFixed(2), totalPayout.toFixed(2),
            ratioPct, platformRetain.toFixed(2), payablePayout.toFixed(2)
        ]];

        const table2Headers = [
            '结算日期', '用户地址', '直接上级地址', '顶级一级代理地址', '用户当前等级', '用户返佣比例(%)',
            '上级返佣比例(%)', '级差空间(%)', '配置状态', '完整路径'
        ];
        const table2Rows = [];
        rows.forEach(function (r) {
            const parent = r.parentWallet ? USERS.find(function (u) { return u.wallet === r.parentWallet; }) : null;
            const rootWallet = parent ? parent.rootWallet : r.wallet;
            const parentRatio = parent ? parent.ratio : '—';
            const gap = parent ? (parent.ratio - r.ratio) : '—';
            const status = '正常';
            table2Rows.push([
                batchDate, r.wallet, r.parentWallet || '—', rootWallet || r.wallet,
                r.level, r.ratio, parentRatio, gap, status, (rootWallet || r.wallet) + ' / ' + r.wallet
            ]);
        });

        const l1Map = {};
        rows.forEach(function (r) {
            const u = USERS.find(function (x) { return x.wallet === r.wallet; });
            const rootWallet = u ? u.rootWallet : r.wallet;
            const l1 = USERS.find(function (x) { return x.wallet === rootWallet && x.level === 1; }) ||
                USERS.find(function (x) { return x.wallet === r.wallet && x.level === 1; });
            if (!l1) return;
            if (!l1Map[l1.wallet]) {
                l1Map[l1.wallet] = { l1: l1, netFee: 0 };
            }
            const vol = parseVolToNumber(r.vol);
            l1Map[l1.wallet].netFee += vol * 0.01;
        });
        const table2aHeaders = [
            '结算日期', '一级合伙人地址', '一级合伙人UID', '一级返佣比例(%)',
            '所属一级下伞内净手续费_NetFee(USDT)', '一级理论最大原始应发佣金(USDT)', '备注'
        ];
        const table2aRows = Object.keys(l1Map).map(function (w) {
            const item = l1Map[w];
            const maxPayout = item.netFee * (item.l1.ratio / 100);
            return [
                batchDate, item.l1.wallet, item.l1.uid, item.l1.ratio,
                item.netFee.toFixed(2), maxPayout.toFixed(2), ''
            ];
        });

        const table3Headers = [
            '结算日期', '源_产生交易用户地址', '源_该用户期间成交额(USDT)', '源_该用户产生手续费_NetFee(USDT)',
            '源_该用户的上级地址', '源_该用户的顶级一级代理', '分_佣金获得者地址', '分_分账角色类型',
            '分_分账级差比例(%)', '分_最终分账金额(USDT)', '分账状态'
        ];
        const table3Rows = [];
        rows.forEach(function (r) {
            const vol = parseVolToNumber(r.vol);
            const fee = vol * 0.01;
            const u = USERS.find(function (x) { return x.wallet === r.wallet; });
            const rootWallet = u ? u.rootWallet : r.wallet;
            table3Rows.push([
                    batchDate, r.wallet, vol.toFixed(2), fee.toFixed(2),
                    r.parentWallet || '—', rootWallet, r.wallet, 'SELF',
                    r.ratio, (r.originalRebate || 0).toFixed(2), '正常'
                ]);
        });

        const table4Headers = [
            '结算日期', '代理地址', '所属顶级代理(Root)', '代理等级', '待结算返佣总额(USDT)',
            '人工调减金额(USDT)', '最终实发金额(USDT)'
        ];
        const table4Rows = rows.map(function (r) {
            const u = USERS.find(function (x) { return x.wallet === r.wallet; });
            const rootWallet = u ? u.rootWallet : r.wallet;
            const adjust = (r.originalRebate || 0) - (r.actualRebate || 0);
            return [
                batchDate, r.wallet, rootWallet, r.level,
                (r.originalRebate || 0).toFixed(2),
                adjust.toFixed(2), (r.actualRebate || 0).toFixed(2)
            ];
        });

        return {
            table1: { name: 'Platform_Summary_' + batchDate + '.csv', headers: table1Headers, rows: table1Rows },
            table2: { name: 'Affiliate_Map_' + batchDate + '.csv', headers: table2Headers, rows: table2Rows },
            table2a: { name: 'L1_Rebate_Ratio_Snapshot_' + batchDate + '.csv', headers: table2aHeaders, rows: table2aRows },
            table3: { name: 'Rebate_Split_Detail_' + batchDate + '.csv', headers: table3Headers, rows: table3Rows },
            table4: { name: 'System_Proposed_Payout_' + batchDate + '.csv', headers: table4Headers, rows: table4Rows }
        };
    }

    function downloadSettlementReconciliationPackage() {
        if (!currentBatchDate) {
            alert('请先进入结算批次详情');
            return;
        }
        const now = Date.now();
        if (lastReconciliationDownloadAt && now - lastReconciliationDownloadAt < RECONCILIATION_DOWNLOAD_COOLDOWN_MS) {
            const remainSec = Math.ceil((RECONCILIATION_DOWNLOAD_COOLDOWN_MS - (now - lastReconciliationDownloadAt)) / 1000);
            const remainMin = Math.ceil(remainSec / 60);
            alert('对账单下载过于频繁，请 ' + remainMin + ' 分钟后再试（每 10 分钟限下载 1 次，降低数据库压力）');
            return;
        }
        lastReconciliationDownloadAt = now;
        const pack = buildSettlementCsvExports(currentBatchDate);
        const keys = ['table1', 'table2', 'table2a', 'table3', 'table4'];
        keys.forEach(function (k, i) {
            const t = pack[k];
            setTimeout(function () {
                downloadCsvFile(t.name, t.headers, t.rows);
            }, i * 350);
        });
        alert('将依次下载 5 个对账 CSV 文件（表1–表4及一级比例快照表2a）');
    }

    function renderSettlementSupplementRows() {
        const tbody = document.getElementById('settlement-supplement-body');
        if (!tbody || !currentBatchDate) return;
        const rows = getSupplementsForBatch(currentBatchDate).filter(function (f) {
            if (!matchPartnerQuery(f, supplementDetailFilters.partner)) return false;
            if (supplementDetailFilters.originalDate && f.originalSettlementDate.indexOf(supplementDetailFilters.originalDate) === -1) return false;
            return true;
        });
        const sliced = paginate(rows, supplementDetailPage);
        supplementDetailPage = sliced.page;
        tbody.innerHTML = sliced.items.length ? sliced.items.map(function (f) {
            const modTag = f.amount < f.originalRebate ? '<span class="block text-[9px] text-orange-600 font-bold mt-0.5">已调减</span>' : '';
            return '<tr class="hover:bg-slate-50">' +
                '<td class="px-4 py-3"><div>' + chip(f.wallet, 'wallet') + '</div><div class="mt-1">' + chip(f.uid, 'uid') + '</div></td>' +
                '<td class="px-4 py-3 font-bold text-amber-800">' + f.originalSettlementDate + '</td>' +
                '<td class="px-4 py-3 text-right font-bold">' + fmtMoney(f.originalRebate) + '</td>' +
                '<td class="px-4 py-3 text-right font-black text-blue-600">' + fmtMoney(f.amount) + modTag + '</td>' +
                '<td class="px-4 py-3 text-right"><button type="button" onclick="PartnerPortal.openEditSupplement(\'' + f.id + '\')" class="text-blue-600 font-bold hover:underline text-[10px]">修改</button></td></tr>';
        }).join('') : '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">本日无修正返佣补发流水</td></tr>';
        mountListPagination('settlement-supplement-pagination', sliced.total, supplementDetailPage, 'settlement-supplement');
    }

    function findSupplementById(id) {
        return REBATE_SUPPLEMENT_FLOWS.find(function (f) { return f.id === id; });
    }

    function findSupplementByMatch(walletOrUid, originalDate) {
        const q = (walletOrUid || '').trim().toLowerCase();
        const d = (originalDate || '').trim();
        return REBATE_SUPPLEMENT_FLOWS.find(function (f) {
            if (f.payoutDate !== currentBatchDate) return false;
            if (f.originalSettlementDate !== d) return false;
            return f.wallet.toLowerCase().indexOf(q) >= 0 || f.uid === walletOrUid.trim() ||
                q.indexOf(f.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function openEditSupplement(id) {
        const f = findSupplementById(id);
        if (!f) return;
        currentSupplementEditId = id;
        document.getElementById('edit-supplement-title').textContent = '修改补发佣金';
        document.getElementById('edit-supplement-hint').innerHTML = '合伙人 ' + f.wallet + ' · 原应结日 <b>' + f.originalSettlementDate + '</b> · 原始返佣 ' + fmtMoney(f.originalRebate);
        document.getElementById('edit-supplement-input').value = f.amount;
        document.getElementById('edit-supplement-input').max = f.originalRebate;
        document.getElementById('modal-edit-supplement').classList.remove('hidden');
    }

    function closeEditSupplementModal() {
        document.getElementById('modal-edit-supplement').classList.add('hidden');
        currentSupplementEditId = null;
    }

    function saveEditSupplement() {
        if (!currentSupplementEditId) return;
        const f = findSupplementById(currentSupplementEditId);
        if (!f) return;
        const val = parseFloat(document.getElementById('edit-supplement-input').value);
        if (isNaN(val) || val < 0) { alert('请输入有效金额'); return; }
        if (val > f.originalRebate) { alert('补发佣金不能高于原始返佣 ' + fmtMoney(f.originalRebate)); return; }
        f.amount = val;
        closeEditSupplementModal();
        renderSettlementSupplementRows();
        filterSettlementBatches();
        alert('补发佣金已更新（演示）');
    }

    function openBatchEditPage(mode) {
        if (!currentBatchDate) return;
        batchEditMode = mode || 'detail';
        document.getElementById('view-review-detail').classList.add('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.remove('hidden');
        const title = document.getElementById('batch-edit-title');
        const hint = document.getElementById('batch-edit-hint');
        const lines = document.getElementById('batch-edit-lines');
        if (batchEditMode === 'supplement') {
            if (title) title.textContent = '批量修改补发佣金 · ' + currentBatchDate;
            if (hint) hint.innerHTML = '每行：<strong>钱包或UID,原应结日,补发金额</strong>。补发不得高于原始返佣。匹配字段含原应结日。';
            if (lines) lines.placeholder = '0xAbn...L4,2024-05-21,1856.40\n100815,2024-10-01,2300';
        } else {
            if (title) title.textContent = '批量修改批次实发佣金 · ' + currentBatchDate;
            if (hint) hint.innerHTML = '每行：<strong>钱包或UID,实发金额</strong>。实发不得高于原始佣金。';
            if (lines) lines.placeholder = '0xAbn...L1,6500\n100801,4200';
        }
        if (lines) lines.value = '';
        const results = document.getElementById('batch-edit-results');
        if (results) results.innerHTML = '';
        const file = document.getElementById('batch-edit-file');
        if (file) file.value = '';
    }

    function initSettlementDatePickers() {
        if (typeof flatpickr === 'undefined') return;
        const opts = { dateFormat: 'Y-m-d', allowInput: true };
        const batchDate = document.getElementById('settlement-filter-date');
        if (batchDate && !batchDate._flatpickr) {
            flatpickr(batchDate, Object.assign({}, opts, { onChange: function () { filterSettlementBatches(); } }));
        }
        const origDate = document.getElementById('supplement-filter-original-date');
        if (origDate && !origDate._flatpickr) {
            flatpickr(origDate, Object.assign({}, opts, { onChange: function () { applySupplementDetailFilters(); } }));
        }
    }

    function setSettlementListView(inDetail) {
        const filterSec = document.getElementById('settlement-filter-section');
        if (filterSec) filterSec.classList.toggle('hidden', inDetail);
    }

    function closeBatchEditPage() {
        document.getElementById('view-batch-edit-actual').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
    }

    function renderBatchEditResults(results) {
        const el = document.getElementById('batch-edit-results');
        if (!el) return;
        const ok = results.filter(function (r) { return r.status === 'ok'; }).length;
        const fail = results.length - ok;
        let html = '<div class="px-4 py-3 border-b bg-slate-50 text-[11px]"><span class="font-bold text-green-700">成功 ' + ok + '</span> · <span class="font-bold text-red-600">失败 ' + fail + '</span></div>';
        html += '<table class="w-full text-left text-[11px]"><thead class="bg-slate-50 border-b text-[10px] uppercase text-slate-400"><tr>' +
            '<th class="px-4 py-2">匹配项</th><th class="px-4 py-2 text-right">请求金额</th><th class="px-4 py-2 text-center">结果</th><th class="px-4 py-2">说明</th></tr></thead><tbody>';
        results.forEach(function (r) {
            const stCls = r.status === 'ok' ? 'text-green-700' : 'text-red-600';
            html += '<tr class="border-t"><td class="px-4 py-2 font-mono">' + r.key + '</td><td class="px-4 py-2 text-right font-bold">' + (isNaN(r.amount) ? '—' : fmtMoney(r.amount)) + '</td>' +
                '<td class="px-4 py-2 text-center font-black ' + stCls + '">' + (r.status === 'ok' ? '成功' : '失败') + '</td>' +
                '<td class="px-4 py-2 text-slate-600">' + r.reason + '</td></tr>';
        });
        html += '</tbody></table>';
        el.innerHTML = html;
    }

    function parseBatchEditLines(text, mode) {
        const lines = (text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
        const entries = [];
        lines.forEach(function (line, idx) {
            const parts = line.split(/[,;\t]/).map(function (p) { return p.trim(); });
            if (mode === 'supplement') {
                if (parts.length < 3) {
                    entries.push({ line: idx + 1, raw: line, error: '格式错误，需：钱包或UID,原应结日,补发金额' });
                    return;
                }
                const amount = parseFloat(parts[parts.length - 1].replace(/[$,]/g, ''));
                const originalDate = parts[parts.length - 2];
                const key = parts.slice(0, parts.length - 2).join(',').trim();
                entries.push({ line: idx + 1, key: key, originalDate: originalDate, amount: amount });
            } else {
                if (parts.length < 2) {
                    entries.push({ line: idx + 1, key: line, amount: NaN, error: '格式错误，需：钱包或UID,实发金额' });
                    return;
                }
                const amount = parseFloat(parts[parts.length - 1].replace(/[$,]/g, ''));
                const key = parts.slice(0, parts.length - 1).join(',').trim();
                entries.push({ line: idx + 1, key: key, amount: amount });
            }
        });
        return entries;
    }

    function applyBatchEditEntries(entries, mode) {
        const results = [];
        entries.forEach(function (e) {
            if (e.error) {
                results.push({ key: e.raw || e.key || '', amount: e.amount, status: 'fail', reason: e.error });
                return;
            }
            if (isNaN(e.amount) || e.amount < 0) {
                results.push({ key: e.key, amount: e.amount, status: 'fail', reason: '金额无效' });
                return;
            }
            if (mode === 'supplement') {
                const f = findSupplementByMatch(e.key, e.originalDate);
                if (!f) {
                    results.push({ key: e.key + ' · ' + e.originalDate, amount: e.amount, status: 'fail', reason: '未找到本日补发记录（检查原应结日）' });
                    return;
                }
                if (e.amount > f.originalRebate) {
                    results.push({ key: f.wallet + ' · ' + f.originalSettlementDate, amount: e.amount, status: 'fail', reason: '高于原始返佣 ' + fmtMoney(f.originalRebate) });
                    return;
                }
                f.amount = e.amount;
                results.push({ key: f.wallet + ' · ' + f.originalSettlementDate, amount: e.amount, status: 'ok', reason: '已更新' });
            } else {
                const row = findBatchRowByWalletOrUid(e.key);
                if (!row) {
                    results.push({ key: e.key, amount: e.amount, status: 'fail', reason: '未找到本批次合伙人' });
                    return;
                }
                if (e.amount > row.originalRebate) {
                    results.push({ key: row.wallet, amount: e.amount, status: 'fail', reason: '高于原始佣金 ' + fmtMoney(row.originalRebate) });
                    return;
                }
                row.actualRebate = e.amount;
                results.push({ key: row.wallet + ' / ' + row.uid, amount: e.amount, status: 'ok', reason: '已更新' });
            }
        });
        return results;
    }

    function submitBatchEditLines() {
        const text = document.getElementById('batch-edit-lines') ? document.getElementById('batch-edit-lines').value : '';
        const entries = parseBatchEditLines(text, batchEditMode);
        if (!entries.length) { alert('请输入或上传修改数据'); return; }
        const results = applyBatchEditEntries(entries, batchEditMode);
        renderBatchEditResults(results);
        if (batchEditMode === 'supplement') {
            renderSettlementSupplementRows();
        } else {
            renderSettlementDetailRows();
        }
        filterSettlementBatches();
    }

    function handleBatchEditFile(input) {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        const mode = batchEditMode;
        reader.onload = function (ev) {
            const text = ev.target.result || '';
            const linesEl = document.getElementById('batch-edit-lines');
            if (linesEl) linesEl.value = text;
            const entries = parseBatchEditLines(text, mode);
            const results = applyBatchEditEntries(entries, mode);
            renderBatchEditResults(results);
            if (mode === 'supplement') renderSettlementSupplementRows();
            else renderSettlementDetailRows();
            filterSettlementBatches();
        };
        reader.readAsText(file);
    }

    function openEditActual(rowId) {
        const rows = getBatchRows(currentBatchDate);
        const row = rows.find(function (r) { return r.id === rowId; });
        if (!row) return;
        batchEditRowIds = [rowId];
        document.getElementById('edit-actual-title').textContent = '修改实发佣金';
        document.getElementById('edit-actual-hint').textContent = '原始佣金 ' + fmtMoney(row.originalRebate) + '，实发不得高于原始佣金。';
        document.getElementById('edit-actual-input').value = row.actualRebate;
        document.getElementById('edit-actual-input').max = row.originalRebate;
        document.getElementById('modal-edit-actual').classList.remove('hidden');
    }

    function closeEditActualModal() {
        document.getElementById('modal-edit-actual').classList.add('hidden');
        batchEditRowIds = null;
    }

    function saveEditActual() {
        if (!batchEditRowIds || !currentBatchDate) return;
        const val = parseFloat(document.getElementById('edit-actual-input').value);
        if (isNaN(val) || val < 0) { alert('请输入有效金额'); return; }
        const rows = getBatchRows(currentBatchDate);
        const targets = rows.filter(function (r) { return batchEditRowIds.indexOf(r.id) >= 0; });
        if (!targets.length) return;

        if (batchEditRowIds.length === 1) {
            const row = targets[0];
            if (val > row.originalRebate) { alert('实发佣金不能高于原始佣金 ' + fmtMoney(row.originalRebate)); return; }
            row.actualRebate = val;
        } else {
            targets.forEach(function (row) {
                const capped = Math.min(val, row.originalRebate);
                row.actualRebate = capped;
            });
        }
        closeEditActualModal();
        renderSettlementDetailRows();
        filterSettlementBatches();
        alert('实发佣金已更新（演示）');
    }

    function filterSettlementBatches() {
        const q = (document.getElementById('settlement-filter-date').value || '').trim();
        const st = document.getElementById('settlement-filter-status').value;
        const tbody = document.getElementById('settlement-batch-body');
        if (!tbody) return;
        const batches = SETTLEMENT_BATCHES.filter(function (b) {
            if (st !== 'all' && b.status !== st) return false;
            if (q && b.date.indexOf(q) === -1) return false;
            return true;
        });
        const sliced = paginate(batches, settlementBatchPage);
        settlementBatchPage = sliced.page;
        tbody.innerHTML = sliced.items.map(function (b) {
            const e = enrichBatch(b);
            const stCls = b.rejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
            return '<tr class="hover:bg-slate-50' + (b.rejected ? ' bg-red-50/20' : '') + '">' +
                '<td class="px-4 py-4 font-black">' + e.date + '</td>' +
                '<td class="px-4 py-4 text-right font-bold">' + e.vol + '</td>' +
                '<td class="px-4 py-4 text-right font-bold text-amber-800">' + fmtMoney(e.supplementPayout) + '</td>' +
                '<td class="px-4 py-4 text-right font-black text-blue-600">' + fmtMoney(e.todayPayout) + '</td>' +
                '<td class="px-4 py-4 text-right font-black text-slate-900">' + fmtMoney(e.totalPayout) + '</td>' +
                '<td class="px-4 py-4 text-center"><span class="' + stCls + ' px-3 py-1 rounded-full text-[10px]">' + e.status + '</span></td>' +
                '<td class="px-4 py-4 text-right"><button type="button" onclick="PartnerPortal.showReviewDetail(\'' + e.date + '\', ' + (b.rejected ? 'true' : 'false') + ')" class="bg-slate-900 text-white px-4 py-1.5 rounded font-black uppercase text-[10px]">' + (b.rejected ? '查看原因' : '查看详情') + '</button></td></tr>';
        }).join('');
        mountListPagination('settlement-batch-pagination', sliced.total, settlementBatchPage, 'settlement-batch');
    }

    function showReviewDetail(batchDate, isRejected) {
        currentBatchDate = batchDate || SETTLEMENT_BATCHES[0].date;
        settlementDetailTab = 'detail';
        settlementDetailFilters = { partner: '', level: 'all', modified: 'all' };
        supplementDetailFilters = { partner: '', originalDate: '' };
        settlementDetailPage = 1;
        supplementDetailPage = 1;
        setSettlementListView(true);
        document.getElementById('view-batch-list').classList.add('hidden');
        document.getElementById('view-review-detail').classList.remove('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.add('hidden');
        document.getElementById('reject-banner').classList.toggle('hidden', isRejected !== true && isRejected !== 'true');
        const titleEl = document.getElementById('detail-title');
        if (titleEl) titleEl.textContent = '结算批次明细 · ' + currentBatchDate;
        switchSettlementDetailTab('detail');
        resetSettlementDetailFilters();
        resetSupplementDetailFilters();
        setTimeout(function () { initSettlementDatePickers(); }, 50);
    }

    function backToSettlementList() {
        currentBatchDate = null;
        setSettlementListView(false);
        document.getElementById('view-review-detail').classList.add('hidden');
        const editView = document.getElementById('view-batch-edit-actual');
        if (editView) editView.classList.add('hidden');
        document.getElementById('view-batch-list').classList.remove('hidden');
        filterSettlementBatches();
    }

    function applyHashTree() {
        const hash = (location.hash || '').replace('#', '').split('?')[0];
        if (hash === 'rebate-tree' && (currentUserId || treeEntryId || treeFocusId)) {
            showTree(currentUserId || treeEntryId || treeFocusId);
        }
    }

    function findUserByWalletOrUid(key) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return null;
        return USERS.find(function (u) {
            return u.wallet.toLowerCase() === q || String(u.uid) === key.trim() ||
                u.wallet.toLowerCase().indexOf(q) >= 0 || q.indexOf(u.wallet.toLowerCase().replace(/\.\.\./g, '')) >= 0;
        });
    }

    function matchWalletOrUid(key, wallet, uid) {
        const q = (key || '').trim().toLowerCase();
        if (!q) return false;
        const w = (wallet || '').toLowerCase();
        return w === q || String(uid) === key.trim() ||
            w.indexOf(q) >= 0 || q.indexOf(w.replace(/\.\.\./g, '')) >= 0;
    }

    function identityKindLabel(kind) {
        const map = {
            plain: '普通用户',
            direct_client: '合伙人直客',
            partner_l1: '一级代理',
            partner_n: 'N 级代理',
            plain_host: '普通用户（非代理）',
            already_l1: '已是一级代理'
        };
        return map[kind] || kind;
    }

    function isPlainHostTarget(t) {
        return !!(t && t.isPlainHost);
    }

    function classifyMigrateTargetKind(target) {
        if (!target) return null;
        if (isPlainHostTarget(target)) return 'plain_host';
        const level = target.level != null ? target.level : 1;
        if (level === 1 && !target.parentWallet) return 'l1';
        return 'n_partner';
    }

    function findPlainHostTarget(key) {
        const q = (key || '').trim();
        if (!q) return null;
        return MIGRATE_PLAIN_HOSTS.find(function (p) { return matchWalletOrUid(q, p.wallet, p.uid); });
    }

    function findDirectClientSubject(key) {
        const q = (key || '').trim();
        if (!q) return null;
        let found = BIND_SUBJECT_DIRECT_CLIENTS.find(function (p) { return matchWalletOrUid(q, p.wallet, p.uid); });
        if (found) return found;
        let i;
        for (i = 0; i < USERS.length; i++) {
            const u = USERS[i];
            const hit = (u.directClients || []).find(function (c) { return matchWalletOrUid(q, c.wallet, c.uid); });
            if (hit) {
                return {
                    wallet: hit.wallet, uid: hit.uid || '', note: '直客 · 归属 ' + u.wallet,
                    parentPartnerWallet: u.wallet, parentPartnerUid: u.uid,
                    directClients: hit.directClients || []
                };
            }
        }
        return null;
    }

    function findMigrateTarget(key) {
        const q = (key || '').trim();
        if (!q) return null;
        const plainHost = findPlainHostTarget(q);
        if (plainHost) return Object.assign({ isPlainHost: true, ratio: 0, level: 0 }, plainHost);
        return MIGRATE_TARGET_PARTNERS.find(function (p) { return matchWalletOrUid(q, p.wallet, p.uid); }) ||
            USERS.find(function (u) { return matchWalletOrUid(q, u.wallet, u.uid); }) ||
            MIGRATE_AGENT_USERS.find(function (u) { return matchWalletOrUid(q, u.wallet, u.uid); });
    }

    function findMigrateTargetPartner(key) {
        return findMigrateTarget(key);
    }

    function collectUserSubtree(userId) {
        const result = [];
        function walk(id) {
            const u = getUser(id);
            if (!u) return;
            result.push(u);
            (u.childIds || []).forEach(walk);
        }
        walk(userId);
        return result;
    }

    function collectUserDirectClients(userId) {
        const clients = [];
        collectUserSubtree(userId).forEach(function (u) {
            (u.directClients || []).forEach(function (c) {
                clients.push({ owner: u.wallet, wallet: c.wallet, uid: c.uid || '' });
            });
        });
        return clients;
    }

    function resolveBindSubject(key) {
        const q = (key || '').trim();
        if (!q) return null;
        const plain = findMigratePlainUser(q);
        if (plain) {
            return {
                kind: 'plain', identityLabel: identityKindLabel('plain'), user: plain,
                directClients: plain.directClients || [], treeNodes: 0, currentParent: '—'
            };
        }
        const dc = findDirectClientSubject(q);
        if (dc) {
            return {
                kind: 'direct_client', identityLabel: identityKindLabel('direct_client'), user: dc,
                directClients: dc.directClients || [], treeNodes: 0,
                currentParent: dc.parentPartnerWallet || '—'
            };
        }
        const agent = findMigrateAgentUser(q);
        if (agent) {
            if (agent.level === 1 && !agent.parentWallet) {
                return { kind: 'already_l1', identityLabel: identityKindLabel('already_l1'), user: agent, directClients: [], treeNodes: 0, currentParent: '—' };
            }
            const subtree = collectMigrateSubtree(agent.id);
            const clients = collectMigrateDirectClients(agent.id);
            return {
                kind: 'partner_n', identityLabel: identityKindLabel('partner_n') + ' · 系统 L' + agent.level,
                user: agent, directClients: clients, treeNodes: subtree.length,
                currentParent: agent.parentWallet || '—'
            };
        }
        const user = findUserByWalletOrUid(q);
        if (user) {
            if (user.level === 1 && !user.parentWallet && LIST_IDS.indexOf(user.id) >= 0) {
                return { kind: 'already_l1', identityLabel: identityKindLabel('already_l1'), user: user, directClients: [], treeNodes: 0, currentParent: '—' };
            }
            const subtree = collectUserSubtree(user.id);
            const clients = collectUserDirectClients(user.id);
            return {
                kind: 'partner_n', identityLabel: identityKindLabel('partner_n') + ' · 系统 L' + user.level,
                user: user, directClients: clients, treeNodes: subtree.length,
                currentParent: user.parentWallet || '—'
            };
        }
        return null;
    }

    function renderBindSubjectPreview(subject) {
        const card = document.getElementById('bind-subject-card');
        const preview = document.getElementById('bind-preview-section');
        const submitBtn = document.querySelector('#modal-bind-partner button[onclick="PartnerPortal.submitBindPartner()"]');
        if (!card || !preview) return;
        if (!subject) {
            card.classList.add('hidden');
            preview.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = false;
            return;
        }
        card.classList.remove('hidden');
        preview.classList.remove('hidden');
        let cardHtml = '<div class="flex flex-wrap items-center gap-2 mb-2">' +
            '<span class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-black">当前身份：' + subject.identityLabel + '</span></div>' +
            '<p class="font-black text-slate-800">' + chip(subject.user.wallet, 'wallet') + ' · ' + chip(subject.user.uid, 'uid') + '</p>' +
            '<p class="text-slate-600 mt-1">' + (subject.user.note || '') + '</p>';
        if (subject.kind === 'already_l1') {
            cardHtml += '<p class="text-red-700 font-bold mt-2">该用户已是一级代理，无需重复设置。</p>';
            preview.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = true;
        } else {
            cardHtml += '<p class="text-slate-500 mt-1">原上级 ' + chip(subject.currentParent, 'wallet') + ' · 升级后原上级<strong>返佣人数不变</strong>，不再产生新的交易额与返佣。</p>';
            if (submitBtn) submitBtn.disabled = false;
        }
        card.innerHTML = cardHtml;

        let previewHtml = '';
        if (subject.kind === 'plain' || subject.kind === 'direct_client') {
            previewHtml += '<p class="font-bold text-slate-700 mb-2">升级范围 · 直客一并迁移</p>' +
                '<p class="text-[10px] text-slate-500 mb-2">仅需配置<strong>一级合伙人返佣比例</strong>，无需为直客单独设比例。</p>' +
                '<ul class="text-[11px] space-y-1 max-h-28 overflow-y-auto">';
            (subject.directClients || []).slice(0, 8).forEach(function (c) {
                previewHtml += '<li>' + chip(c.wallet, 'wallet') + (c.uid ? ' · ' + chip(c.uid, 'uid') : '') + '</li>';
            });
            if (!(subject.directClients || []).length) previewHtml += '<li class="text-slate-400">无直客</li>';
            previewHtml += '</ul>';
        } else if (subject.kind === 'partner_n') {
            previewHtml += '<p class="font-bold text-slate-700 mb-2">升级范围 · 整伞返佣树迁移</p>' +
                '<p class="text-[10px] text-slate-500 mb-2">该用户当前为 <strong>' + subject.identityLabel + '</strong>；升级为一级后，其<strong>全部下级代理与直客</strong>随主体一并挂到新 L1 伞下。仅需配置主体<strong>一级返佣比例</strong>。</p>' +
                '<p class="text-[11px] text-slate-800">代理节点 <strong>' + subject.treeNodes + '</strong> 人 · 伞下直客 <strong>' + (subject.directClients || []).length + '</strong> 人</p>';
        }
        preview.innerHTML = previewHtml;
    }

    function previewBindPartner() {
        const key = (document.getElementById('bind-wallet') && document.getElementById('bind-wallet').value || '').trim();
        bindState.preview = key ? resolveBindSubject(key) : null;
        renderBindSubjectPreview(bindState.preview);
    }

    function findMigratePlainUser(key) {
        const q = (key || '').trim();
        if (!q) return null;
        return MIGRATE_PLAIN_USERS.find(function (p) { return matchWalletOrUid(q, p.wallet, p.uid); });
    }

    function getMigratePlainRole() {
        const el = document.querySelector('input[name="migrate-plain-role"]:checked');
        return el ? el.value : 'direct_client';
    }

    function isMigratePlainAsPartner() {
        return migrateState.preview && migrateState.preview.type === 'plain' && getMigratePlainRole() === 'sub_partner';
    }

    function needsMigrateRatio(preview) {
        if (!preview) return true;
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const target = findMigrateTarget(targetKey);
        if (target && isPlainHostTarget(target)) return false;
        if (preview.type === 'plain' && getMigratePlainRole() === 'direct_client') return false;
        return true;
    }

    function getMigrateRatioInputValue(preview) {
        if (!needsMigrateRatio(preview)) return null;
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        return isNaN(ratioVal) ? null : ratioVal;
    }

    function updateMigratePlainRoleUI() {
        const roleWrap = document.getElementById('migrate-plain-role-wrap');
        const ratioWrap = document.getElementById('migrate-ratio-wrap');
        const plainHostHint = document.getElementById('migrate-plain-target-hint');
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const target = findMigrateTarget(targetKey);
        const targetIsPlainHost = target && isPlainHostTarget(target);
        const isPlain = migrateState.preview && migrateState.preview.type === 'plain';
        if (plainHostHint) plainHostHint.classList.toggle('hidden', !targetIsPlainHost);
        if (roleWrap) roleWrap.classList.toggle('hidden', !isPlain || targetIsPlainHost);
        if (ratioWrap) ratioWrap.classList.toggle('hidden', migrateState.preview && !needsMigrateRatio(migrateState.preview));
    }

    function findMigrateAgentUser(key) {
        const q = (key || '').trim();
        if (!q) return null;
        return MIGRATE_AGENT_USERS.find(function (u) { return matchWalletOrUid(q, u.wallet, u.uid); });
    }

    function getMigrateAgent(id) { return MIGRATE_AGENT_USERS.find(function (u) { return u.id === id; }); }
    function getMigrateAgentByWallet(w) { return MIGRATE_AGENT_USERS.find(function (u) { return u.wallet === w; }); }
    function getMigrateNode(id) { return getMigrateAgent(id) || getUser(id); }
    function getMigrateNodeByWallet(w) {
        const a = getMigrateAgentByWallet(w);
        if (a) return a;
        return USERS.find(function (u) { return u.wallet === w; });
    }

    function isMigrateDescendantOf(ancestorId, nodeId) {
        if (nodeId === ancestorId) return true;
        const node = getMigrateAgent(nodeId);
        if (!node) return false;
        let w = node.parentWallet;
        while (w) {
            const p = getMigrateAgentByWallet(w);
            if (!p) return false;
            if (p.id === ancestorId) return true;
            w = p.parentWallet;
        }
        return false;
    }

    function resolveMigrateSubject(key) {
        const plain = findMigratePlainUser(key);
        if (plain) return { type: 'plain', subtype: 'plain', plainUser: plain, label: '普通用户' };
        const dc = findDirectClientSubject(key);
        if (dc) return { type: 'plain', subtype: 'direct_client', plainUser: dc, label: '合伙人直客' };
        const agent = findMigrateAgentUser(key);
        if (agent) {
            const label = (agent.level === 1 && !agent.parentWallet) ? '一级代理' : 'N 级代理';
            return { type: 'partner', partnerUser: agent, label: label, partnerSource: 'migrate' };
        }
        const user = findUserByWalletOrUid(key);
        if (user) {
            const label = (user.level === 1 && !user.parentWallet) ? '一级代理' : 'N 级代理';
            return { type: 'partner', partnerUser: user, label: label, partnerSource: 'users' };
        }
        return null;
    }

    function collectMigrateSubtree(userId) {
        const result = [];
        function walk(id) {
            const u = getMigrateAgent(id);
            if (!u) return;
            result.push(u);
            (u.childIds || []).forEach(walk);
        }
        walk(userId);
        return result;
    }

    function migrateDepthLabel(depth) {
        if (depth === 0) return '迁移主体';
        if (depth === 1) return '直接下级';
        if (depth === 2) return '二级下级';
        if (depth === 3) return '三级下级';
        return depth + '级下级';
    }

    function migrateSystemLevelTag(level) {
        return '<span class="text-[9px] text-slate-400 font-bold ml-1">系统 L' + level + '</span>';
    }

    function getMigrateDepthFromRoot(rootId, nodeId) {
        let depth = 0;
        let cur = getMigrateAgent(nodeId);
        const root = getMigrateAgent(rootId);
        if (!cur || !root) return 0;
        while (cur && cur.id !== rootId) {
            depth++;
            cur = cur.parentWallet ? getMigrateAgentByWallet(cur.parentWallet) : null;
        }
        return cur ? depth : 0;
    }

    function getEffectiveMigrateRatio(agentId, rootId, rootEffectiveRatio) {
        if (agentId === rootId) return rootEffectiveRatio;
        if (migrateRatioOverrides[agentId] != null) return migrateRatioOverrides[agentId];
        const a = getMigrateNode(agentId);
        return a ? a.ratio : 0;
    }

    function collectMigrateDirectClients(userId) {
        const clients = [];
        collectMigrateSubtree(userId).forEach(function (u) {
            (u.directClients || []).forEach(function (c) {
                clients.push({ owner: u.wallet, wallet: c.wallet, uid: c.uid || '' });
            });
        });
        return clients;
    }


    function buildMigratePreview(subject) {
        if (subject.type === 'plain') {
            const plain = subject.plainUser;
            const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
            const target = findMigrateTarget(targetKey);
            const forceDirect = target && isPlainHostTarget(target);
            const plainRole = forceDirect ? 'direct_client' : getMigratePlainRole();
            return {
                type: 'plain', label: subject.label, subtype: subject.subtype || 'plain',
                plainUser: plain, plainRole: plainRole, targetIsPlainHost: forceDirect,
                agentChain: [], directClients: (plain.directClients || []).map(function (c) {
                    return { wallet: c.wallet, uid: c.uid || '', owner: plain.wallet };
                })
            };
        }
        const partner = subject.partnerUser;
        let subtree;
        let clients;
        if (subject.partnerSource === 'users' || getUser(partner.id)) {
            subtree = collectUserSubtree(partner.id);
            clients = collectUserDirectClients(partner.id);
        } else {
            subtree = collectMigrateSubtree(partner.id);
            clients = collectMigrateDirectClients(partner.id);
        }
        return {
            type: 'partner', label: subject.label, partnerUser: partner,
            agentChain: subtree.map(function (u) {
                const depth = u.id === partner.id ? 0 : Math.max(1, (u.level || 1) - (partner.level || 1));
                return {
                    wallet: u.wallet, uid: u.uid, level: u.level, ratio: u.ratio, note: u.note, id: u.id,
                    migrateDepth: subject.partnerSource === 'migrate' ? getMigrateDepthFromRoot(partner.id, u.id) : depth
                };
            }),
            directClients: clients,
            hasInternalInversion: false
        };
    }

    function checkMigrateValidation() {
        const errors = [];
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        const preview = migrateState.preview;
        if (!preview) return errors;

        if (!targetKey) {
            errors.push('请填写迁移到上级');
            return errors;
        }
        const target = findMigrateTarget(targetKey);
        if (!target) {
            errors.push('未找到目标上级：' + targetKey + '（演示：0xTo...L1 · 0xPlain...Host · 0xNorm...L3）');
            return errors;
        }
        const targetKind = classifyMigrateTargetKind(target);
        const needsRatio = needsMigrateRatio(preview);
        if (needsRatio && (isNaN(ratioVal) || ratioVal <= 0)) {
            errors.push('请填写有效的返佣比例');
        } else if (needsRatio && !isNaN(ratioVal) && ratioVal > 0) {
            if (!isPlainHostTarget(target) && ratioVal > target.ratio) {
                errors.push('迁移用户比例 ' + ratioVal + '% 高于上级 ' + target.wallet + ' 的 ' + target.ratio + '%');
            }
            if (ratioVal > OPS_CAP) {
                errors.push('返佣比例超过运营权限上限 ' + OPS_CAP + '%');
            }
        }
        if (targetKind === 'plain_host' && preview.type === 'partner') {
            errors.push('N 级 / 一级代理不可迁移到普通用户（非代理）下级');
        }

        if (preview.type === 'partner' && preview.partnerUser) {
            const partner = preview.partnerUser;
            const migTarget = findMigrateTarget(targetKey);
            if (migTarget && partner.wallet === migTarget.wallet) {
                errors.push('不能迁移到自身之下');
            }
        }
        return errors;
    }

    function toggleMigrateTreeExpand(id) {
        if (migrateTreeExpanded.has(id)) migrateTreeExpanded.delete(id);
        else migrateTreeExpanded.add(id);
        renderMigratePreviewContent();
    }

    function stageMigrateRatioChange(agentId) {
        const u = getMigrateAgent(agentId);
        const input = document.getElementById('migrate-ratio-' + agentId);
        if (!u || !input) return;
        const val = parseFloat(input.value);
        if (!val || val <= 0) return;
        migrateRatioOverrides[agentId] = val;
        previewMigrate();
    }


    function renderMigrateTreeNode(agentId, rootId, rootEffectiveRatio, depth) {
        const u = getMigrateNode(agentId);
        if (!u) return '';
        const childIds = u.childIds || [];
        const hasKids = childIds.length > 0;
        const expanded = migrateTreeExpanded.has(agentId);
        const displayRatio = getEffectiveMigrateRatio(agentId, rootId, rootEffectiveRatio);
        const origRatio = u.ratio;
        const isHighlight = agentId === migrateTreeHighlightId;
        const border = isHighlight ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-300' : 'border-slate-200 bg-white';
        let html = '<div class="migrate-tree-node mb-2" id="migrate-node-wrap-' + agentId + '">';
        html += '<div class="flex items-start gap-1">';
        if (hasKids && depth > 0) {
            html += '<button type="button" class="tree-expand-btn" onclick="PartnerPortal.toggleMigrateTreeExpand(\'' + agentId + '\')">' + (expanded ? '−' : '+') + '</button>';
        } else {
            html += '<span class="w-6 shrink-0"></span>';
        }
        html += '<div class="flex-1 flex items-center gap-2 p-2 rounded-lg border ' + border + ' shadow-sm min-w-0" id="migrate-node-' + agentId + '">';
        html += '<span class="text-[10px] font-bold text-blue-700 shrink-0">' + migrateDepthLabel(depth) + '</span>';
        html += migrateSystemLevelTag(u.level);
        html += '<div class="flex-1 min-w-0"><p class="font-bold text-[11px] truncate">' + u.wallet + '</p><p class="text-[10px] text-slate-500">' + u.note + '</p></div>';
        if (agentId === rootId) {
            html += '<span class="font-black text-blue-600">' + displayRatio + '%</span>';
        } else {
            html += '<input type="number" id="migrate-ratio-' + agentId + '" value="' + displayRatio + '" class="w-14 border rounded px-1 py-1 text-center font-black text-blue-600 text-sm" onchange="PartnerPortal.stageMigrateRatioChange(\'' + agentId + '\')">';
            html += '<span class="text-slate-400 font-bold">%</span>';
            if (migrateRatioOverrides[agentId] != null && migrateRatioOverrides[agentId] !== origRatio) {
                html += '<span class="text-[9px] text-orange-600 font-bold">已改</span>';
            }
        }
        html += '</div></div>';
        if (hasKids && expanded && depth > 0) {
            html += '<div class="tree-children ml-4 mt-1 space-y-2">';
            childIds.forEach(function (cid) {
                html += renderMigrateTreeNode(cid, rootId, rootEffectiveRatio, depth + 1);
            });
            html += '</div>';
        }
        html += '</div>';
        return html;
    }





    function searchMigrateTree() {
        const input = document.getElementById('migrate-tree-search-input');
        const q = input && input.value;
        const p = migrateState.preview;
        if (!p || !p.partnerUser || !q) return;
        const root = p.partnerUser;
        const found = collectMigrateSubtree(root.id).find(function (u) {
            return matchWalletOrUid(q, u.wallet, u.uid);
        });
        if (!found) {
            alert('未在当前迁移伞内找到匹配的钱包或 UID');
            return;
        }
        migrateTreeHighlightId = found.id;
        migrateTreeExpanded = new Set();
        let u = found;
        while (u && u.id !== root.id) {
            const parent = getMigrateAgentByWallet(u.parentWallet);
            if (parent && parent.id !== root.id) migrateTreeExpanded.add(parent.id);
            u = parent;
        }
        if (found.parentWallet === root.wallet) {
            const siblings = root.childIds || [];
            const idx = siblings.indexOf(found.id);
            if (idx >= 0) migrateState.treePage = Math.floor(idx / MIGRATE_TREE_PAGE_SIZE) + 1;
        }
        renderMigratePreviewContent();
        migrateState.validationErrors = checkMigrateValidation();
        updateMigrateSubmitState();
        setTimeout(function () {
            const el = document.getElementById('migrate-node-' + found.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    }

    function setMigrateTreePage(p) {
        migrateState.treePage = Math.max(1, p);
        renderMigratePreviewContent();
    }

    function setMigrateClientsPage(p) {
        migrateState.clientsPage = Math.max(1, p);
        renderMigratePreviewContent();
    }

    function renderMigratePreviewContent() {
        const body = document.getElementById('migrate-preview-body');
        if (!body || !migrateState.preview) return;
        const p = migrateState.preview;
        const targetKey = (document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value || '').trim();
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        const target = findMigrateTarget(targetKey);
        const targetKind = classifyMigrateTargetKind(target);
        let html = '';
        if (target) {
            const targetLabel = targetKind === 'plain_host' ? '普通用户（非代理）'
                : (targetKind === 'l1' ? '一级代理' : 'N 级代理');
            const ratioText = !needsMigrateRatio(p) ? '无需配置比例' : (isNaN(ratioVal) ? '—' : ratioVal + '%');
            const targetRatioText = isPlainHostTarget(target) ? '—' : (target.ratio + '%');
            html += '<p class="font-bold text-slate-800">新上级：' + chip(target.wallet, 'wallet') + ' · ' + targetLabel +
                (targetRatioText !== '—' ? ' (' + targetRatioText + ')' : '') + ' · 迁移主体比例：' + ratioText + '</p>';
            if (targetKind === 'plain_host') {
                html += '<p class="text-[10px] text-amber-800 bg-amber-50 border border-amber-100 rounded p-2 mt-2">目标为<strong>普通用户</strong>：主体固定为下级直客，不可选代理身份，不可配置返佣比例。</p>';
            }
        } else if (targetKey) {
            html += '<p class="text-amber-700 font-bold">未找到目标上级，演示可试 0xTo...L1 · 0xPlain...Host · 0xNorm...L3</p>';
        }
        if (p.type === 'plain') {
            const roleLabel = p.targetIsPlainHost ? '下级直客（固定）'
                : (p.plainRole === 'sub_partner' ? '下级代理（合伙人）' : '下级直客');
            html += '<p class="text-slate-600 mt-2">迁移后身份：<strong>' + roleLabel + '</strong></p>';
            const clients = p.directClients;
            const clientPag = paginate(clients, migrateState.clientsPage || 1);
            migrateState.clientsPage = clientPag.page;
            html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">直客（一并迁移）</p><ul class="space-y-1">';
            clientPag.items.forEach(function (c) {
                html += '<li>' + chip(c.wallet, 'wallet') + (c.uid ? ' · ' + chip(c.uid, 'uid') : '') + '</li>';
            });
            html += '</ul><div id="migrate-clients-pagination"></div></div>';
        } else if (p.partnerUser) {
            const root = p.partnerUser;
            const effectiveRootRatio = !isNaN(ratioVal) ? ratioVal : root.ratio;
            const directIds = root.childIds || [];
            const treePage = migrateState.treePage || 1;
            const branchSlice = paginate(directIds, treePage);
            migrateState.treePage = branchSlice.page;
            const pageIds = branchSlice.items;
            html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">代理链路（树形 · 默认仅直接下级，点击 + 展开更深层）</p>';
            html += '<p class="text-[10px] text-slate-400 mb-2">相对层级：迁移主体 / 直接下级 / 二级下级… · 系统标准层级标注为「系统 Lx」</p>';
            html += '<div class="flex flex-wrap gap-2 items-center mb-3">';
            html += '<input id="migrate-tree-search-input" type="text" placeholder="钱包 / UID 快速定位" class="border rounded px-3 py-2 text-[11px] w-56 outline-none focus:ring-1 focus:ring-blue-500" onkeydown="if(event.key===\'Enter\')PartnerPortal.searchMigrateTree()">';
            html += '<button type="button" onclick="PartnerPortal.searchMigrateTree()" class="bg-slate-900 text-white px-4 py-2 rounded font-bold text-[11px]">定位</button>';
            html += '<span class="text-[10px] text-slate-400">在迁移伞内搜索并展开定位</span></div>';
            html += '<div class="bg-slate-50 border rounded-lg p-3">';
            html += renderMigrateTreeNode(root.id, root.id, effectiveRootRatio, 0);
            if (directIds.length) {
                html += '<div class="mt-3 border-t pt-3"><p class="text-[10px] font-bold text-slate-500 mb-2">直接下级支路（本页 ' + pageIds.length + ' / 总 ' + directIds.length + '）</p>';
                pageIds.forEach(function (cid) {
                    html += renderMigrateTreeNode(cid, root.id, effectiveRootRatio, 1);
                });
                html += '<div id="migrate-tree-pagination"></div></div>';
            }
            html += '</div>';
            if (p.directClients.length) {
                html += '<div class="mt-3"><p class="font-bold text-slate-600 mb-2">伞下直客 ' + p.directClients.length + ' 人</p>';
                html += '<p class="text-[10px] text-slate-500">直客随链路一并迁移，此处仅摘要展示</p></div>';
            }
        }
        body.innerHTML = html;
        if (p.type === 'plain') {
            mountListPagination('migrate-clients-pagination', p.directClients.length, migrateState.clientsPage || 1, 'migrate-clients');
        } else if (p.partnerUser) {
            mountListPagination('migrate-tree-pagination', (p.partnerUser.childIds || []).length, migrateState.treePage || 1, 'migrate-tree-branches');
        }
    }

    function showMigratePage() {
        migrateState = { subjectKey: '', preview: null, validationErrors: [], treePage: 1, clientsPage: 1 };
        migrateTreeExpanded = new Set();
        migrateRatioOverrides = {};
        migrateAttachments = [];
        migrateTreeHighlightId = null;
        const remarkEl = document.getElementById('migrate-remark-input');
        if (remarkEl) remarkEl.value = '';
        const fileEl = document.getElementById('migrate-attachment-input');
        if (fileEl) fileEl.value = '';
        renderMigrateAttachmentPreview();
        window.PartnerPortal_showPage('page-rebate-migrate');
        ['migrate-subject-input', 'migrate-target-input', 'migrate-ratio-input'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const card = document.getElementById('migrate-subject-card');
        if (card) card.classList.add('hidden');
        document.getElementById('migrate-preview-section').classList.add('hidden');
        document.getElementById('migrate-errors-section').classList.add('hidden');
        document.getElementById('migrate-submit-footer').classList.add('hidden');
        const hint = document.getElementById('migrate-ratio-hint');
        if (hint) hint.textContent = '';
        const roleDirect = document.querySelector('input[name="migrate-plain-role"][value="direct_client"]');
        if (roleDirect) roleDirect.checked = true;
        updateMigratePlainRoleUI();
        updateMigrateSubmitState();
    }

    function renderMigrateSubjectCard(subject, preview) {
        const card = document.getElementById('migrate-subject-card');
        if (!card) return;
        if (!subject) {
            card.innerHTML = '<p class="text-red-700 font-bold">未找到待迁移用户。演示：普通 0xPlain...U1 · 直客 0xde...55aa · N级 0xMig...Ok / 0xNorm...L3</p>';
            card.classList.remove('hidden');
            return;
        }
        let html = '<div class="flex flex-wrap items-center gap-2 mb-2">' +
            '<span class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-black">系统自动识别：' + subject.label + '</span></div>';
        if (preview.type === 'plain') {
            const p = preview.plainUser;
            const roleLabel = preview.targetIsPlainHost ? '下级直客（固定）'
                : (preview.plainRole === 'sub_partner' ? '下级代理（合伙人）' : '下级直客');
            html += '<p class="font-black text-slate-800">' + chip(p.wallet, 'wallet') + ' · ' + chip(p.uid, 'uid') + '</p>' +
                '<p class="text-slate-600 mt-1">' + p.note + ' · 迁移后身份：<strong>' + roleLabel + '</strong></p>' +
                '<p class="text-slate-500 mt-1">直客 ' + preview.directClients.length + ' 人（将一并迁移）</p>';
        } else {
            const u = preview.partnerUser;
            html += '<p class="font-black text-slate-800">' + chip(u.wallet, 'wallet') + ' · ' + chip(u.uid, 'uid') + migrateSystemLevelTag(u.level) + '</p>' +
                '<p class="text-slate-600 mt-1">' + migrateDepthLabel(0) + ' · ' + u.note + ' · 当前比例 <strong>' + u.ratio + '%</strong></p>' +
                '<p class="text-slate-500 mt-1">代理链路 ' + preview.agentChain.length + ' 人 · 伞下直客 ' + preview.directClients.length + ' 人</p>';
            const hint = document.getElementById('migrate-ratio-hint');
            const ratioIn = document.getElementById('migrate-ratio-input');
            if (hint) hint.innerHTML = '建议参考当前 <strong>' + u.ratio + '%</strong>。可在下方树中修改下级比例。';
            if (ratioIn && !ratioIn.value) ratioIn.value = Math.min(u.ratio, OPS_CAP);
        }
        card.innerHTML = html;
        card.classList.remove('hidden');
    }

    function previewMigrate() {
        const subjectKey = (document.getElementById('migrate-subject-input') && document.getElementById('migrate-subject-input').value || '').trim();
        migrateState.subjectKey = subjectKey;
        const previewSec = document.getElementById('migrate-preview-section');
        const errSec = document.getElementById('migrate-errors-section');
        const body = document.getElementById('migrate-preview-body');

        if (!subjectKey) {
            migrateState.preview = null;
            migrateState.validationErrors = [];
            const card = document.getElementById('migrate-subject-card');
            if (card) card.classList.add('hidden');
            if (previewSec) previewSec.classList.add('hidden');
            if (errSec) errSec.classList.add('hidden');
            updateMigratePlainRoleUI();
            updateMigrateSubmitState();
            return;
        }

        const subject = resolveMigrateSubject(subjectKey);
        if (!subject) {
            migrateState.preview = null;
            migrateState.validationErrors = ['未找到待迁移用户'];
            renderMigrateSubjectCard(null, null);
            if (previewSec) previewSec.classList.add('hidden');
            const list = document.getElementById('migrate-errors-list');
            if (list) list.innerHTML = '<li>未找到待迁移用户</li>';
            if (errSec) errSec.classList.remove('hidden');
            const footerErr = document.getElementById('migrate-submit-footer');
            if (footerErr) footerErr.classList.add('hidden');
            updateMigrateSubmitState();
            return;
        }

        migrateState.preview = buildMigratePreview(subject);
        renderMigrateSubjectCard(subject, migrateState.preview);
        updateMigratePlainRoleUI();
        migrateState.validationErrors = checkMigrateValidation();
        if (previewSec) previewSec.classList.remove('hidden');
        renderMigratePreviewContent();
        if (migrateState.validationErrors.length) {
            const list = document.getElementById('migrate-errors-list');
            if (list) list.innerHTML = migrateState.validationErrors.map(function (e) { return '<li>' + e + '</li>'; }).join('');
            if (errSec) errSec.classList.remove('hidden');
        } else if (errSec) errSec.classList.add('hidden');

        const footer = document.getElementById('migrate-submit-footer');
        if (footer) footer.classList.toggle('hidden', !migrateState.preview);

        updateMigrateSubmitState();
    }

    function updateMigrateSubmitState() {
        const btn = document.getElementById('migrate-submit-btn');
        if (!btn) return;
        const targetOk = document.getElementById('migrate-target-input') && document.getElementById('migrate-target-input').value.trim();
        const ratioVal = parseFloat(document.getElementById('migrate-ratio-input') && document.getElementById('migrate-ratio-input').value);
        const needsRatio = !migrateState.preview || migrateState.preview.type !== 'plain' || isMigratePlainAsPartner();
        const ratioOk = !needsRatio || (!isNaN(ratioVal) && ratioVal > 0);
        const ok = migrateState.preview && migrateState.validationErrors.length === 0 && targetOk && ratioOk;
        btn.disabled = !ok;
        btn.textContent = '提交风控审核';
        btn.className = ok ? 'bg-blue-600 text-white px-6 py-2 rounded font-black text-[11px]' :
            'bg-blue-600 text-white px-6 py-2 rounded font-black text-[11px] opacity-50 cursor-not-allowed';
    }

    function renderMigrateAttachmentPreview() {
        const el = document.getElementById('migrate-attachment-preview');
        if (!el) return;
        if (!migrateAttachments.length) {
            el.innerHTML = '';
            return;
        }
        el.innerHTML = migrateAttachments.map(function (a, i) {
            return '<div class="relative group border rounded overflow-hidden w-16 h-16 bg-white">' +
                '<img src="' + a.dataUrl + '" alt="' + a.name + '" class="w-full h-full object-cover">' +
                '<button type="button" onclick="PartnerPortal.removeMigrateAttachment(' + i + ')" class="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 leading-none opacity-90">×</button>' +
                '<span class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-1 truncate">' + a.name + '</span></div>';
        }).join('');
    }

    function handleMigrateAttachmentFiles(input) {
        if (!input || !input.files) return;
        const files = Array.from(input.files);
        const remain = 4 - migrateAttachments.length;
        if (remain <= 0) {
            alert('最多上传 4 张图片');
            input.value = '';
            return;
        }
        const toAdd = files.slice(0, remain);
        if (files.length > remain) alert('最多上传 4 张图片，已忽略超出部分');
        let pending = toAdd.length;
        if (!pending) {
            input.value = '';
            return;
        }
        toAdd.forEach(function (file) {
            if (!file.type || file.type.indexOf('image/') !== 0) {
                pending--;
                if (pending === 0) input.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function (ev) {
                migrateAttachments.push({ name: file.name, dataUrl: ev.target.result });
                renderMigrateAttachmentPreview();
                pending--;
                if (pending === 0) input.value = '';
            };
            reader.readAsDataURL(file);
        });
    }

    function removeMigrateAttachment(index) {
        migrateAttachments.splice(index, 1);
        renderMigrateAttachmentPreview();
        const fileEl = document.getElementById('migrate-attachment-input');
        if (fileEl) fileEl.value = '';
    }

    function openMigrateConfirmModal() {
        if (!migrateState.preview || migrateState.validationErrors.length) {
            alert('请先填写完整迁移信息');
            return;
        }
        const p = migrateState.preview;
        const target = findMigrateTarget(document.getElementById('migrate-target-input').value);
        const needsRatio = needsMigrateRatio(p);
        const ratioVal = getMigrateRatioInputValue(p);
        if (!target || (needsRatio && ratioVal == null)) return;
        const subjectWallet = p.type === 'plain' ? p.plainUser.wallet : p.partnerUser.wallet;
        let body = '<p class="text-[11px] text-slate-600 mb-3">确认后将提交<strong>风控审核</strong>，审批通过后将<strong>即刻生效</strong>：</p>';
        body += '<ul class="text-[11px] space-y-2 text-slate-800">';
        body += '<li><span class="text-slate-500">待迁移</span> <b>' + subjectWallet + '</b></li>';
        body += '<li><span class="text-slate-500">迁移到</span> <b>' + target.wallet + '</b></li>';
        if (p.type === 'plain') {
            const roleLabel = p.targetIsPlainHost ? '下级直客（固定）'
                : (p.plainRole === 'sub_partner' ? '下级代理（合伙人）' : '下级直客');
            body += '<li><span class="text-slate-500">迁移后身份</span> <b>' + roleLabel + '</b></li>';
        }
        if (needsRatio) {
            body += '<li><span class="text-slate-500">迁移后比例</span> <b>' + ratioVal + '%</b></li>';
        } else {
            body += '<li><span class="text-slate-500">返佣比例</span> <b>无需配置（下级直客）</b></li>';
        }
        const remarkText = (document.getElementById('migrate-remark-input') && document.getElementById('migrate-remark-input').value.trim()) || '无';
        body += '<li><span class="text-slate-500">审核备注</span> ' + remarkText + '</li>';
        body += '<li><span class="text-slate-500">图片附件</span> ' + (migrateAttachments.length ? migrateAttachments.map(function (a) { return a.name; }).join('、') : '无') + '</li>';
        body += '</ul>';
        document.getElementById('migrate-confirm-body').innerHTML = body;
        document.getElementById('modal-migrate-confirm').classList.remove('hidden');
    }

    function closeMigrateConfirmModal() {
        document.getElementById('modal-migrate-confirm').classList.add('hidden');
    }

    function submitMigrate() {
        openMigrateConfirmModal();
    }

    function confirmMigrateSubmit() {
        closeMigrateConfirmModal();
        if (!migrateState.preview || migrateState.validationErrors.length) return;
        const target = findMigrateTarget(document.getElementById('migrate-target-input').value);
        const p = migrateState.preview;
        const needsRatio = needsMigrateRatio(p);
        const ratioVal = getMigrateRatioInputValue(p);
        if (!target || (needsRatio && ratioVal == null)) return;
        const subjectWallet = p.type === 'plain' ? p.plainUser.wallet : p.partnerUser.wallet;
        const subjectUid = p.type === 'plain' ? p.plainUser.uid : p.partnerUser.uid;
        const plainRole = p.type === 'plain' ? p.plainRole : null;
        const roleSummary = plainRole === 'direct_client' ? '下级直客' : (plainRole === 'sub_partner' ? '下级代理' : '');
        const summarySuffix = needsRatio ? ratioVal + '%' : roleSummary;
        if (typeof submitApprovalApplication === 'function') {
            const remarkEl = document.getElementById('migrate-remark-input');
            const remark = (remarkEl && remarkEl.value.trim()) || '';
            const attachmentNames = migrateAttachments.map(function (a) { return a.name; });
            const attachmentPreviews = {};
            migrateAttachments.forEach(function (a) { attachmentPreviews[a.name] = a.dataUrl; });
            submitApprovalApplication({
                type: 'partner_rebate_migrate',
                title: '返佣关系迁移',
                flowProfile: 'risk_only',
                applicant: 'Mkt_Allen',
                remark: remark || '返佣关系迁移申请',
                summary: subjectWallet + ' → ' + target.wallet + ' · ' + summarySuffix,
                payload: {
                    subjectWallet: subjectWallet,
                    subjectUid: subjectUid,
                    subjectType: p.type,
                    plainRole: plainRole,
                    migrateAsPartner: p.type === 'partner' || plainRole === 'sub_partner',
                    targetWallet: target.wallet,
                    targetUid: target.uid || '',
                    targetKind: classifyMigrateTargetKind(target),
                    newRatio: needsRatio ? ratioVal : null,
                    opsCap: OPS_CAP,
                    attachments: attachmentNames,
                    attachmentPreviews: attachmentPreviews
                }
            });
            alert('已提交风控审核（演示）。审批通过后将即刻生效。');
        } else {
            alert('审批模块未加载（演示）');
        }
        showMigratePage();
    }

    const PARTNER_APP_TYPES = ['partner_l1_bind', 'partner_ratio_change', 'partner_rebate_migrate'];
    const PARTNER_TYPE_LABELS = {
        partner_l1_bind: '一级合伙人绑定',
        partner_ratio_change: '返佣比例调整（超出上限）',
        partner_rebate_migrate: '返佣关系迁移'
    };
    const PARTNER_OP_TYPE_LABELS = {
        submit: '提交审批',
        cross_pass: '交叉审核通过',
        risk_pass: '风控审核通过',
        boss_pass: '老板审批通过',
        reject: '审批驳回',
        ratio_change: '返佣比例调整',
        migrate: '返佣关系迁移',
        bind: '一级合伙人绑定'
    };

    function mapTimelineToOpType(action, appType) {
        const a = action || '';
        if (a.indexOf('驳回') >= 0 || a.indexOf('拒绝') >= 0) return 'reject';
        if (a.indexOf('老板') >= 0 && a.indexOf('通过') >= 0) return 'boss_pass';
        if (a.indexOf('风控') >= 0 && a.indexOf('通过') >= 0) return 'risk_pass';
        if (a.indexOf('交叉') >= 0 && a.indexOf('通过') >= 0) return 'cross_pass';
        if (a.indexOf('提交') >= 0) {
            if (appType === 'partner_rebate_migrate') return 'migrate';
            if (appType === 'partner_l1_bind') return 'bind';
            if (appType === 'partner_ratio_change') return 'ratio_change';
            return 'submit';
        }
        return 'submit';
    }

    const PARTNER_OP_LOG_SEEDS = [
        { time: '2026-08-11 09:20', operator: 'Mkt_Allen', opType: 'migrate', opLabel: '提交·返佣关系迁移', appId: 'APR20260811002', typeLabel: '返佣关系迁移', summary: '0xMig...Ok → 0xTo...L1 · 48%', note: '正常代理整伞迁移' },
        { time: '2026-08-11 08:45', operator: 'Mkt_Allen', opType: 'ratio_change', opLabel: '提交·返佣比例调整（超出上限）', appId: 'APR20260811004', typeLabel: '返佣比例调整（超出上限）', summary: '0xNorm...L3 45%', note: '渠道协商下调' },
        { time: '2026-08-10 16:30', operator: 'Risk_Control', opType: 'risk_pass', opLabel: '风控审核通过', appId: 'APR20260810003', typeLabel: '一级合伙人绑定', summary: '0xNew...L1 72%', note: '' },
        { time: '2026-08-10 11:00', operator: 'Boss', opType: 'boss_pass', opLabel: '老板审批通过', appId: 'APR20260810003', typeLabel: '一级合伙人绑定', summary: '0xNew...L1 72%', note: 'Lark 同步通过' },
        { time: '2026-08-09 14:22', operator: 'Mkt_Cross', opType: 'reject', opLabel: '审批驳回', appId: 'APR20260809001', typeLabel: '返佣关系迁移', summary: '0xMig...Fail 迁移申请', note: '目标上级信息不完整，请补充后重提' }
    ];

    function collectPartnerOpLogs() {
        const logs = [];
        const seen = new Set();
        try {
            const apps = JSON.parse(localStorage.getItem('forx_approval_applications') || '[]');
            apps.forEach(function (app) {
                if (PARTNER_APP_TYPES.indexOf(app.type) === -1) return;
                (app.timeline || []).forEach(function (t) {
                    const opType = mapTimelineToOpType(t.action, app.type);
                    const key = app.id + '|' + t.at + '|' + t.action;
                    if (seen.has(key)) return;
                    seen.add(key);
                    logs.push({
                        time: t.at,
                        operator: t.actor,
                        opType: opType,
                        opLabel: PARTNER_OP_TYPE_LABELS[opType] || t.action,
                        action: t.action,
                        appId: app.id,
                        appType: app.type,
                        typeLabel: PARTNER_TYPE_LABELS[app.type] || app.type,
                        summary: app.summary || '',
                        note: t.note || ''
                    });
                });
            });
        } catch (e) { /* ignore */ }
        PARTNER_OP_LOG_SEEDS.forEach(function (s) {
            const key = s.appId + '|' + s.time + '|' + s.opLabel;
            if (!seen.has(key)) logs.push(s);
        });
        logs.sort(function (a, b) { return (b.time || '').localeCompare(a.time || ''); });
        return logs;
    }

    let partnerOpLogsPage = 1;

    function showPartnerLogsPage() {
        partnerOpLogsPage = 1;
        window.PartnerPortal_showPage('page-partner-logs');
        resetPartnerLogFilters();
    }

    function resetPartnerLogFilters() {
        const opEl = document.getElementById('partner-logs-filter-operator');
        const typeSel = document.getElementById('partner-logs-filter-type');
        const appIdEl = document.getElementById('partner-logs-filter-appid');
        const appTypeSel = document.getElementById('partner-logs-filter-apptype');
        if (opEl) opEl.value = '';
        if (typeSel) typeSel.value = 'all';
        if (appIdEl) appIdEl.value = '';
        if (appTypeSel) appTypeSel.value = 'all';
        partnerOpLogsPage = 1;
        renderPartnerOpLogs();
    }

    function applyPartnerLogFilters() {
        partnerOpLogsPage = 1;
        renderPartnerOpLogs();
    }

    function renderPartnerOpLogs() {
        const typeSel = document.getElementById('partner-logs-filter-type');
        const opEl = document.getElementById('partner-logs-filter-operator');
        const appIdEl = document.getElementById('partner-logs-filter-appid');
        const appTypeSel = document.getElementById('partner-logs-filter-apptype');
        const type = typeSel ? typeSel.value : 'all';
        const operatorQ = (opEl && opEl.value.trim()) || '';
        const appIdQ = (appIdEl && appIdEl.value.trim().toUpperCase()) || '';
        const appType = appTypeSel ? appTypeSel.value : 'all';
        let list = collectPartnerOpLogs();
        if (type !== 'all') list = list.filter(function (l) { return l.opType === type; });
        if (operatorQ) {
            const q = operatorQ.toLowerCase();
            list = list.filter(function (l) { return (l.operator || '').toLowerCase().indexOf(q) !== -1; });
        }
        if (appIdQ) {
            list = list.filter(function (l) { return (l.appId || '').toUpperCase().indexOf(appIdQ) !== -1; });
        }
        if (appType !== 'all') {
            list = list.filter(function (l) { return l.appType === appType; });
        }
        const sliced = paginate(list, partnerOpLogsPage);
        partnerOpLogsPage = sliced.page;
        const tbody = document.getElementById('partner-logs-body');
        if (!tbody) return;
        tbody.innerHTML = sliced.items.length ? sliced.items.map(function (l) {
            const badgeCls = l.opType === 'reject' ? 'bg-red-100 text-red-700' :
                (l.opType.indexOf('pass') >= 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800');
            return '<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-500 text-[11px]">' + l.time + '</td>' +
                '<td class="px-3 py-3 font-bold">' + l.operator + '</td>' +
                '<td class="px-3 py-3"><span class="' + badgeCls + ' px-2 py-0.5 rounded text-[10px] font-black">' + l.opLabel + '</span></td>' +
                '<td class="px-3 py-3 font-mono text-[10px] font-bold">' + (l.appId || '—') + '</td>' +
                '<td class="px-3 py-3 text-[10px] text-slate-600">' + (l.typeLabel || '—') + '</td>' +
                '<td class="px-3 py-3 text-[11px]">' + (l.summary || '—') + '</td>' +
                '<td class="px-3 py-3 text-[10px] text-slate-500">' + (l.note || '—') + '</td></tr>';
        }).join('') : '<tr><td colspan="7" class="px-4 py-12 text-center text-slate-400">暂无操作记录</td></tr>';
        mountListPagination('partner-logs-pagination', sliced.total, partnerOpLogsPage, 'partner-logs');
    }

    window.PartnerPortal = {
        showList: showList, showDetail: showDetail, showDetailDrill: showDetailDrill, showTree: showTree,
        openDrillTeam: openDrillTeam, detailDrillBack: detailDrillBack,
        setDetailSubFilter: setDetailSubFilter, setDrillStatsPeriod: setDrillStatsPeriod,
        setDrillSubFilter: setDrillSubFilter, setDrillSubSearch: setDrillSubSearch, switchDrillTab: switchDrillTab,
        openTeamTreeModal: openTeamTreeModal, closeTeamTreeModal: closeTeamTreeModal,
        toggleTeamTreeLine: toggleTeamTreeLine, expandAllTeamTrees: expandAllTeamTrees,
        switchDetailTab: switchDetailTab,
        toggleTreeExpand: toggleTreeExpand, refreshTree: refreshTree,
        filterDetailTable: filterDetailTable, setListFilter: setListFilter,
        applyListSearch: applyListSearch, setListSort: setListSort, setListStatsPeriod: setListStatsPeriod,
        setDetailStatsPeriod: setDetailStatsPeriod,
        stageRatioChange: stageRatioChange,
        clearPendingChanges: clearPendingChanges, submitPendingChanges: submitPendingChanges,
        openTreeConfirmModal: openTreeConfirmModal, closeTreeConfirmModal: closeTreeConfirmModal, confirmTreeSubmit: confirmTreeSubmit,
        openBindModal: openBindModal, closeBindModal: closeBindModal, submitBindPartner: submitBindPartner, previewBindPartner: previewBindPartner,
        filterSettlementBatches: filterSettlementBatches, showReviewDetail: showReviewDetail,
        backToSettlementList: backToSettlementList, renderPartnerList: renderPartnerList,
        openEditActual: openEditActual, openBatchEditPage: openBatchEditPage, closeBatchEditPage: closeBatchEditPage,
        closeEditActualModal: closeEditActualModal, saveEditActual: saveEditActual,
        submitBatchEditLines: submitBatchEditLines, handleBatchEditFile: handleBatchEditFile,
        switchSettlementDetailTab: switchSettlementDetailTab,
        applySettlementDetailFilters: applySettlementDetailFilters, applySupplementDetailFilters: applySupplementDetailFilters,
        resetSettlementDetailFilters: resetSettlementDetailFilters, resetSupplementDetailFilters: resetSupplementDetailFilters,
        initSettlementDatePickers: initSettlementDatePickers,
        openEditSupplement: openEditSupplement, closeEditSupplementModal: closeEditSupplementModal, saveEditSupplement: saveEditSupplement,
        showMigratePage: showMigratePage, previewMigrate: previewMigrate, submitMigrate: submitMigrate,
        confirmMigrateSubmit: confirmMigrateSubmit, closeMigrateConfirmModal: closeMigrateConfirmModal,
        toggleMigrateTreeExpand: toggleMigrateTreeExpand, stageMigrateRatioChange: stageMigrateRatioChange,
        setMigrateTreePage: setMigrateTreePage, setMigrateClientsPage: setMigrateClientsPage,
        searchRebateTree: searchRebateTree,
        searchMigrateTree: searchMigrateTree,
        setRebateTreeBranchPage: setRebateTreeBranchPage,
        showPartnerLogsPage: showPartnerLogsPage,
        renderPartnerOpLogs: renderPartnerOpLogs,
        applyPartnerLogFilters: applyPartnerLogFilters,
        resetPartnerLogFilters: resetPartnerLogFilters,
        handleMigrateAttachmentFiles: handleMigrateAttachmentFiles,
        removeMigrateAttachment: removeMigrateAttachment,
        handleBindAttachmentFiles: handleBindAttachmentFiles,
        removeBindAttachment: removeBindAttachment,
        handleTreeAttachmentFiles: handleTreeAttachmentFiles,
        removeTreeAttachment: removeTreeAttachment,
        getCurrentUserId: function () { return currentUserId; },
        getDetailDrillStack: function () { return detailDrillStack.slice(); },
        downloadSettlementReconciliationPackage: downloadSettlementReconciliationPackage,
        applyHashTree: applyHashTree, DATA_VERSION: DATA_VERSION,
        applyPartnerApprovalEffect: applyPartnerApprovalEffect
    };

    window.applyPartnerApprovalEffect = applyPartnerApprovalEffect;

    document.addEventListener('DOMContentLoaded', function () {
        if (window.AdminPagination) {
            AdminPagination.register('partner-list', function (p) { listPage = p; renderPartnerList(); });
            AdminPagination.register('detail-sub', function (p) {
                detailSubPage = p;
                const u = getUser(currentUserId);
                if (u) renderMirrorSubTable(u, {
                    prefix: 'detail', period: detailStatsPeriod, subFilter: detailSubFilter,
                    search: detailTableFilter, subPage: detailSubPage, subPageKey: 'detail'
                });
            });
            AdminPagination.register('detail-drill-sub', function (p) {
                drillSubPage = p;
                const u = getUser(currentUserId);
                if (u) renderMirrorSubTable(u, {
                    prefix: 'drill', period: drillStatsPeriod, subFilter: drillSubFilter,
                    search: drillSubSearch, subPage: drillSubPage, subPageKey: 'drill', isDrill: true
                });
            });
            AdminPagination.register('detail-clients', function (p) {
                detailClientPage = p;
                const u = getUser(currentUserId);
                if (u) renderMirrorClientTable(u, {
                    prefix: 'detail', search: detailTableFilter, clientPage: detailClientPage, clientPageKey: 'detail'
                });
            });
            AdminPagination.register('detail-drill-clients', function (p) {
                drillClientPage = p;
                const u = getUser(currentUserId);
                if (u) renderMirrorClientTable(u, {
                    prefix: 'drill', search: drillSubSearch, clientPage: drillClientPage, clientPageKey: 'drill'
                });
            });
            AdminPagination.register('settlement-batch', function (p) { settlementBatchPage = p; filterSettlementBatches(); });
            AdminPagination.register('settlement-detail', function (p) { settlementDetailPage = p; renderSettlementDetailRows(); });
            AdminPagination.register('settlement-supplement', function (p) { supplementDetailPage = p; renderSettlementSupplementRows(); });
            AdminPagination.register('migrate-tree-branches', function (p) { migrateState.treePage = p; renderMigratePreviewContent(); });
            AdminPagination.register('migrate-clients', function (p) { migrateState.clientsPage = p; renderMigratePreviewContent(); });
            AdminPagination.register('rebate-tree-branches', function (p) { setRebateTreeBranchPage(p); });
            AdminPagination.register('partner-logs', function (p) { partnerOpLogsPage = p; renderPartnerOpLogs(); });
        }
        updatePeriodTabUi('list', listStatsPeriod);
        renderPartnerList();
        filterSettlementBatches();
        initSettlementDatePickers();
        applyHashTree();
    });
    window.addEventListener('hashchange', applyHashTree);
})();
