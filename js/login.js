// صفحة تسجيل الدخول - مستشفى الوحدة درنة

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginError = document.getElementById('loginError');
    const rememberMe = document.getElementById('rememberMe');

    // ربط أحداث النموذج
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    
    // تحميل البيانات المحفوظة (إن وجدت)
    loadRememberedCredentials();

    // إضافة تأثيرات بصرية للحقول
    addInputEffects();

    async function handleLogin(e) {
        e.preventDefault();
        
        const username = usernameField.value.trim();
        const password = passwordField.value;
        
        // التحقق من صحة البيانات
        if (!validateInput(username, password)) {
            return;
        }

        // إظهار حالة التحميل
        showLoading(true);
        hideError();

        try {
            // محاولة تسجيل الدخول
            const result = await authSystem.login(username, password);
            
            if (result.success) {
                // حفظ بيانات الاعتماد إذا تم تحديد "تذكرني"
                if (rememberMe.checked) {
                    saveCredentials(username);
                } else {
                    clearSavedCredentials();
                }

                // إظهار رسالة نجاح
                showSuccessMessage('تم تسجيل الدخول بنجاح!');
                
                // إعادة التوجيه بعد تأخير قصير
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } else {
                showError(result.message || 'خطأ في تسجيل الدخول');
                
                // إضافة تأثير اهتزاز للنموذج
                addShakeEffect();
            }
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            showError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        } finally {
            showLoading(false);
        }
    }

    function validateInput(username, password) {
        let isValid = true;
        
        // التحقق من اسم المستخدم
        if (!username) {
            showError('يرجى إدخال اسم المستخدم');
            usernameField.focus();
            isValid = false;
        } else if (username.length < 3) {
            showError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
            usernameField.focus();
            isValid = false;
        }
        
        // التحقق من كلمة المرور
        if (!password) {
            showError('يرجى إدخال كلمة المرور');
            passwordField.focus();
            isValid = false;
        } else if (password.length < 6) {
            showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            passwordField.focus();
            isValid = false;
        }
        
        return isValid;
    }

    function togglePasswordVisibility() {
        const type = passwordField.getAttribute('type');
        const icon = togglePasswordBtn.querySelector('i');
        
        if (type === 'password') {
            passwordField.setAttribute('type', 'text');
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordField.setAttribute('type', 'password');
            icon.className = 'fas fa-eye';
        }
    }

    function showLoading(show) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري تسجيل الدخول...';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>تسجيل الدخول';
        }
    }

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
        loginError.classList.add('fade-in');
    }

    function hideError() {
        loginError.classList.add('d-none');
        loginError.classList.remove('fade-in');
    }

    function showSuccessMessage(message) {
        // إنشاء رسالة نجاح
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success fade-in';
        successAlert.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
        
        // إضافة الرسالة قبل النموذج
        const cardBody = document.querySelector('.card-body');
        cardBody.insertBefore(successAlert, loginForm);
        
        // إخفاء رسالة النجاح بعد 3 ثواني
        setTimeout(() => {
            successAlert.remove();
        }, 3000);
    }

    function addShakeEffect() {
        const card = document.querySelector('.login-card');
        card.classList.add('shake');
        setTimeout(() => {
            card.classList.remove('shake');
        }, 500);
    }

    function addInputEffects() {
        const inputs = [usernameField, passwordField];
        
        inputs.forEach(input => {
            // تأثير عند التركيز
            input.addEventListener('focus', function() {
                this.closest('.input-group').classList.add('input-focused');
                hideError();
            });
            
            // تأثير عند فقدان التركيز
            input.addEventListener('blur', function() {
                this.closest('.input-group').classList.remove('input-focused');
            });
            
            // تأثير عند الكتابة
            input.addEventListener('input', function() {
                if (this.value) {
                    this.closest('.input-group').classList.add('has-value');
                } else {
                    this.closest('.input-group').classList.remove('has-value');
                }
            });
        });
    }

    function saveCredentials(username) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberCredentials', 'true');
    }

    function loadRememberedCredentials() {
        const remembered = localStorage.getItem('rememberCredentials');
        const username = localStorage.getItem('rememberedUsername');
        
        if (remembered === 'true' && username) {
            usernameField.value = username;
            rememberMe.checked = true;
            usernameField.closest('.input-group').classList.add('has-value');
            
            // التركيز على حقل كلمة المرور
            passwordField.focus();
        }
    }

    function clearSavedCredentials() {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberCredentials');
    }

    // إضافة اختصارات لوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        // Enter للإرسال
        if (e.key === 'Enter' && (usernameField.value || passwordField.value)) {
            loginForm.dispatchEvent(new Event('submit'));
        }
        
        // Escape لإلغاء التركيز
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }
    });

    // إضافة تأثير الجسيمات في الخلفية (اختياري)
    createFloatingParticles();

    function createFloatingParticles() {
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
        
        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
                left: ${Math.random() * 100}vw;
                top: ${Math.random() * 100}vh;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            // إزالة الجسيم بعد انتهاء الرسوم المتحركة
            setTimeout(() => {
                particle.remove();
                const index = particles.indexOf(particle);
                if (index > -1) particles.splice(index, 1);
            }, 20000);
        }
    }

    // إضافة أنماط CSS للتأثيرات
    const styles = document.createElement('style');
    styles.textContent = `
        .input-focused .input-group-text {
            background-color: var(--primary-color) !important;
            color: white !important;
            transform: scale(1.05);
        }
        
        .has-value .form-control {
            border-color: var(--success-color);
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-10vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .floating-particle {
            box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        }
    `;
    document.head.appendChild(styles);
});

// دالة للتحقق من حالة الاتصال بالإنترنت
function checkNetworkStatus() {
    if (!navigator.onLine) {
        const offlineAlert = document.createElement('div');
        offlineAlert.className = 'alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3';
        offlineAlert.style.zIndex = '9999';
        offlineAlert.innerHTML = `
            <i class="fas fa-wifi me-2"></i>
            لا يوجد اتصال بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.
        `;
        
        document.body.appendChild(offlineAlert);
        
        // إزالة التحذير عند عودة الاتصال
        window.addEventListener('online', () => {
            offlineAlert.remove();
        });
    }
}

// فحص حالة الاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', checkNetworkStatus);

// مراقبة تغير حالة الاتصال
window.addEventListener('offline', checkNetworkStatus);

// إضافة معلومات النظام لأغراض التشخيص
console.log('نظام مستشفى الوحدة درنة - v1.0');
console.log('المتصفح:', navigator.userAgent);
console.log('اللغة:', navigator.language);
console.log('المنطقة الزمنية:', Intl.DateTimeFormat().resolvedOptions().timeZone);