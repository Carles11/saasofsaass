// scripts/seed-currency-options.mjs
// Run: STRIPE_SECRET_KEY=sk_test_... node scripts/seed-currency-options.mjs
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// minor units: decimal currencies ×100, CLP (zero-decimal) ×1
const PRICES = {
  [process.env.STRIPE_PRICE_ID_PRO_MONTHLY]: {
    usd: 8900,
    gbp: 6900,
    chf: 9900,
    cad: 11900,
    aud: 12900,
    mxn: 89900,
    clp: 45000,
  },
  [process.env.STRIPE_PRICE_ID_PRO_ANNUAL]: {
    usd: 89000,
    gbp: 69000,
    chf: 99000,
    cad: 119000,
    aud: 129000,
    mxn: 899000,
    clp: 450000,
  },
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY]: {
    usd: 21900,
    gbp: 17900,
    chf: 24900,
    cad: 29900,
    aud: 32900,
    mxn: 229900,
    clp: 115000,
  },
  [process.env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL]: {
    usd: 219000,
    gbp: 179000,
    chf: 249000,
    cad: 299000,
    aud: 329000,
    mxn: 2299000,
    clp: 1150000,
  },
  [process.env.STRIPE_PRICE_ID_EXTRA_SITE_MONTHLY]: {
    usd: 1900,
    gbp: 1600,
    chf: 2500,
    cad: 2900,
    aud: 2900,
    mxn: 19900,
    clp: 11000,
  },
  [process.env.STRIPE_PRICE_ID_EXTRA_SITE_ANNUAL]: {
    usd: 19000,
    gbp: 16000,
    chf: 25000,
    cad: 29000,
    aud: 29000,
    mxn: 199000,
    clp: 110000,
  },
};

for (const [priceId, amounts] of Object.entries(PRICES)) {
  if (!priceId) continue;
  const currency_options = Object.fromEntries(
    Object.entries(amounts).map(([cur, unit_amount]) => [cur, { unit_amount }]),
  );
  const updated = await stripe.prices.update(priceId, { currency_options });
  console.log(
    `✓ ${priceId}: ${Object.keys(updated.currency_options ?? {}).join(", ")}`,
  );
}
