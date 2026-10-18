# Rhodes Herbs shop page overlay for existing Vercel site

This bundle adds a dedicated `/shop.html` page and Stripe Checkout backend to the existing `beats4books/rhodesherbs.space` static website. It does not replace `index.html` or existing pages.

## Files to add to the repository root
- `shop.html`
- `shop-styles.css`
- `shop-products.js`
- `shop-store.js`
- `shop-success.html`
- `api/checkout.js` (create the `api` folder if needed)
- `package.json` (adds the Stripe server dependency)
- `vercel.json` (ensure you merge with any existing Vercel configuration rather than overwrite important settings)

## Before checkout can accept payments
1. In Stripe, create products and one-time prices for the products you really sell.
2. In Vercel project Settings → Environment Variables, set `STRIPE_SECRET_KEY` and matching `STRIPE_PRICE_*` IDs as documented in the existing store README. Use test keys first.
3. Edit `shop-products.js` to set real descriptions, sizes, price labels, numeric prices, and `enabled: true` only when those prices match Stripe. Starter product buttons are disabled by default.
4. Deploy, test a complete payment in Stripe test mode, then configure live credentials only after Stripe activation.
5. Add a `Shop` link to the existing site's navigation (for example `href="shop.html"`) when you are ready. This bundle's shop page already links back to existing Home, Learn, and Contact pages.

Never place Stripe secret keys in HTML or browser JavaScript. This bundle does not itself publish files or activate Stripe. Before taking real orders, configure signed Stripe webhooks and a reliable order-fulfillment process.
