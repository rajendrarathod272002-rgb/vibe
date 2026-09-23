const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let allAdminProducts = [];

// ============ AUTH ============
async function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert("Login Failed: " + error.message);
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
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    if (tabId === 'orders') loadOrders();
    if (tabId === 'products') { loadProductsForAdmin(); loadCategoriesForDropdown('prod-category'); }
    if (tabId === 'categories') loadCategoriesForAdmin();
    if (tabId === 'banners') loadBannersForAdmin();
}

function loadDashboard() {
    loadOrders();
    loadCategoriesForDropdown('prod-category');
    loadCategoriesForAdmin();
    loadProductsForAdmin();
    loadBannersForAdmin();
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

// ============ ORDERS ============
async function loadOrders() {
    const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:30px;">No orders yet</td></tr>';
        return;
    }
    
    data.forEach(order => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${order.tracking_id}</strong><br><small style="color:#888;">${new Date(order.created_at).toLocaleDateString()}</small></td>
                <td>${order.customer_name}<br><small style="color:#888;">${order.customer_phone || order.customer_email || ''}</small></td>
                <td><strong>₹${order.total_amount}</strong></td>
                <td><span class="status-badge">${order.status}</span></td>
                <td>
                    <button onclick="viewOrderDetails(${order.id})" class="btn-edit" style="background:#00BFFF;">View</button>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" style="width:auto;display:inline-block;margin-left:5px;padding:6px;">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Stitched" ${order.status === 'Stitched' ? 'selected' : ''}>Stitched</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>`;
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) return alert("Error: " + error.message);
    alert("Order Status Updated!");
    loadOrders();
}

async function viewOrderDetails(orderId) {
    const { data: order } = await supabaseClient.from('orders').select('*').eq('id', orderId).single();
    const { data: items } = await supabaseClient.from('order_items').select('*, products(name, image_url, price)').eq('order_id', orderId);
    
    const content = document.getElementById('order-details-content');
    content.innerHTML = `
        <div class="order-detail-row"><span>Tracking ID</span><strong>${order.tracking_id}</strong></div>
        <div class="order-detail-row"><span>Customer</span><strong>${order.customer_name}</strong></div>
        <div class="order-detail-row"><span>Phone</span><strong>${order.customer_phone || '-'}</strong></div>
        <div class="order-detail-row"><span>Email</span><strong>${order.customer_email || '-'}</strong></div>
        <div class="order-detail-row"><span>Address</span><strong style="text-align:right;max-width:60%;">${order.customer_address}, ${order.customer_city || ''} - ${order.customer_pincode || ''}</strong></div>
        <div class="order-detail-row"><span>Payment</span><strong>${order.payment_method || 'COD'}</strong></div>
        <div class="order-detail-row"><span>Status</span><strong>${order.status}</strong></div>
        <div class="order-detail-row"><span>Total</span><strong style="color:#FF8C00;font-size:18px;">₹${order.total_amount}</strong></div>
        
        <h3 style="margin-top:20px;margin-bottom:10px;">Order Items</h3>
        <div class="order-items-box">
            ${items && items.length > 0 ? items.map(i => `
                <div class="order-item-row">
                    <img src="${i.product_image || i.products?.image_url || ''}" alt="">
                    <div class="info">
                        <strong>${i.product_name || i.products?.name || 'Product'}</strong>
                        <small style="color:#888;display:block;">Size: ${i.size || 'N/A'} • Qty: ${i.quantity} • ₹${i.price}</small>
                    </div>
                    <strong>₹${i.price * i.quantity}</strong>
                </div>
            `).join('') : '<p style="color:#888;">No items found</p>'}
        </div>`;
    
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// ============ CATEGORIES ============
async function loadCategoriesForAdmin() {
    const { data } = await supabaseClient.from('categories').select('*').order('id');
    const container = document.getElementById('categories-list');
    container.innerHTML = data.map(cat => `
        <div class="list-item ${cat.is_active ? '' : 'inactive-item'}">
            <div class="list-item-info">
                <strong>${cat.name}</strong> ${cat.is_active ? '✅' : '❌ Hidden'}
                <small>Slug: ${cat.slug} • Color: ${cat.theme_color}</small>
            </div>
            ${cat.is_active 
                ? `<button onclick="removeCategory(${cat.id})" class="btn-danger">Hide</button>`
                : `<button onclick="restoreCategory(${cat.id})" style="background:#22c55e;">Restore</button>`}
        </div>
    `).join('');
}

async function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const color = document.getElementById('cat-color').value.trim();
    const image_url = document.getElementById('cat-image').value.trim();
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabaseClient.from('categories').insert([{ name, slug, theme_color: color, image_url }]);
    if (error) return alert("Error: " + error.message);
    alert("Category Added!");
    document.getElementById('add-category-form').reset();
    loadCategoriesForAdmin();
    loadCategoriesForDropdown('prod-category');
}

async function removeCategory(id) {
    if (!confirm("Hide this category? Products will be hidden but not deleted.")) return;
    await supabaseClient.from('categories').update({ is_active: false }).eq('id', id);
    loadCategoriesForAdmin();
}

async function restoreCategory(id) {
    if (!confirm("Restore this category?")) return;
    await supabaseClient.from('categories').update({ is_active: true }).eq('id', id);
    loadCategoriesForAdmin();
    loadCategoriesForDropdown('prod-category');
}

// ============ PRODUCTS ============
async function loadCategoriesForDropdown(selectId) {
    const { data } = await supabaseClient.from('categories').select('*').eq('is_active', true);
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Select Category</option>';
    data.forEach(cat => select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`);
}

async function addProduct(e) {
    e.preventDefault();
    const name = document.getElementById('prod-name').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value);
    const mrp = parseFloat(document.getElementById('prod-mrp').value) || null;
    const category_id = parseInt(document.getElementById('prod-category').value);
    const description = document.getElementById('prod-description').value.trim();
    const sizesStr = document.getElementById('prod-sizes').value.trim();
    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(s => s) : ['S','M','L','XL'];
    const stock = parseInt(document.getElementById('prod-stock').value) || 10;
    
    const fileInput = document.getElementById('prod-image-file');
    const hoverFileInput = document.getElementById('prod-hover-file');
    let image_url = document.getElementById('prod-image').value.trim();
    let hover_image_url = document.getElementById('prod-hover-image').value.trim();
    
    const submitBtn = document.querySelector('#add-product-form button[type="submit"]');

    try {
        submitBtn.innerText = "Uploading...";
        submitBtn.disabled = true;
        
        if (fileInput.files.length > 0) image_url = await uploadImage(fileInput.files[0]);
        if (hoverFileInput.files.length > 0) hover_image_url = await uploadImage(hoverFileInput.files[0]);
    } catch (err) {
        alert("Image Upload Failed: " + err.message);
        submitBtn.innerText = "Add Product";
        submitBtn.disabled = false;
        return;
    }
    
    if (!image_url) {
        alert("Please upload an image or paste URL");
        submitBtn.innerText = "Add Product";
        submitBtn.disabled = false;
        return;
    }
    
    const { error } = await supabaseClient.from('products').insert([{
        name, price, mrp, category_id, description, sizes, stock, image_url, hover_image_url: hover_image_url || null
    }]);
    
    submitBtn.innerText = "Add Product";
    submitBtn.disabled = false;
    
    if (error) return alert("Error: " + error.message);
    alert("Product Added!");
    document.getElementById('add-product-form').reset();
    document.getElementById('prod-sizes').value = 'S,M,L,XL';
    document.getElementById('prod-stock').value = 10;
    loadProductsForAdmin();
}

async function loadProductsForAdmin() {
    const { data } = await supabaseClient.from('products').select('*, categories(name)').order('id', { ascending: false });
    allAdminProducts = data || [];
    const container = document.getElementById('products-list');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:30px;">No products yet</p>';
        return;
    }
    
    container.innerHTML = data.map(prod => `
        <div class="list-item">
            <img src="${prod.image_url}" alt="">
            <div class="list-item-info">
                <strong>${prod.name}</strong> - ₹${prod.price}
                ${prod.mrp ? `<small style="text-decoration:line-through;color:#666;display:inline;">₹${prod.mrp}</small>` : ''}
                <small>Category: ${prod.categories?.name || 'N/A'} • Stock: ${prod.stock || 0} • Sizes: ${(prod.sizes || []).join(', ')}</small>
            </div>
            <button onclick="openEditModal(${prod.id})" class="btn-edit">Edit</button>
            <button onclick="removeProduct(${prod.id})" class="btn-danger">Delete</button>
        </div>
    `).join('');
}

async function removeProduct(id) {
    if (!confirm("Delete this product permanently?")) return;
    await supabaseClient.from('products').delete().eq('id', id);
    loadProductsForAdmin();
}

// Edit Product
async function openEditModal(id) {
    const prod = allAdminProducts.find(p => p.id === id);
    if (!prod) return;
    
    await loadCategoriesForDropdown('edit-category');
    
    document.getElementById('edit-id').value = prod.id;
    document.getElementById('edit-name').value = prod.name;
    document.getElementById('edit-price').value = prod.price;
    document.getElementById('edit-mrp').value = prod.mrp || '';
    document.getElementById('edit-category').value = prod.category_id || '';
    document.getElementById('edit-description').value = prod.description || '';
    document.getElementById('edit-sizes').value = (prod.sizes || []).join(',');
    document.getElementById('edit-stock').value = prod.stock || 10;
    document.getElementById('edit-image').value = prod.image_url || '';
    document.getElementById('edit-hover-image').value = prod.hover_image_url || '';
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

async function saveProductEdit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const sizesStr = document.getElementById('edit-sizes').value.trim();
    
    const updates = {
        name: document.getElementById('edit-name').value.trim(),
        price: parseFloat(document.getElementById('edit-price').value),
        mrp: parseFloat(document.getElementById('edit-mrp').value) || null,
        category_id: parseInt(document.getElementById('edit-category').value),
        description: document.getElementById('edit-description').value.trim(),
        sizes: sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(s => s) : ['S','M','L','XL'],
        stock: parseInt(document.getElementById('edit-stock').value) || 10,
        image_url: document.getElementById('edit-image').value.trim(),
        hover_image_url: document.getElementById('edit-hover-image').value.trim() || null
    };
    
    const { error } = await supabaseClient.from('products').update(updates).eq('id', id);
    if (error) return alert("Error: " + error.message);
    alert("Product Updated!");
    closeEditModal();
    loadProductsForAdmin();
}

// ============ BANNERS ============
async function loadBannersForAdmin() {
    const { data } = await supabaseClient.from('banners').select('*').order('sort_order');
    const container = document.getElementById('banners-list');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:30px;">No banners yet</p>';
        return;
    }
    
    container.innerHTML = data.map(b => `
        <div class="list-item ${b.is_active ? '' : 'inactive-item'}">
            <img src="${b.image_url}" alt="" style="width:120px;height:60px;">
            <div class="list-item-info">
                <strong>${b.title || 'Banner'}</strong>
                <small>${b.subtitle || ''} • Order: ${b.sort_order} ${b.is_active ? '' : '• ❌ Hidden'}</small>
            </div>
            ${b.is_active 
                ? `<button onclick="toggleBanner(${b.id}, false)" class="btn-danger">Hide</button>`
                : `<button onclick="toggleBanner(${b.id}, true)" style="background:#22c55e;">Show</button>`}
            <button onclick="removeBanner(${b.id})" class="btn-danger">Delete</button>
        </div>
    `).join('');
}

async function addBanner(e) {
    e.preventDefault();
    const title = document.getElementById('banner-title').value.trim();
    const subtitle = document.getElementById('banner-subtitle').value.trim();
    const link = document.getElementById('banner-link').value.trim();
    const sort_order = parseInt(document.getElementById('banner-order').value) || 1;
    const fileInput = document.getElementById('banner-file');
    let image_url = document.getElementById('banner-url').value.trim();
    
    const submitBtn = document.querySelector('#add-banner-form button[type="submit"]');
    
    if (fileInput.files.length > 0) {
        try {
            submitBtn.innerText = "Uploading...";
            submitBtn.disabled = true;
            image_url = await uploadImage(fileInput.files[0]);
        } catch (err) {
            alert("Upload Failed: " + err.message);
            submitBtn.innerText = "Add Banner";
            submitBtn.disabled = false;
            return;
        }
    }
    
    if (!image_url) {
        alert("Please upload image or paste URL");
        submitBtn.innerText = "Add Banner";
        submitBtn.disabled = false;
        return;
    }
    
    const { error } = await supabaseClient.from('banners').insert([{ title, subtitle, link, sort_order, image_url }]);
    submitBtn.innerText = "Add Banner";
    submitBtn.disabled = false;
    
    if (error) return alert("Error: " + error.message);
    alert("Banner Added!");
    document.getElementById('add-banner-form').reset();
    document.getElementById('banner-order').value = 1;
    loadBannersForAdmin();
}

async function toggleBanner(id, active) {
    await supabaseClient.from('banners').update({ is_active: active }).eq('id', id);
    loadBannersForAdmin();
}

async function removeBanner(id) {
    if (!confirm("Delete this banner?")) return;
    await supabaseClient.from('banners').delete().eq('id', id);
    loadBannersForAdmin();
}

// ============ INIT ============
checkSession();
