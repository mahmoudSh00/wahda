// إدارة المختبر - مستشفى الوحدة درنة

class LaboratoryManager {
    constructor() {
        this.tests = this.loadTests();
        this.selectedTests = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentTestForResults = null;
        this.init();
    }

    init() {
        this.displayTests();
        this.updateStatistics();
        this.bindEvents();
        this.setCurrentDateTime();
        this.checkPendingTests();
    }

    // تحميل الفحوصات من التخزين المحلي
    loadTests() {
        const defaultTests = [
            {
                id: 1,
                patientName: 'محمد أحمد سالم',
                medicalRecordNumber: 'MR2024001',
                testType: 'blood',
                testName: 'صورة دم كاملة',
                requestingDoctor: 'د. أحمد المهدي',
                department: 'الطوارئ',
                requestDate: '2024-01-20T08:30',
                priority: 'urgent',
                status: 'pending',
                technician: 'محمد عبدالله',
                clinicalNotes: 'حمى وتعب عام',
                patientAge: 35,
                patientGender: 'male',
                createdAt: new Date('2024-01-20T08:30').toISOString(),
                createdBy: 'د. أحمد المهدي'
            },
            {
                id: 2,
                patientName: 'فاطمة محمود',
                medicalRecordNumber: 'MR2024002',
                testType: 'urine',
                testName: 'تحليل بول كامل',
                requestingDoctor: 'د. سارة علي',
                department: 'النساء والولادة',
                requestDate: '2024-01-19T14:15',
                priority: 'normal',
                status: 'completed',
                technician: 'فاطمة أحمد',
                clinicalNotes: 'التهاب مجاري بولية محتمل',
                patientAge: 28,
                patientGender: 'female',
                results: {
                    performedDate: '2024-01-19T16:30',
                    performedBy: 'فاطمة أحمد',
                    findings: {
                        'اللون': 'أصفر فاتح',
                        'الشفافية': 'عكر قليلاً',
                        'الكثافة النوعية': '1.020',
                        'الحموضة': '6.0',
                        'البروتين': 'سلبي',
                        'الجلوكوز': 'سلبي',
                        'الكيتونات': 'سلبي',
                        'كرات الدم البيضاء': '8-10/hpf',
                        'كرات الدم الحمراء': '2-3/hpf',
                        'البكتيريا': 'معتدلة'
                    },
                    notes: 'توجد علامات التهاب بسيط في المجاري البولية'
                },
                completedAt: '2024-01-19T16:30',
                createdAt: new Date('2024-01-19T14:15').toISOString(),
                createdBy: 'د. سارة علي'
            },
            {
                id: 3,
                patientName: 'عمر حسن',
                medicalRecordNumber: 'MR2024003',
                testType: 'biochemistry',
                testName: 'وظائف الكبد',
                requestingDoctor: 'د. محمد الطاهر',
                department: 'الباطنة',
                requestDate: '2024-01-18T10:00',
                priority: 'routine',
                status: 'in_progress',
                technician: 'عمر محمود',
                clinicalNotes: 'ألم في الجانب الأيمن',
                patientAge: 45,
                patientGender: 'male',
                createdAt: new Date('2024-01-18T10:00').toISOString(),
                createdBy: 'د. محمد الطاهر'
            }
        ];

        const savedTests = localStorage.getItem('hospitalLabTests');
        return savedTests ? JSON.parse(savedTests) : defaultTests;
    }

    // حفظ الفحوصات
    saveTests() {
        localStorage.setItem('hospitalLabTests', JSON.stringify(this.tests));
    }

    // عرض الفحوصات
    displayTests(filteredTests = null) {
        const testsToShow = filteredTests || this.tests;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentTests = testsToShow.slice(startIndex, endIndex);

        const tbody = document.getElementById('testsTableBody');
        
        if (currentTests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="fas fa-microscope fa-3x mb-3"></i>
                        <p>لا توجد فحوصات متاحة</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = currentTests.map(test => {
            const statusInfo = this.getStatusInfo(test.status);
            const priorityInfo = this.getPriorityInfo(test.priority);
            
            return `
                <tr data-test-id="${test.id}" class="${statusInfo.rowClass}">
                    <td>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${test.id}" 
                                   onchange="laboratoryManager.toggleTestSelection(${test.id})">
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>${test.patientName}</strong>
                            <br>
                            <small class="text-muted">رقم السجل: ${test.medicalRecordNumber || 'غير محدد'}</small>
                            <br>
                            <small class="text-info">${test.patientAge ? test.patientAge + ' سنة' : ''} ${test.patientGender ? '- ' + this.getGenderInArabic(test.patientGender) : ''}</small>
                        </div>
                    </td>
                    <td>
                        <div>
                            <span class="badge bg-secondary">${this.getTestTypeInArabic(test.testType)}</span>
                            <br>
                            <small class="text-muted">${test.testName}</small>
                        </div>
                    </td>
                    <td>
                        <div>
                            <strong>${this.formatDateTime(test.requestDate)}</strong>
                            <br>
                            <small class="text-muted">الطبيب: ${test.requestingDoctor}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${priorityInfo.class}">${priorityInfo.text}</span>
                    </td>
                    <td>
                        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                    </td>
                    <td>
                        <span class="text-muted">${test.technician || 'غير محدد'}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-info" onclick="laboratoryManager.viewTest(${test.id})" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${test.status === 'completed' ? `
                                <button class="btn btn-outline-success" onclick="laboratoryManager.printReport(${test.id})" title="طباعة النتيجة">
                                    <i class="fas fa-print"></i>
                                </button>
                            ` : `
                                <button class="btn btn-outline-primary" onclick="laboratoryManager.addResults(${test.id})" title="إضافة نتائج">
                                    <i class="fas fa-flask"></i>
                                </button>
                            `}
                            <button class="btn btn-outline-warning" onclick="laboratoryManager.editTest(${test.id})" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="laboratoryManager.deleteTest(${test.id})" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.updatePagination(testsToShow.length);
    }

    // ربط الأحداث
    bindEvents() {
        // إضافة فحص جديد
        document.getElementById('addTestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTest();
        });

        // إضافة نتائج الفحص
        document.getElementById('testResultsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTestResults();
        });

        // البحث والتصفية
        document.getElementById('searchTest').addEventListener('input', () => {
            this.searchTests();
        });

        ['filterTestType', 'filterStatus', 'filterDate', 'filterPriority'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.searchTests();
            });
        });
    }

    // تعيين التاريخ والوقت الحالي
    setCurrentDateTime() {
        const now = new Date();
        const currentDateTime = now.toISOString().slice(0, 16);
        document.getElementById('requestDate').value = currentDateTime;
    }

    // إضافة فحص جديد
    addTest() {
        const formData = {
            patientName: document.getElementById('patientName').value.trim(),
            medicalRecordNumber: document.getElementById('medicalRecordNumber').value.trim(),
            testType: document.getElementById('testType').value,
            testName: document.getElementById('testName').value.trim(),
            requestingDoctor: document.getElementById('requestingDoctor').value.trim(),
            department: document.getElementById('department').value.trim(),
            requestDate: document.getElementById('requestDate').value,
            priority: document.getElementById('priority').value,
            technician: document.getElementById('technician').value,
            clinicalNotes: document.getElementById('clinicalNotes').value.trim(),
            patientAge: parseInt(document.getElementById('patientAge').value) || null,
            patientGender: document.getElementById('patientGender').value
        };

        // التحقق من صحة البيانات
        if (!this.validateTestData(formData)) {
            return;
        }

        // إنشاء الفحص الجديد
        const newTest = {
            id: Date.now(),
            ...formData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser()?.name || 'النظام'
        };

        this.tests.push(newTest);
        this.saveTests();
        this.displayTests();
        this.updateStatistics();
        
        // إعادة تعيين النموذج
        document.getElementById('addTestForm').reset();
        this.setCurrentDateTime();
        bootstrap.Modal.getInstance(document.getElementById('addTestModal')).hide();
        
        this.logActivity('add_test', `تم إضافة فحص: ${newTest.testName} للمريض: ${newTest.patientName}`);
        this.showSuccess(`تم إضافة فحص "${newTest.testName}" بنجاح`);
    }

    // إضافة نتائج الفحص
    addResults(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        this.currentTestForResults = testId;

        // تحديث معلومات الفحص في modal
        document.getElementById('resultPatientName').textContent = test.patientName;
        document.getElementById('resultTestType').textContent = test.testName;
        document.getElementById('resultDoctor').textContent = test.requestingDoctor;
        
        // تعيين التاريخ والوقت الحالي
        const now = new Date();
        document.getElementById('performedDate').value = now.toISOString().slice(0, 16);
        document.getElementById('performedBy').value = getCurrentUser()?.name || '';

        // إنشاء حقول النتائج حسب نوع الفحص
        this.generateResultFields(test.testType);

        new bootstrap.Modal(document.getElementById('testResultsModal')).show();
    }

    // إنشاء حقول النتائج
    generateResultFields(testType) {
        const container = document.getElementById('testResultsContainer');
        let fieldsHTML = '';

        switch (testType) {
            case 'blood':
                fieldsHTML = `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">هيموجلوبين (g/dL)</label>
                            <input type="number" class="form-control" name="hemoglobin" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">كرات الدم البيضاء (×10³/µL)</label>
                            <input type="number" class="form-control" name="wbc" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">كرات الدم الحمراء (×10⁶/µL)</label>
                            <input type="number" class="form-control" name="rbc" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الصفائح الدموية (×10³/µL)</label>
                            <input type="number" class="form-control" name="platelets" step="1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الهيماتوكريت (%)</label>
                            <input type="number" class="form-control" name="hematocrit" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">حجم كرة الدم الحمراء (fL)</label>
                            <input type="number" class="form-control" name="mcv" step="0.1">
                        </div>
                    </div>
                `;
                break;
            case 'urine':
                fieldsHTML = `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">اللون</label>
                            <select class="form-control" name="color">
                                <option value="">اختر</option>
                                <option value="أصفر فاتح">أصفر فاتح</option>
                                <option value="أصفر">أصفر</option>
                                <option value="أصفر داكن">أصفر داكن</option>
                                <option value="أحمر">أحمر</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الشفافية</label>
                            <select class="form-control" name="clarity">
                                <option value="">اختر</option>
                                <option value="صافي">صافي</option>
                                <option value="عكر قليلاً">عكر قليلاً</option>
                                <option value="عكر">عكر</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الكثافة النوعية</label>
                            <input type="number" class="form-control" name="specific_gravity" step="0.001" min="1.000" max="1.030">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الحموضة (pH)</label>
                            <input type="number" class="form-control" name="ph" step="0.1" min="4.5" max="8.0">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">البروتين</label>
                            <select class="form-control" name="protein">
                                <option value="سلبي">سلبي</option>
                                <option value="إيجابي +">إيجابي +</option>
                                <option value="إيجابي ++">إيجابي ++</option>
                                <option value="إيجابي +++">إيجابي +++</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">كرات الدم البيضاء (/hpf)</label>
                            <input type="text" class="form-control" name="wbc_count" placeholder="مثال: 0-2">
                        </div>
                    </div>
                `;
                break;
            case 'biochemistry':
                fieldsHTML = `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">ALT (U/L)</label>
                            <input type="number" class="form-control" name="alt" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">AST (U/L)</label>
                            <input type="number" class="form-control" name="ast" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">البيليروبين الكلي (mg/dL)</label>
                            <input type="number" class="form-control" name="total_bilirubin" step="0.1">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">الألبومين (g/dL)</label>
                            <input type="number" class="form-control" name="albumin" step="0.1">
                        </div>
                    </div>
                `;
                break;
            default:
                fieldsHTML = `
                    <div class="mb-3">
                        <label class="form-label">النتائج</label>
                        <textarea class="form-control" name="general_results" rows="4" placeholder="أدخل نتائج الفحص هنا..."></textarea>
                    </div>
                `;
        }

        container.innerHTML = fieldsHTML;
    }

    // حفظ نتائج الفحص
    saveTestResults() {
        if (!this.currentTestForResults) return;

        const test = this.tests.find(t => t.id === this.currentTestForResults);
        if (!test) return;

        const performedDate = document.getElementById('performedDate').value;
        const performedBy = document.getElementById('performedBy').value.trim();
        const resultNotes = document.getElementById('resultNotes').value.trim();

        if (!performedDate || !performedBy) {
            this.showError('يرجى ملء التاريخ واسم المنفذ');
            return;
        }

        // جمع النتائج
        const resultsContainer = document.getElementById('testResultsContainer');
        const inputs = resultsContainer.querySelectorAll('input, select, textarea');
        const findings = {};

        inputs.forEach(input => {
            if (input.value.trim()) {
                const label = input.closest('.mb-3').querySelector('label').textContent;
                findings[label] = input.value.trim();
            }
        });

        // تحديث الفحص
        test.results = {
            performedDate: performedDate,
            performedBy: performedBy,
            findings: findings,
            notes: resultNotes
        };
        test.status = 'completed';
        test.completedAt = new Date().toISOString();

        this.saveTests();
        this.displayTests();
        this.updateStatistics();

        // إعادة تعيين النموذج
        document.getElementById('testResultsForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('testResultsModal')).hide();
        
        this.logActivity('complete_test', `تم إكمال فحص: ${test.testName} للمريض: ${test.patientName}`);
        this.showSuccess(`تم حفظ نتائج فحص "${test.testName}" بنجاح`);
    }

    // البحث والتصفية
    searchTests() {
        const searchTerm = document.getElementById('searchTest').value.toLowerCase().trim();
        const typeFilter = document.getElementById('filterTestType').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const dateFilter = document.getElementById('filterDate').value;
        const priorityFilter = document.getElementById('filterPriority').value;

        let filteredTests = this.tests;

        // تصفية النص
        if (searchTerm) {
            filteredTests = filteredTests.filter(test =>
                test.patientName.toLowerCase().includes(searchTerm) ||
                test.testName.toLowerCase().includes(searchTerm) ||
                test.medicalRecordNumber?.toLowerCase().includes(searchTerm) ||
                test.requestingDoctor.toLowerCase().includes(searchTerm)
            );
        }

        // تصفية النوع
        if (typeFilter) {
            filteredTests = filteredTests.filter(test => test.testType === typeFilter);
        }

        // تصفية الحالة
        if (statusFilter) {
            filteredTests = filteredTests.filter(test => test.status === statusFilter);
        }

        // تصفية التاريخ
        if (dateFilter) {
            filteredTests = filteredTests.filter(test => {
                const testDate = new Date(test.requestDate).toDateString();
                const filterDate = new Date(dateFilter).toDateString();
                return testDate === filterDate;
            });
        }

        // تصفية الأولوية
        if (priorityFilter) {
            filteredTests = filteredTests.filter(test => test.priority === priorityFilter);
        }

        this.currentPage = 1;
        this.displayTests(filteredTests);
    }

    // طباعة تقرير الفحص
    printReport(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test || !test.results) return;

        const reportHTML = `
            <div class="text-center mb-4">
                <h3>مستشفى الوحدة درنة</h3>
                <h4>تقرير فحص مختبري</h4>
                <hr>
            </div>
            
            <div class="row mb-4">
                <div class="col-6">
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>اسم المريض:</strong></td>
                            <td>${test.patientName}</td>
                        </tr>
                        <tr>
                            <td><strong>رقم السجل:</strong></td>
                            <td>${test.medicalRecordNumber || 'غير محدد'}</td>
                        </tr>
                        <tr>
                            <td><strong>العمر:</strong></td>
                            <td>${test.patientAge ? test.patientAge + ' سنة' : 'غير محدد'}</td>
                        </tr>
                        <tr>
                            <td><strong>الجنس:</strong></td>
                            <td>${test.patientGender ? this.getGenderInArabic(test.patientGender) : 'غير محدد'}</td>
                        </tr>
                    </table>
                </div>
                <div class="col-6">
                    <table class="table table-borderless">
                        <tr>
                            <td><strong>نوع الفحص:</strong></td>
                            <td>${test.testName}</td>
                        </tr>
                        <tr>
                            <td><strong>الطبيب الطالب:</strong></td>
                            <td>${test.requestingDoctor}</td>
                        </tr>
                        <tr>
                            <td><strong>تاريخ الطلب:</strong></td>
                            <td>${this.formatDateTime(test.requestDate)}</td>
                        </tr>
                        <tr>
                            <td><strong>تاريخ التنفيذ:</strong></td>
                            <td>${this.formatDateTime(test.results.performedDate)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="mb-4">
                <h5>النتائج:</h5>
                <table class="table table-bordered">
                    ${Object.entries(test.results.findings).map(([key, value]) => `
                        <tr>
                            <td><strong>${key}</strong></td>
                            <td>${value}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            ${test.results.notes ? `
                <div class="mb-4">
                    <h5>ملاحظات:</h5>
                    <p>${test.results.notes}</p>
                </div>
            ` : ''}

            <div class="text-end mt-4">
                <p><strong>التقني المنفذ:</strong> ${test.results.performedBy}</p>
                <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
            </div>
        `;

        document.getElementById('printableReport').innerHTML = reportHTML;
        new bootstrap.Modal(document.getElementById('printReportModal')).show();
    }

    // طباعة التقرير فعلياً
    printReport() {
        const printContent = document.getElementById('printableReport').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        
        // إعادة تهيئة الصفحة
        window.location.reload();
    }

    // عرض تفاصيل الفحص
    viewTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-microscope me-2"></i>
                            تفاصيل الفحص: ${test.testName}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>معلومات المريض</h6>
                                <table class="table table-borderless table-sm">
                                    <tr>
                                        <td><strong>الاسم:</strong></td>
                                        <td>${test.patientName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>رقم السجل:</strong></td>
                                        <td>${test.medicalRecordNumber || 'غير محدد'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>العمر:</strong></td>
                                        <td>${test.patientAge ? test.patientAge + ' سنة' : 'غير محدد'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>الجنس:</strong></td>
                                        <td>${test.patientGender ? this.getGenderInArabic(test.patientGender) : 'غير محدد'}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6>معلومات الفحص</h6>
                                <table class="table table-borderless table-sm">
                                    <tr>
                                        <td><strong>النوع:</strong></td>
                                        <td><span class="badge bg-secondary">${this.getTestTypeInArabic(test.testType)}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>الطبيب الطالب:</strong></td>
                                        <td>${test.requestingDoctor}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>القسم:</strong></td>
                                        <td>${test.department || 'غير محدد'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>الأولوية:</strong></td>
                                        <td><span class="badge ${this.getPriorityInfo(test.priority).class}">${this.getPriorityInfo(test.priority).text}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>الحالة:</strong></td>
                                        <td><span class="badge ${this.getStatusInfo(test.status).class}">${this.getStatusInfo(test.status).text}</span></td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        ${test.clinicalNotes ? `
                            <div class="mt-3">
                                <h6>الملاحظات الإكلينيكية:</h6>
                                <p class="bg-light p-3 rounded">${test.clinicalNotes}</p>
                            </div>
                        ` : ''}

                        ${test.results ? `
                            <div class="mt-3">
                                <h6>النتائج:</h6>
                                <div class="table-responsive">
                                    <table class="table table-bordered table-sm">
                                        ${Object.entries(test.results.findings).map(([key, value]) => `
                                            <tr>
                                                <td><strong>${key}</strong></td>
                                                <td>${value}</td>
                                            </tr>
                                        `).join('')}
                                    </table>
                                </div>
                                ${test.results.notes ? `
                                    <div class="mt-2">
                                        <strong>ملاحظات النتائج:</strong>
                                        <p>${test.results.notes}</p>
                                    </div>
                                ` : ''}
                                <small class="text-muted">
                                    تم التنفيذ بواسطة: ${test.results.performedBy} في ${this.formatDateTime(test.results.performedDate)}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        ${test.results ? `
                            <button type="button" class="btn btn-success" onclick="laboratoryManager.printReport(${test.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                                <i class="fas fa-print me-2"></i>طباعة النتيجة
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary" onclick="laboratoryManager.addResults(${test.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                                <i class="fas fa-flask me-2"></i>إضافة نتائج
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    // التحقق من صحة بيانات الفحص
    validateTestData(data) {
        if (!data.patientName || data.patientName.length < 2) {
            this.showError('اسم المريض يجب أن يكون على الأقل حرفين');
            return false;
        }

        if (!data.testType) {
            this.showError('يرجى اختيار نوع الفحص');
            return false;
        }

        if (!data.testName || data.testName.length < 2) {
            this.showError('اسم الفحص يجب أن يكون على الأقل حرفين');
            return false;
        }

        if (!data.requestingDoctor || data.requestingDoctor.length < 2) {
            this.showError('اسم الطبيب يجب أن يكون على الأقل حرفين');
            return false;
        }

        if (!data.requestDate) {
            this.showError('يرجى تحديد تاريخ ووقت الطلب');
            return false;
        }

        return true;
    }

    // تحديث الإحصائيات
    updateStatistics() {
        const totalTests = this.tests.length;
        const pendingTests = this.tests.filter(t => t.status === 'pending').length;
        const completedTests = this.tests.filter(t => t.status === 'completed').length;
        
        // فحوصات اليوم
        const today = new Date().toDateString();
        const todayTests = this.tests.filter(t => 
            new Date(t.requestDate).toDateString() === today
        ).length;

        document.getElementById('totalTests').textContent = totalTests;
        document.getElementById('pendingTests').textContent = pendingTests;
        document.getElementById('completedTests').textContent = completedTests;
        document.getElementById('todayTests').textContent = todayTests;
    }

    // التحقق من الفحوصات المعلقة
    checkPendingTests() {
        const urgentPendingTests = this.tests.filter(t => 
            t.status === 'pending' && t.priority === 'urgent'
        );

        if (urgentPendingTests.length > 0) {
            this.showWarning(`تنبيه: هناك ${urgentPendingTests.length} فحص عاجل معلق`);
        }
    }

    // تحديد/إلغاء تحديد فحص
    toggleTestSelection(testId) {
        const index = this.selectedTests.indexOf(testId);
        if (index > -1) {
            this.selectedTests.splice(index, 1);
        } else {
            this.selectedTests.push(testId);
        }

        this.updateSelectAllCheckbox();
        this.updateActionButtons();
    }

    // تحديد/إلغاء تحديد الجميع
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const testCheckboxes = document.querySelectorAll('#testsTableBody input[type="checkbox"]');

        if (selectAllCheckbox.checked) {
            this.selectedTests = Array.from(testCheckboxes).map(cb => parseInt(cb.value));
            testCheckboxes.forEach(cb => cb.checked = true);
        } else {
            this.selectedTests = [];
            testCheckboxes.forEach(cb => cb.checked = false);
        }

        this.updateActionButtons();
    }

    // تحديث حالة checkbox تحديد الجميع
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const testCheckboxes = document.querySelectorAll('#testsTableBody input[type="checkbox"]');
        const checkedBoxes = document.querySelectorAll('#testsTableBody input[type="checkbox"]:checked');

        if (checkedBoxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedBoxes.length === testCheckboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    // تحديث حالة أزرار العمليات
    updateActionButtons() {
        const hasSelection = this.selectedTests.length > 0;
        document.getElementById('completeBtn').disabled = !hasSelection;
        document.getElementById('deleteBtn').disabled = !hasSelection;
    }

    // تمييز الفحوصات المحددة كمكتملة
    markSelectedAsCompleted() {
        if (this.selectedTests.length === 0) {
            this.showWarning('يرجى تحديد الفحوصات المراد تمييزها');
            return;
        }

        const confirmMessage = `هل تريد تمييز ${this.selectedTests.length} فحص كمكتمل؟`;
        if (confirm(confirmMessage)) {
            let completedCount = 0;

            this.selectedTests.forEach(testId => {
                const test = this.tests.find(t => t.id === testId);
                if (test && test.status !== 'completed') {
                    test.status = 'completed';
                    test.completedAt = new Date().toISOString();
                    completedCount++;
                }
            });

            this.selectedTests = [];
            this.saveTests();
            this.displayTests();
            this.updateStatistics();
            
            this.logActivity('bulk_complete_tests', `تم تمييز ${completedCount} فحص كمكتمل`);
            this.showSuccess(`تم تمييز ${completedCount} فحص كمكتمل`);
        }
    }

    // حذف الفحوصات المحددة
    deleteSelected() {
        if (this.selectedTests.length === 0) {
            this.showWarning('يرجى تحديد الفحوصات المراد حذفها');
            return;
        }

        const confirmMessage = `هل تريد حذف ${this.selectedTests.length} فحص محدد؟`;
        if (confirm(confirmMessage)) {
            this.selectedTests.forEach(testId => {
                const test = this.tests.find(t => t.id === testId);
                if (test) {
                    // نقل إلى سلة المحذوفات
                    if (window.trashManager) {
                        window.trashManager.addToTrash(
                            'lab_test',
                            test.id,
                            `${test.testName} - ${test.patientName}`,
                            `فحص مختبري - ${this.getTestTypeInArabic(test.testType)} - الحالة: ${this.getStatusInfo(test.status).text}`,
                            test
                        );
                    }
                }
            });

            // حذف الفحوصات
            this.tests = this.tests.filter(t => !this.selectedTests.includes(t.id));
            this.selectedTests = [];

            this.saveTests();
            this.displayTests();
            this.updateStatistics();
            
            this.logActivity('delete_tests', `تم حذف ${this.selectedTests.length} فحص`);
            this.showSuccess('تم حذف الفحوصات المحددة بنجاح');
        }
    }

    // حذف فحص واحد
    deleteTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (!test) return;

        if (confirm(`هل تريد حذف فحص "${test.testName}" للمريض "${test.patientName}"؟`)) {
            // نقل إلى سلة المحذوفات
            if (window.trashManager) {
                window.trashManager.addToTrash(
                    'lab_test',
                    test.id,
                    `${test.testName} - ${test.patientName}`,
                    `فحص مختبري - ${this.getTestTypeInArabic(test.testType)} - الحالة: ${this.getStatusInfo(test.status).text}`,
                    test
                );
            }

            this.tests = this.tests.filter(t => t.id !== testId);
            this.saveTests();
            this.displayTests();
            this.updateStatistics();
            
            this.logActivity('delete_test', `تم حذف فحص: ${test.testName} للمريض: ${test.patientName}`);
            this.showSuccess(`تم حذف الفحص بنجاح`);
        }
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
                <a class="page-link" href="#" onclick="laboratoryManager.changePage(${this.currentPage - 1})">السابق</a>
            </li>
        `;

        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="laboratoryManager.changePage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // الصفحة التالية
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="laboratoryManager.changePage(${this.currentPage + 1})">التالي</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // تغيير الصفحة
    changePage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.displayTests();
    }

    // دوال مساعدة
    getStatusInfo(status) {
        const statusMap = {
            pending: {
                text: 'معلق',
                class: 'bg-warning',
                rowClass: 'table-warning'
            },
            in_progress: {
                text: 'قيد التنفيذ',
                class: 'bg-info',
                rowClass: 'table-info'
            },
            completed: {
                text: 'مكتمل',
                class: 'bg-success',
                rowClass: 'table-success'
            },
            cancelled: {
                text: 'ملغي',
                class: 'bg-danger',
                rowClass: 'table-danger'
            }
        };
        return statusMap[status] || { text: status, class: 'bg-secondary', rowClass: '' };
    }

    getPriorityInfo(priority) {
        const priorityMap = {
            urgent: { text: 'عاجل', class: 'bg-danger' },
            normal: { text: 'عادي', class: 'bg-info' },
            routine: { text: 'روتيني', class: 'bg-secondary' }
        };
        return priorityMap[priority] || { text: priority, class: 'bg-secondary' };
    }

    getTestTypeInArabic(testType) {
        const types = {
            blood: 'تحليل دم',
            urine: 'تحليل بول',
            biochemistry: 'كيمياء حيوية',
            microbiology: 'أحياء دقيقة',
            serology: 'مصليات'
        };
        return types[testType] || testType;
    }

    getGenderInArabic(gender) {
        return gender === 'male' ? 'ذكر' : gender === 'female' ? 'أنثى' : gender;
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
function generateLabReport() {
    const report = {
        generatedAt: new Date().toISOString(),
        totalTests: laboratoryManager.tests.length,
        pendingTests: laboratoryManager.tests.filter(t => t.status === 'pending').length,
        completedTests: laboratoryManager.tests.filter(t => t.status === 'completed').length,
        urgentTests: laboratoryManager.tests.filter(t => t.priority === 'urgent').length,
        todayTests: laboratoryManager.tests.filter(t => 
            new Date(t.requestDate).toDateString() === new Date().toDateString()
        ).length
    };

    console.log('تقرير المختبر:', report);
    laboratoryManager.showSuccess('تم إنشاء تقرير المختبر بنجاح');
}

function printReport() {
    window.print();
}

// تهيئة مدير المختبر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const laboratoryManager = new LaboratoryManager();
    
    // تصدير للاستخدام العام
    window.laboratoryManager = laboratoryManager;
    window.searchTests = () => laboratoryManager.searchTests();
    window.toggleSelectAll = () => laboratoryManager.toggleSelectAll();
    window.markSelectedAsCompleted = () => laboratoryManager.markSelectedAsCompleted();
    window.deleteSelected = () => laboratoryManager.deleteSelected();
    window.printReport = () => printReport();
});