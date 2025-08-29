// إدارة الصيدلية - مستشفى الوحدة درنة

class PharmacyManager {
    constructor() {
        this.medicines = this.loadMedicines();
        this.selectedMedicines = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentDispenseMedicine = null;
        this.init();
    }

    init() {
        this.displayMedicines();
        this.updateStatistics();
        this.bindEvents();
        this.checkExpiredMedicines();
        this.checkLowStock();
    }

    // تحميل الأدوية من التخزين المحلي
    loadMedicines() {
        const defaultMedicines = [
            {
                id: 1,
                name: 'باراسيتامول 500مج',
                scientificName: 'Paracetamol',
                category: 'painkillers',
                manufacturer: 'pharma1',
                quantity: 150,
                minStock: 20,
                price: 2.5,
                expiryDate: '2025-06-15',
                batchNumber: 'PCM2024001',
                description: 'مسكن للألم وخافض للحرارة',
                instructions: 'قرص واحد كل 6 ساعات عند الحاجة',
                addedAt: new Date('2024-01-15').toISOString(),
                addedBy: 'أحمد محمود'
            },
            {
                id: 2,
                name: 'أموكسيسيللين 250مج',
                scientificName: 'Amoxicillin',
                category: 'antibiotics',
                manufacturer: 'pharma2',
                quantity: 8,
                minStock: 15,
                price: 12.0,
                expiryDate: '2024-12-30',
                batchNumber: 'AMX2024002',
                description: 'مضاد حيوي واسع المدى',
                instructions: 'كبسولة واحدة كل 8 ساعات لمدة أسبوع',
                addedAt: new Date('2024-01-10').toISOString(),
                addedBy: 'سارة محمود'
            },
            {
                id: 3,
                name: 'فيتامين د 1000 وحدة',
                scientificName: 'Vitamin D3',
                category: 'vitamins',
                manufacturer: 'pharma3',
                quantity: 200,
                minStock: 30,
                price: 8.5,
                expiryDate: '2026-01-20',
                batchNumber: 'VD32024003',
                description: 'مكمل فيتامين د للعظام',
                instructions: 'قرص واحد يومياً مع الطعام',
                addedAt: new Date('2024-01-20').toISOString(),
                addedBy: 'أحمد محمود'
            },
            {
                id: 4,
                name: 'أسبرين 100مج',
                scientificName: 'Aspirin',
                category: 'cardiac',
                manufacturer: 'pharma1',
                quantity: 5,
                minStock: 10,
                price: 1.8,
                expiryDate: '2024-03-15',
                batchNumber: 'ASP2024004',
                description: 'مضاد للتجلط ومسكن للألم',
                instructions: 'قرص واحد يومياً بعد الطعام',
                addedAt: new Date('2024-01-05').toISOString(),
                addedBy: 'فاطمة علي'
            },
            {
                id: 5,
                name: 'ميتفورمين 500مج',
                scientificName: 'Metformin',
                category: 'diabetes',
                manufacturer: 'pharma2',
                quantity: 75,
                minStock: 25,
                price: 15.0,
                expiryDate: '2025-09-10',
                batchNumber: 'MET2024005',
                description: 'دواء السكري من النوع الثاني',
                instructions: 'قرص واحد مع كل وجبة',
                addedAt: new Date('2024-01-12').toISOString(),
                addedBy: 'أحمد محمود'
            }
        ];

        const savedMedicines = localStorage.getItem('hospitalMedicines');
        return savedMedicines ? JSON.parse(savedMedicines) : defaultMedicines;
    }

    // حفظ الأدوية
    saveMedicines() {
        localStorage.setItem('hospitalMedicines', JSON.stringify(this.medicines));
    }

    // عرض الأدوية
    displayMedicines(filteredMedicines = null) {
        const medicinesToShow = filteredMedicines || this.medicines;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentMedicines = medicinesToShow.slice(startIndex, endIndex);

        const tbody = document.getElementById('medicinesTableBody');
        
        if (currentMedicines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="fas fa-pills fa-3x mb-3"></i>
                        <p>لا توجد أدوية متاحة</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = currentMedicines.map(medicine => {
            const stockStatus = this.getStockStatus(medicine);
            const expiryStatus = this.getExpiryStatus(medicine);
            
            return `
                <tr data-medicine-id="${medicine.id}" class="${stockStatus.class}">
                    <td>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${medicine.id}" 
                                   onchange="pharmacyManager.toggleMedicineSelection(${medicine.id})">
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>${medicine.name}</strong>
                            <br>
                            <small class="text-muted">${medicine.scientificName}</small>
                            <br>
                            <small class="text-info">التشغيلة: ${medicine.batchNumber}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-secondary">${this.getCategoryInArabic(medicine.category)}</span>
                    </td>
                    <td>
                        <span class="fw-bold ${stockStatus.textClass}">${medicine.quantity}</span>
                        <small class="text-muted d-block">الحد الأدنى: ${medicine.minStock}</small>
                    </td>
                    <td>
                        <span class="fw-bold">${medicine.price} د.ل</span>
                    </td>
                    <td>
                        <span class="${expiryStatus.class}">${this.formatDate(medicine.expiryDate)}</span>
                        <small class="text-muted d-block">${expiryStatus.message}</small>
                    </td>
                    <td>
                        <span class="badge ${stockStatus.badge}">${stockStatus.text}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-info" onclick="pharmacyManager.viewMedicine(${medicine.id})" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-primary" onclick="pharmacyManager.showDispenseModal(${medicine.id})" 
                                    title="صرف دواء" ${medicine.quantity === 0 ? 'disabled' : ''}>
                                <i class="fas fa-hand-holding-medical"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="pharmacyManager.editMedicine(${medicine.id})" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="pharmacyManager.deleteMedicine(${medicine.id})" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.updatePagination(medicinesToShow.length);
    }

    // ربط الأحداث
    bindEvents() {
        // إضافة دواء جديد
        document.getElementById('addMedicineForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMedicine();
        });

        // صرف دواء
        document.getElementById('dispenseMedicineForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.dispenseMedicine();
        });

        // البحث والتصفية
        document.getElementById('searchMedicine').addEventListener('input', () => {
            this.searchMedicines();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.searchMedicines();
        });

        document.getElementById('filterStatus').addEventListener('change', () => {
            this.searchMedicines();
        });

        document.getElementById('filterManufacturer').addEventListener('change', () => {
            this.searchMedicines();
        });
    }

    // إضافة دواء جديد
    addMedicine() {
        const formData = {
            name: document.getElementById('medicineName').value.trim(),
            scientificName: document.getElementById('scientificName').value.trim(),
            category: document.getElementById('category').value,
            manufacturer: document.getElementById('manufacturer').value,
            quantity: parseInt(document.getElementById('quantity').value),
            minStock: parseInt(document.getElementById('minStock').value) || 10,
            price: parseFloat(document.getElementById('price').value) || 0,
            expiryDate: document.getElementById('expiryDate').value,
            batchNumber: document.getElementById('batchNumber').value.trim(),
            description: document.getElementById('description').value.trim(),
            instructions: document.getElementById('instructions').value.trim()
        };

        // التحقق من صحة البيانات
        if (!this.validateMedicineData(formData)) {
            return;
        }

        // إنشاء الدواء الجديد
        const newMedicine = {
            id: Date.now(),
            ...formData,
            addedAt: new Date().toISOString(),
            addedBy: getCurrentUser()?.name || 'النظام'
        };

        this.medicines.push(newMedicine);
        this.saveMedicines();
        this.displayMedicines();
        this.updateStatistics();
        
        // إعادة تعيين النموذج
        document.getElementById('addMedicineForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addMedicineModal')).hide();
        
        this.logActivity('add_medicine', `تم إضافة الدواء: ${newMedicine.name}`);
        this.showSuccess(`تم إضافة الدواء "${newMedicine.name}" بنجاح`);
    }

    // صرف دواء
    dispenseMedicine() {
        if (!this.currentDispenseMedicine) return;

        const quantity = parseInt(document.getElementById('dispenseQuantity').value);
        const patientName = document.getElementById('patientName').value.trim();
        const doctorName = document.getElementById('doctorName').value.trim();
        const notes = document.getElementById('dispenseNotes').value.trim();

        const medicine = this.medicines.find(m => m.id === this.currentDispenseMedicine);
        
        if (!medicine) {
            this.showError('الدواء غير موجود');
            return;
        }

        if (quantity > medicine.quantity) {
            this.showError('الكمية المطلوبة أكبر من المخزون المتاح');
            return;
        }

        // تقليل المخزون
        medicine.quantity -= quantity;

        // تسجيل عملية الصرف
        const dispenseRecord = {
            id: Date.now(),
            medicineId: medicine.id,
            medicineName: medicine.name,
            quantity: quantity,
            patientName: patientName,
            doctorName: doctorName,
            notes: notes,
            dispensedBy: getCurrentUser()?.name || 'النظام',
            dispensedAt: new Date().toISOString()
        };

        const dispensingHistory = JSON.parse(localStorage.getItem('hospitalDispensing') || '[]');
        dispensingHistory.push(dispenseRecord);
        localStorage.setItem('hospitalDispensing', JSON.stringify(dispensingHistory));

        this.saveMedicines();
        this.displayMedicines();
        this.updateStatistics();

        // إعادة تعيين النموذج
        document.getElementById('dispenseMedicineForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('dispenseMedicineModal')).hide();
        
        this.logActivity('dispense_medicine', `تم صرف ${quantity} من ${medicine.name} للمريض: ${patientName}`);
        this.showSuccess(`تم صرف ${quantity} من "${medicine.name}" بنجاح`);
        
        // تحقق من المخزون المنخفض
        if (medicine.quantity <= medicine.minStock) {
            this.showWarning(`تحذير: مخزون "${medicine.name}" منخفض (${medicine.quantity} متبقي)`);
        }
    }

    // عرض modal لصرف الدواء
    showDispenseModal(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        this.currentDispenseMedicine = medicineId;
        
        document.getElementById('dispenseMedicineName').value = medicine.name;
        document.getElementById('availableStock').value = `${medicine.quantity} وحدة`;
        document.getElementById('dispenseQuantity').max = medicine.quantity;
        
        new bootstrap.Modal(document.getElementById('dispenseMedicineModal')).show();
    }

    // البحث والتصفية
    searchMedicines() {
        const searchTerm = document.getElementById('searchMedicine').value.toLowerCase().trim();
        const categoryFilter = document.getElementById('filterCategory').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const manufacturerFilter = document.getElementById('filterManufacturer').value;

        let filteredMedicines = this.medicines;

        // تصفية النص
        if (searchTerm) {
            filteredMedicines = filteredMedicines.filter(medicine =>
                medicine.name.toLowerCase().includes(searchTerm) ||
                medicine.scientificName.toLowerCase().includes(searchTerm) ||
                medicine.batchNumber.toLowerCase().includes(searchTerm)
            );
        }

        // تصفية الفئة
        if (categoryFilter) {
            filteredMedicines = filteredMedicines.filter(medicine =>
                medicine.category === categoryFilter
            );
        }

        // تصفية الحالة
        if (statusFilter) {
            filteredMedicines = filteredMedicines.filter(medicine => {
                const status = this.getStockStatus(medicine);
                return status.key === statusFilter;
            });
        }

        // تصفية الشركة المصنعة
        if (manufacturerFilter) {
            filteredMedicines = filteredMedicines.filter(medicine =>
                medicine.manufacturer === manufacturerFilter
            );
        }

        this.currentPage = 1; // إعادة تعيين الصفحة
        this.displayMedicines(filteredMedicines);
    }

    // التحقق من صحة بيانات الدواء
    validateMedicineData(data) {
        if (!data.name || data.name.length < 2) {
            this.showError('اسم الدواء يجب أن يكون على الأقل حرفين');
            return false;
        }

        if (!data.category) {
            this.showError('يرجى اختيار فئة الدواء');
            return false;
        }

        if (!data.manufacturer) {
            this.showError('يرجى اختيار الشركة المصنعة');
            return false;
        }

        if (data.quantity < 0) {
            this.showError('الكمية يجب أن تكون أكبر من صفر');
            return false;
        }

        if (!data.expiryDate) {
            this.showError('يرجى تحديد تاريخ الصلاحية');
            return false;
        }

        const expiryDate = new Date(data.expiryDate);
        const today = new Date();
        if (expiryDate <= today) {
            this.showError('تاريخ الصلاحية يجب أن يكون في المستقبل');
            return false;
        }

        return true;
    }

    // تحديث الإحصائيات
    updateStatistics() {
        const totalMedicines = this.medicines.length;
        const lowStockMedicines = this.medicines.filter(m => 
            m.quantity <= m.minStock && m.quantity > 0
        ).length;
        const expiredMedicines = this.medicines.filter(m => 
            new Date(m.expiryDate) <= new Date()
        ).length;

        // حساب الأدوية المصروفة اليوم
        const today = new Date().toDateString();
        const dispensingHistory = JSON.parse(localStorage.getItem('hospitalDispensing') || '[]');
        const todayDispensed = dispensingHistory.filter(record => 
            new Date(record.dispensedAt).toDateString() === today
        ).reduce((total, record) => total + record.quantity, 0);

        document.getElementById('totalMedicines').textContent = totalMedicines;
        document.getElementById('lowStockCount').textContent = lowStockMedicines;
        document.getElementById('expiredCount').textContent = expiredMedicines;
        document.getElementById('todayDispensed').textContent = todayDispensed;
    }

    // التحقق من الأدوية المنتهية الصلاحية
    checkExpiredMedicines() {
        const expiredMedicines = this.medicines.filter(medicine => 
            new Date(medicine.expiryDate) <= new Date()
        );

        if (expiredMedicines.length > 0) {
            this.showWarning(`تحذير: هناك ${expiredMedicines.length} دواء منتهي الصلاحية`);
        }
    }

    // التحقق من المخزون المنخفض
    checkLowStock() {
        const lowStockMedicines = this.medicines.filter(medicine => 
            medicine.quantity <= medicine.minStock && medicine.quantity > 0
        );

        if (lowStockMedicines.length > 0) {
            this.showWarning(`تنبيه: هناك ${lowStockMedicines.length} دواء بمخزون منخفض`);
        }
    }

    // تحديد/إلغاء تحديد دواء
    toggleMedicineSelection(medicineId) {
        const index = this.selectedMedicines.indexOf(medicineId);
        if (index > -1) {
            this.selectedMedicines.splice(index, 1);
        } else {
            this.selectedMedicines.push(medicineId);
        }

        this.updateSelectAllCheckbox();
        this.updateActionButtons();
    }

    // تحديد/إلغاء تحديد الجميع
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const medicineCheckboxes = document.querySelectorAll('#medicinesTableBody input[type="checkbox"]');

        if (selectAllCheckbox.checked) {
            this.selectedMedicines = Array.from(medicineCheckboxes).map(cb => parseInt(cb.value));
            medicineCheckboxes.forEach(cb => cb.checked = true);
        } else {
            this.selectedMedicines = [];
            medicineCheckboxes.forEach(cb => cb.checked = false);
        }

        this.updateActionButtons();
    }

    // تحديث حالة checkbox تحديد الجميع
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const medicineCheckboxes = document.querySelectorAll('#medicinesTableBody input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('#medicinesTableBody input[type="checkbox"]:checked');

        if (checkedBoxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === medicineCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // تحديث حالة أزرار العمليات
    updateActionButtons() {
        const hasSelection = this.selectedMedicines.length > 0;
        document.getElementById('deleteBtn').disabled = !hasSelection;
    }

    // حذف الأدوية المحددة
    deleteSelected() {
        if (this.selectedMedicines.length === 0) {
            this.showWarning('يرجى تحديد الأدوية المراد حذفها');
            return;
        }

        const confirmMessage = `هل تريد حذف ${this.selectedMedicines.length} دواء محدد؟`;
        if (confirm(confirmMessage)) {
            this.selectedMedicines.forEach(medicineId => {
                const medicine = this.medicines.find(m => m.id === medicineId);
                if (medicine) {
                    // نقل إلى سلة المحذوفات
                    if (window.trashManager) {
                        window.trashManager.addToTrash(
                            'medicine',
                            medicine.id,
                            medicine.name,
                            `دواء - ${this.getCategoryInArabic(medicine.category)} - الكمية: ${medicine.quantity}`,
                            medicine
                        );
                    }
                }
            });

            // حذف الأدوية
            this.medicines = this.medicines.filter(m => !this.selectedMedicines.includes(m.id));
            this.selectedMedicines = [];

            this.saveMedicines();
            this.displayMedicines();
            this.updateStatistics();
            
            this.logActivity('delete_medicines', `تم حذف ${this.selectedMedicines.length} دواء`);
            this.showSuccess('تم حذف الأدوية المحددة بنجاح');
        }
    }

    // حذف دواء واحد
    deleteMedicine(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        if (confirm(`هل تريد حذف الدواء "${medicine.name}"؟`)) {
            // نقل إلى سلة المحذوفات
            if (window.trashManager) {
                window.trashManager.addToTrash(
                    'medicine',
                    medicine.id,
                    medicine.name,
                    `دواء - ${this.getCategoryInArabic(medicine.category)} - الكمية: ${medicine.quantity}`,
                    medicine
                );
            }

            this.medicines = this.medicines.filter(m => m.id !== medicineId);
            this.saveMedicines();
            this.displayMedicines();
            this.updateStatistics();
            
            this.logActivity('delete_medicine', `تم حذف الدواء: ${medicine.name}`);
            this.showSuccess(`تم حذف الدواء "${medicine.name}" بنجاح`);
        }
    }

    // عرض تفاصيل الدواء
    viewMedicine(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        if (!medicine) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-pills me-2"></i>
                            تفاصيل الدواء: ${medicine.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <table class="table table-borderless">
                                    <tr>
                                        <td><strong>الاسم التجاري:</strong></td>
                                        <td>${medicine.name}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>الاسم العلمي:</strong></td>
                                        <td>${medicine.scientificName || 'غير محدد'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>الفئة:</strong></td>
                                        <td><span class="badge bg-secondary">${this.getCategoryInArabic(medicine.category)}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>الشركة المصنعة:</strong></td>
                                        <td>${this.getManufacturerInArabic(medicine.manufacturer)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>رقم التشغيلة:</strong></td>
                                        <td>${medicine.batchNumber || 'غير محدد'}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-borderless">
                                    <tr>
                                        <td><strong>الكمية المتاحة:</strong></td>
                                        <td><span class="fw-bold text-primary">${medicine.quantity}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>الحد الأدنى:</strong></td>
                                        <td>${medicine.minStock}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>السعر:</strong></td>
                                        <td>${medicine.price} د.ل</td>
                                    </tr>
                                    <tr>
                                        <td><strong>تاريخ الصلاحية:</strong></td>
                                        <td>${this.formatDate(medicine.expiryDate)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>أضيف بواسطة:</strong></td>
                                        <td>${medicine.addedBy}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        ${medicine.description ? `
                            <div class="mt-3">
                                <h6>الوصف:</h6>
                                <p>${medicine.description}</p>
                            </div>
                        ` : ''}
                        ${medicine.instructions ? `
                            <div class="mt-3">
                                <h6>تعليمات الاستخدام:</h6>
                                <p class="bg-light p-3 rounded">${medicine.instructions}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-primary" onclick="pharmacyManager.showDispenseModal(${medicine.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                            <i class="fas fa-hand-holding-medical me-2"></i>صرف دواء
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    // تحديث الترقيم
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // الصفحة السابقة
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="pharmacyManager.changePage(${this.currentPage - 1})">السابق</a>
            </li>
        `;

        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="pharmacyManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // الصفحة التالية
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="pharmacyManager.changePage(${this.currentPage + 1})">التالي</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // تغيير الصفحة
    changePage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.displayMedicines();
    }

    // دوال مساعدة
    getStockStatus(medicine) {
        if (medicine.quantity === 0) {
            return {
                key: 'out_of_stock',
                text: 'نفد المخزون',
                badge: 'bg-danger',
                class: 'table-danger',
                textClass: 'text-danger'
            };
        } else if (medicine.quantity <= medicine.minStock) {
            return {
                key: 'low_stock',
                text: 'مخزون منخفض',
                badge: 'bg-warning',
                class: 'table-warning',
                textClass: 'text-warning'
            };
        } else {
            return {
                key: 'available',
                text: 'متوفر',
                badge: 'bg-success',
                class: '',
                textClass: 'text-success'
            };
        }
    }

    getExpiryStatus(medicine) {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                class: 'text-danger fw-bold',
                message: 'منتهي الصلاحية'
            };
        } else if (diffDays <= 30) {
            return {
                class: 'text-warning fw-bold',
                message: `ينتهي خلال ${diffDays} يوم`
            };
        } else {
            return {
                class: 'text-success',
                message: `صالح لـ ${diffDays} يوم`
            };
        }
    }

    getCategoryInArabic(category) {
        const categories = {
            antibiotics: 'مضادات حيوية',
            painkillers: 'مسكنات',
            vitamins: 'فيتامينات',
            cardiac: 'أدوية القلب',
            diabetes: 'أدوية السكري'
        };
        return categories[category] || category;
    }

    getManufacturerInArabic(manufacturer) {
        const manufacturers = {
            pharma1: 'الشركة الليبية للأدوية',
            pharma2: 'مصنع النهضة',
            pharma3: 'شركة الحكمة'
        };
        return manufacturers[manufacturer] || manufacturer;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ar-EG');
    }

    // تسجيل النشاطات
    logActivity(action, details) {
        const currentUser = getCurrentUser();
        const activity = {
            id: Date.now(),
            action: action,
            details: details,
            user: currentUser?.name || 'النظام',
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

    showWarning(message) {
        this.showAlert(message, 'warning', 'exclamation-triangle');
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

// دوال عامة
function generatePharmacyReport() {
    const report = {
        generatedAt: new Date().toISOString(),
        totalMedicines: pharmacyManager.medicines.length,
        lowStockMedicines: pharmacyManager.medicines.filter(m => m.quantity <= m.minStock).length,
        expiredMedicines: pharmacyManager.medicines.filter(m => new Date(m.expiryDate) <= new Date()).length,
        totalValue: pharmacyManager.medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0)
    };

    console.log('تقرير الصيدلية:', report);
    pharmacyManager.showInfo('تم إنشاء تقرير الصيدلية بنجاح');
}

function generateOrderList() {
    const lowStockMedicines = pharmacyManager.medicines.filter(m => 
        m.quantity <= m.minStock && m.quantity > 0
    );

    if (lowStockMedicines.length === 0) {
        pharmacyManager.showInfo('لا توجد أدوية تحتاج إلى طلب');
        return;
    }

    console.log('قائمة الطلب:', lowStockMedicines);
    pharmacyManager.showSuccess('تم إنشاء قائمة الطلب بنجاح');
}

// تهيئة مدير الصيدلية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const pharmacyManager = new PharmacyManager();
    
    // تصدير للاستخدام العام
    window.pharmacyManager = pharmacyManager;
    window.searchMedicines = () => pharmacyManager.searchMedicines();
    window.toggleSelectAll = () => pharmacyManager.toggleSelectAll();
    window.deleteSelected = () => pharmacyManager.deleteSelected();
});