// صفحة إضافة المرضى - مستشفى الوحدة درنة

class PatientManager {
    constructor() {
        this.patients = JSON.parse(localStorage.getItem('hospitalPatients') || '[]');
        this.currentPatient = null;
        this.patientCounter = this.patients.length + 1;
        this.init();
    }

    init() {
        this.bindFormEvents();
        this.loadRecentPatients();
        this.setupValidation();
        this.setDefaultDate();
    }

    // ربط أحداث النموذج
    bindFormEvents() {
        const form = document.getElementById('patientForm');
        const printBtn = document.getElementById('printPrescription');
        
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', this.printPrescription.bind(this));
        }

        // إعداد الحقول التفاعلية
        this.setupInteractiveFields();
    }

    // إعداد الحقول التفاعلية
    setupInteractiveFields() {
        const firstNameField = document.getElementById('firstName');
        const lastNameField = document.getElementById('lastName');
        const ageField = document.getElementById('age');
        const phoneField = document.getElementById('phoneNumber');

        // تنسيق رقم الهاتف تلقائياً
        if (phoneField) {
            phoneField.addEventListener('input', this.formatPhoneNumber.bind(this));
        }

        // التحقق من العمر
        if (ageField) {
            ageField.addEventListener('blur', this.validateAge.bind(this));
        }

        // تحويل الأسماء للعربية الصحيحة
        if (firstNameField) {
            firstNameField.addEventListener('blur', this.formatArabicName.bind(this));
        }
        
        if (lastNameField) {
            lastNameField.addEventListener('blur', this.formatArabicName.bind(this));
        }
    }

    // معالجة إرسال النموذج
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        
        // إظهار حالة التحميل
        this.showLoading(true);
        
        try {
            // حفظ بيانات المريض
            const result = await this.savePatient(formData);
            
            if (result.success) {
                this.currentPatient = result.patient;
                this.showSuccess('تم حفظ بيانات المريض بنجاح!');
                this.enablePrintButton();
                this.addToRecentPatients(result.patient);
                
                // إعادة تعيين النموذج بعد 3 ثواني
                setTimeout(() => {
                    if (confirm('هل تريد إضافة مريض آخر؟')) {
                        this.resetForm();
                    }
                }, 3000);
                
            } else {
                this.showError(result.message);
            }
            
        } catch (error) {
            console.error('خطأ في حفظ المريض:', error);
            this.showError('حدث خطأ أثناء حفظ البيانات');
        } finally {
            this.showLoading(false);
        }
    }

    // جمع بيانات النموذج
    getFormData() {
        return {
            id: this.generatePatientId(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            department: document.getElementById('department').value,
            admissionDate: document.getElementById('admissionDate').value,
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            address: document.getElementById('address').value.trim(),
            diagnosis: document.getElementById('diagnosis').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            status: 'active',
            createdBy: getCurrentUser()?.name || 'مستخدم غير معروف',
            createdAt: new Date().toISOString()
        };
    }

    // التحقق من صحة النموذج
    validateForm() {
        const requiredFields = [
            { id: 'firstName', name: 'الاسم الأول' },
            { id: 'lastName', name: 'اللقب' },
            { id: 'age', name: 'العمر' },
            { id: 'gender', name: 'الجنس' },
            { id: 'department', name: 'القسم' },
            { id: 'admissionDate', name: 'تاريخ الدخول' },
            { id: 'address', name: 'السكن' }
        ];

        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                this.showError(`يرجى إدخال ${field.name}`);
                element.focus();
                return false;
            }
        }

        // التحقق من صحة العمر
        const age = parseInt(document.getElementById('age').value);
        if (age < 0 || age > 150) {
            this.showError('العمر غير صحيح');
            document.getElementById('age').focus();
            return false;
        }

        // التحقق من صحة التاريخ
        const admissionDate = new Date(document.getElementById('admissionDate').value);
        const today = new Date();
        if (admissionDate > today) {
            this.showError('تاريخ الدخول لا يمكن أن يكون في المستقبل');
            document.getElementById('admissionDate').focus();
            return false;
        }

        return true;
    }

    // حفظ بيانات المريض
    async savePatient(patientData) {
        // محاكاة حفظ البيانات في قاعدة البيانات
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            // إضافة المريض للقائمة المحلية
            this.patients.push(patientData);
            localStorage.setItem('hospitalPatients', JSON.stringify(this.patients));
            
            // تسجيل النشاط
            authSystem.logActivity('add_patient', `إضافة مريض جديد: ${patientData.firstName} ${patientData.lastName}`);
            
            return {
                success: true,
                patient: patientData,
                message: 'تم حفظ بيانات المريض بنجاح'
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'فشل في حفظ البيانات'
            };
        }
    }

    // إنتاج معرف فريد للمريض
    generatePatientId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const counter = String(this.patientCounter).padStart(4, '0');
        
        this.patientCounter++;
        return `P${year}${month}${day}${counter}`;
    }

    // طباعة الروشتة
    printPrescription() {
        if (!this.currentPatient) {
            this.showError('لا يوجد بيانات مريض للطباعة');
            return;
        }

        const prescriptionContent = this.generatePrescriptionContent(this.currentPatient);
        this.showPrescriptionModal(prescriptionContent);
    }

    // إنتاج محتوى الروشتة
    generatePrescriptionContent(patient) {
        const currentDate = new Date().toLocaleDateString('ar-SA');
        const currentTime = new Date().toLocaleTimeString('ar-SA');
        const doctor = getCurrentUser()?.name || 'الطبيب المعالج';
        
        return `
            <div class="prescription-print">
                <div class="prescription-header">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;">
                        <i class="fas fa-hospital-symbol"></i>
                        مستشفى الوحدة درنة
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        درنة - ليبيا | هاتف: 0619876543
                    </p>
                    <hr style="margin: 15px 0; border-color: var(--primary-color);">
                </div>
                
                <div class="prescription-content">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <strong>التاريخ:</strong> ${currentDate}<br>
                            <strong>الوقت:</strong> ${currentTime}
                        </div>
                        <div style="text-align: left;">
                            <strong>رقم المريض:</strong> ${patient.id}
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin-bottom: 10px; color: var(--primary-color);">بيانات المريض</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div><strong>الاسم:</strong> ${patient.firstName} ${patient.lastName}</div>
                            <div><strong>العمر:</strong> ${patient.age} سنة</div>
                            <div><strong>الجنس:</strong> ${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                            <div><strong>القسم:</strong> ${this.getDepartmentName(patient.department)}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>العنوان:</strong> ${patient.address}
                    </div>
                    
                    ${patient.diagnosis ? `
                        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h5 style="margin-bottom: 8px; color: var(--info-color);">التشخيص:</h5>
                            <p style="margin: 0;">${patient.diagnosis}</p>
                        </div>
                    ` : ''}
                    
                    ${patient.notes ? `
                        <div style="margin-bottom: 15px;">
                            <strong>ملاحظات:</strong><br>
                            <p style="margin: 5px 0;">${patient.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                        <div style="display: flex; justify-content: space-between;">
                            <div>
                                <strong>الطبيب المعالج:</strong><br>
                                <p style="margin: 5px 0;">${doctor}</p>
                                <div style="margin-top: 20px;">
                                    التوقيع: _______________
                                </div>
                            </div>
                            <div style="text-align: left;">
                                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI0MCIgeT0iNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yzc1N2QiIGZvbnQtc2l6ZT0iMTIiPtiu2KrZhSDYp9mE2YXYs9iq2LTZgdmJPC90ZXh0Pgo8L3N2Zz4K" alt="ختم المستشفى" style="width: 80px; height: 80px;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="prescription-footer">
                    <p style="margin: 0; text-align: center; color: #666; font-size: 12px;">
                        تم إنشاء هذه الروشتة إلكترونياً في ${currentDate} الساعة ${currentTime}
                    </p>
                </div>
            </div>
        `;
    }

    // عرض نافذة طباعة الروشتة
    showPrescriptionModal(content) {
        const modalElement = document.getElementById('prescriptionModal');
        const contentElement = document.getElementById('prescriptionContent');
        
        if (modalElement && contentElement) {
            contentElement.innerHTML = content;
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    // طباعة الروشتة
    printPrescriptionPage() {
        const printContent = document.getElementById('prescriptionContent').innerHTML;
        const printWindow = window.open('', '', 'width=600,height=800');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>روشتة مريض - مستشفى الوحدة درنة</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        direction: rtl; 
                        margin: 0; 
                        padding: 20px;
                        background: white;
                    }
                    .prescription-print { 
                        max-width: 148mm; 
                        margin: 0 auto; 
                        font-size: 14px; 
                        line-height: 1.6; 
                    }
                    @media print {
                        body { margin: 0; padding: 10mm; }
                        .prescription-print { width: 148mm; }
                    }
                    h3, h4, h5 { color: #0d6efd !important; }
                    .fas { display: none; }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // الحصول على اسم القسم بالعربية
    getDepartmentName(departmentCode) {
        const departments = {
            'emergency': 'الطوارئ',
            'internal': 'الأمراض الباطنية',
            'surgery': 'الجراحة العامة',
            'pediatrics': 'طب الأطفال',
            'obstetrics': 'أمراض النساء والولادة',
            'cardiology': 'أمراض القلب',
            'orthopedics': 'جراحة العظام',
            'neurology': 'أمراض الأعصاب'
        };
        
        return departments[departmentCode] || departmentCode;
    }

    // تحميل المرضى الأخيرين
    loadRecentPatients() {
        const recentPatientsElement = document.getElementById('recentPatients');
        if (!recentPatientsElement) return;

        const recentPatients = this.patients.slice(-5).reverse();
        
        if (recentPatients.length === 0) {
            recentPatientsElement.innerHTML = '<p class="text-muted text-center">لا يوجد مرضى مسجلين بعد</p>';
            return;
        }

        recentPatientsElement.innerHTML = recentPatients.map(patient => {
            const timeAgo = this.getTimeAgo(new Date(patient.createdAt));
            return `
                <div class="patient-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${patient.firstName} ${patient.lastName}</strong>
                            <br><small class="text-muted">${this.getDepartmentName(patient.department)} - ${timeAgo}</small>
                        </div>
                        <span class="badge bg-${this.getStatusColor(patient.status)}">${this.getStatusText(patient.status)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // إضافة مريض للقائمة الأخيرة
    addToRecentPatients(patient) {
        setTimeout(() => {
            this.loadRecentPatients();
        }, 500);
    }

    // الحصول على لون الحالة
    getStatusColor(status) {
        const colors = {
            'active': 'success',
            'pending': 'warning',
            'treatment': 'info',
            'discharged': 'secondary'
        };
        return colors[status] || 'primary';
    }

    // الحصول على نص الحالة
    getStatusText(status) {
        const texts = {
            'active': 'نشط',
            'pending': 'انتظار',
            'treatment': 'تحت العلاج',
            'discharged': 'خرج'
        };
        return texts[status] || 'غير محدد';
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

    // تنسيق رقم الهاتف
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('0')) {
            value = value.substring(0, 10);
            if (value.length > 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
        }
        e.target.value = value;
    }

    // التحقق من صحة العمر
    validateAge(e) {
        const age = parseInt(e.target.value);
        const ageGroup = this.getAgeGroup(age);
        
        // اقتراح القسم المناسب بناءً على العمر
        if (age <= 16) {
            const departmentSelect = document.getElementById('department');
            if (departmentSelect && !departmentSelect.value) {
                departmentSelect.value = 'pediatrics';
                this.showInfo('تم اقتراح قسم طب الأطفال بناءً على العمر');
            }
        }
    }

    // تحديد الفئة العمرية
    getAgeGroup(age) {
        if (age <= 1) return 'رضيع';
        if (age <= 12) return 'طفل';
        if (age <= 18) return 'مراهق';
        if (age <= 60) return 'بالغ';
        return 'مسن';
    }

    // تنسيق الأسماء العربية
    formatArabicName(e) {
        let value = e.target.value.trim();
        // إزالة الأرقام والرموز
        value = value.replace(/[0-9!@#$%^&*(),.?":{}|<>]/g, '');
        // تنسيق المسافات
        value = value.replace(/\s+/g, ' ');
        e.target.value = value;
    }

    // تعيين التاريخ الافتراضي
    setDefaultDate() {
        const dateField = document.getElementById('admissionDate');
        if (dateField && !dateField.value) {
            const today = new Date().toISOString().split('T')[0];
            dateField.value = today;
        }
    }

    // إعداد التحقق من الصحة
    setupValidation() {
        const form = document.getElementById('patientForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });
    }

    // التحقق من صحة حقل واحد
    validateField(e) {
        const field = e.target;
        const fieldName = field.previousElementSibling?.textContent || field.id;
        
        // إزالة علامات الخطأ السابقة
        field.classList.remove('is-invalid');
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.markFieldAsInvalid(field, `${fieldName} مطلوب`);
            return false;
        }
        
        // تحققات خاصة
        switch (field.type) {
            case 'email':
                if (field.value && !this.isValidEmail(field.value)) {
                    this.markFieldAsInvalid(field, 'البريد الإلكتروني غير صحيح');
                    return false;
                }
                break;
            case 'tel':
                if (field.value && !this.isValidPhone(field.value)) {
                    this.markFieldAsInvalid(field, 'رقم الهاتف غير صحيح');
                    return false;
                }
                break;
            case 'number':
                if (field.id === 'age') {
                    const age = parseInt(field.value);
                    if (age < 0 || age > 150) {
                        this.markFieldAsInvalid(field, 'العمر غير صحيح');
                        return false;
                    }
                }
                break;
        }
        
        field.classList.add('is-valid');
        return true;
    }

    // وضع علامة على الحقل كخطأ
    markFieldAsInvalid(field, message) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        // إضافة رسالة الخطأ
        let feedback = field.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            field.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    }

    // إزالة علامة الخطأ
    clearFieldError(e) {
        const field = e.target;
        field.classList.remove('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    // التحقق من صحة البريد الإلكتروني
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // التحقق من صحة رقم الهاتف
    isValidPhone(phone) {
        const phoneRegex = /^0\d{2}-\d{7}$|^0\d{9}$/;
        return phoneRegex.test(phone);
    }

    // تفعيل زر الطباعة
    enablePrintButton() {
        const printBtn = document.getElementById('printPrescription');
        if (printBtn) {
            printBtn.disabled = false;
            printBtn.classList.remove('btn-secondary');
            printBtn.classList.add('btn-success');
        }
    }

    // إعادة تعيين النموذج
    resetForm() {
        const form = document.getElementById('patientForm');
        form.reset();
        
        // إعادة تعيين التاريخ الافتراضي
        this.setDefaultDate();
        
        // إعادة تعيين الأزرار
        const printBtn = document.getElementById('printPrescription');
        if (printBtn) {
            printBtn.disabled = true;
            printBtn.classList.remove('btn-success');
            printBtn.classList.add('btn-secondary');
        }
        
        // إزالة رسائل النجاح والخطأ
        this.hideMessages();
        
        this.currentPatient = null;
    }

    // إظهار حالة التحميل
    showLoading(show) {
        const submitBtn = document.querySelector('button[type="submit"]');
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري الحفظ...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>حفظ المريض';
        }
    }

    // إظهار رسالة نجاح
    showSuccess(message) {
        const alert = document.getElementById('successAlert');
        if (alert) {
            alert.textContent = message;
            alert.classList.remove('d-none');
            
            setTimeout(() => {
                alert.classList.add('d-none');
            }, 5000);
        }
    }

    // إظهار رسالة خطأ
    showError(message) {
        const alert = document.getElementById('errorAlert');
        if (alert) {
            alert.textContent = message;
            alert.classList.remove('d-none');
            
            setTimeout(() => {
                alert.classList.add('d-none');
            }, 5000);
        }
    }

    // إظهار رسالة معلوماتية
    showInfo(message) {
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed bottom-0 end-0 m-3';
        toast.innerHTML = `
            <div class="toast-header bg-info text-white">
                <i class="fas fa-info-circle me-2"></i>
                <strong class="me-auto">معلومة</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    // إخفاء الرسائل
    hideMessages() {
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        
        if (successAlert) successAlert.classList.add('d-none');
        if (errorAlert) errorAlert.classList.add('d-none');
    }
}

// تهيئة مدير المرضى عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const patientManager = new PatientManager();
    
    // تصدير للاستخدام العام
    window.patientManager = patientManager;
    window.resetForm = () => patientManager.resetForm();
    window.printPrescriptionPage = () => patientManager.printPrescriptionPage();
});