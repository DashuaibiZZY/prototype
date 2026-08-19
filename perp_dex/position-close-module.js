/**
 * 当前持仓 · 标准平仓 / 快捷平仓 与一键平仓
 */
(function () {
    const DEMO_POS = {
        symbol: 'BTCUSDT',
        contractLabel: 'BTCUSDT 永续 多 全仓 10x',
        marketCloseLabel: 'BTCUSDT永续 多 10x',
        markPrice: 63697.49,
        openAvg: 61297.77,
        latestPrice: 63650.00,
        coinQty: 0.500,
        coin: 'BTC',
        valueUsdc: 31233.23,
        direction: 'long',
        posQtyUsdc: 10032.23,
        closableUsdc: 10032.23,
        estPnl: 3211.83,
        pnlCoin: 'USDC',
    };

    let closeMode = 'standard';
    let modalClosePriceMode = 'limit';
    let modalCloseQtyPct = 100;
    let quickPriceMode = 'limit';
    let quickQtyPct = 100;
    let skipMarketCloseConfirmOnce = false;

    function fmtUsdt(n) {
        return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtPnl(n) {
        const sign = n >= 0 ? '+' : '';
        return sign + fmtUsdt(n);
    }

    function getModalClosePriceValue() {
        if (modalClosePriceMode === 'market') return '市价';
        const el = document.getElementById('modal-close-price-input');
        return el?.value || String(DEMO_POS.markPrice);
    }

    function getClosableCoinQty() {
        if (!DEMO_POS.valueUsdc) return DEMO_POS.coinQty;
        return DEMO_POS.coinQty * (DEMO_POS.closableUsdc / DEMO_POS.valueUsdc);
    }

    function getPosCoinQty() {
        if (!DEMO_POS.valueUsdc) return DEMO_POS.coinQty;
        return DEMO_POS.coinQty * (DEMO_POS.posQtyUsdc / DEMO_POS.valueUsdc);
    }

    function formatCloseQtyDisplay(usdcAmount) {
        const unit = getOrderQtyUnit();
        if (unit === 'BTC') {
            const ratio = DEMO_POS.valueUsdc ? DEMO_POS.coinQty / DEMO_POS.valueUsdc : 0;
            return (usdcAmount * ratio).toFixed(3) + ' ' + DEMO_POS.coin;
        }
        return fmtUsdt(usdcAmount) + ' USDC';
    }

    function getModalCloseQtyValue() {
        const val = DEMO_POS.closableUsdc * modalCloseQtyPct / 100;
        return formatCloseQtyDisplay(val);
    }

    function getQuickClosePriceValue() {
        if (quickPriceMode === 'market') return '市价';
        if (quickPriceMode === 'latest') return fmtUsdt(DEMO_POS.latestPrice);
        const el = document.getElementById('quick-close-price');
        return el?.value || fmtUsdt(DEMO_POS.latestPrice);
    }

    function getQuickCloseQtyValue() {
        const val = DEMO_POS.closableUsdc * quickQtyPct / 100;
        return formatCloseQtyDisplay(val);
    }

    function updateModalCloseQtyLabel() {
        const label = document.getElementById('modal-close-qty-label');
        if (!label) return;
        const unit = getOrderQtyUnit();
        label.textContent = unit === 'BTC' ? `平仓数量 (${DEMO_POS.coin})` : '平仓数量 (USDC)';
    }

    function refreshCloseQtyDisplay() {
        updateModalCloseQtyLabel();
        const modalQty = document.getElementById('modal-close-qty-input');
        const quickQty = document.getElementById('quick-close-qty');
        const posQty = document.getElementById('modal-close-pos-qty');
        const closableQty = document.getElementById('modal-close-closable-qty');
        if (modalQty) modalQty.value = getModalCloseQtyValue();
        if (quickQty) quickQty.value = getQuickCloseQtyValue();
        const unit = getOrderQtyUnit();
        if (posQty) {
            posQty.textContent = unit === 'BTC'
                ? getPosCoinQty().toFixed(3) + ' ' + DEMO_POS.coin
                : fmtUsdt(DEMO_POS.posQtyUsdc) + ' USDC';
        }
        if (closableQty) {
            closableQty.textContent = unit === 'BTC'
                ? getClosableCoinQty().toFixed(3) + ' ' + DEMO_POS.coin
                : fmtUsdt(DEMO_POS.closableUsdc) + ' USDC';
        }
    }

    function updateModalCloseEstPnl() {
        const el = document.getElementById('modal-close-est-pnl');
        if (el) el.textContent = fmtPnl(DEMO_POS.estPnl * modalCloseQtyPct / 100) + ' ' + DEMO_POS.pnlCoin;
    }

    function updateQuickCloseEstPnl() {
        const el = document.getElementById('quick-close-est-pnl');
        if (el) el.textContent = fmtPnl(DEMO_POS.estPnl * quickQtyPct / 100) + ' ' + DEMO_POS.pnlCoin;
    }

    function setModalCloseQtyPct(pct) {
        modalCloseQtyPct = pct;
        const input = document.getElementById('modal-close-qty-input');
        const slider = document.getElementById('modal-close-qty-slider');
        if (input) input.value = getModalCloseQtyValue();
        if (slider) slider.value = pct;
        updateModalCloseEstPnl();
    }

    function setQuickCloseQtyPct(pct) {
        quickQtyPct = pct;
        const input = document.getElementById('quick-close-qty');
        const slider = document.getElementById('quick-close-qty-slider');
        if (input) input.value = getQuickCloseQtyValue();
        if (slider) slider.value = pct;
        updateQuickCloseEstPnl();
    }

    function renderCloseColHeader() {
        return closeMode === 'standard' ? '标准平仓' : '快捷平仓';
    }

    function renderQtySliderBlock(sliderId, value, oninputHandler) {
        return `<div class="pos-close-slider-wrap">
            <div class="pos-close-slider-rail">
                <div class="pos-close-slider-ticks" aria-hidden="true">
                    <span class="pos-close-slider-tick"></span>
                    <span class="pos-close-slider-tick"></span>
                    <span class="pos-close-slider-tick"></span>
                    <span class="pos-close-slider-tick"></span>
                    <span class="pos-close-slider-tick"></span>
                </div>
                <input type="range" id="${sliderId}" class="pos-close-slider-input" min="0" max="100" step="25" value="${value}" oninput="${oninputHandler}">
            </div>
            <div class="pos-close-slider-labels"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
        </div>`;
    }

    function renderCloseColHeaderInner() {
        const label = renderCloseColHeader();
        return `<span class="inline-flex items-center gap-1 text-gray-500 whitespace-nowrap">
            <span id="pos-close-col-label">${label}</span>
            <button type="button" class="pos-close-mode-switch" title="切换标准/快捷平仓" onclick="PositionClose.cyclePosCloseMode(1)" aria-label="切换平仓模式">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 11H13.5M13.5 11L11 8.5M13.5 11L11 13.5M12 5H2.5M2.5 5L5 2.5M2.5 5L5 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
        </span>`;
    }

    function applyModalCloseLimitPrice() {
        modalClosePriceMode = 'limit';
        const priceInput = document.getElementById('modal-close-price-input');
        const marketBtn = document.getElementById('modal-close-market-btn');
        if (priceInput) {
            priceInput.disabled = false;
            priceInput.value = fmtUsdt(DEMO_POS.markPrice);
            priceInput.classList.remove('text-center', 'text-gray-500');
        }
        if (marketBtn) marketBtn.textContent = '市价';
    }

    function applyModalCloseMarketPrice() {
        modalClosePriceMode = 'market';
        const priceInput = document.getElementById('modal-close-price-input');
        const marketBtn = document.getElementById('modal-close-market-btn');
        if (priceInput) {
            priceInput.value = '市价';
            priceInput.disabled = true;
            priceInput.classList.add('text-center', 'text-gray-500');
        }
        if (marketBtn) marketBtn.textContent = '限价';
    }

    function renderStandardCloseCell() {
        return `<td class="px-3 py-2.5 whitespace-nowrap">
            <button type="button" onclick="PositionClose.openPositionCloseModal()" class="pos-close-action-btn mr-1.5">平仓</button>
            <button type="button" onclick="PositionClose.openMarketCloseConfirm()" class="pos-close-action-btn">市价全平</button>
        </td>`;
    }

    function renderQuickCloseCell() {
        return `<td class="px-3 py-2.5 align-top min-w-[280px]">
            <div class="space-y-1">
                <div class="flex items-center flex-wrap gap-1">
                    <div class="relative">
                        <input type="text" id="quick-close-price" readonly
                            onclick="PositionClose.toggleQuickPriceDropdown(event)"
                            class="w-20 h-6 text-[10px] border border-gray-200 rounded px-1 outline-none focus:border-blue-400 cursor-pointer bg-white"
                            value="${quickPriceMode === 'market' ? '市价' : fmtUsdt(DEMO_POS.latestPrice)}">
                        <div id="quick-price-dropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm hidden z-[120] w-24 text-[10px] font-bold">
                            <div class="px-2 py-1.5 hover:bg-gray-100 cursor-pointer" onclick="PositionClose.setQuickClosePrice('market')">市价</div>
                            <div class="px-2 py-1.5 hover:bg-gray-100 cursor-pointer" onclick="PositionClose.setQuickClosePrice('latest')">最新价</div>
                        </div>
                    </div>
                    <div class="relative">
                        <input type="text" id="quick-close-qty" readonly
                            onclick="PositionClose.toggleQuickQtyPanel(event)"
                            class="w-24 h-6 text-[10px] border border-gray-200 rounded px-1 outline-none focus:border-blue-400 cursor-pointer bg-white"
                            value="${getQuickCloseQtyValue()}">
                        <div id="quick-qty-panel" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm hidden z-[120] p-2 w-48">
                            ${renderQtySliderBlock('quick-close-qty-slider', quickQtyPct, 'PositionClose.setQuickCloseQtyPct(Number(this.value))')}
                        </div>
                    </div>
                    <button type="button" onclick="PositionClose.openQuickCloseConfirm()" class="pos-close-action-btn">平仓</button>
                    <button type="button" onclick="PositionClose.openMarketCloseConfirm()" class="pos-close-action-btn">市价全平</button>
                </div>
                <div class="text-[9px] text-gray-400">预计收益 <span id="quick-close-est-pnl" class="text-green-500 font-bold">${fmtPnl(DEMO_POS.estPnl * quickQtyPct / 100)} ${DEMO_POS.pnlCoin}</span></div>
            </div>
        </td>`;
    }

    function renderCloseCell() {
        return closeMode === 'standard' ? renderStandardCloseCell() : renderQuickCloseCell();
    }

    function getOrderQtyUnit() {
        return document.getElementById('qty-unit')?.innerText?.trim() || 'USDC';
    }

    function renderPosQtyMainText() {
        const unit = getOrderQtyUnit();
        if (unit === 'BTC') return DEMO_POS.coinQty.toFixed(3) + ' ' + DEMO_POS.coin;
        return fmtUsdt(DEMO_POS.valueUsdc) + ' USDC';
    }

    function renderPosQtyCellInner() {
        const dirLabel = DEMO_POS.direction === 'long' ? '开多' : '开空';
        const dirClass = DEMO_POS.direction === 'long' ? 'text-green-500' : 'text-red-500';
        const coinQtyStr = DEMO_POS.coinQty.toFixed(3) + ' ' + DEMO_POS.coin;
        const valueStr = fmtUsdt(DEMO_POS.valueUsdc) + ' USDC';
        return `<div class="pos-qty-hover-wrap">
            <span id="pos-qty-display">${renderPosQtyMainText()}</span>
            <div class="pos-qty-tip">
                <div class="pos-qty-tip-row"><span class="text-gray-400">交易方向</span><span class="${dirClass} font-bold">${dirLabel}</span></div>
                <div class="pos-qty-tip-row"><span class="text-gray-400">持仓币数</span><span class="font-bold text-gray-900">${coinQtyStr}</span></div>
                <div class="pos-qty-tip-row"><span class="text-gray-400">持仓价值</span><span class="font-bold text-gray-900">${valueStr}</span></div>
            </div>
        </div>`;
    }

    function refreshPosQtyDisplay() {
        const display = document.getElementById('pos-qty-display');
        if (display) display.textContent = renderPosQtyMainText();
    }

    function refreshPosTableCloseColumn() {
        const headerEl = document.getElementById('pos-close-col-header');
        if (headerEl) headerEl.innerHTML = renderCloseColHeaderInner();
        const cell = document.getElementById('pos-close-action-cell');
        if (cell) {
            const tmp = document.createElement('tbody');
            tmp.innerHTML = '<tr>' + renderCloseCell() + '</tr>';
            const newTd = tmp.querySelector('td');
            if (newTd) {
                cell.replaceWith(newTd);
                newTd.id = 'pos-close-action-cell';
            }
        }
    }

    function shouldSkipMarketCloseConfirm() {
        if (skipMarketCloseConfirmOnce) {
            skipMarketCloseConfirmOnce = false;
            return true;
        }
        const pref = document.getElementById('pref-confirm-market-close-all');
        return pref && !pref.checked;
    }

    window.PositionClose = {
        DEMO_POS: DEMO_POS,
        getCloseMode: function () { return closeMode; },

        setPosCloseMode: function (mode) {
            closeMode = mode === 'quick' ? 'quick' : 'standard';
            refreshPosTableCloseColumn();
        },

        cyclePosCloseMode: function (delta) {
            if (delta > 0) closeMode = closeMode === 'standard' ? 'quick' : 'standard';
            else closeMode = closeMode === 'quick' ? 'standard' : 'quick';
            refreshPosTableCloseColumn();
        },

        renderCloseColHeaderInner: renderCloseColHeaderInner,
        renderCloseColHeader: renderCloseColHeader,

        openCloseAllConfirm: function () {
            toggleModal('modal-close-all');
        },

        executeCloseAll: function () {
            toggleModal('modal-close-all');
            if (typeof showNotification === 'function') showNotification('全部持仓平仓委托已提交');
        },

        openPositionCloseModal: function () {
            modalCloseQtyPct = 100;
            applyModalCloseLimitPrice();
            updateModalCloseQtyLabel();
            const qtyInput = document.getElementById('modal-close-qty-input');
            const slider = document.getElementById('modal-close-qty-slider');
            const label = document.getElementById('modal-close-contract-label');
            const mark = document.getElementById('modal-close-mark-price');
            const open = document.getElementById('modal-close-open-avg');
            if (label) label.textContent = DEMO_POS.contractLabel;
            if (mark) mark.textContent = fmtUsdt(DEMO_POS.markPrice);
            if (open) open.textContent = fmtUsdt(DEMO_POS.openAvg);
            refreshCloseQtyDisplay();
            if (slider) slider.value = 100;
            updateModalCloseEstPnl();
            toggleModal('modal-position-close');
        },

        closePositionCloseModal: function () {
            toggleModal('modal-position-close');
        },

        toggleModalClosePriceMode: function () {
            if (modalClosePriceMode === 'market') applyModalCloseLimitPrice();
            else applyModalCloseMarketPrice();
        },

        setModalCloseQtyPct: setModalCloseQtyPct,

        submitPositionClose: function () {
            toggleModal('modal-position-close');
            PositionClose.openCloseOrderConfirm('modal');
        },

        openQuickCloseConfirm: function () {
            PositionClose.openCloseOrderConfirm('quick');
        },

        openCloseOrderConfirm: function (source) {
            const price = source === 'quick' ? getQuickClosePriceValue() : getModalClosePriceValue();
            const qty = source === 'quick' ? getQuickCloseQtyValue() + ' USDC' : getModalCloseQtyValue() + ' USDC';
            const isMarket = price === '市价';
            if (typeof openOrderConfirm === 'function') {
                if (isMarket) openOrderConfirm('close-long-market', { price: '市價', qty: qty });
                else openOrderConfirm('close-long-limit', { price: price, qty: qty });
            }
        },

        openMarketCloseConfirm: function () {
            if (shouldSkipMarketCloseConfirm()) {
                PositionClose.executeMarketClose();
                return;
            }
            const text = document.getElementById('modal-market-close-text');
            if (text) text.textContent = '确认对' + DEMO_POS.marketCloseLabel + ' 仓位进行市价全平?';
            const skip = document.getElementById('market-close-skip-next');
            if (skip) skip.checked = false;
            toggleModal('modal-market-close-position');
        },

        executeMarketClose: function () {
            toggleModal('modal-market-close-position');
            if (typeof showNotification === 'function') showNotification('市价全平委托已提交');
        },

        confirmMarketClose: function () {
            const skip = document.getElementById('market-close-skip-next');
            if (skip && skip.checked) {
                const pref = document.getElementById('pref-confirm-market-close-all');
                if (pref) pref.checked = false;
            }
            PositionClose.executeMarketClose();
        },

        toggleQuickPriceDropdown: function (e) {
            e.stopPropagation();
            document.getElementById('quick-price-dropdown')?.classList.toggle('hidden');
            document.getElementById('quick-qty-panel')?.classList.add('hidden');
        },

        setQuickClosePrice: function (mode) {
            quickPriceMode = mode;
            const input = document.getElementById('quick-close-price');
            const dd = document.getElementById('quick-price-dropdown');
            if (input) {
                input.value = mode === 'market' ? '市价' : fmtUsdt(DEMO_POS.latestPrice);
            }
            if (dd) dd.classList.add('hidden');
        },

        toggleQuickQtyPanel: function (e) {
            e.stopPropagation();
            document.getElementById('quick-qty-panel')?.classList.toggle('hidden');
            document.getElementById('quick-price-dropdown')?.classList.add('hidden');
        },

        setQuickCloseQtyPct: setQuickCloseQtyPct,

        renderCloseCell: renderCloseCell,
        renderQtySliderBlock: renderQtySliderBlock,
        renderPosQtyCellInner: renderPosQtyCellInner,
        refreshPosQtyDisplay: refreshPosQtyDisplay,
        refreshCloseQtyDisplay: refreshCloseQtyDisplay,
        refreshPosTableCloseColumn: refreshPosTableCloseColumn,
    };

    document.addEventListener('click', function (e) {
        if (!e.target.closest('#quick-close-price') && !e.target.closest('#quick-price-dropdown')) {
            document.getElementById('quick-price-dropdown')?.classList.add('hidden');
        }
        if (!e.target.closest('#quick-close-qty') && !e.target.closest('#quick-qty-panel')) {
            document.getElementById('quick-qty-panel')?.classList.add('hidden');
        }
    });
})();
