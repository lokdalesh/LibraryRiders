// App State & Mock Data
const state = {
    currentUser: null, // { name, role }
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
        { id: 'M-5283', name: 'Diana Ross', type: 'Staff', borrowed: 0, status: 'Active' },
    ],
    myHistory: [
        { id: 'B-1004', title: 'Atomic Habits', author: 'James Clear', borrowDate: '2023-11-01', dueDate: '2023-11-15', status: 'Active Loan' },
        { id: 'B-1001', title: 'The Pragmatic Programmer', author: 'Andy Hunt', borrowDate: '2023-09-15', dueDate: '2023-09-29', status: 'Returned' }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    initNavigation();
    initDateInput();
});

// Login Logic
function initLogin() {
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const role = document.getElementById('login-role').value;
            
            // Set App State
            state.currentUser = { name: username, role: role };
            
            // Setup Profile UI
            const readableRole = role === 'manager' ? 'Library Manager' : (role === 'faculty' ? 'Faculty Member' : 'Student');
            document.getElementById('top-user-name').innerText = username;
            document.getElementById('top-user-role').innerText = readableRole;
            document.getElementById('top-user-avatar').src = `https://ui-avatars.com/api/?name=${username.replace(' ', '+')}&background=6366f1&color=fff&rounded=true&bold=true`;
            
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
