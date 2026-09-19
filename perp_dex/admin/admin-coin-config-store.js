/**
 * 币种配置表（原型）· 与「币种配置」后台共用 localStorage
 * contract_market_enabled：开启交易市场后，可作为合约计价市场
 */
(function (global) {
    'use strict';

    var STORE_KEY = 'forx_admin_coin_config_v1';

    var DEFAULT_COINS = [
        { symbol: 'USDC', name: 'USD Coin', status: 'enabled', contract_market_enabled: true },
        { symbol: 'USDT', name: 'Tether USD', status: 'enabled', contract_market_enabled: true },
        { symbol: 'BTC', name: 'Bitcoin', status: 'enabled', contract_market_enabled: false },
        { symbol: 'ETH', name: 'Ethereum', status: 'enabled', contract_market_enabled: false },
        { symbol: 'SOL', name: 'Solana', status: 'enabled', contract_market_enabled: false },
        { symbol: 'BNB', name: 'BNB', status: 'enabled', contract_market_enabled: false },
        { symbol: 'XRP', name: 'Ripple', status: 'enabled', contract_market_enabled: false },
        { symbol: 'DOGE', name: 'Dogecoin', status: 'enabled', contract_market_enabled: false },
        { symbol: 'NEW', name: 'New Coin', status: 'enabled', contract_market_enabled: false }
    ];

    function cloneList(list) {
        return JSON.parse(JSON.stringify(list || []));
    }

    function normalizeCoin(row) {
        if (!row || !row.symbol) return null;
        return {
            symbol: String(row.symbol).trim().toUpperCase(),
            name: row.name != null ? String(row.name) : row.symbol,
            status: row.status === 'disabled' ? 'disabled' : 'enabled',
            contract_market_enabled: !!row.contract_market_enabled
        };
    }

    function mergeWithDefaults(stored) {
        var bySymbol = {};
        DEFAULT_COINS.forEach(function (c) { bySymbol[c.symbol] = cloneList([c])[0]; });
        (stored || []).forEach(function (row) {
            var n = normalizeCoin(row);
            if (!n) return;
            var base = bySymbol[n.symbol] || { symbol: n.symbol, name: n.name, status: 'enabled', contract_market_enabled: false };
            bySymbol[n.symbol] = {
                symbol: n.symbol,
                name: n.name || base.name,
                status: n.status,
                contract_market_enabled: n.contract_market_enabled
            };
        });
        return DEFAULT_COINS.map(function (c) { return bySymbol[c.symbol]; }).concat(
            Object.keys(bySymbol).filter(function (s) {
                return !DEFAULT_COINS.some(function (d) { return d.symbol === s; });
            }).map(function (s) { return bySymbol[s]; })
        );
    }

    function readRaw() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            return parsed && parsed.coins ? parsed.coins : null;
        } catch (e) {
            return null;
        }
    }

    function getCoinConfigList() {
        return mergeWithDefaults(readRaw());
    }

    function isContractMarketQuoteCoin(symbol) {
        var sym = String(symbol || '').trim().toUpperCase();
        if (!sym) return false;
        return getCoinConfigList().some(function (c) {
            return c.symbol === sym && c.status === 'enabled' && c.contract_market_enabled;
        });
    }

    function getContractMarketQuoteCoins() {
        return getCoinConfigList().filter(function (c) {
            return c.status === 'enabled' && c.contract_market_enabled;
        });
    }

    function saveCoinConfigList(coins) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ coins: mergeWithDefaults(coins) }));
        } catch (e) { /* noop */ }
    }

    global.ForxAdminCoinConfig = {
        STORE_KEY: STORE_KEY,
        getCoinConfigList: getCoinConfigList,
        getContractMarketQuoteCoins: getContractMarketQuoteCoins,
        isContractMarketQuoteCoin: isContractMarketQuoteCoin,
        saveCoinConfigList: saveCoinConfigList
    };
})(window);
