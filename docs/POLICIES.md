# Campaign policies — Offerly (system summary)

> Rules enforced by the **Policy Validator** agent. Simplified for this project.

## 1. Discounts

- Minimum discount: **30%** off the recommended retail price (RRP).
- Recommended maximum discount: **70%**. Above that requires justification
  ("clearance", "grand opening"). Above **80%** is blocked outright.
- The Offerly price must cover the merchant's **variable cost**. If the
  simulation gives a negative per-unit margin, the campaign is rejected.

## 2. Voucher expiry & redemption

- Minimum voucher validity: **60 days** from purchase.
- Maximum voucher validity: **365 days**.
- The merchant must offer at least **3 weekly slots** for redemption
  (anti-saturation).

## 3. Regulated categories

- **Health & wellbeing**: must not promise medical outcomes ("cure",
  "guaranteed", "lose 10 kg"). Disclaimer required.
- **Food with alcohol**: alcohol cannot be the main hook in the title.
  Visible minimum age.
- **Professional services** (legal, financial): only verified-license
  providers.

## 4. Copy

- Title at most **70 characters**.
- Description between **150 and 600 characters**.
- No all-caps, no multiple exclamations ("!!!"), no false superlatives
  ("the best in town").

## 5. Operational constraints

- **Minimum stock** declared: 20 vouchers (to make the offer publishable).
- **Maximum stock**: 10× the merchant's estimated weekly capacity
  (anti-overbooking).
- Exclusions (holidays, eves) must be listed explicitly.

## 6. Offerly commission

- Default commission: **40%** of the Offerly price.
- Negotiable down to **30%** for merchants bringing historical volume.

## 7. Supported categories

`spa_beauty`, `food_drink`, `leisure_activities`, `health`, `fitness`,
`home_services`, `travel_getaways`.
