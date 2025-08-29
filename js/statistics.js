// صفحة الإحصائيات - مستشفى الوحدة درنة

class HospitalStatistics {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.statistics = {};
        this.charts = {};
        this.init();
    }

    init() {
        this.loadStatistics();
        this.bindFilterEvents();
        this.initializeCharts();
        this.setupExportButtons();
    }

    // تحميل الإحصائيات
    async loadStatistics() {
        try {
            const stats = await this.fetchStatisticsData();
            this.statistics = stats;
            this.updateStatisticsDisplay();
            this.updateChartsData();
        } catch (error) {
            console.error('خطأ في تحميل الإحصائيات:', error);
            this.showError('خطأ في تحميل البيانات');
        }
    }

    // جلب بيانات الإحصائيات
    async fetchStatisticsData() {
        // محاكاة طلب البيانات من الخادم
        await new Promise(resolve => setTimeout(resolve, 1000));

        const patients = JSON.parse(localStorage.getItem('hospitalPatients') || '[]');
        
        // حساب الإحصائيات من البيانات المحلية
        const currentYear = this.currentYear;
        const yearPatients = patients.filter(p => {
            const patientYear = new Date(p.createdAt).getFullYear();
            return patientYear === currentYear;
        });

        // إحصائيات شهرية
        const monthlyStats = this.calculateMonthlyStatistics(yearPatients);
        
        // إحصائيات الأقسام
        const departmentStats = this.calculateDepartmentStatistics(yearPatients);
        
        // إحصائيات عامة
        const generalStats = {
            totalPatientsYear: yearPatients.length,
            recoveredPatients: Math.floor(yearPatients.length * 0.8), // محاكاة
            pendingPatients: Math.floor(yearPatients.length * 0.15), // محاكاة
            avgPatientsPerMonth: Math.floor(yearPatients.length / 12)
        };

        return {
            monthly: monthlyStats,
            departments: departmentStats,
            general: generalStats,
            year: currentYear
        };
    }

    // حساب الإحصائيات الشهرية
    calculateMonthlyStatistics(patients) {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        const monthlyData = months.map((month, index) => {
            const monthPatients = patients.filter(p => {
                const patientMonth = new Date(p.createdAt).getMonth();
                return patientMonth === index;
            });

            return {
                month: month,
                monthIndex: index,
                newPatients: monthPatients.length,
                recoveredPatients: Math.floor(monthPatients.length * 0.8),
                transferredPatients: Math.floor(monthPatients.length * 0.05),
                totalVisits: Math.floor(monthPatients.length * 2.3),
                avgStayDays: 3.2,
                revenue: monthPatients.length * 1800 + Math.random() * 5000
            };
        });

        return monthlyData;
    }

    // حساب إحصائيات الأقسام
    calculateDepartmentStatistics(patients) {
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

        const departmentStats = Object.keys(departments).map(deptCode => {
            const deptPatients = patients.filter(p => p.department === deptCode);
            const total = patients.length;
            
            return {
                code: deptCode,
                name: departments[deptCode],
                count: deptPatients.length,
                percentage: total > 0 ? Math.round((deptPatients.length / total) * 100) : 0
            };
        });

        // ترتيب حسب العدد
        return departmentStats.sort((a, b) => b.count - a.count);
    }

    // تحديث عرض الإحصائيات
    updateStatisticsDisplay() {
        const { general } = this.statistics;
        
        // تحديث الإحصائيات العامة
        this.updateElement('totalPatientsYear', general.totalPatientsYear.toLocaleString());
        this.updateElement('recoveredPatients', general.recoveredPatients.toLocaleString());
        this.updateElement('pendingPatients', general.pendingPatients.toLocaleString());
        this.updateElement('avgPatientsPerMonth', general.avgPatientsPerMonth.toLocaleString());
        
        // تحديث جدول الإحصائيات الشهرية
        this.updateMonthlyTable();
        
        // تحديث إحصائيات الأقسام
        this.updateDepartmentStatistics();
    }

    // تحديث عنصر في DOM
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // تأثير رقمي متحرك
            this.animateNumber(element, parseInt(element.textContent.replace(/,/g, '')) || 0, parseInt(value.replace(/,/g, '')));
        }
    }

    // تحريك الأرقام
    animateNumber(element, from, to, duration = 1000) {
        const start = Date.now();
        const timer = setInterval(() => {
            const progress = (Date.now() - start) / duration;
            
            if (progress >= 1) {
                element.textContent = to.toLocaleString();
                clearInterval(timer);
            } else {
                const current = Math.floor(from + (to - from) * this.easeOutQuart(progress));
                element.textContent = current.toLocaleString();
            }
        }, 16);
    }

    // دالة الانتقال السلس
    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // تحديث الجدول الشهري
    updateMonthlyTable() {
        const tableBody = document.querySelector('#statisticsTable tbody');
        if (!tableBody || !this.statistics.monthly) return;

        const monthlyData = this.statistics.monthly;
        const totalRow = this.calculateTotals(monthlyData);
        
        // إنشاء صفوف الجدول
        const rows = monthlyData.map(data => `
            <tr class="table-row-hover">
                <td><strong>${data.month} ${this.currentYear}</strong></td>
                <td>${data.newPatients}</td>
                <td>${data.recoveredPatients}</td>
                <td>${data.transferredPatients}</td>
                <td>${data.totalVisits}</td>
                <td>${data.avgStayDays}</td>
                <td>${Math.floor(data.revenue).toLocaleString()} د.ل</td>
            </tr>
        `).join('');

        // إضافة صف الإجمالي
        const totalRowHtml = `
            <tr class="table-success">
                <td><strong>الإجمالي</strong></td>
                <td><strong>${totalRow.newPatients}</strong></td>
                <td><strong>${totalRow.recoveredPatients}</strong></td>
                <td><strong>${totalRow.transferredPatients}</strong></td>
                <td><strong>${totalRow.totalVisits}</strong></td>
                <td><strong>${totalRow.avgStayDays}</strong></td>
                <td><strong>${totalRow.revenue.toLocaleString()} د.ل</strong></td>
            </tr>
        `;

        tableBody.innerHTML = rows + totalRowHtml;
        
        // إضافة تأثيرات متحركة للصفوف
        const tableRows = tableBody.querySelectorAll('tr');
        tableRows.forEach((row, index) => {
            row.style.animationDelay = `${index * 50}ms`;
            row.classList.add('fade-in');
        });
    }

    // حساب المجاميع
    calculateTotals(monthlyData) {
        return monthlyData.reduce((totals, month) => ({
            newPatients: totals.newPatients + month.newPatients,
            recoveredPatients: totals.recoveredPatients + month.recoveredPatients,
            transferredPatients: totals.transferredPatients + month.transferredPatients,
            totalVisits: totals.totalVisits + month.totalVisits,
            avgStayDays: 3.2, // متوسط ثابت
            revenue: totals.revenue + month.revenue
        }), {
            newPatients: 0,
            recoveredPatients: 0,
            transferredPatients: 0,
            totalVisits: 0,
            revenue: 0
        });
    }

    // تحديث إحصائيات الأقسام
    updateDepartmentStatistics() {
        if (!this.statistics.departments) return;

        const departmentStats = this.statistics.departments.slice(0, 6); // أول 6 أقسام
        
        // تحديث الجدول
        const tableBody = document.querySelector('.table-sm tbody');
        if (tableBody) {
            tableBody.innerHTML = departmentStats.map(dept => `
                <tr>
                    <td>${dept.name}</td>
                    <td>${dept.count}</td>
                    <td>${dept.percentage}%</td>
                </tr>
            `).join('');
        }

        // تحديث أشرطة التقدم
        const progressBars = document.querySelectorAll('.progress .progress-bar');
        progressBars.forEach((bar, index) => {
            if (departmentStats[index]) {
                const percentage = departmentStats[index].percentage;
                bar.style.width = `${percentage}%`;
                bar.textContent = `${departmentStats[index].name} ${percentage}%`;
                
                // تأثير متحرك
                setTimeout(() => {
                    bar.style.transition = 'width 1s ease-in-out';
                }, index * 100);
            }
        });
    }

    // ربط أحداث الفلاتر
    bindFilterEvents() {
        const yearSelect = document.getElementById('yearSelect');
        const departmentFilter = document.getElementById('departmentFilter');
        const reportType = document.getElementById('reportType');
        
        if (yearSelect) {
            yearSelect.addEventListener('change', this.handleYearChange.bind(this));
        }
        
        if (departmentFilter) {
            departmentFilter.addEventListener('change', this.handleDepartmentFilter.bind(this));
        }
        
        if (reportType) {
            reportType.addEventListener('change', this.handleReportTypeChange.bind(this));
        }
    }

    // معالجة تغيير السنة
    handleYearChange(e) {
        this.currentYear = parseInt(e.target.value);
        this.showLoading(true);
        
        setTimeout(() => {
            this.loadStatistics();
            this.showLoading(false);
        }, 1000);
    }

    // معالجة فلتر الأقسام
    handleDepartmentFilter(e) {
        const selectedDepartment = e.target.value;
        // تطبيق الفلتر على البيانات
        this.applyDepartmentFilter(selectedDepartment);
    }

    // معالجة تغيير نوع التقرير
    handleReportTypeChange(e) {
        const reportType = e.target.value;
        this.updateReportDisplay(reportType);
    }

    // تطبيق فلتر القسم
    applyDepartmentFilter(department) {
        if (!department) {
            this.updateStatisticsDisplay();
            return;
        }
        
        // فلترة البيانات حسب القسم المحدد
        const filteredStats = this.filterStatisticsByDepartment(department);
        this.displayFilteredStatistics(filteredStats);
    }

    // تهيئة الرسوم البيانية
    initializeCharts() {
        // سيتم تفعيل الرسوم البيانية عند إضافة Chart.js
        this.addChartPlaceholders();
    }

    // إضافة عناصر بديلة للرسوم البيانية
    addChartPlaceholders() {
        const monthlyChart = document.getElementById('monthlyChart');
        const departmentChart = document.getElementById('departmentChart');
        
        if (monthlyChart) {
            this.createTextChart(monthlyChart, 'monthly');
        }
        
        if (departmentChart) {
            this.createTextChart(departmentChart, 'department');
        }
    }

    // إنشاء رسم بياني نصي
    createTextChart(canvas, type) {
        const ctx = canvas.getContext('2d');
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6c757d';
        
        const message = type === 'monthly' 
            ? 'رسم بياني للإحصائيات الشهرية\n(يتطلب Chart.js)'
            : 'رسم بياني للأقسام\n(يتطلب Chart.js)';
            
        const lines = message.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, (canvas.height / 2) + (index * 25) - 10);
        });
    }

    // تحديث بيانات الرسوم البيانية
    updateChartsData() {
        // سيتم تنفيذها عند إضافة Chart.js
        if (typeof Chart !== 'undefined') {
            this.updateMonthlyChart();
            this.updateDepartmentChart();
        }
    }

    // إعداد أزرار التصدير
    setupExportButtons() {
        const exportExcelBtn = document.querySelector('[onclick*="exportToExcel"]');
        const exportPDFBtn = document.querySelector('[onclick*="exportToPDF"]');
        
        if (exportExcelBtn) {
            exportExcelBtn.onclick = this.exportToExcel.bind(this);
        }
        
        if (exportPDFBtn) {
            exportPDFBtn.onclick = this.exportToPDF.bind(this);
        }
    }

    // تصدير لـ Excel
    exportToExcel() {
        if (!this.statistics.monthly) {
            this.showError('لا توجد بيانات للتصدير');
            return;
        }

        const data = this.prepareExcelData();
        const csvContent = this.convertToCSV(data);
        this.downloadCSV(csvContent, 'hospital-statistics.csv');
    }

    // تحضير بيانات Excel
    prepareExcelData() {
        const headers = ['الشهر', 'المرضى الجدد', 'المتعافون', 'المحولون', 'الزيارات', 'متوسط الإقامة', 'الإيرادات'];
        const rows = this.statistics.monthly.map(data => [
            `${data.month} ${this.currentYear}`,
            data.newPatients,
            data.recoveredPatients,
            data.transferredPatients,
            data.totalVisits,
            data.avgStayDays,
            `${Math.floor(data.revenue)} د.ل`
        ]);
        
        return [headers, ...rows];
    }

    // تحويل لتنسيق CSV
    convertToCSV(data) {
        return data.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    }

    // تحميل ملف CSV
    downloadCSV(content, filename) {
        const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // تصدير لـ PDF
    exportToPDF() {
        // فتح نافذة طباعة للصفحة الحالية
        window.print();
    }

    // إظهار حالة التحميل
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (show) {
            if (!loadingOverlay) {
                const overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center';
                overlay.style.cssText = 'background: rgba(255,255,255,0.8); z-index: 9999;';
                overlay.innerHTML = `
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2">جاري تحميل البيانات...</p>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
        } else {
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }
    }

    // إظهار رسالة خطأ
    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
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

    // تحديث الإحصائيات (من الزر)
    updateStatistics() {
        this.showLoading(true);
        
        setTimeout(() => {
            this.loadStatistics();
            this.showLoading(false);
            
            // إظهار رسالة نجاح
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            successAlert.style.zIndex = '9999';
            successAlert.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                تم تحديث البيانات بنجاح
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            document.body.appendChild(successAlert);
            
            setTimeout(() => {
                if (successAlert.parentNode) {
                    successAlert.remove();
                }
            }, 3000);
        }, 1500);
    }
}

// تهيئة الإحصائيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const statistics = new HospitalStatistics();
    
    // تصدير للاستخدام العام
    window.hospitalStatistics = statistics;
    window.updateStatistics = () => statistics.updateStatistics();
    window.exportToExcel = () => statistics.exportToExcel();
    window.exportToPDF = () => statistics.exportToPDF();
});

// إضافة أنماط CSS للتأثيرات
const statisticsStyles = document.createElement('style');
statisticsStyles.textContent = `
    .table-row-hover:hover {
        background-color: rgba(13, 110, 253, 0.05) !important;
        transform: scale(1.01);
        transition: all 0.2s ease;
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-in forwards;
        opacity: 0;
    }
    
    @keyframes fadeIn {
        to { opacity: 1; }
    }
    
    .progress-bar {
        transition: width 1s ease-in-out;
    }
    
    @media print {
        .btn, .card-header, nav, .modal {
            display: none !important;
        }
        
        .card {
            border: 1px solid #000 !important;
            break-inside: avoid;
        }
    }
`;
document.head.appendChild(statisticsStyles);