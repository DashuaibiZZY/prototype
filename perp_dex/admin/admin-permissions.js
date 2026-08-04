/**
 * ForX Admin 权限原型层（RBAC + 细粒度动作权限）
 * 生产环境由登录态 / IAM 下发权限列表；原型用 sessionStorage 模拟角色切换。
 */
(function () {
    const STORAGE_KEY = 'forx_admin_demo_role';

    /** 角色 → 权限码（支持 menu.* / 模块动作 / 审批动作） */
    const ROLE_PERMISSIONS = {
        super_admin: ['*'],
        trial_admin: [
            'menu.agent.mgmt', 'menu.agent.settlement',
            'menu.trial.config', 'menu.trial.issue', 'menu.trial.approval', 'menu.trial.users', 'menu.trial.logs',
            'trial.issue.submit', 'trial.approval.view'
        ],
        risk: [
            'menu.freeze.settings', 'menu.freeze.log',
            'menu.trial.users', 'menu.trial.logs', 'menu.trial.approval',
            'menu.fee.settings', 'menu.fee.approval', 'menu.fee.log',
            'trial.recycle', 'trial.approval.view', 'trial.approve.risk',
            'fee.approve.risk', 'points.approve.risk'
        ],
        market_cross: [
            'menu.trial.approval', 'menu.points.approval', 'menu.fee.approval',
            'trial.approval.view', 'trial.approve.cross',
            'points.approval.view', 'points.approve.cross',
            'fee.approval.view', 'fee.approve.cross'
        ],
        boss: [
            'menu.trial.approval', 'menu.points.approval', 'menu.fee.approval',
            'trial.approval.view', 'trial.approve.boss',
            'points.approval.view', 'points.approve.boss',
            'fee.approval.view', 'fee.approve.boss'
        ],
        points_admin: [
            'menu.points.overview', 'menu.points.config', 'menu.points.bonus',
            'menu.points.users', 'menu.points.manual', 'menu.points.approval', 'menu.points.logs',
            'points.manual.submit', 'points.approval.view'
        ]
    };

    const ROLE_LABELS = {
        super_admin: '超级管理员',
        trial_admin: '体验金管理员',
        risk: '风控',
        market_cross: '市场运营交叉',
        boss: '老板',
        points_admin: '积分管理员'
    };

    function getAdminRole() {
        return sessionStorage.getItem(STORAGE_KEY) || 'trial_admin';
    }

    function setAdminRole(role) {
        if (!ROLE_PERMISSIONS[role]) return;
        sessionStorage.setItem(STORAGE_KEY, role);
        window.dispatchEvent(new CustomEvent('admin-role-change', { detail: { role: role } }));
    }

    function permMatches(granted, required) {
        if (granted === '*') return true;
        if (granted === required) return true;
        if (granted.endsWith('.*')) {
            const prefix = granted.slice(0, -1);
            return required.indexOf(prefix) === 0;
        }
        return false;
    }

    function hasAdminPerm(perm) {
        const role = getAdminRole();
        const list = ROLE_PERMISSIONS[role] || [];
        return list.some(function (g) { return permMatches(g, perm); });
    }

    function getAdminRoleLabel() {
        return ROLE_LABELS[getAdminRole()] || getAdminRole();
    }

    function initAdminRoleSwitcher(container) {
        const el = container || document.getElementById('admin-header-tools');
        if (!el) return;
        const role = getAdminRole();
        let html = '<label class="text-[10px] text-slate-400 font-bold uppercase mr-1">原型角色</label>';
        html += '<select id="adminRoleSelect" class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white outline-none" onchange="setAdminRole(this.value)">';
        Object.keys(ROLE_PERMISSIONS).forEach(function (key) {
            html += '<option value="' + key + '"' + (key === role ? ' selected' : '') + '>' + ROLE_LABELS[key] + '</option>';
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
    window.initAdminRoleSwitcher = initAdminRoleSwitcher;
    window.ADMIN_ROLE_LABELS = ROLE_LABELS;

    window.addEventListener('admin-role-change', refreshAdminRoleDisplay);
})();
