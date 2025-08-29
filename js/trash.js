// إدارة سلة المحذوفات - مستشفى الوحدة درنة

class TrashManager {
    constructor() {
        this.deletedItems = this.loadDeletedItems();
        this.selectedItems = [];
        this.currentRestoreItem = null;
        this.currentDeleteItem = null;
        this.init();
    }

    init() {
        this.displayTrashItems();
        this.updateStatistics();
        this.bindEvents();
        this.checkPermissions();
    }

    // تحميل العناصر المحذوفة من التخزين المحلي
    loadDeletedItems() {
        const defaultDeletedItems = [
            {
                id: 'patient_001',
                type: 'patient',
                name: 'محمد أحمد سالم',
                details: 'مريض - قسم الطوارئ - 35 سنة',
                deletedBy: 'أحمد محمود',
                deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // منذ يومين
                data: {
                    fullName: 'محمد أحمد سالم',
                    age: 35,
                    department: 'الطوارئ',
                    address: 'درنة - حي الفتح',
                    phone: '0917654321'
                }
            },
            {
                id: 'user_002',
                type: 'user',
                name: 'سارة محمود',
                details: 'مستخدم - ممرضة - قسم الأطفال',
                deletedBy: 'أحمد محمود',
                deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // منذ 5 أيام
                data: {
                    username: 'sara.mahmoud',
                    email: 'sara@hospital.ly',
                    role: 'nurse',
                    department: 'الأطفال'
                }
            },
            {
                id: 'department_003',
                type: 'department',
                name: 'قسم العظام',
                details: 'قسم محذوف - كان يحتوي على 8 أسرة',
                deletedBy: 'إدارة النظام',
                deletedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // منذ أسبوع
                data: {
                    name: 'قسم العظام',
                    code: 'ORTH',
                    head: 'د. عمار الطاهر',
                    beds: 8
                }
            },
            {
                id: 'backup_004',
                type: 'backup',
                name: 'backup_2024-01-01_old',
                details: 'نسخة احتياطية قديمة - 23.5MB',
                deletedBy: 'النظام التلقائي',
                deletedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // منذ 10 أيام
                data: {
                    filename: 'backup_2024-01-01_old.sql',
                    size: '23.5MB',
                    createdAt: '2024-01-01'
                }
            },
            {
                id: 'medicine_005',
                type: 'medicine',
                name: 'أسبرين 100مج',
                details: 'دواء - أدوية القلب - الكمية: 50',
                deletedBy: 'أحمد محمود',
                deletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // منذ 3 أيام
                data: {
                    name: 'أسبرين 100مج',
                    scientificName: 'Aspirin',
                    category: 'cardiac',
                    quantity: 50,
                    price: 1.8,
                    manufacturer: 'pharma1'
                }
            },
            {
                id: 'lab_test_006',
                type: 'lab_test',
                name: 'تحليل دم شامل - محمد أحمد',
                details: 'فحص مختبري - تحليل دم - الحالة: معلق',
                deletedBy: 'سارة محمود',
                deletedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // منذ يوم
                data: {
                    patientName: 'محمد أحمد',
                    testType: 'blood',
                    testName: 'تحليل دم شامل',
                    requestingDoctor: 'د. أحمد المهدي',
                    status: 'pending'
                }
            }
        ];

        const savedItems = localStorage.getItem('hospitalTrashItems');
        return savedItems ? JSON.parse(savedItems) : defaultDeletedItems;
    }

    // حفظ العناصر المحذوفة
    saveDeletedItems() {
        localStorage.setItem('hospitalTrashItems', JSON.stringify(this.deletedItems));
    }

    // عرض العناصر المحذوفة
    displayTrashItems(filteredItems = null) {
        const itemsToShow = filteredItems || this.deletedItems;
        const trashItemsContainer = document.getElementById('trashItems');
        const trashEmptyContainer = document.getElementById('trashEmpty');

        if (itemsToShow.length === 0) {
            trashItemsContainer.style.display = 'none';
            trashEmptyContainer.style.display = 'block';
            this.updateButtonStates(false);
            return;
        }

        trashEmptyContainer.style.display = 'none';
        trashItemsContainer.style.display = 'block';
        this.updateButtonStates(true);

        trashItemsContainer.innerHTML = itemsToShow.map(item => this.createTrashItemHTML(item)).join('');
    }

    // إنشاء HTML للعنصر المحذوف
    createTrashItemHTML(item) {
        const timeAgo = this.getTimeAgo(item.deletedAt);
        const icon = this.getTypeIcon(item.type);
        const badgeColor = this.getTypeBadgeColor(item.type);

        return `
            <div class="trash-item border rounded p-3 mb-3" data-id="${item.id}" data-type="${item.type}">
                <div class="row align-items-center">
                    <div class="col-md-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${item.id}" 
                                   onchange="trashManager.toggleItemSelection('${item.id}')">
                        </div>
                    </div>
                    <div class="col-md-1">
                        <i class="fas ${icon} fa-2x text-${badgeColor}"></i>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex align-items-center mb-2">
                            <h6 class="mb-0 me-2">${item.name}</h6>
                            <span class="badge bg-${badgeColor}">${this.getTypeNameInArabic(item.type)}</span>
                        </div>
                        <p class="mb-1 text-muted">${item.details}</p>
                        <small class="text-muted">
                            <i class="fas fa-user me-1"></i>حُذف بواسطة: ${item.deletedBy}
                            <i class="fas fa-clock me-1 ms-3"></i>${timeAgo}
                        </small>
                    </div>
                    <div class="col-md-4">
                        <div class="btn-group btn-group-sm w-100">
                            <button class="btn btn-outline-info" onclick="trashManager.viewItemDetails('${item.id}')" 
                                    title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="trashManager.showRestoreModal('${item.id}')" 
                                    title="استعادة">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="trashManager.showDeleteModal('${item.id}')" 
                                    title="حذف نهائي">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ربط الأحداث
    bindEvents() {
        // البحث في سلة المحذوفات
        document.getElementById('searchTrash').addEventListener('input', (e) => {
            this.filterItems();
        });

        // تصفية حسب النوع
        document.getElementById('filterType').addEventListener('change', (e) => {
            this.filterItems();
        });

        // تصفية حسب التاريخ
        document.getElementById('filterDate').addEventListener('change', (e) => {
            this.filterItems();
        });
    }

    // تصفية العناصر
    filterItems() {
        const searchTerm = document.getElementById('searchTrash').value.toLowerCase().trim();
        const typeFilter = document.getElementById('filterType').value;
        const dateFilter = document.getElementById('filterDate').value;

        let filteredItems = this.deletedItems;

        // تصفية النص
        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.details.toLowerCase().includes(searchTerm) ||
                item.deletedBy.toLowerCase().includes(searchTerm)
            );
        }

        // تصفية النوع
        if (typeFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === typeFilter);
        }

        // تصفية التاريخ
        if (dateFilter !== 'all') {
            const now = new Date();
            filteredItems = filteredItems.filter(item => {
                const deletedDate = new Date(item.deletedAt);
                const diffTime = now - deletedDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case 'today':
                        return diffDays <= 1;
                    case 'week':
                        return diffDays <= 7;
                    case 'month':
                        return diffDays <= 30;
                    default:
                        return true;
                }
            });
        }

        this.displayTrashItems(filteredItems);
    }

    // تحديد/إلغاء تحديد عنصر
    toggleItemSelection(itemId) {
        const index = this.selectedItems.indexOf(itemId);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
        } else {
            this.selectedItems.push(itemId);
        }

        this.updateSelectAllCheckbox();
        this.updateActionButtons();
    }

    // تحديد/إلغاء تحديد الجميع
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllTrash');
        const itemCheckboxes = document.querySelectorAll('.trash-item input[type="checkbox"]');

        if (selectAllCheckbox.checked) {
            this.selectedItems = Array.from(itemCheckboxes).map(cb => cb.value);
            itemCheckboxes.forEach(cb => cb.checked = true);
        } else {
            this.selectedItems = [];
            itemCheckboxes.forEach(cb => cb.checked = false);
        }

        this.updateActionButtons();
    }

    // تحديث حالة checkbox تحديد الجميع
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllTrash');
        const itemCheckboxes = document.querySelectorAll('.trash-item input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('.trash-item input[type="checkbox"]:checked');

        if (checkedBoxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === itemCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // تحديث حالة أزرار العمليات
    updateActionButtons() {
        const hasSelection = this.selectedItems.length > 0;
        document.getElementById('restoreAllBtn').disabled = !hasSelection;
        document.getElementById('emptyTrashBtn').disabled = this.deletedItems.length === 0;
    }

    // تحديث حالة الأزرار بناء على وجود عناصر
    updateButtonStates(hasItems) {
        document.getElementById('restoreAllBtn').disabled = !hasItems || this.selectedItems.length === 0;
        document.getElementById('emptyTrashBtn').disabled = !hasItems;
    }

    // عرض modal الاستعادة
    showRestoreModal(itemId) {
        const item = this.deletedItems.find(i => i.id === itemId);
        if (item) {
            this.currentRestoreItem = item;
            document.getElementById('restoreItemName').textContent = `${item.name} (${this.getTypeNameInArabic(item.type)})`;
            new bootstrap.Modal(document.getElementById('restoreModal')).show();
        }
    }

    // عرض modal الحذف النهائي
    showDeleteModal(itemId) {
        const item = this.deletedItems.find(i => i.id === itemId);
        if (item) {
            this.currentDeleteItem = item;
            document.getElementById('deleteItemName').textContent = `${item.name} (${this.getTypeNameInArabic(item.type)})`;
            new bootstrap.Modal(document.getElementById('deleteModal')).show();
        }
    }

    // تأكيد الاستعادة
    confirmRestore() {
        if (this.currentRestoreItem) {
            this.restoreItem(this.currentRestoreItem.id);
            bootstrap.Modal.getInstance(document.getElementById('restoreModal')).hide();
            this.currentRestoreItem = null;
        }
    }

    // تأكيد الحذف النهائي
    confirmDelete() {
        if (this.currentDeleteItem) {
            this.deleteItemPermanently(this.currentDeleteItem.id);
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            this.currentDeleteItem = null;
        }
    }

    // استعادة عنصر
    restoreItem(itemId) {
        const item = this.deletedItems.find(i => i.id === itemId);
        if (!item) return;

        // استعادة العنصر إلى مكانه الأصلي
        switch (item.type) {
            case 'patient':
                this.restorePatient(item);
                break;
            case 'user':
                this.restoreUser(item);
                break;
            case 'department':
                this.restoreDepartment(item);
                break;
            case 'backup':
                this.restoreBackup(item);
                break;
            case 'medicine':
                this.restoreMedicine(item);
                break;
            case 'lab_test':
                this.restoreLabTest(item);
                break;
        }

        // إزالة العنصر من سلة المحذوفات
        this.deletedItems = this.deletedItems.filter(i => i.id !== itemId);
        this.selectedItems = this.selectedItems.filter(id => id !== itemId);

        this.saveDeletedItems();
        this.displayTrashItems();
        this.updateStatistics();
        this.logActivity('restore', `تم استعادة ${this.getTypeNameInArabic(item.type)}: ${item.name}`);
        this.showSuccess(`تم استعادة ${item.name} بنجاح`);
    }

    // استعادة مريض
    restorePatient(item) {
        const patients = JSON.parse(localStorage.getItem('hospitalPatients') || '[]');
        const restoredPatient = {
            id: item.id.replace('patient_', ''),
            ...item.data,
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser()?.name || 'النظام'
        };
        patients.push(restoredPatient);
        localStorage.setItem('hospitalPatients', JSON.stringify(patients));
    }

    // استعادة مستخدم
    restoreUser(item) {
        const users = JSON.parse(localStorage.getItem('hospitalUsers') || '[]');
        const restoredUser = {
            id: item.id.replace('user_', ''),
            ...item.data,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        users.push(restoredUser);
        localStorage.setItem('hospitalUsers', JSON.stringify(users));
    }

    // استعادة قسم
    restoreDepartment(item) {
        const departments = JSON.parse(localStorage.getItem('hospitalDepartments') || '[]');
        const restoredDepartment = {
            id: parseInt(item.id.replace('department_', '')),
            ...item.data,
            status: 'active'
        };
        departments.push(restoredDepartment);
        localStorage.setItem('hospitalDepartments', JSON.stringify(departments));
    }

    // استعادة نسخة احتياطية
    restoreBackup(item) {
        const backups = JSON.parse(localStorage.getItem('hospitalBackups') || '[]');
        const restoredBackup = {
            name: item.data.filename,
            ...item.data,
            restoredAt: new Date().toISOString()
        };
        backups.push(restoredBackup);
        localStorage.setItem('hospitalBackups', JSON.stringify(backups));
    }

    // استعادة دواء
    restoreMedicine(item) {
        const medicines = JSON.parse(localStorage.getItem('hospitalMedicines') || '[]');
        const restoredMedicine = {
            id: parseInt(item.id.replace('medicine_', '')),
            ...item.data,
            restoredAt: new Date().toISOString(),
            restoredBy: getCurrentUser()?.name || 'النظام'
        };
        medicines.push(restoredMedicine);
        localStorage.setItem('hospitalMedicines', JSON.stringify(medicines));
    }

    // استعادة فحص مختبري
    restoreLabTest(item) {
        const labTests = JSON.parse(localStorage.getItem('hospitalLabTests') || '[]');
        const restoredTest = {
            id: parseInt(item.id.replace('lab_test_', '')),
            ...item.data,
            restoredAt: new Date().toISOString(),
            restoredBy: getCurrentUser()?.name || 'النظام'
        };
        labTests.push(restoredTest);
        localStorage.setItem('hospitalLabTests', JSON.stringify(labTests));
    }

    // حذف عنصر نهائياً
    deleteItemPermanently(itemId) {
        const item = this.deletedItems.find(i => i.id === itemId);
        if (!item) return;

        this.deletedItems = this.deletedItems.filter(i => i.id !== itemId);
        this.selectedItems = this.selectedItems.filter(id => id !== itemId);

        this.saveDeletedItems();
        this.displayTrashItems();
        this.updateStatistics();
        this.logActivity('permanent_delete', `تم حذف ${this.getTypeNameInArabic(item.type)}: ${item.name} نهائياً`);
        this.showSuccess(`تم حذف ${item.name} نهائياً`);
    }

    // استعادة العناصر المحددة
    restoreAll() {
        if (this.selectedItems.length === 0) {
            this.showWarning('يرجى تحديد العناصر المراد استعادتها');
            return;
        }

        const confirmMessage = `هل تريد استعادة ${this.selectedItems.length} عنصر محدد؟`;
        if (confirm(confirmMessage)) {
            const itemsToRestore = [...this.selectedItems];
            let restoredCount = 0;

            itemsToRestore.forEach(itemId => {
                this.restoreItem(itemId);
                restoredCount++;
            });

            this.showSuccess(`تم استعادة ${restoredCount} عنصر بنجاح`);
        }
    }

    // إفراغ سلة المحذوفات
    emptyTrash() {
        if (this.deletedItems.length === 0) {
            this.showWarning('سلة المحذوفات فارغة بالفعل');
            return;
        }

        const confirmMessage = `هل أنت متأكد من حذف جميع العناصر (${this.deletedItems.length}) نهائياً؟\nهذا الإجراء لا يمكن التراجع عنه!`;
        if (confirm(confirmMessage)) {
            const deletedCount = this.deletedItems.length;
            this.deletedItems = [];
            this.selectedItems = [];

            this.saveDeletedItems();
            this.displayTrashItems();
            this.updateStatistics();
            this.logActivity('empty_trash', `تم إفراغ سلة المحذوفات (${deletedCount} عنصر)`);
            this.showSuccess(`تم حذف ${deletedCount} عنصر نهائياً`);
        }
    }

    // عرض تفاصيل العنصر
    viewItemDetails(itemId) {
        const item = this.deletedItems.find(i => i.id === itemId);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas ${this.getTypeIcon(item.type)} me-2"></i>
                            تفاصيل ${this.getTypeNameInArabic(item.type)}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${this.generateItemDetailsHTML(item)}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-success" onclick="trashManager.restoreItem('${item.id}'); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                            <i class="fas fa-undo me-2"></i>استعادة
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

    // إنشاء HTML لتفاصيل العنصر
    generateItemDetailsHTML(item) {
        const baseInfo = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>معلومات عامة</h6>
                    <table class="table table-sm">
                        <tr>
                            <td><strong>الاسم:</strong></td>
                            <td>${item.name}</td>
                        </tr>
                        <tr>
                            <td><strong>النوع:</strong></td>
                            <td><span class="badge bg-${this.getTypeBadgeColor(item.type)}">${this.getTypeNameInArabic(item.type)}</span></td>
                        </tr>
                        <tr>
                            <td><strong>حُذف بواسطة:</strong></td>
                            <td>${item.deletedBy}</td>
                        </tr>
                        <tr>
                            <td><strong>تاريخ الحذف:</strong></td>
                            <td>${new Date(item.deletedAt).toLocaleString('ar-EG')}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>البيانات المحفوظة</h6>
                    ${this.generateSpecificDetailsHTML(item)}
                </div>
            </div>
        `;

        return baseInfo;
    }

    // إنشاء HTML للتفاصيل الخاصة بكل نوع
    generateSpecificDetailsHTML(item) {
        switch (item.type) {
            case 'patient':
                return `
                    <table class="table table-sm">
                        <tr><td><strong>العمر:</strong></td><td>${item.data.age} سنة</td></tr>
                        <tr><td><strong>القسم:</strong></td><td>${item.data.department}</td></tr>
                        <tr><td><strong>العنوان:</strong></td><td>${item.data.address}</td></tr>
                        <tr><td><strong>الهاتف:</strong></td><td>${item.data.phone}</td></tr>
                    </table>
                `;
            case 'user':
                return `
                    <table class="table table-sm">
                        <tr><td><strong>اسم المستخدم:</strong></td><td>${item.data.username}</td></tr>
                        <tr><td><strong>البريد:</strong></td><td>${item.data.email}</td></tr>
                        <tr><td><strong>الدور:</strong></td><td>${this.getRoleNameInArabic(item.data.role)}</td></tr>
                        <tr><td><strong>القسم:</strong></td><td>${item.data.department}</td></tr>
                    </table>
                `;
            case 'department':
                return `
                    <table class="table table-sm">
                        <tr><td><strong>الرمز:</strong></td><td>${item.data.code}</td></tr>
                        <tr><td><strong>المسؤول:</strong></td><td>${item.data.head}</td></tr>
                        <tr><td><strong>عدد الأسرة:</strong></td><td>${item.data.beds}</td></tr>
                    </table>
                `;
            case 'backup':
                return `
                    <table class="table table-sm">
                        <tr><td><strong>اسم الملف:</strong></td><td>${item.data.filename}</td></tr>
                        <tr><td><strong>الحجم:</strong></td><td>${item.data.size}</td></tr>
                        <tr><td><strong>تاريخ الإنشاء:</strong></td><td>${item.data.createdAt}</td></tr>
                    </table>
                `;
            default:
                return '<p class="text-muted">لا توجد تفاصيل إضافية</p>';
        }
    }

    // تحديث الإحصائيات
    updateStatistics() {
        const stats = {
            patients: this.deletedItems.filter(item => item.type === 'patient').length,
            users: this.deletedItems.filter(item => item.type === 'user').length,
            departments: this.deletedItems.filter(item => item.type === 'department').length,
            medicines: this.deletedItems.filter(item => item.type === 'medicine').length,
            labTests: this.deletedItems.filter(item => item.type === 'lab_test').length,
            backups: this.deletedItems.filter(item => item.type === 'backup').length
        };

        document.getElementById('deletedPatientsCount').textContent = stats.patients;
        document.getElementById('deletedUsersCount').textContent = stats.users;
        document.getElementById('deletedDepartmentsCount').textContent = stats.departments;
        if (document.getElementById('deletedMedicinesCount')) {
            document.getElementById('deletedMedicinesCount').textContent = stats.medicines;
        }
        if (document.getElementById('deletedLabTestsCount')) {
            document.getElementById('deletedLabTestsCount').textContent = stats.labTests;
        }
        document.getElementById('deletedBackupsCount').textContent = stats.backups;
    }

    // التحقق من الصلاحيات
    checkPermissions() {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            // إخفاء بعض الأزرار للمستخدمين غير الإداريين
            document.getElementById('emptyTrashBtn').style.display = 'none';
        }
    }

    // إضافة عنصر جديد لسلة المحذوفات (للاستخدام من صفحات أخرى)
    addToTrash(type, id, name, details, data) {
        const newItem = {
            id: `${type}_${id}`,
            type: type,
            name: name,
            details: details,
            deletedBy: getCurrentUser()?.name || 'النظام',
            deletedAt: new Date(),
            data: data
        };

        this.deletedItems.push(newItem);
        this.saveDeletedItems();
        this.logActivity('move_to_trash', `تم نقل ${this.getTypeNameInArabic(type)}: ${name} إلى سلة المحذوفات`);
    }

    // دوال مساعدة
    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) return `منذ ${days} يوم`;
        if (hours > 0) return `منذ ${hours} ساعة`;
        if (minutes > 0) return `منذ ${minutes} دقيقة`;
        return 'الآن';
    }

    getTypeIcon(type) {
        const icons = {
            patient: 'fa-user-injured',
            user: 'fa-user',
            department: 'fa-building',
            backup: 'fa-database',
            medicine: 'fa-pills',
            lab_test: 'fa-microscope'
        };
        return icons[type] || 'fa-question';
    }

    getTypeBadgeColor(type) {
        const colors = {
            patient: 'danger',
            user: 'warning',
            department: 'info',
            backup: 'secondary',
            medicine: 'success',
            lab_test: 'primary'
        };
        return colors[type] || 'secondary';
    }

    getTypeNameInArabic(type) {
        const names = {
            patient: 'مريض',
            user: 'مستخدم',
            department: 'قسم',
            backup: 'نسخة احتياطية',
            medicine: 'دواء',
            lab_test: 'فحص مختبري'
        };
        return names[type] || 'عنصر';
    }

    getRoleNameInArabic(role) {
        const roles = {
            admin: 'مدير النظام',
            doctor: 'طبيب',
            nurse: 'ممرض/ة',
            staff: 'موظف إداري'
        };
        return roles[role] || role;
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

// تهيئة مدير سلة المحذوفات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const trashManager = new TrashManager();
    
    // تصدير للاستخدام العام
    window.trashManager = trashManager;
    window.toggleSelectAll = () => trashManager.toggleSelectAll();
    window.restoreAll = () => trashManager.restoreAll();
    window.emptyTrash = () => trashManager.emptyTrash();
});