// Customer Authentication System
let currentUser = null;
let userProfile = null;

async function checkAuthSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        await loadUserProfile();
    }
    updateAuthUI();
}

async function loadUserProfile() {
    if (!currentUser) return;
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
    userProfile = data;
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;
    if (currentUser) {
        const name = userProfile?.full_name || currentUser.email?.split('@')[0] || 'Account';
        authBtn.innerText = '👤 ' + name;
        authBtn.onclick = () => window.location.href = 'account.html';
    } else {
        authBtn.innerText = '👤 Login';
        authBtn.onclick = openAuthModal;
    }
}

function openAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(b => b.classList.remove('active'));
    document.querySelector(`.auth-tabs button[data-tab="${tab}"]`).classList.add('active');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
}

async function handleLogin(e) {
    e.preventDefault();
    const loginInput = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Agar mobile number hai toh email format mein convert karein
    let email = loginInput;
    if (/^\d{10}$/.test(loginInput)) {
        email = `${loginInput}@vybe.app`;
    }
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return showToast('Login Failed: ' + error.message);
    
    currentUser = data.user;
    await loadUserProfile();
    updateAuthUI();
    closeAuthModal();
    showToast('Welcome back!');
    setTimeout(() => window.location.reload(), 800);
}

async function handleSignup(e) {
    e.preventDefault();
    const fullName = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    if (!/^\d{10}$/.test(phone)) return showToast('Please enter a valid 10-digit mobile number');
    
    const { data, error } = await supabaseClient.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone: phone } }
    });
    
    if (error) return showToast('Signup Failed: ' + error.message);
    
    // Profile manually create karein (agar trigger fail ho)
    if (data.user) {
        await supabaseClient.from('profiles').upsert({
            id: data.user.id, full_name: fullName, phone: phone, email: email
        });
    }
    
    showToast('Account created! Please login.');
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
}

async function logoutUser() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

// Init
document.addEventListener('DOMContentLoaded', checkAuthSession);
