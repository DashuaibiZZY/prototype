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
        posQtyUsdt: 10032.23,
        closableUsdt: 10032.23,
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

    function getModalCloseQtyValue() {
        const val = DEMO_POS.closableUsdt * modalCloseQtyPct / 100;
        return fmtUsdt(val);
    }

    function getQuickClosePriceValue() {
        if (quickPriceMode === 'market') return '市价';
        if (quickPriceMode === 'latest') return fmtUsdt(DEMO_POS.latestPrice);
        const el = document.getElementById('quick-close-price');
        return el?.value || fmtUsdt(DEMO_POS.latestPrice);
    }

    function getQuickCloseQtyValue() {
        const val = DEMO_POS.closableUsdt * quickQtyPct / 100;
        return fmtUsdt(val);
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
        if (input) input.value = getModalCloseQtyValue();
        if (slider) slider.value = pct;
        updateQuickCloseEstPnl();
    }

    function renderCloseColHeader() {
        return closeMode === 'standard' ? '标准平仓' : '快捷平仓';
    }

    function renderStandardCloseCell() {
        return `<td class="px-3 py-2.5 text-right whitespace-nowrap">
            <button type="button" onclick="PositionClose.openPositionCloseModal()" class="text-gray-900 hover:text-blue-600 font-bold mr-2">平仓</button>
            <button type="button" onclick="PositionClose.openMarketCloseConfirm()" class="text-gray-900 hover:text-blue-600 font-bold">市价全平</button>
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
                        <div id="quick-qty-panel" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-sm hidden z-[120] p-2 w-44">
                            <input type="range" id="quick-close-qty-slider" min="0" max="100" step="25" value="${quickQtyPct}"
                                class="w-full accent-black h-1"
                                oninput="PositionClose.setQuickCloseQtyPct(Number(this.value))">
                            <div class="flex justify-between text-[8px] text-gray-400 font-bold mt-1">
                                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" onclick="PositionClose.openQuickCloseConfirm()" class="text-gray-900 hover:text-blue-600 font-bold text-[10px]">平仓</button>
                    <button type="button" onclick="PositionClose.openMarketCloseConfirm()" class="text-gray-900 hover:text-blue-600 font-bold text-[10px]">市价全平</button>
                </div>
                <div class="text-[9px] text-gray-400">预计收益 <span id="quick-close-est-pnl" class="text-green-500 font-bold">${fmtPnl(DEMO_POS.estPnl * quickQtyPct / 100)} ${DEMO_POS.pnlCoin}</span></div>
            </div>
        </td>`;
    }

    function renderCloseCell() {
        return closeMode === 'standard' ? renderStandardCloseCell() : renderQuickCloseCell();
    }

    function refreshPosTableCloseColumn() {
        const headerEl = document.getElementById('pos-close-col-header');
        if (headerEl) headerEl.textContent = renderCloseColHeader();
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
        const label = document.getElementById('pos-close-mode-label');
        if (label) label.textContent = renderCloseColHeader();
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
            const dd = document.getElementById('pos-close-mode-dropdown');
            if (dd) dd.classList.add('hidden');
            refreshPosTableCloseColumn();
        },

        togglePosCloseModeDropdown: function (e) {
            e.stopPropagation();
            document.getElementById('pos-close-mode-dropdown')?.classList.toggle('hidden');
        },

        openCloseAllConfirm: function () {
            toggleModal('modal-close-all');
        },

        executeCloseAll: function () {
            toggleModal('modal-close-all');
            if (typeof showNotification === 'function') showNotification('全部持仓平仓委托已提交');
        },

        openPositionCloseModal: function () {
            modalClosePriceMode = 'limit';
            modalCloseQtyPct = 100;
            const priceInput = document.getElementById('modal-close-price-input');
            const qtyInput = document.getElementById('modal-close-qty-input');
            const slider = document.getElementById('modal-close-qty-slider');
            const label = document.getElementById('modal-close-contract-label');
            const mark = document.getElementById('modal-close-mark-price');
            const open = document.getElementById('modal-close-open-avg');
            if (label) label.textContent = DEMO_POS.contractLabel;
            if (mark) mark.textContent = fmtUsdt(DEMO_POS.markPrice);
            if (open) open.textContent = fmtUsdt(DEMO_POS.openAvg);
            if (priceInput) {
                priceInput.disabled = false;
                priceInput.value = fmtUsdt(DEMO_POS.markPrice);
                priceInput.classList.remove('text-center', 'text-gray-400');
            }
            if (qtyInput) qtyInput.value = getModalCloseQtyValue();
            if (slider) slider.value = 100;
            document.getElementById('modal-close-pos-qty').textContent = fmtUsdt(DEMO_POS.posQtyUsdt) + ' USDT';
            document.getElementById('modal-close-closable-qty').textContent = fmtUsdt(DEMO_POS.closableUsdt) + ' USDT';
            updateModalCloseEstPnl();
            toggleModal('modal-position-close');
        },

        closePositionCloseModal: function () {
            toggleModal('modal-position-close');
        },

        setModalCloseMarketPrice: function () {
            modalClosePriceMode = 'market';
            const priceInput = document.getElementById('modal-close-price-input');
            if (priceInput) {
                priceInput.value = '市价';
                priceInput.disabled = true;
                priceInput.classList.add('text-center', 'text-gray-500');
            }
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
            const qty = source === 'quick' ? getQuickCloseQtyValue() + ' USDT' : getModalCloseQtyValue() + ' USDT';
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

        renderCloseColHeader: renderCloseColHeader,
        renderCloseCell: renderCloseCell,
        refreshPosTableCloseColumn: refreshPosTableCloseColumn,
    };

    document.addEventListener('click', function (e) {
        if (!e.target.closest('#pos-close-mode-trigger') && !e.target.closest('#pos-close-mode-dropdown')) {
            document.getElementById('pos-close-mode-dropdown')?.classList.add('hidden');
        }
        if (!e.target.closest('#quick-close-price') && !e.target.closest('#quick-price-dropdown')) {
            document.getElementById('quick-price-dropdown')?.classList.add('hidden');
        }
        if (!e.target.closest('#quick-close-qty') && !e.target.closest('#quick-qty-panel')) {
            document.getElementById('quick-qty-panel')?.classList.add('hidden');
        }
    });
})();
