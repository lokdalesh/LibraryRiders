// App State & Mock Data
const state = {
    notifications: [],
    currentUser: null, // { email, name, role }
    books: [
        { id: 'B-1001', title: 'The Pragmatic Programmer', author: 'Andy Hunt', category: 'Technology', stock: 3, total: 5, status: 'Available' },
        { id: 'B-1002', title: 'Design Patterns', author: 'Erich Gamma', category: 'Technology', stock: 0, total: 2, status: 'Out of Stock' },
        { id: 'B-1003', title: 'Sapiens: A Brief History', author: 'Yuval Noah Harari', category: 'History', stock: 1, total: 4, status: 'Available' },
        { id: 'B-1004', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', stock: 5, total: 5, status: 'Available' },
        { id: 'B-1005', title: 'Dune', author: 'Frank Herbert', category: 'Science Fiction', stock: 0, total: 3, status: 'Out of Stock' },
    ],
    members: [
        { id: 'M-5280', name: 'Alice Smith', type: 'Student', borrowed: 2, status: 'Active' },
        { id: 'M-5281', name: 'Bob Johnson', type: 'Faculty', borrowed: 4, status: 'Active' },
        { id: 'M-5282', name: 'Charlie Davis', type: 'Student', borrowed: 1, status: 'Suspended' },
        { id: 'M-5283', name: 'Diana Ross', type: 'Library Manager', borrowed: 0, status: 'Active' },
        { id: 'M-1000', name: 'Lohitha', type: 'Manager', borrowed: 0, status: 'Active' },
        { id: 'M-1001', name: 'Dalesh', type: 'Manager', borrowed: 0, status: 'Active' },
        { id: 'M-1002', name: 'Reshma', type: 'Manager', borrowed: 0, status: 'Active' },
    ],
    myHistory: [
        { id: 'B-1004', title: 'Atomic Habits', author: 'James Clear', borrowDate: '2023-11-01', dueDate: '2023-11-15', status: 'Active Loan' },
        { id: 'B-1001', title: 'The Pragmatic Programmer', author: 'Andy Hunt', borrowDate: '2023-09-15', dueDate: '2023-09-29', status: 'Returned' }
    ]
};

// Simulated Backend API for Users
const UsersDB = {
    init: function() {
        if (!localStorage.getItem('nexus_users')) {
            // Seed DB with default users and managers
            const users = [
                { email: 'student@nexus.edu', name: 'Demo Student', password: 'password123', role: 'student', history: [] },
                { email: 'lohitha.24bcw7073@vitapstudent.ac.in', name: 'Lohitha', password: 'password123', role: 'manager', history: [] },
                { email: 'dalesh.24bcs7138@vitapstudent.ac.in', name: 'Dalesh', password: 'password123', role: 'manager', history: [] },
                { email: 'reshma.24bce8167@vitapstudent.ac.in', name: 'Reshma', password: 'password123', role: 'manager', history: [] }
            ];
            // Assign member IDs
            users.forEach((user, index) => {
                user.memberId = `M-${1000 + index}`;
            });
            localStorage.setItem('nexus_users', JSON.stringify(users));
        }
    },
    getUsers: function() {
        return JSON.parse(localStorage.getItem('nexus_users')) || [];
    },
    createUser: function(userObj) {
        // Manager Email Allowlist Check
        if (userObj.role === 'manager') {
            const allowedManagers = [
                'lohitha.24bcw7073@vitapstudent.ac.in',
                'dalesh.24bcs7138@vitapstudent.ac.in',
                'reshma.24bce8167@vitapstudent.ac.in'
            ];
            if (!allowedManagers.includes(userObj.email.toLowerCase())) {
                return { success: false, message: 'Unauthorized. This email is not approved for Library Manager access.' };
            }
            if (userObj.password !== 'password123') {
                return { success: false, message: 'Incorrect password.' };
            }
        }

        const users = this.getUsers();
        if (users.find(u => u.email === userObj.email)) {
            return { success: false, message: 'Email address is already registered.' };
        }

        // Assign unique member ID
        const existingIds = users.map(u => u.memberId || '').filter(id => id.startsWith('M-')).map(id => parseInt(id.substring(2)) || 0);
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1000;
        userObj.memberId = `M-${nextId}`;

        // Ensure every user has a history array for borrow/reservation tracking
        if (!userObj.history) userObj.history = [];

        users.push(userObj);
        localStorage.setItem('nexus_users', JSON.stringify(users));
        
        // Also add them to the mock members list (to display in manager view)
        state.members.push({ id: userObj.memberId, name: userObj.name, type: userObj.role.charAt(0).toUpperCase() + userObj.role.slice(1), borrowed: 0, status: 'Active' });
        
        return { success: true, user: userObj };
    },
    loginUser: function(email, password, role) {
        // Manager Email Allowlist Check
        if (role === 'manager') {
            const allowedManagers = [
                'lohitha.24bcw7073@vitapstudent.ac.in',
                'dalesh.24bcs7138@vitapstudent.ac.in',
                'reshma.24bce8167@vitapstudent.ac.in'
            ];
            if (!allowedManagers.includes(email.toLowerCase())) {
                return { success: false, message: 'Unauthorized. This email is not approved for Library Manager access.' };
            }
            if (password !== 'password123') {
                return { success: false, message: 'Incorrect password.' };
            }

            const users = this.getUsers();
            let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
            if (!user) {
                // Auto-create manager account
                const existingIds = users.map(u => u.memberId || '').filter(id => id.startsWith('M-')).map(id => parseInt(id.substring(2)) || 0);
                const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1000;
                user = { 
                    email: email.toLowerCase(), 
                    name: email.split('@')[0].split('.')[0], // First part of email
                    password: 'password123', 
                    role: 'manager', 
                    history: [], 
                    memberId: `M-${nextId}` 
                };
                users.push(user);
                localStorage.setItem('nexus_users', JSON.stringify(users));
                // Add to members list
                state.members.push({ id: user.memberId, name: user.name, type: 'Manager', borrowed: 0, status: 'Active' });
            }
            return { success: true, user: user };
        }

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
        if (!user) {
            return { success: false, message: 'No account found for this email and role combination.' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        if (!user.history) user.history = [];
        return { success: true, user: user };
    },
    updateUser: function(email, details) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index !== -1) {
            users[index] = { ...users[index], ...details };
            localStorage.setItem('nexus_users', JSON.stringify(users));
            return { success: true, user: users[index] };
        }
        return { success: false, message: 'User not found' };
    },
    deleteUser: function(email) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index !== -1) {
            users.splice(index, 1);
            localStorage.setItem('nexus_users', JSON.stringify(users));
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    }
};

// Simple Book persistence layer so catalog changes survive reloads.
const BooksDB = {
    init: function() {
        if (!localStorage.getItem('nexus_books')) {
            localStorage.setItem('nexus_books', JSON.stringify(state.books));
        }
    },
    getBooks: function() {
        return JSON.parse(localStorage.getItem('nexus_books')) || state.books;
    },
    saveBooks: function(books) {
        localStorage.setItem('nexus_books', JSON.stringify(books));
    }
};

// Helpers for per-user borrowing history
function getUserHistory(email) {
    const user = UsersDB.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? (user.history || []) : [];
}

function setUserHistory(email, history) {
    const user = UsersDB.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;
    user.history = history || [];
    UsersDB.updateUser(user.email, { history: user.history });
    if (state.currentUser && state.currentUser.email.toLowerCase() === user.email.toLowerCase()) {
        state.currentUser.history = user.history;
        state.myHistory = user.history;
    }
}

function getAllHistories() {
    return UsersDB.getUsers().flatMap(user => {
        const history = user.history || [];
        return history.map(h => ({
            ...h,
            borrowerName: user.name,
            borrowerEmail: user.email,
            borrowerReg: h.borrowerReg || user.regNum || ''
        }));
    });
}

function findHistoryOwner(historyId) {
    const users = UsersDB.getUsers();
    for (const user of users) {
        const history = user.history || [];
        const item = history.find(h => h._id === historyId);
        if (item) {
            return { user, item };
        }
    }
    return null;
}

// Persist current state to localStorage (books + users)
function persistState() {
    BooksDB.saveBooks(state.books);
}



document.addEventListener('DOMContentLoaded', () => {
    UsersDB.init(); // Initialize LocalStorage Backend
    BooksDB.init(); // Initialize books persistence
    state.books = BooksDB.getBooks();

    initLogin();
    initNavigation();
    initDateInput();
    initNotifications();
    initStudentDetailsForm();
    initProfileDropdown();
    initAddBookForm();
    initManagerForms();
    initThemeToggle();

    // Initialize Google Sign-In (fallback to demo button if Google API is unavailable)
    const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // TODO: Replace with real Client ID from Google Cloud Console
    const googleBtnContainer = document.getElementById("google-signin-btn-container");

    function renderFallbackGoogleButton() {
        if (!googleBtnContainer) return;
        googleBtnContainer.innerHTML = `<button type="button" class="btn btn-outline full-width" id="google-fallback-btn">
                <i class='bx bxl-google'></i> Sign in with Google
            </button>`;
        const btn = document.getElementById('google-fallback-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const email = prompt('Enter your Google email (for demo purposes):');
            if (!email) return;
            const role = email.toLowerCase().includes('manager') ? 'manager' : 'student';
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = 'password123';
            document.getElementById('login-role').value = role;
            document.getElementById('login-name').value = email.split('@')[0];
            document.getElementById('auth-submit-btn').click();
        });
    }

    if (window.google && google.accounts && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID") {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse
        });
        if (googleBtnContainer) {
            google.accounts.id.renderButton(
                googleBtnContainer,
                { theme: "outline", size: "large", width: document.getElementById('login-form').offsetWidth || 300 }
            );
        }
    } else {
        renderFallbackGoogleButton();
    }
});

// Login Logic
function initLogin() {
    let mode = 'login'; // 'login' or 'signup'
    
    const loginForm = document.getElementById('login-form');
    const toggleLink = document.getElementById('auth-toggle-link');
    const toggleText = document.getElementById('auth-toggle-text');
    const authTitle = document.getElementById('auth-title');
    const authBtn = document.getElementById('auth-submit-btn');
    const nameGroup = document.getElementById('name-group');
    const errorEl = document.getElementById('auth-error');
    
    // Toggle Mode
    if(toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';
            if (mode === 'login') {
                mode = 'signup';
                authTitle.innerText = 'Create your account';
                nameGroup.style.display = 'block';
                document.getElementById('login-name').required = true;
                authBtn.innerHTML = "Register Account <i class='bx bx-check'></i>";
                toggleText.innerText = "Already have an account?";
                toggleLink.innerText = "Log In";
            } else {
                mode = 'login';
                authTitle.innerText = 'Sign in to your account';
                nameGroup.style.display = 'none';
                document.getElementById('login-name').required = false;
                authBtn.innerHTML = "Login to Portal <i class='bx bx-right-arrow-alt'></i>";
                toggleText.innerText = "Don't have an account?";
                toggleLink.innerText = "Sign Up";
            }
        });
    }

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const role = document.getElementById('login-role').value;
            const name = document.getElementById('login-name').value;
            
            // Password Validation
            if (password.length < 6) {
                errorEl.innerText = "Password must be at least 6 characters long.";
                errorEl.style.display = 'block';
                return;
            }
            
            let result;
            if (mode === 'signup') {
                result = UsersDB.createUser({ email, password, role, name });
            } else {
                result = UsersDB.loginUser(email, password, role);
            }
            
            if (!result.success) {
                // Show Error from Backend
                errorEl.innerText = result.message;
                errorEl.style.display = 'block';
                return;
            }
            
            // Set App State
            state.currentUser = result.user;
            state.currentUser.history = state.currentUser.history || [];
            state.myHistory = state.currentUser.history;
            
            // Setup Profile UI
            const readableRole = role === 'manager' ? 'Library Manager' : (role === 'faculty' ? 'Faculty Member' : 'Student');
            const displayName = result.user.name || result.user.email.split('@')[0];
            document.getElementById('top-user-name').innerText = displayName;
            document.getElementById('top-user-role').innerText = readableRole;
            document.getElementById('top-user-avatar').src = `https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=6366f1&color=fff&rounded=true&bold=true`;
            
            // Apply Permissions layout
            applyRolePermissions();
            
            // Render specific components
            renderBooks();
            if(role === 'manager') {
                renderMembers();
                renderManagerTransactions();
            } else {
                renderMyBooks();
            }
            
            // Animate transition to app
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            
            // Check if student details are missing
            if (role === 'student') {
                if (!result.user.regNum || !result.user.degree || !result.user.branch || !result.user.batch) {
                    document.getElementById('student-details-modal').style.display = 'flex';
                }
            }
        });
    }
}

function initStudentDetailsForm() {
    const form = document.getElementById('student-details-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const details = {
                regNum: document.getElementById('student-reg-num').value.trim(),
                degree: document.getElementById('student-degree').value,
                branch: document.getElementById('student-branch').value,
                batch: document.getElementById('student-batch').value
            };
            
            // Check for duplicate regNum
            const allUsers = UsersDB.getUsers();
            const existingUser = allUsers.find(u => u.regNum === details.regNum && u.email !== state.currentUser.email);
            if (existingUser) {
                addNotification(`Registration number ${details.regNum} is already registered to another user.`, "error");
                return;
            }
            
            const result = UsersDB.updateUser(state.currentUser.email, details);
            if (result.success) {
                state.currentUser = result.user;
                document.getElementById('student-details-modal').style.display = 'none';
                addNotification(`Welcome! Student profile completed for ${details.regNum}`);
            }
        });
    }
}

function initNotifications() {
    const btn = document.getElementById('notification-btn');
    const dropdown = document.getElementById('notification-dropdown');
    
    if (btn && dropdown) {
        btn.addEventListener('click', () => {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Clear badge counter when opened
                const badge = document.getElementById('notification-badge');
                if (badge) {
                    badge.innerText = '0';
                    badge.style.display = 'none';
                }
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}

// Real Google Sign-In Handler
window.handleGoogleResponse = function(response) {
    // 1. Decode the JWT token to get user info
    // The credential is a standard JWT token string format: header.payload.signature
    const responsePayload = decodeJwtResponse(response.credential);

    const email = responsePayload.email;
    const name = responsePayload.name || email.split('@')[0];
    
    // Determine role based on email if it matches manager allowlist
    const allowedManagers = [
        'lohitha.24bcw7073@vitapstudent.ac.in',
        'dalesh.24bcs7138@vitapstudent.ac.in',
        'reshma.24bce8167@vitapstudent.ac.in'
    ];
    let role = "student";
    if (allowedManagers.includes(email.toLowerCase())) {
        role = "manager";
    }

    addNotification(`Google Authentication successful. Welcome, ${name}.`);
    
    // Auto-fill login form and trigger submit
    document.getElementById('login-name').value = name; // Just in case they need to sign up
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = "password123"; // Dummy password for social login users
    document.getElementById('login-role').value = role;
    
    // Simulate clicking the login button
    document.getElementById('auth-submit-btn').click();
};

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function initProfileDropdown() {
    const trigger = document.getElementById('profile-trigger');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (trigger && dropdown) {
        trigger.addEventListener('click', () => {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible && state.currentUser) {
                // Populate profile data
                const displayName = state.currentUser.name || state.currentUser.email.split('@')[0];
                document.getElementById('dropdown-avatar').src = `https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=6366f1&color=fff&rounded=true&bold=true`;
                document.getElementById('dropdown-name').innerText = displayName;
                let roleStr = "Student";
                if (state.currentUser.role === 'manager') roleStr = "Library Manager";
                if (state.currentUser.role === 'faculty') roleStr = "Faculty Member";
                document.getElementById('dropdown-role').innerText = roleStr;
                document.getElementById('dropdown-email').innerText = state.currentUser.email;
                
                const studentDetails = document.getElementById('dropdown-student-details');
                if (state.currentUser.role === 'student' && state.currentUser.regNum) {
                    document.getElementById('dropdown-reg').innerText = `Reg No: ${state.currentUser.regNum}`;
                    document.getElementById('dropdown-degree').innerText = state.currentUser.degree;
                    document.getElementById('dropdown-branch').innerText = state.currentUser.branch;
                    studentDetails.style.display = 'block';
                } else {
                    studentDetails.style.display = 'none';
                }
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const loginToggleBtn = document.getElementById('login-theme-toggle-btn');
    const storedTheme = localStorage.getItem('libraryTheme');
    const initialTheme = storedTheme === 'light' ? 'light' : 'dark';

    applyTheme(initialTheme);

    const handleToggle = () => {
        const current = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('libraryTheme', next);
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', handleToggle);
    }
    if (loginToggleBtn) {
        loginToggleBtn.addEventListener('click', handleToggle);
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    const toggleIcon = document.querySelector('#theme-toggle-btn i');
    const loginToggleIcon = document.querySelector('#login-theme-toggle-btn i');

    if (theme === 'light') {
        root.classList.add('light-mode');
        if (toggleIcon) toggleIcon.className = 'bx bx-sun';
        if (loginToggleIcon) loginToggleIcon.className = 'bx bx-sun';
    } else {
        root.classList.remove('light-mode');
        if (toggleIcon) toggleIcon.className = 'bx bx-moon';
        if (loginToggleIcon) loginToggleIcon.className = 'bx bx-moon';
    }
}

function initAddBookForm() {
    const form = document.getElementById('add-book-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const editId = document.getElementById('edit-book-id').value;
            const title = document.getElementById('add-title').value;
            const author = document.getElementById('add-author').value;
            const category = document.getElementById('add-category').value;
            const total = parseInt(document.getElementById('add-total').value);
            const stock = parseInt(document.getElementById('add-stock').value);
            
            if (stock > total) {
                addNotification('Current stock cannot exceed total copies.', 'error');
                return;
            }
            
            if (editId) {
                // Edit existing book
                const bookIndex = state.books.findIndex(b => b.id === editId);
                if (bookIndex !== -1) {
                    state.books[bookIndex].title = title;
                    state.books[bookIndex].author = author;
                    state.books[bookIndex].category = category;
                    state.books[bookIndex].total = total;
                    state.books[bookIndex].stock = stock;
                    state.books[bookIndex].status = stock > 0 ? 'Available' : 'Out of Stock';
                    persistState();
                    addNotification(`Book "${title}" updated successfully.`);
                }
            } else {
                // Add new book
                const newBook = {
                    id: 'B-' + Math.floor(1000 + Math.random() * 9000),
                    title: title,
                    author: author,
                    category: category,
                    stock: stock,
                    total: total,
                    status: stock > 0 ? 'Available' : 'Out of Stock'
                };
                
                state.books.unshift(newBook);
                persistState();
                addNotification(`Success! New title "${title}" added to catalog.`);
            }
            
            // Close modal
            document.getElementById('add-book-modal').style.display = 'none';
            form.reset();
            document.getElementById('edit-book-id').value = '';
            document.getElementById('modal-title').textContent = 'Add New Title';
            document.getElementById('modal-button').innerHTML = 'Add Book to Catalog <i class=\'bx bx-check\'></i>';
            
            renderBooks();
            updateDashboardStats();
        });
    }
}

window.addNotification = function(message) {
    state.notifications.unshift({
        id: Date.now(),
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    // Update Badge
    const badge = document.getElementById('notification-badge');
    if (badge) {
        let currentCount = parseInt(badge.innerText || '0');
        badge.innerText = currentCount + 1;
        badge.style.display = 'flex';
    }
    
    renderNotifications();
};

function renderNotifications() {
    const list = document.getElementById('notification-list');
    const msg = document.getElementById('no-notifications-msg');
    
    if (!list) return;
    
    if (state.notifications.length === 0) {
        if (msg) msg.style.display = 'block';
        return;
    }
    
    if (msg) msg.style.display = 'none';
    
    // Clear list but keep the no-notifications message
    list.innerHTML = '';
    if (msg) list.appendChild(msg);
    
    state.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.style.padding = '10px 0';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        item.innerHTML = `
            <p class="text-sm" style="margin-bottom: 4px;">${notif.message}</p>
            <span class="text-xs text-muted"><i class='bx bx-time-five'></i> ${notif.time}</span>
        `;
        list.insertBefore(item, msg);
    });
}

// Navigation Logic
function updateDashboardStats() {
    const isManager = state.currentUser && state.currentUser.role === 'manager';
    
    const managerStats = document.getElementById('manager-stats');
    const memberStats = document.getElementById('member-stats');
    
    if(managerStats && isManager) {
        // Update Dynamic Stats
        const totalBooks = state.books.reduce((sum, b) => sum + b.total, 0);
        const activeMembersCount = UsersDB.getUsers().filter(u => u.role !== 'manager').length;
        const issuedCount = getAllHistories().filter(h => h.status !== 'Returned' && h.status !== 'Reserved').length;
        
        // Calculate total overdue fines
        let totalFines = 0;
        getAllHistories().forEach(item => {
            if (item.status !== 'Returned' && item.status !== 'Reserved') {
                const today = new Date();
                const due = new Date(item.dueDate);
                if (today > due) {
                    const diffTime = Math.abs(today - due);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    totalFines += diffDays * 1.00;
                }
            }
        });
        
        const cards = managerStats.querySelectorAll('.counter');
        if (cards.length >= 3) {
            cards[0].innerText = totalBooks;
            cards[1].innerText = activeMembersCount;
            cards[2].innerText = issuedCount;
        }
        
        const finesElement = document.getElementById('overdue-fines');
        if (finesElement) {
            finesElement.innerText = `$${totalFines.toFixed(2)}`;
        }
    }
    
    if(memberStats && !isManager && state.currentUser) {
        // Update member stats
        const userHistory = getUserHistory(state.currentUser.email);
        const borrowedCount = userHistory.filter(h => h.status === 'Active Loan').length;
        let userFines = 0;
        userHistory.forEach(item => {
            if (item.status === 'Active Loan') {
                const today = new Date();
                const due = new Date(item.dueDate);
                if (today > due) {
                    const diffTime = Math.abs(today - due);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    userFines += diffDays * 1.00;
                }
            }
        });
        
        const borrowedElement = document.getElementById('borrowed-count');
        if (borrowedElement) {
            borrowedElement.innerText = `${borrowedCount} Book${borrowedCount !== 1 ? 's' : ''}`;
        }
        
        const finesElement = document.getElementById('pending-fines');
        if (finesElement) {
            finesElement.innerText = `$${userFines.toFixed(2)}`;
        }
    }
}

function applyRolePermissions() {
    const isManager = state.currentUser.role === 'manager';
    
    // Toggle Sidebar Items
    document.querySelectorAll('.role-manager').forEach(el => {
        el.style.display = isManager ? 'flex' : 'none';
    });
    document.querySelectorAll('.role-member').forEach(el => {
        el.style.display = !isManager ? 'flex' : 'none';
    });
    
    // Toggle Dashboard Views
    const managerStats = document.getElementById('manager-stats');
    const memberStats = document.getElementById('member-stats');
    
    if(managerStats && isManager) {
        managerStats.style.display = 'block';
    } else if (managerStats) {
        managerStats.style.display = 'none';
    }
    
    if(memberStats) memberStats.style.display = !isManager ? 'block' : 'none';
    
    // Update stats
    updateDashboardStats();
    
    // Reset Navigation to dashboard
    const dashLink = document.querySelector('.nav-item[data-target="dashboard"]');
    if(dashLink) dashLink.click();
    
    // Render reservations if manager
    if (isManager) {
        renderReservations();
    }
}

// Navigation Logic
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items and hide sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => {
                sec.classList.remove('active');
                sec.classList.remove('fade-in');
            });

            // Activate clicked nav item
            item.classList.add('active');
            
            // Show target section
            const targetId = item.getAttribute('data-target');
            const targetSec = document.getElementById(targetId);
            if(targetSec) {
                targetSec.classList.add('active');
                // Trigger reflow for animation
                void targetSec.offsetWidth;
                targetSec.classList.add('fade-in');
            }
        });
    });
}

// Auto-populate Issue return date (+14 days)
function initDateInput() {
    const dateInput = document.getElementById('due-date-input');
    if(dateInput) {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 2 weeks default borrow period
        dateInput.value = date.toISOString().split('T')[0];
    }
}

// Render Books Table
function renderBooks() {
    const tbody = document.getElementById('books-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    const isManager = state.currentUser && state.currentUser.role === 'manager';
    
    state.books.forEach(book => {
        const badgeClass = book.status === 'Available' ? 'bg-green' : 'bg-red';
        
        let actionButtons = '';
        if(isManager) {
            actionButtons = `
                <button class="btn-icon" title="Edit" onclick="editBook('${book.id}')"><i class='bx bx-edit'></i></button>
                <button class="btn-icon text-red" title="Delete" onclick="deleteBook('${book.id}')"><i class='bx bx-trash'></i></button>
            `;
        } else {
            const isAvailable = book.stock > 0;
            actionButtons = `
                <button class="btn btn-outline text-sm" ${!isAvailable ? 'disabled' : ''} onclick="reserveBook('${book.id}', '${book.title}')">
                    <i class='bx bx-bookmark-plus'></i> Reserve
                </button>
            `;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${book.id}</span></td>
            <td><strong>${book.title}</strong><br><span class="text-xs text-muted">${book.author}</span></td>
            <td>${book.category}</td>
            <td>${book.stock} / ${book.total}</td>
            <td><span class="status-badge ${badgeClass}">${book.status}</span></td>
            <td>${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Manager Function: Open Add Book Modal
function openAddBookModal() {
    document.getElementById('add-book-form').reset();
    document.getElementById('edit-book-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Title';
    document.getElementById('modal-button').innerHTML = 'Add Book to Catalog <i class=\'bx bx-check\'></i>';
    document.getElementById('add-book-modal').style.display = 'flex';
}
function editBook(bookId) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;
    
    document.getElementById('edit-book-id').value = book.id;
    document.getElementById('add-title').value = book.title;
    document.getElementById('add-author').value = book.author;
    document.getElementById('add-category').value = book.category;
    document.getElementById('add-total').value = book.total;
    document.getElementById('add-stock').value = book.stock;
    
    document.getElementById('modal-title').textContent = 'Edit Book Details';
    document.getElementById('modal-button').innerHTML = 'Update Book <i class=\'bx bx-check\'></i>';
    
    document.getElementById('add-book-modal').style.display = 'flex';
}

// Manager Function: Delete Book
function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
    
    const bookIndex = state.books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
        const book = state.books[bookIndex];
        state.books.splice(bookIndex, 1);
        persistState();
        addNotification(`Book "${book.title}" deleted from catalog.`);
        renderBooks();
        updateDashboardStats();
    }
}
window.reserveBook = function(id, title) {
    if (!state.currentUser) {
        alert('Please log in to reserve books.');
        return;
    }

    const bookIndex = state.books.findIndex(b => b.id === id);
    const userHistory = getUserHistory(state.currentUser.email);

    // Check if user already has this book reserved or active
    const hasAlreadyReserved = userHistory.some(item => item.id === id && (item.status === 'Reserved' || item.status === 'Active Loan'));
    if (hasAlreadyReserved) {
        alert(`You already have a reservation or active loan for "${title}". You cannot reserve multiple copies of the same book.`);
        return;
    }

    if (bookIndex !== -1 && state.books[bookIndex].stock > 0) {
        // Decrease Stock
        state.books[bookIndex].stock -= 1;
        if (state.books[bookIndex].stock === 0) {
            state.books[bookIndex].status = 'Out of Stock';
        }

        // Add to User History and persist
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2); // 48 hours to collect
        const reservationId = 'RES-' + Date.now();

        const newHistory = [
            {
                _id: reservationId,
                id: id,
                title: title,
                author: state.books[bookIndex].author,
                borrowDate: borrowDate.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                status: 'Reserved'
            },
            ...userHistory
        ];

        setUserHistory(state.currentUser.email, newHistory);
        persistState();

        // Trigger Notification
        addNotification(`Successfully reserved "${title}". Please collect within 48 hours.`);

        // Update UI
        renderBooks();
        renderMyBooks();

        alert(`Success! You have reserved "${title}". Please collect it from the checkout desk within 48 hours using your Campus ID.`);
    } else {
        alert("Sorry, this book is currently out of stock.");
    }
}

// Member Function: Unreserve Book
window.unreserveBook = function(reservationId, bookId, title) {
    if (!state.currentUser) {
        alert('Please log in to cancel reservations.');
        return;
    }

    // Confirm unreservation
    if (!confirm(`Are you sure you want to cancel your reservation for "${title}"?`)) {
        return;
    }

    const userHistory = getUserHistory(state.currentUser.email);
    const historyIndex = userHistory.findIndex(item => item._id === reservationId);
    if (historyIndex !== -1) {
        userHistory.splice(historyIndex, 1);
        setUserHistory(state.currentUser.email, userHistory);

        // Find in catalog and increment stock
        const bookIndex = state.books.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            state.books[bookIndex].stock += 1;
            // If it was out of stock, it's now available
            if (state.books[bookIndex].stock === 1) {
                state.books[bookIndex].status = 'Available';
            }
        }

        persistState();

        // Trigger Notification
        addNotification(`Reservation cancelled for "${title}".`);

        // Update UI
        renderBooks();
        renderMyBooks();
    }
}

// Render Specific Member's History (Student/Faculty)
function renderMyBooks() {
    const tbody = document.getElementById('my-books-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    state.myHistory.forEach(item => {
        const isReturned = item.status === 'Returned';
        const isReserved = item.status === 'Reserved';
        const badgeClass = isReturned ? 'bg-gray' : (isReserved ? 'bg-warning' : 'bg-blue');
        const actualBadgeClass = badgeClass;
        
        let actionButtons = '';
        if (isReserved) {
            actionButtons = `
                <button class="btn btn-outline text-sm text-red" onclick="unreserveBook('${item._id}', '${item.id}', '${item.title.replace(/'/g, "\\'")}')">
                    <i class='bx bx-x'></i> Cancel
                </button>
            `;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${item.id}</span></td>
            <td><strong>${item.title}</strong><br><span class="text-xs text-muted">${item.author}</span></td>
            <td>${item.borrowDate}</td>
            <td>${item.dueDate}</td>
            <td><span class="status-badge ${actualBadgeClass}">${item.status}</span></td>
            <td>${actionButtons}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteUserAction = function(email) {
    if (state.currentUser && state.currentUser.email === email) {
        alert("Action restricted: You cannot delete your own account.");
        return;
    }
    const targetUser = UsersDB.getUsers().find(u => u.email === email);
    if (targetUser && targetUser.role === 'manager') {
        alert("Action restricted: You cannot delete other managers.");
        return;
    }
    if (confirm(`Are you sure you want to permanently delete the user account for ${email}?`)) {
        const result = UsersDB.deleteUser(email);
        if (result.success) {
            addNotification(`User ${email} has been deleted successfully.`);
            renderMembers(); // Re-render table
            applyRolePermissions(); // Re-calculate stats
        } else {
            addNotification(`Failed to delete user: ${result.message}`, "error");
        }
    }
};

// Render All Members Table (Manager)
function renderMembers() {
    const tbody = document.getElementById('members-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    const allUsers = UsersDB.getUsers();
    
    allUsers.forEach(user => {
        // Find how many active loans/reservations this user has (per-user history)
        const userHistory = user.history || [];
        const borrowedCount = userHistory.filter(h => h.status !== 'Returned').length;
        
        const badgeClass = 'bg-blue';
        const roleIcon = user.role === 'student' ? 'bx-user' : (user.role === 'faculty' ? 'bx-user-pin' : 'bx-id-card');
        const readableRole = user.role === 'manager' ? 'Library Manager' : (user.role === 'faculty' ? 'Faculty' : 'Student');
        const displayName = user.name || user.email.split('@')[0];
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">${user.regNum || '-'}</span></td>
            <td>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=random&color=fff&rounded=true" alt="${displayName}" style="width:32px; height:32px; border-radius:50%; object-fit: cover;">
                    <div>
                        <strong>${displayName}</strong><br>
                        <span class="text-xs text-muted">${user.email}</span>
                    </div>
                </div>
            </td>
            <td><i class='bx ${roleIcon} text-muted'></i> ${readableRole}</td>
            <td>${borrowedCount} items</td>
            <td><span class="status-badge ${badgeClass}">Active</span></td>
            <td>
                <button class="btn-icon" title="View History" onclick="alert('Viewing history for ${displayName}')"><i class='bx bx-history'></i></button>
                <button class="btn-icon text-red" title="Delete User" onclick="deleteUserAction('${user.email}')"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderManagerTransactions() {
    const tbody = document.getElementById('manager-transactions-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    const allHistory = getAllHistories();
    allHistory.forEach(item => {
        // Calculate fines
        let fine = 0;
        let statusBadge = '';
        
        if (item.status === 'Returned') {
            statusBadge = `<span class="status-badge bg-green">Returned</span>`;
        } else if (item.status === 'Reserved') {
            statusBadge = `<span class="status-badge bg-warning">Reserved</span>`;
        } else {
            // Active Loan - check if overdue
            const today = new Date();
            const due = new Date(item.dueDate);
            
            if (today > due && item.status !== 'Returned') {
                const diffTime = Math.abs(today - due);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                fine = diffDays * 1.00; // $1 per day
                statusBadge = `<span class="status-badge bg-red">Overdue ($${fine.toFixed(2)})</span>`;
            } else {
                statusBadge = `<span class="status-badge bg-blue">Issued</span>`;
            }
        }
        
        const borrowerName = item.borrowerName || item.borrowedBy || 'Student User';
        const borrowerReg = item.borrowerReg || '';
        const borrowerDisplay = borrowerReg ? `${borrowerName} (${borrowerReg})` : borrowerName;
        
        let actionBtn = '-';
        if (item.status === 'Reserved') {
            actionBtn = `<button class="btn btn-outline text-xs text-blue" onclick="approveReservation('${item._id}', '${item.borrowerEmail || ''}')">Approve Issue</button>`;
        } else if (item.status !== 'Returned') {
            actionBtn = `<button class="btn btn-outline text-xs text-green" onclick="returnOverdue('${item._id}', '${item.id}', '${item.borrowerEmail || ''}')">Process Return</button>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${item.id}</span></td>
            <td><strong>${item.title}</strong><br><span class="text-xs text-muted">${item.author}</span></td>
            <td>${borrowerDisplay}</td>
            <td>${item.dueDate}</td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderReservations() {
    const tbody = document.getElementById('reservations-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    const allHistory = getAllHistories();
    const reservations = allHistory.filter(item => item.status === 'Reserved');
    
    if (reservations.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No pending reservations</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    reservations.forEach(item => {
        const book = state.books.find(b => b.id === item.id);
        const bookTitle = book ? book.title : item.title || 'Unknown Book';
        const bookAuthor = book ? book.author : item.author || '';
        
        const requesterName = item.borrowerName || item.borrowedBy || 'Unknown';
        const requesterReg = item.borrowerReg || '';
        const requesterDisplay = requesterReg ? `${requesterName} (${requesterReg})` : requesterName;
        
        const requestedDate = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${item.id}</span></td>
            <td><strong>${bookTitle}</strong><br><span class="text-xs text-muted">${bookAuthor}</span></td>
            <td>${requesterDisplay}</td>
            <td>${requestedDate}</td>
            <td>
                <button class="btn btn-outline text-xs text-blue" onclick="approveReservation('${item._id}')">
                    <i class='bx bx-check'></i> Approve & Issue
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.returnOverdue = function(historyId, bookId, borrowerEmail) {
    if (!confirm("Process this return? For overdue items, this automatically clears the student's fine balance.")) {
        return;
    }

    const owner = findHistoryOwner(historyId);
    if (!owner) {
        addNotification(`Could not locate the loan record for ID ${historyId}.`, "error");
        return;
    }

    owner.item.status = 'Returned';
    setUserHistory(owner.user.email, owner.user.history);

    const bookIndex = state.books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
        state.books[bookIndex].stock += 1;
        if (state.books[bookIndex].stock === 1) {
            state.books[bookIndex].status = 'Available';
        }
    }

    persistState();

    addNotification(`Book #${bookId} returned successfully. Student dues cleared.`);
    renderManagerTransactions();
    renderBooks();
    updateDashboardStats();
}

window.approveReservation = function(historyId) {
    if (!confirm("Approve this reservation? This will officially issue the book and begin the borrowing period.")) {
        return;
    }

    const owner = findHistoryOwner(historyId);
    if (!owner) {
        addNotification(`Could not locate the reservation record for ID ${historyId}.`, "error");
        return;
    }

    owner.item.status = 'Active Loan';
    const due = new Date();
    due.setDate(due.getDate() + 14); // 2 weeks default borrow period instead of 48h collect
    owner.item.dueDate = due.toISOString().split('T')[0];

    setUserHistory(owner.user.email, owner.user.history);
    persistState();

    addNotification(`Reservation approved! Book #${owner.item.id} officially issued.`);
    renderManagerTransactions();
    renderReservations();
    updateDashboardStats();
}

// Manager Actions: Manual Issue & Return
function initManagerForms() {
    const issueForm = document.getElementById('issue-form');
    if (issueForm) {
        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const memberId = issueForm.querySelector('input[type="text"]').value.trim();
            const bookId = issueForm.querySelectorAll('input[type="text"]')[1].value.trim();
            const dueDate = document.getElementById('due-date-input').value;

            if (!memberId || !bookId || !dueDate) return;

            // 1. Find Book
            const bookItem = state.books.find(b => b.id === bookId || b.id === 'B-'+bookId || b.title.toLowerCase().includes(bookId.toLowerCase()));
            if (!bookItem) {
                addNotification("Book not found in Catalog.", "error"); return;
            }
            if (bookItem.stock < 1) {
                addNotification("Book is currently out of stock.", "error"); return;
            }
            
            // 2. Find User - must be an existing registered user
            const users = UsersDB.getUsers();
            let targetUser = users.find(u => u.memberId === memberId || u.regNum === memberId || u.email === memberId || u.name.toLowerCase().includes(memberId.toLowerCase()));
            
            if (!targetUser) {
                addNotification(`User with ID "${memberId}" doesn't have an account. Ask them to create one first.`, "error");
                return;
            }

            // 3. Create active loan
            const historyItem = {
                _id: 'H-' + Math.floor(Math.random() * 10000),
                id: bookItem.id,
                title: bookItem.title,
                author: bookItem.author,
                borrowDate: new Date().toISOString().split('T')[0],
                dueDate: dueDate,
                status: 'Active Loan',
                borrowedBy: targetUser.name,
                borrowerReg: targetUser.regNum || memberId // Store explicitly for UI
            };

            const userHistory = getUserHistory(targetUser.email);
            userHistory.unshift(historyItem);
            setUserHistory(targetUser.email, userHistory);

            bookItem.stock -= 1;
            if (bookItem.stock === 0) bookItem.status = 'Borrowed';

            persistState();
            addNotification(`${bookItem.title} successfully issued to ${targetUser.name || memberId}.`);
            issueForm.reset();
            renderBooks();
            renderManagerTransactions();
            updateDashboardStats();
        });
    }

    const returnForm = document.getElementById('return-form');
    if (returnForm) {
        returnForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const scanId = document.getElementById('return-book-id').value.trim();
            const memberId = document.getElementById('return-member-id').value.trim();
            
            if (!scanId || !memberId) return;

            // Find active loan in history by book ID / Title and member identifier
            let owner = null;
            for (const user of UsersDB.getUsers()) {
                const history = user.history || [];
                const match = history.find(h =>
                    h.status === 'Active Loan' &&
                    (h.id === scanId || h.id === 'B-' + scanId || h.title.toLowerCase().includes(scanId.toLowerCase()))
                );
                if (match) {
                    owner = { user, item: match };
                    break;
                }
            }

            if (owner && owner.item) {
                // Ensure the member identifier matches
                const matchesMember = (owner.user.regNum === memberId)
                    || (owner.user.email && owner.user.email.toLowerCase().includes(memberId.toLowerCase()))
                    || (owner.user.name && owner.user.name.toLowerCase().includes(memberId.toLowerCase()))
                    || (owner.item.borrowedBy && owner.item.borrowedBy.toLowerCase().includes(memberId.toLowerCase()));

                if (!matchesMember) {
                    addNotification(`No active loan found for Book "${scanId}" under Member "${memberId}".`, "error");
                    return;
                }

                owner.item.status = 'Returned';
                setUserHistory(owner.user.email, owner.user.history);

                const bookIndex = state.books.findIndex(b => b.id === owner.item.id);
                if (bookIndex !== -1) {
                    state.books[bookIndex].stock += 1;
                    state.books[bookIndex].status = 'Available';
                }

                const today = new Date();
                const due = new Date(owner.item.dueDate);
                let msg = `Book #${owner.item.id} explicitly returned by ${memberId || owner.user.name}.`;
                if (today > due) {
                    msg += " Late fine successfully cleared.";
                }

                persistState();
                addNotification(msg);
                renderManagerTransactions();
                renderBooks();
                returnForm.reset();
                return;
            }

            addNotification(`No active loan found for Book "${scanId}" under Member "${memberId}".`, "error");
        });
    }
}
