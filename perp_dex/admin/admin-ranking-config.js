(function (global) {
    'use strict';

    var DIMENSION_KEYS = { '收益金额': 'pnl', '收益率': 'roi', '交易额': 'volume' };
    var DIMENSION_LABELS = { pnl: 'PnL (USDT)', roi: 'ROI (%)', volume: 'Volume (USDT)' };
    var STATUS_LABEL = { active: '生效中', pending: '待生效', offline: '已停用' };

    /** 平台真实注册用户 UID（不可配置排行榜数据） */
    var REAL_USER_UIDS = { '100803': 1, '100855': 1, '200101': 1, '100815': 1, '10033401': 1 };

    var ACTIVITY_META = {
        'act-001': { name: 'ForX嘉年华交易大赛', ongoing: true, rankEnabled: true, dimensions: ['交易额', '收益率', '收益金额'] },
        'act-002': { name: 'BTC 永续交易量冲榜', ongoing: true, rankEnabled: true, dimensions: ['交易额'] },
        'act-003': { name: 'Q3 ROI 争霸赛', ongoing: true, rankEnabled: true, dimensions: ['收益率', '收益金额'] },
        'act-004': { name: '新春积分排位赛', ongoing: false, rankEnabled: false, dimensions: [] },
        'act-005': { name: 'ETH 周度交易赛', ongoing: true, rankEnabled: false, dimensions: [] }
    };

    var configRows = [
        { id: 1, uid: '10088001', wallet: '0x7a8b...C443', isVirtual: true, scopeType: 'platform', activityId: '', activityName: '', dimensions: ['pnl', 'roi', 'volume'], pnl: 1240000, roi: 124.52, volume: 12800000, status: 'active', dataTime: '2026-08-31 14:20', effectiveAt: '立即生效' },
        { id: 2, uid: '10088002', wallet: '0x3f21...9A12', isVirtual: true, scopeType: 'activity', activityId: 'act-001', activityName: 'ForX嘉年华交易大赛', dimensions: ['volume', 'roi', 'pnl'], pnl: 86420.5, roi: 42.18, volume: 5200000, status: 'active', dataTime: '2026-08-31 09:00', effectiveAt: '立即生效' },
        { id: 3, uid: '10088003', wallet: '0xAb12...77E0', isVirtual: true, scopeType: 'activity', activityId: 'act-002', activityName: 'BTC 永续交易量冲榜', dimensions: ['volume'], pnl: null, roi: null, volume: 980000, status: 'pending', dataTime: '—', effectiveAt: '2026-09-05 00:00' }
    ];

    (function seedDemoRows() {
        for (var i = 4; i <= 14; i++) {
            var isActivity = i % 2 === 0;
            var actId = isActivity ? 'act-003' : '';
            var meta = actId ? ACTIVITY_META[actId] : null;
            var dims = meta ? meta.dimensions.map(function (d) { return DIMENSION_KEYS[d]; }) : ['pnl', 'roi', 'volume'];
            configRows.push({
                id: i, uid: '10088' + String(100 + i), wallet: '0xVirt' + String(i).padStart(2, '0') + '...' + (2000 + i), isVirtual: true,
                scopeType: isActivity ? 'activity' : 'platform', activityId: actId, activityName: meta ? meta.name : '',
                dimensions: dims,
                pnl: dims.indexOf('pnl') >= 0 ? i * 12500 : null,
                roi: dims.indexOf('roi') >= 0 ? i * 3.2 : null,
                volume: dims.indexOf('volume') >= 0 ? i * 420000 : null,
                status: i % 5 === 0 ? 'offline' : (i % 4 === 0 ? 'pending' : 'active'),
                dataTime: i % 4 === 0 ? '—' : '2026-08-' + String(10 + (i % 20)).padStart(2, '0') + ' 12:00',
                effectiveAt: i % 4 === 0 ? '2026-09-0' + (i % 9 + 1) + ' 00:00' : '立即生效'
            });
        }
    })();

    var filteredRows = configRows.slice();
    var listPage = 1;
    var nextId = 100;
    var nextVirtualUid = 10088200;

    var editingId = null;
    var uidMode = 'manual';
    var configScope = 'platform';
    var batchScope = 'platform';
    var batchRows = [];
    var activeCombobox = null;

    function getSelectableActivities() {
        return Object.keys(ACTIVITY_META).filter(function (id) {
            var m = ACTIVITY_META[id];
            return m.ongoing && m.rankEnabled;
        }).map(function (id) { return { id: id, name: ACTIVITY_META[id].name }; });
    }

    function isRealUser(uid) {
        return !!REAL_USER_UIDS[String(uid).trim()];
    }

    function allocateVirtualUid() {
        nextVirtualUid += 1;
        return String(nextVirtualUid);
    }

    function formatMoney(n) {
        if (n == null) return '—';
        if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
        return '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    function getMetricKeysForScope(scope, activityId) {
        if (scope === 'platform') return ['pnl', 'roi', 'volume'];
        var meta = ACTIVITY_META[activityId];
        if (!meta) return [];
        return meta.dimensions.map(function (d) { return DIMENSION_KEYS[d]; });
    }

    var VIEW_IDS = ['view-list', 'view-config', 'view-batch'];

    function showView(id) {
        VIEW_IDS.forEach(function (vid) {
            var el = document.getElementById(vid);
            if (!el) return;
            if (vid === id) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
        closeAllComboboxes();
    }

    global.showListPage = function () {
        showView('view-list');
        if (location.hash) location.hash = '';
    };

    global.openConfigPage = function (id) {
        editingId = id || null;
        document.getElementById('config-page-title').textContent = id ? '编辑虚拟用户配置' : '新增虚拟用户配置';
        showView('view-config');
        try {
            resetSingleForm(id);
        } catch (err) {
            console.error('[RankingAdmin] resetSingleForm failed', err);
        }
        var hash = id ? '#edit=' + id : '#new';
        if (location.hash !== hash) location.hash = hash;
    };

    global.openBatchPage = function () {
        showView('view-batch');
        try {
            initBatchPage();
        } catch (err) {
            console.error('[RankingAdmin] initBatchPage failed', err);
        }
        if (location.hash !== '#batch') location.hash = '#batch';
    };

    function resetSingleForm(id) {
        uidMode = 'manual';
        configScope = 'platform';
        global.setUidMode('manual');
        global.setConfigScope('platform');
        document.getElementById('uid-error').classList.add('hidden');
        mountActivityCombobox('cfg-activity-combobox', 'cfg', '', onConfigActivityChange);
        renderPlatformMetrics('cfg-metrics-platform', 'cfg', null);
        document.getElementById('cfg-metrics-activity').classList.add('hidden');
        document.getElementById('cfg-metrics-platform').classList.remove('hidden');
        updateConfigMetricsHint();
        document.querySelector('input[name="cfg-effective"][value="now"]').checked = true;
        global.onCfgEffectiveChange();

        if (id) {
            var row = configRows.find(function (r) { return r.id === id; });
            if (!row) return;
            uidMode = 'manual';
            global.setUidMode('manual');
            document.getElementById('config-uid').value = row.uid;
            document.getElementById('config-uid').readOnly = true;
            document.getElementById('uid-mode-manual').disabled = true;
            document.getElementById('uid-mode-generate').disabled = true;
            global.setConfigScope(row.scopeType);
            if (row.activityId) selectComboboxActivity('cfg', row.activityId);
            fillMetrics('cfg', row.scopeType, row.activityId, row);
            document.querySelector('input[name="cfg-effective"][value="now"]').checked = row.status !== 'pending';
            document.querySelector('input[name="cfg-effective"][value="scheduled"]').checked = row.status === 'pending';
            global.onCfgEffectiveChange();
        } else {
            document.getElementById('config-uid').readOnly = false;
            document.getElementById('config-uid').value = '';
            document.getElementById('uid-mode-manual').disabled = false;
            document.getElementById('uid-mode-generate').disabled = false;
        }
    }

    global.setUidMode = function (mode) {
        uidMode = mode;
        document.getElementById('uid-mode-manual').classList.toggle('active', mode === 'manual');
        document.getElementById('uid-mode-generate').classList.toggle('active', mode === 'generate');
        var input = document.getElementById('config-uid');
        var hint = document.getElementById('uid-hint');
        document.getElementById('uid-error').classList.add('hidden');
        if (editingId) return;
        if (mode === 'generate') {
            input.value = '';
            input.readOnly = true;
            input.placeholder = '保存成功后系统自动分配虚拟 UID';
            hint.textContent = '已选择「保存时生成」：点击保存后才会创建虚拟用户并展示 UID。';
        } else {
            input.readOnly = false;
            input.placeholder = '输入虚拟用户 UID';
            hint.textContent = '手动输入虚拟 UID；不可填写真实注册用户 UID（如 100803、200101）。';
        }
    };

    global.setConfigScope = function (scope) {
        configScope = scope;
        document.getElementById('cfg-scope-platform').classList.toggle('active', scope === 'platform');
        document.getElementById('cfg-scope-activity').classList.toggle('active', scope === 'activity');
        document.getElementById('cfg-activity-wrap').classList.toggle('hidden', scope !== 'activity');
        if (scope !== 'activity') clearCombobox('cfg');
        updateConfigMetricsPanel();
    };

    function updateConfigMetricsPanel() {
        var actId = getComboboxValue('cfg');
        if (configScope === 'platform') {
            document.getElementById('cfg-metrics-platform').classList.remove('hidden');
            document.getElementById('cfg-metrics-activity').classList.add('hidden');
            renderPlatformMetrics('cfg-metrics-platform', 'cfg', null);
        } else {
            document.getElementById('cfg-metrics-platform').classList.add('hidden');
            document.getElementById('cfg-metrics-activity').classList.remove('hidden');
            if (actId) renderActivityMetrics('cfg-metrics-activity', 'cfg', actId, null);
            else document.getElementById('cfg-metrics-activity').innerHTML = '<p class="text-slate-400 italic">请先选择活动</p>';
        }
        updateConfigMetricsHint();
    }

    function updateConfigMetricsHint() {
        var hint = document.getElementById('cfg-metrics-hint');
        if (configScope === 'platform') {
            hint.innerHTML = '全平台展示三项指标，默认均为 <strong>0</strong>。';
        } else {
            hint.innerHTML = '活动榜仅展示该活动已启用的排序维度。';
        }
    }

    function onConfigActivityChange(id) {
        var box = document.getElementById('cfg-activity-readonly');
        if (!id) { box.classList.add('hidden'); updateConfigMetricsPanel(); return; }
        var meta = ACTIVITY_META[id];
        box.classList.remove('hidden');
        document.getElementById('cfg-activity-dim').textContent = '排序维度：' + meta.dimensions.join('、');
        updateConfigMetricsPanel();
    }

    global.onCfgEffectiveChange = function () {
        var scheduled = document.querySelector('input[name="cfg-effective"]:checked').value === 'scheduled';
        var dateInput = document.getElementById('cfg-effective-date');
        dateInput.disabled = !scheduled;
        if (scheduled && !dateInput.value) {
            var d = new Date(); d.setDate(d.getDate() + 3);
            dateInput.value = d.toISOString().slice(0, 10);
        }
    };

    function validateVirtualUid(uid, allowEmptyForGenerate) {
        if (!uid) {
            if (allowEmptyForGenerate) return null;
            return '请填写虚拟用户 UID 或选择「保存时生成」';
        }
        if (isRealUser(uid)) return 'UID ' + uid + ' 为真实注册用户，不可配置排行榜数据';
        var dup = configRows.find(function (r) { return r.uid === uid && r.id !== editingId && r.status !== 'offline'; });
        if (dup) return '虚拟 UID ' + uid + ' 已有生效配置';
        return null;
    }

    global.saveSingleConfig = function () {
        var uid = document.getElementById('config-uid').value.trim();
        var willGenerate = !editingId && uidMode === 'generate';
        if (willGenerate) uid = allocateVirtualUid();
        else {
            var err = validateVirtualUid(uid, false);
            if (err) {
                document.getElementById('uid-error').textContent = err;
                document.getElementById('uid-error').classList.remove('hidden');
                return;
            }
        }

        var actId = configScope === 'activity' ? getComboboxValue('cfg') : '';
        if (configScope === 'activity' && !actId) { alert('请选择活动'); return; }

        var keys = getMetricKeysForScope(configScope, actId);
        var metrics = readMetrics('cfg', keys);
        var scheduled = document.querySelector('input[name="cfg-effective"]:checked').value === 'scheduled';

        if (editingId) {
            var row = configRows.find(function (r) { return r.id === editingId; });
            applyMetricsToRow(row, keys, metrics);
            row.status = scheduled ? 'pending' : 'active';
            row.effectiveAt = scheduled ? document.getElementById('cfg-effective-date').value + ' 00:00' : '立即生效';
            row.dataTime = scheduled ? '—' : nowStr();
        } else {
            nextId += 1;
            var newRow = buildRow(nextId, uid, configScope, actId, keys, metrics, scheduled);
            configRows.unshift(newRow);
        }

        var msg = willGenerate ? ('已创建虚拟用户 UID：' + uid) : '配置已保存';
        alert(msg + '；数据将按写入时间参与 7D / 30D 排行榜统计');
        filteredRows = configRows.slice();
        global.showListPage();
        renderTable();
    };

    function nowStr() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function buildRow(id, uid, scope, actId, keys, metrics, scheduled) {
        var meta = actId ? ACTIVITY_META[actId] : null;
        var row = {
            id: id, uid: uid, wallet: '0xVirt' + uid.slice(-4) + '...' + uid.slice(-2), isVirtual: true,
            scopeType: scope, activityId: actId || '', activityName: meta ? meta.name : '',
            dimensions: keys.slice(), status: scheduled ? 'pending' : 'active',
            dataTime: scheduled ? '—' : nowStr(),
            effectiveAt: scheduled ? document.getElementById('cfg-effective-date').value + ' 00:00' : '立即生效',
            pnl: null, roi: null, volume: null
        };
        applyMetricsToRow(row, keys, metrics);
        return row;
    }

    function applyMetricsToRow(row, keys, metrics) {
        row.pnl = keys.indexOf('pnl') >= 0 ? metrics.pnl : null;
        row.roi = keys.indexOf('roi') >= 0 ? metrics.roi : null;
        row.volume = keys.indexOf('volume') >= 0 ? metrics.volume : null;
    }

    function renderPlatformMetrics(containerId, prefix, row) {
        var html = ['pnl', 'roi', 'volume'].map(function (key) {
            var val = row && row[key] != null ? row[key] : 0;
            var color = key === 'pnl' ? ' text-green-700' : (key === 'volume' ? ' text-amber-700' : '');
            return '<div><label class="input-label">' + DIMENSION_LABELS[key] + '</label>' +
                '<input type="number" id="' + prefix + '-m-' + key + '" step="0.01" value="' + val + '" class="search-input w-full font-black' + color + '"></div>';
        }).join('');
        document.getElementById(containerId).innerHTML = html;
    }

    function renderActivityMetrics(containerId, prefix, actId, row) {
        var meta = ACTIVITY_META[actId];
        var html = meta.dimensions.map(function (dimName) {
            var key = DIMENSION_KEYS[dimName];
            var val = row && row[key] != null ? row[key] : 0;
            return '<div><label class="input-label">' + DIMENSION_LABELS[key] + '</label>' +
                '<input type="number" id="' + prefix + '-m-' + key + '" step="0.01" value="' + val + '" class="search-input w-full font-black"></div>';
        }).join('');
        var el = document.getElementById(containerId);
        el.innerHTML = html;
        el.className = 'grid gap-4 grid-cols-' + Math.min(meta.dimensions.length, 3);
    }

    function fillMetrics(prefix, scope, actId, row) {
        if (scope === 'platform') renderPlatformMetrics('cfg-metrics-platform', prefix, row);
        else renderActivityMetrics('cfg-metrics-activity', prefix, actId, row);
    }

    function readMetrics(prefix, keys) {
        var out = {};
        keys.forEach(function (key) {
            var el = document.getElementById(prefix + '-m-' + key);
            out[key] = el ? parseFloat(el.value) || 0 : 0;
        });
        return out;
    }

    /* ---------- Batch ---------- */
    function initBatchPage() {
        batchScope = 'platform';
        batchRows = [{ uidMode: 'generate', uid: '' }, { uidMode: 'generate', uid: '' }, { uidMode: 'manual', uid: '' }];
        global.setBatchScope('platform');
        document.querySelector('input[name="batch-effective"][value="now"]').checked = true;
        global.onBatchEffectiveChange();
        renderBatchTable();
    }

    global.setBatchScope = function (scope) {
        batchScope = scope;
        document.getElementById('batch-scope-platform').classList.toggle('active', scope === 'platform');
        document.getElementById('batch-scope-activity').classList.toggle('active', scope === 'activity');
        document.getElementById('batch-activity-wrap').classList.toggle('hidden', scope !== 'activity');
        if (scope === 'activity') mountActivityCombobox('batch-activity-combobox', 'batch', '', renderBatchTable);
        else { clearCombobox('batch'); renderBatchTable(); }
    };

    global.onBatchEffectiveChange = function () {
        var scheduled = document.querySelector('input[name="batch-effective"]:checked').value === 'scheduled';
        var dateInput = document.getElementById('batch-effective-date');
        dateInput.disabled = !scheduled;
        if (scheduled && !dateInput.value) {
            var d = new Date(); d.setDate(d.getDate() + 3);
            dateInput.value = d.toISOString().slice(0, 10);
        }
    };

    global.addBatchRow = function () {
        if (batchRows.length >= 10) return;
        batchRows.push({ uidMode: 'generate', uid: '' });
        renderBatchTable();
    };

    global.removeBatchRow = function (idx) {
        if (batchRows.length <= 1) return;
        batchRows.splice(idx, 1);
        renderBatchTable();
    };

    global.setBatchRowUidMode = function (idx, mode) {
        batchRows[idx].uidMode = mode;
        if (mode === 'generate') batchRows[idx].uid = '';
        renderBatchTable();
    };

    global.updateBatchRowUid = function (idx, val) {
        batchRows[idx].uid = val;
    };

    function renderBatchTable() {
        var actId = batchScope === 'activity' ? getComboboxValue('batch') : '';
        var keys = getMetricKeysForScope(batchScope, actId);
        document.getElementById('batch-count-hint').textContent = batchRows.length + ' / 10 条';
        document.getElementById('btn-add-batch-row').disabled = batchRows.length >= 10;

        var head = '<th class="px-4 py-3 w-10">#</th><th class="px-4 py-3 min-w-[200px]">虚拟 UID</th>';
        keys.forEach(function (key) {
            head += '<th class="px-4 py-3">' + DIMENSION_LABELS[key] + '</th>';
        });
        head += '<th class="px-4 py-3 w-16"></th>';
        document.getElementById('batch-table-head').innerHTML = head;

        if (batchScope === 'activity' && !actId) {
            document.getElementById('batch-table-body').innerHTML =
                '<tr><td colspan="' + (keys.length + 3) + '" class="px-6 py-8 text-center text-slate-400">请先选择活动</td></tr>';
            return;
        }

        document.getElementById('batch-table-body').innerHTML = batchRows.map(function (row, idx) {
            var uidCell;
            if (row.uidMode === 'generate') {
                uidCell = '<div class="space-y-1"><select class="search-input font-bold" onchange="setBatchRowUidMode(' + idx + ', this.value)">' +
                    '<option value="generate" selected>保存时生成</option><option value="manual">手动输入</option></select>' +
                    '<p class="text-[9px] text-slate-400 italic">保存后分配 UID</p></div>';
            } else {
                uidCell = '<div class="space-y-1"><select class="search-input font-bold" onchange="setBatchRowUidMode(' + idx + ', this.value)">' +
                    '<option value="manual" selected>手动输入</option><option value="generate">保存时生成</option></select>' +
                    '<input type="text" class="search-input font-black" placeholder="虚拟 UID" value="' + (row.uid || '') + '" oninput="updateBatchRowUid(' + idx + ', this.value)"></div>';
            }
            var metricCells = keys.map(function (key) {
                var val = row[key] != null ? row[key] : 0;
                return '<td class="px-4 py-3"><input type="number" step="0.01" value="' + val + '" class="search-input" data-batch-idx="' + idx + '" data-metric="' + key + '" onchange="updateBatchMetric(this)"></td>';
            }).join('');
            return '<tr><td class="px-4 py-3 font-black text-slate-400">' + (idx + 1) + '</td><td class="px-4 py-3">' + uidCell + '</td>' +
                metricCells +
                '<td class="px-4 py-3"><button type="button" onclick="removeBatchRow(' + idx + ')" class="text-red-500 font-bold' + (batchRows.length <= 1 ? ' opacity-30' : '') + '"' + (batchRows.length <= 1 ? ' disabled' : '') + '>删除</button></td></tr>';
        }).join('');
    }

    global.updateBatchMetric = function (el) {
        var idx = parseInt(el.getAttribute('data-batch-idx'), 10);
        var key = el.getAttribute('data-metric');
        batchRows[idx][key] = parseFloat(el.value) || 0;
    };

    global.saveBatchConfig = function () {
        var actId = batchScope === 'activity' ? getComboboxValue('batch') : '';
        if (batchScope === 'activity' && !actId) { alert('请选择活动'); return; }
        var keys = getMetricKeysForScope(batchScope, actId);
        var scheduled = document.querySelector('input[name="batch-effective"]:checked').value === 'scheduled';
        var usedUids = {};
        var created = 0;

        for (var i = 0; i < batchRows.length; i++) {
            var br = batchRows[i];
            var uid = br.uidMode === 'generate' ? allocateVirtualUid() : (br.uid || '').trim();
            if (br.uidMode !== 'generate' && !uid) { alert('第 ' + (i + 1) + ' 行：请填写虚拟 UID 或选择保存时生成'); return; }
            if (isRealUser(uid)) { alert('第 ' + (i + 1) + ' 行：UID ' + uid + ' 为真实用户，不可配置'); return; }
            if (usedUids[uid]) { alert('第 ' + (i + 1) + ' 行：UID 与本批次重复'); return; }
            usedUids[uid] = 1;
            var err = validateVirtualUid(uid, false);
            if (err && err.indexOf('已有生效') >= 0) { alert('第 ' + (i + 1) + ' 行：' + err); return; }

            var metrics = {};
            keys.forEach(function (key) { metrics[key] = br[key] != null ? br[key] : 0; });
            nextId += 1;
            configRows.unshift(buildRowFromBatch(nextId, uid, batchScope, actId, keys, metrics, scheduled));
            created += 1;
        }

        alert('已成功批量创建 ' + created + ' 条虚拟用户配置');
        filteredRows = configRows.slice();
        global.showListPage();
        renderTable();
    };

    function buildRowFromBatch(id, uid, scope, actId, keys, metrics, scheduled) {
        var effDate = document.getElementById('batch-effective-date').value;
        var meta = actId ? ACTIVITY_META[actId] : null;
        var row = {
            id: id, uid: uid, wallet: '0xVirt' + uid.slice(-4) + '...' + uid.slice(-2), isVirtual: true,
            scopeType: scope, activityId: actId || '', activityName: meta ? meta.name : '',
            dimensions: keys.slice(), status: scheduled ? 'pending' : 'active',
            dataTime: scheduled ? '—' : nowStr(),
            effectiveAt: scheduled ? effDate + ' 00:00' : '立即生效',
            pnl: null, roi: null, volume: null
        };
        applyMetricsToRow(row, keys, metrics);
        return row;
    }

    /* ---------- Activity combobox ---------- */
    function mountActivityCombobox(containerId, prefix, selectedId, onChange) {
        var container = document.getElementById(containerId);
        container.innerHTML =
            '<button type="button" id="' + prefix + '-act-trigger" class="w-full border border-slate-200 rounded p-2.5 text-left font-bold bg-violet-50 outline-none flex items-center justify-between gap-2">' +
            '<span id="' + prefix + '-act-label" class="truncate text-slate-500 font-bold">搜索并选择活动…</span><span class="text-slate-400">▾</span></button>' +
            '<div id="' + prefix + '-act-panel" class="activity-combobox-panel hidden">' +
            '<div class="p-2 border-b bg-slate-50"><input id="' + prefix + '-act-search" type="text" placeholder="搜索活动名称…" class="search-input w-full bg-white"></div>' +
            '<div id="' + prefix + '-act-options" class="max-h-44 overflow-y-auto py-1"></div></div>' +
            '<input type="hidden" id="' + prefix + '-act-value" value="' + (selectedId || '') + '">';
        document.getElementById(prefix + '-act-trigger').onclick = function () { toggleCombobox(prefix); };
        document.getElementById(prefix + '-act-search').oninput = function () { filterComboboxOptions(prefix); };
        if (selectedId) selectComboboxActivity(prefix, selectedId);
        comboboxCallbacks[prefix] = onChange || null;
    }

    var comboboxCallbacks = {};

    function toggleCombobox(prefix) {
        var panel = document.getElementById(prefix + '-act-panel');
        var open = panel.classList.contains('hidden');
        closeAllComboboxes();
        if (open) {
            panel.classList.remove('hidden');
            activeCombobox = prefix;
            document.getElementById(prefix + '-act-search').value = '';
            filterComboboxOptions(prefix);
            document.getElementById(prefix + '-act-search').focus();
        }
    }

    function closeAllComboboxes() {
        ['cfg', 'batch'].forEach(function (p) {
            var panel = document.getElementById(p + '-act-panel');
            if (panel) panel.classList.add('hidden');
        });
        activeCombobox = null;
    }

    function filterComboboxOptions(prefix) {
        var q = (document.getElementById(prefix + '-act-search').value || '').trim().toLowerCase();
        var selected = getComboboxValue(prefix);
        var options = getSelectableActivities().filter(function (a) { return !q || a.name.toLowerCase().indexOf(q) >= 0; });
        var container = document.getElementById(prefix + '-act-options');
        if (!options.length) {
            container.innerHTML = '<p class="px-3 py-4 text-center text-slate-400 text-[10px]">无匹配活动</p>';
            return;
        }
        container.innerHTML = options.map(function (a) {
            return '<button type="button" class="activity-option' + (a.id === selected ? ' selected' : '') + '" data-id="' + a.id + '">' + a.name + '</button>';
        }).join('');
        container.querySelectorAll('.activity-option').forEach(function (btn) {
            btn.onclick = function () { selectComboboxActivity(prefix, btn.getAttribute('data-id')); };
        });
    }

    function selectComboboxActivity(prefix, id) {
        document.getElementById(prefix + '-act-value').value = id;
        document.getElementById(prefix + '-act-label').textContent = ACTIVITY_META[id].name;
        document.getElementById(prefix + '-act-label').classList.remove('text-slate-500');
        document.getElementById(prefix + '-act-label').classList.add('text-violet-700');
        closeAllComboboxes();
        if (comboboxCallbacks[prefix]) comboboxCallbacks[prefix](id);
    }

    function clearCombobox(prefix) {
        var val = document.getElementById(prefix + '-act-value');
        var label = document.getElementById(prefix + '-act-label');
        if (!val) return;
        val.value = '';
        label.textContent = '搜索并选择活动…';
        label.classList.add('text-slate-500');
        label.classList.remove('text-violet-700');
        var ro = prefix === 'cfg' ? document.getElementById('cfg-activity-readonly') : null;
        if (ro) ro.classList.add('hidden');
    }

    function getComboboxValue(prefix) {
        var el = document.getElementById(prefix + '-act-value');
        return el ? el.value : '';
    }

    document.addEventListener('click', function (e) {
        if (!activeCombobox) return;
        var wrap = document.getElementById(activeCombobox === 'cfg' ? 'cfg-activity-combobox' : 'batch-activity-combobox');
        if (wrap && !wrap.contains(e.target)) closeAllComboboxes();
    });

    /* ---------- List ---------- */
    global.onFilterScopeChange = function () {
        var type = document.getElementById('filter-scope-type').value;
        var activityInput = document.getElementById('filter-activity-name');
        activityInput.disabled = type !== 'activity';
        if (type !== 'activity') activityInput.value = '';
    };

    global.resetFilters = function () {
        document.getElementById('filter-address').value = '';
        document.getElementById('filter-scope-type').value = 'all';
        document.getElementById('filter-activity-name').value = '';
        document.getElementById('filter-status').value = 'all';
        global.onFilterScopeChange();
        filteredRows = configRows.slice();
        listPage = 1;
        renderTable();
    };

    global.applyFilters = function () {
        var address = document.getElementById('filter-address').value.trim().toLowerCase();
        var scopeType = document.getElementById('filter-scope-type').value;
        var activityName = document.getElementById('filter-activity-name').value.trim().toLowerCase();
        var status = document.getElementById('filter-status').value;
        filteredRows = configRows.filter(function (row) {
            if (address) {
                var hay = [row.uid, row.wallet].join(' ').toLowerCase();
                if (hay.indexOf(address) === -1) return false;
            }
            if (scopeType !== 'all' && row.scopeType !== scopeType) return false;
            if (scopeType === 'activity' && activityName && (row.activityName || '').toLowerCase().indexOf(activityName) === -1) return false;
            if (status !== 'all' && row.status !== status) return false;
            return true;
        });
        listPage = 1;
        renderTable();
    };

    global.deactivateConfig = function (id) {
        if (!confirm('确认停用？该虚拟用户将从榜单中移除。')) return;
        var row = configRows.find(function (r) { return r.id === id; });
        if (row) row.status = 'offline';
        global.applyFilters();
    };

    function renderUidCell(row) {
        var chip = window.AdminCopyChip ? AdminCopyChip.userIdentity({ uid: row.uid, wallet: row.wallet }) :
            '<span class="font-black block">' + row.uid + '</span><span class="text-[10px] text-slate-400">' + row.wallet + '</span>';
        return chip + '<span class="virtual-badge mt-1 inline-block">虚拟</span>';
    }

    function renderTable() {
        var tbody = document.getElementById('config-table-body');
        var sliced = global.AdminPagination ? global.AdminPagination.slice(filteredRows, listPage) :
            { items: filteredRows, page: 1, total: filteredRows.length };
        listPage = sliced.page;
        document.getElementById('filter-result-hint').textContent = '共 ' + filteredRows.length + ' 条';

        if (!filteredRows.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-slate-400 font-bold">暂无配置</td></tr>';
            if (global.AdminPagination) global.AdminPagination.mount('config-table-pagination', 0, 1, 'config-list');
            return;
        }

        tbody.innerHTML = sliced.items.map(function (row) {
            var metrics = renderMetricsCell(row);
            var dim = row.scopeType === 'activity' && ACTIVITY_META[row.activityId] ?
                ACTIVITY_META[row.activityId].dimensions.join(' / ') : '—';
            var scope = row.scopeType === 'platform' ?
                '<span class="target-badge-platform">全平台</span>' :
                '<span class="target-badge-activity">平台活动</span><p class="text-[10px] font-bold text-violet-700">' + row.activityName + '</p>';
            return '<tr class="hover:bg-slate-50/50"><td class="px-6 py-4">' + renderUidCell(row) + '</td>' +
                '<td class="px-6 py-4">' + scope + '</td>' +
                '<td class="px-6 py-4 text-right space-y-0.5">' + metrics + '</td>' +
                '<td class="px-6 py-4 text-center text-[10px] text-violet-700 font-bold">' + dim + '</td>' +
                '<td class="px-6 py-4 text-center"><span class="status-' + (row.status === 'pending' ? 'pending' : row.status) + '">' + STATUS_LABEL[row.status] + '</span></td>' +
                '<td class="px-6 py-4 text-[10px] text-slate-500"><div>' + row.dataTime + '</div><div class="text-slate-400">' + row.effectiveAt + '</div></td>' +
                '<td class="px-6 py-4 text-right space-x-3">' +
                '<button type="button" data-ranking-action="edit" data-id="' + row.id + '" class="text-blue-600 font-black hover:underline">编辑</button>' +
                (row.status !== 'offline' ? '<button type="button" data-ranking-action="deactivate" data-id="' + row.id + '" class="text-red-500 font-bold hover:underline">停用</button>' : '') +
                '</td></tr>';
        }).join('');
        if (global.AdminPagination) global.AdminPagination.mount('config-table-pagination', sliced.total, listPage, 'config-list');
    }

    function renderMetricsCell(row) {
        var lines = [];
        if (row.dimensions.indexOf('pnl') >= 0 && row.pnl != null) lines.push('<p class="text-green-600 font-black">' + (row.pnl >= 0 ? '+' : '') + formatMoney(row.pnl) + '</p>');
        if (row.dimensions.indexOf('roi') >= 0 && row.roi != null) lines.push('<p class="font-bold">' + row.roi.toFixed(2) + '%</p>');
        if (row.dimensions.indexOf('volume') >= 0 && row.volume != null) lines.push('<p class="text-amber-700 font-bold">' + formatMoney(row.volume) + '</p>');
        return lines.length ? lines.join('') : '—';
    }

    function parseHash() {
        var h = (location.hash || '').replace('#', '');
        if (h === 'batch') global.openBatchPage();
        else if (h === 'new') global.openConfigPage();
        else if (h.indexOf('edit=') === 0) global.openConfigPage(parseInt(h.split('=')[1], 10));
        else global.showListPage();
    }

    document.getElementById('config-uid').addEventListener('blur', function () {
        if (uidMode !== 'manual' || editingId) return;
        var err = validateVirtualUid(this.value.trim(), false);
        var el = document.getElementById('uid-error');
        if (err) { el.textContent = err; el.classList.remove('hidden'); }
        else el.classList.add('hidden');
    });

    function bindRankingUi() {
        var listView = document.getElementById('view-list');
        if (listView) {
            listView.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-ranking-action]');
                if (!btn) return;
                var action = btn.getAttribute('data-ranking-action');
                var id = parseInt(btn.getAttribute('data-id'), 10);
                if (action === 'open-batch') global.openBatchPage();
                else if (action === 'open-config') global.openConfigPage();
                else if (action === 'edit') global.openConfigPage(id);
                else if (action === 'deactivate') global.deactivateConfig(id);
            });
        }
        document.querySelectorAll('[data-ranking-action="back-list"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                global.showListPage();
            });
        });
        var saveSingle = document.querySelector('[data-ranking-action="save-config"]');
        if (saveSingle) saveSingle.addEventListener('click', function () { global.saveSingleConfig(); });
        var saveBatch = document.querySelector('[data-ranking-action="save-batch"]');
        if (saveBatch) saveBatch.addEventListener('click', function () { global.saveBatchConfig(); });
        var addBatchRowBtn = document.querySelector('[data-ranking-action="add-batch-row"]');
        if (addBatchRowBtn) addBatchRowBtn.addEventListener('click', function () { global.addBatchRow(); });
    }

    function bootRankingAdmin() {
        bindRankingUi();
        try {
            renderTable();
        } catch (err) {
            console.error('[RankingAdmin] renderTable failed', err);
        }
        if (global.AdminPagination) {
            global.AdminPagination.register('config-list', function (p) { listPage = p; renderTable(); });
        }
        window.addEventListener('hashchange', parseHash);
        parseHash();
    }

    bootRankingAdmin();

})(window);
