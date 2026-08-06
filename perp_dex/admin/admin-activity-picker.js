/**
 * 活动信息选择器：关联平台活动 / 自定义活动名称（含奖励名称多语言）
 */
(function () {
    const PLATFORM_ACTIVITIES = [
        { id: 'ACT202605001', name: 'ForX嘉年华交易大赛' },
        { id: 'ACT202605002', name: '新手成长任务' },
        { id: 'ACT202605003', name: '合约交易争霸赛' },
        { id: 'ACT202605004', name: '每日交易福利' },
        { id: 'ACT202605005', name: '现货交易挑战赛' }
    ];

    const REWARD_LANGS = [
        { key: 'zh-CN', label: '简体中文' },
        { key: 'zh-TW', label: '繁体中文' },
        { key: 'en', label: '英文' },
        { key: 'ja', label: '日本语' }
    ];

    function injectPickerStyles() {
        if (document.getElementById('activity-picker-styles')) return;
        const style = document.createElement('style');
        style.id = 'activity-picker-styles';
        style.textContent = [
            '.act-mode-tab{padding:5px 12px;font-size:11px;font-weight:700;border-radius:6px;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#64748b}',
            '.act-mode-tab.active{background:#0f172a;color:#fff;border-color:#0f172a}',
            '.act-picker-box{padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}',
            '.act-lang-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
            '.act-lang-field label{display:block;font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px}',
            '.act-lang-field input{width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;font-size:12px;outline:none;background:#fff}'
        ].join('');
        document.head.appendChild(style);
    }

    function buildCustomLangFields(prefix) {
        return REWARD_LANGS.map(function (lang) {
            return '<div class="act-lang-field"><label>' + lang.label + ' · 奖励名称</label>' +
                '<input id="' + prefix + '-reward-' + lang.key + '" type="text" placeholder="用户端奖励记录展示名称"></div>';
        }).join('');
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
            '<p class="text-[10px] text-slate-400 mt-1">来自活动上架服务；奖励名称取活动多语言配置，写入用户端「奖励记录」。</p>' +
            '</div>' +
            '<div id="' + prefix + '-custom-panel"' + (defaultMode === 'platform' ? ' class="hidden"' : '') + '>' +
            '<p class="text-[10px] font-bold text-slate-500 uppercase mb-2">奖励名称（多语言，必填）</p>' +
            '<div class="act-lang-grid">' + buildCustomLangFields(prefix) + '</div>' +
            '<p class="text-[10px] text-slate-400 mt-2">自定义发放场景须配置四种语言，用户端「奖励记录」按当前语言展示对应奖励名称。</p>' +
            '</div></div>';

        if (options.defaultActivityId) {
            const sel = document.getElementById(prefix + '-platform-select');
            if (sel) sel.value = options.defaultActivityId;
        }
        if (options.defaultRewardNames) {
            REWARD_LANGS.forEach(function (lang) {
                const inp = document.getElementById(prefix + '-reward-' + lang.key);
                if (inp && options.defaultRewardNames[lang.key]) inp.value = options.defaultRewardNames[lang.key];
            });
        } else if (options.defaultCustomName) {
            const inp = document.getElementById(prefix + '-reward-zh-CN');
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

    function readRewardNames(prefix) {
        const names = {};
        REWARD_LANGS.forEach(function (lang) {
            const inp = document.getElementById(prefix + '-reward-' + lang.key);
            names[lang.key] = inp ? inp.value.trim() : '';
        });
        return names;
    }

    window.getActivityPickerValue = function (prefix) {
        const platformPanel = document.getElementById(prefix + '-platform-panel');
        const isPlatform = platformPanel && !platformPanel.classList.contains('hidden');
        if (isPlatform) {
            const sel = document.getElementById(prefix + '-platform-select');
            const id = sel ? sel.value : '';
            if (!id) return { valid: false, message: '请选择平台活动' };
            const act = PLATFORM_ACTIVITIES.find(function (a) { return a.id === id; });
            const baseName = act ? act.name : id;
            return {
                valid: true,
                activityMode: 'platform',
                activityId: id,
                activityName: baseName,
                rewardNames: {
                    'zh-CN': baseName,
                    'zh-TW': baseName,
                    'en': baseName,
                    'ja': baseName
                },
                displayLabel: id + ' · ' + baseName
            };
        }
        const rewardNames = readRewardNames(prefix);
        const missing = REWARD_LANGS.filter(function (lang) { return !rewardNames[lang.key]; });
        if (missing.length) {
            return { valid: false, message: '请填写全部语言的奖励名称（' + missing.map(function (l) { return l.label; }).join('、') + '）' };
        }
        const zhName = rewardNames['zh-CN'];
        return {
            valid: true,
            activityMode: 'custom',
            activityId: null,
            activityName: zhName,
            rewardNames: rewardNames,
            displayLabel: zhName + '（自定义）'
        };
    };
})();
