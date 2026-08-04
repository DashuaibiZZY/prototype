/**
 * ForX Admin 权限运行时 — 读取权限配置 Store，驱动侧栏与动作校验
 * 依赖：admin-permission-registry.js、admin-permission-store.js
 */
(function () {
    const ROLE_SESSION_KEY = 'forx_admin_demo_role';

    function permMatches(granted, required) {
        if (granted === '*') return true;
        if (granted === required) return true;
        if (granted.endsWith('.*')) {
            const prefix = granted.slice(0, -1);
            return required.indexOf(prefix) === 0;
        }
        return false;
    }

    function getAdminRole() {
        return sessionStorage.getItem(ROLE_SESSION_KEY) || 'admin';
    }

    function setAdminRole(roleId) {
        const store = loadPermissionStore();
        if (!store.roles.some(function (r) { return r.id === roleId; })) return;
        sessionStorage.setItem(ROLE_SESSION_KEY, roleId);
        syncApprovalViewFromPerms();
        window.dispatchEvent(new CustomEvent('admin-role-change', { detail: { role: roleId } }));
    }

    function getAdminRoles() {
        return loadPermissionStore().roles || [];
    }

    function getAdminRoleLabel() {
        const store = loadPermissionStore();
        const role = store.roles.find(function (r) { return r.id === getAdminRole(); });
        return role ? role.name : getAdminRole();
    }

    function getCurrentRolePerms() {
        return getRolePermissions(getAdminRole());
    }

    function hasAdminPerm(perm) {
        const list = getCurrentRolePerms();
        return list.some(function (g) { return permMatches(g, perm); });
    }

    function canManageRoles() {
        return hasAdminPerm('sys.role.manage');
    }

    function canManageUsers() {
        return hasAdminPerm('sys.user.manage');
    }

    function syncApprovalViewFromPerms() {
        if (typeof window.setApprovalViewRole !== 'function') return;
        if (hasAdminPerm('trial.approve.cross') || hasAdminPerm('points.approve.cross') || hasAdminPerm('fee.approve.cross')) {
            window.setApprovalViewRole('cross');
        } else if (hasAdminPerm('trial.approve.risk') || hasAdminPerm('points.approve.risk') || hasAdminPerm('fee.approve.risk')) {
            window.setApprovalViewRole('risk');
        } else if (hasAdminPerm('trial.approve.boss') || hasAdminPerm('points.approve.boss') || hasAdminPerm('fee.approve.boss')) {
            window.setApprovalViewRole('boss');
        }
    }

    function initAdminRoleSwitcher(container) {
        const el = container || document.getElementById('admin-header-tools');
        if (!el) return;
        const roleId = getAdminRole();
        const roles = getAdminRoles();
        let html = '<label class="text-[10px] text-slate-400 font-bold uppercase mr-1">原型角色</label>';
        html += '<select id="adminRoleSelect" class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white outline-none max-w-[140px]" onchange="setAdminRole(this.value)">';
        roles.forEach(function (r) {
            html += '<option value="' + r.id + '"' + (r.id === roleId ? ' selected' : '') + '>' + r.name + '</option>';
        });
        html += '</select>';
        el.innerHTML = html;
    }

    function refreshAdminRoleDisplay() {
        const nameEl = document.getElementById('admin-user-name');
        const avatarEl = document.getElementById('admin-user-avatar');
        const label = getAdminRoleLabel();
        if (nameEl) nameEl.textContent = label;
        if (avatarEl) avatarEl.textContent = label.slice(0, 2);
        const sel = document.getElementById('adminRoleSelect');
        if (sel && sel.value !== getAdminRole()) sel.value = getAdminRole();
    }

    window.getAdminRole = getAdminRole;
    window.setAdminRole = setAdminRole;
    window.hasAdminPerm = hasAdminPerm;
    window.getAdminRoleLabel = getAdminRoleLabel;
    window.getAdminRoles = getAdminRoles;
    window.canManageRoles = canManageRoles;
    window.canManageUsers = canManageUsers;
    window.initAdminRoleSwitcher = initAdminRoleSwitcher;
    window.syncApprovalViewFromPerms = syncApprovalViewFromPerms;

    window.addEventListener('admin-role-change', refreshAdminRoleDisplay);
    window.addEventListener('admin-perm-store-change', function () {
        initAdminRoleSwitcher();
        refreshAdminRoleDisplay();
        syncApprovalViewFromPerms();
        window.dispatchEvent(new CustomEvent('admin-role-change', { detail: { role: getAdminRole() } }));
    });

    syncApprovalViewFromPerms();
})();
