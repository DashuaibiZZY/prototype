/**
 * 活动信息选择器：关联平台活动 / 自定义活动名称
 */
(function () {
    const PLATFORM_ACTIVITIES = [
        { id: 'ACT202605001', name: 'ForX嘉年华交易大赛' },
        { id: 'ACT202605002', name: '新手成长任务' },
        { id: 'ACT202605003', name: '合约交易争霸赛' },
        { id: 'ACT202605004', name: '每日交易福利' },
        { id: 'ACT202605005', name: '现货交易挑战赛' }
    ];

    function injectPickerStyles() {
        if (document.getElementById('activity-picker-styles')) return;
        const style = document.createElement('style');
        style.id = 'activity-picker-styles';
        style.textContent = [
            '.act-mode-tab{padding:5px 12px;font-size:11px;font-weight:700;border-radius:6px;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#64748b}',
            '.act-mode-tab.active{background:#0f172a;color:#fff;border-color:#0f172a}',
            '.act-picker-box{padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}'
        ].join('');
        document.head.appendChild(style);
    }

    window.getPlatformActivities = function () {
        return PLATFORM_ACTIVITIES.slice();
    };

    window.mountActivityPicker = function (mountId, options) {
        options = options || {};
        const el = document.getElementById(mountId);
        if (!el) return;
        injectPickerStyles();
        const prefix = options.prefix || mountId;
        const defaultMode = options.defaultMode || 'platform';

        let optsHtml = '<option value="">— 请选择平台活动 —</option>';
        PLATFORM_ACTIVITIES.forEach(function (a) {
            optsHtml += '<option value="' + a.id + '">' + a.id + ' · ' + a.name + '</option>';
        });

        el.innerHTML =
            '<div class="act-picker-box space-y-3">' +
            '<label class="block text-xs font-bold text-slate-500 uppercase">活动信息（写入流水 / 发奖关联）</label>' +
            '<div class="flex gap-2">' +
            '<button type="button" class="act-mode-tab' + (defaultMode === 'platform' ? ' active' : '') + '" data-prefix="' + prefix + '" data-mode="platform" onclick="switchActivityMode(\'' + prefix + '\',\'platform\')">关联平台活动</button>' +
            '<button type="button" class="act-mode-tab' + (defaultMode === 'custom' ? ' active' : '') + '" data-prefix="' + prefix + '" data-mode="custom" onclick="switchActivityMode(\'' + prefix + '\',\'custom\')">自定义活动名称</button>' +
            '</div>' +
            '<div id="' + prefix + '-platform-panel"' + (defaultMode === 'custom' ? ' class="hidden"' : '') + '>' +
            '<select id="' + prefix + '-platform-select" class="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white outline-none">' + optsHtml + '</select>' +
            '<p class="text-[10px] text-slate-400 mt-1">来自活动上架服务，选中后对应平台活动发奖记录。</p>' +
            '</div>' +
            '<div id="' + prefix + '-custom-panel"' + (defaultMode === 'platform' ? ' class="hidden"' : '') + '>' +
            '<input id="' + prefix + '-custom-input" type="text" placeholder="例如：线下 KOL 合作补发" class="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none">' +
            '<p class="text-[10px] text-slate-400 mt-1">非平台活动场景，仅写入流水备注。</p>' +
            '</div></div>';

        if (options.defaultActivityId) {
            const sel = document.getElementById(prefix + '-platform-select');
            if (sel) sel.value = options.defaultActivityId;
        }
        if (options.defaultCustomName) {
            const inp = document.getElementById(prefix + '-custom-input');
            if (inp) inp.value = options.defaultCustomName;
        }
    };

    window.switchActivityMode = function (prefix, mode) {
        document.querySelectorAll('[data-prefix="' + prefix + '"].act-mode-tab').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        document.getElementById(prefix + '-platform-panel').classList.toggle('hidden', mode !== 'platform');
        document.getElementById(prefix + '-custom-panel').classList.toggle('hidden', mode !== 'custom');
    };

    window.getActivityPickerValue = function (prefix) {
        const platformPanel = document.getElementById(prefix + '-platform-panel');
        const isPlatform = platformPanel && !platformPanel.classList.contains('hidden');
        if (isPlatform) {
            const sel = document.getElementById(prefix + '-platform-select');
            const id = sel ? sel.value : '';
            if (!id) return { valid: false, message: '请选择平台活动' };
            const act = PLATFORM_ACTIVITIES.find(function (a) { return a.id === id; });
            return {
                valid: true,
                activityMode: 'platform',
                activityId: id,
                activityName: act ? act.name : id,
                displayLabel: id + ' · ' + (act ? act.name : '')
            };
        }
        const inp = document.getElementById(prefix + '-custom-input');
        const name = inp ? inp.value.trim() : '';
        if (!name) return { valid: false, message: '请填写自定义活动名称' };
        return {
            valid: true,
            activityMode: 'custom',
            activityId: null,
            activityName: name,
            displayLabel: name + '（自定义）'
        };
    };
})();
