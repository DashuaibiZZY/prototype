/**
 * 权限配置持久化 v3（原型 localStorage）
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store_v3';

    function allPageIds() {
        return (window.ADMIN_PAGES || []).map(function (p) { return p.id; });
    }

    function allWritePageIds() {
        return allPageIds();
    }

    function pageMap(levels) {
        var m = {};
        allPageIds().forEach(function (id) {
            m[id] = levels[id] || 'none';
        });
        return m;
    }

    function defaultUsers() {
        var w = {};
        allWritePageIds().forEach(function (id) { w[id] = 'write'; });
        var r = {};
        ['trial.approval', 'fee.approval', 'points.approval', 'points.overview', 'points.users', 'trial.logs', 'fee.log', 'points.logs', 'freeze.log'].forEach(function (id) {
            r[id] = 'read';
        });

        return [
            {
                id: 'u_admin',
                name: '产品总监',
                account: 'product.director@forx.com',
                department: '产品部',
                status: 'active',
                lastLogin: '2026-07-20 09:00',
                pagePerms: w,
                agentMaxRebate: 100,
                protected: true
            },
            {
                id: 'u_ops',
                name: '运营小王',
                account: 'ops.wang@forx.com',
                department: '运营部',
                status: 'active',
                lastLogin: '2026-07-19 18:22',
                pagePerms: pageMap(Object.assign({}, r, {
                    'agent.mgmt': 'write', 'agent.settlement': 'write',
                    'trial.config': 'write', 'trial.issue': 'write', 'trial.users': 'read',
                    'leaderboard': 'write',
                    'fee.settings': 'write',
                    'points.manual': 'write', 'points.config': 'write', 'points.bonus': 'write'
                })),
                agentMaxRebate: 70
            },
            {
                id: 'u_market',
                name: '市场小李',
                account: 'market.li@forx.com',
                department: '市场部',
                status: 'active',
                lastLogin: '2026-07-20 08:15',
                pagePerms: pageMap(Object.assign({}, r, {
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read'
                }))
            },
            {
                id: 'u_risk',
                name: '风控老陈',
                account: 'risk.chen@forx.com',
                department: '风控部',
                status: 'active',
                lastLogin: '2026-07-20 10:05',
                pagePerms: pageMap(Object.assign({}, r, {
                    'freeze.settings': 'write',
                    'trial.users': 'read', 'trial.approval': 'read',
                    'fee.settings': 'read', 'fee.approval': 'read',
                    'points.approval': 'read'
                }))
            },
            {
                id: 'u_ceo',
                name: '老板',
                account: 'ceo@forx.com',
                department: '管理层',
                status: 'active',
                lastLogin: '2026-07-18 14:00',
                pagePerms: pageMap(Object.assign({}, r, {
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read'
                }))
            }
        ];
    }

    function defaultGroups() {
        return [
            { id: 'approve.cross', memberIds: ['u_market'] },
            { id: 'approve.risk', memberIds: ['u_risk'] },
            { id: 'approve.boss', memberIds: ['u_ceo'] },
            { id: 'trial.recycle', memberIds: ['u_risk'] }
        ];
    }

    function getDefaultStore() {
        return {
            users: defaultUsers(),
            groups: defaultGroups(),
            updatedAt: new Date().toISOString()
        };
    }

    function loadPermissionStore() {
        var def = getDefaultStore();
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return def;
            var data = JSON.parse(raw);
            if (!Array.isArray(data.users) || !data.users.length) return def;
            if (!Array.isArray(data.groups)) data.groups = def.groups;
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

    function resetPermissionStore() {
        savePermissionStore(getDefaultStore());
    }

    function getUserById(store, userId) {
        return (store.users || []).find(function (u) { return u.id === userId; });
    }

    function getGroupById(store, groupId) {
        return (store.groups || []).find(function (g) { return g.id === groupId; });
    }

    window.loadPermissionStore = loadPermissionStore;
    window.savePermissionStore = savePermissionStore;
    window.getDefaultPermissionStore = getDefaultStore;
    window.resetPermissionStore = resetPermissionStore;
    window.getUserById = getUserById;
    window.getGroupById = getGroupById;
})();
