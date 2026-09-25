// =========================================
// VYBE — Frontend Logic & Supabase Integration
// Brand Tagline: "Crafted Beyond Ordinary"
// Hierarchical Category System (3-Level)
// =========================================

const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LEVEL 1: DEFAULT TOP CATEGORIES (Brand Lines)
const DEFAULT_CATEGORIES = [
    {
        id: 1,
        name: 'VYBE Everyday',
        slug: 'everyday',
        theme_color: '#FF8C00',
        logo_url: '/assets/images/everyday_logo.jpg',
        image_url: '/assets/images/everyday_logo.jpg',
        description: 'Heavyweight tees, denim, and daily precision essentials.'
    },
    {
        id: 2,
        name: 'VYBE Studio',
        slug: 'studio',
        theme_color: '#00BFFF',
        logo_url: '/assets/images/studio_logo.jpg',
        image_url: '/assets/images/studio_logo.jpg',
        description: 'Tailored overshirts, architectural blazers, and smart casuals.'
    },
    {
        id: 3,
        name: 'VYBE Signature',
        slug: 'signature',
        theme_color: '#8A2BE2',
        logo_url: '/assets/images/signature_logo.jpg',
        image_url: '/assets/images/signature_logo.jpg',
        description: 'Limited collector lots, gold 3D embroidery, and pinnacle luxury.'
    }
];

// LEVEL 2: DEFAULT TYPES (Sub-categories inside each top category)
const DEFAULT_TYPES = [
    // Under VYBE Everyday (id: 1)
    { id: 101, category_id: 1, name: 'Men Fashion', slug: 'men-fashion', image_url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400', count: 24, is_active: true, sort_order: 1 },
    { id: 102, category_id: 1, name: 'Women', slug: 'women', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', count: 18, is_active: true, sort_order: 2 },
    { id: 103, category_id: 1, name: 'Kids', slug: 'kids', image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', count: 12, is_active: true, sort_order: 3 },
    { id: 104, category_id: 1, name: 'Casual Wear', slug: 'casual-wear', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', count: 30, is_active: true, sort_order: 4 },
    // Under VYBE Studio (id: 2)
    { id: 201, category_id: 2, name: 'Formal Shirts', slug: 'formal-shirts', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', count: 20, is_active: true, sort_order: 1 },
    { id: 202, category_id: 2, name: 'Blazers', slug: 'blazers', image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', count: 15, is_active: true, sort_order: 2 },
    { id: 203, category_id: 2, name: 'Party Wear', slug: 'party-wear', image_url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', count: 18, is_active: true, sort_order: 3 },
    { id: 204, category_id: 2, name: 'Footwear', slug: 'footwear', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', count: 22, is_active: true, sort_order: 4 },
    // Under VYBE Signature (id: 3)
    { id: 301, category_id: 3, name: 'Premium Suits', slug: 'premium-suits', image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', count: 10, is_active: true, sort_order: 1 },
    { id: 302, category_id: 3, name: 'Watches', slug: 'watches', image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', count: 14, is_active: true, sort_order: 2 },
    { id: 303, category_id: 3, name: 'Jewelry', slug: 'jewelry', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', count: 16, is_active: true, sort_order: 3 },
    { id: 304, category_id: 3, name: 'Accessories', slug: 'accessories', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', count: 25, is_active: true, sort_order: 4 }
];

// LEVEL 3: FLAGSHIP & DEFAULT PRODUCTS (Each belongs to Category AND Type)
const FLAGSHIP_AUCTION_PRODUCT = {
    id: 9999,
    name: "VYBE Signature \"King #1\" Limited Edition Hoodie",
    description: "Lot 1/1 Collector's Edition. Heavyweight French Terry fleece, intricate 3D royal gold crown embroidery, embossed KING #1 back graphic with glowing purple amethyst trim, custom engraved gold hardware and Maharashtra crest.",
    price: 6999,
    mrp: 9999,
    category_id: 3,
    type_id: 304, // Signature -> Accessories / Luxury Outerwear
    image_url: '/assets/images/king_hoodie_front.jpg',
    hover_image_url: '/assets/images/king_hoodie_back.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    stock: 1,
    is_active: true,
    sale_type: 'auction',
    starting_bid: 4999,
    current_bid: 5499,
    highest_bidder_name: 'Vikram S.',
    highest_bidder_phone: '9876543210',
    auction_end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString()
};

const DEFAULT_PRODUCTS = [
    FLAGSHIP_AUCTION_PRODUCT,
    {
        id: 1001,
        name: "VYBE Everyday 280GSM Heavyweight Tee",
        description: "Pure combed cotton, relaxed drop-shoulder cut, reinforced ribbed crew neck. Built for enduring daily rotation.",
        price: 999,
        mrp: 1499,
        category_id: 1,
        type_id: 101, // Everyday -> Men Fashion
        image_url: '/assets/images/everyday_tee.jpg',
        hover_image_url: '/assets/images/everyday_tee.jpg',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 25,
        is_active: true,
        sale_type: 'fixed',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
        id: 1002,
        name: "VYBE Studio Architectural Tailored Blazer",
        description: "Structured double-breasted silhouette with satin lining and horn buttons. Effortless transition from boardroom to night lounge.",
        price: 4499,
        mrp: 6999,
        category_id: 2,
        type_id: 202, // Studio -> Blazers
        image_url: '/assets/images/studio_jacket.jpg',
        hover_image_url: '/assets/images/studio_jacket.jpg',
        sizes: ['M', 'L', 'XL'],
        stock: 12,
        is_active: true,
        sale_type: 'fixed',
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
        id: 1003,
        name: "VYBE Studio Crisp Poplin Formal Shirt",
        description: "100% Egyptian Giza cotton shirt with hidden placket, Italian spread collar, and mother-of-pearl buttons.",
        price: 2199,
        mrp: 3299,
        category_id: 2,
        type_id: 201, // Studio -> Formal Shirts
        image_url: '/assets/images/studio_jacket.jpg',
        hover_image_url: '/assets/images/studio_jacket.jpg',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 18,
        is_active: true,
        sale_type: 'fixed',
        created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    },
    {
        id: 1004,
        name: "VYBE Signature Amethyst Bezel Chronograph",
        description: "Hand-assembled timepiece with sapphire crystal, purple ceramic bezel, Japanese automatic movement, and matte black stainless steel bracelet.",
        price: 18999,
        mrp: 24999,
        category_id: 3,
        type_id: 302, // Signature -> Luxury Watches
        image_url: '/assets/images/king_hoodie_front.jpg',
        hover_image_url: '/assets/images/king_hoodie_back.jpg',
        sizes: ['One Size'],
        stock: 5,
        is_active: true,
        sale_type: 'fixed',
        created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString()
    },
    {
        id: 1005,
        name: "VYBE Everyday Relaxed Utility Cargos",
        description: "Cotton-twill cargo trousers with deep tactical pocket array and adjustable bungee ankle hems.",
        price: 1899,
        mrp: 2799,
        category_id: 1,
        type_id: 104, // Everyday -> Casual Wear
        image_url: '/assets/images/everyday_tee.jpg',
        hover_image_url: '/assets/images/everyday_tee.jpg',
        sizes: ['M', 'L', 'XL'],
        stock: 15,
        is_active: true,
        sale_type: 'fixed',
        created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString()
    }
];

// STATE MANAGEMENT
let allCategories = [];
let allTypes = [];
let allProducts = [];
let currentCategory = 'all'; // 'all', 'everyday', 'studio', 'signature'
let currentType = 'all';     // 'all' or type slug (e.g. 'formal-shirts', 'blazers')
let currentSort = 'default';
let currentMaxPrice = 100000;
let currentSizes = [];
let currentSearch = '';
let cart = JSON.parse(localStorage.getItem('vybe-cart')) || [];
let auctionInterval = null;

// ---------- CART SYSTEM ----------
function saveCart() {
    localStorage.setItem('vybe-cart', JSON.stringify(cart));
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) {
        el.innerText = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function addToCart(id, name, price, size = 'M', image_url = '') {
    const key = `${id}-${size}`;
    const existing = cart.find(item => item.key === key);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ key, id, name, price, size, quantity: 1, image_url });
    }
    saveCart();
    updateCartCount();
    showToast(`${name} (${size}) added to bag!`);
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
        container.innerHTML = '<p style="color:var(--muted);padding:30px 0;text-align:center;">Your shopping bag is empty.</p>';
        if (totalDiv) totalDiv.innerText = 'Total: ₹0';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, idx) => {
        total += item.price * item.quantity;
        return `
        <div class="cart-item">
            <img src="${item.image_url || '/assets/images/everyday_tee.jpg'}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                <small style="color:var(--muted);">Size: ${item.size} • ₹${item.price.toLocaleString('en-IN')}</small>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
            </div>
        </div>`;
    }).join('');

    if (totalDiv) {
        totalDiv.innerText = `Total: ₹${total.toLocaleString('en-IN')}`;
    }
}

function changeQty(idx, delta) {
    if (!cart[idx]) return;
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }
    saveCart();
    updateCartCount();
    renderCartItems();
}

function proceedToCheckout() {
    if (cart.length === 0) return showToast('Your shopping bag is empty');
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.add('hidden');
    window.location.href = 'checkout.html';
}

// ---------- THEME TOGGLE ----------
function toggleTheme() {
    const cb = document.getElementById('theme-checkbox');
    if (cb && cb.checked) {
        document.body.classList.add('light-mode');
        localStorage.setItem('vybe-theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('vybe-theme', 'dark');
    }
}

function loadTheme() {
    const saved = localStorage.getItem('vybe-theme');
    const cb = document.getElementById('theme-checkbox');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        if (cb) cb.checked = true;
    } else {
        document.body.classList.remove('light-mode');
        if (cb) cb.checked = false;
    }
}

// ---------- HIERARCHY LOAD: CATEGORIES & TYPES ----------
async function loadCategoriesAndTypes() {
    // 1. Fetch Categories from Supabase
    try {
        const { data, error } = await supabaseClient.from('categories').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
            allCategories = data;
        } else {
            allCategories = DEFAULT_CATEGORIES;
        }
    } catch (e) {
        allCategories = DEFAULT_CATEGORIES;
    }

    // 2. Fetch Types from Supabase
    let dbTypes = [];
    try {
        const { data, error } = await supabaseClient.from('types').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
            dbTypes = data;
        }
    } catch (e) {
        // Types table might not be in DB yet
    }

    // Merge with any custom types added in Admin (localStorage)
    const customTypes = JSON.parse(localStorage.getItem('vybe-custom-types') || '[]');
    const mergedTypesMap = new Map();

    // Default types
    DEFAULT_TYPES.forEach(t => mergedTypesMap.set(`${t.category_id}-${t.slug}`, t));
    // DB types
    dbTypes.forEach(t => mergedTypesMap.set(`${t.category_id}-${t.slug}`, t));
    // Custom admin types
    customTypes.forEach(t => mergedTypesMap.set(`${t.category_id}-${t.slug}`, t));

    allTypes = Array.from(mergedTypesMap.values());

    // 3. Render Navigation Mega Menu in Header
    renderNavMegaMenu();

    // 4. Render Category & Subtype buttons in Shop & Home
    renderCategoryButtons();
    renderSubtypeChips();
}

function renderNavMegaMenu() {
    const nav = document.querySelector('header nav');
    if (!nav) return;

    // Check if Shop link already has dropdown wrapper
    let shopLink = nav.querySelector('a[href="shop.html"]');
    if (shopLink && !shopLink.closest('.nav-dropdown-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-dropdown-wrapper';

        const trigger = document.createElement('a');
        trigger.href = 'shop.html';
        trigger.className = shopLink.className + ' nav-dropdown-trigger';
        trigger.innerText = 'Collections';

        const megaMenu = document.createElement('div');
        megaMenu.className = 'nav-mega-menu';
        megaMenu.id = 'nav-mega-menu';

        wrapper.appendChild(trigger);
        wrapper.appendChild(megaMenu);
        shopLink.replaceWith(wrapper);
    }

    const megaMenu = document.getElementById('nav-mega-menu');
    if (!megaMenu) return;

    const catEveryday = allCategories.find(c => c.slug === 'everyday') || DEFAULT_CATEGORIES[0];
    const catStudio = allCategories.find(c => c.slug === 'studio') || DEFAULT_CATEGORIES[1];
    const catSignature = allCategories.find(c => c.slug === 'signature') || DEFAULT_CATEGORIES[2];

    const getTypesForCat = (catId) => allTypes.filter(t => t.category_id === catId && t.is_active !== false);

    megaMenu.innerHTML = `
        <div class="mega-menu-grid">
            <div class="mega-col col-everyday">
                <a href="shop.html?cat=everyday" class="mega-col-header" style="flex-direction:column;align-items:flex-start;">
                    <img src="${catEveryday.logo_url || '/assets/images/everyday_logo.jpg'}" alt="${catEveryday.name}" class="mega-cat-logo">
                </a>
                <ul class="mega-type-list">
                    ${getTypesForCat(catEveryday.id).map(t => `
                        <li><a href="shop.html?cat=everyday&type=${t.slug}">${t.name} <span>→</span></a></li>
                    `).join('')}
                    <li><a href="shop.html?cat=everyday" style="font-weight:700;color:var(--primary-orange);">All Everyday →</a></li>
                </ul>
            </div>

            <div class="mega-col col-studio">
                <a href="shop.html?cat=studio" class="mega-col-header" style="flex-direction:column;align-items:flex-start;">
                    <img src="${catStudio.logo_url || '/assets/images/studio_logo.jpg'}" alt="${catStudio.name}" class="mega-cat-logo">
                </a>
                <ul class="mega-type-list">
                    ${getTypesForCat(catStudio.id).map(t => `
                        <li><a href="shop.html?cat=studio&type=${t.slug}">${t.name} <span>→</span></a></li>
                    `).join('')}
                    <li><a href="shop.html?cat=studio" style="font-weight:700;color:var(--primary-cyan);">All Studio →</a></li>
                </ul>
            </div>

            <div class="mega-col col-signature">
                <a href="shop.html?cat=signature" class="mega-col-header" style="flex-direction:column;align-items:flex-start;">
                    <img src="${catSignature.logo_url || '/assets/images/signature_logo.jpg'}" alt="${catSignature.name}" class="mega-cat-logo">
                </a>
                <ul class="mega-type-list">
                    ${getTypesForCat(catSignature.id).map(t => `
                        <li><a href="shop.html?cat=signature&type=${t.slug}">${t.name} <span>→</span></a></li>
                    `).join('')}
                    <li><a href="shop.html?cat=signature" style="font-weight:700;color:var(--primary-purple);">All Signature →</a></li>
                </ul>
            </div>
        </div>
        <div class="mega-menu-footer">
            <span style="color:var(--muted);">Crafted Beyond Ordinary — 3 Distinct Wardrobe Philosophies</span>
            <a href="shop.html">Browse All Collections ↗</a>
        </div>
    `;
}

function renderCategoryButtons() {
    const container = document.getElementById('category-buttons');
    if (!container) return;

    let html = `<button class="cat-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="switchCategory('all')">All Vibes</button>`;
    
    allCategories.forEach(cat => {
        const isActive = currentCategory === cat.slug;
        const color = cat.theme_color || '#8A2BE2';
        const logo = cat.logo_url || `/assets/images/${cat.slug}_logo.jpg`;
        html += `
            <button class="cat-btn ${isActive ? 'active' : ''}" 
                    data-cat="${cat.slug}" 
                    onclick="switchCategory('${cat.slug}')" 
                    style="${isActive ? `background:${color};border-color:${color};box-shadow:0 4px 15px ${color}66;color:#000;` : ''}">
                <img src="${logo}" alt="${cat.name}" class="cat-btn-logo-img">
                ${cat.name.replace('VYBE ', '')}
            </button>
        `;
    });

    container.innerHTML = html;
}

function renderSubtypeChips() {
    let container = document.getElementById('subtypes-chips-container');
    
    // If container doesn't exist, create it below filter-bar or categories section
    if (!container) {
        const filterBar = document.querySelector('.filter-bar');
        if (filterBar) {
            const section = document.createElement('div');
            section.className = 'subtypes-filter-section';
            section.id = 'subtypes-section';
            section.innerHTML = `
                <span class="subtypes-filter-label">Sub-Category:</span>
                <div class="type-chips-wrapper" id="subtypes-chips-container"></div>
            `;
            filterBar.insertAdjacentElement('afterend', section);
            container = document.getElementById('subtypes-chips-container');
        }
    }

    if (!container) return;

    // Determine which types to show
    let availableTypes = [];
    let currentCatObj = null;

    if (currentCategory === 'all') {
        availableTypes = allTypes;
    } else {
        currentCatObj = allCategories.find(c => c.slug === currentCategory);
        if (currentCatObj) {
            availableTypes = allTypes.filter(t => t.category_id === currentCatObj.id);
        }
    }

    const catSlug = currentCategory;
    const chipClass = catSlug === 'everyday' ? 'everyday-chip' : catSlug === 'studio' ? 'studio-chip' : catSlug === 'signature' ? 'signature-chip' : '';

    let html = `
        <button class="type-chip ${currentType === 'all' ? 'active' : ''} ${chipClass}" onclick="switchType('all')">
            All Types
        </button>
    `;

    availableTypes.forEach(t => {
        const isActive = currentType === t.slug;
        html += `
            <button class="type-chip ${isActive ? 'active' : ''} ${chipClass}" 
                    data-type="${t.slug}" 
                    onclick="switchType('${t.slug}')">
                ${t.name}
            </button>
        `;
    });

    container.innerHTML = html;
}

function switchCategory(slug) {
    currentCategory = slug;
    currentType = 'all'; // reset type filter when category switches
    renderCategoryButtons();
    renderSubtypeChips();
    applyFilters();

    // Update URL without page reload if on shop page
    if (window.location.pathname.includes('shop.html')) {
        const url = new URL(window.location);
        url.searchParams.set('cat', slug);
        url.searchParams.delete('type');
        window.history.replaceState({}, '', url);
    }
}

function switchType(typeSlug) {
    currentType = typeSlug;
    renderSubtypeChips();
    applyFilters();

    if (window.location.pathname.includes('shop.html')) {
        const url = new URL(window.location);
        if (currentCategory !== 'all') url.searchParams.set('cat', currentCategory);
        if (typeSlug !== 'all') url.searchParams.set('type', typeSlug);
        else url.searchParams.delete('type');
        window.history.replaceState({}, '', url);
    }
}

// ---------- PRODUCTS FETCH & HIERARCHICAL FILTER ----------
async function fetchProducts() {
    let dbProducts = [];
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true);

        if (!error && data && data.length > 0) {
            dbProducts = data;
        }
    } catch (err) {
        console.warn('Error fetching products from supabase:', err);
    }

    // Merge default flagship & curated items with DB items
    const mergedMap = new Map();
    DEFAULT_PRODUCTS.forEach(p => mergedMap.set(p.id, p));
    dbProducts.forEach(p => mergedMap.set(p.id, p));

    allProducts = Array.from(mergedMap.values());

    // Incorporate any cached bid updates
    allProducts.forEach(p => {
        if (p.sale_type === 'auction') {
            const cached = getCachedAuctionData(p.id);
            if (cached.current_bid) {
                p.current_bid = cached.current_bid;
                p.highest_bidder_name = cached.highest_bidder_name;
                p.highest_bidder_phone = cached.highest_bidder_phone;
            }
        }
    });

    // Check URL parameters on shop page
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) {
        currentCategory = params.get('category');
    } else if (params.has('cat')) {
        currentCategory = params.get('cat');
    }
    if (params.has('type')) {
        currentType = params.get('type');
    }
    if (params.has('search')) {
        currentSearch = params.get('search');
        const searchInput = document.getElementById('filter-search');
        if (searchInput) searchInput.value = currentSearch;
    }

    renderCategoryButtons();
    renderSubtypeChips();
    renderHomepageShopByType();
    applyFilters();
    startAuctionCountdownTicker();
}

function applyFilters() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const sortEl = document.getElementById('sort-select');
    const priceEl = document.getElementById('price-range');
    const searchEl = document.getElementById('filter-search');

    if (sortEl) currentSort = sortEl.value;
    if (priceEl) {
        currentMaxPrice = parseInt(priceEl.value);
        const pd = document.getElementById('price-display');
        if (pd) pd.innerText = '₹' + currentMaxPrice.toLocaleString('en-IN');
    }
    if (searchEl) currentSearch = searchEl.value.trim().toLowerCase();

    let filtered = [...allProducts];

    // 1. Category Filter (Level 1)
    if (currentCategory !== 'all') {
        const catObj = allCategories.find(c => c.slug === currentCategory);
        const catId = catObj ? catObj.id : (currentCategory === 'everyday' ? 1 : currentCategory === 'studio' ? 2 : 3);
        filtered = filtered.filter(p => {
            if (p.category_id === catId) return true;
            if (p.categories && p.categories.slug === currentCategory) return true;
            return false;
        });
    }

    // 2. Type Filter (Level 2)
    if (currentType !== 'all') {
        const typeObj = allTypes.find(t => t.slug === currentType);
        if (typeObj) {
            filtered = filtered.filter(p => p.type_id === typeObj.id);
        }
    }

    // 3. Search Filter
    if (currentSearch) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(currentSearch) ||
            (p.description && p.description.toLowerCase().includes(currentSearch))
        );
    }

    // 4. Price Filter
    filtered = filtered.filter(p => (p.price || p.current_bid || 0) <= currentMaxPrice);

    // 5. Size Filter
    if (currentSizes.length > 0) {
        filtered = filtered.filter(p => p.sizes && p.sizes.some(s => currentSizes.includes(s)));
    }

    // 6. Sorting
    if (currentSort === 'low-high') {
        filtered.sort((a, b) => (a.price || a.current_bid) - (b.price || b.current_bid));
    } else if (currentSort === 'high-low') {
        filtered.sort((a, b) => (b.price || b.current_bid) - (a.price || a.current_bid));
    } else if (currentSort === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    renderProducts(filtered);
}

function toggleSizeFilter(size) {
    const idx = currentSizes.indexOf(size);
    if (idx > -1) currentSizes.splice(idx, 1);
    else currentSizes.push(size);

    document.querySelectorAll('.size-chip').forEach(c => {
        c.classList.toggle('active', currentSizes.includes(c.dataset.size));
    });
    applyFilters();
}

function getCategoryInfo(catId) {
    const c = allCategories.find(x => x.id === catId);
    if (c) return c;
    if (catId === 1) return { name: 'Everyday', slug: 'everyday', theme_color: '#FF8C00' };
    if (catId === 2) return { name: 'Studio', slug: 'studio', theme_color: '#00BFFF' };
    return { name: 'Signature', slug: 'signature', theme_color: '#8A2BE2' };
}

function getTypeInfo(typeId) {
    const t = allTypes.find(x => x.id === typeId);
    return t ? t.name : 'Garment';
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const title = document.getElementById('category-title');
    if (title) {
        if (currentCategory === 'all') {
            title.innerHTML = 'All Creations (' + products.length + ')';
        } else {
            const catObj = allCategories.find(c => c.slug === currentCategory);
            const typeObj = currentType !== 'all' ? allTypes.find(t => t.slug === currentType) : null;
            const logo = catObj?.logo_url || `/assets/images/${currentCategory}_logo.jpg`;
            title.innerHTML = `
                <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                    <img src="${logo}" alt="${catObj ? catObj.name : currentCategory}" class="category-header-logo">
                    <span>${typeObj ? '• ' + typeObj.name : 'Collection'} (${products.length})</span>
                </div>
            `;
        }
    }

    if (products.length === 0) {
        grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
            <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No garments matched your filter</h3>
            <p style="color:var(--muted); margin-bottom: 20px;">Try switching sub-categories or broadening your price filter.</p>
            <button class="btn-primary-lg" onclick="switchCategory('all')">View All Collections</button>
        </div>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        const isAuction = p.sale_type === 'auction';
        const displayPrice = isAuction ? (p.current_bid || p.starting_bid) : p.price;
        const discount = p.mrp && p.mrp > displayPrice ? Math.round(((p.mrp - displayPrice) / p.mrp) * 100) : 0;
        
        const cat = getCategoryInfo(p.category_id);
        const typeName = getTypeInfo(p.type_id);

        return `
        <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
            ${isAuction ? `<span class="badge-tag badge-auction">⚡ LIVE AUCTION</span>` : ''}
            
            <span class="badge-category-type">
                <span class="cat-dot cat-dot-${cat.slug}"></span>
                ${cat.name.replace('VYBE ', '')} • ${typeName}
            </span>

            <div class="product-image-wrapper">
                <img src="${p.image_url}" alt="${p.name}" class="main-img" loading="lazy">
                ${p.hover_image_url ? `<img src="${p.hover_image_url}" alt="${p.name}" class="hover-img" loading="lazy">` : ''}
            </div>
            
            <div class="product-info">
                <span class="product-category-meta" style="color:${cat.theme_color};">
                    ${cat.name} — ${typeName}
                </span>
                <h3>${p.name}</h3>
                
                <div class="product-price-row">
                    <span class="price">${isAuction ? 'Bid: ' : ''}₹${Number(displayPrice).toLocaleString('en-IN')}</span>
                    ${discount > 0 ? `<span class="mrp">₹${Number(p.mrp).toLocaleString('en-IN')}</span><span class="discount">${discount}% OFF</span>` : ''}
                </div>

                ${isAuction ? `
                    <div class="auction-ticker-card">
                        <span>Vault Closes:</span>
                        <span class="time-left auction-timer" data-endtime="${p.auction_end_time || ''}">--:--:--</span>
                    </div>
                ` : ''}

                <button class="btn-add" onclick="event.stopPropagation(); quickAddToCart(${p.id})">
                    ${isAuction ? '🔨 Enter Auction' : 'Add to Bag'}
                </button>
            </div>
        </div>`;
    }).join('');

    updateAuctionTimers();
}

function quickAddToCart(productId) {
    const p = allProducts.find(x => x.id === productId);
    if (!p) return;
    if (p.sale_type === 'auction') {
        window.location.href = `product.html?id=${p.id}`;
        return;
    }
    addToCart(p.id, p.name, p.price, p.sizes?.[0] || 'M', p.image_url);
}

// ---------- AUCTION TIMERS & LIVE BIDDING ----------
function formatTimeRemaining(endTimeStr) {
    if (!endTimeStr) return 'Active';
    const total = Date.parse(endTimeStr) - Date.now();
    if (total <= 0) return 'ENDED';

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateAuctionTimers() {
    document.querySelectorAll('.auction-timer').forEach(el => {
        const endTime = el.dataset.endtime;
        if (endTime) {
            el.innerText = formatTimeRemaining(endTime);
        }
    });
}

function startAuctionCountdownTicker() {
    if (auctionInterval) clearInterval(auctionInterval);
    updateAuctionTimers();
    auctionInterval = setInterval(updateAuctionTimers, 1000);
}

function getCachedAuctionData(productId) {
    try {
        const store = JSON.parse(localStorage.getItem('vybe_auction_bids') || '{}');
        return store[productId] || {};
    } catch {
        return {};
    }
}

function setCachedAuctionBid(productId, bidData) {
    try {
        const store = JSON.parse(localStorage.getItem('vybe_auction_bids') || '{}');
        store[productId] = {
            current_bid: bidData.bid_amount,
            highest_bidder_name: bidData.bidder_name,
            highest_bidder_phone: bidData.bidder_phone,
            bids_count: (store[productId]?.bids_count || 1) + 1
        };
        localStorage.setItem('vybe_auction_bids', JSON.stringify(store));
    } catch (e) {
        console.error(e);
    }
}

async function placeAuctionBid(productId, name, phone, amount) {
    amount = Number(amount);
    if (!name || !phone || isNaN(amount)) {
        showToast('Please fill all fields');
        return false;
    }
    if (!/^\d{10}$/.test(phone)) {
        showToast('Enter valid 10-digit mobile number');
        return false;
    }

    // Try saving to Supabase bids table
    try {
        await supabaseClient.from('bids').insert({
            product_id: productId,
            bidder_name: name,
            bidder_phone: phone,
            bid_amount: amount
        });
    } catch (err) {
        console.warn('bids table insert note:', err);
    }

    // Try updating product current_bid in Supabase
    try {
        await supabaseClient.from('products').update({
            current_bid: amount,
            highest_bidder_name: name,
            highest_bidder_phone: phone
        }).eq('id', productId);
    } catch (err) {
        console.warn('products update note:', err);
    }

    setCachedAuctionBid(productId, { bidder_name: name, bidder_phone: phone, bid_amount: amount });

    const p = allProducts.find(x => x.id === productId);
    if (p) {
        p.current_bid = amount;
        p.highest_bidder_name = name;
        p.highest_bidder_phone = phone;
    }

    showToast(`🎉 Bid of ₹${amount.toLocaleString('en-IN')} placed successfully!`);
    return true;
}

// ---------- BANNERS CAROUSEL ----------
async function loadBanners() {
    const container = document.getElementById('banner-carousel');
    if (!container) return;

    let bannerList = [];
    try {
        const { data, error } = await supabaseClient.from('banners').select('*').eq('is_active', true).order('sort_order');
        if (!error && data && data.length > 0) {
            bannerList = data;
        }
    } catch (e) {
        console.warn('Banners query note:', e);
    }

    if (bannerList.length === 0) {
        bannerList = [
            {
                title: "CRAFTED BEYOND ORDINARY.",
                subtitle: "Luxury Streetwear & High-Tailored Men's Apparel",
                image_url: "/assets/images/vybe_hero_banner.jpg",
                link: "shop.html"
            }
        ];
    }

    const hero = document.getElementById('hero-section');
    if (hero && bannerList.length > 0 && bannerList[0].image_url) {
        hero.style.display = 'none';
    }

    container.innerHTML = bannerList.map((b, i) => `
        <div class="banner-slide ${i === 0 ? 'active' : ''}">
            <img src="${b.image_url}" alt="${b.title || 'VYBE Apparel'}">
            <div class="banner-overlay">
                <h2>${b.title || 'CRAFTED BEYOND ORDINARY.'}</h2>
                <p>${b.subtitle || 'Everyday comfort meets signature luxury.'}</p>
                <div>
                    <a href="${b.link || 'shop.html'}" class="btn-primary-lg" style="display:inline-block;">Explore Collection</a>
                </div>
            </div>
        </div>
    `).join('') + `
    <div class="banner-dots">
        ${bannerList.map((_, i) => `<span class="${i === 0 ? 'active' : ''}" onclick="showBanner(${i})"></span>`).join('')}
    </div>`;

    if (bannerList.length > 1) {
        let currentIdx = 0;
        setInterval(() => {
            currentIdx = (currentIdx + 1) % bannerList.length;
            window.showBanner(currentIdx);
        }, 5000);
    }

    window.showBanner = (idx) => {
        document.querySelectorAll('.banner-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
        document.querySelectorAll('.banner-dots span').forEach((s, i) => s.classList.toggle('active', i === idx));
    };
}

// ---------- ORDER TRACKING ----------
async function trackOrder() {
    const id = document.getElementById('tracking-id')?.value?.trim();
    const resultDiv = document.getElementById('tracking-result');
    if (!resultDiv) return;

    if (!id) {
        showToast('Please enter your Tracking ID');
        return;
    }

    resultDiv.innerHTML = `<p style="padding:20px;color:var(--muted);">Searching order records...</p>`;

    let order = null;
    try {
        const { data, error } = await supabaseClient.from('orders').select('*').eq('tracking_id', id).single();
        if (!error && data) {
            order = data;
        }
    } catch (e) {
        console.warn('Orders tracking query note:', e);
    }

    if (!order) {
        const localOrders = JSON.parse(localStorage.getItem('vybe_local_orders') || '[]');
        order = localOrders.find(o => o.tracking_id === id);
    }

    if (!order) {
        resultDiv.innerHTML = `
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:16px;padding:30px;max-width:550px;margin:20px auto;">
            <p style="color:#ff5555;font-weight:700;margin-bottom:8px;">Order Not Found</p>
            <p style="color:var(--muted);font-size:0.9rem;">We couldn't locate an order with ID <strong>${id}</strong>. Please double-check your tracking ID or contact support.</p>
        </div>`;
        return;
    }

    const statuses = ['Processing', 'Stitched', 'Shipped', 'Delivered'];
    const currentIdx = Math.max(0, statuses.findIndex(s => s.toLowerCase() === (order.status || 'processing').toLowerCase()));

    resultDiv.innerHTML = `
    <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:18px;padding:32px;max-width:650px;margin:20px auto;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-color);padding-bottom:16px;margin-bottom:20px;">
            <div>
                <span style="font-size:0.8rem;color:var(--muted);text-transform:uppercase;">Tracking ID</span>
                <h3 style="font-size:1.3rem;font-weight:800;color:var(--primary-cyan);">${order.tracking_id}</h3>
            </div>
            <span class="status-badge ${order.status?.toLowerCase()}">${order.status || 'Processing'}</span>
        </div>

        <div class="tracking-timeline">
            ${statuses.map((step, idx) => `
                <div class="tracking-step ${idx < currentIdx ? 'completed' : idx === currentIdx ? 'current' : ''}">
                    <div class="step-node">${idx < currentIdx ? '✓' : idx + 1}</div>
                    <span class="step-label">${step}</span>
                </div>
            `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px;background:var(--bg-color);padding:18px;border-radius:12px;font-size:0.92rem;">
            <div>
                <p style="color:var(--muted);font-size:0.8rem;text-transform:uppercase;">Customer</p>
                <strong>${order.customer_name || 'Guest'}</strong>
            </div>
            <div>
                <p style="color:var(--muted);font-size:0.8rem;text-transform:uppercase;">Total Amount</p>
                <strong style="color:var(--primary-orange);">₹${Number(order.total_amount).toLocaleString('en-IN')}</strong>
            </div>
            <div>
                <p style="color:var(--muted);font-size:0.8rem;text-transform:uppercase;">Delivery City</p>
                <strong>${order.customer_city || 'India'}</strong>
            </div>
            <div>
                <p style="color:var(--muted);font-size:0.8rem;text-transform:uppercase;">Date Placed</p>
                <strong>${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            </div>
        </div>
    </div>`;
}

// ---------- TOAST NOTIFICATION ----------
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => {
        if (t.parentNode) t.remove();
    }, 2800);
}
window.showToast = showToast;

function scrollToShop() {
    const el = document.getElementById('shop');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = 'shop.html';
}

// ---------- HOMEPAGE: SHOP BY TYPE SECTION ----------
function renderHomepageShopByType() {
    const container = document.getElementById('homepage-shop-by-type');
    if (!container) return;

    const categories = [
        { id: 1, slug: 'everyday', name: 'Everyday', theme: 'var(--primary-orange)', tag: 'DAILY WEAR' },
        { id: 2, slug: 'studio', name: 'Studio', theme: 'var(--primary-cyan)', tag: 'CONTEMPORARY' },
        { id: 3, slug: 'signature', name: 'Signature', theme: 'var(--primary-purple)', tag: 'LUXURY TAILORING' }
    ];

    // Helper map for default item counts if not specified
    const defaultCounts = {
        'men-fashion': 24,
        'women': 18,
        'kids': 12,
        'casual-wear': 30,
        'formal-shirts': 20,
        'blazers': 15,
        'party-wear': 18,
        'footwear': 22,
        'premium-suits': 10,
        'watches': 14,
        'jewelry': 16,
        'accessories': 25
    };

    container.innerHTML = categories.map(cat => {
        const types = allTypes.filter(t => t.category_id === cat.id && t.is_active !== false);
        return `
        <div class="type-category-group">
            <div class="type-group-header">
                <div class="type-group-title">
                    <span class="cat-dot cat-dot-${cat.slug}" style="width:10px;height:10px;"></span>
                    <span>Under ${cat.name}</span>
                </div>
                <a href="shop.html?category=${cat.slug}" class="type-view-all-link" style="color:${cat.theme};">
                    View All ${cat.name} →
                </a>
            </div>

            <div class="type-cards-grid">
                ${types.map(t => {
                    const hasImg = t.image_url && t.image_url.trim() !== '';
                    const mediaHtml = hasImg
                        ? `<div class="type-img-wrapper"><img src="${t.image_url}" alt="${t.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'type-gradient-placeholder type-gradient-${cat.slug}\\'><span>${t.name}</span></div>'"></div>`
                        : `<div class="type-gradient-placeholder type-gradient-${cat.slug}"><span>${t.name}</span></div>`;

                    const count = t.count || defaultCounts[t.slug] || 20;

                    return `
                    <a href="shop.html?category=${cat.slug}&type=${t.slug}" class="type-showcase-card ${cat.slug}-type">
                        ${mediaHtml}
                        <div class="type-card-info">
                            <span class="type-card-name">${t.name}</span>
                            <span class="type-card-count">${count} items</span>
                        </div>
                    </a>`;
                }).join('')}
            </div>

            <div class="type-row-footer">
                <a href="shop.html?category=${cat.slug}" class="type-view-all-link-end" style="color:${cat.theme};">
                    View All ${cat.name} →
                </a>
            </div>
        </div>`;
    }).join('');
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    updateCartCount();
    await loadCategoriesAndTypes();
    renderHomepageShopByType();
    if (document.getElementById('product-grid')) await fetchProducts();
    if (document.getElementById('banner-carousel')) await loadBanners();
});
