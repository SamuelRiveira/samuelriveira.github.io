/**
 * Clase encargada de gestionar la interfaz según el rol del usuario
 * Controla la visualización de elementos y opciones de menú basado en permisos
 */
import { UserAuthManager } from "../managers/UserAuthManager.js";
import { ProfileManager } from "../managers/ProfileManager.js";
import { API } from "../services/APIS.js";
import { PetManager } from "../managers/PetManager.js";
import { PetEdit } from "./PetEdit.js";
import { notificationService } from "../services/NotificationService.js";
import { AppointmentDataManager } from "../services/AppointmentDataManager.js";
import { abrir } from "../core/openLogin.js";

// La función abrir está disponible globalmente desde openLogin.js
class RoleUIManager {
    constructor() {
        this.userStatus = null;
        this.init();
    }
    
    /**
     * Inicializa el gestor de UI basado en roles
     */
    async init() {
        // Obtener estado actual del usuario
        await this.refreshUserStatus();
        
        // Configurar la UI según el estado y rol
        this.setupUI();
        
        // Configurar listeners de eventos
        this.setupEventListeners();
    }
    
    /**
     * Actualiza el estado del usuario desde el gestor de autenticación
     * @returns {Promise<void>}
     */
    async refreshUserStatus() {
        this.userStatus = await UserAuthManager.getUserStatus();
    }
    
    /**
     * Configura la UI basada en el estado de sesión y rol del usuario
     */
    setupUI() {
        // Configurar menú de navegación
        this.setupNavigation();
        
        // Configurar botones de sesión
        this.setupSessionButtons();
        
        // Si tiene sesión iniciada, cargar componentes específicos del rol
        if (this.userStatus.isLoggedIn) {
            this.createRolePages();
        }
    }
    
    /**
     * Configura el menú de navegación según el rol
     */
    setupNavigation() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        // Guardar enlaces existentes para referencia
        const existingLinks = Array.from(nav.querySelectorAll('a'));
        const homeLink = existingLinks.find(link => link.getAttribute('data-page') === 'home');
        const profileLink = existingLinks.find(link => link.getAttribute('data-page') === 'profile');
        const sessionControl = existingLinks.find(link => link.classList.contains('session-control'));
        
        // Limpiar el menú actual
        nav.innerHTML = '';
        
        // Agregar enlace de inicio (siempre visible)
        if (homeLink) {
            nav.appendChild(homeLink);
        }
        
        // Si no hay sesión iniciada, solo mostrar "Inicio" y el botón de iniciar sesión
        if (!this.userStatus.isLoggedIn) {
            // Añadir el botón de iniciar sesión al final del menú
            this.addSessionControlButton(nav, false);
            return;
        }
        
        // Si hay sesión iniciada, agregar enlaces según el rol
        if (this.userStatus.userRole === 'cliente') {
            // Para clientes: mostrar enlaces existentes (mascotas, citas, etc.)
            existingLinks.forEach(link => {
                const page = link.getAttribute('data-page');
                if (page !== 'home' && !link.classList.contains('session-control')) {
                    nav.appendChild(link);
                }
            });
        } else if (this.userStatus.userRole === 'empleado') {
            // Para empleados: enlaces específicos
            this.addNavLink(nav, 'client-management', 'Usuarios', `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    style="transform: translateY(1.3px);">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            `);
            
            this.addNavLink(nav, 'appointments-admin', 'Gestión Citas', `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    style="transform: translateY(1.3px);">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            `);
            
            // Agregar enlace de perfil
            if (profileLink) {
                nav.appendChild(profileLink);
            }
        } else if (this.userStatus.userRole === 'admin') {
            // Para admins: enlaces de administración y desarrollo
            
            this.addNavLink(nav, 'users-admin', 'Usuarios', `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    style="transform: translateY(1.3px);">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            `);
            
            // Agregar enlace de perfil
            if (profileLink) {
                nav.appendChild(profileLink);
            }
        }
        
        // Añadir el botón de cerrar sesión al final del menú
        this.addSessionControlButton(nav, true);
    }
    
    /**
     * Agrega un enlace de navegación
     * @param {HTMLElement} navEl - Elemento nav donde se agregará el enlace
     * @param {string} page - ID de la página destino
     * @param {string} text - Texto del enlace
     * @param {string} iconHTML - HTML del ícono
     */
    addNavLink(navEl, page, text, iconHTML) {
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('data-page', page);
        link.innerHTML = `<i class="icon">${iconHTML}</i> ${text}`;
        navEl.appendChild(link);
    }
    
    /**
     * Añade el botón de control de sesión al menú de navegación
     * @param {HTMLElement} navEl - Elemento de navegación donde añadir el botón
     * @param {boolean} isLoggedIn - Si el usuario está autenticado
     */
    addSessionControlButton(navEl, isLoggedIn) {
        const sessionControlButton = document.createElement('a');
        sessionControlButton.href = 'javascript:void(0);'; // Usar javascript:void(0) para prevenir navegación
        sessionControlButton.classList.add('btn', 'btn-outline', 'session-control');
        
        if (isLoggedIn) {
            // Mostrar botón de cierre de sesión si está autenticado
            sessionControlButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    style="transform: translateY(1.3px);">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Cerrar Sesión
            `;
            
            // Agregar el evento de cierre de sesión
            sessionControlButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Detener la propagación del evento
                UserAuthManager.logout();
                // Recargar la página para actualizar el estado
                window.location.reload();
            });
        } else {
            // Mostrar botón de inicio de sesión si no está autenticado
            sessionControlButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    style="transform: translateY(1.3px);">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar Sesión
            `;
            
            // Agregar el evento de inicio de sesión
            sessionControlButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Detener la propagación del evento
                // Mostrar el popup de login sin afectar la navegación
                this.openLoginPopup(e);
            });
        }
        
        // Asegurarnos de que el botón se agregue al final del menú
        navEl.appendChild(sessionControlButton);
    }

    /**
     * Abre el popup de inicio de sesión
     * @param {Event} e - Evento del clic
     */
    openLoginPopup(e) {
        e.preventDefault();
        // Llamamos a la función abrir importada desde openLogin.js
        // pero también nos aseguramos que el evento funcione con el onclick
        abrir();
    }

    /**
     * Configura los botones de control de sesión (mantenido por compatibilidad)
     */
    setupSessionButtons() {
        // Esta función se mantiene para compatibilidad con código existente
        // Toda la funcionalidad ahora está en setupNavigation y addSessionControlButton
    };
    
    /**
     * Crea las páginas específicas para cada rol
     */
    createRolePages() {
        const main = document.body;
        
        if (this.userStatus.userRole === 'empleado') {
            // Crear páginas de empleado si no existen
            if (!document.getElementById('client-management-page')) {
                this.createEmployeePages(main);
            }
        } else if (this.userStatus.userRole === 'admin') {
            // Crear páginas de admin si no existen
            if (!document.getElementById('system-admin-page')) {
                this.createDeveloperPages(main);
            }
        }
    }
    
    /**
     * Crea las páginas específicas para empleados
     * @param {HTMLElement} container - Contenedor donde se agregarán las páginas
     */
    createEmployeePages(container) {
        // Página de gestión de clientes
        const clientManagementPage = document.createElement('div');
        clientManagementPage.id = 'client-management-page';
        clientManagementPage.className = 'page';
        clientManagementPage.innerHTML = `
            <div class="container">
                <div class="page-header">
                    <h1>Gestión de Usuarios</h1>
                    <p>Administra la información de los Usuarios de CuidaPet</p>
                </div>
                <div class="content-card">
                    <div class="card-header">
                        <div class="header-row">
                            <h3>Listado de Usuarios</h3>
                            <div class="action-buttons">
                                <button id="delete-users-btn" class="btn btn-danger" style="display: none;">
                                    <i class="fas fa-trash"></i> Eliminar Seleccionados
                                </button>
                                <button id="create-user-btn" class="btn btn-primary">
                                    <i class="fas fa-plus"></i> Crear Usuario
                                </button>
                            </div>
                        </div>
                        <div class="search-filter-container">
                            <div class="search-container">
                                <input type="text" id="user-search-input" class="search-input" placeholder="Buscar usuario...">
                                <button id="user-search-btn" class="btn btn-primary">Buscar</button>
                            </div>
                            <div class="filter-container">
                                <select id="user-role-filter" class="filter-select">
                                    <option value="all">Todos los usuarios</option>
                                    <option value="cliente">Solo clientes</option>
                                    <option value="empleado">Solo empleados</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="client-list" class="client-list">
                        <div class="loading-container">
                            <div class="loader"></div>
                            <p>Cargando usuarios...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(clientManagementPage);

        // Crear el modal para nuevo usuario
        const modalHTML = `
            <div id="user-modal" class="modal">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h2>Crear Nuevo Usuario</h2>
                    <form id="create-user-form">
                        <div class="form-group">
                            <label for="user-email">Email:</label>
                            <input type="email" id="user-email" required>
                        </div>
                        <div class="form-group">
                            <label for="user-password">Contraseña:</label>
                            <input type="password" id="user-password" minlength="6" required>
                        </div>
                        <div class="form-group">
                            <label for="user-role">Rol:</label>
                            <select id="user-role" required>
                                <option value="1">Cliente</option>
                                <option value="2">Empleado</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-user-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Crear Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Añadir el modal al final del body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Cargar usuarios cuando se crea la página
        this.loadAndDisplayUsers();
        
        // Configurar el modal
        const modal = document.getElementById('user-modal');
        const createUserBtn = document.getElementById('create-user-btn');
        const closeBtn = document.querySelector('#user-modal .close-btn');
        const cancelBtn = document.getElementById('cancel-user-btn');
        const createUserForm = document.getElementById('create-user-form');
        
        // Mostrar el modal al hacer clic en el botón de crear usuario
        if (createUserBtn) {
            createUserBtn.addEventListener('click', () => {
                modal.style.display = 'block';
            });
        }
        
        // Cerrar el modal al hacer clic en la X
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Cerrar el modal al hacer clic en Cancelar
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Cerrar el modal al hacer clic fuera del contenido
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Manejar el envío del formulario
        if (createUserForm) {
            createUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('user-email').value;
                const password = document.getElementById('user-password').value;
                const roleId = parseInt(document.getElementById('user-role').value);
                
                try {
                    // Mostrar indicador de carga
                    const submitBtn = createUserForm.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
                    
                    // Llamar a la API para crear el usuario
                    const resultado = await API.registrarUsuario(email, password, roleId);
                    
                    if (resultado.success) {
                        // Mostrar mensaje de éxito
                        notificationService.showSuccess('Usuario creado exitosamente');
                        // Recargar la lista de usuarios
                        this.loadAndDisplayUsers();
                        // Cerrar el modal y limpiar el formulario
                        modal.style.display = 'none';
                        createUserForm.reset();
                    } else {
                        throw new Error(resultado.error?.message || 'Error al crear el usuario');
                    }
                } catch (error) {
                    notificationService.showError(`Error: ${error.message}`);
                } finally {
                    // Restaurar el botón
                    const submitBtn = createUserForm.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Crear Usuario';
                    }
                }
            });
        }

        // Configurar eventos de búsqueda y filtrado
        const searchInput = document.getElementById('user-search-input');
        const searchButton = document.getElementById('user-search-btn');
        const roleFilter = document.getElementById('user-role-filter');
        
        // Mostrar/ocultar botón de eliminar según selección
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('user-checkbox') || e.target.classList.contains('checkbox-label')) {
                this.toggleDeleteButton();
            }
        });

        // Evento para el botón de búsqueda
        searchButton.addEventListener('click', () => {
            this.filterUsers(searchInput.value, roleFilter.value);
        });

        // Evento para buscar al presionar Enter en el campo de búsqueda
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.filterUsers(searchInput.value, roleFilter.value);
            }
        });

        // Evento para el filtro de rol
        roleFilter.addEventListener('change', () => {
            this.filterUsers(searchInput.value, roleFilter.value);
        });

        // Configurar el botón de eliminar usuarios
        const deleteUsersBtn = document.getElementById('delete-users-btn');
        if (deleteUsersBtn) {
            deleteUsersBtn.addEventListener('click', () => this.confirmDeleteUsers());
        }
        
        // Agregar estilos para el modo de selección
        const style = document.createElement('style');
        style.textContent = `
            .user-selection {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 2;
            }
            .user-checkbox {
                display: none;
            }
            .checkbox-label {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #ddd;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                position: relative;
            }
            .checkbox-label:after {
                content: '';
                position: absolute;
                display: none;
                left: 6px;
                top: 2px;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 3px 3px 0;
                transform: rotate(45deg);
            }
            .user-checkbox:checked + .checkbox-label {
                background: #dc3545;
                border-color: #dc3545;
            }
            .user-checkbox:checked + .checkbox-label:after {
                display: block;
            }
            .client-card {
                position: relative;
                transition: all 0.3s ease;
            }
            .client-card.selected {
                border: 2px solid #dc3545;
                box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
            }
            .action-buttons {
                display: flex;
                gap: 10px;
            }
        `;
        document.head.appendChild(style);
        
        // Página de administración de citas
        const appointmentsAdminPage = document.createElement('div');
        appointmentsAdminPage.id = 'appointments-admin-page';
        appointmentsAdminPage.className = 'page';
        appointmentsAdminPage.innerHTML = `
            <div class="container">
                <div class="page-header">
                    <h1>Administración de Citas</h1>
                    <p>Gestiona todas las citas programadas en CuidaPet</p>
                </div>
                <div class="content-card">
                    <div class="card-header">
                        <h3>Calendario de Citas</h3>
                        <div class="filter-container">
                            <select class="filter-select" id="appointment-status-filter">
                                <option value="all">Todas las citas</option>
                                <option value="pending">Pendientes</option>
                                <option value="completed">Expiradas</option>
                                <option value="cancelled">Canceladas</option>
                            </select>
                            <input type="date" class="date-filter" id="appointment-date-filter">
                        </div>
                    </div>
                    <div class="appointments-calendar">
                        <div class="appointments-grid" id="appointments-grid">
                            <p>Cargando calendario de citas...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(appointmentsAdminPage);
    }
    
    /**
     * Carga y muestra todos los usuarios en la página de gestión de usuarios
     */
    async loadAndDisplayUsers() {
        try {
            const clientList = document.getElementById('client-list');
            if (!clientList) return;

            // Intentar obtener todos los usuarios mediante el ProfileManager
            const { success, data, error } = await ProfileManager.getAllUsers();
            
            if (!success || !data) {
                throw new Error(error || 'Error al cargar los usuarios');
            }
            
            // Guardar los datos originales para usarlos en filtrado
            this.allUsers = data;
            
            // Mostrar los usuarios
            this.renderUserCards(data);
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            const clientList = document.getElementById('client-list');
            if (clientList) {
                clientList.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar los usuarios. Por favor, intenta nuevamente.</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Renderiza las tarjetas de usuarios basado en los datos proporcionados
     * @param {Array} users - Array de objetos usuario para mostrar
     */
    renderUserCards(users) {
        const clientList = document.getElementById('client-list');
        if (!clientList) return;
        
        // Si no hay usuarios para mostrar
        if (!users || users.length === 0) {
            clientList.innerHTML = '<p class="no-results">No se encontraron usuarios con los criterios especificados.</p>';
            return;
        }
        
        // Limpiar la lista antes de agregar nuevas tarjetas
        clientList.innerHTML = '';
        
        // Crear una tarjeta para cada usuario
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'client-card';
            userCard.dataset.userId = user.id_usuario;
            userCard.dataset.userRole = user.rol?.nombre_rol || 'N/A';
            
            // Checkbox para selección múltiple
            const checkbox = `
                <div class="user-selection">
                    <input type="checkbox" class="user-checkbox" id="user-${user.id_usuario}" 
                           data-user-id="${user.id_usuario}">
                    <label for="user-${user.id_usuario}" class="checkbox-label"></label>
                </div>`;
            
            // Determinar los botones según el rol
            let actionButtons = '';
            if (user.rol?.nombre_rol === 'cliente') {
                actionButtons = `
                    <button class="btn view-profile-btn" data-user-id="${user.id_usuario}">
                        <i class="fas fa-user-circle"></i> Ver Perfil
                    </button>
                    <button class="btn view-pets-btn" data-user-id="${user.id_usuario}">
                        <i class="fas fa-paw"></i> Ver Mascotas
                    </button>
                `;
            } else {
                actionButtons = `
                    <button class="btn view-profile-btn" data-user-id="${user.id_usuario}">
                        <i class="fas fa-user-circle"></i> Ver Perfil
                    </button>
                `;
            }
            
            // Construir HTML de la tarjeta
            userCard.innerHTML = `
                ${checkbox}
                <div class="client-avatar">
                    <img src="${user.imagen || '/Frontend/imagenes/img_perfil.png'}" alt="Avatar" 
                         onerror="this.src='/Frontend/imagenes/img_perfil.png'">
                </div>
                <div class="client-info">
                    <h4>${user.nombre || 'Sin nombre'} ${user.apellidos || ''}</h4>
                    <p><i class="fas fa-user-tag"></i> ${user.rol?.nombre_rol || 'Sin rol'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${user.direccion || 'Dirección no especificada'}</p>
                    <hr class="client-card-divider">
                    <div class="client-card-actions">
                        ${actionButtons}
                    </div>
                </div>
            `;
            
            clientList.appendChild(userCard);
        });
        
        // Agregar event listeners para los botones
        this.setupUserCardEventListeners();
        
        // Configurar checkboxes para selección múltiple
        this.setupUserSelection();
    }
    
    /**
     * Configura la selección de usuarios
     */
    setupUserSelection() {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const card = e.target.closest('.client-card');
                if (e.target.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        });
    }
    
    /**
     * Muestra u oculta el botón de eliminar según los usuarios seleccionados
     */
    toggleDeleteButton() {
        const deleteBtn = document.getElementById('delete-users-btn');
        const selectedUsers = document.querySelectorAll('.user-checkbox:checked');
        
        if (selectedUsers.length > 0) {
            deleteBtn.style.display = 'inline-flex';
        } else {
            deleteBtn.style.display = 'none';
        }
    }
    
    /**
     * Muestra el diálogo de confirmación para eliminar usuarios
     */
    async confirmDeleteUsers() {
        const selectedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked'));
        if (selectedUsers.length === 0) return;
        
        const userIds = selectedUsers.map(checkbox => checkbox.dataset.userId);
        const userCount = userIds.length;
        
        const confirmed = await notificationService.showConfirmation(
            `¿Estás seguro de que deseas eliminar ${userCount} usuario(s) seleccionado(s)?`,
            'Esta acción no se puede deshacer. Se eliminarán los usuarios, sus perfiles y sus imágenes de perfil.'
        );
        
        if (confirmed) {
            try {
                // Mostrar indicador de carga
                const notificationId = notificationService.showLoading(`Eliminando ${userCount} usuario(s)...`);
                
                // Llamar a la API para eliminar los usuarios
                const result = await API.eliminarUsuarios(userIds);
                
                // Cerrar notificación de carga
                notificationService.close(notificationId);
                
                if (result.success) {
                    notificationService.showSuccess(`Se eliminaron ${result.deletedCount} usuario(s) correctamente.`);
                    
                    // Recargar la lista de usuarios
                    await this.loadAndDisplayUsers();
                    
                    // Ocultar el botón de eliminar
                    const deleteBtn = document.getElementById('delete-users-btn');
                    if (deleteBtn) {
                        deleteBtn.style.display = 'none';
                    }
                } else {
                    const errorMessage = result.errors?.length > 0 
                        ? result.errors.map(e => `Usuario ${e.userId}: ${e.error}`).join('<br>') 
                        : 'Error desconocido al eliminar usuarios';
                    notificationService.showError(`Error al eliminar usuarios:<br>${errorMessage}`, 10000);
                }
            } catch (error) {
                console.error('Error al eliminar usuarios:', error);
                notificationService.showError(`Error al eliminar usuarios: ${error.message || 'Error desconocido'}`);
            }
        }
    }
    
    /**
     * Configura los event listeners para los botones en las tarjetas de usuario
     */
    setupUserCardEventListeners() {
        // Event listener para botones "Ver Mascotas"
        const viewPetsButtons = document.querySelectorAll('.view-pets-btn');
        viewPetsButtons.forEach(button => {
            button.addEventListener('click', function() {
                RoleUIManager.showClientPets(this);
            });
        });
        
        // Event listener para botones "Ver Perfil"
        const viewProfileButtons = document.querySelectorAll('.view-profile-btn');
        viewProfileButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const userId = this.dataset.userId;
                try {
                    // Navegar a la página de perfil, pasando el ID del usuario
                    await RoleUIManager.navigateToPage('profile', userId);
                    
                    // Cargar los datos del perfil usando el método estático de ProfileUI
                    if (window.profileUI && typeof window.profileUI.loadProfileData === 'function') {
                        await window.profileUI.loadProfileData(userId);
                    } else {
                        console.error('No se pudo cargar el perfil: ProfileUI no está inicializado');
                        notificationService.showError('No se pudo cargar el perfil del usuario');
                    }
                } catch (error) {
                    console.error('Error al cargar el perfil:', error);
                    notificationService.showError('Ocurrió un error al cargar el perfil');
                }
            });
        });
    }
    
    /**
     * Filtra los usuarios según el texto de búsqueda y el rol seleccionado
     * @param {string} searchText - Texto para buscar en nombres de usuarios
     * @param {string} roleFilter - Filtro de rol ('all', 'cliente', 'empleado')
     */
    filterUsers(searchText, roleFilter) {
        // Si no tenemos datos de usuarios, no podemos filtrar
        if (!this.allUsers) return;
        
        // Convertir a minúsculas para comparación insensible a mayúsculas/minúsculas
        const search = searchText.toLowerCase();
        
        // Filtrar los usuarios
        const filteredUsers = this.allUsers.filter(user => {
            // Filtrar por texto de búsqueda en nombre y apellidos
            const fullName = `${user.nombre || ''} ${user.apellidos || ''}`.toLowerCase();
            const matchesSearch = search === '' || fullName.includes(search);
            
            // Filtrar por rol
            const userRole = user.rol?.nombre_rol || '';
            const matchesRole = roleFilter === 'all' || userRole === roleFilter;
            
            return matchesSearch && matchesRole;
        });
        
        // Renderizar los usuarios filtrados
        this.renderUserCards(filteredUsers);
    }
    
    /**
     * Crea las páginas específicas para admins
     * @param {HTMLElement} container - Contenedor donde se agregarán las páginas
     */
    createDeveloperPages(container) {        
        // Página de administración de usuarios
        const usersAdminPage = document.createElement('div');
        usersAdminPage.id = 'users-admin-page';
        usersAdminPage.className = 'page';
        usersAdminPage.innerHTML = `
            <div class="container">
                <div class="page-header">
                    <h1>Administración de Usuarios</h1>
                    <p>Gestiona los usuarios y sus roles en el sistema</p>
                </div>
                <div class="content-card">
                    <div class="card-header">
                        <h3>Usuarios del Sistema</h3>
                        <button class="btn btn-primary">Crear usuario</button>
                    </div>
                    <div class="users-list">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6">Cargando usuarios...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(usersAdminPage);
    }
    
    /**
     * Configura los listeners de eventos para la UI
     */
    setupEventListeners() {
        // Escuchar clics en los enlaces de navegación
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('nav a');
            if (navLink) {
                e.preventDefault();
                this.handleNavigation(navLink.getAttribute('data-page'));
            }
        });
        
        // Carga de citas si el usuario es empleado
        if (this.userStatus.isLoggedIn && this.userStatus.userRole === 'empleado') {
            this.initAppointmentsCalendar();
        }
    }
    
    /**
     * Inicializa el calendario de citas para empleados
     */
    initAppointmentsCalendar() {
        // Esperar a que el DOM esté completamente cargado para manipularlo
        document.addEventListener('DOMContentLoaded', () => {
            this.loadAppointments();
        });

        // Si el DOM ya está cargado, inicializar directamente
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.loadAppointments();
        }

        // Configurar los filtros de citas
        const statusFilter = document.getElementById('appointment-status-filter');
        const dateFilter = document.getElementById('appointment-date-filter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.loadAppointments();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.loadAppointments();
            });
        }
    }

    /**
     * Carga las citas usando el gestor de datos de citas
     */
    async loadAppointments() {
        try {
            const appointmentsGrid = document.getElementById('appointments-grid');
            if (!appointmentsGrid) return;

            appointmentsGrid.innerHTML = '<p>Cargando citas...</p>';

            // Obtener los valores de los filtros
            const statusFilter = document.getElementById('appointment-status-filter');
            const dateFilter = document.getElementById('appointment-date-filter');

            const filters = {};
            if (statusFilter && statusFilter.value !== 'all') {
                filters.status = statusFilter.value;
            }
            if (dateFilter && dateFilter.value) {
                filters.date = dateFilter.value;
            }

            // Cargar las citas usando el gestor de datos
            const appointmentManager = new AppointmentDataManager();
            const appointments = await appointmentManager.getAppointments(filters);

            // Si no hay citas, mostrar mensaje
            if (appointments.length === 0) {
                appointmentsGrid.innerHTML = '<p>No hay citas que coincidan con los filtros seleccionados.</p>';
                return;
            }

            // Limpiar el contenedor
            appointmentsGrid.innerHTML = '';

            // Crear las tarjetas de citas
            const cardPromises = appointments.map(async appointment => {
                try {
                    const card = await this.createAppointmentCard(appointment);
                    return card;
                } catch (error) {
                    console.error('Error creando tarjeta de cita:', error);
                    return null;
                }
            });

            // Esperar a que todas las tarjetas se creen
            const cards = await Promise.all(cardPromises);
            
            // Añadir solo las tarjetas que se crearon correctamente
            cards.forEach(card => {
                if (card) {
                    appointmentsGrid.appendChild(card);
                }
            });

            // Aplicar estilo de grid al contenedor
            appointmentsGrid.style.display = 'grid';
            appointmentsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            appointmentsGrid.style.gap = '2rem';
        } catch (error) {
            console.error('Error al cargar las citas:', error);
            const appointmentsGrid = document.getElementById('appointments-grid');
            if (appointmentsGrid) {
                appointmentsGrid.innerHTML = '<p>Error al cargar las citas. Por favor, intente de nuevo más tarde.</p>';
            }
        }
    }

    /**
     * Crea una tarjeta de cita con el formato especificado
     * @param {Object} appointment - Datos de la cita
     * @returns {Promise<HTMLElement>} - Promesa que resuelve al elemento de la tarjeta de cita
     */
    async createAppointmentCard(appointment) {
        const appointmentDate = appointment.date;
        const day = appointmentDate.getDate();
        const month = AppointmentDataManager.getMonthName(appointmentDate.getMonth());
        const time = AppointmentDataManager.formatTime(appointmentDate);
        const idUsuario = await API.obtenerUsuarioIdPorMascotaId(appointment.id_mascota);
        const usuarioResponse = await API.obtenerPerfilUsuarioId(idUsuario.data.id_usuario);
        const usuario = usuarioResponse.success ? usuarioResponse.data : null;
        
        // Obtener datos de servicio y mascota en paralelo
        const [servicioResponse, mascotaResponse] = await Promise.all([
            API.obtenerServicioPorId(appointment.id_servicio),
            API.obtenerMascotaPorId(appointment.id_mascota)
        ]);
        
        const servicio = servicioResponse.success ? servicioResponse.data : null;
        const mascota = mascotaResponse.success ? mascotaResponse.data : null;
        
        // Determinar el estado basado en is_canceled y fecha/hora
        let status;
        if (appointment.is_canceled) {
            status = 'cancelled';
        } else {
            const now = new Date();
            if (appointmentDate < now) {
                status = 'expired';
            } else {
                status = 'pending';
            }
        }
        
        const statusLabel = AppointmentDataManager.getStatusLabel(status);

        // Crear el elemento de la tarjeta
        const cardElement = document.createElement('div');
        cardElement.className = 'appointment-card';
        cardElement.dataset.appointmentId = appointment.id;
        cardElement.dataset.petId = mascota?.id_mascota || '';
        cardElement.dataset.userId = usuario?.id_usuario || '';
        cardElement.style.cursor = 'pointer';
        
        // Agregar clase según el estado
        if (statusLabel.class) {
            cardElement.classList.add(statusLabel.class);
        }

        // Construir el HTML de la tarjeta
        cardElement.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="appointment-time">
                    <span class="time-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 148.000000 148.000000" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,148.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none">
                            <path d="M635 1471 c-295 -47 -526 -252 -606 -536 -32 -112 -32 -278 0 -390 71 -253 263 -445 516 -516 112 -32 278 -32 390 0 253 71 445 263 516 516 29 103 31 277 5 375 -42 153 -82 202 -135 162 -33 -24 -32 -52 4 -150 157 -436 -250 -893 -710 -797 -232 48 -432 248 -480 480 -29 141 -11 268 57 405 101 200 324 339 545 340 115 0 264 -48 361 -117 54 -38 74 -41 102 -13 47 47 11 96 -120 164 -124 65 -313 98 -445 77z"></path>
                            <path d="M696 1208 c-13 -19 -16 -61 -16 -255 0 -220 1 -234 20 -253 18 -18 33 -20 195 -20 162 0 177 2 195 20 11 11 20 29 20 40 0 11 -9 29 -20 40 -18 18 -33 20 -155 20 l-135 0 0 193 c0 215 -6 237 -60 237 -18 0 -34 -8 -44 -22z"></path>
                            </g>
                        </svg>
                    </span>
                    <span class="time">${time}</span>
                </div>
            </div>
            <div class="appointment-content">
                <div class="pet-info-brief">
                    <img src="${mascota?.imagen || 'imagenes/default-pet.png'}" 
                         alt="${mascota?.nombre || 'Mascota'}" 
                         class="pet-thumbnail"
                         onerror="this.src='imagenes/default-pet.png'">
                    <div class="pet-details">
                        <h4>${mascota?.nombre || 'Mascota no encontrada'}</h4>
                        ${mascota ? `<p>${mascota.tipo || ''} ${mascota.raza ? `- ${mascota.raza}` : ''}</p>` : ''}
                    </div>
                </div>
                <div class="appointment-service">
                    <div class="service-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16 14v.5"></path>
                            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                            <path d="M8 14v.5"></path>
                            <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                        </svg>
                    </div>
                    <span class="service-name">${servicio?.nombre_servicio || 'Servicio no disponible'}</span>
                </div>
                <div class="appointment-owner">
                    <div class="owner-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <span class="owner-name">${usuario?.nombre || 'Desconocido'}</span>
                </div>
                <div class="appointment-vet">
                    <div class="vet-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </div>
                    <span class="vet-name">${usuario?.direccion || 'Sin dirección asignada'}</span>
                </div>
                <div class="appointment-status">
                    <span class="status-badge ${statusLabel.class}">${statusLabel.text}</span>
                    <div class="appointment-actions">
                        <button class="appointment-cancel-btn" title="">
                            <span class="appointment-cancel-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                            </span>
                            <span class="appointment-cancel-text">Cancelar</span>
                        </button>
                    </div>
                    <style>
                        .appointment-cancel-btn {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            padding: 6px 12px;
                            background-color: #f8f9fa;
                            border: 1px solid #dc3545;
                            border-radius: 4px;
                            color: #dc3545;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease-in-out;
                        }
                        .appointment-cancel-btn:hover {
                            background-color: #dc3545;
                            color: white;
                        }
                        .appointment-cancel-btn .appointment-cancel-icon {
                            display: flex;
                            align-items: center;
                        }
                        .appointment-cancel-btn .appointment-cancel-text {
                            white-space: nowrap;
                        }
                    </style>
                </div>
            </div>
        `;

        // Add hover effect
        cardElement.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        cardElement.addEventListener('mouseenter', () => {
            cardElement.style.transform = 'translateY(-5px)';
            cardElement.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        });
        cardElement.addEventListener('mouseleave', () => {
            cardElement.style.transform = 'translateY(0)';
            cardElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        });
        
        // Add click handler for the card (excluding cancel button)
        if (cardElement.dataset.petId && cardElement.dataset.userId) {
            const cardContent = cardElement.querySelector('.appointment-content');
            if (cardContent) {
                cardContent.addEventListener('click', async (e) => {
                    // Only navigate if not clicking the cancel button
                    if (!e.target.closest('.appointment-actions')) {
                        const petId = cardElement.dataset.petId;
                        const userId = cardElement.dataset.userId;
                        
                        if (petId && userId) {
                            // Store the current page to return to
                            localStorage.setItem('previousPetPage', 'appointments-admin-page');
                            
                            // Store the client name for the back button
                            const clientName = usuario?.nombre || 'Cliente';
                            localStorage.setItem('currentClientName', clientName);
                            
                            // Navigate to the pet detail page
                            await RoleUIManager.navigateToPage('pet-detail');
                            
                            // Load and display the pet details
                            RoleUIManager.showPetDetail({ dataset: { petId, userId } });
                        }
                    }
                });
            }
        }

        // Mostrar/ocultar botón de cancelar según el rol del usuario y el estado de la cita
        const cancelButton = cardElement.querySelector('.appointment-cancel-btn');
        if (cancelButton) {
            // Solo mostrar el botón de cancelar para empleados y si la cita no está cancelada
            if (this.userStatus.userRole === 'empleado' && !appointment.is_canceled) {
                cancelButton.style.display = 'flex';
                
                // Agregar evento para cancelar la cita
                cancelButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopPropagation();
                    
                    try {
                        // Mostrar diálogo de confirmación
                        const confirmCancel = await notificationService.showConfirmation(
                            'Confirmar cancelación',
                            '¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.'
                        );
                        
                        if (!confirmCancel) return;
                        
                        // Mostrar indicador de carga
                        const loadingId = notificationService.showLoading('Cancelando cita...');
                        
                        // Llamar a la función cancelarCita con el ID de la cita
                        const result = await API.cancelarCita(appointment.id);
                        
                        if (result.success) {
                            // Actualizar el estado en el objeto de la cita
                            appointment.is_canceled = true;
                            
                            // Actualizar la UI para reflejar el cambio
                            // Eliminar clases de estado anteriores
                            cardElement.classList.remove('status-pending', 'status-completed', 'status-cancelled', 'status-expired');
                            
                            // Obtener la nueva etiqueta y añadir la clase correspondiente para estado cancelado
                            const statusLabel = AppointmentDataManager.getStatusLabel('cancelled');
                            cardElement.classList.add(statusLabel.class);
                            
                            // Actualizar el texto del estado
                            const statusBadge = cardElement.querySelector('.status-badge');
                            if (statusBadge) {
                                statusBadge.textContent = statusLabel.text;
                                statusBadge.className = `status-badge ${statusLabel.class}`;
                            }
                            
                            // Ocultar el botón de cancelar
                            cancelButton.style.display = 'none';
                            
                            // Mostrar notificación de éxito
                            notificationService.showSuccess('Cita cancelada exitosamente');
                        } else {
                            throw new Error(result.error || 'Error al cancelar la cita');
                        }
                        
                    } catch (error) {
                        console.error('Error al cancelar la cita:', error);
                        notificationService.showError(error.message || 'Error al cancelar la cita');
                    } finally {
                        // Cerrar el indicador de carga si existe
                        if (loadingId) {
                            notificationService.close(loadingId);
                        }
                    }
                });
            } else {
                // Ocultar el botón para clientes o si la cita ya está cancelada
                cancelButton.style.display = 'none';
            }
        }

        return cardElement;
    }
    
    /**
     * Maneja la navegación entre páginas
     * @param {string} pageId - ID de la página a mostrar
     */
    handleNavigation(pageId) {
        // Obtener todas las páginas
        const pages = document.querySelectorAll('.page');
        const navLinks = document.querySelectorAll('nav a');
        
        // Ocultar todas las páginas
        pages.forEach(page => {
            page.classList.remove('active-page');
        });
        
        // Desactivar todos los enlaces
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Mostrar la página solicitada
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active-page');
            
            // Activar el enlace correspondiente
            const activeLink = document.querySelector(`nav a[data-page="${pageId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
    
    /**
     * Muestra las mascotas de un cliente específico en una página dedicada
     * @param {HTMLElement} button - Botón que activó la acción
     * @static
     */
    static showClientPets(button) {
        // Obtener la tarjeta del cliente desde el botón
        const clientCard = button.closest('.client-card');
        if (!clientCard) return;
        
        // Obtener el nombre del cliente
        const clientName = clientCard.querySelector('h4').textContent;
        
        // Almacenar el nombre del cliente para usarlo en la página
        localStorage.setItem('currentClientName', clientName);
        
        // Obtener la página actual para poder volver a ella después
        const currentPage = document.querySelector('.active-page').id;
        localStorage.setItem('previousPage', currentPage);
        
        // Configurar el botón de retorno y el título de la página
        const backButton = document.getElementById('client-pets-back-button');
        backButton.dataset.page = currentPage.replace('-page', '');
        
        const clientPetsTitle = document.getElementById('client-pets-title');
        clientPetsTitle.textContent = `Mascotas de ${clientName}`;
        
        // Limpiar la lista de mascotas existente
        const petsList = document.querySelector('#client-pets-page .pets-list');
        petsList.innerHTML = '<p>Cargando mascotas...</p>';
        
        // Cambiar a la página de mascotas del cliente
        RoleUIManager.navigateToPage('client-pets');
        
        // Obtener el ID del usuario desde el atributo data-user-id del botón
        const userId = button.dataset.userId;
        
        if (!userId) {
            console.error('No se pudo obtener el ID del usuario');
            petsList.innerHTML = '<p class="error-message">Error al cargar las mascotas. No se pudo identificar al usuario.</p>';
            return;
        }
        
        // Cargar las mascotas del usuario usando la API
        this.loadUserPets(userId, petsList);
    }
    
    /**
     * Carga las mascotas de un usuario específico usando la API
     * @param {string} userId - ID del usuario cuyas mascotas se quieren obtener
     * @param {HTMLElement} petsList - Elemento donde se mostrarán las mascotas
     * @static
     */
    static async loadUserPets(userId, petsList) {
        try {
            // Limpiamos el contenedor de mascotas
            petsList.innerHTML = '';
            
            // Instanciamos PetManager para usar su método de obtención de mascotas
            const petManager = new PetManager();
            
            // Obtenemos las mascotas del usuario específico
            const mascotas = await petManager.getPetsData(userId);

            // Obtenemos las citas de las mascotas del usuario
            const citas = await API.obtenerCitasMascotas(userId);
            
            // Verificamos si hay mascotas
            if (!mascotas || mascotas.length === 0) {
                petsList.innerHTML = `
                    <div class="no-pets-message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11.25 16.25h1.5L12 17z"></path>
                            <path d="M16 14v.5"></path>
                            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                            <path d="M8 14v.5"></path>
                            <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                        </svg>
                        <h3>No hay mascotas registradas</h3>
                        <p>Este usuario no tiene mascotas registradas.</p>
                    </div>
                `;
                return;
            }
            
            // Creamos una grid para las mascotas
            petsList.style.display = 'grid';
            petsList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            petsList.style.gap = '2rem';
            
            // Generamos el HTML para cada mascota
            mascotas.forEach(pet => {
                // Buscar si la mascota tiene citas programadas futuras
                let fechaCita = 'No programada';
                let fechaHora = 'No programada';
                
                if (citas?.data?.length > 0) {
                    // Obtener la fecha y hora actual
                    const ahora = new Date();
                    
                    // Filtrar citas de esta mascota que no estén canceladas y sean futuras
                    const citasFuturas = citas.data.filter(cita => {
                        if (!cita.mascota || cita.mascota.id_mascota !== pet.id || cita.is_canceled) {
                            return false;
                        }
                        
                        // Crear objeto Date con la fecha y hora de la cita
                        const [year, month, day] = cita.fecha.split('-').map(Number);
                        const [hours, minutes] = cita.hora_inicio?.split(':').map(Number) || [0, 0];
                        const fechaHoraCita = new Date(year, month - 1, day, hours, minutes);
                        
                        // Verificar si la cita es futura
                        return fechaHoraCita > ahora;
                    });
                    
                    // Si hay citas futuras, obtener la más próxima
                    if (citasFuturas.length > 0) {
                        // Ordenar por fecha y hora más cercana
                        citasFuturas.sort((a, b) => {
                            const fechaA = new Date(a.fecha + 'T' + (a.hora_inicio || '00:00'));
                            const fechaB = new Date(b.fecha + 'T' + (b.hora_inicio || '00:00'));
                            return fechaA - fechaB;
                        });
                        
                        // Tomar la cita más próxima (la primera después de ordenar)
                        const citaProxima = citasFuturas[0];
                        
                        // Formatear la fecha para mostrarla de manera más amigable
                        const fecha = new Date(citaProxima.fecha);
                        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
                        fechaCita = fecha.toLocaleDateString('es-ES', opciones);
                        
                        // Si tiene hora de inicio, mostrarla también
                        if (citaProxima.hora_inicio) {
                            const hora = citaProxima.hora_inicio.split(':').slice(0, 2).join(':');
                            fechaHora = `${fechaCita} a las ${hora}`;
                        }
                    }
                }
                
                const petCardHTML = `
                    <div class="pet-card" data-pet-id="${pet.id}">
                        <div style="position: relative;">
                            <img src="${pet.photoUrl}" alt="Foto de ${pet.name}" onerror="this.src='/Frontend/imagenes/default-pet.png'">
                            <span class="pet-age">${pet.age} ${pet.ageUnit}</span>
                        </div>
                        <div class="pet-info">
                            <span class="pet-type">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11.25 16.25h1.5L12 17z"></path>
                                    <path d="M16 14v.5"></path>
                                    <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                                    <path d="M8 14v.5"></path>
                                    <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                                </svg>
                                ${pet.type}</span>
                            <h3 class="pet-name">${pet.name}</h3>
                            <p class="pet-breed">${pet.breed}</p>
                            <div class="pet-appointment">
                                <strong>Próxima cita:</strong> ${fechaHora}
                            </div>
                        </div>
                    </div>
                `;
                petsList.insertAdjacentHTML('beforeend', petCardHTML);
            });
            
            // Añadimos event listeners a las tarjetas
            const petCards = petsList.querySelectorAll('.pet-card');
            petCards.forEach(card => {
                card.addEventListener('click', () => {
                    // Usar el método existente para mostrar detalles de la mascota
                    RoleUIManager.showPetDetail(card);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar mascotas del usuario:', error);
            petsList.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar las mascotas: ${error.message || 'Error desconocido'}</p>
                </div>
            `;
        }
    }
    
    /**
     * Método estático para navegar entre páginas
     * @param {string} pageId - ID de la página a mostrar sin el sufijo "-page"
     * @static
     */
    static async navigateToPage(pageId, userId = null) {
        // Usar el sistema de navegación existente
        const navLinks = document.querySelectorAll('[data-page]');
        let targetNavLink;
        
        // Determinar qué enlace resaltar
        if (pageId === 'profile' && userId) {
            // Obtener el ID del usuario actual
            const storedToken = localStorage.getItem('sb-kmypwriazdbxpwdxfhaf-auth-token');
            let currentUserId = null;
            
            if (storedToken) {
                try {
                    const parsedToken = JSON.parse(storedToken);
                    currentUserId = parsedToken.user?.id;
                } catch (error) {
                    console.error('Error al analizar el token de autenticación:', error);
                }
            }
            
            // Si el ID del perfil que se está viendo es diferente al ID del usuario actual,
            // resaltar el enlace de Usuarios
            if (currentUserId && userId !== currentUserId) {
                targetNavLink = document.querySelector('[data-page="users"]');
            } else {
                targetNavLink = document.querySelector(`[data-page="${pageId}"]`);
            }
            
            // Asegurarse de que el ProfileUI se inicialice con el ID de usuario correcto
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                // Si ya existe una instancia, actualizamos el ID de usuario
                if (window.profileUI) {
                    window.profileUI.idUsuario = userId;
                    await window.profileUI.loadProfileData(userId);
                } else {
                    // Si no existe, creamos una nueva instancia con el ID de usuario
                    import('./ProfileUI.js').then(({ ProfileUI }) => {
                        window.profileUI = new ProfileUI(userId);
                    });
                }
            }
        } else {
            targetNavLink = document.querySelector(`[data-page="${pageId}"]`);
        }
        
        // Actualizar clases de navegación
        navLinks.forEach(link => {
            link.classList.toggle('active', link === targetNavLink);
        });
        
        // Mostrar la página solicitada usando el sistema de navegación
        const showPage = window.showPage;
        if (typeof showPage === 'function') {
            showPage(pageId);
        } else {
            // Fallback en caso de que el sistema de navegación no esté disponible
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active-page');
            });
            const targetPage = document.getElementById(`${pageId}-page`);
            if (targetPage) {
                targetPage.classList.add('active-page');
            }
        }
    }
    
    /**
     * Muestra los detalles de una mascota en la página de detalle
     * @param {HTMLElement} petCard - Tarjeta de la mascota que se quiere ver en detalle
     * @static
     */
    static async showPetDetail(petCard) {
        if (!petCard) return;
        
        const petId = petCard.dataset.petId;
        try {
            // Obtener los datos de la mascota desde la API
            const response = await API.obtenerMascotaPorId(petId);
            
            if (!response || !response.data) {
                throw new Error('No se pudieron cargar los datos de la mascota');
            }
            
            // Obtener las citas específicas de esta mascota
            const { success, data: citasMascota, error } = await API.obtenerCitasPorMascota(petId);
            
            if (!success) {
                console.error('Error al obtener las citas de la mascota:', error);
                return;
            }
            
            // Obtener la fecha de la próxima cita (la más reciente)
            let fechaCita = 'No programadas';
            if (citasMascota && citasMascota.length > 0) {
                // Encontrar la próxima cita no cancelada
                const ahora = new Date();
                const hoy = ahora.toISOString().split('T')[0];
                const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                                 ahora.getMinutes().toString().padStart(2, '0');
                
                // Filtrar citas futuras o de hoy pero con hora posterior a la actual
                const citasFuturas = citasMascota.filter(cita => {
                    if (cita.is_canceled) return false;
                    
                    if (cita.fecha > hoy) return true;
                    if (cita.fecha === hoy) {
                        return cita.hora_inicio >= horaActual;
                    }
                    return false;
                });
                
                // Ordenar por fecha y hora más cercanas
                citasFuturas.sort((a, b) => {
                    const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`);
                    const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`);
                    return fechaA - fechaB;
                });
                
                // Tomar la próxima cita o la más reciente si no hay futuras
                const proximaCita = citasFuturas[0] || 
                                   citasMascota.find(c => !c.is_canceled) || 
                                   citasMascota[0];
                
                if (proximaCita) {
                    fechaCita = proximaCita.fecha;
                }
            }
            
            const pet = response.data;
            const petName = pet.nombre || 'Sin nombre';
            const petType = pet.especie || 'No especificado';
            const petBreed = pet.raza || 'Raza no especificada';
            const petAge = pet.edad ? pet.edad : 'Edad no especificada';
            const petWeight = pet.peso ? pet.peso : 'No especificado';
            const notes = pet.notas_especiales || 'Sin notas especiales';
            const allergies = pet.alergia || 'No se han registrado alergias';
            const medicalHistory = pet.historial_medico || 'No hay historial médico registrado';
            const petImage = pet.imagen || '/Frontend/imagenes/default-pet.png';
        
            // Obtener el nombre del cliente (dueño de la mascota)
            const clientName = localStorage.getItem('currentClientName') || 'Cliente';
        
            // Guardar la página actual para poder volver
            const currentPage = document.querySelector('.active-page')?.id || 'pets-page';
            localStorage.setItem('previousPetPage', currentPage);
            
            // Configurar el botón de retorno en la página de detalle
            const backButton = document.querySelector('#pet-detail-page .back-button');
            if (backButton) {
                backButton.dataset.page = currentPage.replace('-page', '');
                backButton.innerHTML = `<span>\u2190</span> Volver`;
            }
            
            // Actualizar la información en la página de detalle
            const detailPage = document.getElementById('pet-detail-page');
            if (!detailPage) return;
            
            // Actualizar el título de la página
            document.title = `${petName} - Detalles | CuidaPet`;
            
            // Actualizar el nombre de la mascota y la información básica
            const petNameElement = detailPage.querySelector('#pet-detail-page h1');
            if (petNameElement) {
                petNameElement.textContent = petName;
                petNameElement.id = 'pet-detail-name';
            }
            
            // Actualizar la raza junto al tag
            const breedElement = detailPage.querySelector('#pet-detail-page .pet-tag');
            if (breedElement && breedElement.nextSibling) {
                breedElement.nextSibling.textContent = ` ${petBreed}`;
            }
            
            // Actualizar el tipo de mascota con el ícono
            const typeElement = detailPage.querySelector('#pet-detail-page .pet-type');
            if (typeElement) {
                typeElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11.25 16.25h1.5L12 17z"></path>
                        <path d="M16 14v.5"></path>
                        <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                        <path d="M8 14v.5"></path>
                        <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                    </svg>
                    ${petType}
                `;
            }
            
            // Actualizar la imagen de la mascota
            const petImageElement = detailPage.querySelector('.pet-photo img');
            if (petImageElement) {
                petImageElement.src = petImage;
                petImageElement.alt = `Foto de ${petName}`;
                petImageElement.onerror = function() {
                    this.src = '/Frontend/imagenes/default-pet.png';
                    this.alt = 'Imagen no disponible';
                };
            }
            
            // Actualizar la información detallada
            const updateInfoElement = (selector, value) => {
                const element = detailPage.querySelector(selector);
                if (element) element.textContent = value || 'No especificado';
            };
            
            // Actualizar la sección de información detallada
            const infoItems = [
                { selector: '.info-item:nth-child(1) .info-value', value: petAge },
                { selector: '.info-item:nth-child(2) .info-value', value: petWeight },
                { selector: '.info-item:nth-child(3) .info-value', value: clientName },
                { selector: '.container-right h2', value: fechaCita }
            ];
            
            infoItems.forEach(item => updateInfoElement(item.selector, item.value));
            
            // Actualizar sección de alergias
            const allergiesSection = detailPage.querySelector('.allergies');
            if (allergiesSection) {
                allergiesSection.innerHTML = `
                    <h3>Alergias</h3>
                    <p>${allergies}</p>
                `;
            }
            
            // Actualizar sección de notas especiales
            const notesSection = detailPage.querySelector('.special-notes');
            if (notesSection) {
                notesSection.innerHTML = `
                    <h3>Notas Especiales</h3>
                    <p>${notes}</p>
                `;
            }
            
            // Actualizar historial médico
            const medicalHistorySection = detailPage.querySelector('.medical-history');
            if (medicalHistorySection) {
                // Procesar el historial médico
                let historialMedico = [];
                
                // Procesar el historial médico que puede venir en diferentes formatos
                if (Array.isArray(medicalHistory)) {
                    // Si ya es un array, usarlo directamente
                    historialMedico = medicalHistory;
                } else if (typeof medicalHistory === 'string') {
                    try {
                        // Intentar parsear si es un string de array JSON
                        if (medicalHistory.trim().startsWith('[')) {
                            historialMedico = JSON.parse(medicalHistory);
                        } else {
                            // Si no es JSON, dividir por saltos de línea
                            historialMedico = medicalHistory.split('\n')
                                .map(item => item.trim())
                                .filter(item => item);
                        }
                    } catch (e) {
                        // Si falla el parseo JSON, tratar como string simple
                        if (medicalHistory.trim()) {
                            historialMedico = [medicalHistory];
                        }
                    }
                }
                
                // Construir el HTML del historial médico
                let medicalHistoryHTML = '<h3>Historial Médico</h3>';
                
                if (historialMedico.length > 0) {
                    medicalHistoryHTML += '<ul class="medical-list">';
                    historialMedico.forEach((item, index) => {
                        medicalHistoryHTML += `
                            <li>${item}</li>
                            ${index < historialMedico.length - 1 ? '<hr class="medical-divider">' : ''}
                        `;
                    });
                    medicalHistoryHTML += '</ul>';
                } else {
                    medicalHistoryHTML += '<ul>No hay registros médicos disponibles.</ul>';
                }
                
                medicalHistorySection.innerHTML = medicalHistoryHTML;
            }
            // Mostrar la página de detalle
            this.navigateToPage('pet-detail');
        } catch (error) {
            console.error('Error al cargar los detalles de la mascota:', error);
            // Mostrar mensaje de error en la interfaz
            const errorSection = detailPage?.querySelector('.error-section');
            if (errorSection) {
                errorSection.innerHTML = `
                    <div class="error-message">
                        <p>Error al cargar los detalles de la mascota: ${error.message || 'Error desconocido'}</p>
                    </div>
                `;
            }
        
        }

        // Inicializar la funcionalidad de edición después de cargar los detalles
        const petEdit = new PetEdit(petId);
        petEdit.initEditButton();
    }
}

export { RoleUIManager };
