/**
 * ForX Admin 页面清单与敏感操作组（权限模型 v3.1 — 按模块拆分审批组）
 */
(function () {
    const ADMIN_PAGES = [
        { id: 'sys.admin', module: '系统', label: '权限与用户', writeHint: '维护人员、页面权限与敏感组' },
        { id: 'agent.mgmt', module: '合伙人中心', label: '一级合伙人管理', writeHint: '绑定/调整一级合伙人', needsAgentCap: true },
        { id: 'agent.settlement', module: '合伙人中心', label: '佣金对账与发放', writeHint: '对账与发放（返佣大版本后续更新）' },
        { id: 'trial.config', module: '体验金', label: '卡组配置', writeHint: '新建/编辑卡组' },
        { id: 'trial.issue', module: '体验金', label: '批量发放', writeHint: '提交体验金发放审批' },
        { id: 'trial.approval', module: '体验金', label: '发放审批', writeHint: '只读查看；审批走敏感组' },
        { id: 'trial.users', module: '体验金', label: '数据查询&回收', writeHint: '只读查询；回收走回收组' },
        { id: 'trial.logs', module: '体验金', label: '操作记录', writeHint: '审计只读' },
        { id: 'freeze.settings', module: '风控冻结', label: '用户冻结设置', writeHint: '配置/解除冻结' },
        { id: 'freeze.log', module: '风控冻结', label: '冻结操作记录', writeHint: '审计只读' },
        { id: 'leaderboard', module: '排行榜', label: '排行榜影子配置', writeHint: '影子账户配置' },
        { id: 'fee.settings', module: '费率', label: '用户费率设置', writeHint: '提交费率审批' },
        { id: 'fee.approval', module: '费率', label: '费率审批', writeHint: '只读查看；审批走敏感组' },
        { id: 'fee.log', module: '费率', label: '费率操作记录', writeHint: '审计只读' },
        { id: 'points.overview', module: '积分', label: '积分发放总览', writeHint: '统计只读' },
        { id: 'points.config', module: '积分', label: '每周积分总池设置', writeHint: '提交总池配置审批' },
        { id: 'points.bonus', module: '积分', label: '积分加成配置', writeHint: '提交加成审批' },
        { id: 'points.users', module: '积分', label: '用户积分查询', writeHint: '查询只读' },
        { id: 'points.manual', module: '积分', label: '手动发放积分', writeHint: '提交手动发放审批' },
        { id: 'points.approval', module: '积分', label: '积分审核', writeHint: '只读查看；审批走敏感组' },
        { id: 'points.logs', module: '积分', label: '操作记录', writeHint: '审计只读' }
    ];

    /** 每个模块独立审批池，互不共用 */
    const SENSITIVE_GROUPS = [
        { id: 'trial.approve.cross', module: '体验金', type: 'approve', label: '体验金 · 交叉审核组', description: '体验金发放审批「待交叉审核」待办从此组纯随机派单。' },
        { id: 'trial.approve.risk', module: '体验金', type: 'approve', label: '体验金 · 风控审核组', description: '体验金「待风控审核」待办纯随机派单。' },
        { id: 'trial.approve.boss', module: '体验金', type: 'approve', label: '体验金 · BOSS 审核组', description: '体验金「待老板审批」待办纯随机派单。' },
        { id: 'trial.recycle', module: '体验金', type: 'recycle', label: '体验金 · 强制回收组', description: '仅组内人员可执行体验金强制回收。' },
        { id: 'points.approve.cross', module: '积分', type: 'approve', label: '积分 · 交叉审核组', description: '积分相关审批「待交叉审核」纯随机派单。' },
        { id: 'points.approve.risk', module: '积分', type: 'approve', label: '积分 · 风控审核组', description: '积分「待风控审核」纯随机派单。' },
        { id: 'points.approve.boss', module: '积分', type: 'approve', label: '积分 · BOSS 审核组', description: '积分「待老板审批」纯随机派单（总池配置无此节点）。' },
        { id: 'fee.approve.cross', module: '费率', type: 'approve', label: '费率 · 交叉审核组', description: '费率配置审批「待交叉审核」纯随机派单。' },
        { id: 'fee.approve.risk', module: '费率', type: 'approve', label: '费率 · 风控审核组', description: '费率「待风控审核」纯随机派单。' },
        { id: 'fee.approve.boss', module: '费率', type: 'approve', label: '费率 · BOSS 审核组', description: '费率「待老板审批」纯随机派单。' }
    ];

    function getPagesByModule() {
        var map = {};
        ADMIN_PAGES.forEach(function (p) {
            if (!map[p.module]) map[p.module] = [];
            map[p.module].push(p);
        });
        return map;
    }

    function getGroupsByModule() {
        var map = {};
        SENSITIVE_GROUPS.forEach(function (g) {
            if (!map[g.module]) map[g.module] = [];
            map[g.module].push(g);
        });
        return map;
    }

    window.ADMIN_PAGES = ADMIN_PAGES;
    window.ADMIN_SENSITIVE_GROUPS = SENSITIVE_GROUPS;
    window.getAdminPagesByModule = getPagesByModule;
    window.getAdminGroupsByModule = getGroupsByModule;
})();
