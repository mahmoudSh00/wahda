// إدارة الملف الشخصي - مستشفى الوحدة درنة

class ProfileManager {
    constructor() {
        this.currentUser = getCurrentUser();
        this.isEditing = false;
        this.originalData = {};
        this.activities = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadUserActivities();
        this.bindEvents();
        this.updateUserStats();
    }

    // تحميل بيانات المستخدم
    loadUserData() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // تحديث عناصر الصفحة
        document.getElementById('currentUser').textContent = this.currentUser.name;
        document.getElementById('displayName').textContent = this.currentUser.name;
        document.getElementById('displayRole').textContent = this.getRoleInArabic(this.currentUser.role);
        
        // تحديث النموذج
        document.getElementById('fullName').value = this.currentUser.name;
        document.getElementById('username').value = this.currentUser.username;
        document.getElementById('email').value = this.currentUser.email || 'ahmed@hospital.ly';
        document.getElementById('phone').value = this.currentUser.phone || '0917654321';
        document.getElementById('position').value = this.getRoleInArabic(this.currentUser.role);
        document.getElementById('department').value = this.currentUser.department || 'الإدارة العامة';
        document.getElementById('joinDate').value = this.currentUser.joinDate || '2023-01-15';
        document.getElementById('status').value = this.currentUser.status === 'active' ? 'نشط' : 'غير نشط';
        document.getElementById('bio').value = this.currentUser.bio || 'لا توجد نبذة شخصية متاحة.';
        
        // تحديث الصورة الشخصية
        const profileImage = document.getElementById('profileImage');
        if (this.currentUser.profileImage) {
            profileImage.src = this.currentUser.profileImage;
        } else {
            // إنشاء صورة بالأحرف الأولى
            const initials = this.getInitials(this.currentUser.name);
            profileImage.src = `https://via.placeholder.com/150x150/0d6efd/ffffff?text=${initials}`;
        }
    }

    // تحميل نشاطات المستخدم
    loadUserActivities() {
        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        
        // تصفية النشاطات للمستخدم الحالي
        this.activities = activities
            .filter(activity => activity.user === this.currentUser.name)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // آخر 10 نشاطات

        this.displayActivities();
    }

    // عرض النشاطات
    displayActivities() {
        const timeline = document.getElementById('activityTimeline');
        
        if (this.activities.length === 0) {
            timeline.innerHTML = '<p class="text-muted text-center">لا توجد نشاطات مسجلة</p>';
            return;
        }

        timeline.innerHTML = this.activities.map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
            const icon = this.getActivityIcon(activity.action);
            const color = this.getActivityColor(activity.action);

            return `
                <div class="activity-item d-flex align-items-start mb-3">
                    <div class="activity-icon me-3">
                        <div class="rounded-circle bg-${color} text-white d-flex align-items-center justify-content-center" 
                             style="width: 40px; height: 40px;">
                            <i class="fas ${icon} fa-sm"></i>
                        </div>
                    </div>
                    <div class="activity-content flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-1">${this.getActivityTitle(activity.action)}</h6>
                            <small class="text-muted">${timeAgo}</small>
                        </div>
                        <p class="mb-0 text-muted">${activity.details}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ربط الأحداث
    bindEvents() {
        // تغيير كلمة المرور
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // تحديث الأحداث عند التحرير
        this.setupEditMode();
    }

    // إعداد وضع التحرير
    setupEditMode() {
        const editBtn = document.getElementById('editBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        editBtn.addEventListener('click', () => this.enableEdit());
        saveBtn.addEventListener('click', () => this.saveProfile());
        cancelBtn.addEventListener('click', () => this.cancelEdit());
    }

    // تفعيل وضع التحرير
    enableEdit() {
        this.isEditing = true;
        
        // حفظ البيانات الأصلية
        this.originalData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
            bio: document.getElementById('bio').value
        };

        // تفعيل الحقول القابلة للتعديل
        document.getElementById('fullName').readOnly = false;
        document.getElementById('email').readOnly = false;
        document.getElementById('phone').readOnly = false;
        document.getElementById('department').readOnly = false;
        document.getElementById('bio').readOnly = false;

        // تحديث الأزرار
        document.getElementById('editBtn').style.display = 'none';
        document.getElementById('saveBtn').style.display = 'inline-block';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        document.getElementById('imageOverlay').style.display = 'block';

        // إضافة تأثيرات بصرية
        document.querySelectorAll('#profileForm input:not([readonly]), #profileForm textarea:not([readonly])').forEach(input => {
            input.classList.add('border-primary');
        });

        this.showInfo('يمكنك الآن تعديل معلوماتك الشخصية');
    }

    // حفظ الملف الشخصي
    saveProfile() {
        const updatedData = {
            name: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            department: document.getElementById('department').value.trim(),
            bio: document.getElementById('bio').value.trim()
        };

        // التحقق من صحة البيانات
        if (!this.validateProfileData(updatedData)) {
            return;
        }

        // تحديث بيانات المستخدم
        this.currentUser.name = updatedData.name;
        this.currentUser.email = updatedData.email;
        this.currentUser.phone = updatedData.phone;
        this.currentUser.department = updatedData.department;
        this.currentUser.bio = updatedData.bio;

        // حفظ في localStorage
        const users = JSON.parse(localStorage.getItem('hospitalUsers') || '[]');
        const userIndex = users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...this.currentUser };
            localStorage.setItem('hospitalUsers', JSON.stringify(users));
        }

        // تحديث جلسة المستخدم
        localStorage.setItem('hospitalSession', JSON.stringify(this.currentUser));

        // تسجيل النشاط
        this.logActivity('profile_update', 'تم تحديث الملف الشخصي');

        this.disableEdit();
        this.loadUserData();
        this.showSuccess('تم حفظ التغييرات بنجاح');
    }

    // إلغاء التحرير
    cancelEdit() {
        // استعادة البيانات الأصلية
        document.getElementById('fullName').value = this.originalData.fullName;
        document.getElementById('email').value = this.originalData.email;
        document.getElementById('phone').value = this.originalData.phone;
        document.getElementById('department').value = this.originalData.department;
        document.getElementById('bio').value = this.originalData.bio;

        this.disableEdit();
        this.showInfo('تم إلغاء التغييرات');
    }

    // تعطيل وضع التحرير
    disableEdit() {
        this.isEditing = false;

        // تعطيل الحقول
        document.getElementById('fullName').readOnly = true;
        document.getElementById('email').readOnly = true;
        document.getElementById('phone').readOnly = true;
        document.getElementById('department').readOnly = true;
        document.getElementById('bio').readOnly = true;

        // تحديث الأزرار
        document.getElementById('editBtn').style.display = 'inline-block';
        document.getElementById('saveBtn').style.display = 'none';
        document.getElementById('cancelBtn').style.display = 'none';
        document.getElementById('imageOverlay').style.display = 'none';

        // إزالة التأثيرات البصرية
        document.querySelectorAll('#profileForm input, #profileForm textarea').forEach(input => {
            input.classList.remove('border-primary');
        });
    }

    // التحقق من صحة البيانات
    validateProfileData(data) {
        if (!data.name || data.name.length < 2) {
            this.showError('الاسم يجب أن يكون على الأقل حرفين');
            return false;
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            this.showError('البريد الإلكتروني غير صحيح');
            return false;
        }

        if (!data.phone || data.phone.length < 10) {
            this.showError('رقم الهاتف يجب أن يكون على الأقل 10 أرقام');
            return false;
        }

        return true;
    }

    // تغيير كلمة المرور
    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // التحقق من البيانات
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }

        if (currentPassword !== this.currentUser.password) {
            this.showError('كلمة المرور الحالية غير صحيحة');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (newPassword.length < 8) {
            this.showError('كلمة المرور الجديدة يجب أن تكون على الأقل 8 أحرف');
            return;
        }

        // تحديث كلمة المرور
        this.currentUser.password = newPassword;
        
        const users = JSON.parse(localStorage.getItem('hospitalUsers') || '[]');
        const userIndex = users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('hospitalUsers', JSON.stringify(users));
        }

        // تسجيل النشاط
        this.logActivity('password_change', 'تم تغيير كلمة المرور');

        // إعادة تعيين النموذج
        document.getElementById('changePasswordForm').reset();
        
        this.showSuccess('تم تغيير كلمة المرور بنجاح');
    }

    // رفع صورة شخصية
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            this.showError('يرجى اختيار ملف صورة صحيح');
            return;
        }

        // التحقق من حجم الملف (2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            document.getElementById('profileImage').src = imageData;
            
            // حفظ الصورة
            this.currentUser.profileImage = imageData;
            localStorage.setItem('hospitalSession', JSON.stringify(this.currentUser));
            
            // تحديث في قائمة المستخدمين
            const users = JSON.parse(localStorage.getItem('hospitalUsers') || '[]');
            const userIndex = users.findIndex(u => u.username === this.currentUser.username);
            if (userIndex !== -1) {
                users[userIndex].profileImage = imageData;
                localStorage.setItem('hospitalUsers', JSON.stringify(users));
            }

            this.logActivity('profile_image_update', 'تم تحديث الصورة الشخصية');
            this.showSuccess('تم تحديث الصورة الشخصية');
        };

        reader.readAsDataURL(file);
    }

    // تحديث إحصائيات المستخدم
    updateUserStats() {
        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        const userActivities = activities.filter(a => a.user === this.currentUser.name);
        
        // حساب الإحصائيات
        const loginCount = userActivities.filter(a => a.action === 'login').length;
        const patientsAdded = userActivities.filter(a => a.action === 'add_patient').length;
        
        // حساب الأيام النشطة
        const uniqueDays = new Set(
            userActivities.map(a => new Date(a.timestamp).toDateString())
        ).size;

        document.getElementById('loginCount').textContent = loginCount;
        document.getElementById('patientsAdded').textContent = patientsAdded;
        document.getElementById('activeDays').textContent = uniqueDays;
        
        // آخر دخول
        const lastLoginActivity = userActivities
            .filter(a => a.action === 'login')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
        if (lastLoginActivity) {
            const lastLoginTime = this.getTimeAgo(new Date(lastLoginActivity.timestamp));
            document.getElementById('lastLogin').textContent = lastLoginTime;
        }
    }

    // تحميل المزيد من النشاطات
    loadMoreActivities() {
        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        
        // تصفية وعرض آخر 20 نشاط
        this.activities = activities
            .filter(activity => activity.user === this.currentUser.name)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);

        this.displayActivities();
        this.showInfo('تم تحميل المزيد من النشاطات');
    }

    // تفعيل المصادقة الثنائية
    enableTwoFactor() {
        const verificationCode = document.getElementById('verificationCode').value;
        
        if (!verificationCode || verificationCode.length !== 6) {
            this.showError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
            return;
        }

        // محاكاة تفعيل المصادقة الثنائية
        this.currentUser.twoFactorEnabled = true;
        
        const users = JSON.parse(localStorage.getItem('hospitalUsers') || '[]');
        const userIndex = users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].twoFactorEnabled = true;
            localStorage.setItem('hospitalUsers', JSON.stringify(users));
        }

        this.logActivity('enable_2fa', 'تم تفعيل المصادقة الثنائية');
        
        bootstrap.Modal.getInstance(document.getElementById('twoFactorModal')).hide();
        this.showSuccess('تم تفعيل المصادقة الثنائية بنجاح');
    }

    // دوال مساعدة
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    getRoleInArabic(role) {
        const roles = {
            admin: 'مدير النظام',
            doctor: 'طبيب',
            nurse: 'ممرض/ة',
            staff: 'موظف إداري'
        };
        return roles[role] || role;
    }

    getActivityIcon(action) {
        const icons = {
            login: 'fa-sign-in-alt',
            logout: 'fa-sign-out-alt',
            add_patient: 'fa-user-plus',
            edit_patient: 'fa-user-edit',
            delete_patient: 'fa-user-minus',
            profile_update: 'fa-user-cog',
            password_change: 'fa-key',
            enable_2fa: 'fa-shield-alt'
        };
        return icons[action] || 'fa-info-circle';
    }

    getActivityColor(action) {
        const colors = {
            login: 'success',
            logout: 'secondary',
            add_patient: 'primary',
            edit_patient: 'warning',
            delete_patient: 'danger',
            profile_update: 'info',
            password_change: 'warning',
            enable_2fa: 'success'
        };
        return colors[action] || 'secondary';
    }

    getActivityTitle(action) {
        const titles = {
            login: 'تسجيل دخول',
            logout: 'تسجيل خروج',
            add_patient: 'إضافة مريض',
            edit_patient: 'تعديل مريض',
            delete_patient: 'حذف مريض',
            profile_update: 'تحديث الملف الشخصي',
            password_change: 'تغيير كلمة المرور',
            enable_2fa: 'تفعيل المصادقة الثنائية'
        };
        return titles[action] || action;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `منذ ${days} يوم`;
        if (hours > 0) return `منذ ${hours} ساعة`;
        if (minutes > 0) return `منذ ${minutes} دقيقة`;
        return 'الآن';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // تسجيل النشاطات
    logActivity(action, details) {
        const activity = {
            id: Date.now(),
            action: action,
            details: details,
            user: this.currentUser?.name || 'النظام',
            timestamp: new Date().toISOString(),
            ip: 'localhost'
        };

        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        activities.push(activity);
        localStorage.setItem('hospitalActivities', JSON.stringify(activities));
    }

    // دوال الإشعارات
    showSuccess(message) {
        this.showAlert(message, 'success', 'check-circle');
    }

    showError(message) {
        this.showAlert(message, 'danger', 'exclamation-triangle');
    }

    showInfo(message) {
        this.showAlert(message, 'info', 'info-circle');
    }

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

// تهيئة مدير الملف الشخصي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const profileManager = new ProfileManager();
    
    // تصدير للاستخدام العام
    window.profileManager = profileManager;
    window.editProfile = () => profileManager.enableEdit();
    window.saveProfile = () => profileManager.saveProfile();
    window.cancelEdit = () => profileManager.cancelEdit();
    window.handleImageUpload = (event) => profileManager.handleImageUpload(event);
    window.loadMoreActivities = () => profileManager.loadMoreActivities();
    window.enableTwoFactor = () => profileManager.enableTwoFactor();
});