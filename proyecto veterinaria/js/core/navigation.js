
import { renderPetCards } from "../ui/PetView.js";

// Función para mostrar una página específica
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });

    document.getElementById(pageId + '-page').classList.add('active-page');
}

// Inicialización de la navegación
document.addEventListener('DOMContentLoaded', function() {
    // Renderiza las tarjetas de mascotas al cargar la página
    renderPetCards();

    // Page navigation
    const navLinks = document.querySelectorAll('[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));

            this.classList.add('active');

            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);

            // Si es el enlace de perfil, recargar los datos del perfil
            if (targetPage === 'profile') {
                // Obtener el ID del usuario actual del localStorage
                const storedToken = localStorage.getItem('sb-kmypwriazdbxpwdxfhaf-auth-token');
                let userId = null;
                
                if (storedToken) {
                    try {
                        const parsedToken = JSON.parse(storedToken);
                        userId = parsedToken.user?.id || null;
                    } catch (error) {
                        console.error('Error al analizar el token de autenticación:', error);
                    }
                }
                
                // Verificar si ya existe una instancia de ProfileUI
                if (window.profileUI) {
                    window.profileUI.loadProfileData(userId);
                }
            }
        });
    });

    const backButtons = document.querySelectorAll('.back-button');

    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);

            // Si volvemos a la página de mascotas, actualizamos la lista
            if (targetPage === 'pets') {
                renderPetCards();
            }

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === targetPage);
            });
        });
    });

    const flexButton = document.querySelector('.btn.btn-primary[data-page="appointments"]');

    if (flexButton) {
        flexButton.addEventListener('click', function(e) {
            e.preventDefault();

            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('data-page') === targetPage);
            });
        });
    }
});

export { showPage };
