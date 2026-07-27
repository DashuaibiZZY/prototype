/**
 * 四级审批流：市场运营提交 → 市场运营交叉审核 → 风控审核 → 老板审批（可同步 Lark）
 */
(function () {
    const STORAGE_KEY = 'forx_approval_applications';
    const ROLE_KEY = 'forx_approval_view_role';

    const STEPS = [
        { key: 'apply', label: '市场运营提交', role: '市场运营' },
        { key: 'cross', label: '市场运营交叉审核', role: '市场运营' },
        { key: 'risk', label: '风控审核', role: '风控' },
        { key: 'boss', label: '老板审批', role: '老板' }
    ];

    const TYPE_LABELS = {
        trial_issue: '体验金发放',
        points_manual: '积分手动发放',
        fee_config: '用户费率配置'
    };

    const ROLE_LABELS = {
        cross: '市场运营（交叉审核）',
        risk: '风控',
        boss: '老板'
    };

    function stepIndex(status) {
        const map = {
            draft: 0,
            pending_cross: 1,
            pending_risk: 2,
            pending_boss: 3,
            approved: 4,
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

    function seedIfEmpty() {
        const apps = getApps().map(migrateLegacyStatus);
        if (apps.length) {
            saveApps(apps);
            return;
        }
        const seed = [
            {
                id: 'APR20260724001',
                type: 'trial_issue',
                title: '体验金批量发放',
                applicant: 'Trial_Admin',
                status: 'pending_cross',
                createdAt: '2026-07-24 10:30',
                remark: 'KOL 合作活动补发',
                summary: '120 人 · 12,540 USDT · 标准新人礼包组',
                payload: {
                    activityMode: 'platform',
                    activityId: 'ACT202605001',
                    activityName: 'ForX嘉年华交易大赛',
                    cardGroup: '标准新人礼包组',
                    recipientCount: 120,
                    totalAmount: '12,540 USDT',
                    inputMode: 'manual',
                    recipients: [
                        { uid_or_wallet: '100891', amount: '250' },
                        { uid_or_wallet: '100234', amount: '100' }
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
                    activityMode: 'custom',
                    activityId: null,
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
                    { at: '2026-07-23 17:20', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '已与客服确认名单' }
                ]
            },
            {
                id: 'APR20260722003',
                type: 'fee_config',
                title: '用户费率配置',
                applicant: 'Fee_Admin',
                status: 'pending_boss',
                createdAt: '2026-07-22 11:15',
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
                    attachments: ['币安VIP证明.png']
                },
                lark: {
                    id: 'LARK-20260722-8831',
                    status: 'pending',
                    url: 'https://www.feishu.cn/approval/admin/preview/LARK-20260722-8831',
                    syncedAt: '2026-07-22 15:40'
                },
                timeline: [
                    { at: '2026-07-22 11:15', actor: 'Fee_Admin', action: '提交申请', note: '大客户 VIP2 费率申请' },
                    { at: '2026-07-22 12:05', actor: 'Mkt_Cross', action: '市场运营交叉审核通过', note: '大客户专属费率' },
                    { at: '2026-07-22 14:20', actor: 'Risk_Control', action: '风控通过', note: '风险可控' },
                    { at: '2026-07-22 15:40', actor: 'System', action: '已同步 Lark 审批', note: '等待老板在 Lark 完成审批' }
                ]
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
            if (rejected && i === Math.max(0, current - 1)) cls += ' rejected';
            else if (i < current) cls += ' done';
            else if (i === current && status !== 'approved') cls += ' active';
            else if (status === 'approved') cls += ' done';
            html += '<div class="' + cls + '"><div class="dot">' + (i < current || status === 'approved' ? '✓' : (i + 1)) + '</div><div class="label">' + step.label + '</div></div>';
            if (i < STEPS.length - 1) html += '<div class="line' + (i < current || status === 'approved' ? ' done' : '') + '"></div>';
        });
        html += '</div>';
        if (status === 'approved') html += '<p class="approval-note ok">✓ 审批已通过，操作已生效</p>';
        else if (status === 'rejected') html += '<p class="approval-note err">✕ 审批已驳回，请修改后重新提交</p>';
        else if (status === 'pending_cross') html += '<p class="approval-note wait">等待另一位市场运营交叉审核…</p>';
        else if (status === 'pending_risk') html += '<p class="approval-note wait">交叉审核已通过，等待风控审核…</p>';
        else if (status === 'pending_boss') html += '<p class="approval-note wait">风控已通过，等待老板审批（后台或 Lark）…</p>';
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

    window.renderApprovalFlow = function (status, compact) {
        injectStyles();
        return renderApprovalFlow(status || 'draft', compact);
    };

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
            app.timeline.push({
                at: new Date().toISOString().slice(0, 16).replace('T', ' '),
                actor: actorMap[role] || role,
                action: actionMap[role] || '通过',
                note: note || ''
            });
            if (role === 'cross' && app.status === 'pending_cross') app.status = 'pending_risk';
            else if (role === 'risk' && app.status === 'pending_risk') {
                app.status = 'pending_boss';
                pushLarkApproval(app);
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
        } else if (app.type === 'fee_config') {
            Object.keys(p).forEach(function (k) {
                if (k !== 'recipients') rows.push([k, Array.isArray(p[k]) ? p[k].join('; ') : p[k]]);
            });
        }
        downloadCsv(app.id + '_detail.csv', rows);
    };

    seedIfEmpty();
})();
