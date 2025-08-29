// نظام المصادقة والحماية - مستشفى الوحدة درنة

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.permissions = [];
        this.sessionTimeout = 30 * 60 * 1000; // 30 دقيقة
        this.init();
    }

    init() {
        this.checkSession();
        this.startSessionTimer();
        this.bindEvents();
    }

    // فحص الجلسة الحالية
    checkSession() {
        const session = localStorage.getItem('hospitalSession');
        const sessionTime = localStorage.getItem('sessionTime');
        
        if (session && sessionTime) {
            const currentTime = new Date().getTime();
            const elapsed = currentTime - parseInt(sessionTime);
            
            if (elapsed < this.sessionTimeout) {
                this.currentUser = JSON.parse(session);
                this.updateSessionTime();
                return true;
            } else {
                this.logout();
                return false;
            }
        }
        return false;
    }

    // تسجيل الدخول
    async login(username, password) {
        try {
            // محاكاة طلب API للخادم
            const response = await this.authenticate(username, password);
            
            if (response.success) {
                this.currentUser = response.user;
                this.permissions = response.permissions;
                
                // حفظ الجلسة
                localStorage.setItem('hospitalSession', JSON.stringify(this.currentUser));
                localStorage.setItem('sessionTime', new Date().getTime().toString());
                
                // تسجيل النشاط
                this.logActivity('login', 'تسجيل دخول ناجح');
                
                return { success: true, user: this.currentUser };
            } else {
                this.logActivity('login_failed', `فشل في تسجيل الدخول: ${username}`);
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            return { success: false, message: 'خطأ في الاتصال بالخادم' };
        }
    }

    // محاكاة نظام المصادقة
    async authenticate(username, password) {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // بيانات المستخدمين (في التطبيق الحقيقي، ستأتي من قاعدة البيانات)
        const users = [
            {
                id: 1,
                username: 'amod',
                password: '1997200455', // في التطبيق الحقيقي، يجب تشفير كلمات المرور
                name: 'أحمد محمود الطاهر',
                email: 'amod@hospital.ly',
                role: 'admin',
                department: 'الإدارة',
                permissions: ['view', 'edit', 'delete', 'print', 'manage_users', 'manage_settings'],
                phone: '0919876543',
                lastLogin: null
            },
            {
                id: 2,
                username: 'dr.salem',
                password: 'doctor123',
                name: 'د. محمد سالم',
                email: 'dr.salem@hospital.ly',
                role: 'doctor',
                department: 'الأمراض الباطنية',
                permissions: ['view', 'edit', 'print'],
                phone: '0918765432',
                lastLogin: '2024-01-14 22:30'
            },
            {
                id: 3,
                username: 'sarah.ahmed',
                password: 'nurse123',
                name: 'سارة أحمد',
                email: 'sarah.ahmed@hospital.ly',
                role: 'nurse',
                department: 'الطوارئ',
                permissions: ['view'],
                phone: '0917654321',
                lastLogin: '2024-01-14 20:15'
            }
        ];

        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // تحديث آخر تسجيل دخول
            user.lastLogin = new Date().toISOString();
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    phone: user.phone,
                    lastLogin: user.lastLogin
                },
                permissions: user.permissions
            };
        } else {
            return {
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            };
        }
    }

    // تسجيل الخروج
    logout() {
        if (this.currentUser) {
            this.logActivity('logout', 'تسجيل خروج');
        }
        
        this.currentUser = null;
        this.permissions = [];
        localStorage.removeItem('hospitalSession');
        localStorage.removeItem('sessionTime');
        
        // إعادة توجيه لصفحة تسجيل الدخول
        window.location.href = 'index.html';
    }

    // فحص الصلاحيات
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }

    // فحص الدور
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // تحديث وقت الجلسة
    updateSessionTime() {
        localStorage.setItem('sessionTime', new Date().getTime().toString());
    }

    // بدء مؤقت الجلسة
    startSessionTimer() {
        setInterval(() => {
            if (this.currentUser) {
                const sessionTime = localStorage.getItem('sessionTime');
                if (sessionTime) {
                    const currentTime = new Date().getTime();
                    const elapsed = currentTime - parseInt(sessionTime);
                    
                    if (elapsed >= this.sessionTimeout) {
                        this.showSessionExpiredMessage();
                        this.logout();
                    } else if (elapsed >= this.sessionTimeout - 5 * 60 * 1000) {
                        // تحذير قبل انتهاء الجلسة بـ 5 دقائق
                        this.showSessionWarning();
                    }
                }
            }
        }, 60000); // فحص كل دقيقة
    }

    // عرض رسالة انتهاء الجلسة
    showSessionExpiredMessage() {
        alert('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
    }

    // عرض تحذير انتهاء الجلسة
    showSessionWarning() {
        if (confirm('ستنتهي صلاحية الجلسة خلال 5 دقائق. هل تريد تجديدها؟')) {
            this.updateSessionTime();
        }
    }

    // ربط الأحداث
    bindEvents() {
        // تحديث وقت الجلسة عند النشاط
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.updateSessionTime();
                }
            }, { passive: true });
        });
    }

    // تسجيل النشاطات
    logActivity(action, description) {
        const activity = {
            timestamp: new Date().toISOString(),
            user: this.currentUser ? this.currentUser.username : 'anonymous',
            action: action,
            description: description,
            ip: this.getClientIP(),
            userAgent: navigator.userAgent
        };

        // حفظ النشاط (في التطبيق الحقيقي، سيتم إرساله للخادم)
        let activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        activities.push(activity);
        
        // الاحتفاظ بآخر 100 نشاط فقط
        if (activities.length > 100) {
            activities = activities.slice(-100);
        }
        
        localStorage.setItem('hospitalActivities', JSON.stringify(activities));
    }

    // الحصول على عنوان IP للعميل (محاكاة)
    getClientIP() {
        // في التطبيق الحقيقي، سيتم الحصول على IP من الخادم
        return '192.168.1.1';
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // الحصول على الصلاحيات
    getPermissions() {
        return this.permissions;
    }

    // تغيير كلمة المرور
    async changePassword(oldPassword, newPassword) {
        try {
            // محاكاة طلب API
            const response = await this.updatePassword(oldPassword, newPassword);
            
            if (response.success) {
                this.logActivity('password_change', 'تم تغيير كلمة المرور');
                return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('خطأ في تغيير كلمة المرور:', error);
            return { success: false, message: 'خطأ في الاتصال بالخادم' };
        }
    }

    // محاكاة تحديث كلمة المرور
    async updatePassword(oldPassword, newPassword) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // في التطبيق الحقيقي، سيتم التحقق من كلمة المرور القديمة وتحديث الجديدة في قاعدة البيانات
        if (oldPassword === '1997200455') { // مجرد محاكاة
            return { success: true };
        } else {
            return { success: false, message: 'كلمة المرور القديمة غير صحيحة' };
        }
    }

    // فحص قوة كلمة المرور
    checkPasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        let strength = 0;
        let feedback = [];
        
        if (password.length >= minLength) strength += 1;
        else feedback.push('يجب أن تكون 8 أحرف على الأقل');
        
        if (hasUpperCase) strength += 1;
        else feedback.push('يجب أن تحتوي على حرف كبير');
        
        if (hasLowerCase) strength += 1;
        else feedback.push('يجب أن تحتوي على حرف صغير');
        
        if (hasNumbers) strength += 1;
        else feedback.push('يجب أن تحتوي على رقم');
        
        if (hasSpecialChar) strength += 1;
        else feedback.push('يجب أن تحتوي على رمز خاص');
        
        const levels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
        
        return {
            score: strength,
            level: levels[strength] || 'ضعيفة جداً',
            feedback: feedback
        };
    }

    // حماية الصفحة
    protectPage() {
        if (!this.checkSession()) {
            window.location.href = 'index.html';
            return false;
        }
        
        // تحديث معلومات المستخدم في واجهة المستخدم
        this.updateUserInterface();
        return true;
    }

    // تحديث واجهة المستخدم
    updateUserInterface() {
        const currentUserElements = document.querySelectorAll('#currentUser');
        currentUserElements.forEach(element => {
            if (this.currentUser) {
                element.textContent = this.currentUser.name;
            }
        });

        // إخفاء/إظهار العناصر حسب الصلاحيات
        this.applyPermissions();
    }

    // تطبيق الصلاحيات على واجهة المستخدم
    applyPermissions() {
        // إخفاء الأزرار والروابط حسب الصلاحيات
        const protectedElements = document.querySelectorAll('[data-permission]');
        
        protectedElements.forEach(element => {
            const requiredPermission = element.getAttribute('data-permission');
            if (!this.hasPermission(requiredPermission)) {
                element.style.display = 'none';
            }
        });

        // إخفاء العناصر حسب الدور
        const roleElements = document.querySelectorAll('[data-role]');
        
        roleElements.forEach(element => {
            const requiredRole = element.getAttribute('data-role');
            if (!this.hasRole(requiredRole)) {
                element.style.display = 'none';
            }
        });
    }

    // تشفير البيانات الحساسة (محاكاة بسيطة)
    encryptData(data) {
        // في التطبيق الحقيقي، يجب استخدام مكتبات تشفير قوية
        return btoa(JSON.stringify(data));
    }

    // إلغاء تشفير البيانات
    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            console.error('خطأ في إلغاء التشفير:', error);
            return null;
        }
    }
}

// إنشاء مثيل من نظام المصادقة
const authSystem = new AuthSystem();

// تصدير النظام للاستخدام في ملفات أخرى
window.authSystem = authSystem;

// دوال مساعدة عامة
window.logout = () => authSystem.logout();
window.hasPermission = (permission) => authSystem.hasPermission(permission);
window.hasRole = (role) => authSystem.hasRole(role);
window.getCurrentUser = () => authSystem.getCurrentUser();

// حماية الصفحات تلقائياً (ما عدا صفحة تسجيل الدخول)
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // صفحة تسجيل الدخول - إعادة توجيه إذا كان المستخدم مسجل دخول بالفعل
        if (authSystem.checkSession()) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // حماية الصفحات الأخرى
        authSystem.protectPage();
    }
});