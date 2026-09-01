/**
 * 权限配置持久化 v3.5
 */
(function () {
    const STORE_KEY = 'forx_admin_permission_store_v3_5';
    const LEGACY_KEYS = [
        'forx_admin_permission_store_v3_4',
        'forx_admin_permission_store_v3_3',
        'forx_admin_permission_store_v3_2',
        'forx_admin_permission_store_v3_1'
    ];
    const SCHEMA = 5;
    const REMOVED_GROUP_IDS = ['trial.approve.cross', 'points.approve.cross', 'fee.approve.cross'];

    function registryVersion() {
        return window.ADMIN_PERMISSION_REGISTRY_VERSION || '3.2-risk-boss';
    }

    function allPageIds() {
        return (window.ADMIN_PAGES || []).map(function (p) { return p.id; });
    }

    function allowedGroupIds() {
        return (window.ADMIN_SENSITIVE_GROUPS || []).map(function (g) { return g.id; });
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
                    'points.manual': 'write', 'points.config': 'write', 'points.bonus': 'write', 'points.approval': 'read', 'points.overview': 'read', 'points.logs': 'read', 'points.users': 'read',
                    'agent.mgmt': 'write', 'agent.applications': 'write', 'agent.migrate': 'write', 'agent.approval': 'read', 'agent.settlement': 'read', 'agent.logs': 'read'
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
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read', 'agent.approval': 'read'
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
                    'points.approval': 'read', 'points.logs': 'read',
                    'agent.approval': 'read', 'agent.logs': 'read'
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
                    'trial.approval': 'read', 'fee.approval': 'read', 'points.approval': 'read', 'agent.approval': 'read'
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
                    'agent.mgmt': 'write', 'agent.applications': 'read', 'agent.migrate': 'read', 'agent.approval': 'read', 'agent.settlement': 'write', 'agent.logs': 'read',
                    'fee.settings': 'read', 'fee.approval': 'read', 'fee.log': 'read'
                }),
                agentMaxRebate: 80,
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
                    'freeze.log': 'read', 'trial.logs': 'read', 'points.logs': 'read', 'fee.log': 'read', 'agent.logs': 'read'
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
            { id: 'agent.approve.risk', memberIds: ['u_risk'] },
            { id: 'agent.approve.boss', memberIds: ['u_ceo'] },
            { id: 'trial.approve.risk', memberIds: ['u_risk'] },
            { id: 'trial.approve.boss', memberIds: ['u_ceo'] },
            { id: 'trial.recycle', memberIds: ['u_risk'] },
            { id: 'points.approve.risk', memberIds: ['u_risk'] },
            { id: 'points.approve.boss', memberIds: ['u_ceo'] },
            { id: 'fee.approve.risk', memberIds: ['u_risk'] },
            { id: 'fee.approve.boss', memberIds: ['u_ceo'] }
        ];
    }

    function normalizeGroups(groups) {
        var allowed = allowedGroupIds();
        var byId = {};
        (groups || []).forEach(function (g) {
            if (!g || !g.id) return;
            if (REMOVED_GROUP_IDS.indexOf(g.id) !== -1) return;
            if (allowed.length && allowed.indexOf(g.id) === -1) return;
            byId[g.id] = { id: g.id, memberIds: (g.memberIds || []).slice() };
        });
        defaultGroups().forEach(function (dg) {
            if (!byId[dg.id]) byId[dg.id] = JSON.parse(JSON.stringify(dg));
        });
        return allowed.length
            ? allowed.map(function (id) { return byId[id] || { id: id, memberIds: [] }; })
            : Object.keys(byId).map(function (id) { return byId[id]; });
    }

    function normalizeUser(u) {
        if (!u || !u.id || !u.name || !u.account) return null;
        if (!u.operatorId) u.operatorId = 'admin-' + pad2(Math.floor(Math.random() * 89) + 10);
        if (!u.identity) u.identity = 'operator';
        if (!u.status) u.status = 'active';
        if (u.gaBound === undefined) u.gaBound = false;
        if (!u.pagePerms || typeof u.pagePerms !== 'object') u.pagePerms = pageMap({});
        allPageIds().forEach(function (id) {
            if (u.pagePerms[id] === undefined) u.pagePerms[id] = 'none';
        });
        if (isSuperAdmin(u)) u.pagePerms = fullWritePerms();
        if (isSuperAdmin(u)) u.agentDataScope = 'global';
        if (u.agentDataScope !== 'global' && u.agentDataScope !== 'personal') u.agentDataScope = null;
        delete u.protected;
        return u;
    }

    function groupsSignature(groups) {
        return JSON.stringify((groups || []).map(function (g) {
            return { id: g.id, memberIds: (g.memberIds || []).slice().sort() };
        }).sort(function (a, b) { return a.id.localeCompare(b.id); }));
    }

    function upgradeStore(data, persist) {
        var changed = false;
        var beforeGroups = groupsSignature(data.groups);
        data.schema = SCHEMA;
        data.groups = normalizeGroups(data.groups);
        if (groupsSignature(data.groups) !== beforeGroups) changed = true;
        data.users = (data.users || []).map(function (u) {
            var before = JSON.stringify(u.pagePerms || {});
            var nu = normalizeUser(u);
            if (!nu) return u;
            if (JSON.stringify(nu.pagePerms || {}) !== before) changed = true;
            return nu;
        });
        if (data.registryVersion !== registryVersion()) {
            data.registryVersion = registryVersion();
            changed = true;
        }
        if (!data.nextOperatorSeq) data.nextOperatorSeq = 10;
        if (changed && persist !== false) savePermissionStore(data);
        return data;
    }

    function getDefaultStore() {
        return upgradeStore({
            schema: SCHEMA,
            registryVersion: registryVersion(),
            users: defaultUsers(),
            groups: defaultGroups(),
            nextOperatorSeq: 10,
            updatedAt: new Date().toISOString()
        }, false);
    }

    function isValidStore(data) {
        if (!data || !Array.isArray(data.users) || data.users.length < 3) return false;
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
                if (legacy) return upgradeStore(legacy, true);
                savePermissionStore(def);
                return def;
            }
            var data = JSON.parse(raw);
            if (!isValidStore(data)) {
                savePermissionStore(def);
                return def;
            }
            return upgradeStore(data, true);
        } catch (e) {
            savePermissionStore(def);
            return def;
        }
    }

    function savePermissionStore(store) {
        store.schema = SCHEMA;
        store.registryVersion = registryVersion();
        store.updatedAt = new Date().toISOString();
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
        try {
            window.dispatchEvent(new CustomEvent('admin-perm-store-change'));
        } catch (err) {}
    }

    function resetPermissionStore() {
        localStorage.removeItem(STORE_KEY);
        LEGACY_KEYS.forEach(function (key) {
            try { localStorage.removeItem(key); } catch (e) {}
        });
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
        if (!g) {
            g = { id: groupId, memberIds: [] };
            store.groups.push(g);
        }
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
    window.syncPermissionStoreWithRegistry = function () {
        return upgradeStore(loadPermissionStore(), true);
    };
})();
