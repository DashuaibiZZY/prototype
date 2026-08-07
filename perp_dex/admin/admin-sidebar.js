/**
 * ForX Admin 统一侧栏导航
 */
(function () {
    const MODULES = [
        {
            title: '系统',
            items: [
                { key: 'sys-admin', label: '权限与用户', href: '权限配置后台.html#staff' }
            ]
        },
        {
            title: '合伙人中心',
            items: [
                { key: 'agent-mgmt', label: '一级合伙人管理', href: '代理中心后台.html#agent' },
                { key: 'agent-settlement', label: '佣金对账与发放', href: '代理中心后台.html#settlement' }
            ]
        },
        {
            title: '体验金',
            items: [
                { key: 'trial-config', label: '卡组配置', href: '体验金后台.html#config' },
                { key: 'trial-issue', label: '批量发放', href: '体验金后台.html#issue' },
                { key: 'trial-approval', label: '发放审批', href: '体验金后台.html#approval' },
                { key: 'trial-users', label: '数据查询&回收', href: '体验金后台.html#users' },
                { key: 'trial-logs', label: '操作记录', href: '体验金后台.html#logs' }
            ]
        },
        {
            title: '风控冻结',
            items: [
                { key: 'freeze-settings', label: '用户冻结设置', href: '用户冻结设置.html' },
                { key: 'freeze-log', label: '冻结操作记录', href: '冻结操作记录.html' }
            ]
        },
        {
            title: '排行榜',
            items: [
                { key: 'leaderboard', label: '排行榜影子配置', href: '排行榜后台.html' }
            ]
        },
        {
            title: '费率',
            items: [
                { key: 'fee-settings', label: '用户费率设置', href: '用户费率设置.html' },
                { key: 'fee-approval', label: '费率审批', href: '用户费率设置.html#approval' },
                { key: 'fee-log', label: '费率操作记录', href: '费率操作记录.html' }
            ]
        },
        {
            title: '积分',
            items: [
                { key: 'points-overview', label: '积分发放总览', href: '积分后台.html#overview' },
                { key: 'points-config', label: '每周积分总池设置', href: '积分后台.html#config' },
                { key: 'points-bonus', label: '积分加成配置', href: '积分后台.html#bonus' },
                { key: 'points-users', label: '用户积分查询', href: '积分后台.html#users' },
                { key: 'points-manual', label: '手动发放积分', href: '积分后台.html#manual' },
                { key: 'points-approval', label: '积分审核', href: '积分后台.html#approval' },
                { key: 'points-logs', label: '操作记录', href: '积分后台.html#logs' }
            ]
        }
    ];

    let lastSidebarKey = '';
    let lastSidebarFooter = '';

    function renderSidebar(activeKey, footerText) {
        if (activeKey) lastSidebarKey = activeKey;
        if (footerText !== undefined) lastSidebarFooter = footerText;
        const key = lastSidebarKey;
        const foot = lastSidebarFooter;
        const aside = document.getElementById('admin-sidebar');
        if (!aside) return;

        let html = '<div class="p-6 shrink-0"><span class="text-white font-black text-2xl tracking-tighter italic uppercase">ForX Admin</span></div>';
        html += '<nav class="flex-1 overflow-y-auto px-3 pb-4 space-y-4">';

        MODULES.forEach(function (mod) {
            html += '<div><div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">' + mod.title + '</div><div class="space-y-0.5">';
            mod.items.forEach(function (item) {
                const isActive = item.key === key;
                const cls = isActive
                    ? 'sidebar-item-active flex items-center px-3 py-2.5 text-[12px] font-medium rounded-lg transition-colors'
                    : 'flex items-center px-3 py-2.5 text-[12px] font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors';
                html += '<a href="' + item.href + '" class="' + cls + '">' + item.label + '</a>';
            });
            html += '</div></div>';
        });

        html += '</nav>';
        if (foot) {
            html += '<div class="p-4 border-t border-slate-800 text-slate-500 text-[11px] shrink-0">' + foot + '</div>';
        }
        aside.innerHTML = html;
    }

    function initHashRouter(routeMap, defaultHash, activeKeyMap) {
        function apply() {
            const hash = (location.hash || '').replace('#', '') || defaultHash;
            if (routeMap[hash]) routeMap[hash]();
            if (activeKeyMap && activeKeyMap[hash]) {
                renderSidebar(activeKeyMap[hash]);
            }
        }
        window.addEventListener('hashchange', apply);
        apply();
        return apply;
    }

    window.initAdminSidebar = renderSidebar;
    window.initAdminHashRouter = initHashRouter;
})();
