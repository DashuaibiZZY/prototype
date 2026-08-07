/**
 * 各业务模块内嵌审批列表 + 详情子页
 */
(function () {
    const instances = {};
    const RECIPIENT_PAGE_SIZE = 10;

    function statusPillClass(status) {
        return 'status-pill status-' + status;
    }

    function resolveTypes(options) {
        if (options.types && options.types.length) return options.types;
        if (options.type) return [options.type];
        return [];
    }

    function getAppsForState(state) {
        if (!state) return [];
        if (state.types && state.types.length > 1) return getApprovalAppsByTypes(state.types);
        return getApprovalAppsByType(state.types[0]);
    }

    function getRecipientFilter(state, appId) {
        if (!state.recipientFilters) state.recipientFilters = {};
        if (!state.recipientFilters[appId]) state.recipientFilters[appId] = { q: '', page: 1 };
        return state.recipientFilters[appId];
    }

    function recipientSectionId(rootId, appId) {
        return rootId + '-recipients-' + String(appId).replace(/[^a-zA-Z0-9]/g, '_');
    }

    function getRecipientDataset(app) {
        const p = app.payload || {};
        if (app.type === 'points_bonus_config' && p.items && p.items.length) {
            return {
                kind: 'bonus',
                title: '积分加成配置名单',
                searchKey: 'uid',
                headers: ['UID', '自然加成', '新加成', '异常'],
                rows: p.items.map(function (r) {
                    return {
                        key: r.uid,
                        cells: [r.uid, r.naturalBonus, r.newBonus, r.anomaly ? '自然加成更高' : '—'],
                        anomaly: !!r.anomaly
                    };
                })
            };
        }
        if ((app.type === 'trial_issue' || app.type === 'points_manual') && p.recipients && p.recipients.length) {
            const isTrial = app.type === 'trial_issue';
            return {
                kind: isTrial ? 'trial' : 'points',
                title: isTrial ? '体验金发放名单' : '积分发放名单',
                searchKey: 'uid_or_wallet',
                headers: ['uid_or_wallet', isTrial ? 'amount' : 'points'],
                rows: p.recipients.map(function (r) {
                    return {
                        key: r.uid_or_wallet,
                        cells: [r.uid_or_wallet, isTrial ? r.amount : r.points],
                        anomaly: false
                    };
                })
            };
        }
        return null;
    }

    function renderPayloadMeta(app, opts) {
        const p = app.payload || {};
        const rows = [];
        if (p.activityName || p.activityId || p.activityMode) rows.push(['活动信息', formatApprovalActivity(p)]);
        if (app.type === 'trial_issue') {
            rows.push(['关联卡组', p.cardGroup], ['录入方式', p.inputMode === 'excel' ? 'Excel 导入' : '手动录入'], ['发放人数', p.recipientCount], ['发放总额', p.totalAmount]);
        } else if (app.type === 'points_manual') {
            rows.push(['录入方式', p.inputMode === 'file' ? '文件上传' : '多行录入'], ['发放人数', p.recipientCount], ['发放总积分', p.totalPoints]);
        } else if (app.type === 'points_bonus_config') {
            rows.push(['加成系数', p.bonusMultiplier ? p.bonusMultiplier + 'x' : '—'], ['配置人数', p.recipientCount], ['异常人数', p.anomalyCount || 0]);
        } else if (app.type === 'fee_config') {
            rows.push(['UID', p.uid], ['钱包', p.wallet], ['费率模式', p.feeMode === 'vip' ? 'VIP 等级' : '自定义'], ['VIP 等级', p.vipLevel != null ? 'VIP ' + p.vipLevel : '—'], ['Taker', p.taker], ['Maker', p.maker], ['有效期', p.validDays ? p.validDays + ' 天（到期日 24:00:00（UTC+8）失效）' : '永久有效']);
            if (opts && opts.detailImagePreview && p.attachments && p.attachments.length) {
                const previews = p.attachmentPreviews || {};
                rows.push(['附件', p.attachments.map(function (name) {
                    const url = previews[name] || '';
                    return '<button type="button" class="text-blue-600 font-bold hover:underline mr-2" onclick="openApprovalAttachment(\'' + name.replace(/'/g, "\\'") + '\', \'' + url.replace(/'/g, "\\'") + '\')">' + name + '（查看）</button>';
                }).join('')]);
            } else {
                rows.push(['附件', (p.attachments || []).join('、') || '—']);
            }
        } else if (app.type === 'partner_l1_bind') {
            rows.push(['钱包/UID', p.wallet], ['申请返佣比例', p.ratio + '%'], ['运营配置上限', p.opsCap + '%'], ['备注', p.note || '—'], ['超上限', p.exceedsCap ? '是，须风控+老板审批' : '否']);
        }
        return rows.map(function (r) {
            return '<div class="p-3 bg-slate-50 rounded-lg"><p class="text-[10px] text-slate-400 font-bold">' + r[0] + '</p><p class="font-bold text-slate-800 mt-1 break-all">' + (r[1] || '—') + '</p></div>';
        }).join('');
    }

    function formatPoolMinHolding(cfg) {
        if (!cfg) return '—';
        return cfg.duration + (cfg.unit === 'minute' ? ' 分钟' : ' 小时');
    }

    function renderProgramSwitchDetailSection(app) {
        if (app.type !== 'points_program_switch') return '';
        var p = app.payload || {};
        var before = p.beforeEnabled ? '开启' : '关闭';
        var after = p.afterEnabled ? '开启' : '关闭';
        return '<div class="col-span-2"><div class="border border-slate-200 rounded-lg px-4 py-2 text-sm">' +
            '<div class="flex justify-between items-center py-2.5 border-b border-slate-100"><span class="text-slate-600">积分计划总开关</span>' +
            '<span><span class="text-slate-400">' + before + '</span> <span class="text-slate-300 mx-1">→</span> <span class="text-blue-600 font-bold">' + after + '</span></span></div>' +
            '<div class="flex justify-between items-center py-2.5"><span class="text-slate-600">结算边界说明</span><span class="text-slate-700 text-xs text-right max-w-xs">' + (p.effectHint || '—') + '</span></div>' +
            '</div></div>';
    }

    function renderPoolConfigDetailSection(app) {
        if (app.type !== 'points_pool_config') return '';
        const p = app.payload || {};
        const after = p.after || {};
        const dimPct = after.dimPct || {};
        const dimLabels = ['交易积分', '有效持仓积分', '持仓亏损激励', '持仓盈利额外', '平均资沉积分', '邀请贡献积分'];
        const dimKeys = ['trade', 'position', 'loss', 'profit', 'balance', 'invite'];
        const changeMap = {};
        (p.changes || []).forEach(function (c) { changeMap[c.field] = c; });

        const items = [
            { label: '生效周期', value: p.effectivePeriod || '—', key: '生效周期' },
            { label: '本周总池（积分）', value: after.weeklyPool != null ? Number(after.weeklyPool).toLocaleString() : '—', key: '本周总池（积分）' }
        ];
        dimKeys.forEach(function (k, i) {
            items.push({ label: dimLabels[i] + '占比', value: dimPct[k] != null ? dimPct[k] + '%' : '—', key: dimLabels[i] + '占比' });
        });
        items.push({ label: '有效持仓最小时长', value: formatPoolMinHolding(after.minHolding), key: '有效持仓最小时长' });

        const listHtml = items.map(function (item) {
            const ch = changeMap[item.key];
            const valueHtml = ch
                ? '<span class="text-slate-400">' + ch.before + '</span> <span class="text-slate-300 mx-1">→</span> <span class="text-blue-600 font-bold">' + ch.after + '</span>'
                : '<span class="font-bold text-slate-800">' + item.value + '</span>';
            return '<div class="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0"><span class="text-slate-600">' + item.label + '</span>' + valueHtml + '</div>';
        }).join('');

        return '<div class="col-span-2"><div class="border border-slate-200 rounded-lg px-4 py-2 text-sm">' + listHtml + '</div></div>';
    }

    function renderRecipientSection(rootId, app) {
        const dataset = getRecipientDataset(app);
        if (!dataset) return '';
        const state = instances[rootId];
        const filter = getRecipientFilter(state, app.id);
        const q = (filter.q || '').trim().toLowerCase();
        let rows = dataset.rows;
        if (q) {
            rows = rows.filter(function (r) {
                return String(r.key).toLowerCase().indexOf(q) !== -1;
            });
        }
        const total = rows.length;
        const totalPages = Math.max(1, Math.ceil(total / RECIPIENT_PAGE_SIZE));
        if (filter.page > totalPages) filter.page = totalPages;
        if (filter.page < 1) filter.page = 1;
        const start = (filter.page - 1) * RECIPIENT_PAGE_SIZE;
        const pageRows = rows.slice(start, start + RECIPIENT_PAGE_SIZE);
        const sectionId = recipientSectionId(rootId, app.id);
        const searchPlaceholder = dataset.searchKey === 'uid' ? '按 UID 查询' : '按 uid_or_wallet 查询';

        let html = '<div id="' + sectionId + '" class="mt-4 col-span-2">';
        html += '<div class="flex flex-wrap justify-between items-center gap-3 mb-2">';
        html += '<p class="text-[10px] font-bold text-slate-500 uppercase">' + dataset.title + ' <span class="text-slate-400 font-normal">（共 ' + dataset.rows.length + ' 条）</span></p>';
        html += '<div class="flex gap-2 items-center">';
        html += '<input type="text" value="' + (filter.q || '').replace(/"/g, '&quot;') + '" placeholder="' + searchPlaceholder + '" class="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-48" oninput="moduleApprovalRecipientSearch(\'' + rootId + '\',\'' + app.id + '\', this.value)">';
        html += '</div></div>';
        html += '<div class="border border-slate-200 rounded-lg overflow-hidden"><table class="w-full text-sm"><thead class="bg-slate-50 border-b"><tr>';
        dataset.headers.forEach(function (h, i) {
            const align = i === dataset.headers.length - 1 && dataset.kind !== 'bonus' ? ' text-right' : '';
            html += '<th class="px-4 py-2 text-xs font-bold text-slate-500' + align + '">' + h + '</th>';
        });
        html += '</tr></thead><tbody class="divide-y divide-slate-50">';
        if (!pageRows.length) {
            html += '<tr><td colspan="' + dataset.headers.length + '" class="px-4 py-8 text-center text-slate-400 text-xs">无匹配记录</td></tr>';
        } else {
            pageRows.forEach(function (r) {
                html += '<tr' + (r.anomaly ? ' class="bg-amber-50"' : '') + '>';
                r.cells.forEach(function (cell, i) {
                    const align = i === r.cells.length - 1 && dataset.kind !== 'bonus' ? ' text-right font-bold' : (i === 0 ? ' font-mono text-[11px]' : '');
                    const cls = i === r.cells.length - 1 && dataset.kind === 'bonus' && r.anomaly ? ' text-amber-600' : '';
                    html += '<td class="px-4 py-2' + align + cls + '">' + cell + '</td>';
                });
                html += '</tr>';
            });
        }
        html += '</tbody></table></div>';
        html += '<div class="flex justify-between items-center mt-2 text-[11px] text-slate-500">';
        html += '<span>共 ' + total + ' 条' + (q ? '（已筛选）' : '') + ' · 第 ' + filter.page + '/' + totalPages + ' 页</span>';
        html += '<div class="flex gap-1">';
        html += '<button type="button" onclick="moduleApprovalRecipientPage(\'' + rootId + '\',\'' + app.id + '\', -1)" class="px-2 py-1 border rounded' + (filter.page <= 1 ? ' opacity-40' : '') + '" ' + (filter.page <= 1 ? 'disabled' : '') + '>上一页</button>';
        html += '<button type="button" onclick="moduleApprovalRecipientPage(\'' + rootId + '\',\'' + app.id + '\', 1)" class="px-2 py-1 border rounded' + (filter.page >= totalPages ? ' opacity-40' : '') + '" ' + (filter.page >= totalPages ? 'disabled' : '') + '>下一页</button>';
        html += '</div></div></div>';
        return html;
    }

    function refreshRecipientSection(rootId, appId) {
        const app = getApprovalAppById(appId);
        const el = document.getElementById(recipientSectionId(rootId, appId));
        if (!app || !el) return;
        el.outerHTML = renderRecipientSection(rootId, app);
    }

    function renderTimeline(app) {
        return (app.timeline || []).map(function (t) {
            return '<div class="border-l-2 border-slate-200 pl-4 pb-4 ml-1"><p class="font-bold text-slate-800">' + t.action + ' <span class="text-slate-400 font-normal">· ' + t.actor + '</span></p><p class="text-[10px] text-slate-400">' + t.at + '</p>' + (t.note ? '<p class="text-xs text-slate-600 mt-1">' + t.note + '</p>' : '') + '</div>';
        }).join('');
    }

    window.openApprovalAttachment = function (name, dataUrl) {
        let modal = document.getElementById('approval-attachment-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'approval-attachment-modal';
            modal.className = 'hidden fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 p-4';
            modal.innerHTML = '<div class="bg-white rounded-xl max-w-2xl w-full p-4"><div class="flex justify-between items-center mb-3"><span id="approval-attachment-title" class="font-bold text-sm"></span><button type="button" onclick="document.getElementById(\'approval-attachment-modal\').classList.add(\'hidden\')" class="text-slate-400 text-xl">&times;</button></div><div class="bg-slate-100 rounded-lg min-h-[200px] flex items-center justify-center text-slate-400 text-sm overflow-auto" id="approval-attachment-preview"></div></div>';
            document.body.appendChild(modal);
        }
        document.getElementById('approval-attachment-title').textContent = name;
        const preview = document.getElementById('approval-attachment-preview');
        if (dataUrl) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="' + name + '" class="max-w-full max-h-[480px] rounded">';
        } else {
            preview.innerHTML = '<div class="text-center p-8"><p class="font-bold text-slate-600 mb-2">' + name + '</p><p class="text-xs">演示模式：实际环境将展示上传的图片</p></div>';
        }
        modal.classList.remove('hidden');
    };

    window.initModuleApproval = function (options) {
        options = options || {};
        const types = resolveTypes(options);
        const rootId = options.rootId || 'module-approval-root';
        const title = options.title || '审批管理';
        const showExportList = options.showExportList === true;
        const showExportDetail = options.showExportDetail === true;
        const detailImagePreview = options.detailImagePreview === true;
        const showTypeColumn = types.length > 1;
        const root = document.getElementById(rootId);
        if (!root || !types.length) return;

        const state = { types: types, view: 'list', detailId: null, listMode: 'pending', options: options, recipientFilters: {} };
        instances[rootId] = state;

        const exportBtn = showExportList ? '<button type="button" onclick="moduleApprovalExportList(\'' + rootId + '\')" class="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600">导出 CSV</button>' : '';
        const typeFilter = showTypeColumn
            ? '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">审批类型</label><select id="' + rootId + '-filter-type" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" onchange="moduleApprovalRenderList(\'' + rootId + '\')"><option value="all">全部</option>' + types.map(function (t) {
                return '<option value="' + t + '">' + getApprovalTypeLabel(t) + '</option>';
            }).join('') + '</select></div>'
            : '';
        const gridCols = showTypeColumn ? 'grid-cols-6' : 'grid-cols-5';
        const typeHeader = showTypeColumn ? '<th class="px-3 py-3 text-xs font-bold text-slate-500">类型</th>' : '';

        root.innerHTML =
            '<div id="' + rootId + '-list" class="space-y-6">' +
            '<div class="flex flex-wrap justify-between items-start gap-4">' +
            '<div><h2 class="text-lg font-bold text-slate-700">' + title + '</h2><p class="text-sm text-slate-400 mt-1">本模块审批在此处理，支持查看原数据及 Lark 老板审批联动</p></div>' +
            '<div class="flex flex-wrap gap-2 items-center">' +
            '<button type="button" class="role-tab active" data-root="' + rootId + '" data-role="cross" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'cross\')">市场运营交叉</button>' +
            '<button type="button" class="role-tab" data-root="' + rootId + '" data-role="risk" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'risk\')">风控</button>' +
            '<button type="button" class="role-tab" data-root="' + rootId + '" data-role="boss" onclick="moduleApprovalSwitchRole(\'' + rootId + '\',\'boss\')">老板</button>' +
            '</div></div>' +
            '<section class="card p-5"><div class="grid ' + gridCols + ' gap-4 items-end">' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">视图</label><select id="' + rootId + '-view-mode" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" onchange="moduleApprovalRenderList(\'' + rootId + '\')"><option value="pending">待我审批</option><option value="all">全部审批</option></select></div>' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">状态</label><select id="' + rootId + '-filter-status" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white" onchange="moduleApprovalRenderList(\'' + rootId + '\')"><option value="all">全部</option><option value="pending_cross">待交叉审核</option><option value="pending_risk">待风控</option><option value="pending_boss">待老板</option><option value="approved">已通过</option><option value="rejected">已驳回</option></select></div>' +
            typeFilter +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">活动名称</label><input id="' + rootId + '-filter-activity" type="text" placeholder="模糊匹配" class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" oninput="moduleApprovalRenderList(\'' + rootId + '\')"></div>' +
            '<div><label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">审批单号</label><input id="' + rootId + '-filter-id" type="text" placeholder="APR..." class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm" oninput="moduleApprovalRenderList(\'' + rootId + '\')"></div>' +
            '<div class="flex gap-2"><button type="button" onclick="moduleApprovalRenderList(\'' + rootId + '\')" class="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold">查询</button>' + exportBtn + '</div>' +
            '</div></section>' +
            '<div class="card overflow-hidden"><div class="px-6 py-4 border-b flex justify-between"><span class="text-sm font-bold text-slate-700">审批列表 <span id="' + rootId + '-count" class="text-slate-400"></span></span><span id="' + rootId + '-hint" class="text-[10px] text-amber-600 font-bold"></span></div>' +
            '<table class="w-full text-left text-sm"><thead class="bg-slate-50 border-b"><tr>' +
            '<th class="px-4 py-3 text-xs font-bold text-slate-500">审批单号</th>' + typeHeader +
            '<th class="px-3 py-3 text-xs font-bold text-slate-500">申请人</th><th class="px-3 py-3 text-xs font-bold text-slate-500">申请时间</th><th class="px-3 py-3 text-xs font-bold text-slate-500">活动</th><th class="px-3 py-3 text-xs font-bold text-slate-500">摘要</th><th class="px-3 py-3 text-xs font-bold text-slate-500">状态</th><th class="px-4 py-3 text-xs font-bold text-slate-500 text-right">操作</th>' +
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
        const actQ = (document.getElementById(rootId + '-filter-activity').value || '').trim().toLowerCase();
        const typeEl = document.getElementById(rootId + '-filter-type');
        const typeQ = typeEl ? typeEl.value : 'all';
        let list = getAppsForState(state);
        if (viewMode === 'pending') list = list.filter(function (a) { return isApprovalPendingForRole(a, role); });
        if (status !== 'all') list = list.filter(function (a) { return a.status === status; });
        if (typeQ !== 'all') list = list.filter(function (a) { return a.type === typeQ; });
        if (idQ) list = list.filter(function (a) { return a.id.toLowerCase().indexOf(idQ) !== -1; });
        if (actQ) list = list.filter(function (a) { return formatApprovalActivity(a.payload || {}).toLowerCase().indexOf(actQ) !== -1; });
        state.filtered = list;

        document.getElementById(rootId + '-count').textContent = '（' + list.length + ' 条）';
        const pending = getAppsForState(state).filter(function (a) { return isApprovalPendingForRole(a, role); }).length;
        document.getElementById(rootId + '-hint').textContent = viewMode === 'pending' ? '当前角色待处理 ' + pending + ' 条' : '';

        const showTypeColumn = state.types.length > 1;
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
            const typeCell = showTypeColumn ? '<td class="px-3 py-3 text-xs font-bold text-slate-600">' + getApprovalTypeLabel(app.type) + '</td>' : '';
            return '<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-mono text-[11px] font-bold">' + app.id + '</td>' + typeCell +
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
        const state = instances[rootId];
        const app = getApprovalAppById(id);
        const detailEl = document.getElementById(rootId + '-detail');
        if (!app || !detailEl) return;
        const role = getApprovalViewRole();
        const canAct = canApproveApplication(app, role);
        const opts = state ? state.options : {};
        let readonlyHint = '当前审批已结束或无需您处理';
        if (app.status === 'pending_cross' && role !== 'cross') readonlyHint = '等待市场运营交叉审核';
        else if (app.status === 'pending_risk' && role !== 'risk') readonlyHint = '等待风控审核';
        else if (app.status === 'pending_boss' && role !== 'boss') readonlyHint = '等待老板审批（可在 Lark 完成）';

        const isSimpleConfig = app.type === 'points_pool_config' || app.type === 'points_program_switch';
        const exportDetailBtn = opts.showExportDetail && !isSimpleConfig
            ? '<button type="button" onclick="exportApprovalDetailCsv(getApprovalAppById(\'' + app.id + '\'))" class="text-xs font-bold text-blue-600 hover:underline">导出原数据</button>'
            : '';
        const dataSectionTitle = isSimpleConfig ? '配置内容' : '申请原数据';
        const dataSectionBody = app.type === 'points_pool_config'
            ? '<div class="text-sm">' + renderPoolConfigDetailSection(app) + '</div>'
            : app.type === 'points_program_switch'
                ? '<div class="text-sm">' + renderProgramSwitchDetailSection(app) + '</div>'
                : '<div class="grid grid-cols-2 gap-3 text-sm">' + renderPayloadMeta(app, opts) + renderRecipientSection(rootId, app) + '</div>';
        const typeBadge = state.types.length > 1
            ? '<span class="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">' + getApprovalTypeLabel(app.type) + '</span>'
            : '';

        detailEl.innerHTML =
            '<div class="flex items-center gap-3 mb-2"><button type="button" onclick="moduleApprovalBackList(\'' + rootId + '\')" class="text-slate-500 hover:text-slate-800 font-bold text-sm">← 返回审批列表</button></div>' +
            '<div class="grid grid-cols-3 gap-6"><div class="col-span-2 space-y-6">' +
            '<section class="card p-6"><div class="flex justify-between items-start mb-4"><div><p class="text-[10px] text-slate-400 font-bold uppercase">审批单号</p><p class="text-lg font-black">' + app.id + '</p>' + typeBadge + '</div><span class="' + statusPillClass(app.status) + '">' + getApprovalStatusLabel(app.status) + '</span></div>' +
            '<div class="grid grid-cols-2 gap-4 text-sm"><div><span class="text-slate-400">申请人</span><p class="font-bold mt-1">' + app.applicant + '</p></div><div><span class="text-slate-400">申请时间</span><p class="font-bold mt-1">' + app.createdAt + '</p></div><div class="col-span-2"><span class="text-slate-400">摘要</span><p class="font-bold mt-1">' + (app.summary || '—') + '</p></div></div>' +
            '<div class="mt-4 p-4 bg-slate-50 rounded-lg"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">申请备注</p><p class="text-sm">' + (app.remark || '—') + '</p></div></section>' +
            '<section class="card p-6"><div class="flex justify-between items-center mb-4"><h3 class="font-bold text-slate-800">' + dataSectionTitle + '</h3>' + exportDetailBtn + '</div>' +
            dataSectionBody + '</section>' +
            '<section class="card p-6"><h3 class="font-bold mb-4">审批时间线</h3>' + renderTimeline(app) + '</section></div>' +
            '<div class="space-y-6"><section class="card p-6"><h3 class="font-bold mb-4">审批进度</h3><div>' + renderApprovalFlow(app.status, false, app) + '</div>' + (app.lark ? renderLarkApprovalCard(app) : '') + '</section>' +
            (canAct ? '<section class="card p-6"><h3 class="font-bold mb-4">审批操作</h3><textarea id="' + rootId + '-note" rows="3" class="w-full border border-slate-200 rounded-lg p-3 text-sm mb-4" placeholder="审批意见（驳回时必填）"></textarea><div class="flex gap-2"><button type="button" onclick="moduleApprovalReject(\'' + rootId + '\',\'' + app.id + '\')" class="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-bold">驳回</button><button type="button" onclick="moduleApprovalApprove(\'' + rootId + '\',\'' + app.id + '\')" class="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold">通过</button></div></section>' :
                '<section class="card p-6"><p class="text-sm text-slate-500 text-center">' + readonlyHint + '</p></section>') +
            '</div></div>';
    };

    window.moduleApprovalRecipientSearch = function (rootId, appId, q) {
        const state = instances[rootId];
        if (!state) return;
        const filter = getRecipientFilter(state, appId);
        filter.q = q;
        filter.page = 1;
        refreshRecipientSection(rootId, appId);
    };

    window.moduleApprovalRecipientPage = function (rootId, appId, delta) {
        const state = instances[rootId];
        if (!state) return;
        const filter = getRecipientFilter(state, appId);
        filter.page = (filter.page || 1) + delta;
        refreshRecipientSection(rootId, appId);
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
        exportApprovalListCsv(state && state.filtered ? state.filtered : getAppsForState(state));
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
