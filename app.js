// App State & Mock Data
const state = {
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
            // Seed DB with some default users if empty
            localStorage.setItem('nexus_users', JSON.stringify([
                { email: 'student@nexus.edu', name: 'Demo Student', password: 'password123', role: 'student' },
                { email: 'manager@nexus.edu', name: 'Demo Manager', password: 'password123', role: 'manager' }
            ]));
        }
    },
    getUsers: function() {
        return JSON.parse(localStorage.getItem('nexus_users')) || [];
    },
    createUser: function(userObj) {
        const users = this.getUsers();
        if (users.find(u => u.email === userObj.email)) {
            return { success: false, message: 'Email address is already registered.' };
        }
        users.push(userObj);
        localStorage.setItem('nexus_users', JSON.stringify(users));
        
        // Also add them to the mock members list (to display in manager view)
        state.members.push({ id: 'M-' + Math.floor(1000 + Math.random() * 9000), name: userObj.name, type: userObj.role.charAt(0).toUpperCase() + userObj.role.slice(1), borrowed: 0, status: 'Active' });
        
        return { success: true, user: userObj };
    },
    loginUser: function(email, password, role) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.role === role);
        if (!user) {
            return { success: false, message: 'No account found for this email and role combination.' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
        }
        return { success: true, user: user };
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    UsersDB.init(); // Initialize LocalStorage Backend
    initLogin();
    initNavigation();
    initDateInput();
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
            } else {
                renderMyBooks();
            }
            
            // Animate transition to app
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
        });
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
    
    if(managerStats) managerStats.style.display = isManager ? 'block' : 'none';
    if(memberStats) memberStats.style.display = !isManager ? 'block' : 'none';
    
    // Reset Navigation to dashboard
    const dashLink = document.querySelector('.nav-item[data-target="dashboard"]');
    if(dashLink) dashLink.click();
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
                <button class="btn-icon" title="Edit"><i class='bx bx-edit'></i></button>
                <button class="btn-icon text-red" title="Delete"><i class='bx bx-trash'></i></button>
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

// Member Function: Reserve Book
window.reserveBook = function(id, title) {
    alert(`Success! You have reserved "${title}". Please collect it from the checkout desk within 48 hours using your Campus ID.`);
}

// Render Specific Member's History (Student/Faculty)
function renderMyBooks() {
    const tbody = document.getElementById('my-books-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    state.myHistory.forEach(item => {
        const isReturned = item.status === 'Returned';
        const badgeClass = isReturned ? 'bg-gray' : 'bg-blue';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${item.id}</span></td>
            <td><strong>${item.title}</strong><br><span class="text-xs text-muted">${item.author}</span></td>
            <td>${item.borrowDate}</td>
            <td>${item.dueDate}</td>
            <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Render All Members Table (Manager)
function renderMembers() {
    const tbody = document.getElementById('members-tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    state.members.forEach(member => {
        const badgeClass = member.status === 'Active' ? 'bg-blue' : 'bg-gray';
        const roleIcon = member.type === 'Student' ? 'bx-user' : (member.type === 'Faculty' ? 'bx-user-pin' : 'bx-id-card');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="text-muted">#${member.id}</span></td>
            <td>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random&color=fff&rounded=true" alt="${member.name}" style="width:32px; height:32px; border-radius:50%; object-fit: cover;">
                    <strong>${member.name}</strong>
                </div>
            </td>
            <td><i class='bx ${roleIcon} text-muted'></i> ${member.type}</td>
            <td>${member.borrowed} books</td>
            <td><span class="status-badge ${badgeClass}">${member.status}</span></td>
            <td>
                <button class="btn-icon" title="View History"><i class='bx bx-history'></i></button>
                <button class="btn-icon" title="Edit Profile"><i class='bx bx-edit'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
