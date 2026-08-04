/**
 * 后台权限注册表 — 菜单与敏感动作的唯一来源（前后端对齐用）
 */
(function () {
    const GROUPS = [
        {
            id: 'sys',
            label: '系统设置',
            menus: [
                { id: 'menu.sys.admin', label: '权限与用户配置', hint: '角色矩阵、后台用户管理' }
            ],
            actions: [
                { id: 'sys.role.manage', label: '管理角色与权限矩阵', sensitive: true },
                { id: 'sys.user.manage', label: '新增/编辑后台用户', sensitive: true }
            ]
        },
        {
            id: 'agent',
            label: '代理中心',
            menus: [
                { id: 'menu.agent.mgmt', label: '一级代理管理' },
                { id: 'menu.agent.operator', label: '运营权限配置' },
                { id: 'menu.agent.settlement', label: '佣金对账与发放' }
            ],
            actions: []
        },
        {
            id: 'trial',
            label: '体验金',
            menus: [
                { id: 'menu.trial.config', label: '卡组配置' },
                { id: 'menu.trial.issue', label: '批量发放' },
                { id: 'menu.trial.approval', label: '发放审批' },
                { id: 'menu.trial.users', label: '数据查询&回收' },
                { id: 'menu.trial.logs', label: '操作记录' }
            ],
            actions: [
                { id: 'trial.issue.submit', label: '提交体验金发放审批', sensitive: true },
                { id: 'trial.recycle', label: '体验金风控强制回收', sensitive: true },
                { id: 'trial.approval.view', label: '查看体验金审批', sensitive: false },
                { id: 'trial.approve.cross', label: '体验金交叉审批', sensitive: true },
                { id: 'trial.approve.risk', label: '体验金风控审核', sensitive: true },
                { id: 'trial.approve.boss', label: '体验金老板审批', sensitive: true }
            ]
        },
        {
            id: 'freeze',
            label: '风控冻结',
            menus: [
                { id: 'menu.freeze.settings', label: '用户冻结设置' },
                { id: 'menu.freeze.log', label: '冻结操作记录' }
            ],
            actions: []
        },
        {
            id: 'leaderboard',
            label: '排行榜',
            menus: [
                { id: 'menu.leaderboard', label: '排行榜影子配置' }
            ],
            actions: []
        },
        {
            id: 'fee',
            label: '费率',
            menus: [
                { id: 'menu.fee.settings', label: '用户费率设置' },
                { id: 'menu.fee.approval', label: '费率审批' },
                { id: 'menu.fee.log', label: '费率操作记录' }
            ],
            actions: [
                { id: 'fee.approval.view', label: '查看费率审批', sensitive: false },
                { id: 'fee.approve.cross', label: '费率交叉审批', sensitive: true },
                { id: 'fee.approve.risk', label: '费率风控审核', sensitive: true },
                { id: 'fee.approve.boss', label: '费率老板审批', sensitive: true }
            ]
        },
        {
            id: 'points',
            label: '积分',
            menus: [
                { id: 'menu.points.overview', label: '积分发放总览' },
                { id: 'menu.points.config', label: '每周积分总池设置' },
                { id: 'menu.points.bonus', label: '积分加成配置' },
                { id: 'menu.points.users', label: '用户积分查询' },
                { id: 'menu.points.manual', label: '手动发放积分' },
                { id: 'menu.points.approval', label: '积分审核' },
                { id: 'menu.points.logs', label: '操作记录' }
            ],
            actions: [
                { id: 'points.manual.submit', label: '提交手动发放积分', sensitive: true },
                { id: 'points.approval.view', label: '查看积分审批', sensitive: false },
                { id: 'points.approve.cross', label: '积分交叉审批', sensitive: true },
                { id: 'points.approve.risk', label: '积分风控审核', sensitive: true },
                { id: 'points.approve.boss', label: '积分老板审批', sensitive: true }
            ]
        }
    ];

    function flattenPerms() {
        const all = [];
        GROUPS.forEach(function (g) {
            g.menus.forEach(function (m) { all.push(m); });
            g.actions.forEach(function (a) { all.push(a); });
        });
        return all;
    }

    function getAllPermIds() {
        return flattenPerms().map(function (p) { return p.id; });
    }

    function getSensitiveActions() {
        const list = [];
        GROUPS.forEach(function (g) {
            g.actions.forEach(function (a) {
                if (a.sensitive) {
                    list.push({
                        id: a.id,
                        label: a.label,
                        sensitive: a.sensitive,
                        groupLabel: g.label
                    });
                }
            });
        });
        return list;
    }

    window.ADMIN_PERM_GROUPS = GROUPS;
    window.getAllAdminPermIds = getAllPermIds;
    window.getAdminSensitiveActions = getSensitiveActions;
})();
