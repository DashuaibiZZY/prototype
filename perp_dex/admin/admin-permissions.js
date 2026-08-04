/**
 * ForX Admin 权限运行时（原型：全量展示 UI，不做菜单/动作隐藏）
 * 权限矩阵的增删改仅在「权限配置后台」页演示；业务页与文档说明真实登录态行为。
 */
(function () {
    function permMatches(granted, required) {
        if (granted === '*') return true;
        if (granted === required) return true;
        if (granted.endsWith('.*')) {
            const prefix = granted.slice(0, -1);
            return required.indexOf(prefix) === 0;
        }
        return false;
    }

    /** 原型：业务页一律视为拥有权限 */
    function hasAdminPerm() {
        return true;
    }

    function canManageRoles() {
        return true;
    }

    function canManageUsers() {
        return true;
    }

    window.hasAdminPerm = hasAdminPerm;
    window.canManageRoles = canManageRoles;
    window.canManageUsers = canManageUsers;
})();
