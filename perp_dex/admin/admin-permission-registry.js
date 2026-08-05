/**
 * ForX Admin 页面清单与敏感操作组（权限模型 v3）
 */
(function () {
    const ADMIN_PAGES = [
        { id: 'sys.admin', module: '系统', label: '权限与用户', writeHint: '维护人员、页面权限与敏感组' },
        { id: 'agent.mgmt', module: '代理中心', label: '一级代理管理', writeHint: '绑定/调整一级代理', needsAgentCap: true },
        { id: 'agent.operator', module: '代理中心', label: '运营权限配置', writeHint: '配置运营账号返佣上限' },
        { id: 'agent.settlement', module: '代理中心', label: '佣金对账与发放', writeHint: '对账确认与佣金发放' },
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

    const SENSITIVE_GROUPS = [
        {
            id: 'approve.cross',
            label: '市场运营交叉审核组',
            description: '体验金/积分/费率「待交叉审核」待办从此组随机派单；组内被派单者可审批通过/驳回。'
        },
        {
            id: 'approve.risk',
            label: '风控审核组',
            description: '三模块「待风控审核」待办随机派单；组内被派单者可审批通过/驳回。'
        },
        {
            id: 'approve.boss',
            label: 'BOSS 审核组',
            description: '三模块「待老板审批」待办随机派单；可与 Lark 联动。'
        },
        {
            id: 'trial.recycle',
            label: '体验金强制回收组',
            description: '仅组内人员可操作用户列表/详情/总览中的体验金强制回收。'
        }
    ];

    function getPagesByModule() {
        const map = {};
        ADMIN_PAGES.forEach(function (p) {
            if (!map[p.module]) map[p.module] = [];
            map[p.module].push(p);
        });
        return map;
    }

    window.ADMIN_PAGES = ADMIN_PAGES;
    window.ADMIN_SENSITIVE_GROUPS = SENSITIVE_GROUPS;
    window.getAdminPagesByModule = getPagesByModule;
})();
