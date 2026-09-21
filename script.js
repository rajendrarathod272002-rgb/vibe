// 1. Supabase Configuration (Apna URL aur Key yahan daalein)
const SUPABASE_URL = 'https://xvgzbauxaqfkqfqslker.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3piYXV4YXFma3FmcXNsa2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU2MjMsImV4cCI6MjEwNTQwMTYyM30.FeEjPqSu0Rm8A7lt3qrixNkEVrsQNwlstDumLZaJDlM';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. State
let allProducts = [];
let cart = [];

// 3. Fetch Products from Supabase
async function fetchProducts() {
    const { data, error } = await supabase
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

// 4. Render Products (Category Filter ke saath)
function renderProducts(categorySlug) {
    const grid = document.getElementById('product-grid');
    const title = document.getElementById('category-title');
    
    let filteredProducts = allProducts;
    
    if (categorySlug !== 'all') {
        filteredProducts = allProducts.filter(p => p.categories.slug === categorySlug);
        title.innerText = `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Collection`;
        
        // Theme change logic
        const themeColors = { everyday: '#FF8C00', studio: '#00BFFF', signature: '#8A2BE2' };
        document.documentElement.style.setProperty('--primary-purple', themeColors[categorySlug]);
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

// 5. Category Switcher
function switchCategory(cat) {
    // Update active button styling
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if(cat !== 'all') {
        document.querySelector(`.cat-btn[data-cat="${cat}"]`).classList.add('active');
    }
    renderProducts(cat);
}

// 6. Cart Logic
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

// 7. Checkout (Simplified for MVP)
async function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");

    const name = prompt("Enter your Name:");
    const email = prompt("Enter your Email:");
    const address = prompt("Enter your Address:");
    
    if (!name || !email || !address) return alert("All fields are required!");

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const trackingId = 'VYBE' + Math.floor(Math.random() * 1000000);

    // Insert Order
    const { data: orderData, error: orderError } = await supabase
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

    await supabase.from('order_items').insert(orderItems);

    alert(`Order Placed Successfully! Your Tracking ID is: ${trackingId}`);
    cart = [];
    updateCartCount();
    toggleCart();
}

// 8. Order Tracking
async function trackOrder() {
    const trackingId = document.getElementById('tracking-id').value;
    const resultDiv = document.getElementById('tracking-result');

    if (!trackingId) return alert("Please enter Tracking ID");

    const { data, error } = await supabase
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
window.onload = fetchProducts;
