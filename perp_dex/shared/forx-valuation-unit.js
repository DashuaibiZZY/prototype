/**
 * ForX 估值单位换算（Web / App 投资组合原型共用）
 */
(function (global) {
    const VALUATION_UNITS = {
        USD: { code: 'USD', label: 'USD 美元', rate: 1, prefix: '$', suffix: '', decimals: 2 },
        USDC: { code: 'USDC', label: 'USD Coin', rate: 1, prefix: '', suffix: ' USDC', decimals: 2 },
        JPY: { code: 'JPY', label: 'JPY 日元', rate: 154.5, prefix: '¥', suffix: '', decimals: 2 },
    };

    function getUnit(unitCode) {
        return VALUATION_UNITS[unitCode] || VALUATION_UNITS.USD;
    }

    function formatValuation(usdVal, unitCode, { signed = false } = {}) {
        if (usdVal === null || usdVal === undefined) return '--';
        const u = getUnit(unitCode);
        const val = Number(usdVal) * u.rate;
        const absStr = Math.abs(val).toLocaleString('en-US', {
            minimumFractionDigits: u.decimals,
            maximumFractionDigits: u.decimals,
        });
        const sign = val < 0 ? '-' : (signed && val > 0 ? '+' : '');
        return `${sign}${u.prefix}${absStr}${u.suffix}`;
    }

    /** 「含体验金」标签数额：与估值单位联动；USDC 选项仅展示纯数字（不重复 USDC 后缀） */
    function formatTrialInTag(usdVal, unitCode) {
        if (usdVal === null || usdVal === undefined || Number(usdVal) <= 0) return null;
        const u = getUnit(unitCode);
        const val = Number(usdVal) * u.rate;
        const absStr = Math.abs(val).toLocaleString('en-US', {
            minimumFractionDigits: u.decimals,
            maximumFractionDigits: u.decimals,
        });
        if (u.suffix) return absStr;
        const sign = val < 0 ? '-' : '';
        return `${sign}${u.prefix}${absStr}`;
    }

    function formatTrialTagLabel(usdVal, unitCode) {
        const amount = formatTrialInTag(usdVal, unitCode);
        return amount ? `含体验金 ${amount}` : null;
    }

    global.ForxValuationUnit = {
        VALUATION_UNITS,
        getUnit,
        formatValuation,
        formatTrialInTag,
        formatTrialTagLabel,
    };
})(typeof window !== 'undefined' ? window : globalThis);