/**
 * 四级审批流：市场运营提交 → 市场运营交叉审核 → 风控审核 → 老板审批（可同步 Lark）
 */
(function () {
    const STORAGE_KEY = 'forx_approval_applications';
    const ROLE_KEY = 'forx_approval_view_role';
    const SEED_VERSION = '2026-08-04-v1';
    const SEED_VERSION_KEY = 'forx_approval_seed_v';

    const STEPS = [
        { key: 'apply', label: '市场运营提交', role: '市场运营' },
        { key: 'cross', label: '市场运营交叉审核', role: '市场运营' },
        { key: 'risk', label: '风控审核', role: '风控' },
        { key: 'boss', label: '老板审批', role: '老板' }
    ];

    const TYPE_FLOW_PROFILE = {
        points_pool_config: 'cross_risk',
        points_program_switch: 'cross_risk'
    };

    const FLOW_PROFILES = {
        full: {
            key: 'full',
            steps: STEPS,
            afterRisk: 'pending_boss',
            larkOnRisk: true
        },
        cross_risk: {
            key: 'cross_risk',
            steps: [
                { key: 'apply', label: '积分管理员提交', role: '积分管理员' },
                { key: 'cross', label: '市场运营交叉审核', role: '市场运营' },
                { key: 'risk', label: '风控审核', role: '风控' }
            ],
            afterRisk: 'approved',
            larkOnRisk: false
        }
    };

    const TYPE_LABELS = {
        trial_issue: '体验金发放',
        points_manual: '积分手动发放',
        fee_config: '用户费率配置',
        points_bonus_config: '积分加成配置',
        points_pool_config: '积分总池配置',
        points_program_switch: '积分计划总开关'
    };

    const ROLE_LABELS = {
        cross: '市场运营（交叉审核）',
        risk: '风控',
        boss: '老板'
    };

    function getFlowProfile(appOrKey) {
        if (typeof appOrKey === 'string') return FLOW_PROFILES[appOrKey] || FLOW_PROFILES.full;
        if (appOrKey && appOrKey.flowProfile) return FLOW_PROFILES[appOrKey.flowProfile] || FLOW_PROFILES.full;
        if (appOrKey && appOrKey.type && TYPE_FLOW_PROFILE[appOrKey.type]) {
            return FLOW_PROFILES[TYPE_FLOW_PROFILE[appOrKey.type]] || FLOW_PROFILES.full;
        }
        return FLOW_PROFILES.full;
    }

    function stepIndex(status, profile) {
        const steps = (profile && profile.steps) || STEPS;
        const map = {
            draft: 0,
            pending_cross: 1,
            pending_risk: 2,
            pending_boss: 3,
            approved: steps.length,
            rejected: -1
        };
        return map[status] !== undefined ? map[status] : 0;
    }

    function statusLabel(status) {
        return {
            draft: '草稿',
            pending_cross: '待市场运营交叉审核',
            pending_risk: '待风控审核',
            pending_boss: '待老板审批',
            approved: '已通过',
            rejected: '已驳回'
        }[status] || status;
    }

    function getApps() {
        try {
            const apps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            let changed = false;
            apps.forEach(function (app) {
                const before = app.status;
                migrateLegacyStatus(app);
                if (app.status !== before) changed = true;
            });
            if (changed) saveApps(apps);
            return apps;
        } catch (e) {
            return [];
        }
    }

    function saveApps(apps) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }

    function migrateLegacyStatus(app) {
        if (app.status === 'pending_manager') app.status = 'pending_cross';
        if (app.timeline) {
            app.timeline.forEach(function (t) {
                if (t.action === '运营负责人通过') t.action = '市场运营交叉审核通过';
            });
        }
        return app;
    }

    function feeAttachmentPreview() {
        return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280"><rect fill="#f0f4f8" width="480" height="280"/><text x="24" y="48" font-size="18" fill="#334155" font-family="sans-serif">用户价值证明截图（演示）</text><text x="24" y="88" font-size="14" fill="#64748b" font-family="sans-serif">其他交易所 VIP / 交易量证明</text></svg>');
    }

    function buildSeedData() {
        const feeImg = feeAttachmentPreview();
        return [
            {
                id: 'APR20260727001',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'pending_cross',
                createdAt: '2026-07-27 09:00',
                remark: '新用户注册礼包补发',
                summary: '200 人 · 10,000 USDT · 标准新人礼包组',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202605001',
                    activityName: '新用户注册礼包',
                    cardGroup: '标准新人礼包组',
                    recipientCount: 200,
                    totalAmount: '10,000 USDT',
                    inputMode: 'manual',
                    recipients: [{ uid_or_wallet: '100891', amount: '50' }, { uid_or_wallet: '100234', amount: '100' }]
                },
                timeline: [{ at: '2026-07-27 09:00', actor: 'Trial_Admin', action: '提交申请', note: '新用户注册礼包补发' }]
            },
            {
                id: 'APR20260726002',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'pending_risk',
                createdAt: '2026-07-26 14:20',
                remark: '交易大赛周赛奖励',
                summary: '50 人 · 5,000 USDT · 交易大赛奖励组',
                payload: {
                    activityMode: 'custom',
                    activityName: '交易大赛奖励',
                    cardGroup: '交易大赛奖励组',
                    recipientCount: 50,
                    totalAmount: '5,000 USDT',
                    inputMode: 'excel',
                    recipients: [{ uid_or_wallet: '101205', amount: '100' }]
                },
                timeline: [
                    { at: '2026-07-26 14:20', actor: 'Trial_Admin', action: '提交申请', note: '交易大赛周赛奖励' },
                    { at: '2026-07-26 16:00', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '名单已核对' }
                ]
            },
            {
                id: 'APR20260725003',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'pending_boss',
                createdAt: '2026-07-25 11:00',
                remark: 'VIP 召回活动',
                summary: '30 人 · 6,000 USDT · VIP 专属体验组',
                payload: {
                    activityMode: 'custom',
                    activityName: 'VIP 召回活动',
                    cardGroup: 'VIP 专属体验组',
                    recipientCount: 30,
                    totalAmount: '6,000 USDT',
                    inputMode: 'manual',
                    recipients: [{ uid_or_wallet: '100234', amount: '200' }]
                },
                lark: { id: 'LARK-20260725-5521', status: 'pending', url: 'https://www.feishu.cn/approval/admin/preview/LARK-20260725-5521', syncedAt: '2026-07-25 15:30' },
                timeline: [
                    { at: '2026-07-25 11:00', actor: 'Trial_Admin', action: '提交申请', note: 'VIP 召回活动' },
                    { at: '2026-07-25 12:30', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '通过' },
                    { at: '2026-07-25 14:00', actor: 'Risk_Control', action: '风控通过', note: '风险可控' },
                    { at: '2026-07-25 15:30', actor: 'System', action: '已同步 Lark 审批', note: '等待老板在 Lark 完成审批' }
                ]
            },
            {
                id: 'APR20260720004',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'approved',
                createdAt: '2026-07-20 10:00',
                remark: '社群裂变活动',
                summary: '500 人 · 10,000 USDT · 限时拉新活动组',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202605003',
                    activityName: '社群裂变',
                    cardGroup: '限时拉新活动组',
                    recipientCount: 500,
                    totalAmount: '10,000 USDT',
                    inputMode: 'excel',
                    recipients: [{ uid_or_wallet: '100891', amount: '20' }]
                },
                timeline: [
                    { at: '2026-07-20 10:00', actor: 'Trial_Admin', action: '提交申请', note: '社群裂变' },
                    { at: '2026-07-20 11:00', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '通过' },
                    { at: '2026-07-20 14:00', actor: 'Risk_Control', action: '风控通过', note: '通过' },
                    { at: '2026-07-20 16:00', actor: 'Boss', action: '老板审批通过', note: '批准发放' }
                ]
            },
            {
                id: 'APR20260727011',
                type: 'points_manual',
                title: '积分手动发放',
                applicant: 'Points_Admin',
                status: 'pending_cross',
                createdAt: '2026-07-27 08:30',
                remark: '周交易返积分',
                summary: '120 人 · 5,000 积分 · 交易返积分',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202607001',
                    activityName: '交易返积分',
                    inputMode: 'lines',
                    recipientCount: 120,
                    totalPoints: 5000,
                    recipients: [{ uid_or_wallet: '200112', points: '500' }, { uid_or_wallet: '200445', points: '200' }]
                },
                timeline: [{ at: '2026-07-27 08:30', actor: 'Points_Admin', action: '提交申请', note: '周交易返积分' }]
            },
            {
                id: 'APR20260726012',
                type: 'points_manual',
                title: '积分手动发放',
                applicant: 'Points_Admin',
                status: 'pending_risk',
                createdAt: '2026-07-26 15:00',
                remark: 'KOL 合作结算',
                summary: '8 人 · 20,000 积分 · KOL 合作奖励',
                payload: {
                    activityMode: 'custom',
                    activityName: 'KOL 合作奖励',
                    inputMode: 'lines',
                    recipientCount: 8,
                    totalPoints: 20000,
                    recipients: [{ uid_or_wallet: '200112', points: '5000' }]
                },
                timeline: [
                    { at: '2026-07-26 15:00', actor: 'Points_Admin', action: '提交申请', note: 'KOL 合作结算' },
                    { at: '2026-07-26 17:00', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '已与商务确认' }
                ]
            },
            {
                id: 'APR20260724013',
                type: 'points_manual',
                title: '积分手动发放',
                applicant: 'Points_Admin',
                status: 'pending_boss',
                createdAt: '2026-07-24 10:00',
                remark: '签到活动补发',
                summary: '45 人 · 800 积分 · 签到补发',
                payload: {
                    activityMode: 'custom',
                    activityName: '签到补发',
                    inputMode: 'file',
                    recipientCount: 45,
                    totalPoints: 800,
                    recipients: [{ uid_or_wallet: '200891', points: '20' }]
                },
                lark: { id: 'LARK-20260724-3310', status: 'pending', url: 'https://www.feishu.cn/approval/admin/preview/LARK-20260724-3310', syncedAt: '2026-07-24 14:20' },
                timeline: [
                    { at: '2026-07-24 10:00', actor: 'Points_Admin', action: '提交申请', note: '签到活动补发' },
                    { at: '2026-07-24 11:30', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '通过' },
                    { at: '2026-07-24 13:00', actor: 'Risk_Control', action: '风控通过', note: '通过' },
                    { at: '2026-07-24 14:20', actor: 'System', action: '已同步 Lark 审批', note: '等待老板审批' }
                ]
            },
            {
                id: 'APR20260722014',
                type: 'points_manual',
                title: '积分手动发放',
                applicant: 'Points_Admin',
                status: 'rejected',
                createdAt: '2026-07-22 09:00',
                remark: '临时补发申请',
                summary: '3 人 · 150 积分 · 临时活动',
                payload: {
                    activityMode: 'custom',
                    activityName: '临时活动',
                    inputMode: 'lines',
                    recipientCount: 3,
                    totalPoints: 150,
                    recipients: [{ uid_or_wallet: '200445', points: '50' }]
                },
                timeline: [
                    { at: '2026-07-22 09:00', actor: 'Points_Admin', action: '提交申请', note: '临时补发申请' },
                    { at: '2026-07-22 10:30', actor: 'Mkt_Cross', action: '驳回', note: '请关联平台活动后重新提交' }
                ]
            },
            {
                id: 'APR20260727021',
                type: 'fee_config',
                title: '用户费率配置',
                applicant: 'Fee_Admin',
                status: 'pending_cross',
                createdAt: '2026-07-27 10:00',
                remark: 'VIP3 大客户申请',
                summary: 'UID 10028471 · VIP 3 · 90 天有效',
                payload: {
                    activityMode: 'custom',
                    activityName: 'VIP3 费率优惠',
                    uid: '10028471',
                    wallet: '0x7a3f...9c2e',
                    feeMode: 'vip',
                    vipLevel: 3,
                    taker: '0.029%',
                    maker: '0.006%',
                    validDays: 90,
                    attachments: ['币安VIP证明.png'],
                    attachmentPreviews: { '币安VIP证明.png': feeImg }
                },
                timeline: [{ at: '2026-07-27 10:00', actor: 'Fee_Admin', action: '提交申请', note: 'VIP3 大客户申请' }]
            },
            {
                id: 'APR20260726022',
                type: 'fee_config',
                title: '用户费率配置',
                applicant: 'Fee_Admin',
                status: 'pending_risk',
                createdAt: '2026-07-26 11:30',
                remark: '做市商专属费率',
                summary: 'UID 10019833 · 自定义 · 180 天有效',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202605004',
                    activityName: '做市商专属费率',
                    uid: '10019833',
                    wallet: '0xd5e2...1a7b',
                    feeMode: 'custom',
                    vipLevel: null,
                    taker: '0.030%',
                    maker: '0.000%',
                    validDays: 180,
                    attachments: ['做市商协议.png'],
                    attachmentPreviews: { '做市商协议.png': feeImg }
                },
                timeline: [
                    { at: '2026-07-26 11:30', actor: 'Fee_Admin', action: '提交申请', note: '做市商专属费率' },
                    { at: '2026-07-26 14:00', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '协议已核实' }
                ]
            },
            {
                id: 'APR20260725023',
                type: 'fee_config',
                title: '用户费率配置',
                applicant: 'Fee_Admin',
                status: 'pending_boss',
                createdAt: '2026-07-25 09:15',
                remark: '大客户 VIP2 费率申请',
                summary: 'UID 10031592 · VIP 2 · 30 天有效',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202605002',
                    activityName: '新手成长任务',
                    uid: '10031592',
                    wallet: '0x2b91...4f8a',
                    feeMode: 'vip',
                    vipLevel: 2,
                    taker: '0.034%',
                    maker: '0.010%',
                    validDays: 30,
                    attachments: ['币安VIP证明.png'],
                    attachmentPreviews: { '币安VIP证明.png': feeImg }
                },
                lark: { id: 'LARK-20260725-8831', status: 'pending', url: 'https://www.feishu.cn/approval/admin/preview/LARK-20260725-8831', syncedAt: '2026-07-25 13:40' },
                timeline: [
                    { at: '2026-07-25 09:15', actor: 'Fee_Admin', action: '提交申请', note: '大客户 VIP2 费率申请' },
                    { at: '2026-07-25 10:05', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '大客户专属费率' },
                    { at: '2026-07-25 11:20', actor: 'Risk_Control', action: '风控通过', note: '风险可控' },
                    { at: '2026-07-25 13:40', actor: 'System', action: '已同步 Lark 审批', note: '等待老板在 Lark 完成审批' }
                ]
            },
            {
                id: 'APR20260728040',
                type: 'points_pool_config',
                title: '积分总池配置',
                applicant: 'Points_Admin',
                status: 'pending_risk',
                flowProfile: 'cross_risk',
                createdAt: '2026-07-28 09:30',
                remark: '暑期活动加大交易维度权重',
                summary: '总池 1,200,000 · 交易 70% / 有效持仓 10%',
                payload: {
                    effectivePeriod: '2026-W30 (07/21 - 07/27)',
                    before: {
                        weeklyPool: 1000000,
                        dimPct: { trade: 60, position: 15, loss: 8, profit: 2, balance: 5, invite: 10 },
                        minHolding: { duration: 1, unit: 'hour' }
                    },
                    after: {
                        weeklyPool: 1200000,
                        dimPct: { trade: 70, position: 10, loss: 8, profit: 2, balance: 5, invite: 5 },
                        minHolding: { duration: 1, unit: 'hour' }
                    },
                    changes: [
                        { field: '本周总池（积分）', before: '1,000,000', after: '1,200,000' },
                        { field: '交易积分占比', before: '60%', after: '70%' },
                        { field: '有效持仓积分占比', before: '15%', after: '10%' },
                        { field: '邀请贡献积分占比', before: '10%', after: '5%' }
                    ]
                },
                timeline: [
                    { at: '2026-07-28 09:30', actor: 'Points_Admin', action: '提交申请', note: '暑期活动加大交易维度权重' },
                    { at: '2026-07-28 10:15', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '已与活动方案对齐' }
                ]
            },
            {
                id: 'APR20260727031',
                type: 'points_bonus_config',
                title: '积分加成配置',
                applicant: 'Points_Admin',
                status: 'pending_cross',
                createdAt: '2026-07-27 07:00',
                remark: '大客户专属加成',
                summary: '5 人 · 1.5x 加成 · 大客户积分加成',
                payload: {
                    activityMode: 'custom',
                    activityName: '大客户积分加成',
                    bonusMultiplier: 1.5,
                    recipientCount: 5,
                    anomalyCount: 1,
                    items: [
                        { uid: '200112', naturalBonus: '1.2x', newBonus: '1.5x', anomaly: false },
                        { uid: '200445', naturalBonus: '1.8x', newBonus: '1.5x', anomaly: true },
                        { uid: '200891', naturalBonus: '1.0x', newBonus: '1.5x', anomaly: false }
                    ]
                },
                timeline: [{ at: '2026-07-27 07:00', actor: 'Points_Admin', action: '提交申请', note: '含 1 名用户自然加成高于新设置' }]
            },
            {
                id: 'APR20260726032',
                type: 'points_bonus_config',
                title: '积分加成配置',
                applicant: 'Points_Admin',
                status: 'pending_risk',
                createdAt: '2026-07-26 10:30',
                remark: '暑期活动临时加成',
                summary: '50 人 · 2.0x 加成 · 暑期活动加成',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202607002',
                    activityName: '暑期活动加成',
                    bonusMultiplier: 2.0,
                    recipientCount: 50,
                    anomalyCount: 0,
                    items: [
                        { uid: '200112', naturalBonus: '1.2x', newBonus: '2.0x', anomaly: false },
                        { uid: '200445', naturalBonus: '1.1x', newBonus: '2.0x', anomaly: false }
                    ]
                },
                timeline: [
                    { at: '2026-07-26 10:30', actor: 'Points_Admin', action: '提交申请', note: '暑期活动批量配置' },
                    { at: '2026-07-26 12:00', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '已与活动方确认' }
                ]
            }
        ];
    }

    function seedIfEmpty() {
        if (localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION) {
            const apps = getApps().map(migrateLegacyStatus);
            if (apps.length) saveApps(apps);
            return;
        }
        saveApps(buildSeedData());
        localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    }

    function renderApprovalFlow(status, compact, appOrProfile) {
        const profile = getFlowProfile(appOrProfile);
        const steps = profile.steps;
        const current = stepIndex(status, profile);
        const rejected = status === 'rejected';
        let html = '<div class="approval-flow' + (compact ? ' compact' : '') + '">';
        steps.forEach(function (step, i) {
            let cls = 'step';
            if (rejected && i === Math.max(0, current - 1)) cls += ' rejected';
            else if (i < current) cls += ' done';
            else if (i === current && status !== 'approved') cls += ' active';
            else if (status === 'approved') cls += ' done';
            html += '<div class="' + cls + '"><div class="dot">' + (i < current || status === 'approved' ? '✓' : (i + 1)) + '</div><div class="label">' + step.label + '</div></div>';
            if (i < steps.length - 1) html += '<div class="line' + (i < current || status === 'approved' ? ' done' : '') + '"></div>';
        });
        html += '</div>';
        if (status === 'approved') html += '<p class="approval-note ok">✓ 审批已通过，操作已生效</p>';
        else if (status === 'rejected') html += '<p class="approval-note err">✕ 审批已驳回，请修改后重新提交</p>';
        else if (status === 'pending_cross') html += '<p class="approval-note wait">等待另一位市场运营交叉审核…</p>';
        else if (status === 'pending_risk') {
            html += profile.afterRisk === 'approved'
                ? '<p class="approval-note wait">交叉审核已通过，等待风控审核（无需老板审批）…</p>'
                : '<p class="approval-note wait">交叉审核已通过，等待风控审核…</p>';
        } else if (status === 'pending_boss') html += '<p class="approval-note wait">风控已通过，等待老板审批（后台或 Lark）…</p>';
        return html;
    }

    function renderLarkCard(app) {
        if (!app || !app.lark) return '';
        const lark = app.lark;
        const statusText = lark.status === 'approved' ? '已通过' : lark.status === 'rejected' ? '已驳回' : '待审批';
        const statusCls = lark.status === 'approved' ? 'ok' : lark.status === 'rejected' ? 'err' : 'wait';
        return '<div class="lark-card">' +
            '<div class="lark-card-head"><span class="lark-badge">Lark</span><span class="font-bold text-slate-800">老板审批已同步至飞书</span></div>' +
            '<p class="text-[11px] text-slate-500 mt-2">审批单号：<span class="font-mono font-bold">' + lark.id + '</span> · 状态：<span class="approval-note ' + statusCls + '" style="display:inline;margin:0">' + statusText + '</span></p>' +
            '<p class="text-[10px] text-slate-400 mt-1">同步时间 ' + (lark.syncedAt || '—') + ' · 老板可在 Lark 完成审批，后台亦支持操作</p>' +
            '<div class="flex gap-2 mt-3">' +
            '<a href="' + (lark.url || '#') + '" target="_blank" class="flex-1 text-center py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">在 Lark 中查看</a>' +
            (app.status === 'pending_boss' && lark.status === 'pending' ? '<button type="button" onclick="simulateLarkApprove(\'' + app.id + '\')" class="flex-1 py-2 bg-[#3370ff] text-white rounded-lg text-xs font-bold hover:opacity-90">模拟 Lark 通过</button>' : '') +
            '</div></div>';
    }

    function injectStyles() {
        if (document.getElementById('approval-flow-styles')) return;
        const style = document.createElement('style');
        style.id = 'approval-flow-styles';
        style.textContent = [
            '.approval-flow{display:flex;align-items:center;gap:0;margin:12px 0;overflow-x:auto;padding-bottom:4px}',
            '.approval-flow.compact{margin:8px 0}',
            '.approval-flow .step{display:flex;flex-direction:column;align-items:center;min-width:64px;position:relative;z-index:1;flex-shrink:0}',
            '.approval-flow.compact .step{min-width:52px}',
            '.approval-flow .dot{width:26px;height:26px;border-radius:50%;background:#e2e8f0;color:#94a3b8;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center}',
            '.approval-flow.compact .dot{width:20px;height:20px;font-size:9px}',
            '.approval-flow .step.done .dot{background:#22c55e;color:#fff}',
            '.approval-flow .step.active .dot{background:#3b82f6;color:#fff;box-shadow:0 0 0 3px #bfdbfe}',
            '.approval-flow .step.rejected .dot{background:#ef4444;color:#fff}',
            '.approval-flow .label{font-size:8px;color:#64748b;margin-top:4px;text-align:center;line-height:1.25;font-weight:600;max-width:72px}',
            '.approval-flow.compact .label{font-size:7px;max-width:60px}',
            '.approval-flow .step.active .label{color:#2563eb;font-weight:800}',
            '.approval-flow .step.done .label{color:#16a34a}',
            '.approval-flow .line{flex:1;min-width:12px;height:2px;background:#e2e8f0;margin:0 -2px;margin-bottom:22px}',
            '.approval-flow.compact .line{margin-bottom:16px}',
            '.approval-flow .line.done{background:#22c55e}',
            '.approval-note{font-size:11px;text-align:center;margin-top:8px;font-weight:600}',
            '.approval-note.ok{color:#16a34a}.approval-note.err{color:#dc2626}.approval-note.wait{color:#d97706}',
            '.status-pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700}',
            '.status-pending_cross{background:#fff7ed;color:#c2410c}.status-pending_risk{background:#eff6ff;color:#1d4ed8}',
            '.status-pending_boss{background:#f5f3ff;color:#6d28d9}.status-approved{background:#f0fdf4;color:#15803d}',
            '.status-rejected{background:#fef2f2;color:#b91c1c}',
            '.role-tab{padding:6px 14px;font-size:12px;font-weight:700;border-radius:8px;cursor:pointer;border:1px solid #e2e8f0}',
            '.role-tab.active{background:#0f172a;color:#fff;border-color:#0f172a}',
            '.lark-card{margin-top:12px;padding:14px;border-radius:10px;border:1px solid #c7d2fe;background:linear-gradient(135deg,#f8faff,#eef2ff)}',
            '.lark-card-head{display:flex;align-items:center;gap:8px}',
            '.lark-badge{background:#3370ff;color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px}'
        ].join('');
        document.head.appendChild(style);
    }

    function getAppById(id) {
        return getApps().find(function (a) { return a.id === id; });
    }

    function updateApp(id, updater) {
        const apps = getApps();
        const idx = apps.findIndex(function (a) { return a.id === id; });
        if (idx === -1) return null;
        updater(apps[idx]);
        saveApps(apps);
        return apps[idx];
    }

    function canApprove(app, role) {
        if (!app || app.status === 'approved' || app.status === 'rejected') return false;
        if (role === 'cross' && app.status === 'pending_cross') return true;
        if (role === 'risk' && app.status === 'pending_risk') return true;
        if (role === 'boss' && app.status === 'pending_boss') return true;
        return false;
    }

    function isPendingForRole(app, role) {
        return canApprove(app, role);
    }

    function pushLarkApproval(app) {
        app.lark = {
            id: 'LARK-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 9000) + 1000),
            status: 'pending',
            url: 'https://www.feishu.cn/approval/admin/preview/' + app.id,
            syncedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        app.timeline.push({
            at: app.lark.syncedAt,
            actor: 'System',
            action: '已同步 Lark 审批',
            note: '等待老板在 Lark 完成审批，后台亦可操作'
        });
    }

    function escapeCsv(val) {
        const s = String(val == null ? '' : val);
        if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function downloadCsv(filename, rows) {
        const bom = '\uFEFF';
        const csv = bom + rows.map(function (row) {
            return row.map(escapeCsv).join(',');
        }).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function formatActivity(p) {
        if (!p) return '—';
        if (p.activityMode === 'platform' && p.activityId) {
            return p.activityId + ' · ' + (p.activityName || '');
        }
        return (p.activityName || '—') + '（自定义）';
    }

    window.renderApprovalFlow = function (status, compact, appOrProfile) {
        injectStyles();
        return renderApprovalFlow(status || 'draft', compact, appOrProfile);
    };

    window.getApprovalFlowProfile = getFlowProfile;

    window.renderLarkApprovalCard = function (app) {
        injectStyles();
        return renderLarkCard(app);
    };

    window.getApprovalTypeLabel = function (type) {
        return TYPE_LABELS[type] || type;
    };

    window.getApprovalRoleLabel = function (role) {
        return ROLE_LABELS[role] || role;
    };

    window.getApprovalStatusLabel = statusLabel;

    window.getApprovalApps = getApps;

    window.getApprovalAppsByType = function (type) {
        return getApps().filter(function (a) { return a.type === type; });
    };

    window.getApprovalAppsByTypes = function (types) {
        if (!types || !types.length) return getApps();
        return getApps().filter(function (a) { return types.indexOf(a.type) !== -1; });
    };

    window.getApprovalAppById = getAppById;

    window.getApprovalViewRole = function () {
        return sessionStorage.getItem(ROLE_KEY) || 'cross';
    };

    window.setApprovalViewRole = function (role) {
        sessionStorage.setItem(ROLE_KEY, role);
    };

    window.canApproveApplication = canApprove;

    window.isApprovalPendingForRole = isPendingForRole;

    window.formatApprovalActivity = formatActivity;

    window.submitApprovalApplication = function (opts) {
        opts = opts || {};
        seedIfEmpty();
        const app = {
            id: 'APR' + Date.now(),
            type: opts.type || 'other',
            title: opts.title || '审批申请',
            summary: opts.summary || '',
            applicant: opts.applicant || '市场运营',
            status: 'pending_cross',
            flowProfile: opts.flowProfile || TYPE_FLOW_PROFILE[opts.type] || 'full',
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            remark: opts.remark || '',
            payload: opts.payload || {},
            timeline: [{
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: opts.applicant || '市场运营',
                action: '提交申请',
                note: opts.remark || ''
            }]
        };
        const apps = getApps();
        apps.unshift(app);
        saveApps(apps);
        if (opts.onSubmit) opts.onSubmit(app);
        return app;
    };

    window.approveApplication = function (id, role, note) {
        const actorMap = { cross: 'Mkt_Cross', risk: 'Risk_Control', boss: 'Boss' };
        const actionMap = {
            cross: '市场运营交叉审核通过',
            risk: '风控通过',
            boss: '老板审批通过'
        };
        return updateApp(id, function (app) {
            const profile = getFlowProfile(app);
            app.timeline.push({
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: actorMap[role] || role,
                action: actionMap[role] || '通过',
                note: note || ''
            });
            if (role === 'cross' && app.status === 'pending_cross') app.status = 'pending_risk';
            else if (role === 'risk' && app.status === 'pending_risk') {
                if (profile.afterRisk === 'approved') {
                    app.status = 'approved';
                    if (app.type === 'points_pool_config' && app.payload && app.payload.after) {
                        try {
                            localStorage.setItem('forx_points_pool_saved_config', JSON.stringify(app.payload.after));
                        } catch (e) { /* ignore */ }
                        if (typeof window.applySavedPoolConfig === 'function') window.applySavedPoolConfig(app.payload.after);
                    }
                    if (app.type === 'points_program_switch' && app.payload && typeof app.payload.afterEnabled === 'boolean') {
                        if (typeof window.setPointsProgramEnabled === 'function') {
                            window.setPointsProgramEnabled(app.payload.afterEnabled);
                        }
                        if (typeof window.clearPointsProgramPending === 'function') window.clearPointsProgramPending();
                    }
                } else {
                    app.status = 'pending_boss';
                    if (profile.larkOnRisk) pushLarkApproval(app);
                }
            } else if (role === 'boss' && app.status === 'pending_boss') {
                app.status = 'approved';
                if (app.lark) app.lark.status = 'approved';
            }
        });
    };

    window.rejectApplication = function (id, role, note) {
        const actorMap = { cross: 'Mkt_Cross', risk: 'Risk_Control', boss: 'Boss' };
        return updateApp(id, function (app) {
            if (app.lark) app.lark.status = 'rejected';
            app.status = 'rejected';
            if (app.type === 'points_program_switch' && typeof window.clearPointsProgramPending === 'function') {
                window.clearPointsProgramPending();
            }
            app.timeline.push({
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: actorMap[role] || role,
                action: '驳回',
                note: note || ''
            });
        });
    };

    window.simulateLarkApprove = function (id) {
        return updateApp(id, function (app) {
            if (!app.lark || app.status !== 'pending_boss') return;
            app.lark.status = 'approved';
            app.status = 'approved';
            app.timeline.push({
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: 'Boss (Lark)',
                action: '老板审批通过',
                note: '通过 Lark 审批完成'
            });
        });
    };

    window.exportApprovalListCsv = function (list) {
        const rows = [['审批单号', '业务类型', '申请人', '申请时间', '状态', '摘要', '活动信息', '申请备注']];
        (list || getApps()).forEach(function (a) {
            rows.push([
                a.id, TYPE_LABELS[a.type] || a.type, a.applicant, a.createdAt,
                statusLabel(a.status), a.summary, formatActivity(a.payload), a.remark
            ]);
        });
        downloadCsv('approval_list_' + Date.now() + '.csv', rows);
    };

    window.exportApprovalDetailCsv = function (app) {
        if (!app) return;
        const rows = [
            ['字段', '值'],
            ['审批单号', app.id],
            ['业务类型', TYPE_LABELS[app.type] || app.type],
            ['申请人', app.applicant],
            ['申请时间', app.createdAt],
            ['状态', statusLabel(app.status)],
            ['摘要', app.summary],
            ['活动信息', formatActivity(app.payload)],
            ['申请备注', app.remark]
        ];
        const p = app.payload || {};
        if (app.type === 'trial_issue' && p.recipients) {
            rows.push([]);
            rows.push(['uid_or_wallet', 'amount']);
            p.recipients.forEach(function (r) { rows.push([r.uid_or_wallet, r.amount]); });
        } else if (app.type === 'points_manual' && p.recipients) {
            rows.push([]);
            rows.push(['uid_or_wallet', 'points']);
            p.recipients.forEach(function (r) { rows.push([r.uid_or_wallet, r.points]); });
        } else if (app.type === 'points_bonus_config' && p.items) {
            rows.push([]);
            rows.push(['uid', 'natural_bonus', 'new_bonus', 'anomaly']);
            p.items.forEach(function (r) {
                rows.push([r.uid, r.naturalBonus, r.newBonus, r.anomaly ? 'yes' : 'no']);
            });
        } else if (app.type === 'points_pool_config' && p.changes) {
            rows.push([]);
            rows.push(['配置项', '变更前', '变更后']);
            p.changes.forEach(function (c) {
                rows.push([c.field, c.before, c.after]);
            });
        } else if (app.type === 'points_program_switch') {
            rows.push([]);
            rows.push(['配置项', '变更前', '变更后']);
            rows.push(['积分计划总开关', p.beforeEnabled ? '开启' : '关闭', p.afterEnabled ? '开启' : '关闭']);
        } else if (app.type === 'fee_config') {
            Object.keys(p).forEach(function (k) {
                if (k !== 'recipients') rows.push([k, Array.isArray(p[k]) ? p[k].join('; ') : p[k]]);
            });
        }
        downloadCsv(app.id + '_detail.csv', rows);
    };

    seedIfEmpty();
})();
