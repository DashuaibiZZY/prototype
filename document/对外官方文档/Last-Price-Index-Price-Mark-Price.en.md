# Last Price, Index Price & Mark Price

On ForX perpetual futures, **Last Price**, **Index Price**, and **Mark Price** serve different roles: the first reflects the latest trade, the second anchors cross-market spot fairness, and the third drives risk management and PnL. Understanding how they differ helps you set take-profit/stop-loss triggers, interpret unrealized PnL, and avoid being misled by a thin book or a single outlier print.

---

## 1. Last Price

The **Last Price** is the price of the **most recent trade** in the contract. It updates in real time as matches occur and is shown on the order book mid-strip and in market lists.

Because it mirrors the latest executed activity, the Last Price is especially relevant for **short-term and intraday** strategies where decisions depend on what just traded.

> **Tip:** Conditional orders (e.g. TP/SL) can use Last Price, Mark Price, or Index Price as the trigger. Use **Last Price** when you want “this level was actually traded”; use **Mark** or **Index** when you care more about fair value and liquidation-related logic.

---

## 2. Index Price

The **Index Price** is a **volume-informed weighted composite** of spot (or index) references from major venues. It represents a cross-market fair level for the underlying and is a key input for **funding fees**.

### Components and weights

ForX derives the index from four major platforms (exact symbol mapping is configured per contract):

- Binance  
- OKX  
- Bybit  
- Hyperliquid  

Weights are **not static**. They are adjusted based on each venue’s **share of trading volume** (or an equivalent liquidity measure) in the sample pool, so the index tracks where liquidity actually trades. Weights are **rebalanced every four hours** to reflect changing flow across venues.

### Primary uses

- **Funding:** Perpetual funding rates are anchored to the Index Price so periodic payments reflect cross-market spot basis rather than a single venue’s local quote.  
- **Anomaly resilience:** A brief spike, outage, or dislocation on one exchange has limited impact on the composite—useful for **swing** positions and **funding cost** planning.  
- **Display and triggers:** Shown on the trading UI; may also be selectable as a conditional-order trigger where supported.

> **Note:** The Index Price is a **composite fair reference**, not ForX’s Last Price and not the Mark Price.

---

## 3. Mark Price

The **Mark Price** is the **primary risk-management reference** on ForX. It is used to:

- Calculate **Unrealized PnL**  
- Trigger **liquidations**  
- Assess **margin** and account risk  

Compared with Last Price, Mark Price is designed to be **smoother** and **more resistant to manipulation** from isolated prints or a temporarily thin order book.

### How it is calculated

Mark Price is the **median** of the following **three components** (the middle value when the three are sorted):

| Component | Definition |
|-----------|------------|
| **A. Last traded price** | The contract’s most recent trade (same as Last Price). |
| **B. Order book mid** | `(Best bid + Best ask) ÷ 2`. |
| **C. Fair index price** | Index Price extrapolated by funding and time to the next funding settlement:<br>**Fair index = Index Price × (1 + Funding rate × Hours until next funding settlement ÷ Funding interval in hours)**<br>Funding rate is the current applied rate (sign included). The funding interval is the contract’s published settlement period on ForX (commonly 8 hours—confirm on the trading page countdown and contract specs). |

**Mark Price = median(A, B, C)**

### Why a median?

Using only Last Price or a single mid-quote would allow attackers to move liquidation references via self-trades or by thinning the book. Combining **last trade**, **book center**, and **funding-adjusted fair index**, then taking the **median**:

- One extreme component cannot easily drag Mark Price alone;  
- Mark stays relatively stable when the book is thin or funding is volatile;  
- Unrealized PnL and liquidations align better with **defensible fair value** than with a one-off tick.

---

## FAQ

**Why doesn’t my unrealized PnL match a quick calc using Last Price?**  
Positions and account unrealized PnL typically use **Mark Price** (or the rule defined for the product), not Last Price.

**Which price drives funding?**  
Funding is tied to the **Index Price** and open interest structure; see ForX funding rules for the exact formula per contract.

**Which price triggers liquidation?**  
**Mark Price** (together with margin rules), not Last Price alone.

---

## Disclaimer

Digital asset derivatives are high risk. This article explains price mechanics only and is not investment advice. ForX may adjust index constituents, weighting, Mark Price methodology, and funding parameters as markets and compliance require; material changes will be announced through official channels.

*External official documentation · Price mechanics*
