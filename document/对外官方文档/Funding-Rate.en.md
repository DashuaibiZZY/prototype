# Funding Rate

Perpetual contracts on ForX have **no expiry**. To keep each contract’s traded price aligned with the **Index Price** of the underlying, ForX uses a **funding mechanism**: at scheduled times, open long and short positions **exchange cash flows** with each other. That pressure helps the perpetual **track the index** instead of drifting far from spot fair value.

**Who pays whom**

- When the **funding rate is positive**, **longs pay shorts**.  
- When the **funding rate is negative**, **shorts pay longs**.

ForX **only facilitates payments between long and short holders** on the platform. **ForX does not charge a separate “funding service fee”** on top of that exchange—the payment is peer-to-peer between position sides.

---

## Settlement schedule and rules

**Default cadence**

On most contracts, funding is exchanged **every 8 hours** at **08:00**, **16:00**, and **24:00 (UTC+8)**.

**Other intervals**

Some contracts use **1-, 2-, or 4-hour** funding intervals instead. The **Funding interval** and **countdown to next settlement** on each contract’s trading or market page are authoritative for that symbol.

**How settlement works**

- Funding accrues and settles with **millisecond-level timing**; **trading is not halted** for funding.  
- Traders with **open positions** at the moment funding is **accounted for** must **pay or receive** funding according to their side and size.  
- If you **fully close** before funding is accounted for that period, you **neither pay nor receive** that period’s funding.  
- If a perpetual is **delisted before** funding for a given period is accounted for, that period’s funding is **void**—no payment in either direction.  
- The **accounting window** for a settlement may last **about one minute**. Example: if you open at **00:00:20 (UTC+8)** while accounting for the **00:00** slot is still in progress, you may still **pay or receive** funding for that slot.

**Parameter changes**

Settlement **times**, **funding rate caps and floors**, and related parameters may be **adjusted in real time** according to market conditions. Always check the live contract page before holding through a settlement.

> **Related:** Index Price construction is described in [Last Price, Index Price & Mark Price](./Last-Price-Index-Price-Mark-Price.en.md).

---

## Funding rate calculation

### Main formula

**Funding rate** = clamp [ ( **Average premium index** + clamp ( **Interest rate** − **Average premium index**, 0.05%, −0.05% ) ) / ( **8 / N** ), **Funding rate cap**, **Funding rate floor** ]

| Symbol | Definition |
|--------|------------|
| **Interest rate** | **0.01%** (fixed for all settlement intervals) |
| **N** | Funding settlement interval in **hours**; **N ∈ {1, 2, 4, 8}** |
| **8 / N** | Normalization factor so **daily-equivalent** funding stays consistent across different settlement frequencies |
| **Funding rate cap / floor** | Per-contract limits; see the **funding rate limits** published on ForX for each contract (trading terminal funding detail or contract specifications) |

### Role of (8 / N) by interval

| Settlement interval | N | Divisor (8 / N) |
|---------------------|---|-----------------|
| 8 hours | 8 | ÷ 1 |
| 4 hours | 4 | ÷ 2 |
| 2 hours | 2 | ÷ 4 |
| 1 hour | 1 | ÷ 8 |

### Premium index

**Premium index** = [ max(0, **Depth-weighted bid** − **Index price**) − max(0, **Index price** − **Depth-weighted ask**) ] / **Index price**

### Average premium index

The **average premium index** is a **weighted average** of premium index samples from the **start of the current settlement period through now**.

At time **Tₙ**, using samples at **T₁, T₂, …, Tₙ**:

**Average premium index at Tₙ** = (1 × premium at **T₁** + 2 × premium at **T₂** + … + n × premium at **Tₙ**) / (1 + 2 + … + n)

**Example:** For an **8-hour** funding period, the rate determined at **14:59** uses premium index values from **07:00 through 14:59** (one sample per minute), so **n = 480**.

### Depth-weighted bid and ask

**Depth-weighted bid (ask) price** = average execution price on the bid (ask) side needed to fill a defined **depth-weighted notional**:

**Depth-weighted bid (ask) price** = **Depth-weighted notional** / **Base quantity** required to fill that notional on the bid (ask) side

**Depth-weighted notional** = **200 × maximum leverage** allowed for that contract  
(Notional is in the contract’s quote terms as defined on ForX.)

---

## Minute-by-minute rate and payment

- The **funding rate is recomputed every minute** from the formulas above.  
- At **settlement**, the payment uses the **latest computed rate** immediately before the settlement moment.

**Example:** For funding exchanged at **16:00**, the rate applied is the one calculated at **15:59**.

Your **position size** and **direction** (long or short) determine whether you pay or receive; the UI shows the **current rate** and **next settlement time** for planning.

---

## FAQ

**Is funding the same as trading fees?**  
No. **Trading fees** (Maker/Taker) apply on each fill; see [Trading Fees](./Trading-Fees.en.md). **Funding** is a periodic transfer between longs and shorts tied to the premium vs index.

**Does funding use Mark Price?**  
Funding formulas use the **Index price** and **order-book depth** (depth-weighted prices). **Mark Price** is used for liquidation and unrealized PnL—see [Last Price, Index Price & Mark Price](./Last-Price-Index-Price-Mark-Price.en.md).

**How do I estimate cost before holding overnight?**  
Multiply approximate **position notional × funding rate** for each settlement you will hold through, noting **sign** (long pays when rate is positive). Rates change every minute until the snapshot used at settlement.

---

## Disclaimer

Digital asset derivatives are high risk. Funding parameters, caps, schedules, and formulas may be updated through official announcements and live contract settings. This article explains mechanics only and is not investment advice.

*External official documentation · Funding rate*
