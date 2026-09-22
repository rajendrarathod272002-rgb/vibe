// 1. Supabase Configuration
const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';

// Yahan 'supabaseClient' naam use kiya hai taaki conflict na ho
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. State
let allProducts = [];
let cart = [];

// 3. Categories ko dynamically load karne ke liye
async function loadCategories() {
    const { data, error } = await supabaseClient.from('categories').select('*').eq('is_active', true);
    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }
    
    const container = document.getElementById('category-buttons');
    
    // "All Products" button (Text wala)
    let buttonsHTML = `<button class="cat-btn" onclick="switchCategory('all')">All Products</button>`;
    
    data.forEach(cat => {
        // Agar category ka image URL hai, toh Image Button banayein
        if (cat.image_url) {
            buttonsHTML += `
                <div class="cat-img-btn" onclick="switchCategory('${cat.slug}')">
                    <img src="${cat.image_url}" alt="${cat.name}">
                </div>
            `;
        } else {
            // Agar image nahi hai, toh purana Text Button dikhayein
            buttonsHTML += `
                <button class="cat-btn" data-cat="${cat.slug}" style="--theme: ${cat.theme_color};" onclick="switchCategory('${cat.slug}')">
                    ${cat.name}
                </button>
            `;
        }
    });
    
    container.innerHTML = buttonsHTML;
}

// 4. Fetch Products from Supabase
async function fetchProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*, categories!inner(name, slug, is_active)')
        .eq('categories.is_active', true);
        
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }
    allProducts = data;
    renderProducts('all');
}

// 5. Render Products (Category Filter ke saath)
function renderProducts(categorySlug) {
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('category-title');
    
    let filteredProducts = allProducts;
    
    if (categorySlug !== 'all') {
        filteredProducts = allProducts.filter(p => p.categories.slug === categorySlug);
        title.innerText = `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Collection`;
        
        // Theme change logic
        const themeColors = { everyday: '#FF8C00', studio: '#00BFFF', signature: '#8A2BE2' };
        document.documentElement.style.setProperty('--primary-purple', themeColors[categorySlug] || '#8A2BE2');
    } else {
        title.innerText = "All Products";
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
        </div>
    `).join('');
}

// 6. Category Switcher
function switchCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if(cat !== 'all') {
        const activeBtn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
        if(activeBtn) activeBtn.classList.add('active');
    }
    renderProducts(cat);
}

// 7. Cart Logic
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartCount();
    alert(`${name} added to cart!`);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalDiv.innerText = 'Total: ₹0';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `<div><p>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</p></div>`;
    }).join('');
    
    totalDiv.innerText = `Total: ₹${total}`;
}

// 8. Checkout
async function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");

    const name = prompt("Enter your Name:");
    const email = prompt("Enter your Email:");
    const address = prompt("Enter your Address:");
    
    if (!name || !email || !address) return alert("All fields are required!");

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const trackingId = 'VYBE' + Math.floor(Math.random() * 1000000);

    // Insert Order
    const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .insert([{ customer_name: name, customer_email: email, customer_address: address, total_amount: totalAmount, tracking_id: trackingId }])
        .select();

    if (orderError) return alert("Error placing order: " + orderError.message);

    const orderId = orderData[0].id;

    // Insert Order Items
    const orderItems = cart.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
    }));

    await supabaseClient.from('order_items').insert(orderItems);

    alert(`Order Placed Successfully! Your Tracking ID is: ${trackingId}`);
    cart = [];
    updateCartCount();
    toggleCart();
}

// 9. Order Tracking
async function trackOrder() {
    const trackingId = document.getElementById('tracking-id').value;
    const resultDiv = document.getElementById('tracking-result');

    if (!trackingId) return alert("Please enter Tracking ID");

    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('tracking_id', trackingId)
        .single();

    if (error || !data) {
        resultDiv.innerHTML = `<p style="color: red;">Order not found!</p>`;
        return;
    }

    resultDiv.innerHTML = `
        <div style="margin-top: 20px; padding: 20px; background: #1a1a1a; border-radius: 10px;">
            <h3>Status: <span style="color: var(--primary-cyan);">${data.status}</span></h3>
            <p>Name: ${data.customer_name}</p>
            <p>Total: ₹${data.total_amount}</p>
            <p>Order Date: ${new Date(data.created_at).toLocaleDateString()}</p>
        </div>
    `;
}

function scrollToShop() {
    document.getElementById('shop').scrollIntoView();
}

// Initialize
// Theme Toggle Logic
function toggleTheme() {
    const body = document.body;
    const checkbox = document.getElementById('theme-checkbox');
    
    if (checkbox.checked) {
        // Light Mode ON
        body.classList.add('light-mode');
        localStorage.setItem('vybe-theme', 'light');
    } else {
        // Dark Mode ON
        body.classList.remove('light-mode');
        localStorage.setItem('vybe-theme', 'dark');
    }
}

// Page load hone par theme check karein
function loadTheme() {
    const savedTheme = localStorage.getItem('vybe-theme');
    const checkbox = document.getElementById('theme-checkbox');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (checkbox) checkbox.checked = true;
    } else {
        document.body.classList.remove('light-mode');
        if (checkbox) checkbox.checked = false;
    }
}

// Initialize
window.onload = () => {
    loadTheme();       // Theme load karein
    loadCategories();  // Categories load karein
    fetchProducts();   // Products load karein
};

// Page load hone par theme check karein
function loadTheme() {
    const savedTheme = localStorage.getItem('vybe-theme');
    const toggleBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        toggleBtn.innerText = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        toggleBtn.innerText = '🌙';
    }
}

// Initialize
window.onload = () => {
    loadTheme();       // Theme load karein
    loadCategories();  // Categories load karein
    fetchProducts();   // Products load karein
};
