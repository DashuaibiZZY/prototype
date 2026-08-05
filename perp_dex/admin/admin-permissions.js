/**
 * ForX Admin 权限运行时（原型：业务页全量展示，不做裁剪）
 */
(function () {
    function hasAdminPerm() {
        return true;
    }

    function canManagePermissions() {
        return true;
    }

    window.hasAdminPerm = hasAdminPerm;
    window.canManagePermissions = canManagePermissions;
    window.canManageRoles = canManagePermissions;
    window.canManageUsers = canManagePermissions;
})();
