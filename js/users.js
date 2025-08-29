// إدارة المستخدمين والصلاحيات - مستشفى الوحدة درنة

class UserManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.smsService = new SMSService();
        this.init();
    }

    init() {
        this.loadUsersTable();
        this.bindEvents();
        this.updateStatistics();
        this.setupFilters();
    }

    // تحميل المستخدمين من التخزين المحلي
    loadUsers() {
        const defaultUsers = [
            {
                id: 1,
                username: 'amod',
                name: 'أحمد محمود الطاهر',
                email: 'amod@hospital.ly',
                phone: '0919876543',
                role: 'admin',
                department: 'الإدارة',
                permissions: ['view', 'edit', 'delete', 'print', 'manage_users'],
                status: 'active',
                lastLogin: '2024-01-15 09:30',
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system'
            },
            {
                id: 2,
                username: 'dr.salem',
                name: 'د. محمد سالم',
                email: 'dr.salem@hospital.ly',
                phone: '0918765432',
                role: 'doctor',
                department: 'الأمراض الباطنية',
                permissions: ['view', 'edit', 'print'],
                status: 'active',
                lastLogin: '2024-01-15 08:45',
                createdAt: '2024-01-02T00:00:00Z',
                createdBy: 'amod'
            },
            {
                id: 3,
                username: 'sarah.ahmed',
                name: 'سارة أحمد',
                email: 'sarah.ahmed@hospital.ly',
                phone: '0917654321',
                role: 'nurse',
                department: 'الطوارئ',
                permissions: ['view'],
                status: 'active',
                lastLogin: '2024-01-14 22:15',
                createdAt: '2024-01-03T00:00:00Z',
                createdBy: 'amod'
            },
            {
                id: 4,
                username: 'layla.hassan',
                name: 'ليلى حسن',
                email: 'layla.hassan@hospital.ly',
                phone: '0916543210',
                role: 'receptionist',
                department: 'الاستقبال',
                permissions: ['view'],
                status: 'suspended',
                lastLogin: '2024-01-12 16:30',
                createdAt: '2024-01-04T00:00:00Z',
                createdBy: 'amod'
            }
        ];

        const savedUsers = localStorage.getItem('hospitalUsers');
        return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
    }

    // حفظ المستخدمين
    saveUsers() {
        localStorage.setItem('hospitalUsers', JSON.stringify(this.users));
    }

    // تحميل جدول المستخدمين
    loadUsersTable() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = this.users.map((user, index) => {
            return this.createUserRow(user, index + 1);
        }).join('');

        // إضافة تأثيرات متحركة
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.animationDelay = `${index * 50}ms`;
            row.classList.add('fade-in');
        });
    }

    // إنشاء صف مستخدم
    createUserRow(user, index) {
        const roleClass = this.getRoleClass(user.role);
        const statusClass = this.getStatusClass(user.status);
        const avatarClass = this.getAvatarClass(user.role);
        
        return `
            <tr data-user-id="${user.id}">
                <td>${index}</td>
                <td>
                    <div class="user-avatar ${avatarClass}">
                        <i class="fas ${this.getRoleIcon(user.role)}"></i>
                    </div>
                </td>
                <td>
                    <strong>${user.name}</strong>
                    <br><small class="text-muted">${user.username}</small>
                </td>
                <td>${user.email}</td>
                <td><span class="badge ${roleClass}">${this.getRoleName(user.role)}</span></td>
                <td>${user.department}</td>
                <td><span class="badge ${statusClass}">${this.getStatusName(user.status)}</span></td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td>
                    <div class="permissions">
                        ${user.permissions.map(perm => 
                            `<span class="badge bg-${this.getPermissionColor(perm)} me-1">${this.getPermissionName(perm)}</span>`
                        ).join('')}
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${this.createActionButtons(user)}
                    </div>
                </td>
            </tr>
        `;
    }

    // إنشاء أزرار الإجراءات
    createActionButtons(user) {
        let buttons = '';
        
        // زر التفعيل/إلغاء التفعيل
        if (user.status === 'suspended') {
            buttons += `
                <button class="btn btn-outline-success" onclick="userManager.activateUser(${user.id})" title="تفعيل">
                    <i class="fas fa-check"></i>
                </button>
            `;
        }
        
        // زر التعديل
        buttons += `
            <button class="btn btn-outline-primary" onclick="userManager.editUser(${user.id})" title="تعديل">
                <i class="fas fa-edit"></i>
            </button>
        `;
        
        // زر الرسائل النصية
        buttons += `
            <button class="btn btn-outline-info" onclick="userManager.sendSMS(${user.id})" title="رسالة نصية">
                <i class="fas fa-sms"></i>
            </button>
        `;
        
        // زر إعادة تعيين كلمة المرور
        buttons += `
            <button class="btn btn-outline-warning" onclick="userManager.resetPassword(${user.id})" title="إعادة تعيين كلمة المرور">
                <i class="fas fa-key"></i>
            </button>
        `;
        
        // زر الحذف (للمديرين فقط)
        if (hasPermission('delete') && user.id !== getCurrentUser()?.id) {
            buttons += `
                <button class="btn btn-outline-danger" onclick="userManager.deleteUser(${user.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
        
        return buttons;
    }

    // ربط الأحداث
    bindEvents() {
        // نموذج إضافة مستخدم
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', this.handleAddUser.bind(this));
        }

        // البحث والفلترة
        const searchInput = document.getElementById('searchUsers');
        const roleFilter = document.getElementById('filterByRole');
        const statusFilter = document.getElementById('filterByStatus');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        
        if (roleFilter) {
            roleFilter.addEventListener('change', this.handleRoleFilter.bind(this));
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', this.handleStatusFilter.bind(this));
        }
    }

    // معالجة إضافة مستخدم جديد
    async handleAddUser(e) {
        e.preventDefault();
        
        const formData = this.getAddUserFormData();
        
        if (!this.validateUserData(formData)) {
            return;
        }

        this.showLoading(true);
        
        try {
            const result = await this.createUser(formData);
            
            if (result.success) {
                this.users.push(result.user);
                this.saveUsers();
                this.loadUsersTable();
                this.updateStatistics();
                
                // إغلاق المودال
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();
                
                // إعادة تعيين النموذج
                document.getElementById('addUserForm').reset();
                
                this.showSuccess('تم إضافة المستخدم بنجاح');
                
                // إرسال كلمة المرور عبر SMS إذا تم تحديد الخيار
                const sendSMSOption = document.getElementById('sendPasswordSMS');
                if (sendSMSOption && sendSMSOption.checked) {
                    await this.sendPasswordSMS(result.user);
                }
                
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('خطأ في إضافة المستخدم:', error);
            this.showError('حدث خطأ أثناء إضافة المستخدم');
        } finally {
            this.showLoading(false);
        }
    }

    // جمع بيانات نموذج إضافة المستخدم
    getAddUserFormData() {
        const permissions = [];
        document.querySelectorAll('input[type="checkbox"][value]:checked').forEach(cb => {
            permissions.push(cb.value);
        });

        return {
            name: document.getElementById('newUserName').value.trim(),
            username: document.getElementById('newUsername').value.trim(),
            email: document.getElementById('newUserEmail').value.trim(),
            phone: document.getElementById('newUserPhone').value.trim(),
            role: document.getElementById('newUserRole').value,
            department: document.getElementById('newUserDepartment').value,
            permissions: permissions,
            status: 'active'
        };
    }

    // التحقق من صحة بيانات المستخدم
    validateUserData(data) {
        // التحقق من الحقول المطلوبة
        const requiredFields = ['name', 'username', 'email', 'phone', 'role', 'department'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                this.showError(`يرجى إدخال ${this.getFieldLabel(field)}`);
                return false;
            }
        }

        // التحقق من تفرد اسم المستخدم
        if (this.users.some(user => user.username === data.username)) {
            this.showError('اسم المستخدم موجود مسبقاً');
            return false;
        }

        // التحقق من تفرد البريد الإلكتروني
        if (this.users.some(user => user.email === data.email)) {
            this.showError('البريد الإلكتروني موجود مسبقاً');
            return false;
        }

        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('البريد الإلكتروني غير صحيح');
            return false;
        }

        // التحقق من رقم الهاتف
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(data.phone.replace(/-/g, ''))) {
            this.showError('رقم الهاتف غير صحيح');
            return false;
        }

        return true;
    }

    // إنشاء مستخدم جديد
    async createUser(data) {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUser = {
            id: this.generateUserId(),
            username: data.username,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            department: data.department,
            permissions: data.permissions,
            status: data.status,
            password: this.generateRandomPassword(),
            lastLogin: null,
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser()?.username || 'system'
        };

        return {
            success: true,
            user: newUser,
            message: 'تم إنشاء المستخدم بنجاح'
        };
    }

    // إنتاج معرف مستخدم فريد
    generateUserId() {
        const maxId = Math.max(...this.users.map(u => u.id), 0);
        return maxId + 1;
    }

    // إنتاج كلمة مرور عشوائية
    generateRandomPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // تعديل مستخدم
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // فتح نموذج التعديل مع بيانات المستخدم
        this.populateEditForm(user);
        
        // إظهار نموذج التعديل
        const modal = new bootstrap.Modal(document.getElementById('editUserModal') || this.createEditModal());
        modal.show();
    }

    // حذف مستخدم
    async deleteUser(userId) {
        if (!hasPermission('delete')) {
            this.showError('ليس لديك صلاحية للحذف');
            return;
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // منع حذف المستخدم الحالي
        if (userId === getCurrentUser()?.id) {
            this.showError('لا يمكنك حذف حسابك الخاص');
            return;
        }

        if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
            try {
                // نقل المستخدم لسلة المحذوفات
                await this.moveToTrash(user);
                
                // إزالة من القائمة الحالية
                this.users = this.users.filter(u => u.id !== userId);
                this.saveUsers();
                
                // تحديث الجدول
                this.loadUsersTable();
                this.updateStatistics();
                
                this.showSuccess('تم حذف المستخدم بنجاح');
                
                // تسجيل النشاط
                authSystem.logActivity('delete_user', `حذف المستخدم: ${user.name}`);
                
            } catch (error) {
                console.error('خطأ في حذف المستخدم:', error);
                this.showError('حدث خطأ أثناء الحذف');
            }
        }
    }

    // نقل المستخدم لسلة المحذوفات
    async moveToTrash(user) {
        const trashedUsers = JSON.parse(localStorage.getItem('hospitalTrashedUsers') || '[]');
        
        const trashedUser = {
            ...user,
            deletedAt: new Date().toISOString(),
            deletedBy: getCurrentUser()?.username || 'system'
        };
        
        trashedUsers.push(trashedUser);
        localStorage.setItem('hospitalTrashedUsers', JSON.stringify(trashedUsers));
    }

    // تفعيل مستخدم
    async activateUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = 'active';
        this.saveUsers();
        this.loadUsersTable();
        this.updateStatistics();
        
        this.showSuccess(`تم تفعيل المستخدم "${user.name}" بنجاح`);
        
        // تسجيل النشاط
        authSystem.logActivity('activate_user', `تفعيل المستخدم: ${user.name}`);
    }

    // إعادة تعيين كلمة المرور
    async resetPassword(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (confirm(`هل تريد إعادة تعيين كلمة مرور المستخدم "${user.name}"؟`)) {
            try {
                const newPassword = this.generateRandomPassword();
                user.password = newPassword;
                
                this.saveUsers();
                this.showSuccess('تم إعادة تعيين كلمة المرور بنجاح');
                
                // عرض كلمة المرور الجديدة
                this.showPasswordResetDialog(user, newPassword);
                
                // تسجيل النشاط
                authSystem.logActivity('reset_password', `إعادة تعيين كلمة مرور: ${user.name}`);
                
            } catch (error) {
                console.error('خطأ في إعادة تعيين كلمة المرور:', error);
                this.showError('حدث خطأ أثناء إعادة تعيين كلمة المرور');
            }
        }
    }

    // عرض نافذة كلمة المرور الجديدة
    showPasswordResetDialog(user, newPassword) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">كلمة المرور الجديدة</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p>كلمة المرور الجديدة للمستخدم <strong>${user.name}</strong>:</p>
                        <div class="alert alert-info">
                            <h4 class="font-monospace">${newPassword}</h4>
                        </div>
                        <p class="text-muted">يرجى حفظ كلمة المرور هذه وتسليمها للمستخدم بشكل آمن.</p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="userManager.copyPassword('${newPassword}')">
                                <i class="fas fa-copy me-2"></i>نسخ كلمة المرور
                            </button>
                            <button class="btn btn-success" onclick="userManager.sendPasswordSMS({id: ${user.id}, name: '${user.name}', phone: '${user.phone}'}, '${newPassword}')">
                                <i class="fas fa-sms me-2"></i>إرسال عبر الرسائل النصية
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    // نسخ كلمة المرور
    copyPassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showSuccess('تم نسخ كلمة المرور');
        }).catch(() => {
            // طريقة بديلة للنسخ
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('تم نسخ كلمة المرور');
        });
    }

    // إرسال كلمة المرور عبر SMS
    async sendPasswordSMS(user, password = null) {
        try {
            const message = password 
                ? `مرحباً ${user.name}، كلمة مرورك الجديدة في نظام مستشفى الوحدة درنة: ${password}`
                : 'رسالة تجريبية من نظام مستشفى الوحدة درنة';
            
            const result = await this.smsService.sendSMS(user.phone, message);
            
            if (result.success) {
                this.showSuccess('تم إرسال الرسالة النصية بنجاح');
            } else {
                this.showError('فشل في إرسال الرسالة النصية');
            }
        } catch (error) {
            console.error('خطأ في إرسال SMS:', error);
            this.showError('حدث خطأ أثناء إرسال الرسالة');
        }
    }

    // إرسال رسالة نصية مخصصة
    sendSMS(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // ملء بيانات المستخدم في نموذج الرسالة
        document.getElementById('smsRecipient').value = `${user.name} (${user.phone})`;
        document.getElementById('smsMessage').value = '';
        
        // إظهار نموذج الرسالة
        const modal = new bootstrap.Modal(document.getElementById('smsModal'));
        modal.show();
        
        // حفظ معرف المستخدم للاستخدام لاحقاً
        this.currentSMSUser = user;
    }

    // إرسال رسالة SMS مخصصة
    async sendSMSMessage() {
        if (!this.currentSMSUser) return;

        const message = document.getElementById('smsMessage').value.trim();
        const includePassword = document.getElementById('includePassword').checked;
        
        if (!message) {
            this.showError('يرجى كتابة الرسالة');
            return;
        }

        let finalMessage = message;
        if (includePassword) {
            const newPassword = this.generateRandomPassword();
            this.currentSMSUser.password = newPassword;
            finalMessage += `\nكلمة المرور الجديدة: ${newPassword}`;
            this.saveUsers();
        }

        try {
            await this.sendPasswordSMS(this.currentSMSUser, null);
            
            // إغلاق النموذج
            const modal = bootstrap.Modal.getInstance(document.getElementById('smsModal'));
            modal.hide();
            
            // تسجيل النشاط
            authSystem.logActivity('send_sms', `إرسال رسالة نصية للمستخدم: ${this.currentSMSUser.name}`);
            
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
            this.showError('فشل في إرسال الرسالة');
        }
    }

    // البحث في المستخدمين
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.filterUsers({ search: searchTerm });
    }

    // فلترة حسب الدور
    handleRoleFilter(e) {
        const role = e.target.value;
        this.filterUsers({ role: role });
    }

    // فلترة حسب الحالة
    handleStatusFilter(e) {
        const status = e.target.value;
        this.filterUsers({ status: status });
    }

    // فلترة المستخدمين
    filterUsers(filters) {
        let filteredUsers = [...this.users];

        // فلترة حسب البحث
        if (filters.search) {
            filteredUsers = filteredUsers.filter(user => 
                user.name.toLowerCase().includes(filters.search) ||
                user.username.toLowerCase().includes(filters.search) ||
                user.email.toLowerCase().includes(filters.search)
            );
        }

        // فلترة حسب الدور
        if (filters.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }

        // فلترة حسب الحالة
        if (filters.status) {
            filteredUsers = filteredUsers.filter(user => user.status === filters.status);
        }

        // تحديث الجدول
        this.displayFilteredUsers(filteredUsers);
    }

    // عرض المستخدمين المفلترين
    displayFilteredUsers(users) {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="fas fa-search fa-2x mb-2"></i>
                        <br>لا توجد نتائج مطابقة
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map((user, index) => {
            return this.createUserRow(user, index + 1);
        }).join('');
    }

    // إعادة تعيين الفلاتر
    resetFilters() {
        document.getElementById('searchUsers').value = '';
        document.getElementById('filterByRole').value = '';
        document.getElementById('filterByStatus').value = '';
        this.loadUsersTable();
    }

    // تحديث الإحصائيات
    updateStatistics() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const doctors = this.users.filter(u => u.role === 'doctor').length;
        const nurses = this.users.filter(u => u.role === 'nurse').length;

        // تحديث بطاقات الإحصائيات
        this.updateStatCard('.bg-primary h4', totalUsers);
        this.updateStatCard('.bg-success h4', activeUsers);
        this.updateStatCard('.bg-warning h4', doctors);
        this.updateStatCard('.bg-info h4', nurses);
    }

    // تحديث بطاقة إحصائية
    updateStatCard(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            this.animateNumber(element, parseInt(element.textContent) || 0, value);
        }
    }

    // تحريك الأرقام
    animateNumber(element, from, to, duration = 1000) {
        const start = Date.now();
        const timer = setInterval(() => {
            const progress = (Date.now() - start) / duration;
            
            if (progress >= 1) {
                element.textContent = to;
                clearInterval(timer);
            } else {
                const current = Math.floor(from + (to - from) * progress);
                element.textContent = current;
            }
        }, 16);
    }

    // إعداد الفلاتر
    setupFilters() {
        // إعداد خيارات الأدوار
        const roleFilter = document.getElementById('filterByRole');
        if (roleFilter) {
            const roles = [...new Set(this.users.map(u => u.role))];
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = this.getRoleName(role);
                roleFilter.appendChild(option);
            });
        }
    }

    // الحصول على أسماء الحقول
    getFieldLabel(field) {
        const labels = {
            name: 'الاسم الكامل',
            username: 'اسم المستخدم',
            email: 'البريد الإلكتروني',
            phone: 'رقم الهاتف',
            role: 'الدور',
            department: 'القسم'
        };
        return labels[field] || field;
    }

    // الحصول على كلاس الدور
    getRoleClass(role) {
        const classes = {
            admin: 'bg-danger',
            doctor: 'bg-success',
            nurse: 'bg-info',
            receptionist: 'bg-warning'
        };
        return classes[role] || 'bg-secondary';
    }

    // الحصول على كلاس الحالة
    getStatusClass(status) {
        const classes = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            suspended: 'bg-warning'
        };
        return classes[status] || 'bg-secondary';
    }

    // الحصول على كلاس الأفاتار
    getAvatarClass(role) {
        const classes = {
            admin: 'bg-danger',
            doctor: 'bg-success',
            nurse: 'bg-info',
            receptionist: 'bg-warning'
        };
        return classes[role] || 'bg-primary';
    }

    // الحصول على أيقونة الدور
    getRoleIcon(role) {
        const icons = {
            admin: 'fa-user-shield',
            doctor: 'fa-user-md',
            nurse: 'fa-user-nurse',
            receptionist: 'fa-user'
        };
        return icons[role] || 'fa-user';
    }

    // الحصول على اسم الدور
    getRoleName(role) {
        const names = {
            admin: 'مدير النظام',
            doctor: 'طبيب',
            nurse: 'ممرض',
            receptionist: 'موظف استقبال'
        };
        return names[role] || role;
    }

    // الحصول على اسم الحالة
    getStatusName(status) {
        const names = {
            active: 'نشط',
            inactive: 'غير نشط',
            suspended: 'موقوف'
        };
        return names[status] || status;
    }

    // الحصول على لون الصلاحية
    getPermissionColor(permission) {
        const colors = {
            view: 'success',
            edit: 'warning',
            delete: 'danger',
            print: 'info',
            manage_users: 'primary',
            manage_settings: 'secondary'
        };
        return colors[permission] || 'secondary';
    }

    // الحصول على اسم الصلاحية
    getPermissionName(permission) {
        const names = {
            view: 'عرض',
            edit: 'تعديل',
            delete: 'حذف',
            print: 'طباعة',
            manage_users: 'إدارة المستخدمين',
            manage_settings: 'إدارة الإعدادات'
        };
        return names[permission] || permission;
    }

    // تنسيق التاريخ
    formatDate(dateString) {
        if (!dateString) return 'لم يسجل دخول';
        
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // إظهار حالة التحميل
    showLoading(show) {
        const button = document.querySelector('#addUserModal .btn-primary');
        if (button) {
            if (show) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري الحفظ...';
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-save me-2"></i>حفظ المستخدم';
            }
        }
    }

    // إظهار رسالة نجاح
    showSuccess(message) {
        this.showAlert(message, 'success', 'check-circle');
    }

    // إظهار رسالة خطأ
    showError(message) {
        this.showAlert(message, 'danger', 'exclamation-triangle');
    }

    // إظهار تنبيه
    showAlert(message, type, icon) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// خدمة الرسائل النصية
class SMSService {
    constructor() {
        this.apiEndpoint = '/api/sms'; // في التطبيق الحقيقي
        this.apiKey = 'your-sms-api-key';
    }

    async sendSMS(phoneNumber, message) {
        // محاكاة إرسال رسالة نصية
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // محاكاة نجاح/فشل الإرسال
        const success = Math.random() > 0.1; // 90% نجاح
        
        return {
            success: success,
            messageId: success ? `MSG_${Date.now()}` : null,
            error: success ? null : 'فشل في الاتصال بخدمة الرسائل'
        };
    }
}

// تهيئة مدير المستخدمين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    
    // تصدير للاستخدام العام
    window.userManager = userManager;
    window.saveNewUser = () => {
        const form = document.getElementById('addUserForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    };
    window.sendSMSMessage = () => userManager.sendSMSMessage();
    window.resetFilters = () => userManager.resetFilters();
});

// إضافة أنماط CSS للمستخدمين
const userStyles = document.createElement('style');
userStyles.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-in forwards;
        opacity: 0;
    }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
    
    .permissions {
        max-width: 150px;
    }
    
    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        margin: 0 auto;
    }
    
    .table tbody tr:hover {
        background-color: rgba(13, 110, 253, 0.05);
        transform: scale(1.01);
        transition: all 0.2s ease;
    }
    
    .btn-group-sm .btn {
        margin: 0 1px;
    }
    
    @media (max-width: 768px) {
        .table-responsive {
            font-size: 0.8rem;
        }
        
        .permissions {
            max-width: 100px;
        }
        
        .permissions .badge {
            font-size: 0.6rem;
            margin: 1px;
        }
    }
`;
document.head.appendChild(userStyles);