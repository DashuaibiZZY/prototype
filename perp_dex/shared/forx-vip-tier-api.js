/**
 * VIP 等级表 · 原型「动态接口」
 * GET 等价：ForxVipTierApi.fetchVipTierTable()
 * 数据来源：localStorage forx_admin_vip_config_v1（与后台 VIP 配置审批通过后一致）
 */
(function (global) {
    'use strict';

    var STORE_KEY = 'forx_admin_vip_config_v1';

    function defaultVip0Tier() {
        return {
            level: 0,
            volume14dUsd: 0,
            taker: 0.00045,
            maker: 0.00015,
            dailyMaxWithdrawUsd: 3000,
            dailyWithdrawCountAuditThreshold: 5,
            forceManualReview: false
        };
    }

    function cloneTiers(list) {
        return JSON.parse(JSON.stringify(list || []));
    }

    function normalizeTier(row) {
        if (!row || row.level == null) return null;
        var level = Number(row.level);
        if (!isFinite(level) || level < 0) return null;
        return {
            level: level,
            volume14dUsd: level === 0 ? 0 : Math.max(0, Number(row.volume14dUsd) || 0),
            taker: Math.max(0, Number(row.taker) || 0),
            maker: Math.max(0, Number(row.maker) || 0),
            dailyMaxWithdrawUsd: Math.max(0, Number(row.dailyMaxWithdrawUsd) || 0),
            dailyWithdrawCountAuditThreshold: Math.max(0, Math.floor(Number(row.dailyWithdrawCountAuditThreshold) || 0)),
            forceManualReview: !!row.forceManualReview
        };
    }

    function normalizeTierList(stored) {
        var list = (stored || []).map(normalizeTier).filter(Boolean);
        list.sort(function (a, b) { return a.level - b.level; });
        if (!list.length || list[0].level !== 0) {
            list.unshift(cloneTiers([defaultVip0Tier()])[0]);
        }
        list[0].volume14dUsd = 0;
        var out = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].level !== i) break;
            out.push(list[i]);
        }
        if (!out.length) out = [cloneTiers([defaultVip0Tier()])[0]];
        return out;
    }

    function readRawTiers() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            return parsed && parsed.tiers ? parsed.tiers : null;
        } catch (e) {
            return null;
        }
    }

    function getPublishedTiers() {
        return normalizeTierList(readRawTiers());
    }

    function savePublishedTiers(tiers) {
        var normalized = normalizeTierList(tiers);
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ tiers: normalized, updatedAt: new Date().toISOString() }));
        } catch (e) { /* noop */ }
        return normalized;
    }

    function formatUsdCompact(n) {
        var v = Number(n);
        if (!isFinite(v)) return '—';
        if (v >= 1000000000) return '$' + (v / 1000000000).toFixed(2) + 'B';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(0) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
        return '$' + v.toLocaleString('en-US');
    }

    function formatVolumeThresholdLabel(tier, index, sorted) {
        var min = Number(tier.volume14dUsd) || 0;
        var next = sorted[index + 1];
        if (tier.level === 0 && next) {
            return '< ' + formatUsdCompact(next.volume14dUsd);
        }
        if (!next) {
            return '≥ ' + formatUsdCompact(min);
        }
        return '≥ ' + formatUsdCompact(min) + ' 且 < ' + formatUsdCompact(next.volume14dUsd);
    }

    function formatFeePct(rate) {
        return (Number(rate) * 100).toFixed(3) + '%';
    }

    function getTiersForDisplay() {
        var sorted = getPublishedTiers();
        return sorted.map(function (tier, index) {
            return {
                level: tier.level,
                name: 'VIP ' + tier.level,
                threshold: formatVolumeThresholdLabel(tier, index, sorted),
                volume14dUsd: tier.volume14dUsd,
                taker: tier.taker,
                maker: tier.maker,
                dailyMaxWithdrawUsd: tier.dailyMaxWithdrawUsd,
                dailyWithdrawCountAuditThreshold: tier.dailyWithdrawCountAuditThreshold,
                forceManualReview: tier.forceManualReview
            };
        });
    }

    function calcVolumeTier(volume14d) {
        var vol = Number(volume14d) || 0;
        var sorted = getPublishedTiers().slice().sort(function (a, b) { return b.level - a.level; });
        for (var i = 0; i < sorted.length; i++) {
            if (vol >= sorted[i].volume14dUsd) return sorted[i].level;
        }
        return 0;
    }

    function getTierByLevel(level) {
        var tiers = getTiersForDisplay();
        return tiers.filter(function (t) { return t.level === level; })[0] || tiers[0];
    }

    function fetchVipTierTable() {
        return Promise.resolve({
            code: 0,
            message: 'ok',
            data: {
                tiers: getTiersForDisplay(),
                updatedAt: (function () {
                    try {
                        var raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
                        return raw.updatedAt || null;
                    } catch (e) { return null; }
                })()
            }
        });
    }

    function renderFeeTableBody(tbody, options) {
        options = options || {};
        if (!tbody) return;
        var currentLevel = options.currentLevel;
        var guest = !!options.guest;
        var tiers = getTiersForDisplay();
        tbody.innerHTML = tiers.map(function (t) {
            var isCurrent = !guest && currentLevel != null && t.level === currentLevel;
            var trClass = isCurrent ? ' class="bg-yellow-50/50"' : ' class="hover:bg-gray-50"';
            var tdClass = isCurrent ? ' font-black text-yellow-700' : '';
            var rowAttr = isCurrent ? ' data-vip-current-row' : '';
            return '<tr' + trClass + rowAttr + '>' +
                '<td class="px-4 py-3 border-b border-gray-50' + tdClass + '">' + t.name + '</td>' +
                '<td class="px-4 py-3 border-b border-gray-50' + tdClass + '">' + t.threshold + '</td>' +
                '<td class="px-4 py-3 border-b border-gray-50 font-mono' + tdClass + '">' + formatFeePct(t.maker) + '</td>' +
                '<td class="px-4 py-3 border-b border-gray-50 text-right font-mono' + tdClass + '">' + formatFeePct(t.taker) + '</td>' +
                '</tr>';
        }).join('');
    }

    function hydrateVipFeeTables(options) {
        options = options || {};
        var currentLevel = options.currentLevel != null ? options.currentLevel : 2;
        var guest = !!options.guest;
        document.querySelectorAll('[data-vip-tier-tbody]').forEach(function (tbody) {
            renderFeeTableBody(tbody, { currentLevel: currentLevel, guest: guest });
        });
    }

    global.ForxVipTierApi = {
        STORE_KEY: STORE_KEY,
        defaultVip0Tier: defaultVip0Tier,
        getPublishedTiers: getPublishedTiers,
        savePublishedTiers: savePublishedTiers,
        getTiersForDisplay: getTiersForDisplay,
        calcVolumeTier: calcVolumeTier,
        getTierByLevel: getTierByLevel,
        formatFeePct: formatFeePct,
        formatUsdCompact: formatUsdCompact,
        fetchVipTierTable: fetchVipTierTable,
        renderFeeTableBody: renderFeeTableBody,
        hydrateVipFeeTables: hydrateVipFeeTables
    };
})(typeof window !== 'undefined' ? window : globalThis);
