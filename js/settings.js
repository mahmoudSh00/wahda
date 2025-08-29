// إعدادات النظام والتخصيص - مستشفى الوحدة درنة

class HospitalSettings {
    constructor() {
        this.settings = this.loadSettings();
        this.departments = this.loadDepartments();
        this.networkDevices = [];
        this.init();
    }

    init() {
        this.loadSettingsToForm();
        this.bindEvents();
        this.loadDepartmentsTable();
        this.loadNetworkDevices();
        this.applyCurrentSettings();
    }

    // تحميل الإعدادات من التخزين المحلي
    loadSettings() {
        const defaultSettings = {
            // إعدادات عامة
            hospitalName: 'مستشفى الوحدة درنة',
            hospitalAddress: 'درنة - ليبيا',
            hospitalPhone: '0619876543',
            hospitalEmail: 'info@hospital.ly',
            
            // إعدادات التطبيق
            sessionTimeout: 30,
            patientsPerPage: 25,
            enableNotifications: true,
            autoSave: true,
            
            // إعدادات الطباعة
            prescriptionSize: 'A6',
            printFont: 'Arial',
            fontSize: 12,
            includeLogo: true,
            
            // إعدادات اللغة والمنطقة
            defaultLanguage: 'ar',
            dateFormat: 'dd/mm/yyyy',
            timezone: 'Africa/Tripoli',
            
            // إعدادات النظام
            enableCaching: true,
            enableCompression: true,
            maxConnections: 100,
            queryTimeout: 30,
            
            // إعدادات النسخ الاحتياطي
            enableAutoBackup: true,
            autoBackupFrequency: 'daily',
            autoBackupTime: '02:00',
            
            // إعدادات الأمان
            minPasswordLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            passwordExpiry: 90,
            maxLoginAttempts: 5,
            accountLockoutDuration: 15,
            enableTwoFactor: false,
            logFailedAttempts: true,
            
            // إعدادات الواجهة
            primaryColor: '#0d6efd',
            successColor: '#198754',
            warningColor: '#ffc107',
            dangerColor: '#dc3545',
            fontSize: 'medium',
            enableAnimations: true,
            enableSounds: false,
            compactMode: false
        };

        const savedSettings = localStorage.getItem('hospitalSettings');
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    }

    // حفظ الإعدادات
    saveSettings() {
        localStorage.setItem('hospitalSettings', JSON.stringify(this.settings));
        this.showSuccess('تم حفظ الإعدادات بنجاح');
    }

    // تحميل الأقسام
    loadDepartments() {
        const defaultDepartments = [
            { id: 1, name: 'الطوارئ', code: 'EMER', head: 'د. أحمد سالم', beds: 15, status: 'active' },
            { id: 2, name: 'الأمراض الباطنية', code: 'INT', head: 'د. محمد الطاهر', beds: 20, status: 'active' },
            { id: 3, name: 'الجراحة العامة', code: 'SURG', head: 'د. فاطمة علي', beds: 12, status: 'active' },
            { id: 4, name: 'طب الأطفال', code: 'PED', head: 'د. سارة محمود', beds: 18, status: 'active' },
            { id: 5, name: 'أمراض النساء والولادة', code: 'OB', head: 'د. ليلى حسن', beds: 10, status: 'active' }
        ];

        const savedDepartments = localStorage.getItem('hospitalDepartments');
        return savedDepartments ? JSON.parse(savedDepartments) : defaultDepartments;
    }

    // تحميل الإعدادات للنموذج
    loadSettingsToForm() {
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else if (element.type === 'color') {
                    element.value = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    // ربط الأحداث
    bindEvents() {
        // تحديث الإعدادات عند تغيير القيم
        document.querySelectorAll('#general input, #general select, #general textarea').forEach(input => {
            input.addEventListener('change', this.updateSetting.bind(this));
        });

        // أحداث علامات التبويب
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', this.handleTabChange.bind(this));
        });

        // أحداث أزرار الألوان
        document.querySelectorAll('#customization input[type="color"]').forEach(colorInput => {
            colorInput.addEventListener('change', this.updateColorSetting.bind(this));
        });
    }

    // تحديث إعداد واحد
    updateSetting(e) {
        const key = e.target.id;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        this.settings[key] = value;
        
        // حفظ تلقائي إذا كان مفعل
        if (this.settings.autoSave) {
            this.saveSettings();
        }
    }

    // تحديث إعدادات الألوان
    updateColorSetting(e) {
        const colorType = e.target.id;
        const colorValue = e.target.value;
        
        this.settings[colorType] = colorValue;
        this.applyColorToPreview(colorType, colorValue);
    }

    // تطبيق الألوان على المعاينة
    applyColorToPreview(colorType, colorValue) {
        const root = document.documentElement;
        
        switch(colorType) {
            case 'primaryColor':
                root.style.setProperty('--primary-color', colorValue);
                break;
            case 'successColor':
                root.style.setProperty('--success-color', colorValue);
                break;
            case 'warningColor':
                root.style.setProperty('--warning-color', colorValue);
                break;
            case 'dangerColor':
                root.style.setProperty('--danger-color', colorValue);
                break;
        }
    }

    // تطبيق جميع الألوان
    applyColors() {
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', this.settings.primaryColor);
        root.style.setProperty('--success-color', this.settings.successColor);
        root.style.setProperty('--warning-color', this.settings.warningColor);
        root.style.setProperty('--danger-color', this.settings.dangerColor);
        
        this.saveSettings();
        this.showSuccess('تم تطبيق الألوان بنجاح');
    }

    // تطبيق الإعدادات الحالية
    applyCurrentSettings() {
        // تطبيق الألوان
        this.applyColors();
        
        // تطبيق إعدادات الخط
        this.applyFontSettings();
        
        // تطبيق الإعدادات الأخرى
        this.applyMiscSettings();
    }

    // تطبيق إعدادات الخط
    applyFontSettings() {
        const body = document.body;
        const fontSize = this.settings.fontSize;
        
        body.classList.remove('font-small', 'font-medium', 'font-large');
        body.classList.add(`font-${fontSize}`);
        
        // إضافة أنماط الخط إذا لم تكن موجودة
        if (!document.getElementById('fontStyles')) {
            const fontStyles = document.createElement('style');
            fontStyles.id = 'fontStyles';
            fontStyles.textContent = `
                .font-small { font-size: 0.85rem; }
                .font-medium { font-size: 1rem; }
                .font-large { font-size: 1.15rem; }
            `;
            document.head.appendChild(fontStyles);
        }
    }

    // تطبيق الإعدادات المتنوعة
    applyMiscSettings() {
        const body = document.body;
        
        // تطبيق الرسوم المتحركة
        if (!this.settings.enableAnimations) {
            body.classList.add('no-animations');
        } else {
            body.classList.remove('no-animations');
        }
        
        // تطبيق الوضع المدمج
        if (this.settings.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }
    }

    // معالجة تغيير علامة التبويب
    handleTabChange(e) {
        const targetTab = e.target.getAttribute('href').substring(1);
        
        switch(targetTab) {
            case 'network':
                this.refreshNetworkDevices();
                break;
            case 'backup':
                this.loadBackupList();
                break;
            case 'security':
                this.loadSecurityLog();
                break;
        }
    }

    // تحميل جدول الأقسام
    loadDepartmentsTable() {
        const tableBody = document.querySelector('#departmentsTable tbody');
        if (!tableBody) return;

        tableBody.innerHTML = this.departments.map(dept => `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.code}</td>
                <td>${dept.head}</td>
                <td>${dept.beds}</td>
                <td><span class="badge bg-${dept.status === 'active' ? 'success' : 'secondary'}">${dept.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="hospitalSettings.editDepartment(${dept.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="hospitalSettings.deleteDepartment(${dept.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // إضافة قسم جديد
    saveDepartment() {
        const name = document.getElementById('deptName').value.trim();
        const code = document.getElementById('deptCode').value.trim().toUpperCase();
        const head = document.getElementById('deptHead').value;
        const beds = parseInt(document.getElementById('bedCount').value);

        if (!name || !code || !head || !beds) {
            this.showError('يرجى ملء جميع الحقول');
            return;
        }

        // التحقق من عدم تكرار الرمز
        if (this.departments.some(dept => dept.code === code)) {
            this.showError('رمز القسم موجود مسبقاً');
            return;
        }

        const newDepartment = {
            id: Math.max(...this.departments.map(d => d.id), 0) + 1,
            name: name,
            code: code,
            head: head,
            beds: beds,
            status: 'active'
        };

        this.departments.push(newDepartment);
        localStorage.setItem('hospitalDepartments', JSON.stringify(this.departments));
        
        this.loadDepartmentsTable();
        
        // إغلاق المودال
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal'));
        modal.hide();
        
        // إعادة تعيين النموذج
        document.getElementById('addDepartmentForm').reset();
        
        this.showSuccess('تم إضافة القسم بنجاح');
    }

    // تعديل قسم
    editDepartment(deptId) {
        const department = this.departments.find(d => d.id === deptId);
        if (!department) return;

        // فتح نموذج التعديل مع البيانات
        const name = prompt('اسم القسم:', department.name);
        if (name && name.trim()) {
            department.name = name.trim();
            localStorage.setItem('hospitalDepartments', JSON.stringify(this.departments));
            this.loadDepartmentsTable();
            this.showSuccess('تم تحديث القسم بنجاح');
        }
    }

    // حذف قسم
    deleteDepartment(deptId) {
        const department = this.departments.find(d => d.id === deptId);
        if (!department) return;

        if (confirm(`هل أنت متأكد من حذف قسم "${department.name}"؟`)) {
            this.departments = this.departments.filter(d => d.id !== deptId);
            localStorage.setItem('hospitalDepartments', JSON.stringify(this.departments));
            this.loadDepartmentsTable();
            this.showSuccess('تم حذف القسم بنجاح');
        }
    }

    // تحميل أجهزة الشبكة
    loadNetworkDevices() {
        this.networkDevices = [
            { name: 'جهاز الاستقبال الرئيسي', ip: '192.168.1.10', type: 'كمبيوتر', status: 'connected', lastSeen: new Date(Date.now() - 2 * 60000) },
            { name: 'طابعة الروشتات', ip: '192.168.1.15', type: 'طابعة', status: 'connected', lastSeen: new Date(Date.now() - 5 * 60000) },
            { name: 'جهاز المختبر', ip: '192.168.1.20', type: 'كمبيوتر', status: 'disconnected', lastSeen: new Date(Date.now() - 30 * 60000) },
            { name: 'جهاز الصيدلية', ip: '192.168.1.25', type: 'كمبيوتر', status: 'connected', lastSeen: new Date(Date.now() - 1 * 60000) },
            { name: 'خادم البيانات', ip: '192.168.1.5', type: 'خادم', status: 'connected', lastSeen: new Date(Date.now() - 30000) }
        ];

        this.updateNetworkTable();
    }

    // تحديث جدول الشبكة
    updateNetworkTable() {
        const tableBody = document.querySelector('#networkedDevices tbody');
        if (!tableBody) return;

        tableBody.innerHTML = this.networkDevices.map(device => `
            <tr>
                <td>${device.name}</td>
                <td>${device.ip}</td>
                <td>${device.type}</td>
                <td><span class="badge bg-${device.status === 'connected' ? 'success' : 'warning'}">${device.status === 'connected' ? 'متصل' : 'غير متصل'}</span></td>
                <td>${this.getTimeAgo(device.lastSeen)}</td>
                <td>
                    <button class="btn btn-outline-${device.status === 'connected' ? 'primary' : 'warning'} btn-sm" onclick="hospitalSettings.connectDevice('${device.ip}')">
                        <i class="fas fa-${device.status === 'connected' ? 'link' : 'unlink'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // فحص الشبكة
    async scanNetwork() {
        this.showLoading('جاري فحص الشبكة...');
        
        // محاكاة فحص الشبكة
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // تحديث حالة الأجهزة عشوائياً
        this.networkDevices.forEach(device => {
            if (Math.random() > 0.3) { // 70% احتمال الاتصال
                device.status = 'connected';
                device.lastSeen = new Date();
            }
        });
        
        this.updateNetworkTable();
        this.hideLoading();
        this.showSuccess('تم فحص الشبكة بنجاح');
    }

    // ربط جهاز
    async connectDevice(ip) {
        const device = this.networkDevices.find(d => d.ip === ip);
        if (!device) return;

        this.showLoading(`جاري الاتصال بـ ${device.name}...`);
        
        // محاكاة الاتصال
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const success = Math.random() > 0.2; // 80% احتمال النجاح
        
        if (success) {
            device.status = 'connected';
            device.lastSeen = new Date();
            this.showSuccess(`تم الاتصال بـ ${device.name} بنجاح`);
        } else {
            device.status = 'disconnected';
            this.showError(`فشل الاتصال بـ ${device.name}`);
        }
        
        this.updateNetworkTable();
        this.hideLoading();
    }

    // ربط جميع الأجهزة
    async connectAllDevices() {
        this.showLoading('جاري ربط جميع الأجهزة...');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        this.networkDevices.forEach(device => {
            device.status = 'connected';
            device.lastSeen = new Date();
        });
        
        this.updateNetworkTable();
        this.hideLoading();
        this.showSuccess('تم ربط جميع الأجهزة بنجاح');
    }

    // تحديث حالة الشبكة
    refreshNetworkDevices() {
        this.loadNetworkDevices();
        this.showSuccess('تم تحديث حالة الشبكة');
    }

    // اختبار الاتصال لجميع الأجهزة
    async pingAllDevices() {
        this.showLoading('جاري اختبار الاتصال...');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // محاكاة نتائج اختبار الاتصال
        const results = this.networkDevices.map(device => ({
            name: device.name,
            ip: device.ip,
            responseTime: Math.floor(Math.random() * 100) + 10,
            success: Math.random() > 0.1
        }));
        
        this.hideLoading();
        this.showPingResults(results);
    }

    // عرض نتائج اختبار الاتصال
    showPingResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">نتائج اختبار الاتصال</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>الجهاز</th>
                                        <th>عنوان IP</th>
                                        <th>زمن الاستجابة</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${results.map(result => `
                                        <tr>
                                            <td>${result.name}</td>
                                            <td>${result.ip}</td>
                                            <td>${result.success ? result.responseTime + 'ms' : 'انتهت المهلة'}</td>
                                            <td><span class="badge bg-${result.success ? 'success' : 'danger'}">${result.success ? 'نجح' : 'فشل'}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
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

    // إنشاء نسخة احتياطية
    async createBackup() {
        const backupName = document.getElementById('backupName').value.trim();
        const backupType = document.querySelector('input[name="backupType"]:checked').value;
        const selectedData = Array.from(document.querySelectorAll('#backup input[type="checkbox"]:checked')).map(cb => cb.value);
        
        if (!backupName) {
            this.showError('يرجى إدخال اسم النسخة الاحتياطية');
            return;
        }
        
        if (selectedData.length === 0) {
            this.showError('يرجى اختيار البيانات المراد نسخها');
            return;
        }
        
        this.showLoading('جاري إنشاء النسخة الاحتياطية...');
        
        // محاكاة إنشاء النسخة الاحتياطية
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // حفظ معلومات النسخة الاحتياطية
        const backups = JSON.parse(localStorage.getItem('hospitalBackups') || '[]');
        const newBackup = {
            name: backupName,
            type: backupType,
            data: selectedData,
            size: Math.floor(Math.random() * 50) + 10, // حجم عشوائي بالميجابايت
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser()?.name || 'النظام'
        };
        
        backups.push(newBackup);
        localStorage.setItem('hospitalBackups', JSON.stringify(backups));
        
        this.hideLoading();
        this.showSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
        
        // إعادة تعيين النموذج
        document.getElementById('backupName').value = '';
    }

    // استعادة نسخة احتياطية
    async restoreBackup(backupName) {
        if (!confirm(`هل أنت متأكد من استعادة النسخة الاحتياطية "${backupName}"؟\nسيتم استبدال البيانات الحالية.`)) {
            return;
        }
        
        this.showLoading('جاري استعادة النسخة الاحتياطية...');
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        this.hideLoading();
        this.showSuccess('تم استعادة النسخة الاحتياطية بنجاح');
    }

    // حذف نسخة احتياطية
    deleteBackup(backupName) {
        if (confirm(`هل أنت متأكد من حذف النسخة الاحتياطية "${backupName}"؟`)) {
            const backups = JSON.parse(localStorage.getItem('hospitalBackups') || '[]');
            const filteredBackups = backups.filter(backup => backup.name !== backupName);
            localStorage.setItem('hospitalBackups', JSON.stringify(filteredBackups));
            
            this.showSuccess('تم حذف النسخة الاحتياطية');
        }
    }

    // تحميل سجل الأمان
    loadSecurityLog() {
        // تحميل الأنشطة من نظام المصادقة
        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        const securityLog = activities.filter(activity => 
            ['login', 'logout', 'login_failed', 'password_change'].includes(activity.action)
        ).slice(-10);
        
        // عرض السجل في واجهة المستخدم
        console.log('Security Log:', securityLog);
    }

    // تصدير سجل الأمان
    exportSecurityLog() {
        const activities = JSON.parse(localStorage.getItem('hospitalActivities') || '[]');
        const securityLog = activities.filter(activity => 
            ['login', 'logout', 'login_failed', 'password_change'].includes(activity.action)
        );
        
        const csvContent = this.convertToCSV(securityLog);
        this.downloadFile(csvContent, 'security-log.csv', 'text/csv');
        this.showSuccess('تم تصدير سجل الأمان');
    }

    // مسح سجل الأمان
    clearSecurityLog() {
        if (confirm('هل أنت متأكد من مسح سجل الأمان؟ لا يمكن التراجع عن هذا الإجراء.')) {
            localStorage.removeItem('hospitalActivities');
            this.showSuccess('تم مسح سجل الأمان');
            this.loadSecurityLog();
        }
    }

    // إخراج جميع المستخدمين
    forceLogoutAll() {
        if (confirm('هل أنت متأكد من إخراج جميع المستخدمين من النظام؟')) {
            // مسح جميع جلسات المستخدمين
            localStorage.removeItem('hospitalSession');
            localStorage.removeItem('sessionTime');
            
            this.showSuccess('تم إخراج جميع المستخدمين');
            
            // إعادة توجيه للصفحة الرئيسية بعد تأخير قصير
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // تشغيل فحص النظام
    async runSystemDiagnostics() {
        this.showLoading('جاري فحص النظام...');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const diagnosticResults = {
            database: 'سليم',
            webserver: 'سليم',
            storage: 'تحذير: مساحة قليلة متبقية',
            memory: 'سليم',
            network: 'سليم'
        };
        
        this.hideLoading();
        this.showDiagnosticResults(diagnosticResults);
    }

    // عرض نتائج فحص النظام
    showDiagnosticResults(results) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">نتائج فحص النظام</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${Object.entries(results).map(([component, status]) => `
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span>${this.getComponentName(component)}</span>
                                <span class="badge bg-${this.getStatusColor(status)}">${status}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    // الحصول على اسم المكون
    getComponentName(component) {
        const names = {
            database: 'قاعدة البيانات',
            webserver: 'خادم الويب',
            storage: 'مساحة التخزين',
            memory: 'الذاكرة',
            network: 'الشبكة'
        };
        return names[component] || component;
    }

    // الحصول على لون الحالة
    getStatusColor(status) {
        if (status.includes('سليم')) return 'success';
        if (status.includes('تحذير')) return 'warning';
        if (status.includes('خطأ')) return 'danger';
        return 'secondary';
    }

    // مسح التخزين المؤقت
    clearCache() {
        if (confirm('هل تريد مسح التخزين المؤقت؟ قد يؤثر هذا على أداء النظام مؤقتاً.')) {
            // مسح التخزين المؤقت للمتصفح
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name);
                    });
                });
            }
            
            this.showSuccess('تم مسح التخزين المؤقت');
        }
    }

    // تحميل قالب
    loadTheme(themeName) {
        const themes = {
            default: {
                primaryColor: '#0d6efd',
                successColor: '#198754',
                warningColor: '#ffc107',
                dangerColor: '#dc3545'
            },
            medical: {
                primaryColor: '#2c5aa0',
                successColor: '#27ae60',
                warningColor: '#f39c12',
                dangerColor: '#e74c3c'
            },
            modern: {
                primaryColor: '#6f42c1',
                successColor: '#20c997',
                warningColor: '#fd7e14',
                dangerColor: '#dc3545'
            }
        };
        
        const theme = themes[themeName];
        if (theme) {
            Object.assign(this.settings, theme);
            this.loadSettingsToForm();
            this.applyColors();
            this.showSuccess(`تم تحميل ${themeName === 'default' ? 'القالب الافتراضي' : themeName === 'medical' ? 'القالب الطبي' : 'القالب العصري'}`);
        }
    }

    // حفظ القالب الحالي
    saveCurrentTheme() {
        const themeName = prompt('أدخل اسم القالب:');
        if (themeName && themeName.trim()) {
            const currentTheme = {
                primaryColor: this.settings.primaryColor,
                successColor: this.settings.successColor,
                warningColor: this.settings.warningColor,
                dangerColor: this.settings.dangerColor
            };
            
            const savedThemes = JSON.parse(localStorage.getItem('hospitalThemes') || '{}');
            savedThemes[themeName.trim()] = currentTheme;
            localStorage.setItem('hospitalThemes', JSON.stringify(savedThemes));
            
            this.showSuccess(`تم حفظ القالب "${themeName.trim()}" بنجاح`);
        }
    }

    // حفظ جميع الإعدادات
    saveAllSettings() {
        // جمع جميع القيم من النموذج
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.id) {
                const value = input.type === 'checkbox' ? input.checked : input.value;
                if (value !== undefined && value !== '') {
                    this.settings[input.id] = value;
                }
            }
        });
        
        this.saveSettings();
        this.applyCurrentSettings();
    }

    // إعادة تعيين الإعدادات
    resetSettings() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
            localStorage.removeItem('hospitalSettings');
            this.settings = this.loadSettings();
            this.loadSettingsToForm();
            this.applyCurrentSettings();
            this.showSuccess('تم إعادة تعيين الإعدادات للقيم الافتراضية');
        }
    }

    // دوال مساعدة
    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (hours > 0) return `منذ ${hours} ساعة`;
        if (minutes > 0) return `منذ ${minutes} دقيقة`;
        return 'الآن';
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    showLoading(message = 'جاري المعالجة...') {
        const existingLoader = document.getElementById('settingsLoader');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        const loader = document.createElement('div');
        loader.id = 'settingsLoader';
        loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
        loader.style.cssText = 'background: rgba(0,0,0,0.5); z-index: 9999;';
        loader.innerHTML = `
            <div class="bg-white p-4 rounded shadow text-center">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('settingsLoader');
        if (loader) {
            loader.remove();
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success', 'check-circle');
    }

    showError(message) {
        this.showAlert(message, 'danger', 'exclamation-triangle');
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

// تهيئة إعدادات النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const hospitalSettings = new HospitalSettings();
    
    // تصدير للاستخدام العام
    window.hospitalSettings = hospitalSettings;
    window.saveAllSettings = () => hospitalSettings.saveAllSettings();
    window.resetSettings = () => hospitalSettings.resetSettings();
    window.saveDepartment = () => hospitalSettings.saveDepartment();
    window.scanNetwork = () => hospitalSettings.scanNetwork();
    window.connectDevice = (ip) => hospitalSettings.connectDevice(ip);
    window.connectAllDevices = () => hospitalSettings.connectAllDevices();
    window.refreshNetworkStatus = () => hospitalSettings.refreshNetworkDevices();
    window.pingAllDevices = () => hospitalSettings.pingAllDevices();
    window.createBackup = () => hospitalSettings.createBackup();
    window.restoreBackup = (name) => hospitalSettings.restoreBackup(name);
    window.deleteBackup = (name) => hospitalSettings.deleteBackup(name);
    window.runSystemDiagnostics = () => hospitalSettings.runSystemDiagnostics();
    window.clearCache = () => hospitalSettings.clearCache();
    window.exportSecurityLog = () => hospitalSettings.exportSecurityLog();
    window.clearSecurityLog = () => hospitalSettings.clearSecurityLog();
    window.forceLogoutAll = () => hospitalSettings.forceLogoutAll();
    window.applyColors = () => hospitalSettings.applyColors();
    window.loadTheme = (theme) => hospitalSettings.loadTheme(theme);
    window.saveCurrentTheme = () => hospitalSettings.saveCurrentTheme();
});