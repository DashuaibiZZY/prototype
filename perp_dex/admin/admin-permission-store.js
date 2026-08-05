/**
 * 权限配置持久化 v3.1
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store_v3_1';

    function allPageIds() {
        return (window.ADMIN_PAGES || []).map(function (p) { return p.id; });
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
        allPageIds().forEach(function (id) { w[id] = 'write'; });

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
                pagePerms: pageMap({
                    'trial.config': 'write', 'trial.issue': 'write', 'trial.users': 'read', 'trial.approval': 'read', 'trial.logs': 'read',
                    'leaderboard': 'write',
                    'fee.settings': 'write', 'fee.approval': 'read', 'fee.log': 'read',
                    'points.manual': 'write', 'points.config': 'write', 'points.bonus': 'write', 'points.approval': 'read', 'points.overview': 'read', 'points.logs': 'read',
                    'agent.mgmt': 'write', 'agent.settlement': 'read'
                }),
                agentMaxRebate: 70
            },
            {
                id: 'u_market',
                name: '市场小李',
                account: 'market.li@forx.com',
                department: '市场部',
                status: 'active',
                lastLogin: '2026-07-20 08:15',
                pagePerms: pageMap({
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read'
                })
            },
            {
                id: 'u_risk',
                name: '风控老陈',
                account: 'risk.chen@forx.com',
                department: '风控部',
                status: 'active',
                lastLogin: '2026-07-20 10:05',
                pagePerms: pageMap({
                    'freeze.settings': 'write', 'freeze.log': 'read',
                    'trial.users': 'read', 'trial.approval': 'read', 'trial.logs': 'read',
                    'fee.settings': 'read', 'fee.approval': 'read', 'fee.log': 'read',
                    'points.approval': 'read', 'points.logs': 'read'
                })
            },
            {
                id: 'u_ceo',
                name: '老板',
                account: 'ceo@forx.com',
                department: '管理层',
                status: 'active',
                lastLogin: '2026-07-18 14:00',
                pagePerms: pageMap({
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read'
                })
            }
        ];
    }

    function defaultGroups() {
        return [
            { id: 'trial.approve.cross', memberIds: ['u_market'] },
            { id: 'trial.approve.risk', memberIds: ['u_risk'] },
            { id: 'trial.approve.boss', memberIds: ['u_ceo'] },
            { id: 'trial.recycle', memberIds: ['u_risk'] },
            { id: 'points.approve.cross', memberIds: ['u_market'] },
            { id: 'points.approve.risk', memberIds: ['u_risk'] },
            { id: 'points.approve.boss', memberIds: ['u_ceo'] },
            { id: 'fee.approve.cross', memberIds: ['u_market'] },
            { id: 'fee.approve.risk', memberIds: ['u_risk'] },
            { id: 'fee.approve.boss', memberIds: ['u_ceo'] }
        ];
    }

    function mergeGroups(data) {
        var def = defaultGroups();
        def.forEach(function (dg) {
            if (!data.groups.some(function (g) { return g.id === dg.id; })) {
                data.groups.push(dg);
            }
        });
        return data;
    }

    function getDefaultStore() {
        return { users: defaultUsers(), groups: defaultGroups(), updatedAt: new Date().toISOString() };
    }

    function loadPermissionStore() {
        var def = getDefaultStore();
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return def;
            var data = JSON.parse(raw);
            if (!Array.isArray(data.users) || !data.users.length) return def;
            if (!Array.isArray(data.groups)) data.groups = def.groups;
            mergeGroups(data);
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

    function userInGroup(store, userId, groupId) {
        var g = (store.groups || []).find(function (x) { return x.id === groupId; });
        return g && (g.memberIds || []).indexOf(userId) !== -1;
    }

    function setUserInGroup(store, userId, groupId, join) {
        var g = store.groups.find(function (x) { return x.id === groupId; });
        if (!g) return;
        if (!g.memberIds) g.memberIds = [];
        var i = g.memberIds.indexOf(userId);
        if (join && i === -1) g.memberIds.push(userId);
        if (!join && i !== -1) g.memberIds.splice(i, 1);
    }

    window.loadPermissionStore = loadPermissionStore;
    window.savePermissionStore = savePermissionStore;
    window.getDefaultPermissionStore = getDefaultStore;
    window.resetPermissionStore = resetPermissionStore;
    window.userInGroup = userInGroup;
    window.setUserInGroup = setUserInGroup;
})();
