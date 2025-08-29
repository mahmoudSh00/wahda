// لوحة التحكم الرئيسية - مستشفى الوحدة درنة

class HospitalDashboard {
    constructor() {
        this.statistics = {
            totalPatients: 245,
            todayPatients: 12,
            activeDepartments: 8,
            onlineUsers: 5
        };
        this.activities = [];
        this.refreshInterval = 30000; // 30 ثانية
        this.init();
    }

    init() {
        this.loadStatistics();
        this.loadRecentActivities();
        this.startAutoRefresh();
        this.bindEvents();
        this.initializeCharts();
        this.checkSystemStatus();
    }

    // تحميل الإحصائيات
    async loadStatistics() {
        try {
            // محاكاة طلب البيانات من الخادم
            const stats = await this.fetchStatistics();
            this.updateStatisticsDisplay(stats);
            this.animateCounters();
        } catch (error) {
            console.error('خطأ في تحميل الإحصائيات:', error);
            this.showError('خطأ في تحميل الإحصائيات');
        }
    }

    // محاكاة جلب الإحصائيات
    async fetchStatistics() {
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // إضافة بعض التغيير العشوائي للإحصائيات
        const randomChange = () => Math.floor(Math.random() * 5) - 2;
        
        return {
            totalPatients: this.statistics.totalPatients + randomChange(),
            todayPatients: Math.max(0, this.statistics.todayPatients + randomChange()),
            activeDepartments: Math.max(1, this.statistics.activeDepartments),
            onlineUsers: Math.max(1, this.statistics.onlineUsers + randomChange())
        };
    }

    // تحديث عرض الإحصائيات
    updateStatisticsDisplay(stats) {
        this.statistics = stats;
        
        const elements = {
            totalPatients: document.getElementById('totalPatients'),
            todayPatients: document.getElementById('todayPatients'),
            activeDepartments: document.getElementById('activeDepartments'),
            onlineUsers: document.getElementById('onlineUsers')
        };

        // تحديث القيم مع تأثير بصري
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                const newValue = stats[key];
                const oldValue = parseInt(elements[key].textContent);
                
                if (newValue !== oldValue) {
                    this.animateCounter(elements[key], oldValue, newValue);
                }
            }
        });
    }

    // رسم متحرك للعدادات
    animateCounter(element, from, to, duration = 1000) {
        const start = Date.now();
        const timer = setInterval(() => {
            const progress = (Date.now() - start) / duration;
            
            if (progress >= 1) {
                element.textContent = to;
                clearInterval(timer);
                
                // إضافة تأثير إشعاع عند تغيير القيمة
                element.parentElement.classList.add('stats-highlight');
                setTimeout(() => {
                    element.parentElement.classList.remove('stats-highlight');
                }, 2000);
            } else {
                const current = Math.floor(from + (to - from) * this.easeOutQuart(progress));
                element.textContent = current;
            }
        }, 16); // ~60fps
    }

    // دالة الانتقال السلس
    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // تحريك العدادات عند التحميل
    animateCounters() {
        const counters = document.querySelectorAll('.stats-card h2, .stats-card h3, .stats-card h4');
        counters.forEach((counter, index) => {
            const target = parseInt(counter.textContent);
            counter.textContent = '0';
            
            setTimeout(() => {
                this.animateCounter(counter, 0, target, 2000);
            }, index * 200);
        });
    }

    // تحميل النشاطات الأخيرة
    async loadRecentActivities() {
        try {
            const activities = await this.fetchRecentActivities();
            this.displayActivities(activities);
        } catch (error) {
            console.error('خطأ في تحميل النشاطات:', error);
        }
    }

    // محاكاة جلب النشاطات
    async fetchRecentActivities() {
        // محاكاة البيانات
        const sampleActivities = [
            {
                id: 1,
                type: 'add_patient',
                icon: 'user-plus',
                color: 'success',
                description: 'تم إضافة مريض جديد: أحمد علي محمد',
                user: 'د. محمد الطاهر',
                timestamp: new Date(Date.now() - 5 * 60000) // منذ 5 دقائق
            },
            {
                id: 2,
                type: 'update_patient',
                icon: 'edit',
                color: 'primary',
                description: 'تم تحديث بيانات المريض: فاطمة سالم',
                user: 'ممرضة سارة',
                timestamp: new Date(Date.now() - 15 * 60000) // منذ 15 دقيقة
            },
            {
                id: 3,
                type: 'print_prescription',
                icon: 'print',
                color: 'warning',
                description: 'تم طباعة روشتة للمريض: عمر حسن',
                user: 'د. ليلى أحمد',
                timestamp: new Date(Date.now() - 30 * 60000) // منذ 30 دقيقة
            },
            {
                id: 4,
                type: 'login',
                icon: 'sign-in-alt',
                color: 'info',
                description: 'تسجيل دخول للنظام',
                user: 'د. خالد محمود',
                timestamp: new Date(Date.now() - 45 * 60000) // منذ 45 دقيقة
            }
        ];

        return sampleActivities;
    }

    // عرض النشاطات
    displayActivities(activities) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        activityFeed.innerHTML = '';
        
        activities.forEach((activity, index) => {
            const activityElement = this.createActivityElement(activity);
            activityElement.style.animationDelay = `${index * 100}ms`;
            activityFeed.appendChild(activityElement);
        });
    }

    // إنشاء عنصر النشاط
    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item fade-in';
        
        const timeAgo = this.getTimeAgo(activity.timestamp);
        
        div.innerHTML = `
            <div class="activity-icon bg-${activity.color}">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p class="mb-1">${activity.description}</p>
                <small class="text-muted">${timeAgo} - بواسطة ${activity.user}</small>
            </div>
        `;
        
        return div;
    }

    // حساب الوقت المنقضي
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

    // بدء التحديث التلقائي
    startAutoRefresh() {
        setInterval(() => {
            this.loadStatistics();
            this.loadRecentActivities();
            this.updateSystemStatus();
        }, this.refreshInterval);
    }

    // ربط الأحداث
    bindEvents() {
        // أزرار الإضافة السريعة
        const quickAddButtons = document.querySelectorAll('[onclick*="add"]');
        quickAddButtons.forEach(button => {
            button.addEventListener('click', this.handleQuickAdd.bind(this));
        });

        // إحصائيات قابلة للنقر
        const statsCards = document.querySelectorAll('.stats-card');
        statsCards.forEach(card => {
            card.addEventListener('click', this.handleStatsClick.bind(this));
        });

        // تحديث الوقت كل دقيقة
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    // معالجة النقر على بطاقات الإحصائيات
    handleStatsClick(event) {
        const card = event.currentTarget;
        const title = card.querySelector('.card-title').textContent;
        
        // توجيه المستخدم حسب نوع الإحصائية
        switch(title) {
            case 'إجمالي المرضى':
                window.location.href = 'patients.html';
                break;
            case 'مرضى اليوم':
                window.location.href = 'add-patient.html';
                break;
            case 'الأقسام النشطة':
                window.location.href = 'departments.html';
                break;
            case 'المستخدمين المتصلين':
                window.location.href = 'users.html';
                break;
        }
    }

    // معالجة الإضافة السريعة
    handleQuickAdd(event) {
        const button = event.currentTarget;
        const action = button.textContent.trim();
        
        switch(action) {
            case 'مريض جديد':
                window.location.href = 'add-patient.html';
                break;
            case 'قسم جديد':
                this.showAddDepartmentModal();
                break;
            case 'مستخدم جديد':
                this.showAddUserModal();
                break;
        }
    }

    // تحديث الوقت الحالي
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // تحديث عنصر الوقت إن وجد
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.innerHTML = `
                <div class="current-time">${timeString}</div>
                <div class="current-date">${dateString}</div>
            `;
        }
    }

    // تهيئة الرسوم البيانية (مع Chart.js إذا كان متوفر)
    initializeCharts() {
        // فحص ما إذا كان Chart.js متوفر
        if (typeof Chart !== 'undefined') {
            this.initMonthlyChart();
            this.initDepartmentChart();
        } else {
            // إضافة رسالة تنبيه حول Chart.js
            console.log('Chart.js غير محمل. يمكن إضافة الرسوم البيانية بتضمين المكتبة.');
        }
    }

    // رسم بياني شهري (مع Chart.js)
    initMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'عدد المرضى',
                    data: [98, 112, 134, 87, 156, 143],
                    borderColor: 'rgba(13, 110, 253, 1)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'إحصائيات المرضى الشهرية'
                    }
                }
            }
        });
    }

    // رسم بياني للأقسام (مع Chart.js)
    initDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['الطوارئ', 'الباطنية', 'الجراحة', 'الأطفال', 'النساء'],
                datasets: [{
                    data: [234, 156, 123, 98, 87],
                    backgroundColor: [
                        '#0d6efd',
                        '#198754',
                        '#ffc107',
                        '#0dcaf0',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع المرضى حسب الأقسام'
                    }
                }
            }
        });
    }

    // فحص حالة النظام
    async checkSystemStatus() {
        try {
            const status = await this.getSystemStatus();
            this.updateSystemStatusDisplay(status);
        } catch (error) {
            console.error('خطأ في فحص حالة النظام:', error);
        }
    }

    // الحصول على حالة النظام
    async getSystemStatus() {
        // محاكاة فحص حالة النظام
        return {
            database: 'متصلة',
            webserver: 'يعمل',
            backup: Math.random() > 0.5 ? 'مكتمل' : 'قيد التشغيل'
        };
    }

    // تحديث عرض حالة النظام
    updateSystemStatusDisplay(status) {
        const statusElements = {
            database: document.querySelector('[data-status="database"]'),
            webserver: document.querySelector('[data-status="webserver"]'),
            backup: document.querySelector('[data-status="backup"]')
        };

        if (statusElements.database) {
            statusElements.database.className = `badge ${status.database === 'متصلة' ? 'bg-success' : 'bg-danger'}`;
            statusElements.database.textContent = status.database;
        }

        if (statusElements.webserver) {
            statusElements.webserver.className = `badge ${status.webserver === 'يعمل' ? 'bg-success' : 'bg-danger'}`;
            statusElements.webserver.textContent = status.webserver;
        }

        if (statusElements.backup) {
            statusElements.backup.className = `badge ${status.backup === 'مكتمل' ? 'bg-success' : 'bg-warning'}`;
            statusElements.backup.textContent = status.backup;
        }
    }

    // تحديث حالة النظام
    async updateSystemStatus() {
        const status = await this.getSystemStatus();
        this.updateSystemStatusDisplay(status);
    }

    // عرض رسالة خطأ
    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999;';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // إزالة التحذير تلقائياً بعد 5 ثواني
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // إضافة رسالة ترحيب
    showWelcomeMessage() {
        const user = getCurrentUser();
        if (user) {
            const welcomeToast = document.createElement('div');
            welcomeToast.className = 'toast position-fixed bottom-0 end-0 m-3';
            welcomeToast.setAttribute('role', 'alert');
            welcomeToast.style.zIndex = '9999';
            
            welcomeToast.innerHTML = `
                <div class="toast-header bg-primary text-white">
                    <i class="fas fa-hospital-symbol me-2"></i>
                    <strong class="me-auto">مستشفى الوحدة درنة</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    مرحباً ${user.name}! أهلاً بك في لوحة التحكم.
                </div>
            `;
            
            document.body.appendChild(welcomeToast);
            
            // إظهار التوست
            const toast = new bootstrap.Toast(welcomeToast);
            toast.show();
            
            // إزالة التوست من DOM بعد إخفاؤه
            welcomeToast.addEventListener('hidden.bs.toast', () => {
                welcomeToast.remove();
            });
        }
    }
}

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new HospitalDashboard();
    
    // إضافة رسالة الترحيب بعد تحميل الصفحة
    setTimeout(() => {
        dashboard.showWelcomeMessage();
    }, 1000);
});

// دوال مساعدة عامة
window.addDepartment = () => {
    // فتح نافذة منبثقة لإضافة قسم جديد
    const departmentName = prompt('أدخل اسم القسم الجديد:');
    if (departmentName && departmentName.trim()) {
        // حفظ القسم (محاكاة)
        alert(`تم إضافة قسم "${departmentName.trim()}" بنجاح!`);
        
        // إعادة تحميل الصفحة لعرض التحديثات
        location.reload();
    }
};

window.addUser = () => {
    // فتح صفحة إضافة مستخدم
    window.location.href = 'users.html#add';
};

// إضافة أنماط CSS للتأثيرات الإضافية
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .stats-highlight {
        animation: pulse-glow 2s ease-in-out;
    }
    
    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        50% {
            box-shadow: 0 5px 25px rgba(13, 110, 253, 0.3);
            transform: translateY(-2px);
        }
    }
    
    .current-time {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--primary-color);
    }
    
    .current-date {
        font-size: 0.9rem;
        color: var(--secondary-color);
    }
    
    .stats-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .stats-card:hover {
        transform: translateY(-5px) scale(1.02);
    }
`;
document.head.appendChild(dashboardStyles);