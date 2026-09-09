/**
 * 合伙人中心 App 原型交互逻辑
 */
(function () {
    const DATA_VERSION = 'partner-app-02';
    const LIST_END_HINT = '已展示全部记录';
    const SCROLL_LOAD_HINT = '继续下滑加载更多';
    const SOURCE_LABELS = ['自己产生', '直属直客', '合伙人级差'];
    const SOURCE_COLORS = ['#93c5fd', '#3b82f6', '#1e3a8a'];
    const ACTIVE_TRADERS_TIP = '交易用户数据每天 UTC+8 0 点更新';
    const TEAM_NET_DEPOSIT_TIP = '团队净入金数据每天 UTC+8 0 点更新';
    const PERIOD_SCALE = { '1D': 0.14, '1W': 1, '1M': 4.2, '3M': 12 };
    const LINKS_CHART_POINTS = { '1D': 24, '1W': 7, '1M': 30, '3M': 90 };
    const LINKS_CHART_LABEL_STEP = { '1D': 6, '1W': 1, '1M': 5, '3M': 15 };
    const MY_MAX_RATIO = 70;
    const PAGE_SIZE = 5;
    const PERIODS = ['1D', '1W', '1M', '3M'];
    const ANALYTICS_METRICS = [
        { key: 'vol', label: '交易额' },
        { key: 'rebate', label: '返佣' },
        { key: 'users', label: '人数' },
        { key: 'traders', label: '交易人数' },
        { key: 'net', label: '净入金' }
    ];

    let activeTab = 'links';
    let stackMode = null;
    let overviewPeriod = '1W';
    let analyticsPeriod = '1W';
    let analyticsDimTab = 'vol';
    let linksPeriod = '1W';
    let linksPage = 1;
    let linksSearch = '';
    let subPartnerSearch = '';
    let activeTeamTable = 'sub-agent';
    let subPartnerPage = 1;
    let directClientPage = 1;
    let settlementPage = 1;
    let settlementDateFilter = '';
    let settlementStatusFilter = 'all';
    let commissionDetailDate = '';
    let commissionDetailPage = 1;
    let commissionTradesUid = '';
    let commissionTradesPage = 1;
    let adjustRatioPartnerId = null;
    let shareLinkCode = '';
    let editLinkCode = '';
    let periodPickerTarget = '';
    let pendingConfirmAction = null;
    let drillStack = [];
    let drillPeriod = '1W';
    let drillActiveTable = 'sub-agent';
    let scrollLoadBound = false;
    let toastTimer = null;

    const mySuperiorInfo = {
        level: 2,
        parentUid: '10085088',
        parentWallet: '0x1a2b...3c4d',
        parentWalletFull: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d',
        myRatio: 70
    };

    const myPartnerProfile = {
        uid: '10086000',
        wallet: '0x9f...8a1',
        walletFull: '0x9f8a1b2c3d4e5f60718293a4b5c6d7e8f9012a9f8',
        ratio: 70
    };

    const settlementRecords = [
        { date: '2024-05-23', vol: 0, rebate: 0, status: 'pending' },
        { date: '2024-05-22', vol: 1240000, rebate: 868, status: 'settled' },
        { date: '2024-05-21', vol: 980000, rebate: 686, status: 'settled' },
        { date: '2024-05-20', vol: 86800, rebate: 61, status: 'pending' },
        { date: '2024-05-19', vol: 820000, rebate: 1003, violationDeduction: 342.23, violationReason: '经风控核查，该结算日伞下存在异常刷单交易，按合伙人协议第 8.2 条扣减相应返佣。', status: 'pending' },
        { date: '2024-05-18', vol: 650000, rebate: 455, status: 'settled' },
        { date: '2024-05-17', vol: 420000, rebate: 294, status: 'pending' },
        { date: '2024-05-16', vol: 380000, rebate: 266, status: 'settled' },
        { date: '2024-05-15', vol: 125000, rebate: 88, status: 'settled' },
        { date: '2024-05-14', vol: 290000, rebate: 203, status: 'settled' },
        { date: '2024-05-13', vol: 510000, rebate: 357, status: 'settled' },
        { date: '2024-05-12', vol: 0, rebate: 0, status: 'pending' }
    ];

    const commissionDetailRecords = [
        { date: '2024-05-22', time: '2024-05-22 23:58:12', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 820000, ratio: '级差 10%', rebate: 820 },
        { date: '2024-05-22', time: '2024-05-22 21:14:33', uid: '10086003', sourceType: '下级', remark: '推特KOL-J', vol: 560000, ratio: '级差 20%', rebate: 112 },
        { date: '2024-05-22', time: '2024-05-22 18:42:05', uid: '10086008', sourceType: '直客', remark: '', vol: 128000, ratio: '返佣 70%', rebate: 89.6 },
        { date: '2024-05-22', time: '2024-05-22 16:20:41', uid: '10086009', sourceType: '直客', remark: '', vol: 42500, ratio: '返佣 70%', rebate: 29.75 },
        { date: '2024-05-22', time: '2024-05-22 11:08:19', uid: '10086006', sourceType: '下级', remark: '韩国KOL', vol: 310000, ratio: '级差 25%', rebate: 77.5 },
        { date: '2024-05-21', time: '2024-05-21 22:45:08', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 640000, ratio: '级差 10%', rebate: 640 },
        { date: '2024-05-21', time: '2024-05-21 19:33:27', uid: '10086010', sourceType: '直客', remark: '', vol: 8900, ratio: '返佣 70%', rebate: 6.23 },
        { date: '2024-05-21', time: '2024-05-21 15:12:54', uid: '10086004', sourceType: '下级', remark: '东南亚渠道', vol: 220000, ratio: '级差 15%', rebate: 33 },
        { date: '2024-05-21', time: '2024-05-21 09:55:03', uid: '10086011', sourceType: '直客', remark: '', vol: 256000, ratio: '返佣 70%', rebate: 179.2 },
        { date: '2024-05-20', time: '2024-05-20 20:18:46', uid: '10086003', sourceType: '下级', remark: '推特KOL-J', vol: 180000, ratio: '级差 20%', rebate: 36 },
        { date: '2024-05-20', time: '2024-05-20 17:02:11', uid: '10086008', sourceType: '直客', remark: '', vol: 52000, ratio: '返佣 70%', rebate: 36.4 },
        { date: '2024-05-19', time: '2024-05-19 23:40:22', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 410000, ratio: '级差 10%', rebate: 410 },
        { date: '2024-05-19', time: '2024-05-19 18:26:57', uid: '10086006', sourceType: '下级', remark: '韩国KOL', vol: 520000, ratio: '级差 25%', rebate: 130 },
        { date: '2024-05-19', time: '2024-05-19 14:11:08', uid: '10086009', sourceType: '直客', remark: '', vol: 18500, ratio: '返佣 70%', rebate: 12.95 },
        { date: '2024-05-19', time: '2024-05-19 10:05:33', uid: '10086005', sourceType: '下级', remark: '', vol: 98000, ratio: '级差 15%', rebate: 14.7 },
        { date: '2024-05-18', time: '2024-05-18 21:33:19', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 350000, ratio: '级差 10%', rebate: 350 },
        { date: '2024-05-18', time: '2024-05-18 16:48:42', uid: '10086011', sourceType: '直客', remark: '', vol: 92000, ratio: '返佣 70%', rebate: 64.4 },
        { date: '2024-05-18', time: '2024-05-18 12:22:07', uid: '10086004', sourceType: '下级', remark: '东南亚渠道', vol: 160000, ratio: '级差 15%', rebate: 24 },
        { date: '2024-05-17', time: '2024-05-17 22:10:55', uid: '10086003', sourceType: '下级', remark: '推特KOL-J', vol: 210000, ratio: '级差 20%', rebate: 42 },
        { date: '2024-05-17', time: '2024-05-17 18:55:31', uid: '10086010', sourceType: '直客', remark: '', vol: 12000, ratio: '返佣 70%', rebate: 8.4 },
        { date: '2024-05-17', time: '2024-05-17 13:40:18', uid: '10086006', sourceType: '下级', remark: '韩国KOL', vol: 280000, ratio: '级差 25%', rebate: 70 },
        { date: '2024-05-16', time: '2024-05-16 20:05:44', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 190000, ratio: '级差 10%', rebate: 190 },
        { date: '2024-05-16', time: '2024-05-16 15:33:26', uid: '10086008', sourceType: '直客', remark: '', vol: 76000, ratio: '返佣 70%', rebate: 53.2 },
        { date: '2024-05-15', time: '2024-05-15 19:22:11', uid: '10086004', sourceType: '下级', remark: '东南亚渠道', vol: 88000, ratio: '级差 15%', rebate: 13.2 },
        { date: '2024-05-15', time: '2024-05-15 11:18:09', uid: '10086009', sourceType: '直客', remark: '', vol: 31000, ratio: '返佣 70%', rebate: 21.7 },
        { date: '2024-05-14', time: '2024-05-14 21:44:57', uid: '10086006', sourceType: '下级', remark: '韩国KOL', vol: 420000, ratio: '级差 25%', rebate: 105 },
        { date: '2024-05-14', time: '2024-05-14 17:09:33', uid: '10086011', sourceType: '直客', remark: '', vol: 54000, ratio: '返佣 70%', rebate: 37.8 },
        { date: '2024-05-13', time: '2024-05-13 23:12:08', uid: '10086002', sourceType: '下级', remark: '渠道-小王', vol: 290000, ratio: '级差 10%', rebate: 290 },
        { date: '2024-05-13', time: '2024-05-13 14:56:41', uid: '10086003', sourceType: '下级', remark: '推特KOL-J', vol: 170000, ratio: '级差 20%', rebate: 34 }
    ];

    const commissionUserMeta = {
        '10086002': { wallet: '0x3f...12a', walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a' },
        '10086003': { wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c' },
        '10086004': { wallet: '0x2a...9f1', walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1' },
        '10086005': { wallet: '0x5c...882', walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882' },
        '10086006': { wallet: '0x7b...4c2', walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2' },
        '10086008': { wallet: '0xAb...12cd', walletFull: '0xAb12cd9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b12cd' },
        '10086009': { wallet: '0x99...F4d2', walletFull: '0x99F4d2a1b0c9d8e7f6059483726180a9b8c7d6e5' },
        '10086010': { email: 'demo.trader@forx.io' },
        '10086011': { wallet: '0xEf...33aa', walletFull: '0xEf33aa5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f33aa' }
    };

    const inviteLinksData = [
        { remark: '預設連結', code: 'E6DL28G', directCount: 124, subPartnerCount: 42, totalVol: 5200000, totalFee: 5200, rebateIncome: 3640, netDeposit: 420000, isDefault: true, disabled: false },
        { remark: '推特推廣-01', code: 'FORX99', directCount: 12, subPartnerCount: 0, totalVol: 850000, totalFee: 850, rebateIncome: 595, netDeposit: 62000, isDefault: false, disabled: false },
        { remark: 'YouTube-KOL', code: 'YT2024', directCount: 56, subPartnerCount: 3, totalVol: 2100000, totalFee: 2100, rebateIncome: 1470, netDeposit: 185000, isDefault: false, disabled: false },
        { remark: 'Discord社群', code: 'DSC001', directCount: 89, subPartnerCount: 5, totalVol: 1680000, totalFee: 1680, rebateIncome: 1176, netDeposit: 92000, isDefault: false, disabled: false },
        { remark: '亞洲渠道-A', code: 'ASIA01', directCount: 34, subPartnerCount: 2, totalVol: 980000, totalFee: 980, rebateIncome: 686, netDeposit: 45000, isDefault: false, disabled: false },
        { remark: '歐洲渠道-B', code: 'EUR002', directCount: 21, subPartnerCount: 1, totalVol: 720000, totalFee: 720, rebateIncome: 504, netDeposit: 38000, isDefault: false, disabled: false },
        { remark: '線下活動-深圳', code: 'SZ2405', directCount: 45, subPartnerCount: 0, totalVol: 560000, totalFee: 560, rebateIncome: 392, netDeposit: 28000, isDefault: false, disabled: false },
        { remark: '線下活動-新加坡', code: 'SG2406', directCount: 18, subPartnerCount: 0, totalVol: 430000, totalFee: 430, rebateIncome: 301, netDeposit: 22000, isDefault: false, disabled: false },
        { remark: 'KOL合作-03', code: 'KOL003', directCount: 67, subPartnerCount: 4, totalVol: 1450000, totalFee: 1450, rebateIncome: 1015, netDeposit: 76000, isDefault: false, disabled: false },
        { remark: '媒體投放-01', code: 'MED001', directCount: 9, subPartnerCount: 0, totalVol: 320000, totalFee: 320, rebateIncome: 224, netDeposit: 15000, isDefault: false, disabled: false },
        { remark: '媒體投放-02', code: 'MED002', directCount: 14, subPartnerCount: 0, totalVol: 410000, totalFee: 410, rebateIncome: 287, netDeposit: 19000, isDefault: false, disabled: true },
        { remark: '社群裂變', code: 'VIRAL1', directCount: 102, subPartnerCount: 6, totalVol: 2890000, totalFee: 2890, rebateIncome: 2023, netDeposit: 156000, isDefault: false, disabled: false }
    ];

    const existingCodesList = inviteLinksData.map(function (r) { return r.code; });

    const subPartnersData = [
        { id: 'sp1', uid: '10086002', joinDate: '2024-05-12', wallet: '0x3f...12a', walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a', remark: '渠道-小王', ratio: 60, minSubRatio: 45, gap: 10, gapIncome: 1250, totalVol: 12500000, netDeposit: 500000, totalUsers: 3680, activeUsers: 1850, settlementStatus: 'normal', name: '合伙人-小王', hasTeam: true },
        { id: 'sp2', uid: '10086003', joinDate: '2024-05-10', wallet: '0x8e...55c', walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c', remark: '推特KOL-J', ratio: 50, minSubRatio: 40, gap: 20, gapIncome: 560, totalVol: 16200000, netDeposit: 820000, totalUsers: 850, activeUsers: 120, settlementStatus: 'normal', name: 'KOL-J', hasTeam: true },
        { id: 'sp3', uid: '10086005', joinDate: '2024-05-08', wallet: '0x5c...882', walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882', remark: '', ratio: 55, minSubRatio: 40, gap: 15, gapIncome: 320, totalVol: 2100000, netDeposit: -120000, totalUsers: 12, activeUsers: 0, settlementStatus: 'frozen', name: '合伙人-C', hasTeam: true },
        { id: 'sp4', uid: '10086004', joinDate: '2024-05-05', wallet: '0x2a...9f1', walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1', remark: '東南亞渠道', ratio: 55, minSubRatio: 40, gap: 15, gapIncome: 890, totalVol: 8900000, netDeposit: 320000, totalUsers: 620, activeUsers: 180, settlementStatus: 'normal', name: '东南亚渠道', hasTeam: true },
        { id: 'sp5', uid: '10086006', joinDate: '2024-04-28', wallet: '0x7b...4c2', walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2', remark: '韓國KOL', ratio: 45, minSubRatio: 30, gap: 25, gapIncome: 2100, totalVol: 22400000, netDeposit: 980000, totalUsers: 1580, activeUsers: 510, settlementStatus: 'normal', name: '韩国KOL', hasTeam: true }
    ];


    const directClientsData = [
        { uid: '10086009', joinDate: '2024-05-20', wallet: '0x99...F4d2', walletFull: '0x99F4d2a1b0c9d8e7f6059483726180a9b8c7d6e5', totalVol: 42500, totalFee: 42.50, rebate: 29.75, netDeposit: 5200 },
        { uid: '10086008', joinDate: '2024-05-18', wallet: '0xAb...12cd', walletFull: '0xAb12cd9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b12cd', totalVol: 128000, totalFee: 128.00, rebate: 89.60, netDeposit: 15000 },
        { uid: '10086010', joinDate: '2024-05-15', email: 'demo.trader@forx.io', totalVol: 8900, totalFee: 8.90, rebate: 6.23, netDeposit: -1200 },
        { uid: '10086011', joinDate: '2024-05-12', wallet: '0xEf...33aa', walletFull: '0xEf33aa5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f33aa', totalVol: 256000, totalFee: 256.00, rebate: 179.20, netDeposit: 32000 }
    ];

    const drillTeams = {
        sp1: {
            name: '合伙人-小王',
            label: '渠道-小王',
            wallet: '0x3f...12a',
            walletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a',
            joinDate: '2024-05-12',
            ratio: 60,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 12500000, totalRebate: 13000, selfRebate: 200, directRebate: 1200, gapRebate: 11600, teamNetDeposit: 524000, totalUsers: 3680, activeUsers: 1850 },
            abnormalText: null,
            subPartners: [
                { id: 'sp1_a', joinDate: '2024-05-11', wallet: '0x4a...b21', walletFull: '0x4ab21c32d54e67f8091a2b3c4d5e6f70891a2b21', ratio: 45, gap: 15, gapIncome: 420, totalVol: 4200000, netDeposit: 180000, totalUsers: 920, activeUsers: 310, settlementStatus: 'normal', name: '二级-KOL', hasTeam: true },
                { id: 'sp1_b', joinDate: '2024-05-09', wallet: '0x9c...a12', walletFull: '0x9ca12b34c56d78e90f1234567890abcdef9ca12', ratio: 50, gap: 10, gapIncome: 120, totalVol: 3100000, netDeposit: 95000, totalUsers: 480, activeUsers: 85, settlementStatus: 'normal', name: '下级-X', hasTeam: true },
            ],
            directClients: [
                { joinDate: '2024-05-19', wallet: '0x11...aa01', walletFull: '0x11aa01bb02cc03dd04ee05ff06gg07hh08ii01', totalVol: 52000, totalFee: 52.00, rebate: 36.40, netDeposit: 8000 },
                { joinDate: '2024-05-16', wallet: '0x22...bb02', walletFull: '0x22bb02cc03dd04ee05ff06gg07hh08ii09jj02', totalVol: 18500, totalFee: 18.50, rebate: 12.95, netDeposit: 2200 }
            ]
        },
        sp1_a: {
            name: '二级-KOL',
            label: '二级-KOL',
            wallet: '0x4a...b21',
            walletFull: '0x4ab21c32d54e67f8091a2b3c4d5e6f70891a2b21',
            joinDate: '2024-05-11',
            ratio: 45,
            superiorLevel: 3,
            superiorWallet: '0x3f...12a',
            superiorWalletFull: '0x3f8a2b1c9d4e5f60718293a4b5c6d7e8f9012a',
            overview: { teamVol: 4200000, totalRebate: 3200, selfRebate: 80, directRebate: 400, gapRebate: 2320, teamNetDeposit: 180000, totalUsers: 920, activeUsers: 310 },
            abnormalText: null,
            subPartners: [
                { id: 'sp1_a_x', joinDate: '2024-05-07', wallet: '0x5b...c32', walletFull: '0x5bc32d43e54f60718293a4b5c6d7e8f9012a3b4c32', ratio: 35, gap: 10, gapIncome: 180, totalVol: 980000, netDeposit: 42000, totalUsers: 210, activeUsers: 68, settlementStatus: 'normal', name: '三级渠道', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-14', wallet: '0x33...cc03', walletFull: '0x33cc03dd04ee05ff06gg07hh08ii09jj10kk03', totalVol: 31000, totalFee: 31.00, rebate: 21.70, netDeposit: 4500 }
            ]
        },
        sp2: {
            name: 'KOL-J',
            label: '推特KOL-J',
            wallet: '0x8e...55c',
            walletFull: '0x8e55c4d3b2a1908f7e6d5c4b3a291807f6e5d55c',
            joinDate: '2024-05-10',
            ratio: 50,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 16200000, totalRebate: 8400, selfRebate: 150, directRebate: 900, gapRebate: 6650, teamNetDeposit: 820000, totalUsers: 850, activeUsers: 120 },
            abnormalText: null,
            subPartners: [
                { id: 'sp2_a', joinDate: '2024-05-06', wallet: '0xBc...4431', walletFull: '0xBc4431a2098f7e6d5c4b3a291807f6e5d4c3b4431', ratio: 40, gap: 10, gapIncome: 0, totalVol: 5200000, netDeposit: 210000, totalUsers: 380, activeUsers: 55, settlementStatus: 'normal', name: '下级-A', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-13', wallet: '0x44...dd04', walletFull: '0x44dd04ee05ff06gg07hh08ii09jj10kk11ll04', totalVol: 72000, totalFee: 72.00, rebate: 50.40, netDeposit: 9800 }
            ]
        },
        sp4: {
            name: '东南亚渠道',
            label: '東南亞渠道',
            wallet: '0x2a...9f1',
            walletFull: '0x2a9f1e8d7c6b5a4938271605948372616059489f1',
            joinDate: '2024-05-05',
            ratio: 55,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 8900000, totalRebate: 5200, selfRebate: 120, directRebate: 680, gapRebate: 4000, teamNetDeposit: 320000, totalUsers: 620, activeUsers: 180 },
            abnormalText: null,
            subPartners: [],
            directClients: [
                { joinDate: '2024-05-17', wallet: '0x55...ee05', walletFull: '0x55ee05ff06gg07hh08ii09jj10kk11ll12mm05', totalVol: 44000, totalFee: 44.00, rebate: 30.80, netDeposit: 5600 },
                { joinDate: '2024-05-11', wallet: '0x66...ff06', walletFull: '0x66ff06gg07hh08ii09jj10kk11ll12mm13nn06', totalVol: 22000, totalFee: 22.00, rebate: 15.40, netDeposit: 3100 }
            ]
        },
        sp5: {
            name: '韩国KOL',
            label: '韓國KOL',
            wallet: '0x7b...4c2',
            walletFull: '0x7b4c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4c2',
            joinDate: '2024-04-28',
            ratio: 45,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 22400000, totalRebate: 11200, selfRebate: 280, directRebate: 1400, gapRebate: 9520, teamNetDeposit: 980000, totalUsers: 1580, activeUsers: 510 },
            abnormalText: null,
            subPartners: [
                { id: 'sp5_a', joinDate: '2024-04-20', wallet: '0x88...0d3', walletFull: '0x880d3e4f5a6b7c8d9e0f1a2b3c4d5e6f70880d3', ratio: 35, gap: 10, gapIncome: 520, totalVol: 6800000, netDeposit: 290000, totalUsers: 420, activeUsers: 140, settlementStatus: 'normal', name: '韩国下级', hasTeam: false }
            ],
            directClients: [
                { joinDate: '2024-05-08', wallet: '0x77...gg07', walletFull: '0x77gg07hh08ii09jj10kk11ll12mm13nn14oo07', totalVol: 98000, totalFee: 98.00, rebate: 68.60, netDeposit: 12000 }
            ]
        },
        sp3: {
            name: '异常合伙人',
            label: '异常合伙人',
            wallet: '0x5c...882',
            walletFull: '0x5c8821a0b9c8d7e6f504938271605948372618882',
            joinDate: '2024-05-08',
            ratio: 75,
            superiorLevel: 2,
            superiorWallet: myPartnerProfile.wallet,
            superiorWalletFull: myPartnerProfile.walletFull,
            overview: { teamVol: 2100000, totalRebate: 0, selfRebate: 0, directRebate: 0, gapRebate: 0, teamNetDeposit: -120000, totalUsers: 12, activeUsers: 0 },
            abnormalText: null,
            subPartners: [],
            directClients: [
                { joinDate: '2024-05-07', wallet: '0xaa...0011', walletFull: '0xaa0011bb22cc33dd44ee55ff66778899aa0011', totalVol: 15000, totalFee: 15.00, rebate: 0, netDeposit: -800 }
            ]
        }
    };

    (function bootstrapPartnerUserUids() {
        let seq = 10086001;
        function ensure(row) {
            if (row && !row.uid) row.uid = String(seq++);
        }
        function walk(arr) {
            if (!arr) return;
            arr.forEach(function (row) {
                ensure(row);
                if (row.subPartners) walk(row.subPartners);
                if (row.directClients) walk(row.directClients);
            });
        }
        walk(subPartnersData);
        walk(directClientsData);
        Object.keys(drillTeams).forEach(function (k) {
            const t = drillTeams[k];
            ensure(t);
            walk(t.subPartners);
            walk(t.directClients);
        });
    })();

    const overviewBase = {
        teamVol: 52450000,
        totalRebate: 13000,
        selfRebate: 200,
        directRebate: 1200,
        gapRebate: 11600,
        selfVol: 420000,
        directClientVol: 890000,
        partnerTeamVol: 51140000,
        teamUsers: 3680,
        selfUsers: 1,
        directClientUsers: 291,
        partnerTeamUsers: 3388,
        activeTraders: 1850,
        selfActiveTraders: 1,
        directClientActiveTraders: 186,
        partnerTeamActiveTraders: 1663,
        teamNetDeposit: 1240000,
        selfNetDeposit: 12000,
        directClientNetDeposit: 86000,
        partnerTeamNetDeposit: 1142000,
        volChange: 12.4,
        rebateChange: 8.6,
        usersChange: 2.8,
        activeTradersChange: 3.1,
        netDepositChange: 5.2
    };

    function fmtCompactMoney(n, opts) {
        opts = opts || {};
        const sign = n < 0 ? -1 : 1;
        const abs = Math.abs(n);
        let str;
        if (abs >= 1e9) str = '$' + (abs / 1e9).toFixed(2) + 'B';
        else if (abs >= 1e6) str = '$' + (abs / 1e6).toFixed(2) + 'M';
        else if (abs >= 1e3) str = '$' + (abs / 1e3).toFixed(2) + 'K';
        else str = '$' + abs.toFixed(2);
        if (sign < 0) str = '-' + str;
        else if (opts.signed && n > 0) str = '+' + str;
        return str;
    }

    function fmtMoney(n, opts) {
        opts = opts || {};
        const abs = Math.abs(n);
        let str;
        if (abs >= 1000) str = '$' + Math.round(n).toLocaleString();
        else str = '$' + n.toFixed(2);
        if (opts.signed && n > 0) str = '+' + str;
        if (opts.signed && n < 0) str = '-' + str.replace('-', '');
        return str;
    }

    function fmtNum(n) { return Math.round(n).toLocaleString(); }

    function esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function jsEsc(s) {
        return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }

    function clickHandler(method) {
        var args = Array.prototype.slice.call(arguments, 1);
        return ' onclick="PartnerCenterApp.' + method + '(' + args.map(function (a) {
            return "'" + jsEsc(a) + "'";
        }).join(', ') + ')"';
    }

    function fieldHintHtml(label, tip) {
        return '<span class="hint-dashed" title="' + esc(tip) + '">' + esc(label) + '</span>';
    }

    function uidCopyHtml(uid, label) {
        if (!uid) return '—';
        label = label || 'UID';
        return '<span class="uid-copy"><span class="font-mono font-black text-[12px]">' + esc(uid) + '</span>' +
            '<button type="button" class="uid-copy-btn" title="复制' + esc(label) + '"' + clickHandler('copyText', uid, label) + '>' +
            '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button></span>';
    }

    function showToast(message) {
        const el = document.getElementById('app-toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1800);
    }

    function openInfoDialog(title, body, confirmLabel) {
        const dialog = document.getElementById('app-dialog');
        const titleEl = document.getElementById('app-dialog-title');
        const bodyEl = document.getElementById('app-dialog-body');
        const actions = document.getElementById('app-dialog-actions');
        if (!dialog || !titleEl || !bodyEl || !actions) return;
        titleEl.textContent = title;
        bodyEl.textContent = body;
        actions.innerHTML = '<button type="button" class="app-dialog-confirm" onclick="PartnerCenterApp.closeDialog()">' + esc(confirmLabel || '确认') + '</button>';
        dialog.classList.add('active');
    }

    function openConfirmDialog(title, body, onConfirm) {
        const dialog = document.getElementById('app-dialog');
        const titleEl = document.getElementById('app-dialog-title');
        const bodyEl = document.getElementById('app-dialog-body');
        const actions = document.getElementById('app-dialog-actions');
        if (!dialog || !titleEl || !bodyEl || !actions) return;
        pendingConfirmAction = onConfirm;
        titleEl.textContent = title;
        bodyEl.textContent = body;
        actions.innerHTML =
            '<button type="button" class="app-dialog-cancel" onclick="PartnerCenterApp.closeDialog()">取消</button>' +
            '<button type="button" class="app-dialog-confirm" onclick="PartnerCenterApp.confirmDialog()">确认</button>';
        dialog.classList.add('active');
    }

    function closeDialog() {
        const dialog = document.getElementById('app-dialog');
        if (dialog) dialog.classList.remove('active');
        pendingConfirmAction = null;
    }

    function confirmDialog() {
        const fn = pendingConfirmAction;
        closeDialog();
        if (typeof fn === 'function') fn();
    }

    function sliceAccumulated(items, page, perPage) {
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        const p = Math.max(1, Math.min(page, pages));
        return { items: items.slice(0, p * perPage), page: p, total: total, pages: pages, hasMore: p < pages };
    }

    function renderListEnd(endId, result) {
        const el = document.getElementById(endId);
        if (!el) return;
        if (!result.total) {
            el.innerHTML = '';
            return;
        }
        if (result.hasMore) {
            el.innerHTML = '<p class="list-end-hint">' + SCROLL_LOAD_HINT + '</p>';
        } else {
            el.innerHTML = '<p class="list-end-hint">' + LIST_END_HINT + '（共 ' + result.total + ' 条）</p>';
        }
    }

    function compactKpiPanel(items) {
        let html = '<div class="compact-kpi-panel">';
        items.forEach(function (item, idx) {
            const spanClass = item.span2 ? ' ck-item span-2' : ' ck-item';
            html += '<div class="' + spanClass.trim() + '"><p class="ck-label">' + esc(item.label) + '</p><p class="ck-value' +
                (item.valueClass ? ' ' + item.valueClass : '') + '">' + item.value + '</p>' + (item.extra || '') + '</div>';
        });
        html += '</div>';
        return html;
    }

    function commissionKpiStrip(pending, settled, yesterdayVal, yesterdayStatus) {
        return '<div class="commission-kpi-strip">' +
            '<div><p class="ck-label">待返佣</p><p class="ck-value text-blue-600">' + fmtMoney(pending) + '</p></div>' +
            '<div><p class="ck-label">累计已发放</p><p class="ck-value">' + fmtMoney(settled) + '</p></div>' +
            '<div><p class="ck-label">昨日返佣</p><p class="ck-value">' + fmtMoney(yesterdayVal) + '</p><p class="ck-sub">' + esc(yesterdayStatus) + '</p></div>' +
            '</div>';
    }

    function teamOverviewKpiPanel(scaled, delta) {
        delta = delta || false;
        const netClass = scaled.net >= 0 ? 'text-green-600' : 'text-red-500';
        return compactKpiPanel([
            { label: '团队交易额', value: fmtCompactMoney(scaled.vol), extra: delta ? formatDeltaPct(scaled.volChange) : '' },
            { label: '返佣收入', value: fmtMoney(scaled.rebate), extra: delta ? formatDeltaPct(scaled.rebateChange) : '' },
            { label: '团队人数', value: fmtNum(scaled.teamUsers), extra: delta ? formatDeltaPct(scaled.usersChange) : '' },
            { label: '交易人数', value: fmtNum(scaled.activeTraders), extra: delta ? formatDeltaPct(scaled.activeTradersChange) : '' },
            { label: '团队净入金', value: fmtCompactMoney(scaled.net, { signed: true }), valueClass: netClass, span2: true, extra: delta ? formatDeltaPct(scaled.netDepositChange) : '' }
        ]);
    }

    function renderPeriodPicker(containerId, activePeriod, targetKey) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '<button type="button" class="period-picker-btn"' + clickHandler('openPeriodPicker', targetKey) + '>' +
            '周期 · ' + esc(activePeriod) +
            ' <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg></button>';
    }

    function renderPeriodSheetBody() {
        const body = document.getElementById('sheet-period-body');
        if (!body) return;
        body.innerHTML = PERIODS.map(function (p) {
            let current = linksPeriod;
            if (periodPickerTarget === 'team') current = overviewPeriod;
            else if (periodPickerTarget === 'analytics') current = analyticsPeriod;
            const cls = p === current ? 'period-option active' : 'period-option';
            return '<button type="button" class="' + cls + '"' + clickHandler('selectPeriod', p) + '>' + p + '</button>';
        }).join('');
    }

    function sharePosterHtml(code) {
        return '<div class="bg-white w-full rounded-3xl overflow-hidden shadow-2xl">' +
            '<div class="bg-black p-6 text-white space-y-6 relative overflow-hidden">' +
            '<div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl"></div>' +
            '<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>' +
            '<div class="flex justify-between items-center relative z-10"><span class="font-black italic text-xl tracking-tighter">ForX</span>' +
            '<span class="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-sm font-black tracking-widest uppercase">Perp DEX</span></div>' +
            '<div class="space-y-2 relative z-10"><p class="text-[10px] text-blue-400 font-black tracking-[0.3em]">探索无限，交易可能</p>' +
            '<p class="text-[11px] text-gray-400 font-medium leading-relaxed pt-1">体验毫秒级订单撮合与深度的去中心化流动性交易体验</p></div>' +
            '<div class="relative z-10 py-1"><div class="h-20 w-full bg-white/5 border border-white/10 rounded-xl flex items-end px-3 pb-2 gap-1">' +
            '<div class="flex-1 bg-blue-500/40 h-8 rounded-t-sm"></div><div class="flex-1 bg-blue-500/60 h-10 rounded-t-sm"></div>' +
            '<div class="flex-1 bg-blue-500 h-12 rounded-t-sm"></div><div class="flex-1 bg-blue-400/80 h-9 rounded-t-sm"></div></div></div>' +
            '<div class="flex justify-between items-end relative z-10"><div><p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">我的邀请码</p>' +
            '<p class="text-2xl font-black tracking-[0.1em] text-white font-mono">' + esc(code) + '</p></div>' +
            '<div class="w-12 h-12 bg-white p-1 rounded-lg shadow-lg flex items-center justify-center">' +
            '<svg class="w-full h-full text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm10 0h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zM13 15h2v2h-2v-2zm2 2h2v2h-2v-2z"/></svg></div></div></div>' +
            '<div class="p-5 bg-slate-50 flex gap-2">' +
            '<button type="button" class="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-400 text-xs uppercase" onclick="PartnerCenterApp.closeShareOverlay()">取消</button>' +
            '<button type="button" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest" onclick="PartnerCenterApp.closeShareOverlay()">分享海报</button></div></div>';
    }

    function bindScrollLoaders() {
        if (scrollLoadBound) return;
        scrollLoadBound = true;
        function bind(el, fn) {
            if (!el) return;
            el.addEventListener('scroll', function () {
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) fn();
            });
        }
        bind(document.getElementById('hub-scroll'), onHubScrollLoad);
        bind(document.getElementById('cd-scroll'), function () { if (stackMode === 'commission-detail') loadMoreCommissionDetail(); });
        bind(document.getElementById('ct-scroll'), function () { if (stackMode === 'commission-trades') loadMoreCommissionTrades(); });
        bind(document.getElementById('drill-scroll'), function () { /* drill lists are short */ });
    }

    function onHubScrollLoad() {
        if (stackMode) return;
        if (activeTab === 'links') {
            const filtered = inviteLinksData.filter(function (row) {
                if (!linksSearch) return true;
                const q = linksSearch.toLowerCase();
                return row.remark.toLowerCase().includes(q) || row.code.toLowerCase().includes(q);
            });
            const result = sliceAccumulated(filtered, linksPage, PAGE_SIZE);
            if (result.hasMore) { linksPage++; renderLinks(); }
        } else if (activeTab === 'team') {
            if (activeTeamTable === 'sub-agent') {
                let list = subPartnersData.filter(function (row) {
                    if (!subPartnerSearch) return true;
                    return matchUserSearch(row, subPartnerSearch.toLowerCase());
                });
                const result = sliceAccumulated(list, subPartnerPage, PAGE_SIZE);
                if (result.hasMore) { subPartnerPage++; renderTeam(); }
            } else {
                let list = directClientsData.filter(function (row) {
                    if (!subPartnerSearch) return true;
                    return matchUserSearch(row, subPartnerSearch.toLowerCase());
                });
                const result = sliceAccumulated(list, directClientPage, PAGE_SIZE);
                if (result.hasMore) { directClientPage++; renderTeam(); }
            }
        } else if (activeTab === 'commission') {
            let filtered = settlementRecords.filter(function (row) {
                if (settlementStatusFilter !== 'all' && row.status !== settlementStatusFilter) return false;
                if (settlementDateFilter && row.date !== settlementDateFilter) return false;
                return true;
            });
            const result = sliceAccumulated(filtered, settlementPage, PAGE_SIZE);
            if (result.hasMore) { settlementPage++; renderCommission(); }
        }
    }

    function loadMoreCommissionDetail() {
        const summary = commissionDetailDate ? getCommissionSummaryForDate(commissionDetailDate) : [];
        const result = sliceAccumulated(summary, commissionDetailPage, PAGE_SIZE);
        if (result.hasMore) {
            commissionDetailPage++;
            renderCommissionDetail();
        }
    }

    function loadMoreCommissionTrades() {
        const trades = getCommissionTradesForDateAndUid(commissionDetailDate, commissionTradesUid);
        const result = sliceAccumulated(trades, commissionTradesPage, PAGE_SIZE);
        if (result.hasMore) {
            commissionTradesPage++;
            renderCommissionTrades();
        }
    }

    function syncRatioControls(inputId, sliderId, maxId, val) {
        val = Math.max(0, Math.min(MY_MAX_RATIO, parseInt(val, 10) || 0));
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);
        const maxEl = document.getElementById(maxId);
        if (input) input.value = val;
        if (slider) slider.value = val;
        if (maxEl) maxEl.textContent = '最高 ' + MY_MAX_RATIO + '%';
        return val;
    }

    function feeFromVol(vol) { return (vol || 0) * 0.001; }

    function rowFee(row, volKey) {
        volKey = volKey || 'totalVol';
        if (row.totalFee != null) return row.totalFee;
        if (row.fee != null) return row.fee;
        return feeFromVol(row[volKey] != null ? row[volKey] : row.vol);
    }

    function copyText(text, label) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast((label || '内容') + '已复制');
            }).catch(function () { showToast('复制失败'); });
        } else { showToast('已复制: ' + text); }
    }

    function slicePage(items, page, perPage) {
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        const p = Math.max(1, Math.min(page, pages));
        const start = (p - 1) * perPage;
        return { items: items.slice(start, start + perPage), page: p, total: total, pages: pages, hasMore: p < pages };
    }

    function computeOverviewScaled(scale) {
        return {
            vol: overviewBase.teamVol * scale,
            rebate: overviewBase.totalRebate * scale,
            teamUsers: overviewBase.teamUsers,
            activeTraders: Math.round(overviewBase.activeTraders * Math.min(scale, 1.2)),
            selfRebate: overviewBase.selfRebate * scale,
            directRebate: overviewBase.directRebate * scale,
            gapRebate: overviewBase.gapRebate * scale,
            selfVol: overviewBase.selfVol * scale,
            directClientVol: overviewBase.directClientVol * scale,
            partnerTeamVol: overviewBase.partnerTeamVol * scale,
            selfUsers: overviewBase.selfUsers,
            directClientUsers: overviewBase.directClientUsers,
            partnerTeamUsers: overviewBase.partnerTeamUsers,
            selfActiveTraders: overviewBase.selfActiveTraders,
            directClientActiveTraders: Math.round(overviewBase.directClientActiveTraders * Math.min(scale, 1.2)),
            partnerTeamActiveTraders: Math.round(overviewBase.partnerTeamActiveTraders * Math.min(scale, 1.2)),
            net: overviewBase.teamNetDeposit * scale,
            selfNetDeposit: overviewBase.selfNetDeposit * scale,
            directClientNetDeposit: overviewBase.directClientNetDeposit * scale,
            partnerTeamNetDeposit: overviewBase.partnerTeamNetDeposit * scale,
            volChange: overviewBase.volChange,
            rebateChange: overviewBase.rebateChange,
            usersChange: overviewBase.usersChange,
            activeTradersChange: overviewBase.activeTradersChange,
            netDepositChange: overviewBase.netDepositChange
        };
    }

    function sourceTriple(scaled, metric) {
        if (metric === 'vol') return { self: scaled.selfVol, direct: scaled.directClientVol, partner: scaled.partnerTeamVol, total: scaled.vol };
        if (metric === 'rebate') return { self: scaled.selfRebate, direct: scaled.directRebate, partner: scaled.gapRebate, total: scaled.rebate };
        if (metric === 'users') return { self: scaled.selfUsers, direct: scaled.directClientUsers, partner: scaled.partnerTeamUsers, total: scaled.teamUsers };
        if (metric === 'net') return { self: scaled.selfNetDeposit, direct: scaled.directClientNetDeposit, partner: scaled.partnerTeamNetDeposit, total: scaled.net };
        return { self: scaled.selfActiveTraders, direct: scaled.directClientActiveTraders, partner: scaled.partnerTeamActiveTraders, total: scaled.activeTraders };
    }

    function sourceRatios(triple) {
        const total = triple.total || 1;
        return { self: triple.self / total, direct: triple.direct / total, partner: triple.partner / total };
    }

    function formatDeltaPct(value) {
        const cls = value >= 0 ? 'text-green-600' : 'text-red-500';
        const sign = value >= 0 ? '+' : '';
        return '<span class="text-[9px] font-bold ' + cls + '">' + sign + value + '% vs 上周期</span>';
    }

    function formatMetricValue(metric, value, opts) {
        if (metric === 'vol' || metric === 'net') return fmtCompactMoney(value, opts);
        if (metric === 'rebate') return fmtMoney(value, opts);
        return fmtNum(value);
    }

    function getSettlementRecord(date) {
        return settlementRecords.find(function (r) { return r.date === date; }) || null;
    }

    function settlementGrossRebate(row) {
        if (!row) return 0;
        return (row.rebate || 0) + (row.violationDeduction || 0);
    }

    function violationHintHtml(row) {
        if (!row || !row.violationDeduction) return '';
        const label = '违规-' + fmtMoney(row.violationDeduction);
        const tip = row.violationReason || '违规扣除原因由后台配置';
        return '<button type="button" class="hint-dashed text-[10px] text-amber-700 font-bold mt-0.5 block"' +
            clickHandler('openViolationDialog', tip) + '>' + esc(label) + '</button>';
    }

    function rebateAmountHtml(row) {
        let html = '<span class="font-black text-blue-600">' + fmtMoney(row.rebate) + '</span>';
        html += violationHintHtml(row);
        return html;
    }

    function settlementStatusLabel(status) {
        if (status === 'pending') return '<span class="text-amber-600 font-bold text-[10px]">待审核</span>';
        if (status === 'settled') return '<span class="text-green-600 font-bold text-[10px]">已发放</span>';
        return '<span class="text-gray-400 text-[10px]">—</span>';
    }

    function partnerSettlementStatusLabel(status) {
        if (status === 'frozen') return '<span class="text-amber-600 font-bold text-[10px]">冻结待结算</span>';
        if (status === 'normal') return '<span class="text-green-600 font-bold text-[10px]">正常</span>';
        return '<span class="text-gray-400 text-[10px]">—</span>';
    }

    function countActiveInviteLinks() {
        return inviteLinksData.filter(function (r) { return !r.disabled; }).length;
    }

    function findSubPartner(id) {
        return subPartnersData.find(function (r) { return r.id === id; });
    }

    function currentDrillTeam() {
        const id = drillStack.length ? drillStack[drillStack.length - 1] : null;
        return id ? drillTeams[id] : null;
    }

    function ensureDrillTeam(partnerId) {
        return !!drillTeams[partnerId];
    }

    function matchUserSearch(row, q) {
        const hay = [row.uid, row.wallet, row.walletFull, row.email, row.remark, row.name].filter(Boolean).join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
    }

    function getCommissionSummaryForDate(date) {
        const map = {};
        commissionDetailRecords.filter(function (row) { return row.date === date; }).forEach(function (row) {
            if (!map[row.uid]) {
                const meta = commissionUserMeta[row.uid] || {};
                map[row.uid] = {
                    uid: row.uid, sourceType: row.sourceType, remark: row.remark || '', ratio: row.ratio,
                    wallet: meta.wallet || '', walletFull: meta.walletFull || meta.wallet || '',
                    email: meta.email || '', vol: 0, fee: 0, rebate: 0, isPartner: row.sourceType === '下级'
                };
            }
            map[row.uid].vol += row.vol;
            map[row.uid].fee += rowFee(row, 'vol');
            map[row.uid].rebate += row.rebate;
        });
        return Object.keys(map).map(function (uid) { return map[uid]; }).sort(function (a, b) { return b.rebate - a.rebate; });
    }

    function getCommissionTradesForDateAndUid(date, uid) {
        return commissionDetailRecords.filter(function (row) {
            return row.date === date && row.uid === uid;
        }).sort(function (a, b) { return b.time.localeCompare(a.time); });
    }

    function createRng(seed) {
        let s = seed % 2147483646;
        if (s <= 0) s += 2147483646;
        return function () {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    function buildDistributedSeries(total, points, seed) {
        const rnd = createRng(seed);
        const weights = [];
        let sum = 0;
        for (let i = 0; i < points; i++) {
            const wave = 0.55 + Math.sin((i + 1) * 0.65) * 0.22;
            const w = Math.max(0.05, wave + rnd() * 0.35);
            weights.push(w);
            sum += w;
        }
        return weights.map(function (w) { return total * w / sum; });
    }

    function formatLinksChartLabel(period, index, totalPoints) {
        if (period === '1D') return index % LINKS_CHART_LABEL_STEP['1D'] === 0 ? String(index).padStart(2, '0') + ':00' : '';
        if (period === '1W') return 'D' + (index + 1);
        return index % LINKS_CHART_LABEL_STEP[period] === 0 || index === totalPoints - 1 ? String(index + 1) : '';
    }

    function renderSimpleTrendChart(container, total, period, color) {
        if (!container) return;
        const points = LINKS_CHART_POINTS[period] || 7;
        const series = buildDistributedSeries(total, points, 83);
        const W = 320, H = 120, pad = { l: 8, r: 8, t: 8, b: 18 };
        const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
        const maxV = Math.max.apply(null, series) * 1.1 || 1;
        const xAt = function (i) { return pad.l + (points <= 1 ? pw / 2 : (i / (points - 1)) * pw); };
        const yAt = function (v) { return pad.t + ph - (v / maxV) * ph; };
        let path = '';
        series.forEach(function (v, i) { path += (i ? ' L' : 'M') + xAt(i).toFixed(1) + ',' + yAt(v).toFixed(1); });
        let bars = '';
        series.forEach(function (v, i) {
            const bh = Math.max(2, (v / maxV) * ph);
            bars += '<rect x="' + (xAt(i) - 3).toFixed(1) + '" y="' + (pad.t + ph - bh).toFixed(1) + '" width="6" height="' + bh.toFixed(1) + '" fill="' + color + '" opacity="0.75" rx="1"/>';
        });
        container.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-full"><path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2"/>' + bars + '</svg>';
    }

    function openSheet(id) {
        document.getElementById('sheet-overlay').classList.add('active');
        document.getElementById(id).classList.add('active');
    }

    function closeAllSheets() {
        document.querySelectorAll('.bottom-sheet').forEach(function (s) { s.classList.remove('active'); });
        document.getElementById('sheet-overlay').classList.remove('active');
    }

    function updateHeader() {
        const back = document.getElementById('app-header-back');
        const title = document.getElementById('app-header-title');
        const action = document.getElementById('app-header-action');
        const tabs = document.getElementById('main-tabs');
        if (stackMode === 'commission-trades') {
            if (back) back.style.visibility = 'hidden';
            if (title) title.textContent = '交易返佣流水';
            if (action) action.innerHTML = '';
            if (tabs) tabs.classList.add('hidden');
            return;
        }
        if (stackMode === 'commission-detail') {
            if (back) back.style.visibility = 'hidden';
            if (title) title.textContent = '佣金详情';
            if (action) action.innerHTML = '';
            if (tabs) tabs.classList.add('hidden');
            return;
        }
        if (stackMode === 'drill') {
            if (back) back.style.visibility = 'hidden';
            if (title) title.textContent = '团队穿透';
            if (action) action.innerHTML = '';
            if (tabs) tabs.classList.add('hidden');
            return;
        }
        if (back) back.style.visibility = 'visible';
        if (tabs) tabs.classList.remove('hidden');
        if (title) title.textContent = '合伙人中心';
        if (action) {
            if (activeTab === 'links') {
                action.innerHTML = '<button type="button" class="text-[11px] font-black text-blue-600" onclick="PartnerCenterApp.openCreateLink()">+</button>';
            } else if (activeTab === 'team') {
                action.innerHTML = '<button type="button" class="text-[11px] font-black text-blue-600" onclick="PartnerCenterApp.openAddPartner()">添加</button>';
            } else {
                action.innerHTML = '';
            }
        }
    }


function renderLinks() {
    renderPeriodPicker('links-period-picker', linksPeriod, 'links');
    const scale = PERIOD_SCALE[linksPeriod] || 1;
    const summary = document.getElementById('links-summary');
    if (summary) {
        summary.innerHTML = '<div class="summary-bar"><span>返佣比例 ' + myPartnerProfile.ratio + '%</span><span>使用中 ' + countActiveInviteLinks() + '/50</span></div>';
    }
    let filtered = inviteLinksData.filter(function (row) {
        if (!linksSearch) return true;
        const q = linksSearch.toLowerCase();
        return row.remark.toLowerCase().includes(q) || row.code.toLowerCase().includes(q);
    });
    const sliced = sliceAccumulated(filtered, linksPage, PAGE_SIZE);
    linksPage = sliced.page;
    const list = document.getElementById('links-list');
    if (list) {
        list.innerHTML = sliced.items.map(function (row) {
            const vol = row.totalVol * scale;
            const fee = row.totalFee * scale;
            const rebate = row.rebateIncome * scale;
            const linkUrl = 'https://forx.finance/?ref=' + row.code;
            const statusBadge = row.disabled
                ? '<span class="status-badge off">已停用</span>'
                : '<span class="status-badge on">使用中</span>';
            const disabledAttr = row.disabled ? ' disabled' : '';
            const shareBtn = '<button type="button" class="icon-btn"' + disabledAttr + clickHandler('openShare', row.code) + '>' +
                '<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg></button>';
            return '<div class="list-card' + (row.disabled ? ' opacity-60' : '') + '">' +
                '<div class="flex justify-between items-start mb-2 gap-2">' +
                '<div class="min-w-0 flex-1"><div class="flex items-center gap-2 flex-wrap"><p class="font-black text-[13px]">' + esc(row.remark) + '</p>' + statusBadge + '</div>' +
                '<p class="font-mono text-blue-600 text-[11px] font-bold mt-1">' + esc(row.code) +
                ' <button type="button" class="text-gray-400 ml-1 inline-flex"' + clickHandler('copyText', row.code, '邀请码') + '><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></button></p></div>' +
                shareBtn + '</div>' +
                '<div class="grid grid-cols-3 gap-2 text-[9px] mb-3">' +
                metricMini('直邀', row.directCount) + metricMini('下级合伙人', row.subPartnerCount) + metricMini('交易额', fmtCompactMoney(vol)) +
                metricMini('手续费', fmtMoney(fee)) + metricMini('返佣', fmtMoney(rebate)) + metricMini('净入金', fmtCompactMoney(row.netDeposit, { signed: true })) +
                '</div>' +
                '<div class="flex flex-wrap gap-2">' +
                '<button type="button" class="action-btn primary"' + disabledAttr + clickHandler('copyText', linkUrl, '邀请链接') + '>复制链接</button>' +
                '<button type="button" class="action-btn"' + clickHandler('editLinkRemark', row.code) + '>修改</button>' +
                (row.isDefault && !row.disabled ? '<span class="action-btn text-gray-400">默认</span>' :
                    '<button type="button" class="action-btn danger"' + clickHandler('toggleLink', row.code) + '>' + (row.disabled ? '启用' : '停用') + '</button>') +
                '</div></div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无链接</p>';
    }
    renderListEnd('links-list-end', sliced);
}

function metricMini(label, value) {
    return '<div class="bg-slate-50 rounded-lg p-2"><p class="text-gray-400 font-bold">' + esc(label) + '</p><p class="font-black text-gray-900 mt-0.5">' + value + '</p></div>';
}

function renderTeam() {
    renderPeriodPicker('team-period-picker', overviewPeriod, 'team');
    const scale = PERIOD_SCALE[overviewPeriod] || 1;
    const scaled = computeOverviewScaled(scale);
    const identity = document.getElementById('team-identity');
    if (identity) {
        identity.innerHTML = '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">我的身份</p>' +
            '<div class="flex justify-between items-center"><div><p class="text-[10px] text-gray-500 font-bold">上级 UID</p>' +
            uidCopyHtml(mySuperiorInfo.parentUid, '上级 UID') +
            '<p class="text-[10px] text-gray-400 font-mono mt-1">' + esc(mySuperiorInfo.parentWallet) + '</p></div>' +
            '<div class="text-right"><p class="text-[10px] text-gray-500 font-bold">我的比例</p><p class="text-2xl font-black">' + myPartnerProfile.ratio + '%</p></div></div>';
    }
    const kpi = document.getElementById('team-kpi-grid');
    if (kpi) kpi.innerHTML = teamOverviewKpiPanel(scaled, false);
    const subtabs = document.getElementById('team-subtabs');
    if (subtabs) {
        subtabs.innerHTML =
            '<button type="button" class="sub-tab' + (activeTeamTable === 'sub-agent' ? ' active' : '') + '"' + clickHandler('setTeamTable', 'sub-agent') + '>直属下级合伙人</button>' +
            '<button type="button" class="sub-tab' + (activeTeamTable === 'direct-client' ? ' active' : '') + '"' + clickHandler('setTeamTable', 'direct-client') + '>自邀直客</button>';
    }
    renderTeamList(scaled);
}

function renderTeamList(scaled) {
    const scale = PERIOD_SCALE[overviewPeriod] || 1;
    const listEl = document.getElementById('team-list');
    if (!listEl) return;
    if (activeTeamTable === 'sub-agent') {
        let list = subPartnersData.filter(function (row) {
            if (!subPartnerSearch) return true;
            return matchUserSearch(row, subPartnerSearch.toLowerCase());
        });
        const sliced = sliceAccumulated(list, subPartnerPage, PAGE_SIZE);
        subPartnerPage = sliced.page;
        listEl.innerHTML = sliced.items.map(function (row) {
            return '<div class="list-card">' +
                '<div class="flex justify-between items-start mb-2"><div>' + uidCopyHtml(row.uid, 'UID') +
                '<p class="text-[10px] text-gray-400 font-mono mt-1">' + esc(row.wallet) + '</p>' +
                (row.remark ? '<p class="text-[10px] text-gray-500 font-bold mt-0.5">' + esc(row.remark) + '</p>' : '') +
                '</div>' + partnerSettlementStatusLabel(row.settlementStatus) + '</div>' +
                '<div class="grid grid-cols-2 gap-2 text-[10px] mb-3">' +
                metricMini('比例', row.ratio + '%') + metricMini('级差', row.gap + '%') +
                metricMini('级差收入', fmtMoney(row.gapIncome * scale)) + metricMini('团队规模', fmtNum(row.totalUsers) + ' 人') +
                '</div>' +
                '<div class="flex gap-2">' +
                (row.hasTeam ? '<button type="button" class="action-btn primary"' + clickHandler('openDrill', row.id) + '>查看团队</button>' : '') +
                '<button type="button" class="action-btn"' + clickHandler('openAdjustRatio', row.id) + '>调整比例</button>' +
                '</div></div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无下级合伙人</p>';
        renderListEnd('team-list-end', sliced);
    } else {
        let list = directClientsData.filter(function (row) {
            if (!subPartnerSearch) return true;
            return matchUserSearch(row, subPartnerSearch.toLowerCase());
        });
        const sliced = sliceAccumulated(list, directClientPage, PAGE_SIZE);
        directClientPage = sliced.page;
        listEl.innerHTML = sliced.items.map(function (row) {
            const contact = row.wallet || row.email || '—';
            return '<div class="list-card"><div class="mb-2">' + uidCopyHtml(row.uid, 'UID') +
                '<p class="text-[10px] text-gray-400 mt-1">' + esc(contact) + '</p><p class="text-[10px] text-gray-400 mt-0.5">加入 ' + esc(row.joinDate) + '</p></div>' +
                '<div class="grid grid-cols-3 gap-2 text-[10px]">' +
                metricMini('交易额', fmtCompactMoney(row.totalVol * scale)) +
                metricMini('返佣', fmtMoney(row.rebate * scale)) +
                metricMini('净入金', fmtCompactMoney(row.netDeposit, { signed: true })) +
                '</div></div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无直客</p>';
        renderListEnd('team-list-end', sliced);
    }
}

function renderAnalytics() {
    renderPeriodPicker('analytics-period-picker', analyticsPeriod, 'analytics');
    const scale = PERIOD_SCALE[analyticsPeriod] || 1;
    const scaled = computeOverviewScaled(scale);
    const kpi = document.getElementById('analytics-kpi-grid');
    if (kpi) kpi.innerHTML = teamOverviewKpiPanel(scaled, true);
    const dimTabs = document.getElementById('analytics-dim-tabs');
    if (dimTabs) {
        dimTabs.innerHTML = ANALYTICS_METRICS.map(function (m) {
            const cls = m.key === analyticsDimTab ? 'dim-tab active' : 'dim-tab';
            return '<button type="button" class="' + cls + '"' + clickHandler('setAnalyticsDim', m.key) + '>' + m.label + '</button>';
        }).join('');
    }
    const hint = document.getElementById('analytics-dim-hint');
    if (hint) {
        if (analyticsDimTab === 'traders') {
            hint.textContent = ACTIVE_TRADERS_TIP;
            hint.classList.remove('hidden');
        } else if (analyticsDimTab === 'net') {
            hint.textContent = TEAM_NET_DEPOSIT_TIP;
            hint.classList.remove('hidden');
        } else {
            hint.textContent = '';
            hint.classList.add('hidden');
        }
    }
    renderAnalyticsSections(scaled);
}

function renderAnalyticsSections(scaled) {
    const metric = analyticsDimTab;
    const triple = sourceTriple(scaled, metric);
    const ratios = sourceRatios(triple);
    const sections = document.getElementById('analytics-sections');
    if (!sections) return;
    let distHtml = '<div class="section-card"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">来源分布</p><div class="space-y-3">';
    SOURCE_LABELS.forEach(function (label, i) {
        const key = i === 0 ? 'self' : (i === 1 ? 'direct' : 'partner');
        const pct = Math.round(ratios[key] * 100);
        distHtml += '<div><div class="flex justify-between text-[10px] mb-1"><span class="font-bold text-gray-600">' + esc(label) + '</span>' +
            '<span class="font-black">' + formatMetricValue(metric, triple[key]) + ' <span class="text-gray-400">(' + pct + '%)</span></span></div>' +
            '<div class="h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:' + pct + '%;background:' + SOURCE_COLORS[i] + '"></div></div></div>';
    });
    distHtml += '</div></div>';
    const scaleVol = scaled.vol / (overviewBase.teamVol || 1);
    const scaleGap = scaled.gapRebate / (overviewBase.gapRebate || 1);
    const scaleDirectRebate = scaled.directRebate / (overviewBase.directRebate || 1);
    const scaleDirectVol = scaled.directClientVol / (overviewBase.directClientVol || 1);
    const scaleDirectNet = scaled.directClientNetDeposit / (overviewBase.directClientNetDeposit || 1);
    const scalePartnerNet = scaled.partnerTeamNetDeposit / (overviewBase.partnerTeamNetDeposit || 1);
    const rankedSubs = subPartnersData.slice().sort(function (a, b) {
        if (metric === 'rebate') return b.gapIncome - a.gapIncome;
        if (metric === 'users') return b.totalUsers - a.totalUsers;
        if (metric === 'traders') return b.activeUsers - a.activeUsers;
        if (metric === 'net') return b.netDeposit - a.netDeposit;
        return b.totalVol - a.totalVol;
    }).slice(0, 10);
    const rankedClients = directClientsData.slice().sort(function (a, b) {
        if (metric === 'rebate') return b.rebate - a.rebate;
        if (metric === 'net') return b.netDeposit - a.netDeposit;
        return b.totalVol - a.totalVol;
    }).slice(0, 10);
    function partnerMetric(row) {
        if (metric === 'rebate') return fmtMoney(row.gapIncome * scaleGap);
        if (metric === 'users') return fmtNum(row.totalUsers);
        if (metric === 'traders') return fmtNum(row.activeUsers);
        if (metric === 'net') return fmtCompactMoney(row.netDeposit * scalePartnerNet, { signed: true });
        return fmtCompactMoney(row.totalVol * scaleVol);
    }
    function clientMetric(row) {
        if (metric === 'rebate') return fmtMoney(row.rebate * scaleDirectRebate);
        if (metric === 'net') return fmtCompactMoney(row.netDeposit * scaleDirectNet, { signed: true });
        return fmtCompactMoney(row.totalVol * scaleDirectVol);
    }
    let topHtml = '<div class="section-card"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Top 10 排行</p>';
    topHtml += '<p class="text-[10px] font-black text-gray-500 mb-2">合伙人</p>';
    topHtml += rankedSubs.map(function (row, idx) {
        return '<div class="flex items-center justify-between py-2 border-b border-gray-50 text-[11px]"><span class="font-black text-gray-400 w-6">' + (idx + 1) + '</span>' +
            '<span class="flex-1 truncate">' + uidCopyHtml(row.uid, 'UID') + (row.remark ? ' <span class="text-gray-500 font-bold">· ' + esc(row.remark) + '</span>' : '') + '</span>' +
            '<span class="font-black shrink-0 ml-2">' + partnerMetric(row) + '</span></div>';
    }).join('') || '<p class="text-gray-400 text-[10px] py-2">暂无数据</p>';
    topHtml += '<p class="text-[10px] font-black text-gray-500 mb-2 mt-4">直属直客</p>';
    topHtml += rankedClients.map(function (row, idx) {
        return '<div class="flex items-center justify-between py-2 border-b border-gray-50 text-[11px]"><span class="font-black text-gray-400 w-6">' + (idx + 1) + '</span>' +
            '<span class="flex-1 truncate">' + uidCopyHtml(row.uid, 'UID') + '</span>' +
            '<span class="font-black shrink-0 ml-2">' + clientMetric(row) + '</span></div>';
    }).join('') || '<p class="text-gray-400 text-[10px] py-2">暂无数据</p>';
    topHtml += '</div>';
    sections.innerHTML = '<div class="section-card"><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">趋势 · ' + analyticsPeriod + '</p>' +
        '<div class="analytics-chart-wrap" id="analytics-trend-chart"></div></div>' + distHtml + topHtml;
    renderSimpleTrendChart(document.getElementById('analytics-trend-chart'), triple.total, analyticsPeriod, '#3b82f6');
}


function renderCommission() {
    const pendingToday = settlementRecords.filter(function (r) {
        return r.date === '2024-05-23' && r.status === 'pending';
    }).reduce(function (sum, r) { return sum + r.rebate; }, 0);
    const settledTotal = settlementRecords.filter(function (r) { return r.status === 'settled'; }).reduce(function (sum, r) { return sum + r.rebate; }, 0);
    const yesterday = settlementRecords.find(function (r) { return r.date === '2024-05-22'; });
    const kpiRow = document.getElementById('commission-kpi-row');
    if (kpiRow) {
        kpiRow.innerHTML = commissionKpiStrip(
            pendingToday || 450.82,
            settledTotal || 2923,
            yesterday ? yesterday.rebate : 868,
            yesterday && yesterday.status === 'settled' ? '已发放' : '待审核'
        );
    }
    let filtered = settlementRecords.filter(function (row) {
        if (settlementStatusFilter !== 'all' && row.status !== settlementStatusFilter) return false;
        if (settlementDateFilter && row.date !== settlementDateFilter) return false;
        return true;
    });
    const sliced = sliceAccumulated(filtered, settlementPage, PAGE_SIZE);
    settlementPage = sliced.page;
    const list = document.getElementById('commission-list');
    if (list) {
        list.innerHTML = sliced.items.map(function (row) {
            const rowBg = row.status === 'pending' ? ' border-amber-100 bg-amber-50/30' : '';
            return '<div class="list-card' + rowBg + '">' +
                '<div class="flex justify-between items-center mb-2"><p class="font-black text-[13px]">' + esc(row.date) + '</p>' + settlementStatusLabel(row.status) + '</div>' +
                '<div class="grid grid-cols-3 gap-2 text-[10px] mb-3">' +
                metricMini('交易额', fmtCompactMoney(row.vol)) +
                metricMini('手续费', fmtMoney(rowFee(row, 'vol'))) +
                '<div class="bg-slate-50 rounded-lg p-2"><p class="text-gray-400 font-bold">返佣</p><div class="font-black text-gray-900 mt-0.5">' + rebateAmountHtml(row) + '</div></div>' +
                '</div>' +
                '<button type="button" class="w-full py-2 text-[11px] font-black text-blue-600 bg-blue-50 rounded-xl"' + clickHandler('openCommissionDetail', row.date) + '>佣金详情</button>' +
                '</div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无结算记录</p>';
    }
    renderListEnd('commission-list-end', sliced);
}

function renderCommissionDetail() {
    const row = getSettlementRecord(commissionDetailDate);
    const subtitle = document.getElementById('cd-subtitle');
    if (subtitle) subtitle.textContent = commissionDetailDate ? '结算日 ' + commissionDetailDate : '';
    const kpi = document.getElementById('cd-kpi-grid');
    if (kpi && row) {
        const gross = settlementGrossRebate(row);
        let violationExtra = '';
        if (row.violationDeduction) {
            violationExtra = '<button type="button" class="hint-dashed text-[9px] text-amber-700 font-bold mt-1"' +
                clickHandler('openViolationDialog', row.violationReason || '违规扣除原因由后台配置') + '>查看说明</button>';
        }
        kpi.innerHTML = compactKpiPanel([
            { label: '团队交易额', value: fmtCompactMoney(row.vol) },
            { label: '应发返佣', value: fmtMoney(gross) },
            { label: '实发返佣', value: fmtMoney(row.rebate) },
            { label: '违规扣除', value: row.violationDeduction ? '-' + fmtMoney(row.violationDeduction) : '—', valueClass: 'text-amber-600', extra: violationExtra }
        ]);
    }
    const summary = commissionDetailDate ? getCommissionSummaryForDate(commissionDetailDate) : [];
    const sliced = sliceAccumulated(summary, commissionDetailPage, PAGE_SIZE);
    commissionDetailPage = sliced.page;
    const list = document.getElementById('cd-list');
    if (list) {
        list.innerHTML = sliced.items.map(function (item) {
            const contact = item.email || item.wallet || '—';
            return '<div class="list-card">' +
                '<div class="flex justify-between items-start mb-2"><div>' + uidCopyHtml(item.uid, 'UID') +
                '<p class="text-[10px] text-gray-400 mt-1">' + esc(contact) + '</p>' +
                (item.remark ? '<p class="text-[10px] text-gray-500 font-bold">' + esc(item.remark) + '</p>' : '') +
                '</div><span class="text-[10px] font-bold text-gray-600">' + esc(item.sourceType) + '</span></div>' +
                '<div class="grid grid-cols-2 gap-2 text-[10px] mb-3">' +
                metricMini('比例', item.ratio) + metricMini('交易额', fmtCompactMoney(item.vol)) +
                metricMini('手续费', fmtMoney(item.fee)) + metricMini('返佣', fmtMoney(item.rebate)) +
                '</div>' +
                '<button type="button" class="w-full py-2 text-[11px] font-black text-blue-600 bg-blue-50 rounded-xl"' + clickHandler('openCommissionTrades', item.uid) + '>交易返佣流水</button>' +
                '</div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">该结算日暂无返佣明细</p>';
    }
    renderListEnd('cd-list-end', sliced);
}

function renderCommissionTrades() {
    const subtitle = document.getElementById('ct-subtitle');
    if (subtitle) subtitle.textContent = (commissionTradesUid || '—') + ' · ' + (commissionDetailDate || '') + ' · 交易返佣流水';
    const trades = getCommissionTradesForDateAndUid(commissionDetailDate, commissionTradesUid);
    const sliced = sliceAccumulated(trades, commissionTradesPage, PAGE_SIZE);
    commissionTradesPage = sliced.page;
    const list = document.getElementById('ct-list');
    if (list) {
        list.innerHTML = sliced.items.map(function (t) {
            return '<div class="list-card py-3"><p class="text-[10px] text-gray-400 mb-1">' + esc(t.time) + '</p>' +
                '<div class="grid grid-cols-2 gap-2 text-[10px]">' +
                metricMini('交易额', fmtCompactMoney(t.vol)) + metricMini('返佣', fmtMoney(t.rebate)) +
                metricMini('手续费', fmtMoney(rowFee(t, 'vol'))) + metricMini('比例', t.ratio) +
                '</div></div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无流水</p>';
    }
    renderListEnd('ct-list-end', sliced);
}

function renderDrill() {
    const team = currentDrillTeam();
    if (!team) return;
    const scale = PERIOD_SCALE[drillPeriod] || 1;
    const o = team.overview;
    const breadcrumb = document.getElementById('drill-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = team.name + ' · ' + team.wallet;
    const identity = document.getElementById('drill-identity');
    if (identity) {
        identity.innerHTML = '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">团队身份（脱敏）</p>' +
            '<p class="font-black text-[13px]">' + esc(team.name) + '</p>' +
            '<p class="font-mono text-[11px] text-gray-500 mt-1">' + esc(team.wallet) + ' · 加入 ' + esc(team.joinDate) + '</p>' +
            '<p class="text-[10px] text-gray-400 mt-1">上级 ' + esc(team.superiorWallet) + ' · 比例 ' + team.ratio + '%</p>';
    }
    const kpi = document.getElementById('drill-kpi');
    if (kpi) {
        const netClass = o.teamNetDeposit >= 0 ? 'text-green-600' : 'text-red-500';
        kpi.innerHTML = compactKpiPanel([
            { label: '团队交易额', value: fmtCompactMoney(o.teamVol * scale) },
            { label: '返佣收入', value: fmtMoney(o.totalRebate * scale) },
            { label: '团队人数', value: fmtNum(o.totalUsers) },
            { label: '交易人数', value: fmtNum(Math.round(o.activeUsers * Math.min(scale, 1.2))) },
            { label: '团队净入金', value: fmtCompactMoney(o.teamNetDeposit * scale, { signed: true }), valueClass: netClass, span2: true }
        ]);
    }
    const subtabs = document.getElementById('drill-subtabs');
    if (subtabs) {
        subtabs.innerHTML =
            '<button type="button" class="sub-tab' + (drillActiveTable === 'sub-agent' ? ' active' : '') + '"' + clickHandler('setDrillTable', 'sub-agent') + '>下级合伙人</button>' +
            '<button type="button" class="sub-tab' + (drillActiveTable === 'direct-client' ? ' active' : '') + '"' + clickHandler('setDrillTable', 'direct-client') + '>直客</button>';
    }
    const listEl = document.getElementById('drill-list');
    if (!listEl) return;
    if (drillActiveTable === 'sub-agent') {
        listEl.innerHTML = (team.subPartners || []).map(function (row) {
            return '<div class="list-card">' +
                '<div class="flex justify-between items-start mb-2"><div>' +
                (row.uid ? uidCopyHtml(row.uid, 'UID') : '<p class="font-black font-mono text-[12px]">' + esc(row.wallet) + '</p>') +
                '<p class="text-[10px] text-gray-400 font-mono mt-1">' + esc(row.wallet) + '</p></div>' +
                partnerSettlementStatusLabel(row.settlementStatus) + '</div>' +
                '<div class="grid grid-cols-2 gap-2 text-[10px] mb-3">' +
                metricMini('比例', row.ratio + '%') + metricMini('级差', row.gap + '%') +
                metricMini('交易额', fmtCompactMoney(row.totalVol * scale)) + metricMini('人数', fmtNum(row.totalUsers)) +
                '</div>' +
                (row.hasTeam ? '<button type="button" class="action-btn primary"' + clickHandler('openDrill', row.id) + '>查看团队</button>' : '') +
                '</div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无下级合伙人</p>';
        renderListEnd('drill-list-end', { total: (team.subPartners || []).length, hasMore: false, page: 1, pages: 1 });
    } else {
        listEl.innerHTML = (team.directClients || []).map(function (row) {
            return '<div class="list-card">' +
                (row.uid ? uidCopyHtml(row.uid, 'UID') : '<p class="font-black font-mono text-[12px]">' + esc(row.wallet || row.email || '—') + '</p>') +
                '<p class="text-[10px] text-gray-400 font-mono mt-1">' + esc(row.wallet || row.email || '—') + '</p>' +
                '<div class="grid grid-cols-3 gap-2 text-[10px] mt-2">' +
                metricMini('交易额', fmtCompactMoney(row.totalVol * scale)) +
                metricMini('返佣', fmtMoney(row.rebate * scale)) +
                metricMini('净入金', fmtCompactMoney(row.netDeposit, { signed: true })) +
                '</div></div>';
        }).join('') || '<p class="text-center text-gray-400 text-[11px] py-8 font-bold">暂无直客</p>';
        renderListEnd('drill-list-end', { total: (team.directClients || []).length, hasMore: false, page: 1, pages: 1 });
    }
}

function renderActiveView() {
    if (activeTab === 'links') renderLinks();
    else if (activeTab === 'team') renderTeam();
    else if (activeTab === 'analytics') renderAnalytics();
    else if (activeTab === 'commission') renderCommission();
}

function showStack(mode) {
    stackMode = mode;
    document.getElementById('stack-commission-detail').classList.toggle('active', mode === 'commission-detail');
    document.getElementById('stack-commission-trades').classList.toggle('active', mode === 'commission-trades');
    document.getElementById('stack-drill').classList.toggle('active', mode === 'drill');
    updateHeader();
}

function hideStacks() {
    stackMode = null;
    document.getElementById('stack-commission-detail').classList.remove('active');
    document.getElementById('stack-commission-trades').classList.remove('active');
    document.getElementById('stack-drill').classList.remove('active');
    updateHeader();
}

function renderCommissionFilterSheet() {
    const body = document.getElementById('sheet-filter-body');
    if (!body) return;
    const dates = settlementRecords.map(function (r) { return r.date; });
    body.innerHTML = '<div class="space-y-4">' +
        '<div><label class="text-[10px] font-bold text-gray-400">结算日期</label>' +
        '<select id="filter-date-select" class="w-full border rounded-xl px-3 py-2 mt-1 text-[12px]" onchange="PartnerCenterApp.setSettlementDateFilter(this.value)">' +
        '<option value="">全部</option>' + dates.map(function (d) {
            return '<option value="' + d + '"' + (settlementDateFilter === d ? ' selected' : '') + '>' + d + '</option>';
        }).join('') + '</select></div>' +
        '<div><label class="text-[10px] font-bold text-gray-400">状态</label>' +
        '<div class="flex gap-2 mt-2">' +
        ['all', 'pending', 'settled'].map(function (s) {
            const labels = { all: '全部', pending: '待审核', settled: '已发放' };
            const cls = settlementStatusFilter === s ? 'period-chip active flex-1' : 'period-chip flex-1';
            return '<button type="button" class="' + cls + '"' + clickHandler('setSettlementStatusFilter', s) + '>' + labels[s] + '</button>';
        }).join('') +
        '</div></div>' +
        '<button type="button" class="w-full bg-black text-white py-3 rounded-xl font-black text-[12px]" onclick="PartnerCenterApp.applyCommissionFilter()">应用筛选</button></div>';
}

    const app = {
        init: function () {
            bindScrollLoaders();
            updateHeader();
            renderActiveView();
        },

        goBack: function () {
            if (stackMode) {
                if (stackMode === 'commission-trades') app.closeCommissionTrades();
                else if (stackMode === 'commission-detail') app.closeCommissionDetail();
                else if (stackMode === 'drill') app.drillBack();
                return;
            }
            window.location.href = '个人中心.html';
        },

        switchTab: function (tab) {
            if (stackMode) return;
            activeTab = tab;
            document.querySelectorAll('#main-tabs .seg-tab').forEach(function (btn) {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
            });
            document.querySelectorAll('.view-panel').forEach(function (panel) {
                panel.classList.add('hidden');
            });
            const view = document.getElementById('view-' + tab);
            if (view) view.classList.remove('hidden');
            updateHeader();
            renderActiveView();
        },

        setLinksPeriod: function (p) { linksPeriod = p; linksPage = 1; renderLinks(); },
        setLinksSearch: function (q) { linksSearch = q || ''; linksPage = 1; renderLinks(); },

        openPeriodPicker: function (targetKey) {
            periodPickerTarget = targetKey || 'links';
            renderPeriodSheetBody();
            openSheet('sheet-period');
        },
        selectPeriod: function (p) {
            if (periodPickerTarget === 'team') {
                overviewPeriod = p;
                subPartnerPage = 1;
                directClientPage = 1;
                renderTeam();
            } else if (periodPickerTarget === 'analytics') {
                analyticsPeriod = p;
                renderAnalytics();
            } else {
                linksPeriod = p;
                linksPage = 1;
                renderLinks();
            }
            closeAllSheets();
        },

        setTeamPeriod: function (p) { overviewPeriod = p; subPartnerPage = 1; directClientPage = 1; renderTeam(); },
        setTeamSearch: function (q) { subPartnerSearch = q || ''; subPartnerPage = 1; directClientPage = 1; renderTeam(); },
        setTeamTable: function (table) { activeTeamTable = table; subPartnerPage = 1; directClientPage = 1; renderTeam(); },

        setAnalyticsPeriod: function (p) { analyticsPeriod = p; renderAnalytics(); },
        setAnalyticsDim: function (dim) { analyticsDimTab = dim; renderAnalytics(); },

        setSettlementDateFilter: function (v) { settlementDateFilter = v || ''; },
        setSettlementStatusFilter: function (v) {
            settlementStatusFilter = v === 'pending' || v === 'settled' ? v : 'all';
            renderCommissionFilterSheet();
        },
        openCommissionFilter: function () { renderCommissionFilterSheet(); openSheet('sheet-filter'); },
        applyCommissionFilter: function () { settlementPage = 1; closeAllSheets(); renderCommission(); },

        openCommissionDetail: function (date) {
            commissionDetailDate = date || '';
            commissionDetailPage = 1;
            showStack('commission-detail');
            renderCommissionDetail();
        },
        closeCommissionDetail: function () {
            hideStacks();
            renderActiveView();
        },

        openCommissionTrades: function (uid) {
            commissionTradesUid = uid || '';
            commissionTradesPage = 1;
            showStack('commission-trades');
            renderCommissionTrades();
        },
        closeCommissionTrades: function () {
            showStack('commission-detail');
            renderCommissionDetail();
        },

        openViolationDialog: function (reason) {
            openInfoDialog('违规扣除说明', reason || '违规扣除原因由后台配置', '确认');
        },

        openDrill: function (partnerId) {
            if (!ensureDrillTeam(partnerId)) return;
            drillStack.push(partnerId);
            drillActiveTable = 'sub-agent';
            showStack('drill');
            renderDrill();
        },
        drillBack: function () {
            if (drillStack.length > 1) {
                drillStack.pop();
                renderDrill();
            } else {
                drillStack = [];
                hideStacks();
                renderActiveView();
            }
        },
        setDrillTable: function (table) { drillActiveTable = table; renderDrill(); },

        openCreateLink: function () {
            if (countActiveInviteLinks() >= 50) {
                showToast('使用中链接已达上限 50 个');
                return;
            }
            document.getElementById('create-link-remark').value = '';
            document.getElementById('create-link-code').value = '';
            openSheet('sheet-create-link');
        },
        submitCreateLink: function () {
            const remark = (document.getElementById('create-link-remark').value || '').trim();
            const code = (document.getElementById('create-link-code').value || '').trim().toUpperCase();
            if (!remark) { showToast('请填写备注名称'); return; }
            if (!/^[A-Z0-9]{6}$/.test(code)) { showToast('邀请码须为 6 位字母或数字'); return; }
            if (existingCodesList.indexOf(code) >= 0) { showToast('邀请码已存在'); return; }
            if (countActiveInviteLinks() >= 50) { showToast('使用中链接已达上限 50 个'); return; }
            inviteLinksData.push({ remark: remark, code: code, directCount: 0, subPartnerCount: 0, totalVol: 0, totalFee: 0, rebateIncome: 0, netDeposit: 0, isDefault: false, disabled: false });
            existingCodesList.push(code);
            linksPage = 1;
            closeAllSheets();
            renderLinks();
            showToast('邀请链接已创建');
        },

        openShare: function (code) {
            shareLinkCode = code || '';
            const inner = document.getElementById('share-overlay-inner');
            const overlay = document.getElementById('share-overlay');
            if (inner) inner.innerHTML = sharePosterHtml(shareLinkCode);
            if (overlay) overlay.classList.add('active');
        },
        closeShareOverlay: function (ev) {
            if (ev && ev.target && ev.target.id !== 'share-overlay') return;
            const overlay = document.getElementById('share-overlay');
            if (overlay) overlay.classList.remove('active');
        },

        editLinkRemark: function (code) {
            const row = inviteLinksData.find(function (r) { return r.code === code; });
            if (!row) return;
            editLinkCode = code;
            const input = document.getElementById('edit-link-remark');
            if (input) input.value = row.remark;
            openSheet('sheet-edit-link');
        },
        submitEditLinkRemark: function () {
            const row = inviteLinksData.find(function (r) { return r.code === editLinkCode; });
            const next = (document.getElementById('edit-link-remark').value || '').trim();
            if (!row || !next) { showToast('请填写备注名称'); return; }
            row.remark = next;
            closeAllSheets();
            renderLinks();
            showToast('备注已更新');
        },

        toggleLink: function (code) {
            const row = inviteLinksData.find(function (r) { return r.code === code; });
            if (!row) return;
            if (row.isDefault && !row.disabled) {
                showToast('默认邀请链接不可停用');
                return;
            }
            if (row.disabled) {
                if (countActiveInviteLinks() >= 50) {
                    showToast('使用中链接已达上限 50 个');
                    return;
                }
                openConfirmDialog('启用链接', '确认启用链接「' + row.remark + '」？启用后将占用一个使用中名额。', function () {
                    row.disabled = false;
                    renderLinks();
                    showToast('链接已启用');
                });
            } else {
                openConfirmDialog('停用链接', '确认停用链接「' + row.remark + '」？停用后新用户将无法通过该链接注册。', function () {
                    row.disabled = true;
                    renderLinks();
                    showToast('链接已停用');
                });
            }
        },

        openAddPartner: function () {
            document.getElementById('add-partner-uid').value = '';
            document.getElementById('add-partner-remark').value = '';
            syncRatioControls('add-partner-ratio-input', 'add-partner-ratio-slider', 'add-partner-ratio-max', 50);
            openSheet('sheet-add-partner');
        },
        syncAddPartnerRatio: function (val) {
            syncRatioControls('add-partner-ratio-input', 'add-partner-ratio-slider', 'add-partner-ratio-max', val);
        },
        submitAddPartner: function () {
            const uid = (document.getElementById('add-partner-uid').value || '').trim();
            const remark = (document.getElementById('add-partner-remark').value || '').trim();
            const ratio = syncRatioControls('add-partner-ratio-input', 'add-partner-ratio-slider', 'add-partner-ratio-max',
                document.getElementById('add-partner-ratio-input').value);
            if (!uid) { showToast('请填写 UID'); return; }
            closeAllSheets();
            showToast('已提交绑定申请：UID ' + uid + (remark ? ' · ' + remark : '') + ' · 比例 ' + ratio + '%');
        },

        openAdjustRatio: function (partnerId) {
            adjustRatioPartnerId = partnerId;
            const partner = findSubPartner(partnerId);
            const target = document.getElementById('adjust-ratio-target');
            if (target && partner) target.textContent = (partner.remark || partner.name || partner.uid) + ' · 当前 ' + partner.ratio + '%';
            syncRatioControls('adjust-ratio-input', 'adjust-ratio-slider', 'adjust-ratio-max', partner ? partner.ratio : 50);
            openSheet('sheet-adjust-ratio');
        },
        syncAdjustRatio: function (val) {
            syncRatioControls('adjust-ratio-input', 'adjust-ratio-slider', 'adjust-ratio-max', val);
        },
        submitAdjustRatio: function () {
            const ratio = syncRatioControls('adjust-ratio-input', 'adjust-ratio-slider', 'adjust-ratio-max',
                document.getElementById('adjust-ratio-input').value);
            const partner = findSubPartner(adjustRatioPartnerId);
            if (partner) partner.ratio = ratio;
            closeAllSheets();
            showToast('返佣比例已更新为 ' + ratio + '%');
            renderTeam();
        },

        closeDialog: closeDialog,
        confirmDialog: confirmDialog,
        closeDialogOnOverlay: function (ev) {
            if (ev && ev.target && ev.target.id === 'app-dialog') closeDialog();
        },

        copyText: copyText,
        closeAllSheets: closeAllSheets
    };

    window.PartnerCenterApp = app;
})();

