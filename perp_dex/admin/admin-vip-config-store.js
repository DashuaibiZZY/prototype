/**
 * VIP 等级配置（原型）· 费率 + 提币风控阶梯
 * 与用户费率设置、用户端 VIP 表共用 localStorage
 */
(function (global) {
    'use strict';

    var STORE_KEY = 'forx_admin_vip_config_v1';

    var DEFAULT_TIERS = [
        {
            level: 0,
            volume14dUsd: 0,
            taker: 0.00045,
            maker: 0.00015,
            dailyMaxWithdrawUsd: 50000,
            dailyWithdrawCountAuditThreshold: 3,
            forceManualReview: false
        },
        {
            level: 1,
            volume14dUsd: 5000000,
            taker: 0.00039,
            maker: 0.00013,
            dailyMaxWithdrawUsd: 200000,
            dailyWithdrawCountAuditThreshold: 5,
            forceManualReview: false
        },
        {
            level: 2,
            volume14dUsd: 25000000,
            taker: 0.00034,
            maker: 0.00010,
            dailyMaxWithdrawUsd: 500000,
            dailyWithdrawCountAuditThreshold: 8,
            forceManualReview: false
        },
        {
            level: 3,
            volume14dUsd: 100000000,
            taker: 0.00029,
            maker: 0.00006,
            dailyMaxWithdrawUsd: 2000000,
            dailyWithdrawCountAuditThreshold: 12,
            forceManualReview: false
        },
        {
            level: 4,
            volume14dUsd: 500000000,
            taker: 0.00026,
            maker: 0.00004,
            dailyMaxWithdrawUsd: 10000000,
            dailyWithdrawCountAuditThreshold: 20,
            forceManualReview: true
        }
    ];

    function cloneTiers(list) {
        return JSON.parse(JSON.stringify(list || []));
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

    function normalizeTier(row, fallbackLevel) {
        if (!row || row.level == null) return null;
        var level = Number(row.level);
        if (!isFinite(level)) return null;
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

    function mergeWithDefaults(stored) {
        var byLevel = {};
        DEFAULT_TIERS.forEach(function (t) { byLevel[t.level] = cloneTiers([t])[0]; });
        (stored || []).forEach(function (row) {
            var n = normalizeTier(row);
            if (n == null || byLevel[n.level] == null) return;
            byLevel[n.level] = n;
        });
        return DEFAULT_TIERS.map(function (t) { return byLevel[t.level]; });
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

    function getVipTierRows() {
        return mergeWithDefaults(readRawTiers());
    }

    function saveVipTierRows(tiers) {
        var merged = mergeWithDefaults(tiers);
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ tiers: merged, updatedAt: new Date().toISOString() }));
        } catch (e) { /* noop */ }
        return merged;
    }

    function getTiersForDisplay() {
        var sorted = getVipTierRows().slice().sort(function (a, b) { return a.level - b.level; });
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
        var sorted = getVipTierRows().slice().sort(function (a, b) { return b.level - a.level; });
        for (var i = 0; i < sorted.length; i++) {
            if (vol >= sorted[i].volume14dUsd) return sorted[i].level;
        }
        return 0;
    }

    function validateVipTierRows(tiers) {
        var errors = [];
        var list = mergeWithDefaults(tiers).slice().sort(function (a, b) { return a.level - b.level; });
        if (list[0] && list[0].volume14dUsd !== 0) {
            errors.push('VIP 0 的 14 天交易量要求须为 0');
        }
        for (var i = 1; i < list.length; i++) {
            var prev = list[i - 1];
            var cur = list[i];
            if (cur.volume14dUsd <= prev.volume14dUsd) {
                errors.push('VIP ' + cur.level + ' 的 14 天交易量要求须大于 VIP ' + prev.level);
            }
            if (cur.taker > prev.taker + 1e-12) {
                errors.push('VIP ' + cur.level + ' 的 Taker 费率不能高于 VIP ' + prev.level);
            }
            if (cur.maker > prev.maker + 1e-12) {
                errors.push('VIP ' + cur.level + ' 的 Maker 费率不能高于 VIP ' + prev.level);
            }
            if (cur.dailyMaxWithdrawUsd < prev.dailyMaxWithdrawUsd) {
                errors.push('VIP ' + cur.level + ' 的单日个人最大提现额度不能低于 VIP ' + prev.level);
            }
            if (cur.dailyWithdrawCountAuditThreshold < prev.dailyWithdrawCountAuditThreshold) {
                errors.push('VIP ' + cur.level + ' 的单日提现次数审核阈值不能低于 VIP ' + prev.level);
            }
        }
        return { ok: errors.length === 0, errors: errors };
    }

    global.ForxAdminVipConfig = {
        STORE_KEY: STORE_KEY,
        getVipTierRows: getVipTierRows,
        saveVipTierRows: saveVipTierRows,
        getTiersForDisplay: getTiersForDisplay,
        calcVolumeTier: calcVolumeTier,
        validateVipTierRows: validateVipTierRows,
        formatUsdCompact: formatUsdCompact
    };
})(window);
