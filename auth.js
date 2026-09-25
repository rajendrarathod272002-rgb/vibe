// =========================================
// VYBE — Authentication System (auth.js)
// Supports Mobile ({phone}@vybe.app) and Email
// =========================================

let currentUser = null;
let userProfile = null;

async function checkAuthSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            currentUser = session.user;
            await loadUserProfile();
        } else {
            currentUser = null;
            userProfile = null;
        }
    } catch (err) {
        console.warn('Session check note:', err);
    }
    updateAuthUI();
}

async function loadUserProfile() {
    if (!currentUser) return;
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (!error && data) {
            userProfile = data;
        } else {
            // If profile does not exist yet in profiles table, create it from metadata
            const metadata = currentUser.user_metadata || {};
            const phone = metadata.phone || (currentUser.email?.includes('@vybe.app') ? currentUser.email.split('@')[0] : '');
            const newProfile = {
                id: currentUser.id,
                full_name: metadata.full_name || currentUser.email?.split('@')[0] || 'VYBE Member',
                phone: phone,
                email: currentUser.email
            };
            await supabaseClient.from('profiles').upsert(newProfile);
            userProfile = newProfile;
        }
    } catch (err) {
        console.warn('Profile load note:', err);
        userProfile = {
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Member',
            email: currentUser.email,
            phone: currentUser.user_metadata?.phone || ''
        };
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    if (currentUser) {
        const fullName = userProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Account';
        const firstName = fullName.split(' ')[0];
        authBtn.innerHTML = `👤 <span>${firstName}</span>`;
        authBtn.onclick = () => window.location.href = 'account.html';
        authBtn.title = `Logged in as ${fullName}`;
    } else {
        authBtn.innerHTML = `👤 <span>Login</span>`;
        authBtn.onclick = openAuthModal;
        authBtn.title = 'Login or Sign Up';
    }
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tabs button').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm) loginForm.classList.toggle('hidden', tab !== 'login');
    if (signupForm) signupForm.classList.toggle('hidden', tab !== 'signup');
}

async function handleLogin(e) {
    e.preventDefault();
    const loginInput = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!loginInput || !password) {
        showToast('Please enter credentials');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Verifying...';
    }

    // If 10-digit mobile number, transform to synthetic @vybe.app address
    let email = loginInput;
    if (/^\d{10}$/.test(loginInput)) {
        email = `${loginInput}@vybe.app`;
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showToast('Login Failed: ' + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Login';
            }
            return;
        }

        currentUser = data.user;
        await loadUserProfile();
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome back, ${userProfile?.full_name?.split(' ')[0] || 'Member'}!`);

        // If on account page, reload to refresh data
        if (window.location.pathname.includes('account.html')) {
            setTimeout(() => window.location.reload(), 600);
        }
    } catch (err) {
        showToast('Connection error during login');
        console.error(err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Login';
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const fullName = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!/^\d{10}$/.test(phone)) {
        showToast('Please enter a valid 10-digit mobile number');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating Account...';
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone
                }
            }
        });

        if (error) {
            showToast('Signup Failed: ' + error.message);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Create Account';
            }
            return;
        }

        if (data.user) {
            currentUser = data.user;
            // Upsert profile in Supabase profiles table
            try {
                await supabaseClient.from('profiles').upsert({
                    id: data.user.id,
                    full_name: fullName,
                    phone: phone,
                    email: email
                });
            } catch (pErr) {
                console.warn('Profile upsert note:', pErr);
            }
        }

        showToast('Account created successfully! You are now logged in.');
        await loadUserProfile();
        updateAuthUI();
        closeAuthModal();

        if (window.location.pathname.includes('account.html')) {
            setTimeout(() => window.location.reload(), 600);
        }
    } catch (err) {
        showToast('Error creating account');
        console.error(err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Create Account';
        }
    }
}

async function logoutUser() {
    try {
        await supabaseClient.auth.signOut();
    } catch (e) {
        console.warn('Signout note:', e);
    }
    currentUser = null;
    userProfile = null;
    showToast('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

// Global modal triggers
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logoutUser = logoutUser;

// Session listener
document.addEventListener('DOMContentLoaded', () => {
    checkAuthSession();
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            currentUser = session.user;
            loadUserProfile().then(updateAuthUI);
        } else {
            currentUser = null;
            userProfile = null;
            updateAuthUI();
        }
    });
});
