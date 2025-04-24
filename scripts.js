// scripts.js - Полный код для всех страниц

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.setAttribute('aria-expanded', !isExpanded);
    });

    // Закрытие меню при клике вне его области
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        
        const isClickInside = navLinks.contains(e.target) || menuToggle.contains(e.target);
        
        if (!isClickInside) {
            menuToggle.setAttribute('aria-expanded', 'false');
            navLinks.setAttribute('aria-expanded', 'false');
        }
    });

    // Закрытие меню при ресайзе
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            menuToggle.setAttribute('aria-expanded', 'false');
            navLinks.setAttribute('aria-expanded', 'false');
        }
    });
});

(() => {
    class BookingSystem {
        constructor() {
            this.steps = document.querySelectorAll('.form-step');
            this.currentStep = 1;
            this.bookingData = {
                date: '',
                time: '',
                table: null,
                client: {}
            };
            
            if (document.getElementById('bookingForm')) {
                this.initBookingSystem();
            }
        }

        initBookingSystem() {
            this.generateTables();
            this.setupEventListeners();
            this.showStep(this.currentStep);
        }

        generateTables() {
            const tables = [
                {id: 1, seats: 2, booked: false},
                {id: 2, seats: 4, booked: true},
                {id: 3, seats: 6, booked: false}
            ];

            const container = document.getElementById('tablesContainer');
            if (!container) return;

            container.innerHTML = tables.map(table => `
                <div class="table-item ${table.booked ? 'booked' : ''}" 
                    data-id="${table.id}" 
                    data-seats="${table.seats}"
                    ${table.booked ? 'aria-disabled="true"' : ''}>
                    <div class="table-number">Стол ${table.id}</div>
                    <div class="table-seats">${table.seats} персон</div>
                </div>
            `).join('');
        }

        setupEventListeners() {
            // Обработчики шагов бронирования
            document.querySelectorAll('.next-step').forEach(btn => {
                btn.addEventListener('click', () => this.nextStep());
            });

            document.querySelectorAll('.prev-step').forEach(btn => {
                btn.addEventListener('click', () => this.prevStep());
            });

            // Выбор столиков
            document.addEventListener('click', e => {
                const table = e.target.closest('.table-item:not(.booked)');
                if (table) this.selectTable(table);
            });

            // Отправка формы
            const form = document.getElementById('bookingForm');
            if (form) {
                form.addEventListener('submit', e => this.handleSubmit(e));
            }
        }

        selectTable(table) {
            document.querySelectorAll('.table-item').forEach(t => 
                t.classList.remove('selected'));
            table.classList.add('selected');
        }

        nextStep() {
            if (this.validateStep()) {
                this.currentStep++;
                this.updateStepper();
                if(this.currentStep === 3) this.updateSummary();
            }
        }

        prevStep() {
            this.currentStep--;
            this.updateStepper();
        }

        validateStep() {
            switch(this.currentStep) {
                case 1: return this.validateDateTime();
                case 2: return this.validateTableSelection();
                default: return true;
            }
        }

        validateDateTime() {
            const date = document.getElementById('bookingDate')?.value;
            const time = document.getElementById('bookingTime')?.value;
            return !!date && !!time;
        }

        validateTableSelection() {
            return !!document.querySelector('.table-item.selected');
        }

        updateStepper() {
            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.toggle('active', index === this.currentStep - 1);
            });

            this.steps.forEach((step, index) => {
                step.classList.toggle('active', index === this.currentStep - 1);
            });
        }

        updateSummary() {
            const setText = (selector, value) => {
                const el = document.getElementById(selector);
                if (el) el.textContent = value;
            };

            setText('summaryDate', document.getElementById('bookingDate')?.value);
            setText('summaryTime', document.getElementById('bookingTime')?.value);
            setText('summaryGuests', document.getElementById('guests')?.value);
            setText('summaryTable', 
                document.querySelector('.table-item.selected')?.dataset.id || 'Не выбран');
        }

        handleSubmit(e) {
            e.preventDefault();
            const formData = {
                date: document.getElementById('bookingDate')?.value,
                time: document.getElementById('bookingTime')?.value,
                guests: document.getElementById('guests')?.value,
                table: document.querySelector('.table-item.selected')?.dataset.id,
                name: document.getElementById('clientName')?.value,
                phone: document.getElementById('clientPhone')?.value,
                comments: document.getElementById('comments')?.value
            };

            console.log('Booking Data:', formData);
            alert('Бронь успешно оформлена! Мы свяжемся с вами для подтверждения.');
        }
    }

    class MenuFilter {
        constructor(containerSelector) {
            this.container = document.querySelector(containerSelector);
            if (!this.container) return;

            this.items = this.container.querySelectorAll('.menu-item');
            this.filters = this.container.querySelectorAll('.filter-btn');
            this.init();
        }

        init() {
            this.filters.forEach(filter => {
                filter.addEventListener('click', () => this.handleFilter(filter));
            });
        }

        handleFilter(activeFilter) {
            const category = activeFilter.dataset.category;
            
            this.filters.forEach(f => f.classList.remove('active'));
            activeFilter.classList.add('active');

            this.items.forEach(item => {
                const itemCategory = item.dataset.category;
                const match = category === 'all' || itemCategory === category;
                item.style.display = match ? 'block' : 'none';
            });
        }
    }

    // Инициализация модулей
    document.addEventListener('DOMContentLoaded', () => {
        // Бронирование
        new BookingSystem();

        // Фильтры меню
        new MenuFilter('.menu-grid');
        new MenuFilter('.drinks-grid');
        new MenuFilter('.tea-grid');

        // Мобильное меню
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });

        // Яндекс Карты
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(initMap);
            function initMap() {
                const map = new ymaps.Map('yandexMap', {
                    center: [55.751574, 37.573856],
                    zoom: 16
                });
                
                new ymaps.Placemark([55.751574, 37.573856], {
                    hintContent: 'Копроман'
                }).addTo(map);
            }
        }

        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered:', reg))
                .catch(err => console.log('SW error:', err));
        }
    });

    // Глобальные обработчики
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
})();