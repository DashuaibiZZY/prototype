# Trading Guide

This guide walks through **USDC-margined perpetual futures** on ForX: funding your **trading account**, placing orders in the **contract terminal**, and **managing positions** at the bottom of the page. It replaces older flows that skipped the **transfer** step or referred to spot products—for trading on ForX you use **perpetual contracts only**, not spot markets.

For order-type and price definitions, see also [Order Types](./Order-Types.en.md), [Last / Index / Mark Price](./Last-Price-Index-Price-Mark-Price.en.md), and [Trading Fees](./Trading-Fees.en.md).

---

## What you trade on ForX

A **perpetual contract** is a derivative with **no expiry**. You trade **long** (profit when price rises) or **short** (profit when price falls) with **margin** and optional **leverage**. You do **not** take delivery of the underlying coin; PnL and margin are settled in **USDC**.

| Topic | Perpetual futures on ForX |
|-------|---------------------------|
| Margin & PnL | **USDC** in your **trading account** |
| Direction | Long or short |
| Leverage | Configurable per contract (higher leverage → higher liquidation risk) |
| Expiry | None—hold until you close or are liquidated |
| Ongoing cost | **Funding rate** between longs and shorts (see below) |

**Example (illustrative):** You transfer **1,000 USDC** to your trading account and open a **10× long** on BTCUSDC perpetual—about **10,000 USDC** of notional exposure. If mark price rises **5%**, rough unrealized gain is about **500 USDC** (~50% on margin before fees and funding). If price moves sharply against you, **liquidation** can lose much or all of the margin allocated to that position.

---

## End-to-end flow (recommended path)

Follow these four steps in order. Each step includes a **screenshot placeholder** for your published help center or GitHub Pages assets.

### Step 1 — Deposit credited

After your **on-chain deposit** is confirmed, USDC is credited to your **funding account** (sometimes labeled **Funding** or **Wallet account** in the UI). Deposits do **not** automatically appear in the account used to open perpetual positions.

**What to check**

- Deposit status shows **successful / credited**.  
- **Funding account** available balance includes the deposited USDC.

**Screenshot**

| |
|:--:|
| *Insert screenshot: deposit confirmation and funding account USDC balance (Web or App).* |

Suggested asset path: `assets/trading-guide/01-deposit-credited.png`

---

### Step 2 — Transfer USDC to your trading account

Open **Transfer** (from the portfolio / wallet menu or navbar). Move USDC **from funding account → trading account** (perpetual / futures account). The transfer is **instant and on-platform**—no new chain transaction.

**What to check**

- Transfer direction is **Funding → Trading** (wording may vary slightly by locale).  
- Amount ≤ available funding balance.  
- After success, **trading account** available USDC increases—that balance is what margin and opens use.

**Screenshot**

| |
|:--:|
| *Insert screenshot: transfer modal with Funding → Trading and confirmed USDC amount.* |

Suggested asset path: `assets/trading-guide/02-transfer-to-trading-account.png`

---

### Step 3 — Place an order in the trading terminal

Go to **Contract trading**. Select the **contract** (e.g. BTCUSDC perpetual), **margin mode** and **leverage** if you adjust them, then choose an **order type** and submit.

**Terminal checklist**

1. **Contract & context** — Mark price, index price, **funding rate**, and countdown to next funding settlement on the data bar.  
2. **Direction** — **Open long** (bullish) or **Open short** (bearish).  
3. **Order type** — [Limit, Market, TP/SL, or Advanced limit](./Order-Types.en.md); enter **price** (if needed) and **size**.  
4. **Optional TP/SL** — Attach take-profit / stop-loss on the order or set them after fill.  
5. **Fees** — Maker/Taker line shows your effective rates ([Trading Fees](./Trading-Fees.en.md)).  
6. **Confirm** — Review leverage, size, and estimated margin, then confirm the order in the UI.

> **Tip:** Use a **stop loss** (or position TP/SL) when your plan requires a hard exit level. Liquidation is driven by **mark price** and margin rules, not by your emotional reaction time.

**Screenshot**

| |
|:--:|
| *Insert screenshot: contract terminal with pair, order type, size, Open long/short, and fee line visible.* |

Suggested asset path: `assets/trading-guide/03-place-order-terminal.png`

---

### Step 4 — Manage positions at the bottom

Once filled, the position appears in the **Positions** panel at the **bottom** of the trading page (along with **Open orders**, **Order history**, etc.).

**Key columns (typical)**

| Field | Meaning |
|-------|---------|
| **Entry / avg. price** | Average open price for the position |
| **Mark price** | Risk reference for unrealized PnL ([details](./Last-Price-Index-Price-Mark-Price.en.md)) |
| **Liq. price** | Estimated liquidation price—watch this as risk rises |
| **Margin ratio** | Higher values mean less headroom before liquidation |
| **Unrealized PnL** | Profit or loss at mark price, before fees and funding |

**Common actions from this panel**

- **Add / reduce** — New orders in the terminal, or **close** flows on the row.  
- **Close at market / limit** — Full or partial exit.  
- **TP/SL** — Set or edit position take-profit and stop-loss; triggers fire without manual clicks.  
- **Close all** — Emergency flat at market (product may cancel conflicting close orders first).

**Screenshot**

| |
|:--:|
| *Insert screenshot: Positions tab with at least one open perpetual, mark price, liq. price, and PnL.* |

Suggested asset path: `assets/trading-guide/04-manage-positions-panel.png`

---

## Funding rate (holding cost)

Perpetuals use a **funding rate** so contract price stays near the index. Longs and shorts **pay each other** on a fixed **schedule per contract** (often **8 hours** on many pairs—confirm the **interval** and **next settlement** on the contract page).

- **Positive rate:** longs pay shorts.  
- **Negative rate:** shorts pay longs.

**How to review funding**

1. On the **trading terminal**, read the current rate and **countdown** to the next settlement.  
2. Open the **funding** detail view or **market detail → Funding** tab (Web/App) for **history** and interval.  
3. Before **holding overnight or longer**, estimate cumulative funding—it scales with **position size** and **time**.

**Screenshot (optional)**

| |
|:--:|
| *Insert screenshot: funding rate tooltip or funding history for one contract.* |

Suggested asset path: `assets/trading-guide/05-funding-rate.png`

---

## Closing a position (summary)

You can exit from **Step 4** without returning to the top of the page:

| Method | Behavior |
|--------|----------|
| **Close / partial close** | Market or limit close on the position row |
| **Close all** | Flatten all open perpetual positions at market |
| **TP/SL** | Automatic when trigger conditions are met |
| **Opposite order** | Reduce or flip via an opposing open order (watch net size and margin) |

After close, realized PnL, **trading fees**, and **funding** since open appear in **history** and **bills**.

---

## Risk management

| Common mistake | Risk | What to do instead |
|----------------|------|---------------------|
| Maximum leverage on first trade | Small adverse move → liquidation | Start with **low leverage** (e.g. 2×–5×) until you know the UI and liq. price |
| No stop loss / TP plan | Losses or give-back exceed plan | Set **SL/TP** (or alerts) **before** size feels “too big to exit” |
| Ignoring funding | Silent drag on multi-day holds | Check **rate + interval** before holding through settlements |
| Trading entire balance immediately | One bad trade hits whole stack | **Transfer** only what you intend to risk; keep rest in funding account |
| Impulsive adds after volatility | Revenge trading amplifies drawdowns | Predefine entries/exits; use the **bottom panel** to monitor, not chase |

---

## FAQ

**Why must I transfer before trading?**  
Perpetual **margin and PnL** use the **trading account**. The **funding account** holds deposits and supports withdraw/transfer; it is not the default margin wallet for new positions.

**Can I trade without depositing on-chain?**  
You need **USDC in the trading account**. That usually means **deposit → transfer**, or an internal credit/promotion if your account has one.

**Where are spot markets?**  
ForX **perpetual futures** described here are **not** spot purchase of BTC/ETH. There is no “own the coin in spot wallet” path in this product line.

---

## Disclaimer

Digital asset derivatives are high risk, including **liquidation** and **funding** costs. Screenshots and labels in this guide are illustrative; always follow the live Web/App UI and contract specifications. This article is not investment advice.

*External official documentation · Trading guide*
