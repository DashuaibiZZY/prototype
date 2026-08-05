/**
 * 权限配置持久化 v3.2
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store_v3_2';

    function allPageIds() {
        return (window.ADMIN_PAGES || []).map(function (p) { return p.id; });
    }

    function fullWritePerms() {
        var w = {};
        allPageIds().forEach(function (id) { w[id] = 'write'; });
        return w;
    }

    function pageMap(levels) {
        var m = {};
        allPageIds().forEach(function (id) {
            m[id] = levels[id] || 'none';
        });
        return m;
    }

    function permToChecks(level) {
        if (level === 'write') return { read: true, write: true };
        if (level === 'read') return { read: true, write: false };
        return { read: false, write: false };
    }

    function checksToPerm(read, write) {
        if (write) return 'write';
        if (read) return 'read';
        return 'none';
    }

    function defaultUsers() {
        return [
            {
                id: 'u_admin',
                operatorId: 'admin-01',
                name: '产品总监',
                account: 'product.director@forx.com',
                department: '产品部',
                identity: 'super_admin',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-20 09:00',
                pagePerms: fullWritePerms(),
                agentMaxRebate: 100
            },
            {
                id: 'u_ops',
                operatorId: 'admin-02',
                name: '运营小王',
                account: 'ops.wang@forx.com',
                department: '运营部',
                identity: 'operator',
                status: 'active',
                gaBound: true,
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
                operatorId: 'admin-03',
                name: '市场小李',
                account: 'market.li@forx.com',
                department: '市场部',
                identity: 'operator',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-20 08:15',
                pagePerms: pageMap({
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read'
                })
            },
            {
                id: 'u_risk',
                operatorId: 'admin-04',
                name: '风控老陈',
                account: 'risk.chen@forx.com',
                department: '风控部',
                identity: 'operator',
                status: 'active',
                gaBound: true,
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
                operatorId: 'admin-05',
                name: '老板',
                account: 'ceo@forx.com',
                department: '管理层',
                identity: 'operator',
                status: 'active',
                gaBound: false,
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
        defaultGroups().forEach(function (dg) {
            if (!data.groups.some(function (g) { return g.id === dg.id; })) {
                data.groups.push(JSON.parse(JSON.stringify(dg)));
            }
        });
        return data;
    }

    function migrateUser(u) {
        if (!u.operatorId) u.operatorId = 'admin-' + String(Math.floor(Math.random() * 900) + 100);
        if (!u.identity) u.identity = u.protected ? 'super_admin' : 'operator';
        if (u.gaBound === undefined) u.gaBound = false;
        delete u.protected;
        return u;
    }

    function getDefaultStore() {
        return { users: defaultUsers(), groups: defaultGroups(), nextOperatorSeq: 6, updatedAt: new Date().toISOString() };
    }

    function loadPermissionStore() {
        var def = getDefaultStore();
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return def;
            var data = JSON.parse(raw);
            if (!Array.isArray(data.users) || !data.users.length) return def;
            if (!Array.isArray(data.groups)) data.groups = def.groups;
            if (!data.nextOperatorSeq) data.nextOperatorSeq = def.nextOperatorSeq;
            mergeGroups(data);
            data.users = data.users.map(migrateUser);
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

    function isSuperAdmin(user) {
        return user && user.identity === 'super_admin';
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

    function removeUserFromAllGroups(store, userId) {
        (store.groups || []).forEach(function (g) {
            g.memberIds = (g.memberIds || []).filter(function (id) { return id !== userId; });
        });
    }

    function setUserStatus(store, userId, status) {
        var u = store.users.find(function (x) { return x.id === userId; });
        if (!u) return;
        if (isSuperAdmin(u) && status === 'inactive') return false;
        u.status = status;
        if (status === 'inactive') removeUserFromAllGroups(store, userId);
        return true;
    }

    function allocOperatorId(store) {
        var seq = store.nextOperatorSeq || 1;
        store.nextOperatorSeq = seq + 1;
        return 'admin-' + String(seq).padStart(2, '0');
    }

    function generatePassword() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
        var pwd = '';
        for (var i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        return pwd;
    }

    window.loadPermissionStore = loadPermissionStore;
    window.savePermissionStore = savePermissionStore;
    window.getDefaultPermissionStore = getDefaultStore;
    window.resetPermissionStore = resetPermissionStore;
    window.userInGroup = userInGroup;
    window.setUserInGroup = setUserInGroup;
    window.setUserStatus = setUserStatus;
    window.isSuperAdmin = isSuperAdmin;
    window.permToChecks = permToChecks;
    window.checksToPerm = checksToPerm;
    window.allocOperatorId = allocOperatorId;
    window.generatePassword = generatePassword;
    window.removeUserFromAllGroups = removeUserFromAllGroups;
})();
