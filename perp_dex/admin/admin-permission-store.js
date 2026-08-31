/**
 * 权限配置持久化 v3.3
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store_v3_3';
    const LEGACY_KEYS = ['forx_admin_permission_store_v3_2', 'forx_admin_permission_store_v3_1'];
    const SCHEMA = 3;

    function allPageIds() {
        return (window.ADMIN_PAGES || []).map(function (p) { return p.id; });
    }

    function pad2(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function fullWritePerms() {
        var w = {};
        allPageIds().forEach(function (id) { w[id] = 'write'; });
        return w;
    }

    function pageMap(levels) {
        var m = {};
        allPageIds().forEach(function (id) {
            m[id] = (levels && levels[id]) || 'none';
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
                name: 'Torch Zhang',
                account: 'torch.zhang@forx.com',
                department: '产品部',
                identity: 'super_admin',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-20 09:00',
                pagePerms: fullWritePerms(),
                agentMaxRebate: 100,
                agentDataScope: 'global'
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
                    'agent.mgmt': 'write', 'agent.approval': 'read', 'agent.settlement': 'read'
                }),
                agentMaxRebate: 70,
                agentDataScope: 'personal'
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
            },
            {
                id: 'u_finance',
                operatorId: 'admin-06',
                name: '财务小周',
                account: 'finance.zhou@forx.com',
                department: '财务部',
                identity: 'operator',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-17 11:20',
                pagePerms: pageMap({
                    'agent.mgmt': 'write', 'agent.approval': 'read', 'agent.settlement': 'write', 'fee.settings': 'read', 'fee.approval': 'read', 'fee.log': 'read'
                }),
                agentDataScope: 'global'
            },
            {
                id: 'u_security',
                operatorId: 'admin-07',
                name: '安全专员',
                account: 'security@forx.com',
                department: '安全合规',
                identity: 'operator',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-16 15:00',
                pagePerms: pageMap({
                    'freeze.log': 'read', 'trial.logs': 'read', 'points.logs': 'read', 'fee.log': 'read'
                })
            },
            {
                id: 'u_test',
                operatorId: 'admin-08',
                name: '测试账号',
                account: 'qa.test@forx.com',
                department: 'QA',
                identity: 'operator',
                status: 'active',
                gaBound: true,
                lastLogin: '2026-07-15 10:00',
                pagePerms: pageMap({
                    'trial.config': 'read', 'trial.users': 'read', 'points.overview': 'read', 'leaderboard': 'read'
                })
            },
            {
                id: 'u_out',
                operatorId: 'admin-09',
                name: '已停用示例',
                account: 'disabled.demo@forx.com',
                department: '外包',
                identity: 'operator',
                status: 'inactive',
                gaBound: false,
                lastLogin: '—',
                pagePerms: pageMap({ 'trial.logs': 'read' })
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

    function normalizeUser(u) {
        if (!u || !u.id || !u.name || !u.account) return null;
        if (!u.operatorId) u.operatorId = 'admin-' + pad2(Math.floor(Math.random() * 89) + 10);
        if (!u.identity) u.identity = 'operator';
        if (!u.status) u.status = 'active';
        if (u.gaBound === undefined) u.gaBound = false;
        if (!u.pagePerms || typeof u.pagePerms !== 'object') u.pagePerms = pageMap({});
        if (isSuperAdmin(u)) u.pagePerms = fullWritePerms();
        if (isSuperAdmin(u)) u.agentDataScope = 'global';
        if (u.agentDataScope !== 'global' && u.agentDataScope !== 'personal') u.agentDataScope = null;
        delete u.protected;
        return u;
    }

    function getDefaultStore() {
        return {
            schema: SCHEMA,
            users: defaultUsers(),
            groups: defaultGroups(),
            nextOperatorSeq: 10,
            updatedAt: new Date().toISOString()
        };
    }

    function isValidStore(data) {
        if (!data || data.schema !== SCHEMA) return false;
        if (!Array.isArray(data.users) || data.users.length < 3) return false;
        if (!Array.isArray(data.groups) || data.groups.length < 4) return false;
        for (var i = 0; i < data.users.length; i++) {
            if (!normalizeUser(data.users[i])) return false;
        }
        return true;
    }

    function readLegacyStore() {
        for (var i = 0; i < LEGACY_KEYS.length; i++) {
            try {
                var raw = localStorage.getItem(LEGACY_KEYS[i]);
                if (!raw) continue;
                var data = JSON.parse(raw);
                if (data && Array.isArray(data.users) && data.users.length >= 3) return data;
            } catch (e) {}
        }
        return null;
    }

    function loadPermissionStore() {
        var def = getDefaultStore();
        try {
            if (!window.ADMIN_PAGES || !ADMIN_PAGES.length) return def;
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) {
                var legacy = readLegacyStore();
                if (legacy && isValidStore(Object.assign({}, legacy, { schema: SCHEMA }))) {
                    legacy.schema = SCHEMA;
                    savePermissionStore(legacy);
                    return legacy;
                }
                savePermissionStore(def);
                return def;
            }
            var data = JSON.parse(raw);
            if (!isValidStore(data)) {
                savePermissionStore(def);
                return def;
            }
            data.users = data.users.map(function (u) { return normalizeUser(u); });
            defaultGroups().forEach(function (dg) {
                if (!data.groups.some(function (g) { return g.id === dg.id; })) {
                    data.groups.push(JSON.parse(JSON.stringify(dg)));
                }
            });
            if (!data.nextOperatorSeq) data.nextOperatorSeq = def.nextOperatorSeq;
            return data;
        } catch (e) {
            savePermissionStore(def);
            return def;
        }
    }

    function savePermissionStore(store) {
        store.schema = SCHEMA;
        store.updatedAt = new Date().toISOString();
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
        try {
            window.dispatchEvent(new CustomEvent('admin-perm-store-change'));
        } catch (err) {}
    }

    function resetPermissionStore() {
        localStorage.removeItem(STORE_KEY);
        var def = getDefaultStore();
        savePermissionStore(def);
        return def;
    }

    function isSuperAdmin(user) {
        return user && user.identity === 'super_admin';
    }

    function userInGroup(store, userId, groupId) {
        var g = (store.groups || []).find(function (x) { return x.id === groupId; });
        return !!(g && (g.memberIds || []).indexOf(userId) !== -1);
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
        if (!u) return false;
        if (isSuperAdmin(u) && status === 'inactive') return false;
        u.status = status;
        if (status === 'inactive') removeUserFromAllGroups(store, userId);
        return true;
    }

    function allocOperatorId(store) {
        var seq = store.nextOperatorSeq || 10;
        store.nextOperatorSeq = seq + 1;
        return 'admin-' + pad2(seq);
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
