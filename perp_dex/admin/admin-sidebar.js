/**
 * ForX Admin 统一侧栏导航
 * 用法：页面放置 <aside id="admin-sidebar" class="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0"></aside>
 *       然后调用 initAdminSidebar(activeKey, footerText)
 */
(function () {
    const MODULES = [
        {
            title: '代理中心',
            items: [
                { key: 'agent-mgmt', label: '一级代理管理', href: '代理中心后台.html#agent' },
                { key: 'agent-operator', label: '运营权限配置', href: '代理中心后台.html#operator' },
                { key: 'agent-settlement', label: '佣金对账与发放', href: 'admin_rebate_approval.html' },
                { key: 'agent-portal', label: '代理伙伴门户', href: 'admin_partner_portal.html#agent' }
            ]
        },
        {
            title: '体验金',
            items: [
                { key: 'trial-config', label: '卡组配置', href: '体验金后台.html#config' },
                { key: 'trial-issue', label: '批量发放', href: '体验金后台.html#issue' },
                { key: 'trial-risk', label: '风控回收', href: '体验金后台.html#risk' }
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
                { key: 'fee-log', label: '费率操作记录', href: '费率操作记录.html' }
            ]
        },
        {
            title: '积分',
            items: [
                { key: 'points-config', label: '积分规则配置', href: '积分后台.html#config' },
                { key: 'points-issue', label: '积分发放', href: '积分后台.html#issue' },
                { key: 'points-adjust', label: '积分调整', href: '积分后台.html#adjust' }
            ]
        }
    ];

    function renderSidebar(activeKey, footerText) {
        const aside = document.getElementById('admin-sidebar');
        if (!aside) return;

        let html = '<div class="p-6 shrink-0"><span class="text-white font-black text-2xl tracking-tighter italic uppercase">ForX Admin</span></div>';
        html += '<nav class="flex-1 overflow-y-auto px-3 pb-4 space-y-4">';

        MODULES.forEach(function (mod) {
            html += '<div><div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">' + mod.title + '</div><div class="space-y-0.5">';
            mod.items.forEach(function (item) {
                const isActive = item.key === activeKey;
                const cls = isActive
                    ? 'sidebar-item-active flex items-center px-3 py-2.5 text-[12px] font-medium rounded-lg transition-colors'
                    : 'flex items-center px-3 py-2.5 text-[12px] font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors';
                html += '<a href="' + item.href + '" class="' + cls + '">' + item.label + '</a>';
            });
            html += '</div></div>';
        });

        html += '</nav>';
        if (footerText) {
            html += '<div class="p-4 border-t border-slate-800 text-slate-500 text-[11px] shrink-0">' + footerText + '</div>';
        }
        aside.innerHTML = html;
    }

    /** 多 Tab 页面 hash 路由：{ config: fn, issue: fn } */
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
