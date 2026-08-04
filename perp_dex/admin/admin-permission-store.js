/**
 * 权限配置持久化（原型 localStorage）
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store';

    function allIds() {
        return typeof getAllAdminPermIds === 'function' ? getAllAdminPermIds() : [];
    }

    function defaultRoles() {
        const all = allIds();
        const pick = function (ids) { return ids.filter(function (id) { return all.indexOf(id) !== -1; }); };
        return [
            {
                id: 'admin',
                name: '管理员',
                builtin: true,
                description: '权限与用户管理，一般为产品总监；拥有全部菜单与敏感操作',
                perms: ['*']
            },
            {
                id: 'ops',
                name: '运营',
                builtin: true,
                description: '日常运营配置与发放',
                perms: pick([
                    'menu.agent.mgmt', 'menu.agent.settlement', 'menu.leaderboard',
                    'menu.trial.config', 'menu.trial.issue', 'menu.trial.approval', 'menu.trial.users', 'menu.trial.logs',
                    'menu.points.overview', 'menu.points.manual', 'menu.points.approval', 'menu.points.logs',
                    'trial.issue.submit', 'trial.approval.view', 'points.manual.submit', 'points.approval.view'
                ])
            },
            {
                id: 'market',
                name: '市场',
                builtin: true,
                description: '市场活动与交叉审批',
                perms: pick([
                    'menu.trial.approval', 'menu.points.approval', 'menu.fee.approval',
                    'trial.approval.view', 'trial.approve.cross',
                    'points.approval.view', 'points.approve.cross',
                    'fee.approval.view', 'fee.approve.cross'
                ])
            },
            {
                id: 'test',
                name: '测试',
                builtin: true,
                description: '测试环境验证，只读为主',
                perms: pick([
                    'menu.trial.config', 'menu.trial.users', 'menu.trial.logs',
                    'menu.points.overview', 'menu.points.users', 'menu.points.logs',
                    'menu.leaderboard', 'trial.approval.view', 'points.approval.view', 'fee.approval.view'
                ])
            },
            {
                id: 'product',
                name: '产品',
                builtin: true,
                description: '产品配置与规则维护',
                perms: pick([
                    'menu.trial.config', 'menu.points.config', 'menu.points.bonus', 'menu.leaderboard',
                    'menu.fee.settings', 'menu.agent.operator', 'menu.points.overview'
                ])
            },
            {
                id: 'risk',
                name: '风控',
                builtin: true,
                description: '风控审核、回收与冻结',
                perms: pick([
                    'menu.freeze.settings', 'menu.freeze.log',
                    'menu.trial.users', 'menu.trial.logs', 'menu.trial.approval',
                    'menu.fee.settings', 'menu.fee.approval', 'menu.fee.log',
                    'menu.points.approval',
                    'trial.recycle', 'trial.approval.view', 'trial.approve.risk',
                    'fee.approval.view', 'fee.approve.risk',
                    'points.approval.view', 'points.approve.risk'
                ])
            },
            {
                id: 'security',
                name: '安全',
                builtin: true,
                description: '账户安全与冻结审计',
                perms: pick([
                    'menu.freeze.settings', 'menu.freeze.log', 'menu.trial.logs', 'menu.points.logs', 'menu.fee.log'
                ])
            },
            {
                id: 'finance',
                name: '财务',
                builtin: true,
                description: '佣金结算与费率',
                perms: pick([
                    'menu.agent.settlement', 'menu.fee.settings', 'menu.fee.approval', 'menu.fee.log',
                    'fee.approval.view', 'fee.approve.cross'
                ])
            },
            {
                id: 'ceo',
                name: 'CEO',
                builtin: true,
                description: '高层审批视角',
                perms: pick([
                    'menu.trial.approval', 'menu.points.approval', 'menu.fee.approval',
                    'trial.approval.view', 'trial.approve.boss',
                    'points.approval.view', 'points.approve.boss',
                    'fee.approval.view', 'fee.approve.boss'
                ])
            }
        ];
    }

    function defaultUsers() {
        return [
            { id: 'u_admin', name: '产品总监', account: 'product.director@forx.com', roleId: 'admin', status: 'active', lastLogin: '2026-07-20 09:00' },
            { id: 'u_ops', name: '运营小王', account: 'ops.wang@forx.com', roleId: 'ops', status: 'active', lastLogin: '2026-07-19 18:22' },
            { id: 'u_market', name: '市场小李', account: 'market.li@forx.com', roleId: 'market', status: 'active', lastLogin: '2026-07-20 08:15' },
            { id: 'u_risk', name: '风控老陈', account: 'risk.chen@forx.com', roleId: 'risk', status: 'active', lastLogin: '2026-07-20 10:05' }
        ];
    }

    function getDefaultStore() {
        return { roles: defaultRoles(), users: defaultUsers(), updatedAt: new Date().toISOString() };
    }

    function loadPermissionStore() {
        var def = getDefaultStore();
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return def;
            var data = JSON.parse(raw);
            if (!Array.isArray(data.roles) || data.roles.length === 0) return def;
            if (!Array.isArray(data.users)) data.users = def.users;
            def.roles.forEach(function (br) {
                if (!data.roles.some(function (r) { return r.id === br.id; })) {
                    data.roles.push(br);
                }
            });
            return data;
        } catch (e) {
            return def;
        }
    }

    function savePermissionStore(store) {
        store.updatedAt = new Date().toISOString();
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
        window.dispatchEvent(new CustomEvent('admin-perm-store-change'));
    }

    function getRoleById(store, roleId) {
        return (store.roles || []).find(function (r) { return r.id === roleId; });
    }

    function getRolePermissions(roleId) {
        const store = loadPermissionStore();
        const role = getRoleById(store, roleId);
        if (!role) return [];
        if (role.id === 'admin' || role.perms.indexOf('*') !== -1) return allIds();
        return role.perms || [];
    }

    function resetPermissionStore() {
        savePermissionStore(getDefaultStore());
    }

    window.loadPermissionStore = loadPermissionStore;
    window.savePermissionStore = savePermissionStore;
    window.getDefaultPermissionStore = getDefaultStore;
    window.resetPermissionStore = resetPermissionStore;
    window.getRolePermissions = getRolePermissions;
})();
