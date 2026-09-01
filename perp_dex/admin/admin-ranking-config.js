(function (global) {
    'use strict';

    var DIMENSION_KEYS = { '收益金额': 'pnl', '收益率': 'roi', '交易额': 'volume' };
    var DIMENSION_LABELS = {
        pnl: 'PnL (USDT)',
        roi: 'ROI (%)',
        volume: 'Volume (USDT)',
        points: 'Points'
    };

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
        { id: 1, uid: '10088001', wallet: '0x7a8b...C443', isVirtual: true, scopeType: 'platform', activityId: '', activityName: '', dimensions: ['pnl', 'roi', 'volume', 'points'], pnl: 1240000, roi: 124.52, volume: 12800000, points: 98500, dataTime: '2026-08-31 14:20', effectiveAt: '立即生效' },
        { id: 2, uid: '10088002', wallet: '0x3f21...9A12', isVirtual: true, scopeType: 'activity', activityId: 'act-001', activityName: 'ForX嘉年华交易大赛', dimensions: ['volume', 'roi', 'pnl'], pnl: 86420.5, roi: 42.18, volume: 5200000, points: null, dataTime: '2026-08-31 09:00', effectiveAt: '立即生效' },
        { id: 3, uid: '10088003', wallet: '0xAb12...77E0', isVirtual: true, scopeType: 'activity', activityId: 'act-002', activityName: 'BTC 永续交易量冲榜', dimensions: ['volume'], pnl: null, roi: null, volume: 980000, points: null, dataTime: '—', effectiveAt: '2026-09-05 00:00' }
    ];

    (function seedDemoRows() {
        for (var i = 4; i <= 14; i++) {
            var isActivity = i % 2 === 0;
            var actId = isActivity ? 'act-003' : '';
            var meta = actId ? ACTIVITY_META[actId] : null;
            var dims = meta ? meta.dimensions.map(function (d) { return DIMENSION_KEYS[d]; }) : ['pnl', 'roi', 'volume', 'points'];
            configRows.push({
                id: i, uid: '10088' + String(100 + i), wallet: '0xVirt' + String(i).padStart(2, '0') + '...' + (2000 + i), isVirtual: true,
                scopeType: isActivity ? 'activity' : 'platform', activityId: actId, activityName: meta ? meta.name : '',
                dimensions: dims,
                pnl: dims.indexOf('pnl') >= 0 ? i * 12500 : null,
                roi: dims.indexOf('roi') >= 0 ? i * 3.2 : null,
                volume: dims.indexOf('volume') >= 0 ? i * 420000 : null,
                points: dims.indexOf('points') >= 0 ? i * 8500 : null,
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
    var editOriginal = null;
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

    function formatPoints(n) {
        if (n == null) return '—';
        return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    function getMetricKeysForScope(scope, activityId) {
        if (scope === 'platform') return ['pnl', 'roi', 'volume', 'points'];
        var meta = ACTIVITY_META[activityId];
        if (!meta) return [];
        return meta.dimensions.map(function (d) { return DIMENSION_KEYS[d]; });
    }

    var VIEW_IDS = ['view-list', 'view-batch'];

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
        editingId = null;
        editOriginal = null;
        showView('view-list');
        if (location.hash) location.hash = '';
    };

    global.openBatchPage = function (id) {
        editingId = id || null;
        editOriginal = null;
        var titleEl = document.getElementById('batch-page-title');
        var subtitleEl = document.getElementById('batch-page-subtitle');
        if (titleEl) {
            titleEl.textContent = id ? '编辑虚拟用户配置' : '新增虚拟用户配置';
        }
        if (subtitleEl) {
            subtitleEl.textContent = id
                ? '编辑时交易额、积分仅可上调；配置保存后不可停用'
                : '默认 1 条，可添加至最多 10 条；共享榜单范围与生效策略';
        }
        showView('view-batch');
        try {
            initBatchPage(id);
        } catch (err) {
            console.error('[RankingAdmin] initBatchPage failed', err);
        }
        var hash = id ? '#edit=' + id : '#batch';
        if (location.hash !== hash) location.hash = hash;
    };

    function setBatchScopeControlsLocked(locked) {
        var platformBtn = document.getElementById('batch-scope-platform');
        var activityBtn = document.getElementById('batch-scope-activity');
        if (platformBtn) platformBtn.disabled = locked;
        if (activityBtn) activityBtn.disabled = locked;
    }

    function initBatchPage(editId) {
        if (editId) {
            var row = configRows.find(function (r) { return r.id === editId; });
            if (!row) {
                global.showListPage();
                return;
            }
            editOriginal = {
                volume: row.volume != null ? row.volume : 0,
                points: row.points != null ? row.points : 0
            };
            batchScope = row.scopeType;
            batchRows = [{
                uidMode: 'manual',
                uid: row.uid,
                pnl: row.pnl,
                roi: row.roi,
                volume: row.volume,
                points: row.points
            }];
            global.setBatchScope(batchScope, true);
            if (row.activityId) selectComboboxActivity('batch', row.activityId);
            var isScheduled = row.dataTime === '—' && row.effectiveAt !== '立即生效';
            document.querySelector('input[name="batch-effective"][value="now"]').checked = !isScheduled;
            document.querySelector('input[name="batch-effective"][value="scheduled"]').checked = isScheduled;
            if (isScheduled) {
                var datePart = row.effectiveAt.split(' ')[0];
                document.getElementById('batch-effective-date').value = datePart;
            }
            global.onBatchEffectiveChange();
            setBatchScopeControlsLocked(true);
            document.getElementById('btn-add-batch-row').disabled = true;
        } else {
            batchScope = 'platform';
            batchRows = [{ uidMode: 'generate', uid: '' }];
            global.setBatchScope('platform', false);
            document.querySelector('input[name="batch-effective"][value="now"]').checked = true;
            global.onBatchEffectiveChange();
            setBatchScopeControlsLocked(false);
            document.getElementById('btn-add-batch-row').disabled = false;
        }
        renderBatchTable();
    }

    global.setBatchScope = function (scope, skipRender) {
        batchScope = scope;
        document.getElementById('batch-scope-platform').classList.toggle('active', scope === 'platform');
        document.getElementById('batch-scope-activity').classList.toggle('active', scope === 'activity');
        document.getElementById('batch-activity-wrap').classList.toggle('hidden', scope !== 'activity');
        if (scope === 'activity') mountActivityCombobox('batch-activity-combobox', 'batch', '', function () { if (!skipRender) renderBatchTable(); });
        else { clearCombobox('batch'); if (!skipRender) renderBatchTable(); }
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
        if (editingId || batchRows.length >= 10) return;
        batchRows.push({ uidMode: 'generate', uid: '' });
        renderBatchTable();
    };

    global.removeBatchRow = function (idx) {
        if (editingId || batchRows.length <= 1) return;
        batchRows.splice(idx, 1);
        renderBatchTable();
    };

    global.setBatchRowUidMode = function (idx, mode) {
        if (editingId) return;
        batchRows[idx].uidMode = mode;
        if (mode === 'generate') batchRows[idx].uid = '';
        renderBatchTable();
    };

    global.updateBatchRowUid = function (idx, val) {
        if (editingId) return;
        batchRows[idx].uid = val;
    };

    function getMonotonicMin(key) {
        if (!editingId || !editOriginal) return null;
        if (key === 'volume' || key === 'points') return editOriginal[key];
        return null;
    }

    function clampMonotonicMetric(key, val) {
        var min = getMonotonicMin(key);
        if (min != null && val < min) return min;
        return val;
    }

    function renderBatchTable() {
        var actId = batchScope === 'activity' ? getComboboxValue('batch') : '';
        var keys = getMetricKeysForScope(batchScope, actId);
        document.getElementById('batch-count-hint').textContent = batchRows.length + ' / 10 条';
        if (!editingId) document.getElementById('btn-add-batch-row').disabled = batchRows.length >= 10;

        var head = '<th class="px-4 py-3 w-10">#</th><th class="px-4 py-3 min-w-[200px]">虚拟 UID</th>';
        keys.forEach(function (key) {
            var hint = (editingId && (key === 'volume' || key === 'points')) ? ' <span class="text-amber-600">↑</span>' : '';
            head += '<th class="px-4 py-3">' + DIMENSION_LABELS[key] + hint + '</th>';
        });
        if (!editingId) head += '<th class="px-4 py-3 w-16"></th>';
        document.getElementById('batch-table-head').innerHTML = head;

        if (batchScope === 'activity' && !actId) {
            document.getElementById('batch-table-body').innerHTML =
                '<tr><td colspan="' + (keys.length + (editingId ? 2 : 3)) + '" class="px-6 py-8 text-center text-slate-400">请先选择活动</td></tr>';
            return;
        }

        document.getElementById('batch-table-body').innerHTML = batchRows.map(function (row, idx) {
            var uidCell;
            if (editingId) {
                uidCell = '<span class="font-black">' + row.uid + '</span><p class="text-[9px] text-slate-400 italic">编辑态不可修改 UID</p>';
            } else if (row.uidMode === 'generate') {
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
                var minAttr = '';
                var step = key === 'points' ? '1' : '0.01';
                if (editingId && (key === 'volume' || key === 'points')) {
                    var minVal = getMonotonicMin(key);
                    if (minVal != null) minAttr = ' min="' + minVal + '"';
                }
                return '<td class="px-4 py-3"><input type="number" step="' + step + '" value="' + val + '"' + minAttr +
                    ' class="search-input" data-batch-idx="' + idx + '" data-metric="' + key + '" onchange="updateBatchMetric(this)"></td>';
            }).join('');
            var deleteCell = editingId ? '' :
                '<td class="px-4 py-3"><button type="button" onclick="removeBatchRow(' + idx + ')" class="text-red-500 font-bold' +
                (batchRows.length <= 1 ? ' opacity-30' : '') + '"' + (batchRows.length <= 1 ? ' disabled' : '') + '>删除</button></td>';
            return '<tr><td class="px-4 py-3 font-black text-slate-400">' + (idx + 1) + '</td><td class="px-4 py-3">' + uidCell + '</td>' +
                metricCells + deleteCell + '</tr>';
        }).join('');
    }

    global.updateBatchMetric = function (el) {
        var idx = parseInt(el.getAttribute('data-batch-idx'), 10);
        var key = el.getAttribute('data-metric');
        var val = key === 'points' ? parseInt(el.value, 10) || 0 : parseFloat(el.value) || 0;
        val = clampMonotonicMetric(key, val);
        if (val !== parseFloat(el.value)) {
            el.value = val;
        }
        batchRows[idx][key] = val;
    };

    function validateVirtualUid(uid) {
        if (!uid) return '请填写虚拟用户 UID 或选择「保存时生成」';
        if (isRealUser(uid)) return 'UID ' + uid + ' 为真实注册用户，不可配置排行榜数据';
        var dup = configRows.find(function (r) { return r.uid === uid && r.id !== editingId; });
        if (dup) return '虚拟 UID ' + uid + ' 已有配置';
        return null;
    }

    function validateMonotonicMetrics(metrics, keys, rowNum) {
        if (!editingId || !editOriginal) return null;
        if (keys.indexOf('volume') >= 0 && metrics.volume < editOriginal.volume) {
            return '第 ' + rowNum + ' 行：交易额不可低于原值 ' + editOriginal.volume;
        }
        if (keys.indexOf('points') >= 0 && metrics.points < editOriginal.points) {
            return '第 ' + rowNum + ' 行：积分不可低于原值 ' + editOriginal.points;
        }
        return null;
    }

    global.saveBatchConfig = function () {
        var actId = batchScope === 'activity' ? getComboboxValue('batch') : '';
        if (batchScope === 'activity' && !actId) { alert('请选择活动'); return; }
        var keys = getMetricKeysForScope(batchScope, actId);
        var scheduled = document.querySelector('input[name="batch-effective"]:checked').value === 'scheduled';
        var effDate = document.getElementById('batch-effective-date').value;

        if (editingId) {
            var existing = configRows.find(function (r) { return r.id === editingId; });
            if (!existing) { alert('配置不存在'); return; }
            var br = batchRows[0];
            var metrics = {};
            keys.forEach(function (key) { metrics[key] = br[key] != null ? br[key] : 0; });
            var monoErr = validateMonotonicMetrics(metrics, keys, 1);
            if (monoErr) { alert(monoErr); return; }
            applyMetricsToRow(existing, keys, metrics);
            existing.effectiveAt = scheduled ? effDate + ' 00:00' : '立即生效';
            existing.dataTime = scheduled ? '—' : nowStr();
            alert('配置已更新；数据将按写入时间参与 7D / 30D 排行榜统计');
        } else {
            var usedUids = {};
            var created = 0;

            for (var i = 0; i < batchRows.length; i++) {
                var row = batchRows[i];
                var uid = row.uidMode === 'generate' ? allocateVirtualUid() : (row.uid || '').trim();
                if (row.uidMode !== 'generate' && !uid) { alert('第 ' + (i + 1) + ' 行：请填写虚拟 UID 或选择保存时生成'); return; }
                if (isRealUser(uid)) { alert('第 ' + (i + 1) + ' 行：UID ' + uid + ' 为真实用户，不可配置'); return; }
                if (usedUids[uid]) { alert('第 ' + (i + 1) + ' 行：UID 与本批次重复'); return; }
                var err = validateVirtualUid(uid);
                if (err) { alert('第 ' + (i + 1) + ' 行：' + err); return; }

                var metrics = {};
                keys.forEach(function (key) { metrics[key] = row[key] != null ? row[key] : 0; });
                nextId += 1;
                configRows.unshift(buildRowFromBatch(nextId, uid, batchScope, actId, keys, metrics, scheduled, effDate));
                created += 1;
            }

            alert('已成功创建 ' + created + ' 条虚拟用户配置');
        }

        filteredRows = configRows.slice();
        global.showListPage();
        renderTable();
    };

    function nowStr() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function applyMetricsToRow(row, keys, metrics) {
        row.pnl = keys.indexOf('pnl') >= 0 ? metrics.pnl : null;
        row.roi = keys.indexOf('roi') >= 0 ? metrics.roi : null;
        row.volume = keys.indexOf('volume') >= 0 ? metrics.volume : null;
        row.points = keys.indexOf('points') >= 0 ? metrics.points : null;
    }

    function buildRowFromBatch(id, uid, scope, actId, keys, metrics, scheduled, effDate) {
        var meta = actId ? ACTIVITY_META[actId] : null;
        var row = {
            id: id, uid: uid, wallet: '0xVirt' + uid.slice(-4) + '...' + uid.slice(-2), isVirtual: true,
            scopeType: scope, activityId: actId || '', activityName: meta ? meta.name : '',
            dimensions: keys.slice(),
            dataTime: scheduled ? '—' : nowStr(),
            effectiveAt: scheduled ? effDate + ' 00:00' : '立即生效',
            pnl: null, roi: null, volume: null, points: null
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
        var trigger = document.getElementById(prefix + '-act-trigger');
        if (trigger) trigger.onclick = function () { if (!editingId) toggleCombobox(prefix); };
        document.getElementById(prefix + '-act-search').oninput = function () { filterComboboxOptions(prefix); };
        if (selectedId) selectComboboxActivity(prefix, selectedId);
        comboboxCallbacks[prefix] = onChange || null;
        if (editingId && trigger) trigger.disabled = true;
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
        var panel = document.getElementById('batch-act-panel');
        if (panel) panel.classList.add('hidden');
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
    }

    function getComboboxValue(prefix) {
        var el = document.getElementById(prefix + '-act-value');
        return el ? el.value : '';
    }

    document.addEventListener('click', function (e) {
        if (!activeCombobox) return;
        var wrap = document.getElementById('batch-activity-combobox');
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
        global.onFilterScopeChange();
        filteredRows = configRows.slice();
        listPage = 1;
        renderTable();
    };

    global.applyFilters = function () {
        var address = document.getElementById('filter-address').value.trim().toLowerCase();
        var scopeType = document.getElementById('filter-scope-type').value;
        var activityName = document.getElementById('filter-activity-name').value.trim().toLowerCase();
        filteredRows = configRows.filter(function (row) {
            if (address) {
                var hay = [row.uid, row.wallet].join(' ').toLowerCase();
                if (hay.indexOf(address) === -1) return false;
            }
            if (scopeType !== 'all' && row.scopeType !== scopeType) return false;
            if (scopeType === 'activity' && activityName && (row.activityName || '').toLowerCase().indexOf(activityName) === -1) return false;
            return true;
        });
        listPage = 1;
        renderTable();
    };

    function renderUidCell(row) {
        var chip = global.AdminCopyChip ? global.AdminCopyChip.userIdentity({ uid: row.uid, wallet: row.wallet }) :
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
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400 font-bold">暂无配置</td></tr>';
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
                '<td class="px-6 py-4 text-[10px] text-slate-500"><div>' + row.dataTime + '</div><div class="text-slate-400">' + row.effectiveAt + '</div></td>' +
                '<td class="px-6 py-4 text-right">' +
                '<button type="button" data-ranking-action="edit" data-id="' + row.id + '" class="text-blue-600 font-black hover:underline">编辑</button>' +
                '</td></tr>';
        }).join('');
        if (global.AdminPagination) global.AdminPagination.mount('config-table-pagination', sliced.total, listPage, 'config-list');
    }

    function renderMetricsCell(row) {
        var lines = [];
        if (row.dimensions.indexOf('pnl') >= 0 && row.pnl != null) lines.push('<p class="text-green-600 font-black">' + (row.pnl >= 0 ? '+' : '') + formatMoney(row.pnl) + '</p>');
        if (row.dimensions.indexOf('roi') >= 0 && row.roi != null) lines.push('<p class="font-bold">' + row.roi.toFixed(2) + '%</p>');
        if (row.dimensions.indexOf('volume') >= 0 && row.volume != null) lines.push('<p class="text-amber-700 font-bold">' + formatMoney(row.volume) + '</p>');
        if (row.dimensions.indexOf('points') >= 0 && row.points != null) lines.push('<p class="text-slate-700 font-bold">' + formatPoints(row.points) + ' pts</p>');
        return lines.length ? lines.join('') : '—';
    }

    function parseHash() {
        var h = (location.hash || '').replace('#', '');
        if (h === 'batch') global.openBatchPage();
        else if (h.indexOf('edit=') === 0) global.openBatchPage(parseInt(h.split('=')[1], 10));
        else global.showListPage();
    }

    function bindRankingUi() {
        var listView = document.getElementById('view-list');
        if (listView) {
            listView.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-ranking-action]');
                if (!btn) return;
                var action = btn.getAttribute('data-ranking-action');
                var id = parseInt(btn.getAttribute('data-id'), 10);
                if (action === 'open-batch') global.openBatchPage();
                else if (action === 'edit') global.openBatchPage(id);
            });
        }
        document.querySelectorAll('[data-ranking-action="back-list"]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                global.showListPage();
            });
        });
        var saveBatch = document.querySelector('[data-ranking-action="save-batch"]');
        if (saveBatch) saveBatch.addEventListener('click', function () { global.saveBatchConfig(); });
        var addBatchRowBtn = document.querySelector('[data-ranking-action="add-batch-row"]');
        if (addBatchRowBtn) addBatchRowBtn.addEventListener('click', function () { global.addBatchRow(); });
    }

    global.refreshRankingAdminList = function () {
        try {
            renderTable();
        } catch (err) {
            console.error('[RankingAdmin] refreshRankingAdminList failed', err);
        }
    };

    function bootRankingAdmin() {
        bindRankingUi();
        global.refreshRankingAdminList();
        if (global.AdminPagination) {
            global.AdminPagination.register('config-list', function (p) { listPage = p; renderTable(); });
        }
        global.addEventListener('hashchange', parseHash);
        parseHash();
    }

    bootRankingAdmin();

})(window);
