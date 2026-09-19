(function (global) {
    'use strict';

    var draftRows = [];

    function rateToInputPercent(rate) {
        return (Number(rate) * 100).toFixed(4).replace(/\.?0+$/, '');
    }

    function inputPercentToRate(val) {
        var n = Number(val);
        if (!isFinite(n) || n < 0) return NaN;
        return n / 100;
    }

    function loadDraftFromStore() {
        draftRows = global.ForxAdminVipConfig.getVipTierRows().slice().sort(function (a, b) { return a.level - b.level; });
    }

    function renderTable() {
        var tbody = document.getElementById('vip-config-body');
        if (!tbody) return;
        tbody.innerHTML = draftRows.map(function (row) {
            var volDisabled = row.level === 0 ? ' disabled' : '';
            return '<tr data-level="' + row.level + '">' +
                '<td class="px-3 py-3 font-black text-slate-800 whitespace-nowrap">VIP ' + row.level + '</td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="1000" class="vip-field w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="volume14dUsd"' + volDisabled + ' value="' + row.volume14dUsd + '"></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="0.0001" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="taker" value="' + rateToInputPercent(row.taker) + '"><span class="text-[10px] text-slate-400 ml-1">%</span></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="0.0001" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="maker" value="' + rateToInputPercent(row.maker) + '"><span class="text-[10px] text-slate-400 ml-1">%</span></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="1000" class="vip-field w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="dailyMaxWithdrawUsd" value="' + row.dailyMaxWithdrawUsd + '"></td>' +
                '<td class="px-3 py-3"><input type="number" min="0" step="1" class="vip-field w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono" data-field="dailyWithdrawCountAuditThreshold" value="' + row.dailyWithdrawCountAuditThreshold + '"></td>' +
                '<td class="px-3 py-3 text-center"><label class="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" class="vip-field w-4 h-4" data-field="forceManualReview"' + (row.forceManualReview ? ' checked' : '') + '><span class="text-[11px] font-bold text-slate-600">开启</span></label></td>' +
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

    function saveVipConfig() {
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
        draftRows = global.ForxAdminVipConfig.saveVipTierRows(rows);
        renderTable();
        showToast('VIP 配置已保存');
    }

    function resetVipConfigDraft() {
        loadDraftFromStore();
        renderTable();
        showErrors([]);
        showToast('已恢复为上次保存的配置');
    }

    function initVipConfigPage() {
        loadDraftFromStore();
        renderTable();
        var saveBtn = document.getElementById('btn-save-vip-config');
        var resetBtn = document.getElementById('btn-reset-vip-config');
        if (saveBtn) saveBtn.addEventListener('click', saveVipConfig);
        if (resetBtn) resetBtn.addEventListener('click', resetVipConfigDraft);
    }

    global.initVipConfigAdmin = initVipConfigPage;
})(window);
