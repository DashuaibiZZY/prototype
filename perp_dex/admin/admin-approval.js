/**
 * 三级审批流：运营申请 → 运营负责人审批 → 风控审批
 * renderApprovalFlow(status)  status: draft | pending_manager | pending_risk | approved | rejected
 */
(function () {
    const STEPS = [
        { key: 'apply', label: '运营申请', role: '运营' },
        { key: 'manager', label: '运营负责人审批', role: '运营负责人' },
        { key: 'risk', label: '风控审批', role: '风控' }
    ];

    function stepIndex(status) {
        const map = { draft: 0, pending_manager: 1, pending_risk: 2, approved: 3, rejected: -1 };
        return map[status] !== undefined ? map[status] : 0;
    }

    function renderApprovalFlow(status, compact) {
        const current = stepIndex(status);
        const rejected = status === 'rejected';
        let html = '<div class="approval-flow' + (compact ? ' compact' : '') + '">';
        STEPS.forEach(function (step, i) {
            let cls = 'step';
            if (rejected && i === current) cls += ' rejected';
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

    window.renderApprovalFlow = function (status, compact) {
        injectStyles();
        return renderApprovalFlow(status || 'draft', compact);
    };

    window.submitApprovalApplication = function (opts) {
        opts = opts || {};
        const app = {
            id: 'APR' + Date.now(),
            title: opts.title || '审批申请',
            summary: opts.summary || '',
            applicant: opts.applicant || '运营',
            status: 'pending_manager',
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            remark: opts.remark || ''
        };
        if (opts.onSubmit) opts.onSubmit(app);
        return app;
    };
})();
