const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// 1. Admin Login
async function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        alert("Bhai, pehle admin-script.js mein Supabase URL aur Key daalo!");
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert("Login Failed: " + error.message);
        console.error("Detailed Error:", error);
        return;
    }
    
    currentUser = data.user;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    loadDashboard();
}

// 2. Admin Logout
async function adminLogout() {
    await supabaseClient.auth.signOut();
    window.location.reload();
}

// 3. Check if already logged in
async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadDashboard();
    }
}

// 4. Tab Switching
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    if (tabId === 'orders') loadOrders();
    if (tabId === 'products') { loadProductsForAdmin(); loadCategoriesForDropdown(); }
    if (tabId === 'categories') loadCategoriesForAdmin();
}

// 5. Load Dashboard Data
function loadDashboard() {
    loadOrders();
    loadCategoriesForDropdown();
    loadCategoriesForAdmin();
    loadProductsForAdmin();
}

// --- ORDERS MANAGEMENT ---
async function loadOrders() {
    const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '';

    data.forEach(order => {
        tbody.innerHTML += `
            <tr>
                <td>${order.tracking_id}</td>
                <td>${order.customer_name}<br><small>${order.customer_email}</small></td>
                <td>₹${order.total_amount}</td>
                <td><span class="status-badge">${order.status}</span></td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Stitched" ${order.status === 'Stitched' ? 'selected' : ''}>Stitched</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) alert("Error updating: " + error.message);
    else alert("Order Status Updated!");
}

// --- CATEGORY MANAGEMENT ---
loadCategoriesForAdmin

async function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value;
    const color = document.getElementById('cat-color').value;
    const image_url = document.getElementById('cat-image').value; // Image URL
    const slug = name.toLowerCase().replace(/ /g, '-');

    const { error } = await supabaseClient.from('categories').insert([{ 
        name: name, 
        slug: slug, 
        theme_color: color, 
        image_url: image_url 
    }]);
    
    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Category Added!");
        document.getElementById('add-category-form').reset();
        loadCategoriesForAdmin();
        loadCategoriesForDropdown();
    }
}

async function removeCategory(id) {
    if (!confirm("Are you sure? This will not delete products, but they won't show up.")) return;
    await supabaseClient.from('categories').update({ is_active: false }).eq('id', id);
    loadCategoriesForAdmin();
}

// --- PRODUCT MANAGEMENT ---
async function loadCategoriesForDropdown() {
    const { data } = await supabaseClient.from('categories').select('*').eq('is_active', true);
    const select = document.getElementById('prod-category');
    select.innerHTML = '<option value="">Select Category</option>';
    data.forEach(cat => select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`);
}

async function addProduct(e) {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category_id = parseInt(document.getElementById('prod-category').value);
    const image_url = document.getElementById('prod-image').value;

    const { error } = await supabaseClient.from('products').insert([{ name, price, category_id, image_url }]);
    if (error) alert("Error: " + error.message);
    else {
        alert("Product Added!");
        document.getElementById('add-product-form').reset();
        loadProductsForAdmin();
    }
}

async function loadProductsForAdmin() {
    const { data } = await supabaseClient.from('products').select('*, categories(name)');
    const container = document.getElementById('products-list');
    container.innerHTML = data.map(prod => `
        <div class="product-item">
            <span>${prod.name} - ₹${prod.price} (${prod.categories?.name})</span>
            <button onclick="removeProduct(${prod.id})" class="btn-danger">Remove</button>
        </div>
    `).join('');
}

async function removeProduct(id) {
    if (!confirm("Delete this product permanently?")) return;
    await supabaseClient.from('products').delete().eq('id', id);
    loadProductsForAdmin();
}

// Initialize
checkSession();
