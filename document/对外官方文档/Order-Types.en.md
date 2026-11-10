# Order Types

On ForX **USDC-margined perpetual futures**, you place orders through several entry modes: **Limit**, **Market**, **Take-Profit / Stop-Loss (TP/SL)**, and **Advanced limit**. Each mode answers a different execution need—resting liquidity, immediate fill, conditional risk control, or strict time-in-force rules. This article describes how they behave on ForX in line with common perpetual-futures practice (similar in spirit to major venues such as OKX).

---

## Overview

| Mode | What you specify | Typical use |
|------|------------------|-------------|
| **Limit** | Price (and size) | Rest at a level; pay maker fees when you provide liquidity |
| **Market** | Size only | Enter or exit quickly at the best available prices |
| **TP/SL** | Trigger price(s) and order price(s) | Protect or lock in PnL on a position, or open a position when a level is hit |
| **Advanced limit** | Limit price + **Post Only**, **FOK**, or **IOC** | Maker-only posting, all-or-nothing, or immediate partial fill |

Open orders appear under **Open orders** in the trading UI, grouped by type (e.g. limit/market, advanced limit, TP/SL) where the product supports it.

---

## 1. Limit order

A **limit order** buys or sells at your **limit price** or **better**:

- **Buy limit:** fills at your limit or **lower**.  
- **Sell limit:** fills at your limit or **higher**.

Unfilled quantity **rests on the order book** until it is fully filled, canceled, or expired according to product rules. Standard limit orders on ForX use **Good-Till-Canceled (GTC)** time in force unless you choose an advanced limit variant (below).

**When to use:** You have a target entry or exit price and are willing to wait for the market to come to you. Limit orders can earn **maker** rebates or lower fees when they add liquidity.

> **Note:** A limit order is not guaranteed to fill. In fast markets, price may move away before your order trades.

---

## 2. Market order

A **market order** buys or sells **immediately** at the **best available prices** on the book until your size is filled or liquidity runs out.

- You do **not** set a limit price; execution price is determined by the current bid/ask stack and trade flow.  
- **Slippage** is possible—especially in thin books or during volatility—so the average fill may differ from the last displayed price.

On ForX, market orders are executed with **Immediate-or-Cancel (IOC)**-style behavior at the engine level: the system takes liquidity right away; any unfilled remainder is not left resting as a limit order (subject to minimum size and contract rules).

**When to use:** Speed matters more than an exact price—e.g. urgent exit, breakout entry, or **close at market** actions.

---

## 3. Take-Profit / Stop-Loss (TP/SL)

**TP/SL** orders are **conditional**: they **watch a trigger price** (based on a price type you select, such as **Last**, **Mark**, or **Index**—see [Last Price, Index Price & Mark Price](./Last-Price-Index-Price-Mark-Price.en.md)). When the trigger condition is met, ForX **places a real order** (usually limit or market, per your settings) at the **order price** you define.

### 3.1 TP/SL on an open position

You can attach TP/SL to **existing positions** to:

- **Take profit (TP):** close (or reduce) when price moves favorably to your target.  
- **Stop loss (SL):** close (or reduce) when price moves against you to a loss limit.

This helps manage risk without watching the screen continuously. Multiple TP/SL plans on the same position may be supported per contract rules; check the position panel and order list on ForX.

### 3.2 TP/SL to open a position

TP/SL is **not only for closing**. You can use it to **open** long or short when the market reaches a preset level—for example, buy when price breaks above a resistance trigger, or sell when price breaks below support. The same mechanics apply: **trigger first**, then the system submits the **opening** order at your **order price** (or market, if allowed).

### 3.3 One-way vs two-way (OCO-style) TP/SL

Where the UI offers **one-way** and **two-way** modes:

- **One-way:** You set a **single** trigger and order price. When the market hits the trigger, ForX places the linked order.  
- **Two-way:** You set **both** take-profit and stop-loss triggers (and their order prices). When **either** side triggers and the corresponding order is placed, the **other side is canceled** automatically—similar to a one-cancels-the-other (OCO) pair for the same intent.

> **Tip:** Triggers on **Mark Price** align better with liquidation and fair-value logic; **Last Price** follows the latest trade. Choose the trigger type that matches your strategy.

---

## 4. Advanced limit orders

**Advanced limit** is still a **limit-priced** order, but with a stricter **time in force (TIF)**. On ForX you choose one of:

### 4.1 Post Only

**Post Only** ensures your order **only adds liquidity (maker)**.

- If the order would **immediately match** as a taker against the book, it is **rejected or canceled** (not partially executed as taker), depending on engine rules.  
- Use when you want **maker fee tier** and avoid accidental taker fills when posting near the touch.

Also labeled **“maker only”** on some interfaces.

### 4.2 FOK — Fill or Kill

**FOK (Fill or Kill)** requires the **entire order size** to be filled **immediately** at your limit price or better.

- If the book cannot fill **100%** of the size at once, the order is **canceled in full**—no partial resting quantity.  
- Use when you need **all-or-nothing** execution at your price (e.g. basis or hedge leg size must match exactly).

### 4.3 IOC — Immediate or Cancel

**IOC (Immediate or Cancel)** fills **as much as possible right away** at your limit price or better, then **cancels any unfilled remainder**.

- Unlike GTC limit, the leftover size does **not** stay on the book.  
- Use when you want **immediate partial liquidity** without leaving a passive order behind.

> **Relation to standard limit:** A regular **limit (GTC)** rests until filled or canceled. **Post Only**, **FOK**, and **IOC** are **advanced limit** variants with different TIF rules. **Market** orders on ForX behave like immediate taking (IOC-style), not like GTC limits.

---

## 5. Quick comparison

| Type | Rests on book? | Partial fill? | Main constraint |
|------|----------------|---------------|-----------------|
| Limit (GTC) | Yes, until done/canceled | Yes | Price ≥ limit (sell) or ≤ limit (buy) |
| Market | No | Yes (until size or liquidity) | Best available prices |
| TP/SL | No until triggered | Depends on child order | Trigger price + order price |
| Post Only | Yes if accepted | Yes | Must not take on entry |
| FOK | No | All or zero | Full size at once |
| IOC | No | Yes, then cancel rest | Immediate at limit |

---

## FAQ

**Can I change the trigger price type for TP/SL?**  
Where supported, you can select **Last**, **Mark**, or **Index** (and possibly others per contract). Mark is often used for stop-loss near liquidation-sensitive levels.

**Why was my Post Only order rejected?**  
It would have crossed the spread and executed as taker. Reprice away from the touch or use a standard limit if taker execution is acceptable.

**What is the difference between TP/SL on a position and “attach TP/SL” on a limit order?**  
**Position TP/SL** manages an **open position**. **Attach TP/SL** on a working **entry** order creates conditional exits **after** that entry fills (sometimes only after **full** fill for scaled take-profit—see product hints in the UI).

**Do advanced limit orders show separately in order history?**  
ForX groups **Post Only / FOK / IOC** under **advanced limit** in lists where the product distinguishes them from plain GTC limit/market rows.

---

## Disclaimer

Digital asset derivatives are high risk. Order types and time-in-force rules can change with system upgrades and contract specifications. This article describes general product behavior only and is not investment advice. Always confirm fees, minimum size, and trigger logic on the live trading page before placing orders.

*External official documentation · Order types*
