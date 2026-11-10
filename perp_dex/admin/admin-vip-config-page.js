(function (global) {
    'use strict';

    var draftRows = [];
    var savedRows = [];
    var savedMaxLevel = 0;
    var pendingConfirmAfter = null;

    function rateToInputPercent(rate) {
        return (Number(rate) * 100).toFixed(4).replace(/\.?0+$/, '');
    }

    function inputPercentToRate(val) {
        var n = Number(val);
        if (!isFinite(n) || n < 0) return NaN;
        return n / 100;
    }

    function loadSavedFromStore() {
        savedRows = global.ForxAdminVipConfig.getVipTierRows().slice().sort(function (a, b) { return a.level - b.level; });
        savedMaxLevel = savedRows.length ? savedRows[savedRows.length - 1].level : 0;
        draftRows = JSON.parse(JSON.stringify(savedRows));
    }

    function getVipTierPendingApproval() {
        var fromApps = typeof global.getPendingApprovalByType === 'function'
            ? global.getPendingApprovalByType('vip_tier_config') : null;
        var fromLocal = typeof global.getVipTierConfigPendingLocal === 'function'
            ? global.getVipTierConfigPendingLocal() : null;
        if (fromApps) {
            if (!fromLocal || fromLocal.id !== fromApps.id) {
                if (typeof global.setVipTierConfigPending === 'function') {
                    global.setVipTierConfigPending({ id: fromApps.id, status: fromApps.status });
                }
            }
            return fromApps;
        }
        if (fromLocal && typeof global.clearVipTierConfigPending === 'function') {
            global.clearVipTierConfigPending();
        }
        return null;
    }

    function setFormDisabled(disabled) {
        var card = document.getElementById('vip-config-card');
        if (!card) return;
        card.querySelectorAll('input, select, textarea, button').forEach(function (el) {
            if (el.id === 'btn-open-vip-save-confirm') return;
            if (el.id === 'btn-add-vip-tier') return;
            el.disabled = disabled;
        });
        var addBtn = document.getElementById('btn-add-vip-tier');
        if (addBtn) {
            addBtn.disabled = disabled;
            addBtn.classList.toggle('opacity-40', disabled);
            addBtn.classList.toggle('cursor-not-allowed', disabled);
        }
        var saveBtn = document.getElementById('btn-open-vip-save-confirm');
        if (saveBtn) {
            saveBtn.disabled = disabled;
            saveBtn.classList.toggle('opacity-40', disabled);
            saveBtn.classList.toggle('cursor-not-allowed', disabled);
        }
        card.classList.toggle('opacity-60', disabled);
    }

    function renderAdminUI() {
        var pending = getVipTierPendingApproval();
        var banner = document.getElementById('vip-config-pending-banner');
        if (banner) {
            if (pending) {
                banner.classList.remove('hidden');
                var statusLabel = typeof global.getApprovalStatusLabel === 'function'
                    ? global.getApprovalStatusLabel(pending.status) : pending.status;
                banner.innerHTML = '当前有 VIP 配置审批单 <b>' + (pending.id || '—') + '</b> 审批中（' + statusLabel +
                    '），暂无法修改。审批通过或驳回后可继续编辑。<a href="用户费率设置.html#approval" class="text-blue-700 font-bold underline ml-1">前往费率审批</a>';
            } else {
                banner.classList.add('hidden');
                banner.innerHTML = '';
            }
        }
        setFormDisabled(!!pending);
        renderTable();
    }

    global.applySavedVipTierConfig = function () {
        loadSavedFromStore();
        renderAdminUI();
    };

    global.renderVipConfigAdminUI = renderAdminUI;

    function renderTable() {
        var tbody = document.getElementById('vip-config-body');
        if (!tbody) return;
        var pending = getVipTierPendingApproval();
        tbody.innerHTML = draftRows.map(function (row) {
            var volDisabled = row.level === 0 ? ' disabled' : '';
            var canRemove = !pending && row.level > savedMaxLevel;
            var removeCell = canRemove
                ? '<button type="button" class="text-red-600 font-bold text-[10px]" data-action="remove-vip-tier" data-level="' + row.level + '">移除</button>'
                : '<span class="text-[10px] text-slate-300">—</span>';
            return '<tr data-level="' + row.level + '">' +
                '<td class="px-3 py-3 font-black text-slate-800 whitespace-nowrap">VIP ' + row.level + '</td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="1000" class="vip-field w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="volume14dUsd"' + volDisabled + ' value="' + row.volume14dUsd + '"></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="0.0001" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="taker" value="' + rateToInputPercent(row.taker) + '"><span class="text-[10px] text-slate-400 ml-1">%</span></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="0.0001" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="maker" value="' + rateToInputPercent(row.maker) + '"><span class="text-[10px] text-slate-400 ml-1">%</span></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="100" class="vip-field w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="dailyMaxWithdrawUsd" value="' + row.dailyMaxWithdrawUsd + '"></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="1" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="dailyWithdrawCountAuditThreshold" value="' + row.dailyWithdrawCountAuditThreshold + '"></td>' +
                '<td class="px-3 py-3 text-center"><label class="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" class="vip-field w-4 h-4" data-field="forceManualReview"' + (row.forceManualReview ? ' checked' : '') + '><span class="text-[11px] font-bold text-slate-600">开启</span></label></td>' +
                '<td class="px-3 py-3 text-center">' + removeCell + '</td>' +
                '</tr>';
        }).join('');
    }

    function readDraftFromDom() {
        var rows = [];
        document.querySelectorAll('#vip-config-body tr[data-level]').forEach(function (tr) {
            var level = Number(tr.getAttribute('data-level'));
            function val(field) {
                var el = tr.querySelector('[data-field="' + field + '"]');
                if (!el) return 0;
                if (el.type === 'checkbox') return el.checked;
                return el.value;
            }
            rows.push({
                level: level,
                volume14dUsd: level === 0 ? 0 : Number(val('volume14dUsd')),
                taker: inputPercentToRate(val('taker')),
                maker: inputPercentToRate(val('maker')),
                dailyMaxWithdrawUsd: Number(val('dailyMaxWithdrawUsd')),
                dailyWithdrawCountAuditThreshold: Number(val('dailyWithdrawCountAuditThreshold')),
                forceManualReview: !!val('forceManualReview')
            });
        });
        return rows.slice().sort(function (a, b) { return a.level - b.level; });
    }

    function showToast(msg) {
        var el = document.getElementById('vip-config-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () { el.classList.add('hidden'); }, 2800);
    }

    function showErrors(errors) {
        var box = document.getElementById('vip-config-errors');
        if (!box) return;
        if (!errors.length) {
            box.classList.add('hidden');
            box.innerHTML = '';
            return;
        }
        box.classList.remove('hidden');
        box.innerHTML = '<ul class="list-disc pl-5 space-y-1">' + errors.map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul>';
    }

    function addVipTierRow() {
        if (getVipTierPendingApproval()) return;
        draftRows = readDraftFromDom();
        var maxLevel = draftRows.length ? draftRows[draftRows.length - 1].level : 0;
        var prev = draftRows[draftRows.length - 1];
        var nextLevel = maxLevel + 1;
        draftRows.push({
            level: nextLevel,
            volume14dUsd: prev ? Math.max(prev.volume14dUsd * 2, prev.volume14dUsd + 1) : 1000000,
            taker: prev ? Math.max(prev.taker * 0.9, 0) : 0.0004,
            maker: prev ? Math.max(prev.maker * 0.9, 0) : 0.00012,
            dailyMaxWithdrawUsd: prev ? prev.dailyMaxWithdrawUsd * 2 : 10000,
            dailyWithdrawCountAuditThreshold: prev ? prev.dailyWithdrawCountAuditThreshold + 2 : 8,
            forceManualReview: false
        });
        renderTable();
    }

    function removeDraftTier(level) {
        if (getVipTierPendingApproval()) return;
        if (level <= savedMaxLevel) {
            alert('已生效的 VIP 等级不可删除');
            return;
        }
        draftRows = readDraftFromDom().filter(function (r) { return r.level !== level; });
        renderTable();
    }

    function openSaveConfirmModal() {
        if (getVipTierPendingApproval()) {
            alert('当前有 VIP 配置审批单审批中，请等待处理完成后再提交');
            return;
        }
        var rows = readDraftFromDom();
        var invalidRate = rows.some(function (r) { return !isFinite(r.taker) || !isFinite(r.maker); });
        if (invalidRate) {
            showErrors(['Taker / Maker 费率须为非负数字（单位：%）']);
            return;
        }
        var result = global.ForxAdminVipConfig.validateVipTierRows(rows);
        if (!result.ok) {
            showErrors(result.errors);
            return;
        }
        showErrors([]);
        var remarkEl = document.getElementById('vip-config-remark');
        var remark = remarkEl ? remarkEl.value.trim() : '';
        if (!remark) {
            alert('请填写申请备注');
            return;
        }
        var changes = global.ForxAdminVipConfig.buildVipTierConfigChanges(savedRows, rows);
        if (!changes.length) {
            alert('配置未发生变更，无需提交审批');
            return;
        }
        pendingConfirmAfter = rows;
        document.getElementById('vipConfirmChangeCount').textContent = changes.length + ' 项';
        document.getElementById('vipConfirmDiffBody').innerHTML = changes.map(function (c) {
            return '<tr><td class="px-4 py-2 text-slate-700">' + c.field + '</td><td class="px-4 py-2 text-slate-400">' + c.before + '</td><td class="px-4 py-2 text-blue-700 font-bold">' + c.after + '</td></tr>';
        }).join('');
        if (typeof global.renderApprovalFlow === 'function') {
            document.getElementById('vipConfigApprovalFlow').innerHTML = global.renderApprovalFlow('draft', true, 'risk_boss');
        }
        document.getElementById('modal-vip-config-confirm').classList.remove('hidden');
    }

    function closeSaveConfirmModal() {
        document.getElementById('modal-vip-config-confirm').classList.add('hidden');
        pendingConfirmAfter = null;
    }

    function submitVipConfigApproval() {
        if (!pendingConfirmAfter) return;
        var remarkEl = document.getElementById('vip-config-remark');
        var remark = remarkEl ? remarkEl.value.trim() : '';
        var before = savedRows;
        var after = pendingConfirmAfter;
        var changes = global.ForxAdminVipConfig.buildVipTierConfigChanges(before, after);
        var summary = 'VIP 阶梯 ' + before.length + ' → ' + after.length + ' 档 · ' + changes.length + ' 项变更';
        if (typeof global.submitApprovalApplication !== 'function') {
            alert('审批模块未加载');
            return;
        }
        var created = global.submitApprovalApplication({
            type: 'vip_tier_config',
            title: 'VIP 配置',
            summary: summary,
            applicant: 'Fee_Admin',
            remark: remark,
            payload: {
                before: { tiers: before },
                after: { tiers: after },
                changes: changes
            },
            onSubmit: function (app) {
                if (typeof global.setVipTierConfigPending === 'function') {
                    global.setVipTierConfigPending({ id: app.id, status: app.status });
                }
                renderAdminUI();
            }
        });
        closeSaveConfirmModal();
        showToast('已提交审批 ' + (created && created.id ? created.id : ''));
    }

    function resetVipConfigDraft() {
        if (getVipTierPendingApproval()) return;
        loadSavedFromStore();
        renderTable();
        showErrors([]);
        showToast('已恢复为当前生效配置');
    }

    function initVipConfigPage() {
        loadSavedFromStore();
        renderAdminUI();
        document.getElementById('btn-open-vip-save-confirm').addEventListener('click', openSaveConfirmModal);
        document.getElementById('btn-reset-vip-config').addEventListener('click', resetVipConfigDraft);
        document.getElementById('btn-add-vip-tier').addEventListener('click', addVipTierRow);
        document.getElementById('btn-vip-confirm-cancel').addEventListener('click', closeSaveConfirmModal);
        document.getElementById('btn-vip-confirm-submit').addEventListener('click', submitVipConfigApproval);
        document.getElementById('vip-config-body').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-action="remove-vip-tier"]');
            if (!btn) return;
            removeDraftTier(Number(btn.getAttribute('data-level')));
        });
    }

    global.initVipConfigAdmin = initVipConfigPage;
    global.closeVipConfigConfirmModal = closeSaveConfirmModal;
})(window);
