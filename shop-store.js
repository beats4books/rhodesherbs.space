(() => {
  const products = window.RHODES_PRODUCTS || [];
  const grid = document.getElementById('product-grid');
  const cart = new Map();
  const cartPanel = document.getElementById('cart-panel');
  const overlay = document.getElementById('overlay');
  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  document.getElementById('year').textContent = new Date().getFullYear();
  const renderProducts = filter => {
    const shown = products.filter(p => filter === 'all' || p.category === filter);
    grid.innerHTML = shown.map(p => `<article class="product-card"><div class="product-art"><span class="product-symbol">${p.symbol}</span><span class="product-type">${p.art}</span></div><div class="product-info"><span class="product-category">${p.categoryLabel}</span><h3>${p.name}</h3><p>${p.description}</p><div class="product-buy-row"><span class="product-price">${p.priceLabel || (Number.isFinite(p.price) ? money(p.price) : 'Price to be set')}</span><button class="add-button" data-add="${p.id}" ${p.enabled && Number.isFinite(p.price) && p.price > 0 ? '' : 'disabled'}>${p.enabled ? 'Add to cart +' : 'Coming soon'}</button></div></div></article>`).join('');
    grid.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {const p=products.find(x=>x.id===btn.dataset.add);if(!p||!p.enabled||!Number.isFinite(p.price)||p.price<=0)return;cart.set(p.id,(cart.get(p.id)||0)+1);renderCart();openCart();}));
  };
  const renderCart = () => {
    const count=[...cart.values()].reduce((a,b)=>a+b,0);document.getElementById('cart-count').textContent=count;
    const items=[...cart.entries()].map(([id,qty])=>({p:products.find(p=>p.id===id),qty})).filter(x=>x.p);
    document.getElementById('cart-items').innerHTML=items.length?items.map(({p,qty})=>`<div class="cart-line"><div><h3>${p.name}</h3><small>${money(p.price)} each</small><div class="quantity"><button data-qty="${p.id}" data-change="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${qty}</span><button data-qty="${p.id}" data-change="1" aria-label="Increase ${p.name} quantity">+</button><button data-qty="${p.id}" data-change="0" aria-label="Remove ${p.name}">Remove</button></div></div><span class="cart-line-price">${money(p.price*qty)}</span></div>`).join(''):'<p class="empty-cart">Your cart is empty. Explore the collection to get started.</p>';
    document.getElementById('cart-total').textContent=money(items.reduce((sum,{p,qty})=>sum+p.price*qty,0));
    document.getElementById('checkout').disabled=!items.length;
    document.querySelectorAll('[data-qty]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.qty,next=(cart.get(id)||0)+Number(btn.dataset.change);if(Number(btn.dataset.change)===0||next<=0)cart.delete(id);else cart.set(id,next);renderCart();}));
  };
  const openCart=()=>{cartPanel.classList.add('open');cartPanel.setAttribute('aria-hidden','false');overlay.classList.add('show');};
  const closeCart=()=>{cartPanel.classList.remove('open');cartPanel.setAttribute('aria-hidden','true');overlay.classList.remove('show');};
  document.getElementById('cart-toggle').addEventListener('click',openCart);document.getElementById('cart-close').addEventListener('click',closeCart);overlay.addEventListener('click',closeCart);
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===btn));renderProducts(btn.dataset.filter);}));
  document.getElementById('checkout').addEventListener('click',async()=>{
    const button=document.getElementById('checkout'),err=document.getElementById('checkout-error');err.textContent='';button.disabled=true;button.textContent='Connecting to secure checkout…';
    try{const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[...cart.entries()].map(([id,quantity])=>({id,quantity}))})});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||'Checkout is not configured yet. Please contact the store.');window.location.assign(data.url);}catch(e){err.textContent=e.message||'Unable to start checkout. Please try again.';button.disabled=false;button.innerHTML='Secure checkout <span>→</span>';}
  });
  const params=new URLSearchParams(location.search);if(params.get('payment')==='cancelled'){const note=document.createElement('div');note.className='toast';note.textContent='Checkout was cancelled. Your items are still here when you are ready.';document.body.append(note);setTimeout(()=>note.remove(),5000);}
  renderProducts('all');renderCart();
})();
