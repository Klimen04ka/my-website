// Google Analytics 4 Configuration
// Замените 'GA_MEASUREMENT_ID' на ваш реальный ID измерения

// Расширенная конфигурация событий для бьюти-сайта
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Основная инициализация
gtag('js', new Date());
gtag('config', 'GA_MEASUREMENT_ID', {
    // Основные настройки
    page_title: document.title,
    page_location: window.location.href,
    
    // Настройки для бизнеса
    custom_map: {
        'custom_parameter_1': 'service_type',
        'custom_parameter_2': 'booking_source',
        'custom_parameter_3': 'client_location'
    },
    
    // Отслеживание конверсий
    send_page_view: true,
    
    // GDPR совместимость
    anonymize_ip: true,
    allow_google_signals: false, // Установите true если нужна демография
    allow_ad_personalization_signals: false
});

// Кастомные события для бьюти-бизнеса
const Analytics = {
    // Отслеживание просмотра услуг
    trackServiceView: function(serviceName, servicePrice) {
        gtag('event', 'view_item', {
            currency: 'EUR',
            value: servicePrice,
            items: [{
                item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
                item_name: serviceName,
                category: 'Beauty Services',
                price: servicePrice
            }]
        });
    },

    // Отслеживание клика на бронирование
    trackBookingAttempt: function(serviceName, source = 'website') {
        gtag('event', 'begin_checkout', {
            currency: 'EUR',
            items: [{
                item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
                item_name: serviceName,
                category: 'Beauty Services'
            }],
            custom_parameter_2: source // booking_source
        });
    },

    // Отслеживание успешного бронирования
    trackBookingSuccess: function(serviceName, servicePrice, clientLocation = '') {
        gtag('event', 'purchase', {
            transaction_id: 'booking_' + Date.now(),
            currency: 'EUR',
            value: servicePrice,
            items: [{
                item_id: serviceName.toLowerCase().replace(/\s+/g, '_'),
                item_name: serviceName,
                category: 'Beauty Services',
                price: servicePrice,
                quantity: 1
            }],
            custom_parameter_3: clientLocation // client_location
        });
    },

    // Отслеживание интереса к курсам
    trackCourseInterest: function(courseName, coursePrice) {
        gtag('event', 'add_to_cart', {
            currency: 'EUR',
            value: coursePrice,
            items: [{
                item_id: courseName.toLowerCase().replace(/\s+/g, '_'),
                item_name: courseName,
                category: 'Training Courses',
                price: coursePrice
            }]
        });
    },

    // Отслеживание социальных взаимодействий
    trackSocialClick: function(platform, action = 'click') {
        gtag('event', 'social_interaction', {
            social_network: platform,
            social_action: action,
            social_target: window.location.href
        });
    },

    // Отслеживание просмотра портфолио
    trackPortfolioView: function(category = 'all') {
        gtag('event', 'view_item_list', {
            item_list_name: 'Portfolio',
            item_list_id: 'portfolio_' + category,
            custom_parameter_1: category // service_type
        });
    },

    // Отслеживание контактных взаимодействий
    trackContactAction: function(method) {
        gtag('event', 'contact', {
            method: method, // 'phone', 'instagram', 'email'
            content_type: 'contact_info'
        });
    },

    // Отслеживание скроллинга (для понимания вовлеченности)
    trackScrollDepth: function(percentage) {
        gtag('event', 'scroll', {
            scroll_depth: percentage,
            engagement_time_msec: performance.now()
        });
    },

    // Отслеживание смены языка
    trackLanguageChange: function(language) {
        gtag('event', 'language_change', {
            language: language,
            previous_language: document.documentElement.lang
        });
    },

    // Отслеживание производительности
    trackPerformance: function(metric, value) {
        gtag('event', 'performance_metric', {
            metric_name: metric,
            metric_value: Math.round(value),
            user_agent: navigator.userAgent
        });
    }
};

// Автоматическое отслеживание базовых взаимодействий
document.addEventListener('DOMContentLoaded', function() {
    // Отслеживание кликов по кнопкам бронирования
    document.querySelectorAll('[href="#contact"], .btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const serviceName = this.closest('.service-card, .course-card')
                ?.querySelector('.service-title, .course-title')?.textContent || 'General Inquiry';
            
            Analytics.trackBookingAttempt(serviceName, 'website_button');
        });
    });

    // Отслеживание кликов по социальным ссылкам
    document.querySelectorAll('a[href*="instagram"], a[href*="facebook"], a[href*="telegram"]').forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.href.includes('instagram') ? 'Instagram' :
                            this.href.includes('facebook') ? 'Facebook' : 'Other';
            Analytics.trackSocialClick(platform);
        });
    });

    // Отслеживание просмотра услуг при скролле
    if ('IntersectionObserver' in window) {
        const serviceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const serviceName = entry.target.querySelector('.service-title')?.textContent;
                    const priceText = entry.target.querySelector('.price')?.textContent;
                    const servicePrice = priceText ? parseInt(priceText.replace(/[^\d]/g, '')) : 0;
                    
                    if (serviceName) {
                        Analytics.trackServiceView(serviceName, servicePrice);
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.service-card').forEach(card => {
            serviceObserver.observe(card);
        });
    }

    // Отслеживание глубины скроллинга
    let maxScroll = 0;
    const scrollTracker = debounce(() => {
        const scrollPercent = Math.round(
            ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
        );
        
        if (scrollPercent > maxScroll && scrollPercent >= 25) {
            maxScroll = Math.floor(scrollPercent / 25) * 25; // 25%, 50%, 75%, 100%
            Analytics.trackScrollDepth(maxScroll);
        }
    }, 1000);

    window.addEventListener('scroll', scrollTracker, { passive: true });

    // Отслеживание времени на странице
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Date.now() - startTime;
        gtag('event', 'timing_complete', {
            name: 'page_view_duration',
            value: Math.round(timeOnPage / 1000) // в секундах
        });
    });
});

// Утилита debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Экспорт для использования в других частях сайта
window.Analytics = Analytics;