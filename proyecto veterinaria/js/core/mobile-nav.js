document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const nav = document.querySelector('#main-nav'); // Más específico para tu nav
    const overlay = document.querySelector('.mobile-nav-overlay');
    const body = document.body; // Definir body aquí

    // --- Inicio: Verificación de selectores (para depuración) ---
    if (!mobileNavToggle) {
        console.error('Error: No se encontró el elemento .mobile-nav-toggle');
    }
    if (!nav) {
        console.error('Error: No se encontró el elemento #main-nav');
    }
    if (!overlay) {
        console.error('Error: No se encontró el elemento .mobile-nav-overlay');
    }
    // --- Fin: Verificación de selectores ---

    // Función para alternar el menú (CORREGIDA)
    function toggleMenu(explicitShow) { // Renombrada la variable para claridad
        // Si alguno de los elementos cruciales no existe, no hagas nada.
        if (!nav || !overlay || !mobileNavToggle) {
            console.error('Faltan elementos esenciales para el menú (nav, overlay o toggle).');
            return;
        }

        const isOpen = nav.classList.contains('active');
        let showEffective; // El estado final (mostrar u ocultar)

        if (explicitShow === undefined) {
            // Si no se especifica explicitShow, alternamos el estado actual
            showEffective = !isOpen;
        } else {
            // Si se especifica, usamos ese valor
            showEffective = explicitShow;
        }

        if (showEffective) {
            // Abrir menú
            body.style.overflow = 'hidden';
            nav.classList.add('active');
            overlay.classList.add('active');
            mobileNavToggle.setAttribute('aria-expanded', 'true');
            
            // Agregar evento de clic en el documento para cerrar al hacer clic fuera
            // Usamos setTimeout para evitar que se cierre inmediatamente si el toggle está "fuera"
            setTimeout(() => {
                document.addEventListener('click', closeMenuOnClickOutside);
            }, 0); // 0 o 10 ms suele ser suficiente
        } else {
            // Cerrar menú
            nav.classList.remove('active');
            overlay.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            
            // Remover el evento de clic del documento
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }
    
    // Función para cerrar el menú al hacer clic fuera
    function closeMenuOnClickOutside(e) {
        if (!nav || !mobileNavToggle) return; // Seguridad

        const isClickInsideNav = nav.contains(e.target);
        const isClickOnToggle = mobileNavToggle.contains(e.target);
        
        if (!isClickInsideNav && !isClickOnToggle) {
            toggleMenu(false);
        }
    }
    
    // Evento para el botón de menú
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Detiene la propagación para closeMenuOnClickOutside
            toggleMenu(); // Llama sin argumentos para que alterne
        });
    }
    
    // Evento para el overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            toggleMenu(false); // Cierra el menú
        });
    }
    
    // Cerrar menú al hacer clic en un enlace (si están dentro del <nav>)
    const navLinks = nav ? nav.querySelectorAll('a') : []; // Asegúrate que nav existe
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Solo cerrar si el menú está visible (móvil) y es un enlace de navegación normal
            if (nav.classList.contains('active') && window.innerWidth <= 767) {
                // Podrías añadir una comprobación para no cerrar en enlaces que abren submenús, si los tuvieras
                toggleMenu(false);
            }
        });
    });
    
    // Cerrar menú con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav && nav.classList.contains('active')) { // Asegúrate que nav existe
            toggleMenu(false);
        }
    });
    
    // Manejo de redimensionamiento (opcional, pero buena práctica)
    let resizeTimer;
    window.addEventListener('resize', function() {
        if (!nav) return; // Asegúrate que nav existe
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 767 && nav.classList.contains('active')) {
                toggleMenu(false); // Cierra el menú si se pasa a vista de escritorio y estaba abierto
            }
        }, 250);
    });
    
    // Inicializar estado del menú (asegurarse de que esté cerrado al cargar)
    // Esto es importante si el HTML no garantiza el estado cerrado por defecto
    // El HTML ya tiene aria-expanded="false", lo que es bueno.
    // Llamar a toggleMenu(false) aquí asegura que todo (clases, overflow) esté correcto.
    // toggleMenu(false); // Descomentar si es necesario forzar el cierre inicial
});