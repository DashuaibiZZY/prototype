/**
 * 各业务模块内嵌审批列表 + 详情子页
 */
(function () {
    const instances = {};

    function statusPillClass(status) {
        return 'status-pill status-' + status;
    }

    function renderPayloadMeta(app) {
        const p = app.payload || {};
        const rows = [];
        rows.push(['活动信息', formatApprovalActivity(p)]);
        if (app.type === 'trial_issue') {
            rows.push(['关联卡组', p.cardGroup], ['录入方式', p.inputMode === 'excel' ? 'Excel 导入' : '手动录入'], ['发放人数', p.recipientCount], ['发放总额', p.totalAmount]);
        } else if (app.type === 'points_manual') {
            rows.push(['录入方式', p.inputMode === 'file' ? '文件上传' : '多行录入'], ['发放人数', p.recipientCount], ['发放总积分', p.totalPoints]);
        } else if (app.type === 'fee_config') {
            rows.push(['UID', p.uid], ['钱包', p.wallet], ['费率模式', p.feeMode === 'vip' ? 'VIP 等级' : '自定义'], ['VIP 等级', p.vipLevel != null ? 'VIP ' + p.vipLevel : '—'], ['Taker', p.taker], ['Maker', p.maker], ['有效期', p.validDays ? p.validDays + ' 天（到期日 24:00 失效）' : '永久有效'], ['附件', (p.attachments || []).join('、') || '—']);
        }
        return rows.map(function (r) {
            return '<div class="p-3 bg-slate-50 rounded-lg"><p class="text-[10px] text-slate-400 font-bold">' + r[0] + '</p><p class="font-bold text-slate-800 mt-1 break-all">' + (r[1] || '—') + '</p></div>';
        }).join('');
    }

    function renderRecipients(app) {
        const p = app.payload || {};
        if ((app.type !== 'trial_issue' && app.type !== 'points_manual') || !p.recipients || !p.recipients.length) return '';
        const isTrial = app.type === 'trial_issue';
        const show = p.recipients.slice(0, 100);
        let html = '<div class="mt-4"><p class="text-[10px] font-bold text-slate-500 uppercase mb-2">' + (isTrial ? '体验金发放名单' : '积分发放名单') + '</p>';
        html += '<div class="border border-slate-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto"><table class="w-full text-sm"><thead class="bg-slate-50 border-b sticky top-0"><tr>';
        html += isTrial
            ? '<th class="px-4 py-2 text-xs font-bold text-slate-500">uid_or_wallet</th><th class="px-4 py-2 text-xs font-bold text-slate-500 text-right">amount</th>'
            : '<th class="px-4 py-2 text-xs font-bold text-slate-500">uid_or_wallet</th><th class="px-4 py-2 text-xs font-bold text-slate-500 text-right">points</th>';
        html += '</tr></thead><tbody class="divide-y divide-slate-50">';
        show.forEach(function (r) {
            html += '<tr><td class="px-4 py-2 font-mono text-[11px]">' + r.uid_or_wallet + '</td><td class="px-4 py-2 text-right font-bold">' + (isTrial ? r.amount : r.points) + '</td></tr>';
        });
        html += '</tbody></table></div>';
        if (p.recipients.length > 100) html += '<p class="text-[10px] text-slate-400 mt-2">共 ' + p.recipients.length + ' 条，展示前 100 条，完整名单请导出 CSV</p>';
        html += '</div>';
        return html;
    }

    function renderTimeline(app) {
        return (app.timeline || []).map(function (t) {
            return '<div class="border-l-2 border-slate-200 pl-4 pb-4 ml-1"><p class="font-bold text-slate-800">' + t.action + ' <span class="text-slate-400 font-normal">· ' + t.actor + '</span></p><p class="text-[10px] text-slate-400">' + t.at + '</p>' + (t.note ? '<p class="text-xs text-slate-600 mt-1">' + t.note + '</p>' : '') + '</div>';
        }).join('');
    }

    window.initModuleApproval = function (options) {
        options = options || {};
        const type = options.type;
        const rootId = options.rootId || 'module-approval-root';
        const title = options.title || '审批管理';
        const root = document.getElementById(rootId);
        if (!root || !type) return;

        const state = { type: type, view: 'list', detailId: null, listMode: 'pending' };
        instances[rootId] = state;

        root.innerHTML =
            '<div id="' + rootId + '-list" class="space-y-6">' +
            '<div class="flex flex-wrap justify-between items-start gap-4">' +
            '<div><h2 class="text-lg font-bold text-slate-700">' + title + '</h2><p class="text-sm text-slate-400 mt-1">本模块审批在此处理，支持查看原数据、导出 CSV 及 Lark 老板审批联动</p></div>' +
            '<div class="flex flex-wrap gap-2 items-center">' +
            '<button type="button" class="role-tab active" data-root="' + rootId + '" data-role="cross" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'cross\')">市场运营交叉</button>' +
            '<button type="button" class="role-tab" data-root="' + rootId + '" data-role="risk" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'risk\')">风控</button>' +
            '<button type="button" class="role-tab" data-root="' + rootId + '" data-role="boss" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'boss\')">老板</button>' +
            '</div></div>' +
            '<section class="card p-5"><div class="grid grid-cols-4 gap-4 items-end">' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">视图</label><select id="' + rootId + '-view-mode" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" onchange="moduleApprovalRenderList(\'' + rootId + '\')"><option value="pending">待我审批</option><option value="all">全部审批</option></select></div>' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">状态</label><select id="' + rootId + '-filter-status" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" onchange="moduleApprovalRenderList(\'' + rootId + '\')"><option value="all">全部</option><option value="pending_cross">待交叉审核</option><option value="pending_risk">待风控</option><option value="pending_boss">待老板</option><option value="approved">已通过</option><option value="rejected">已驳回</option></select></div>' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">审批单号</label><input id="' + rootId + '-filter-id" type="text" placeholder="APR..." class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" oninput="moduleApprovalRenderList(\'' + rootId + '\')"></div>' +
            '<div class="flex gap-2"><button type="button" onclick="moduleApprovalRenderList(\'' + rootId + '\')" class="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold">查询</button><button type="button" onclick="moduleApprovalExportList(\'' + rootId + '\')" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600">导出 CSV</button></div>' +
            '</div></section>' +
            '<div class="card overflow-hidden"><div class="px-6 py-4 border-b flex justify-between"><span class="text-sm font-bold text-slate-700">审批列表 <span id="' + rootId + '-count" class="text-slate-400"></span></span><span id="' + rootId + '-hint" class="text-[10px] text-amber-600 font-bold"></span></div>' +
            '<table class="w-full text-left text-sm"><thead class="bg-slate-50 border-b"><tr>' +
            '<th class="px-4 py-3 text-xs font-bold text-slate-500">审批单号</th><th class="px-3 py-3 text-xs font-bold text-slate-500">申请人</th><th class="px-3 py-3 text-xs font-bold text-slate-500">申请时间</th><th class="px-3 py-3 text-xs font-bold text-slate-500">活动</th><th class="px-3 py-3 text-xs font-bold text-slate-500">摘要</th><th class="px-3 py-3 text-xs font-bold text-slate-500">状态</th><th class="px-4 py-3 text-xs font-bold text-slate-500 text-right">操作</th>' +
            '</tr></thead><tbody id="' + rootId + '-tbody" class="divide-y divide-slate-50"></tbody></table>' +
            '<div id="' + rootId + '-empty" class="hidden py-16 text-center text-slate-400 text-sm">暂无审批记录</div></div></div>' +
            '<div id="' + rootId + '-detail" class="hidden space-y-6 max-w-5xl"></div>';

        setApprovalViewRole('cross');
        moduleApprovalSwitchRole(rootId, 'cross');
        moduleApprovalRenderList(rootId);

        if (options.onReady) options.onReady(state);
        return state;
    };

    window.moduleApprovalSwitchRole = function (rootId, role) {
        setApprovalViewRole(role);
        document.querySelectorAll('[data-root="' + rootId + '"].role-tab').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-role') === role);
        });
        moduleApprovalRenderList(rootId);
        if (instances[rootId] && instances[rootId].detailId) moduleApprovalShowDetail(rootId, instances[rootId].detailId);
    };

    window.moduleApprovalRenderList = function (rootId) {
        const state = instances[rootId];
        if (!state) return;
        const role = getApprovalViewRole();
        const viewMode = document.getElementById(rootId + '-view-mode').value;
        const status = document.getElementById(rootId + '-filter-status').value;
        const idQ = (document.getElementById(rootId + '-filter-id').value || '').trim().toLowerCase();
        let list = getApprovalAppsByType(state.type);
        if (viewMode === 'pending') list = list.filter(function (a) { return isApprovalPendingForRole(a, role); });
        if (status !== 'all') list = list.filter(function (a) { return a.status === status; });
        if (idQ) list = list.filter(function (a) { return a.id.toLowerCase().indexOf(idQ) !== -1; });
        state.filtered = list;

        document.getElementById(rootId + '-count').textContent = '（' + list.length + ' 条）';
        const pending = getApprovalAppsByType(state.type).filter(function (a) { return isApprovalPendingForRole(a, role); }).length;
        document.getElementById(rootId + '-hint').textContent = viewMode === 'pending' ? '当前角色待处理 ' + pending + ' 条' : '';

        const tbody = document.getElementById(rootId + '-tbody');
        const empty = document.getElementById(rootId + '-empty');
        if (!list.length) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');
        tbody.innerHTML = list.map(function (app) {
            const actionable = canApproveApplication(app, role);
            return '<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-mono text-[11px] font-bold">' + app.id + '</td>' +
                '<td class="px-3 py-3">' + app.applicant + '</td><td class="px-3 py-3 text-slate-500">' + app.createdAt + '</td>' +
                '<td class="px-3 py-3 max-w-[140px] truncate" title="' + formatApprovalActivity(app.payload) + '">' + formatApprovalActivity(app.payload) + '</td>' +
                '<td class="px-3 py-3 max-w-[160px] truncate" title="' + (app.summary || '') + '">' + (app.summary || '—') + '</td>' +
                '<td class="px-3 py-3"><span class="' + statusPillClass(app.status) + '">' + getApprovalStatusLabel(app.status) + '</span></td>' +
                '<td class="px-4 py-3 text-right space-x-2"><button type="button" onclick="moduleApprovalOpenDetail(\'' + rootId + '\',\'' + app.id + '\')" class="text-blue-600 font-bold hover:underline">查看</button>' +
                (actionable ? '<button type="button" onclick="moduleApprovalOpenDetail(\'' + rootId + '\',\'' + app.id + '\')" class="text-green-600 font-bold hover:underline">审批</button>' : '') +
                '</td></tr>';
        }).join('');
    };

    window.moduleApprovalOpenDetail = function (rootId, id, pushHash) {
        const state = instances[rootId];
        if (!state) return;
        state.detailId = id;
        state.view = 'detail';
        document.getElementById(rootId + '-list').classList.add('hidden');
        document.getElementById(rootId + '-detail').classList.remove('hidden');
        if (pushHash !== false && state.hashDetailPrefix) {
            location.hash = state.hashDetailPrefix + '=' + id;
        }
        moduleApprovalShowDetail(rootId, id);
        if (state.onDetailOpen) state.onDetailOpen(id);
    };

    window.moduleApprovalShowDetail = function (rootId, id) {
        const app = getApprovalAppById(id);
        const detailEl = document.getElementById(rootId + '-detail');
        if (!app || !detailEl) return;
        const role = getApprovalViewRole();
        const canAct = canApproveApplication(app, role);
        let readonlyHint = '当前审批已结束或无需您处理';
        if (app.status === 'pending_cross' && role !== 'cross') readonlyHint = '等待市场运营交叉审核';
        else if (app.status === 'pending_risk' && role !== 'risk') readonlyHint = '等待风控审核';
        else if (app.status === 'pending_boss' && role !== 'boss') readonlyHint = '等待老板审批（可在 Lark 完成）';

        detailEl.innerHTML =
            '<div class="flex items-center gap-3 mb-2"><button type="button" onclick="moduleApprovalBackList(\'' + rootId + '\')" class="text-slate-500 hover:text-slate-800 font-bold text-sm">← 返回审批列表</button></div>' +
            '<div class="grid grid-cols-3 gap-6"><div class="col-span-2 space-y-6">' +
            '<section class="card p-6"><div class="flex justify-between items-start mb-4"><div><p class="text-[10px] text-slate-400 font-bold uppercase">审批单号</p><p class="text-lg font-black">' + app.id + '</p></div><span class="' + statusPillClass(app.status) + '">' + getApprovalStatusLabel(app.status) + '</span></div>' +
            '<div class="grid grid-cols-2 gap-4 text-sm"><div><span class="text-slate-400">申请人</span><p class="font-bold mt-1">' + app.applicant + '</p></div><div><span class="text-slate-400">申请时间</span><p class="font-bold mt-1">' + app.createdAt + '</p></div><div class="col-span-2"><span class="text-slate-400">摘要</span><p class="font-bold mt-1">' + (app.summary || '—') + '</p></div></div>' +
            '<div class="mt-4 p-4 bg-slate-50 rounded-lg"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">申请备注</p><p class="text-sm">' + (app.remark || '—') + '</p></div></section>' +
            '<section class="card p-6"><div class="flex justify-between items-center mb-4"><h3 class="font-bold text-slate-800">申请原数据</h3><button type="button" onclick="exportApprovalDetailCsv(getApprovalAppById(\'' + app.id + '\'))" class="text-xs font-bold text-blue-600 hover:underline">导出明细 CSV</button></div>' +
            '<div class="grid grid-cols-2 gap-3 text-sm">' + renderPayloadMeta(app) + '</div>' + renderRecipients(app) + '</section>' +
            '<section class="card p-6"><h3 class="font-bold mb-4">审批时间线</h3>' + renderTimeline(app) + '</section></div>' +
            '<div class="space-y-6"><section class="card p-6"><h3 class="font-bold mb-4">审批进度</h3><div id="' + rootId + '-flow">' + renderApprovalFlow(app.status) + '</div>' + renderLarkApprovalCard(app) + '</section>' +
            (canAct ? '<section class="card p-6"><h3 class="font-bold mb-4">审批操作</h3><textarea id="' + rootId + '-note" rows="3" class="w-full border border-slate-200 rounded-lg p-3 text-sm mb-4" placeholder="审批意见（驳回时必填）"></textarea><div class="flex gap-2"><button type="button" onclick="moduleApprovalReject(\'' + rootId + '\',\'' + app.id + '\')" class="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-bold">驳回</button><button type="button" onclick="moduleApprovalApprove(\'' + rootId + '\',\'' + app.id + '\')" class="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold">通过</button></div></section>' :
                '<section class="card p-6"><p class="text-sm text-slate-500 text-center">' + readonlyHint + '</p></section>') +
            '</div></div>';
    };

    window.moduleApprovalBackList = function (rootId, pushHash) {
        const state = instances[rootId];
        if (!state) return;
        state.view = 'list';
        state.detailId = null;
        document.getElementById(rootId + '-detail').classList.add('hidden');
        document.getElementById(rootId + '-list').classList.remove('hidden');
        if (pushHash !== false && state.hashList) location.hash = state.hashList;
        moduleApprovalRenderList(rootId);
        if (state.onBackList) state.onBackList();
    };

    window.moduleApprovalApprove = function (rootId, id) {
        const note = document.getElementById(rootId + '-note').value.trim();
        approveApplication(id, getApprovalViewRole(), note);
        alert('审批已通过');
        moduleApprovalShowDetail(rootId, id);
        moduleApprovalRenderList(rootId);
    };

    window.moduleApprovalReject = function (rootId, id) {
        const note = document.getElementById(rootId + '-note').value.trim();
        if (!note) { alert('驳回时请填写审批意见'); return; }
        rejectApplication(id, getApprovalViewRole(), note);
        alert('已驳回');
        moduleApprovalShowDetail(rootId, id);
        moduleApprovalRenderList(rootId);
    };

    window.moduleApprovalExportList = function (rootId) {
        const state = instances[rootId];
        exportApprovalListCsv(state && state.filtered ? state.filtered : getApprovalAppsByType(state.type));
    };

    window.moduleApprovalHandleHash = function (rootId, hash, listHash, detailPrefix) {
        const state = instances[rootId];
        if (!state) return false;
        state.hashList = listHash || 'approval';
        state.hashDetailPrefix = detailPrefix || 'approval-detail';
        if (hash.indexOf(state.hashDetailPrefix + '=') === 0) {
            moduleApprovalOpenDetail(rootId, hash.replace(state.hashDetailPrefix + '=', ''), false);
            return true;
        }
        if (hash === state.hashList || hash === 'approval') {
            moduleApprovalBackList(rootId, false);
            return true;
        }
        return false;
    };
})();
