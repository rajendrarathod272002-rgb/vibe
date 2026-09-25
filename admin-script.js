// =========================================
// VYBE Admin Dashboard Logic (admin-script.js)
// Hierarchical Categories & Sub-Types Management
// =========================================

const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showAdminToast(msg) {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'admin-toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => { if (t.parentNode) t.remove(); }, 3000);
}
window.alert = showAdminToast;

// DEFAULT HIERARCHY CONSTANTS
const DEFAULT_CATEGORIES = [
    { id: 1, name: 'VYBE Everyday', slug: 'everyday', theme_color: '#FF8C00', logo_url: '/assets/images/everyday_logo.jpg', image_url: '/assets/images/everyday_logo.jpg', is_active: true, sort_order: 1 },
    { id: 2, name: 'VYBE Studio', slug: 'studio', theme_color: '#00BFFF', logo_url: '/assets/images/studio_logo.jpg', image_url: '/assets/images/studio_logo.jpg', is_active: true, sort_order: 2 },
    { id: 3, name: 'VYBE Signature', slug: 'signature', theme_color: '#8A2BE2', logo_url: '/assets/images/signature_logo.jpg', image_url: '/assets/images/signature_logo.jpg', is_active: true, sort_order: 3 }
];

const DEFAULT_TYPES = [
    // Under Everyday (id: 1)
    { id: 101, category_id: 1, name: 'Men Fashion', slug: 'men-fashion', image_url: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400', count: 24, is_active: true, sort_order: 1 },
    { id: 102, category_id: 1, name: 'Women', slug: 'women', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', count: 18, is_active: true, sort_order: 2 },
    { id: 103, category_id: 1, name: 'Kids', slug: 'kids', image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', count: 12, is_active: true, sort_order: 3 },
    { id: 104, category_id: 1, name: 'Casual Wear', slug: 'casual-wear', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', count: 30, is_active: true, sort_order: 4 },
    // Under Studio (id: 2)
    { id: 201, category_id: 2, name: 'Formal Shirts', slug: 'formal-shirts', image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', count: 20, is_active: true, sort_order: 1 },
    { id: 202, category_id: 2, name: 'Blazers', slug: 'blazers', image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', count: 15, is_active: true, sort_order: 2 },
    { id: 203, category_id: 2, name: 'Party Wear', slug: 'party-wear', image_url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', count: 18, is_active: true, sort_order: 3 },
    { id: 204, category_id: 2, name: 'Footwear', slug: 'footwear', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', count: 22, is_active: true, sort_order: 4 },
    // Under Signature (id: 3)
    { id: 301, category_id: 3, name: 'Premium Suits', slug: 'premium-suits', image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', count: 10, is_active: true, sort_order: 1 },
    { id: 302, category_id: 3, name: 'Watches', slug: 'watches', image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', count: 14, is_active: true, sort_order: 2 },
    { id: 303, category_id: 3, name: 'Jewelry', slug: 'jewelry', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', count: 16, is_active: true, sort_order: 3 },
    { id: 304, category_id: 3, name: 'Accessories', slug: 'accessories', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', count: 25, is_active: true, sort_order: 4 }
];

let currentUser = null;
let allAdminProducts = [];
let allAdminCategories = [];
let allAdminTypes = [];
let currentAdminTypeFilter = 'all';

// ============ AUTH ============
async function adminLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    if (!email || !password) return showAdminToast("Please enter email and password");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return showAdminToast("Login Failed: " + error.message);

    currentUser = data.user;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadDashboard();
}

async function adminLogout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadDashboard();
    }
}

// ============ TABS ============
function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (tabId === 'orders') loadOrders();
    if (tabId === 'products') {
        loadProductsForAdmin();
        loadCategoriesForDropdown('prod-category');
    }
    if (tabId === 'categories') {
        loadCategoriesForAdmin();
        loadTypesForAdmin();
    }
    if (tabId === 'banners') loadBannersForAdmin();
    if (tabId === 'auctions') loadAuctionsForAdmin();
}

async function loadDashboard() {
    await loadCategoriesForAdmin();
    await loadTypesForAdmin();
    loadOrders();
    loadProductsForAdmin();
    loadBannersForAdmin();
    loadAuctionsForAdmin();
    loadCategoriesForDropdown('prod-category');
    loadCategoriesForDropdown('type-add-category');
}

// ============ IMAGE UPLOAD ============
async function uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabaseClient.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabaseClient.storage.from('product-images').getPublicUrl(fileName);
    return urlData.publicUrl;
}

// ============ 1. ORDERS ============
async function loadOrders() {
    let orders = [];
    try {
        const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) orders = data;
    } catch (e) {
        console.warn(e);
    }

    // Merge with any local orders
    const local = JSON.parse(localStorage.getItem('vybe_local_orders') || '[]');
    const ids = new Set(orders.map(o => o.tracking_id));
    local.forEach(lo => {
        if (!ids.has(lo.tracking_id)) orders.unshift(lo);
    });

    const tbody = document.querySelector('#orders-table tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;padding:30px;">No customer orders placed yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong style="color:#00BFFF;">${o.tracking_id || 'N/A'}</strong></td>
            <td>
                <strong>${o.customer_name || 'Guest'}</strong><br>
                <small style="color:#888;">${o.customer_phone || ''} • ${o.customer_city || ''}</small>
            </td>
            <td><strong>₹${Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
            <td>
                <span class="status-badge ${o.status?.toLowerCase() || 'processing'}">
                    ${o.status || 'Processing'}
                </span>
            </td>
            <td>
                <button onclick="openOrderModal('${o.tracking_id}')" class="btn-edit" style="margin-right:6px;">View</button>
                <select onchange="updateOrderStatus('${o.id || o.tracking_id}', this.value)" style="background:#222;color:#fff;border:1px solid #444;padding:4px 8px;border-radius:4px;font-size:12px;">
                    <option value="">Update Status</option>
                    <option value="Processing">Processing</option>
                    <option value="Stitched">Stitched</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderIdOrTracking, newStatus) {
    if (!newStatus) return;
    try {
        await supabaseClient.from('orders').update({ status: newStatus }).or(`id.eq.${orderIdOrTracking},tracking_id.eq.${orderIdOrTracking}`);
    } catch (e) {
        console.warn(e);
    }

    // Local fallback update
    const local = JSON.parse(localStorage.getItem('vybe_local_orders') || '[]');
    const match = local.find(o => o.id === orderIdOrTracking || o.tracking_id === orderIdOrTracking);
    if (match) {
        match.status = newStatus;
        localStorage.setItem('vybe_local_orders', JSON.stringify(local));
    }

    showAdminToast(`Order status updated to: ${newStatus}`);
    loadOrders();
}

function openOrderModal(trackingId) {
    const local = JSON.parse(localStorage.getItem('vybe_local_orders') || '[]');
    let order = local.find(o => o.tracking_id === trackingId);

    const content = document.getElementById('order-details-content');
    if (!content) return;

    if (!order) {
        content.innerHTML = `<p style="padding:20px;color:#888;">Loading order data from Supabase...</p>`;
        supabaseClient.from('orders').select('*, order_items(*)').eq('tracking_id', trackingId).single()
            .then(({ data }) => {
                if (data) renderOrderDetailsModal(data);
                else content.innerHTML = `<p style="color:#ff4444;">Order record not found.</p>`;
            });
    } else {
        renderOrderDetailsModal(order);
    }

    document.getElementById('order-modal').classList.remove('hidden');
}

function renderOrderDetailsModal(order) {
    const content = document.getElementById('order-details-content');
    const items = order.order_items || [];

    content.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;background:#181818;padding:15px;border-radius:10px;">
            <div>
                <p style="color:#888;font-size:12px;">TRACKING ID</p>
                <h3 style="color:#00BFFF;">${order.tracking_id}</h3>
                <p style="margin-top:6px;font-size:13px;"><strong>${order.customer_name}</strong> (${order.customer_phone})</p>
                <p style="font-size:12px;color:#ccc;">${order.customer_email || 'No email'}</p>
            </div>
            <div>
                <p style="color:#888;font-size:12px;">SHIPPING ADDRESS</p>
                <p style="font-size:13px;line-height:1.4;">${order.customer_address}<br>${order.customer_city} - ${order.customer_pincode}</p>
                <p style="margin-top:8px;font-size:12px;color:#FF8C00;">Payment: <strong>${(order.payment_method || 'COD').toUpperCase()}</strong> (${order.payment_status || 'Pending'})</p>
            </div>
        </div>

        <h4 style="margin-bottom:10px;">Garments Ordered (${items.length})</h4>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;margin-bottom:20px;">
            ${items.length === 0 ? '<p style="color:#888;font-size:12px;">Standard Garment Item</p>' : items.map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:#0d0d0d;padding:10px;border-radius:8px;">
                    <div>
                        <strong>${item.product_name}</strong>
                        <p style="font-size:12px;color:#888;">Size: ${item.size} • Qty: ${item.quantity}</p>
                    </div>
                    <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                </div>
            `).join('')}
        </div>

        <div style="text-align:right;border-top:1px solid #333;padding-top:12px;">
            <span style="font-size:14px;color:#888;">Order Total: </span>
            <span style="font-size:1.4rem;font-weight:800;color:#22c55e;">₹${Number(order.total_amount).toLocaleString('en-IN')}</span>
        </div>
    `;
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// ============ 2. PRODUCTS (LEVEL 3) ============
async function loadProductsForAdmin() {
    const container = document.getElementById('products-list');
    if (!container) return;

    let products = [];
    try {
        const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: false });
        if (!error && data) products = data;
    } catch (e) {
        console.warn(e);
    }

    // Merge default flagship hoodie if not in DB
    const hasFlagship = products.some(p => p.id === 9999 || p.name.includes("King #1"));
    if (!hasFlagship) {
        products.unshift({
            id: 9999,
            name: "VYBE Signature \"King #1\" Limited Edition Hoodie",
            price: 6999,
            mrp: 9999,
            category_id: 3,
            type_id: 304,
            image_url: '/assets/images/king_hoodie_front.jpg',
            sizes: ['M', 'L', 'XL', 'XXL'],
            stock: 1,
            is_active: true,
            sale_type: 'auction',
            starting_bid: 4999,
            current_bid: 5499
        });
    }

    allAdminProducts = products;

    if (products.length === 0) {
        container.innerHTML = `<p style="color:#888;padding:20px;">No products in catalog yet.</p>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const cat = allAdminCategories.find(c => c.id === p.category_id) || { name: 'Exclusive', slug: 'signature' };
        const type = allAdminTypes.find(t => t.id === p.type_id) || { name: 'Garment' };
        const isAuction = p.sale_type === 'auction';

        return `
        <div class="item-card">
            <img src="${p.image_url || '/assets/images/everyday_tee.jpg'}" alt="${p.name}">
            <div class="item-info">
                <strong>${p.name}</strong>
                <p style="color:#888;font-size:12px;margin:4px 0;">
                    <span class="badge-cat-pill badge-cat-${cat.slug}">${cat.name}</span>
                    <span style="color:#aaa;margin-left:6px;font-weight:600;">• ${type.name}</span>
                    ${isAuction ? `<span style="color:#FFD700;margin-left:6px;font-weight:700;">⚡ AUCTION</span>` : ''}
                </p>
                <p style="color:#ccc;font-size:13px;">
                    Price: <strong>₹${Number(p.price || p.current_bid).toLocaleString('en-IN')}</strong> • Stock: ${p.stock || 0}
                </p>
            </div>
            <div class="item-actions">
                <button onclick="openEditProductModal(${p.id})" class="btn-edit">Edit</button>
                <button onclick="deleteProduct(${p.id})" class="btn-delete">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

function handleAdminCategoryChange(catId, targetSelectId) {
    const targetSelect = document.getElementById(targetSelectId);
    if (!targetSelect) return;

    targetSelect.innerHTML = '<option value="">Select Sub-Type</option>';
    if (!catId) return;

    const filteredTypes = allAdminTypes.filter(t => t.category_id === Number(catId) && t.is_active !== false);
    filteredTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.innerText = t.name;
        targetSelect.appendChild(opt);
    });
}

function toggleAuctionFields(saleType) {
    const f = document.getElementById('auction-fields-add');
    if (f) f.classList.toggle('hidden', saleType !== 'auction');
}

function toggleEditAuctionFields(saleType) {
    const f = document.getElementById('edit-auction-fields');
    if (f) f.classList.toggle('hidden', saleType !== 'auction');
}

async function addProduct(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-add-product');
    btn.disabled = true;
    btn.innerText = 'Publishing...';

    try {
        let imageUrl = document.getElementById('prod-image').value.trim();
        let hoverImageUrl = document.getElementById('prod-hover-image').value.trim();

        const imageFile = document.getElementById('prod-image-file').files[0];
        const hoverFile = document.getElementById('prod-hover-file').files[0];

        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }
        if (hoverFile) {
            hoverImageUrl = await uploadImage(hoverFile);
        }

        if (!imageUrl) {
            showAdminToast("Please provide or upload a main image");
            btn.disabled = false;
            btn.innerText = 'Publish Product';
            return;
        }

        const saleType = document.getElementById('prod-sale-type').value;
        const startingBid = document.getElementById('prod-starting-bid').value;
        const endTime = document.getElementById('prod-end-time').value;
        const categoryId = Number(document.getElementById('prod-category').value);
        const typeId = document.getElementById('prod-type').value ? Number(document.getElementById('prod-type').value) : null;

        const productData = {
            name: document.getElementById('prod-name').value.trim(),
            price: Number(document.getElementById('prod-price').value),
            mrp: document.getElementById('prod-mrp').value ? Number(document.getElementById('prod-mrp').value) : null,
            category_id: categoryId,
            type_id: typeId,
            description: document.getElementById('prod-description').value.trim(),
            sizes: document.getElementById('prod-sizes').value.split(',').map(s => s.trim()),
            stock: Number(document.getElementById('prod-stock').value),
            image_url: imageUrl,
            hover_image_url: hoverImageUrl || null,
            is_active: true,
            sale_type: saleType
        };

        if (saleType === 'auction') {
            productData.starting_bid = Number(startingBid) || productData.price;
            productData.current_bid = productData.starting_bid;
            productData.auction_end_time = endTime ? new Date(endTime).toISOString() : null;
        }

        const { error } = await supabaseClient.from('products').insert(productData);
        if (error) {
            console.warn(error);
            showAdminToast("Notice: " + error.message);
        } else {
            showAdminToast("Garment Published with Category & Sub-Type!");
        }

        document.getElementById('add-product-form').reset();
        loadProductsForAdmin();
        loadAuctionsForAdmin();
    } catch (err) {
        showAdminToast("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Publish Product';
    }
}

function openEditProductModal(productId) {
    const p = allAdminProducts.find(x => x.id === productId);
    if (!p) return;

    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-price').value = p.price || '';
    document.getElementById('edit-mrp').value = p.mrp || '';
    document.getElementById('edit-description').value = p.description || '';
    document.getElementById('edit-sizes').value = (p.sizes || []).join(',');
    document.getElementById('edit-stock').value = p.stock || 10;
    document.getElementById('edit-image').value = p.image_url || '';
    document.getElementById('edit-hover-image').value = p.hover_image_url || '';

    // Load category dropdown and pre-select
    loadCategoriesForDropdown('edit-category').then(() => {
        document.getElementById('edit-category').value = p.category_id || 1;
        handleAdminCategoryChange(p.category_id || 1, 'edit-type');
        if (p.type_id) {
            document.getElementById('edit-type').value = p.type_id;
        }
    });

    const saleTypeSelect = document.getElementById('edit-sale-type');
    saleTypeSelect.value = p.sale_type || 'fixed';
    toggleEditAuctionFields(saleTypeSelect.value);

    document.getElementById('edit-current-bid').value = p.current_bid || p.starting_bid || '';
    if (p.auction_end_time) {
        const d = new Date(p.auction_end_time);
        document.getElementById('edit-end-time').value = d.toISOString().slice(0, 16);
    }

    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

async function saveProductEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const saleType = document.getElementById('edit-sale-type').value;

    const updates = {
        name: document.getElementById('edit-name').value.trim(),
        price: Number(document.getElementById('edit-price').value),
        mrp: document.getElementById('edit-mrp').value ? Number(document.getElementById('edit-mrp').value) : null,
        category_id: Number(document.getElementById('edit-category').value),
        type_id: document.getElementById('edit-type').value ? Number(document.getElementById('edit-type').value) : null,
        description: document.getElementById('edit-description').value.trim(),
        sizes: document.getElementById('edit-sizes').value.split(',').map(s => s.trim()),
        stock: Number(document.getElementById('edit-stock').value),
        image_url: document.getElementById('edit-image').value.trim(),
        hover_image_url: document.getElementById('edit-hover-image').value.trim() || null,
        sale_type: saleType
    };

    if (saleType === 'auction') {
        const curBid = document.getElementById('edit-current-bid').value;
        const endTime = document.getElementById('edit-end-time').value;
        if (curBid) updates.current_bid = Number(curBid);
        if (endTime) updates.auction_end_time = new Date(endTime).toISOString();
    }

    try {
        const { error } = await supabaseClient.from('products').update(updates).eq('id', id);
        if (error) console.warn(error);
        showAdminToast("Product Updated Successfully!");
    } catch (err) {
        showAdminToast("Update notice: " + err.message);
    }

    closeEditModal();
    loadProductsForAdmin();
    loadAuctionsForAdmin();
}

async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        await supabaseClient.from('products').delete().eq('id', productId);
        showAdminToast("Product Deleted!");
    } catch (e) {
        console.warn(e);
    }
    loadProductsForAdmin();
    loadAuctionsForAdmin();
}

// ============ 3. HIERARCHICAL CATEGORIES & SUB-TYPES (LEVEL 1 & 2) ============
function switchCategorySubTab(tab) {
    document.getElementById('view-brand-lines').classList.toggle('hidden', tab !== 'lines');
    document.getElementById('view-sub-types').classList.toggle('hidden', tab !== 'types');
    document.getElementById('subnav-lines').classList.toggle('active', tab === 'lines');
    document.getElementById('subnav-types').classList.toggle('active', tab === 'types');

    if (tab === 'lines') loadCategoriesForAdmin();
    if (tab === 'types') loadTypesForAdmin();
}

async function loadCategoriesForDropdown(selectId) {
    const el = document.getElementById(selectId);
    if (!el) return;

    if (allAdminCategories.length === 0) {
        await loadCategoriesForAdmin();
    }

    el.innerHTML = '<option value="">Select Category</option>' + 
        allAdminCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadCategoriesForAdmin() {
    let list = [];
    try {
        const { data } = await supabaseClient.from('categories').select('*').order('sort_order');
        if (data && data.length > 0) list = data;
    } catch (e) {
        console.warn(e);
    }

    if (list.length === 0) list = DEFAULT_CATEGORIES;
    allAdminCategories = list;

    const container = document.getElementById('categories-list');
    if (!container) return;

    container.innerHTML = list.map(c => `
        <div class="item-card">
            <img src="${c.logo_url || `/assets/images/${c.slug}_logo.jpg`}" alt="${c.name}" style="height:44px;width:75px;object-fit:contain;border-radius:6px;background:#000;padding:2px;border:1px solid ${c.theme_color || '#444'};">
            <div class="item-info">
                <strong>${c.name}</strong>
                <p style="color:#888;font-size:12px;">Slug: <code>${c.slug}</code> • Theme Color: <strong style="color:${c.theme_color};">${c.theme_color}</strong></p>
                <p style="color:#aaa;font-size:11px;">Status: ${c.is_active ? 'Active ✅' : 'Hidden ❌'}</p>
            </div>
            <div class="item-actions">
                <button onclick="toggleCategoryActive(${c.id}, ${!c.is_active})" class="btn-edit">
                    ${c.is_active ? 'Hide' : 'Restore'}
                </button>
            </div>
        </div>
    `).join('');

    loadCategoriesForDropdown('prod-category');
    loadCategoriesForDropdown('type-add-category');
}

async function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const color = document.getElementById('cat-color').value.trim();
    const image = document.getElementById('cat-image').value.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
        await supabaseClient.from('categories').insert({
            name,
            theme_color: color,
            image_url: image || null,
            logo_url: image || null,
            slug,
            is_active: true
        });
        showAdminToast("Brand Line Added!");
        document.getElementById('add-category-form').reset();
        await loadCategoriesForAdmin();
    } catch (err) {
        showAdminToast("Failed to add category: " + err.message);
    }
}

async function toggleCategoryActive(catId, newStatus) {
    try {
        await supabaseClient.from('categories').update({ is_active: newStatus }).eq('id', catId);
        showAdminToast("Category updated!");
        loadCategoriesForAdmin();
    } catch (e) {
        showAdminToast("Error updating category");
    }
}

// ---------- SUB-TYPES MANAGER ----------
async function loadTypesForAdmin() {
    let dbTypes = [];
    try {
        const { data, error } = await supabaseClient.from('types').select('*').order('sort_order');
        if (!error && data && data.length > 0) {
            dbTypes = data;
        }
    } catch (e) {
        console.warn('Types DB fetch note:', e);
    }

    const customTypes = JSON.parse(localStorage.getItem('vybe-custom-types') || '[]');
    const map = new Map();

    DEFAULT_TYPES.forEach(t => map.set(`${t.category_id}-${t.slug}`, t));
    dbTypes.forEach(t => map.set(`${t.category_id}-${t.slug}`, t));
    customTypes.forEach(t => map.set(`${t.category_id}-${t.slug}`, t));

    allAdminTypes = Array.from(map.values());

    renderTypesTable();
}

function autoGenerateSlug(name) {
    const slugInput = document.getElementById('type-add-slug');
    if (slugInput) {
        slugInput.value = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
}

function filterAdminTypes(catId) {
    currentAdminTypeFilter = catId;
    renderTypesTable();
}

function renderTypesTable() {
    const tbody = document.getElementById('admin-types-tbody');
    const badge = document.getElementById('types-count-badge');
    if (!tbody) return;

    let filtered = [...allAdminTypes];
    if (currentAdminTypeFilter !== 'all') {
        filtered = filtered.filter(t => t.category_id === Number(currentAdminTypeFilter));
    }

    if (badge) badge.innerText = `${filtered.length} Sub-Types`;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;padding:25px;">No sub-types found for this line.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const cat = allAdminCategories.find(c => c.id === t.category_id) || { name: 'Line ' + t.category_id, slug: 'signature' };
        return `
        <tr>
            <td>
                <span class="badge-cat-pill badge-cat-${cat.slug}">
                    ${cat.name}
                </span>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    ${t.image_url ? `<img src="${t.image_url}" alt="${t.name}" style="width:48px;height:36px;object-fit:cover;border-radius:6px;border:1px solid #333;">` : `<div style="width:48px;height:36px;background:#222;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#888;">No img</div>`}
                    <strong>${t.name}</strong>
                </div>
            </td>
            <td><code>${t.slug}</code></td>
            <td>${t.sort_order || 1}</td>
            <td>${t.is_active !== false ? 'Active ✅' : 'Hidden ❌'}</td>
            <td>
                <button onclick="openEditTypeModal(${t.id || `'${t.slug}'`})" class="btn-edit" style="margin-right:6px;">Edit</button>
                <button onclick="deleteSubType(${t.id || `'${t.slug}'`})" class="btn-delete">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

async function addSubType(e) {
    e.preventDefault();
    const categoryId = Number(document.getElementById('type-add-category').value);
    const name = document.getElementById('type-add-name').value.trim();
    const slug = document.getElementById('type-add-slug').value.trim();
    const order = Number(document.getElementById('type-add-order').value) || 1;
    let image = document.getElementById('type-add-image').value.trim();

    const fileInput = document.getElementById('type-add-file');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
            showAdminToast("Uploading image to storage...");
            image = await uploadImage(fileInput.files[0]);
        } catch (err) {
            return showAdminToast("Failed to upload image: " + err.message);
        }
    }

    if (!categoryId || !name || !slug) {
        return showAdminToast("Please fill all required fields");
    }

    const newType = {
        id: Date.now(),
        category_id: categoryId,
        name,
        slug,
        image_url: image || null,
        sort_order: order,
        is_active: true
    };

    // Try saving to Supabase
    try {
        await supabaseClient.from('types').insert({
            category_id: categoryId,
            name,
            slug,
            image_url: image || null,
            sort_order: order,
            is_active: true
        });
    } catch (err) {
        console.warn('DB insert note:', err);
    }

    // Always sync to localStorage
    const customTypes = JSON.parse(localStorage.getItem('vybe-custom-types') || '[]');
    customTypes.push(newType);
    localStorage.setItem('vybe-custom-types', JSON.stringify(customTypes));

    showAdminToast(`Sub-Type "${name}" Added!`);
    document.getElementById('add-type-form').reset();
    await loadTypesForAdmin();
}

function openEditTypeModal(typeId) {
    const t = allAdminTypes.find(x => x.id === typeId || x.slug === typeId);
    if (!t) return;

    document.getElementById('edit-type-id').value = t.id || t.slug;
    document.getElementById('edit-type-name').value = t.name;
    document.getElementById('edit-type-slug').value = t.slug;
    document.getElementById('edit-type-image').value = t.image_url || '';
    document.getElementById('edit-type-sort').value = t.sort_order || 1;
    document.getElementById('edit-type-active').value = t.is_active !== false ? 'true' : 'false';

    const catSelect = document.getElementById('edit-type-category');
    catSelect.innerHTML = allAdminCategories.map(c => `<option value="${c.id}" ${c.id === t.category_id ? 'selected' : ''}>${c.name}</option>`).join('');

    document.getElementById('edit-type-modal').classList.remove('hidden');
}

function closeEditTypeModal() {
    document.getElementById('edit-type-modal').classList.add('hidden');
}

async function saveSubTypeEdit(e) {
    e.preventDefault();
    const typeId = document.getElementById('edit-type-id').value;
    const categoryId = Number(document.getElementById('edit-type-category').value);
    const name = document.getElementById('edit-type-name').value.trim();
    const slug = document.getElementById('edit-type-slug').value.trim();
    let image = document.getElementById('edit-type-image').value.trim();
    const order = Number(document.getElementById('edit-type-sort').value);
    const active = document.getElementById('edit-type-active').value === 'true';

    const fileInput = document.getElementById('edit-type-file');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
            showAdminToast("Uploading updated image...");
            image = await uploadImage(fileInput.files[0]);
        } catch (err) {
            return showAdminToast("Failed to upload image: " + err.message);
        }
    }

    const updates = {
        category_id: categoryId,
        name,
        slug,
        image_url: image || null,
        sort_order: order,
        is_active: active
    };

    // Update in Supabase
    try {
        await supabaseClient.from('types').update(updates).or(`id.eq.${typeId},slug.eq.${slug}`);
    } catch (err) {
        console.warn('DB update note:', err);
    }

    // Update in localStorage
    const customTypes = JSON.parse(localStorage.getItem('vybe-custom-types') || '[]');
    const idx = customTypes.findIndex(x => String(x.id) === String(typeId) || x.slug === slug);
    if (idx > -1) {
        customTypes[idx] = { ...customTypes[idx], ...updates };
    } else {
        customTypes.push({ id: typeId, ...updates });
    }
    localStorage.setItem('vybe-custom-types', JSON.stringify(customTypes));

    showAdminToast("Sub-Type Updated!");
    closeEditTypeModal();
    loadTypesForAdmin();
}

async function deleteSubType(typeId) {
    if (!confirm("Are you sure you want to remove this sub-type? Products linked to this type will become unassigned.")) return;

    try {
        await supabaseClient.from('types').delete().or(`id.eq.${typeId},slug.eq.${typeId}`);
    } catch (e) {
        console.warn(e);
    }

    // Remove from localStorage
    const customTypes = JSON.parse(localStorage.getItem('vybe-custom-types') || '[]');
    const filtered = customTypes.filter(x => String(x.id) !== String(typeId) && x.slug !== typeId);
    localStorage.setItem('vybe-custom-types', JSON.stringify(filtered));

    // Remove from in-memory DEFAULT_TYPES copy if matched
    const defIdx = DEFAULT_TYPES.findIndex(x => x.id === typeId || x.slug === typeId);
    if (defIdx > -1) {
        DEFAULT_TYPES[defIdx].is_active = false;
    }

    showAdminToast("Sub-Type Removed!");
    loadTypesForAdmin();
}

// ============ 4. BANNERS ============
async function loadBannersForAdmin() {
    const container = document.getElementById('banners-list');
    if (!container) return;

    let banners = [];
    try {
        const { data } = await supabaseClient.from('banners').select('*').order('sort_order');
        if (data) banners = data;
    } catch (e) {
        console.warn(e);
    }

    if (banners.length === 0) {
        banners = [
            {
                id: 1,
                title: "CRAFTED BEYOND ORDINARY.",
                subtitle: "Luxury Streetwear & High-Tailored Men's Apparel",
                image_url: "/assets/images/vybe_hero_banner.jpg",
                is_active: true,
                sort_order: 1
            }
        ];
    }

    container.innerHTML = banners.map(b => `
        <div class="item-card">
            <img src="${b.image_url}" alt="Banner" style="width:90px;height:55px;object-fit:cover;border-radius:4px;">
            <div class="item-info">
                <strong>${b.title || 'Untitled Banner'}</strong>
                <p style="color:#888;font-size:12px;">Sort Order: ${b.sort_order} • Status: ${b.is_active ? 'Active ✅' : 'Hidden ❌'}</p>
            </div>
            <div class="item-actions">
                <button onclick="toggleBannerActive(${b.id}, ${!b.is_active})" class="btn-edit">${b.is_active ? 'Hide' : 'Show'}</button>
                <button onclick="deleteBanner(${b.id})" class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

async function addBanner(e) {
    e.preventDefault();
    try {
        let imageUrl = document.getElementById('banner-url').value.trim();
        const file = document.getElementById('banner-file').files[0];
        if (file) {
            imageUrl = await uploadImage(file);
        }

        if (!imageUrl) return showAdminToast("Please provide or upload a banner image");

        const bannerData = {
            title: document.getElementById('banner-title').value.trim(),
            subtitle: document.getElementById('banner-subtitle').value.trim(),
            link: document.getElementById('banner-link').value.trim() || 'shop.html',
            sort_order: Number(document.getElementById('banner-order').value) || 1,
            image_url: imageUrl,
            is_active: true
        };

        await supabaseClient.from('banners').insert(bannerData);
        showAdminToast("Banner slide added!");
        document.getElementById('add-banner-form').reset();
        loadBannersForAdmin();
    } catch (err) {
        showAdminToast("Banner error: " + err.message);
    }
}

async function toggleBannerActive(id, newStatus) {
    try {
        await supabaseClient.from('banners').update({ is_active: newStatus }).eq('id', id);
        showAdminToast("Banner updated!");
        loadBannersForAdmin();
    } catch (e) {
        showAdminToast("Error updating banner");
    }
}

async function deleteBanner(id) {
    if (!confirm("Delete this banner?")) return;
    try {
        await supabaseClient.from('banners').delete().eq('id', id);
        showAdminToast("Banner deleted!");
        loadBannersForAdmin();
    } catch (e) {
        showAdminToast("Error deleting banner");
    }
}

// ============ 5. AUCTIONS ============
async function loadAuctionsForAdmin() {
    const container = document.getElementById('admin-auctions-list');
    if (!container) return;

    let auctions = allAdminProducts.filter(p => p.sale_type === 'auction');
    if (auctions.length === 0) {
        auctions = [
            {
                id: 9999,
                name: "VYBE Signature \"King #1\" Limited Edition Hoodie",
                starting_bid: 4999,
                current_bid: 5499,
                highest_bidder_name: "Vikram S.",
                highest_bidder_phone: "9876543210",
                auction_end_time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
                image_url: "/assets/images/king_hoodie_front.jpg"
            }
        ];
    }

    container.innerHTML = auctions.map(a => {
        return `
        <div class="item-card" style="border-left:3px solid #FFD700;">
            <img src="${a.image_url}" alt="${a.name}">
            <div class="item-info">
                <span class="badge-cat-pill" style="background:#FFD70022;color:#FFD700;border:1px solid #FFD70066;margin-bottom:4px;">⚡ VAULT AUCTION</span>
                <strong>${a.name}</strong>
                <p style="color:#aaa;font-size:13px;margin:4px 0;">
                    Highest Bid: <strong style="color:#FFD700;font-size:15px;">₹${Number(a.current_bid || a.starting_bid).toLocaleString('en-IN')}</strong>
                    ${a.highest_bidder_name ? `by <strong>${a.highest_bidder_name}</strong> (${a.highest_bidder_phone || ''})` : '• No bids placed yet'}
                </p>
                <p style="color:#888;font-size:12px;">Ends: ${a.auction_end_time ? new Date(a.auction_end_time).toLocaleString('en-IN') : 'Open Ended'}</p>
            </div>
            <div class="item-actions">
                <button onclick="endAuctionManually(${a.id})" class="btn-edit" style="background:#e07b00;color:#000;font-weight:700;">End Auction</button>
                <button onclick="convertWinnerToOrder(${a.id})" class="btn-primary" style="background:#22c55e;color:#000;font-weight:700;">Create Order</button>
            </div>
        </div>
    `;
    }).join('');
}

async function endAuctionManually(productId) {
    if (!confirm("Are you sure you want to conclude this live auction?")) return;
    try {
        await supabaseClient.from('products').update({ auction_end_time: new Date().toISOString() }).eq('id', productId);
        showAdminToast("Auction closed!");
        loadAuctionsForAdmin();
    } catch (e) {
        showAdminToast("Error closing auction");
    }
}

async function convertWinnerToOrder(productId) {
    const a = allAdminProducts.find(x => x.id === productId);
    if (!a) return;

    const winnerName = a.highest_bidder_name || 'Winning Collector';
    const winnerPhone = a.highest_bidder_phone || '9876543210';
    const finalAmount = a.current_bid || a.starting_bid || a.price;
    const trackingId = 'VYBE-AUC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const orderObj = {
        tracking_id: trackingId,
        customer_name: winnerName,
        customer_phone: winnerPhone,
        customer_address: 'Auction Vault Winning Address',
        customer_city: 'Mumbai',
        customer_pincode: '400001',
        total_amount: finalAmount,
        status: 'Processing',
        payment_method: 'Auction Invoiced',
        payment_status: 'Pending',
        created_at: new Date().toISOString()
    };

    try {
        await supabaseClient.from('orders').insert(orderObj);
    } catch (e) {
        console.warn(e);
    }

    // Save to local orders
    const local = JSON.parse(localStorage.getItem('vybe_local_orders') || '[]');
    local.unshift(orderObj);
    localStorage.setItem('vybe_local_orders', JSON.stringify(local));

    showAdminToast(`🏆 Converted! Order Created with Tracking: ${trackingId}`);
    loadOrders();
}

// ============ SQL MIGRATION MODAL ============
const SQL_MIGRATION_TEXT = `-- ========================================================
-- VYBE SQL Schema: Categories, Types, Products & Auctions
-- Brand Tagline: "Crafted Beyond Ordinary"
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xvgzbauxaqfkqfqslker/sql
-- ========================================================

-- 1. Ensure categories table has all required columns (Level 1: Brand Lines)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    theme_color VARCHAR(20) DEFAULT '#8A2BE2',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Create types table (Level 2: Sub-categories inside each top category)
CREATE TABLE IF NOT EXISTS public.types (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- 3. Update products table with category_id, type_id and auction columns (Level 3: Products)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id INT REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS type_id INT REFERENCES public.types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS auction_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS starting_bid NUMERIC,
ADD COLUMN IF NOT EXISTS current_bid NUMERIC,
ADD COLUMN IF NOT EXISTS highest_bidder_name TEXT,
ADD COLUMN IF NOT EXISTS highest_bidder_phone TEXT;

-- 4. Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    bidder_name TEXT NOT NULL,
    bidder_phone TEXT NOT NULL,
    bid_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Seed default 3 Top Categories (Brand Lines)
INSERT INTO public.categories (id, name, slug, theme_color, is_active, sort_order)
VALUES 
    (1, 'VYBE Everyday', 'everyday', '#FF8C00', true, 1),
    (2, 'VYBE Studio', 'studio', '#00BFFF', true, 2),
    (3, 'VYBE Signature', 'signature', '#8A2BE2', true, 3)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    theme_color = EXCLUDED.theme_color,
    is_active = true,
    sort_order = EXCLUDED.sort_order;

-- 6. Seed default Types under each Category with rectangular image URLs
-- Under Everyday
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='everyday'), 'Men Fashion', 'men-fashion', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Women', 'women', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Kids', 'kids', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Casual Wear', 'casual-wear', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- Under Studio
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='studio'), 'Formal Shirts', 'formal-shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Blazers', 'blazers', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Party Wear', 'party-wear', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Footwear', 'footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- Under Signature
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='signature'), 'Premium Suits', 'premium-suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Watches', 'watches', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Jewelry', 'jewelry', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Accessories', 'accessories', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- 7. Enable Row Level Security (RLS) policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read categories') THEN
        CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public all categories') THEN
        CREATE POLICY "Allow public all categories" ON public.categories FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'types' AND policyname = 'Allow public read types') THEN
        CREATE POLICY "Allow public read types" ON public.types FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'types' AND policyname = 'Allow public all types') THEN
        CREATE POLICY "Allow public all types" ON public.types FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read products') THEN
        CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public all products') THEN
        CREATE POLICY "Allow public all products" ON public.products FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Allow public read access to bids') THEN
        CREATE POLICY "Allow public read access to bids" ON public.bids FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Allow public insert to bids') THEN
        CREATE POLICY "Allow public insert to bids" ON public.bids FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 8. Enable Realtime Publications
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.types; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.categories; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bids; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN duplicate_object THEN END;
END $$;`;

function showSqlModal() {
    const el = document.getElementById('sql-content');
    if (el) el.value = SQL_MIGRATION_TEXT;
    document.getElementById('sql-modal').classList.remove('hidden');
}

function closeSqlModal() {
    document.getElementById('sql-modal').classList.add('hidden');
}

function copySqlCode() {
    const el = document.getElementById('sql-content');
    if (!el) return;
    navigator.clipboard.writeText(el.value).then(() => {
        const st = document.getElementById('copy-sql-status');
        if (st) st.innerText = '✓ Copied to clipboard! Paste in Supabase SQL editor.';
        setTimeout(() => { if (st) st.innerText = ''; }, 4000);
        showAdminToast("SQL Migration Script Copied!");
    });
}

// Initial session check
window.addEventListener('DOMContentLoaded', () => {
    checkSession();
});
