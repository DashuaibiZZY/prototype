/**
 * 后台 VIP 配置 · 校验、变更对比、审批 pending（依赖 forx-vip-tier-api.js）
 */
(function (global) {
    'use strict';

    var PENDING_KEY = 'forx_vip_tier_config_pending';

    function api() {
        return global.ForxVipTierApi;
    }

    function getVipTierRows() {
        if (api()) return api().getPublishedTiers();
        return [];
    }

    function saveVipTierRows(tiers) {
        if (api()) return api().savePublishedTiers(tiers);
        return tiers;
    }

    function getTiersForDisplay() {
        if (api()) return api().getTiersForDisplay();
        return [];
    }

    function calcVolumeTier(volume14d) {
        if (api()) return api().calcVolumeTier(volume14d);
        return 0;
    }

    function formatUsdCompact(n) {
        if (api()) return api().formatUsdCompact(n);
        return String(n);
    }

    function formatRatePct(rate) {
        return (Number(rate) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
    }

    function formatManual(v) {
        return v ? '开启' : '关闭';
    }

    function tierSnapshotLine(tier) {
        if (!tier) return '—';
        return '14d≥' + (tier.volume14dUsd || 0) + ' · Taker ' + formatRatePct(tier.taker) +
            ' · Maker ' + formatRatePct(tier.maker) + ' · 提现 ' + tier.dailyMaxWithdrawUsd +
            ' · 次数 ' + tier.dailyWithdrawCountAuditThreshold + ' · 人工 ' + formatManual(tier.forceManualReview);
    }

    function validateVipTierRows(tiers) {
        var errors = [];
        var list = (tiers || []).slice().sort(function (a, b) { return a.level - b.level; });
        if (!list.length || list[0].level !== 0) {
            errors.push('须包含 VIP 0');
            return { ok: false, errors: errors };
        }
        for (var i = 0; i < list.length; i++) {
            if (list[i].level !== i) {
                errors.push('VIP 等级须从 0 起连续编号，不可跳档');
                break;
            }
        }
        if (list[0].volume14dUsd !== 0) {
            errors.push('VIP 0 的 14 天交易量要求须为 0');
        }
        for (var j = 1; j < list.length; j++) {
            var prev = list[j - 1];
            var cur = list[j];
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

    function buildVipTierConfigChanges(beforeTiers, afterTiers) {
        var beforeMap = {};
        (beforeTiers || []).forEach(function (t) { beforeMap[t.level] = t; });
        var afterMap = {};
        (afterTiers || []).forEach(function (t) { afterMap[t.level] = t; });
        var levels = {};
        (beforeTiers || []).concat(afterTiers || []).forEach(function (t) { levels[t.level] = true; });
        var changes = [];
        Object.keys(levels).map(Number).sort(function (a, b) { return a - b; }).forEach(function (level) {
            var b = beforeMap[level];
            var a = afterMap[level];
            if (!b && a) {
                changes.push({ field: 'VIP ' + level + ' · 新增等级', before: '—', after: tierSnapshotLine(a) });
                return;
            }
            if (!a) return;
            var fields = [
                { key: 'volume14dUsd', label: '14 天交易量要求（USDC）', fmt: function (v) { return level === 0 ? '0' : String(v); } },
                { key: 'taker', label: 'Taker 费率', fmt: formatRatePct },
                { key: 'maker', label: 'Maker 费率', fmt: formatRatePct },
                { key: 'dailyMaxWithdrawUsd', label: '单日个人最大提现额度（USDC）', fmt: function (v) { return String(v); } },
                { key: 'dailyWithdrawCountAuditThreshold', label: '单日提现次数审核阈值', fmt: function (v) { return String(v); } },
                { key: 'forceManualReview', label: '是否强制人工审核', fmt: formatManual }
            ];
            fields.forEach(function (f) {
                var bv = b ? b[f.key] : undefined;
                var av = a[f.key];
                if (bv === av) return;
                if (f.key === 'forceManualReview' && !!bv === !!av) return;
                changes.push({
                    field: 'VIP ' + level + ' · ' + f.label,
                    before: b ? f.fmt(bv) : '—',
                    after: f.fmt(av)
                });
            });
        });
        return changes;
    }

    function setVipTierConfigPending(data) {
        try {
            if (!data) localStorage.removeItem(PENDING_KEY);
            else localStorage.setItem(PENDING_KEY, JSON.stringify(data));
        } catch (e) { /* noop */ }
    }

    function getVipTierConfigPendingLocal() {
        try {
            var raw = localStorage.getItem(PENDING_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function clearVipTierConfigPending() {
        setVipTierConfigPending(null);
    }

    global.setVipTierConfigPending = setVipTierConfigPending;
    global.getVipTierConfigPendingLocal = getVipTierConfigPendingLocal;
    global.clearVipTierConfigPending = clearVipTierConfigPending;

    global.ForxAdminVipConfig = {
        PENDING_KEY: PENDING_KEY,
        getVipTierRows: getVipTierRows,
        saveVipTierRows: saveVipTierRows,
        getTiersForDisplay: getTiersForDisplay,
        calcVolumeTier: calcVolumeTier,
        validateVipTierRows: validateVipTierRows,
        buildVipTierConfigChanges: buildVipTierConfigChanges,
        formatUsdCompact: formatUsdCompact
    };
})(window);
