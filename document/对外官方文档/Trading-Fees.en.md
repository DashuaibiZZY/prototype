# Trading Fees

ForX **USDC-margined perpetual futures** charge a **trading fee** on each fill. Fees depend on whether your order **adds liquidity (maker)** or **removes liquidity (taker)**, and on which **fee schedule** applies to you for that contract.

ForX uses **two fee structures**:

1. **ForX VIP tier fees** — platform-wide Maker/Taker rates tied to your **rolling 14-day trading volume**.  
2. **Contract-specific (pair) fees** — optional **per-contract** Maker/Taker rates that apply only on selected markets when enabled by the platform.

This article explains what each structure means and how to see the rates that apply to you.

---

## Maker vs Taker

| Role | Meaning | Typical order types |
|------|---------|---------------------|
| **Maker** | Your order **rests on the book** and is filled by someone else later | Limit orders that do not immediately cross the spread; **Post Only** limits |
| **Taker** | Your order **matches existing liquidity** immediately | **Market** orders; limits that cross the book |

Fees are quoted as a **percentage of traded notional** (contract value at fill). They are deducted from your account balance (or settlement currency per product rules) when trades execute.

> **Note:** Trading fees are separate from **funding fees**, which periodic long/short payments use to anchor the perpetual to spot. See the funding section on each contract’s market page.

---

## Which fee structure applies?

For a given fill on a contract:

- If that contract has **contract-specific fees enabled**, those **Maker/Taker rates apply to trades on that contract**, instead of your VIP tier rates for that market only.  
- Otherwise, your **VIP tier** Maker/Taker rates apply (based on your recent volume tier).

When both could exist, **contract-specific fees take precedence on that contract**. Other contracts without a pair override still use your VIP tier.

---

## 1. ForX VIP tier fees

### What it is

**VIP tier fees** are the **default** schedule for perpetual trading on ForX. Your **VIP level (VIP 0–VIP 5)** is determined by your **contract trading volume over the past 14 days** (USD notional, per platform measurement rules). Higher volume unlocks **lower Maker and Taker fees**.

Your tier is **recalculated on a regular schedule** (typically daily at **24:00 UTC+8**). When your 14-day volume moves you into a new band, **new trades** use the updated rates. If volume falls below your current band, your tier **steps down** to match actual volume—historical peak tiers are not kept once volume no longer qualifies.

### ForX VIP fee schedule

| Tier | 14-day volume threshold (USD) | Maker | Taker |
|------|--------------------------------|-------|-------|
| **VIP 0** | < $1M | 0.015% | 0.045% |
| **VIP 1** | ≥ $1M and < $5M | 0.013% | 0.042% |
| **VIP 2** | ≥ $5M and < $25M | 0.011% | 0.039% |
| **VIP 3** | ≥ $25M and < $100M | 0.008% | 0.036% |
| **VIP 4** | ≥ $100M and < $300M | 0.005% | 0.033% |
| **VIP 5** | ≥ $300M | 0.00% | 0.030% |

**How to read the threshold column**

- **VIP 0:** volume strictly below the VIP 1 minimum (`< $1M`).  
- **Middle tiers:** volume at or above this tier’s minimum **and** below the next tier’s minimum (e.g. VIP 2: `≥ $5M and < $25M`).  
- **VIP 5:** volume at or above `$300M`.

Logged-in users see their **current tier highlighted** in the fee table where the product supports it.

### Where to view VIP fees

| Platform | Where to look |
|----------|----------------|
| **Web** | On the **contract trading** page, the **fee rate** line below the order panel shows your effective **VIP level** and **Taker / Maker** percentages. **Click** it to open the **VIP fee modal** (`ForX perpetual VIP fee schedule`): full tier table, your **past 14-day volume** (when logged in), and tier rules. You can also open the same table from the **Portfolio** VIP card (**fee tier table**). |
| **App** | Open **Fees** from the contract **More** menu (or the dedicated **VIP fee tier** page from Profile / home shortcuts). The page shows your **current VIP level**, **14-day volume**, **Maker/Taker** rates, the **full VIP table**, and upgrade progress when you are on the natural VIP path. |

Guests can usually open the **VIP fee table** to read platform defaults; personal volume and tier highlighting require login.

---

## 2. Contract-specific (pair) fees

### What it is

**Contract-specific fees** are **optional per-contract Maker/Taker rates** configured by ForX for individual perpetual markets (for example, a promotional or liquidity program on one symbol).

When **enabled** for a contract:

- Trades on **that contract** are charged the **published pair Maker/Taker rates**, **not** your VIP tier rates for those fills.  
- Trades on **other contracts** without an override continue to use your **VIP tier** (unless another pair override exists there).

Pair fees are **not** a second VIP ladder—they are **fixed rates for that market** until the platform changes or disables the configuration.

### Where to view contract-specific fees

Effective rates—including **pair overrides** when active—are shown in the same places you check standard fees:

| Platform | Where to look |
|----------|----------------|
| **Web** | **Trading terminal fee rate** line and the **VIP fee modal** opened from it: when a pair override applies to the **current contract**, the UI reflects the **Maker/Taker rates in effect for that market** (see modal copy and numbers for the selected symbol). |
| **App** | **Fees / VIP fee tier** page and contract-trading **fee** entry points: review the **Maker/Taker** shown for your account and contract context; pair-specific values appear when configured for the market you are viewing or trading. |

If no pair override is active on a contract, only your **VIP tier** rates apply there.

---

## FAQ

**Are fees charged on opening and closing?**  
Yes—each **fill** (open, add, reduce, or close) incurs Maker or Taker fee according to how the order executed.

**Do advanced limit types change the fee type?**  
**Post Only** is intended to execute as **maker** when accepted. **Market** and immediate-taking limits typically pay **taker** on matched quantity.

**Can VIP tiers or pair fees change?**  
ForX may update schedules, thresholds, or pair programs through official announcements. The **in-app fee modal** and **App fee page** show the **current** published values.

**Why does my friend’s rate differ on the same symbol?**  
They may be on a **different VIP tier**, or one of you may be affected by a **time-limited platform program** on specific contracts. Always check **your** displayed Maker/Taker before trading.

---

## Disclaimer

Digital asset derivatives are high risk. Fee schedules, volume measurement, and settlement times may change with product and compliance updates. This article is for general information only and is not tax or investment advice. Confirm fees on the live **Web fee modal** or **App fee page** before placing orders.

*External official documentation · Trading fees*
