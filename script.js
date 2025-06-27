// أيام الأسبوع
const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // إضافة مستمع لكل حقل إدخال وقت
    days.forEach(day => {
        const startHour = document.getElementById(`${day}-start-hour`);
        const startMinute = document.getElementById(`${day}-start-minute`);
        const startPeriod = document.getElementById(`${day}-start-period`);
        const endHour = document.getElementById(`${day}-end-hour`);
        const endMinute = document.getElementById(`${day}-end-minute`);
        const endPeriod = document.getElementById(`${day}-end-period`);

        [startHour, startMinute, startPeriod, endHour, endMinute, endPeriod].forEach(element => {
            element.addEventListener('change', () => {
                saveData();
                calculateDayHours(day);
                calculateTotalHours();
            });
        });
    });

    // زر مسح البيانات
    document.getElementById('clearAllBtn').addEventListener('click', showConfirmModal);

    // أزرار المودال
    document.getElementById('confirmDelete').addEventListener('click', clearAllData);
    document.getElementById('cancelDelete').addEventListener('click', hideConfirmModal);
    document.getElementById('closeSuccess').addEventListener('click', hideSuccessModal);

    // إغلاق المودال عند النقر على X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            hideConfirmModal();
            hideSuccessModal();
        });
    });

    // إغلاق المودال عند النقر خارجه
    window.addEventListener('click', function(event) {
        const confirmModal = document.getElementById('confirmModal');
        const successModal = document.getElementById('successModal');
        if (event.target === confirmModal) {
            hideConfirmModal();
        }
        if (event.target === successModal) {
            hideSuccessModal();
        }
    });
}

// حساب ساعات يوم واحد
function calculateDayHours(day) {
    const startHour = document.getElementById(`${day}-start-hour`).value;
    const startMinute = document.getElementById(`${day}-start-minute`).value;
    const startPeriod = document.getElementById(`${day}-start-period`).value;
    const endHour = document.getElementById(`${day}-end-hour`).value;
    const endMinute = document.getElementById(`${day}-end-minute`).value;
    const endPeriod = document.getElementById(`${day}-end-period`).value;
    const totalElement = document.getElementById(`${day}-total`);

    // التحقق من وجود قيم صالحة وليست كلها صفر
    if (startHour !== null && endHour !== null) {
        // تحويل الوقت إلى تنسيق 24 ساعة
        let startHour24 = parseInt(startHour);
        let endHour24 = parseInt(endHour);

        if (startPeriod === 'PM' && startHour24 !== 12) {
            startHour24 += 12;
        } else if (startPeriod === 'AM' && startHour24 === 12) {
            startHour24 = 0;
        }

        if (endPeriod === 'PM' && endHour24 !== 12) {
            endHour24 += 12;
        } else if (endPeriod === 'AM' && endHour24 === 12) {
            endHour24 = 0;
        }

        // إنشاء كائنات التاريخ
        const start = new Date(2000, 0, 1, startHour24, parseInt(startMinute));
        const end = new Date(2000, 0, 1, endHour24, parseInt(endMinute));

        // إذا كان الوقت نفسه (0:00 AM إلى 0:00 PM مثلاً) أو لا يوجد فرق حقيقي
        if (start.getTime() === end.getTime() ||
            (startHour24 === 0 && endHour24 === 0 && startPeriod === endPeriod)) {
            totalElement.textContent = '0 ساعة';
            return { hours: 0, minutes: 0 };
        }

        // التعامل مع الحالة التي ينتهي فيها الدوام في اليوم التالي
        if (end < start) {
            end.setDate(end.getDate() + 1);
        }

        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0 || diffMinutes > 0) {
            totalElement.textContent = formatTime(diffHours, diffMinutes);
        } else {
            totalElement.textContent = '0 ساعة';
        }

        return { hours: diffHours, minutes: diffMinutes };
    } else {
        totalElement.textContent = '0 ساعة';
        return { hours: 0, minutes: 0 };
    }
}

// حساب إجمالي ساعات الأسبوع
function calculateTotalHours() {
    let totalHours = 0;
    let totalMinutes = 0;

    days.forEach(day => {
        const dayTime = calculateDayHours(day);
        totalHours += dayTime.hours;
        totalMinutes += dayTime.minutes;
    });

    // تحويل الدقائق الإضافية إلى ساعات
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    const totalElement = document.getElementById('totalHours');
    if (totalHours > 0 || totalMinutes > 0) {
        totalElement.textContent = `${totalHours} ساعة و ${totalMinutes} دقيقة`;
    } else {
        totalElement.textContent = '0 ساعة و 0 دقيقة';
    }
}

// حفظ البيانات في Local Storage
function saveData() {
    const data = {};

    days.forEach(day => {
        const startHour = document.getElementById(`${day}-start-hour`).value;
        const startMinute = document.getElementById(`${day}-start-minute`).value;
        const startPeriod = document.getElementById(`${day}-start-period`).value;
        const endHour = document.getElementById(`${day}-end-hour`).value;
        const endMinute = document.getElementById(`${day}-end-minute`).value;
        const endPeriod = document.getElementById(`${day}-end-period`).value;

        data[day] = {
            startHour: startHour,
            startMinute: startMinute,
            startPeriod: startPeriod,
            endHour: endHour,
            endMinute: endMinute,
            endPeriod: endPeriod
        };
    });

    localStorage.setItem('dawamData', JSON.stringify(data));
}

// تحميل البيانات من Local Storage
function loadData() {
    const savedData = localStorage.getItem('dawamData');

    if (savedData) {
        const data = JSON.parse(savedData);

        days.forEach(day => {
            if (data[day]) {
                const startHourSelect = document.getElementById(`${day}-start-hour`);
                const startMinuteSelect = document.getElementById(`${day}-start-minute`);
                const startPeriodSelect = document.getElementById(`${day}-start-period`);
                const endHourSelect = document.getElementById(`${day}-end-hour`);
                const endMinuteSelect = document.getElementById(`${day}-end-minute`);
                const endPeriodSelect = document.getElementById(`${day}-end-period`);

                if (data[day].startHour) {
                    startHourSelect.value = data[day].startHour;
                }
                if (data[day].startMinute) {
                    startMinuteSelect.value = data[day].startMinute;
                }
                if (data[day].startPeriod) {
                    startPeriodSelect.value = data[day].startPeriod;
                }
                if (data[day].endHour) {
                    endHourSelect.value = data[day].endHour;
                }
                if (data[day].endMinute) {
                    endMinuteSelect.value = data[day].endMinute;
                }
                if (data[day].endPeriod) {
                    endPeriodSelect.value = data[day].endPeriod;
                }

                // حساب ساعات اليوم بعد تحميل البيانات
                calculateDayHours(day);
            }
        });

        // حساب إجمالي الساعات بعد تحميل جميع البيانات
        calculateTotalHours();
    }
}

// إظهار مودال التأكيد
function showConfirmModal() {
    document.getElementById('confirmModal').classList.add('show');
}

// إخفاء مودال التأكيد
function hideConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// إظهار مودال النجاح
function showSuccessModal() {
    document.getElementById('successModal').classList.add('show');
}

// إخفاء مودال النجاح
function hideSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

// مسح جميع البيانات
function clearAllData() {
    // إخفاء مودال التأكيد
    hideConfirmModal();

    // مسح البيانات من Local Storage
    localStorage.removeItem('dawamData');

    // مسح جميع حقول الإدخال
    days.forEach(day => {
        document.getElementById(`${day}-start-hour`).value = '0';
        document.getElementById(`${day}-start-minute`).value = '00';
        document.getElementById(`${day}-start-period`).value = 'AM';
        document.getElementById(`${day}-end-hour`).value = '0';
        document.getElementById(`${day}-end-minute`).value = '00';
        document.getElementById(`${day}-end-period`).value = 'PM';
        document.getElementById(`${day}-total`).textContent = '0 ساعة';
    });

    // إعادة تعيين إجمالي الساعات
    document.getElementById('totalHours').textContent = '0 ساعة و 0 دقيقة';

    // إظهار مودال النجاح
    showSuccessModal();
}

// دالة مساعدة لتنسيق الوقت
function formatTime(hours, minutes) {
    if (hours === 0 && minutes === 0) {
        return '0 ساعة';
    } else if (hours === 0) {
        return `${minutes} دقيقة`;
    } else if (minutes === 0) {
        return `${hours} ساعة`;
    } else {
        return `${hours} ساعة و ${minutes} دقيقة`;
    }
}
