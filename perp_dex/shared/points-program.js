/**
 * ForX 积分计划总开关（每周周结算瓜分 · 机制3）
 * 原型：localStorage 共享；Web / APP / Admin 读取同一状态
 */
(function (global) {
    var STORAGE_KEY = 'forx_points_program_status';

    function defaultStatus() {
        return {
            enabled: true,
            updatedAt: null
        };
    }

    function loadStatus() {
        try {
            var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                if (typeof data.enabled === 'boolean') return data;
            }
        } catch (e) { /* ignore */ }
        return defaultStatus();
    }

    function saveStatus(status) {
        status.updatedAt = new Date().toISOString();
        if (global.localStorage) {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
        }
        try {
            global.dispatchEvent(new CustomEvent('forx-points-program-change', { detail: status }));
        } catch (err) { /* ignore */ }
        return status;
    }

    function getPointsProgramStatus() {
        return loadStatus();
    }

    function isPointsProgramEnabled() {
        return loadStatus().enabled !== false;
    }

    function setPointsProgramEnabled(enabled) {
        var status = loadStatus();
        status.enabled = !!enabled;
        return saveStatus(status);
    }

    function formatProgramEffectHint(enabled) {
        if (enabled) {
            return '当前已开启 · 每周一 00:00 (UTC+8) 按总池规则自动结算发放。若关闭：本周仍结算，下周起暂停。';
        }
        return '当前已关闭 · 本周周结算仍执行；下周起暂停发放，前端展示暂停提示。若开启：本周不结算，下周起恢复。';
    }

    var PAUSED_TITLE = 'ForX 积分计划已暂停';
    var PAUSED_BODY = '本周周结算仍按既有规则执行；自下个结算周（周一 00:00 UTC+8）起，暂停每周积分发放。您已获得的积分不受影响。';

    function renderPausedBannerHtml(options) {
        options = options || {};
        var compact = options.compact;
        if (compact) {
            return '<div class="points-program-banner bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">' +
                '<p class="text-[11px] font-black text-amber-900">' + PAUSED_TITLE + '</p>' +
                '<p class="text-[10px] text-amber-800/90 mt-1 leading-relaxed">' + PAUSED_BODY + '</p></div>';
        }
        return '<div class="points-program-banner rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 mb-6">' +
            '<div class="flex items-start gap-3">' +
            '<span class="text-amber-600 text-lg leading-none mt-0.5">⏸</span>' +
            '<div><p class="text-sm font-black text-amber-900">' + PAUSED_TITLE + '</p>' +
            '<p class="text-xs text-amber-800/90 mt-1 leading-relaxed max-w-3xl">' + PAUSED_BODY + '</p></div></div></div>';
    }

    function applyPointsProgramUI(options) {
        options = options || {};
        var enabled = isPointsProgramEnabled();
        var bannerHost = options.bannerHostId ? global.document.getElementById(options.bannerHostId) : null;
        if (bannerHost) {
            bannerHost.innerHTML = enabled ? '' : renderPausedBannerHtml({ compact: options.compactBanner });
            bannerHost.classList.toggle('hidden', enabled);
        }
        (options.weeklyCardSelectors || []).forEach(function (sel) {
            var el = global.document.querySelector(sel);
            if (!el) return;
            el.classList.toggle('opacity-60', !enabled);
            el.classList.toggle('points-weekly-paused', !enabled);
            var badge = el.querySelector('[data-points-weekly-badge]');
            if (badge) {
                badge.textContent = enabled ? (badge.getAttribute('data-enabled-label') || badge.textContent) : '已暂停';
                badge.className = enabled
                    ? (badge.getAttribute('data-enabled-class') || badge.className)
                    : 'bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm font-bold text-[9px]';
            }
        });
    }

    global.getPointsProgramStatus = getPointsProgramStatus;
    global.isPointsProgramEnabled = isPointsProgramEnabled;
    global.setPointsProgramEnabled = setPointsProgramEnabled;
    global.formatProgramEffectHint = formatProgramEffectHint;
    global.renderPausedBannerHtml = renderPausedBannerHtml;
    global.applyPointsProgramUI = applyPointsProgramUI;
    global.POINTS_PROGRAM_PAUSED_TITLE = PAUSED_TITLE;
    global.POINTS_PROGRAM_PAUSED_BODY = PAUSED_BODY;
})(typeof window !== 'undefined' ? window : globalThis);
