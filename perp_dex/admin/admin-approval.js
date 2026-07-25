/**
 * 三级审批流：运营申请 → 运营负责人审批 → 风控审批
 */
(function () {
    const STORAGE_KEY = 'forx_approval_applications';
    const ROLE_KEY = 'forx_approval_view_role';

    const STEPS = [
        { key: 'apply', label: '运营申请', role: '运营' },
        { key: 'manager', label: '运营负责人审批', role: '运营负责人' },
        { key: 'risk', label: '风控审批', role: '风控' }
    ];

    const TYPE_LABELS = {
        trial_issue: '体验金发放',
        points_manual: '积分手动发放',
        fee_config: '用户费率配置'
    };

    function stepIndex(status) {
        const map = { draft: 0, pending_manager: 1, pending_risk: 2, approved: 3, rejected: -1 };
        return map[status] !== undefined ? map[status] : 0;
    }

    function statusLabel(status) {
        return {
            draft: '草稿',
            pending_manager: '待运营负责人审批',
            pending_risk: '待风控审批',
            approved: '已通过',
            rejected: '已驳回'
        }[status] || status;
    }

    function getApps() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveApps(apps) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    }

    function seedIfEmpty() {
        if (getApps().length) return;
        const seed = [
            {
                id: 'APR20260724001',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'pending_manager',
                createdAt: '2026-07-24 10:30',
                remark: 'KOL 合作活动补发',
                summary: '120 人 · 12,540 USDT · 标准新人礼包组',
                payload: {
                    activityName: '社区 KOL 合作激励',
                    cardGroup: '标准新人礼包组',
                    recipientCount: 120,
                    totalAmount: '12,540 USDT',
                    inputMode: 'manual',
                    recipients: [
                        { uid_or_wallet: '100891', amount: '250' },
                        { uid_or_wallet: '100234', amount: '100' },
                        { uid_or_wallet: '0x8f3c...dcba', amount: '250' }
                    ]
                },
                timeline: [{ at: '2026-07-24 10:30', actor: 'Trial_Admin', action: '提交申请', note: 'KOL 合作活动补发' }]
            },
            {
                id: 'APR20260724002',
                type: 'points_manual',
                title: '积分手动发放',
                applicant: 'Points_Admin',
                status: 'pending_risk',
                createdAt: '2026-07-23 16:00',
                remark: '客诉补偿批量发放',
                summary: '3 人 · 200 积分 · 运营补偿活动',
                payload: {
                    activityName: '运营补偿活动',
                    inputMode: 'lines',
                    recipientCount: 3,
                    totalPoints: 200,
                    recipients: [
                        { uid_or_wallet: '200445', points: '50' },
                        { uid_or_wallet: '200112', points: '100' },
                        { uid_or_wallet: '200891', points: '50' }
                    ]
                },
                timeline: [
                    { at: '2026-07-23 16:00', actor: 'Points_Admin', action: '提交申请', note: '客诉补偿批量发放' },
                    { at: '2026-07-23 17:20', actor: 'Ops_Manager', action: '运营负责人通过', note: '已与客服确认名单' }
                ]
            },
            {
                id: 'APR20260722003',
                type: 'fee_config',
                title: '用户费率配置',
                applicant: 'Fee_Admin',
                status: 'pending_manager',
                createdAt: '2026-07-22 11:15',
                remark: '大客户 VIP2 费率申请',
                summary: 'UID 10031592 · VIP 2',
                payload: {
                    uid: '10031592',
                    wallet: '0x2b91...4f8a',
                    feeMode: 'vip',
                    vipLevel: 2,
                    taker: '0.034%',
                    maker: '0.010%',
                    attachments: ['审批截图.png', '币安VIP证明.png']
                },
                timeline: [{ at: '2026-07-22 11:15', actor: 'Fee_Admin', action: '提交申请', note: '大客户 VIP2 费率申请' }]
            }
        ];
        saveApps(seed);
    }

    function renderApprovalFlow(status, compact) {
        const current = stepIndex(status);
        const rejected = status === 'rejected';
        let html = '<div class="approval-flow' + (compact ? ' compact' : '') + '">';
        STEPS.forEach(function (step, i) {
            let cls = 'step';
            if (rejected && i === Math.max(0, current)) cls += ' rejected';
            else if (i < current) cls += ' done';
            else if (i === current && status !== 'approved') cls += ' active';
            else if (status === 'approved') cls += ' done';
            html += '<div class="' + cls + '"><div class="dot">' + (i < current || status === 'approved' ? '✓' : (i + 1)) + '</div><div class="label">' + step.label + '</div></div>';
            if (i < STEPS.length - 1) html += '<div class="line' + (i < current || status === 'approved' ? ' done' : '') + '"></div>';
        });
        html += '</div>';
        if (status === 'approved') html += '<p class="approval-note ok">✓ 审批已通过，操作已生效</p>';
        else if (status === 'rejected') html += '<p class="approval-note err">✕ 审批已驳回，请修改后重新提交</p>';
        else if (status === 'pending_manager') html += '<p class="approval-note wait">等待运营负责人审批…</p>';
        else if (status === 'pending_risk') html += '<p class="approval-note wait">运营负责人已通过，等待风控审批…</p>';
        return html;
    }

    function injectStyles() {
        if (document.getElementById('approval-flow-styles')) return;
        const style = document.createElement('style');
        style.id = 'approval-flow-styles';
        style.textContent = [
            '.approval-flow{display:flex;align-items:center;gap:0;margin:12px 0}',
            '.approval-flow.compact{margin:8px 0}',
            '.approval-flow .step{display:flex;flex-direction:column;align-items:center;min-width:72px;position:relative;z-index:1}',
            '.approval-flow.compact .step{min-width:60px}',
            '.approval-flow .dot{width:28px;height:28px;border-radius:50%;background:#e2e8f0;color:#94a3b8;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}',
            '.approval-flow.compact .dot{width:22px;height:22px;font-size:10px}',
            '.approval-flow .step.done .dot{background:#22c55e;color:#fff}',
            '.approval-flow .step.active .dot{background:#3b82f6;color:#fff;box-shadow:0 0 0 3px #bfdbfe}',
            '.approval-flow .step.rejected .dot{background:#ef4444;color:#fff}',
            '.approval-flow .label{font-size:9px;color:#64748b;margin-top:4px;text-align:center;line-height:1.3;font-weight:600}',
            '.approval-flow.compact .label{font-size:8px}',
            '.approval-flow .step.active .label{color:#2563eb;font-weight:800}',
            '.approval-flow .step.done .label{color:#16a34a}',
            '.approval-flow .line{flex:1;height:2px;background:#e2e8f0;margin:0 -4px;margin-bottom:18px}',
            '.approval-flow.compact .line{margin-bottom:14px}',
            '.approval-flow .line.done{background:#22c55e}',
            '.approval-note{font-size:11px;text-align:center;margin-top:8px;font-weight:600}',
            '.approval-note.ok{color:#16a34a}.approval-note.err{color:#dc2626}.approval-note.wait{color:#d97706}'
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
        if (role === 'manager' && app.status === 'pending_manager') return true;
        if (role === 'risk' && app.status === 'pending_risk') return true;
        return false;
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

    window.renderApprovalFlow = function (status, compact) {
        injectStyles();
        return renderApprovalFlow(status || 'draft', compact);
    };

    window.getApprovalTypeLabel = function (type) {
        return TYPE_LABELS[type] || type;
    };

    window.getApprovalStatusLabel = statusLabel;

    window.getApprovalApps = getApps;

    window.getApprovalAppById = getAppById;

    window.getApprovalViewRole = function () {
        return sessionStorage.getItem(ROLE_KEY) || 'manager';
    };

    window.setApprovalViewRole = function (role) {
        sessionStorage.setItem(ROLE_KEY, role);
    };

    window.canApproveApplication = canApprove;

    window.submitApprovalApplication = function (opts) {
        opts = opts || {};
        seedIfEmpty();
        const app = {
            id: 'APR' + Date.now(),
            type: opts.type || 'other',
            title: opts.title || '审批申请',
            summary: opts.summary || '',
            applicant: opts.applicant || '运营',
            status: 'pending_manager',
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            remark: opts.remark || '',
            payload: opts.payload || {},
            timeline: [{
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: opts.applicant || '运营',
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
        const actor = role === 'manager' ? 'Ops_Manager' : 'Risk_Control';
        const action = role === 'manager' ? '运营负责人通过' : '风控通过';
        return updateApp(id, function (app) {
            app.timeline.push({ at: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: actor, action: action, note: note || '' });
            if (role === 'manager' && app.status === 'pending_manager') app.status = 'pending_risk';
            else if (role === 'risk' && app.status === 'pending_risk') app.status = 'approved';
        });
    };

    window.rejectApplication = function (id, role, note) {
        const actor = role === 'manager' ? 'Ops_Manager' : 'Risk_Control';
        return updateApp(id, function (app) {
            app.status = 'rejected';
            app.timeline.push({ at: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: actor, action: '驳回', note: note || '' });
        });
    };

    window.exportApprovalListCsv = function (list) {
        const rows = [['审批单号', '业务类型', '申请人', '申请时间', '状态', '摘要', '申请备注']];
        (list || getApps()).forEach(function (a) {
            rows.push([a.id, TYPE_LABELS[a.type] || a.type, a.applicant, a.createdAt, statusLabel(a.status), a.summary, a.remark]);
        });
        downloadCsv('approval_list_' + Date.now() + '.csv', rows);
    };

    window.exportApprovalDetailCsv = function (app) {
        if (!app) return;
        const rows = [['字段', '值'], ['审批单号', app.id], ['业务类型', TYPE_LABELS[app.type] || app.type], ['申请人', app.applicant], ['申请时间', app.createdAt], ['状态', statusLabel(app.status)], ['摘要', app.summary], ['申请备注', app.remark]];
        const p = app.payload || {};
        if (app.type === 'trial_issue' && p.recipients) {
            rows.push([]);
            rows.push(['uid_or_wallet', 'amount']);
            p.recipients.forEach(function (r) { rows.push([r.uid_or_wallet, r.amount]); });
        } else if (app.type === 'points_manual' && p.recipients) {
            rows.push([]);
            rows.push(['活动名称', p.activityName || '']);
            rows.push(['uid_or_wallet', 'points']);
            p.recipients.forEach(function (r) { rows.push([r.uid_or_wallet, r.points]); });
        } else if (app.type === 'fee_config') {
            Object.keys(p).forEach(function (k) {
                if (k !== 'recipients') rows.push([k, Array.isArray(p[k]) ? p[k].join('; ') : p[k]]);
            });
        }
        downloadCsv(app.id + '_detail.csv', rows);
    };

    seedIfEmpty();
})();
