const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Store checkout is not configured yet.' });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const allowed = {
      'burdock-root': process.env.STRIPE_PRICE_BURDOCK_TINCTURE,
      'dandelion-root': process.env.STRIPE_PRICE_DANDELION_TINCTURE,
      'holy-basil': process.env.STRIPE_PRICE_HOLY_BASIL,
      'mullein': process.env.STRIPE_PRICE_MULLEIN,
      'milk-thistle-mullein': process.env.STRIPE_PRICE_MILK_THISTLE_MULLEIN,
      'plantain-leaf': process.env.STRIPE_PRICE_PLANTAIN_TINCTURE,
      'red-clover': process.env.STRIPE_PRICE_RED_CLOVER,
      'nettle-leaf': process.env.STRIPE_PRICE_NETTLE_LEAF,
      'calendula': process.env.STRIPE_PRICE_CALENDULA,
      'elderberry': process.env.STRIPE_PRICE_ELDERBERRY,
      'chamomile': process.env.STRIPE_PRICE_CHAMOMILE,
      'ginger': process.env.STRIPE_PRICE_GINGER,
      'turmeric': process.env.STRIPE_PRICE_TURMERIC,
      'lemon-balm': process.env.STRIPE_PRICE_LEMON_BALM
    };
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
      return res.status(400).json({ error: 'Please choose at least one product.' });
    }
    const line_items = [];
    for (const item of body.items) {
      const id = String(item.id || '');
      const quantity = Number(item.quantity);
      if (!Object.prototype.hasOwnProperty.call(allowed, id) || !allowed[id]) {
        return res.status(400).json({ error: 'One or more selected products are not available for checkout yet.' });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ error: 'Invalid product quantity.' });
      }
      line_items.push({ price: allowed[id], quantity });
    }
    const origin = `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${origin}/shop-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop.html?payment=cancelled`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: { store: 'Rhodes Herbs' }
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error.message);
    return res.status(500).json({ error: 'Could not start checkout. Please try again later.' });
  }
};
