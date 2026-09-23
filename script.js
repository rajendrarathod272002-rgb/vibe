const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allProducts = [];
let currentCategory = 'all';
let currentSort = 'default';
let currentMaxPrice = 100000;
let currentSizes = [];
let cart = JSON.parse(localStorage.getItem('vybe-cart')) || [];

function saveCart() { localStorage.setItem('vybe-cart', JSON.stringify(cart)); }

// ---------- THEME ----------
function toggleTheme() {
    const cb = document.getElementById('theme-checkbox');
    if (cb && cb.checked) { document.body.classList.add('light-mode'); localStorage.setItem('vybe-theme', 'light'); }
    else { document.body.classList.remove('light-mode'); localStorage.setItem('vybe-theme', 'dark'); }
}
function loadTheme() {
    const saved = localStorage.getItem('vybe-theme');
    const cb = document.getElementById('theme-checkbox');
    if (saved === 'light') { document.body.classList.add('light-mode'); if (cb) cb.checked = true; }
}

// ---------- CATEGORIES ----------
async function loadCategories() {
    const container = document.getElementById('category-buttons');
    if (!container) return;
    const { data, error } = await supabaseClient.from('categories').select('*').eq('is_active', true);
    if (error) return console.error(error);
    
    let html = `<button class="cat-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="switchCategory('all')">All Products</button>`;
    data.forEach(cat => {
        if (cat.image_url) {
            html += `<div class="cat-img-btn ${currentCategory === cat.slug ? 'active' : ''}" data-cat="${cat.slug}" onclick="switchCategory('${cat.slug}')">
                <img src="${cat.image_url}" alt="${cat.name}"></div>`;
        } else {
            html += `<button class="cat-btn ${currentCategory === cat.slug ? 'active' : ''}" data-cat="${cat.slug}" onclick="switchCategory('${cat.slug}')">${cat.name}</button>`;
        }
    });
    container.innerHTML = html;
}

function switchCategory(slug) {
    currentCategory = slug;
    document.querySelectorAll('.cat-btn, .cat-img-btn').forEach(b => b.classList.remove('active'));
    const active = document.querySelector(`.cat-btn[data-cat="${slug}"], .cat-img-btn[data-cat="${slug}"]`);
    if (active) active.classList.add('active');
    applyFilters();
}

// ---------- PRODUCTS ----------
async function fetchProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*, categories!inner(name, slug, is_active)')
        .eq('categories.is_active', true)
        .eq('is_active', true);
    if (error) return console.error(error);
    allProducts = data;
    applyFilters();
}

function applyFilters() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    // Read filter inputs
    const sortEl = document.getElementById('sort-select');
    const priceEl = document.getElementById('price-range');
    if (sortEl) currentSort = sortEl.value;
    if (priceEl) {
        currentMaxPrice = parseInt(priceEl.value);
        const pd = document.getElementById('price-display');
        if (pd) pd.innerText = '₹' + currentMaxPrice;
    }
    
    let filtered = [...allProducts];
    
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.categories.slug === currentCategory);
    }
    
    filtered = filtered.filter(p => p.price <= currentMaxPrice);
    
    if (currentSizes.length > 0) {
        filtered = filtered.filter(p => p.sizes && p.sizes.some(s => currentSizes.includes(s)));
    }
    
    if (currentSort === 'low-high') filtered.sort((a,b) => a.price - b.price);
    else if (currentSort === 'high-low') filtered.sort((a,b) => b.price - a.price);
    else if (currentSort === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
    else if (currentSort === 'newest') filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    
    renderProducts(filtered);
}

function toggleSizeFilter(size) {
    const idx = currentSizes.indexOf(size);
    if (idx > -1) currentSizes.splice(idx, 1);
    else currentSizes.push(size);
    document.querySelectorAll('.size-chip').forEach(c => c.classList.toggle('active', currentSizes.includes(c.dataset.size)));
    applyFilters();
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const title = document.getElementById('category-title');
    if (title) {
        if (currentCategory === 'all') title.innerText = 'All Products';
        else title.innerText = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) + ' Collection';
    }
    
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><h3>No products found</h3><p>Try changing filters</p></div>`;
        return;
    }
    
    grid.innerHTML = products.map(p => {
        const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        return `
        <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
            <div class="product-image-wrapper">
                <img src="${p.image_url}" alt="${p.name}" class="main-img" loading="lazy">
                ${p.hover_image_url ? `<img src="${p.hover_image_url}" alt="${p.name}" class="hover-img" loading="lazy">` : ''}
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="product-price-row">
                    <span class="price">₹${p.price}</span>
                    ${discount > 0 ? `<span class="mrp">₹${p.mrp}</span><span class="discount">${discount}% OFF</span>` : ''}
                </div>
                <button onclick="event.stopPropagation(); quickAddToCart(${p.id})">Add to Cart</button>
            </div>
        </div>`;
    }).join('');
}

function quickAddToCart(productId) {
    const p = allProducts.find(x => x.id === productId);
    if (!p) return;
    addToCart(p.id, p.name, p.price, p.sizes?.[0] || 'M');
}

// ---------- CART ----------
function addToCart(id, name, price, size = 'M') {
    const key = `${id}-${size}`;
    const existing = cart.find(item => item.key === key);
    if (existing) existing.quantity += 1;
    else cart.push({ key, id, name, price, size, quantity: 1 });
    saveCart();
    updateCartCount();
    showToast(`${name} (${size}) added to cart`);
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) el.innerText = cart.reduce((s, i) => s + i.quantity, 0);
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);padding:20px 0;text-align:center;">Your cart is empty</p>';
        totalDiv.innerText = 'Total: ₹0';
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += item.price * item.quantity;
        return `<div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <small style="color:var(--muted);">Size: ${item.size} • ₹${item.price}</small>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            </div>
        </div>`;
    }).join('');
    totalDiv.innerText = `Total: ₹${total}`;
}

function changeQty(idx, delta) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function proceedToCheckout() {
    if (cart.length === 0) return showToast('Cart is empty');
    toggleCart();
    window.location.href = 'checkout.html';
}

// ---------- TRACKING ----------
async function trackOrder() {
    const id = document.getElementById('tracking-id')?.value?.trim();
    const resultDiv = document.getElementById('tracking-result');
    if (!id) return showToast('Enter Tracking ID');
    
    const { data, error } = await supabaseClient.from('orders').select('*').eq('tracking_id', id).single();
    if (error || !data) {
        resultDiv.innerHTML = `<p style="color:#ff4444;margin-top:20px;">Order not found</p>`;
        return;
    }
    resultDiv.innerHTML = `
        <div style="margin-top:20px;padding:25px;background:var(--card-bg);border-radius:12px;max-width:500px;margin-left:auto;margin-right:auto;text-align:left;border:1px solid var(--border-color);">
            <h3 style="margin-bottom:15px;">Order: ${data.tracking_id}</h3>
            <p style="margin-bottom:8px;"><strong>Status:</strong> <span style="color:var(--primary-cyan);font-weight:700;">${data.status}</span></p>
            <p style="margin-bottom:8px;"><strong>Name:</strong> ${data.customer_name}</p>
            <p style="margin-bottom:8px;"><strong>Total:</strong> ₹${data.total_amount}</p>
            <p style="color:var(--muted);font-size:0.85rem;"><strong>Placed:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
        </div>`;
}

// ---------- BANNERS ----------
async function loadBanners() {
    const container = document.getElementById('banner-carousel');
    if (!container) return;
    const { data } = await supabaseClient.from('banners').select('*').eq('is_active', true).order('sort_order');
    
    if (!data || data.length === 0) {
        // Fallback: agar koi banner nahi hai toh hero section dikhao
        return;
    }
    
    container.innerHTML = data.map((b, i) => `
        <div class="banner-slide ${i === 0 ? 'active' : ''}" style="position:relative;">
            <img src="${b.image_url}" alt="${b.title || 'Banner'}">
            ${b.title ? `
                <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.7),rgba(0,0,0,0.2));display:flex;flex-direction:column;justify-content:center;padding:0 8%;color:#fff;">
                    <h1 style="font-size:2.5rem;margin-bottom:10px;color:#fff;background:none;-webkit-text-fill-color:#fff;">${b.title}</h1>
                    ${b.subtitle ? `<p style="font-size:1.1rem;color:#ddd;">${b.subtitle}</p>` : ''}
                    ${b.link ? `<a href="${b.link}" style="display:inline-block;margin-top:20px;padding:12px 30px;background:#8A2BE2;color:#fff;border-radius:30px;font-weight:700;width:fit-content;text-decoration:none;">Shop Now</a>` : ''}
                </div>
            ` : ''}
        </div>
    `).join('') + `<div class="banner-dots">${data.map((_, i) => `<span class="${i === 0 ? 'active' : ''}" onclick="showBanner(${i})"></span>`).join('')}</div>`;
    
    let current = 0;
    setInterval(() => { current = (current + 1) % data.length; window.showBanner(current); }, 5000);
    window.showBanner = (i) => {
        current = i;
        document.querySelectorAll('.banner-slide').forEach((s, idx) => s.classList.toggle('active', idx === i));
        document.querySelectorAll('.banner-dots span').forEach((s, idx) => s.classList.toggle('active', idx === i));
    };
}

// ---------- INIT ----------
function scrollToShop() {
    const el = document.getElementById('shop');
    if (el) el.scrollIntoView();
}

window.onload = () => {
    loadTheme();
    updateCartCount();
    if (typeof checkAuthSession === 'function') checkAuthSession();
    if (document.getElementById('category-buttons')) { loadCategories(); fetchProducts(); }
    if (document.getElementById('banner-carousel')) loadBanners();
};
