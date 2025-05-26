/**
 * Clase encargada de la interfaz de usuario de la página de perfil
 */

import { ProfileManager } from "../managers/ProfileManager.js";
import { notificationService } from "../services/NotificationService.js";
import { API } from "../services/APIS.js";

class ProfileUI {
    constructor(idUsuario = null) {
        this.idUsuario = idUsuario;
        this.profileContainer = document.querySelector('.profile-container');
        this.profileData = null;
        this.isEditing = false;
        this.originalHTML = '';
        this.originalPhoto = '';
        this.newPhotoFile = null;
        this.newPhotoUrl = null;
        this.init();
    }

    /**
     * Inicializa la interfaz del perfil
     */
    init() {
        this.loadProfileData(this.idUsuario);
        this.setupEventListeners();
    }

    /**
     * Configura los listeners de eventos
     */
    setupEventListeners() {
        // Agregar evento para modal de confirmación
        document.getElementById('profile-page').addEventListener('click', (e) => {
            // Botón de editar perfil
            if (e.target.closest('.action-buttons2 .btn-primary') || e.target.matches('.action-buttons2 .btn-primary svg path')) {
                e.preventDefault();
                this.toggleEditMode();
            }
        });

        // Configurar eventos para los modales
        this.setupModalEvents();
    }

    /**
     * Configura los eventos para los modales
     */
    setupModalEvents() {
        // Cerrar modal al hacer clic en la X
        const closeButtons = document.querySelectorAll('.close-profile-modal, .close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.pet-modal');
                if (modal) {
                    modal.style.display = 'none';
                    // Si estamos cerrando el modal de actualización, cancelamos la edición
                    if (modal.id === 'profile-update-modal') {
                        this.cancelEdit();
                    }
                }
            });
        });

        // Botón cancelar del modal
        const cancelButton = document.getElementById('cancel-profile-edit-btn');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Botón confirmar del modal
        const confirmButton = document.getElementById('confirm-profile-update-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                // Usar el idUsuario de la instancia actual
                const userIdToUpdate = this.idUsuario || (this.profileData && this.profileData.userId)
                this.updateProfile(userIdToUpdate);
            });
        }
    }

    /**
     * Carga los datos del perfil y construye el HTML dinámicamente
     * @param {string|null} userId - ID del usuario a cargar (opcional, si no se proporciona usa el ID actual)
     */
    async loadProfileData(userId = null) {
        try {
            // Si no se proporcionó un ID, intentar obtener el ID del usuario actual
            if (!userId) {
                userId = this.idUsuario || await this.getCurrentUserId();
            }
            
            // Si aún no tenemos un ID, mostrar mensaje de inicio de sesión
            if (!userId) {
                if (this.profileContainer) {
                    this.profileContainer.innerHTML = `
                        <div class="no-profile-message">
                            <p>Inicia sesión para ver tu perfil</p>
                        </div>`;
                }
                return;
            }
            
            // Actualizar el ID de usuario si es diferente al actual
            if (this.idUsuario !== userId) {
                this.idUsuario = userId;
            }
            // Obtener datos del perfil desde ProfileManager
            this.profileData = await ProfileManager.getUserProfile(this.idUsuario);
            
            // Obtener el rol del usuario desde la API
            const rolResponse = await API.obtenerRolUsuario(this.idUsuario);
            const userRole = rolResponse.success ? rolResponse.role : 'cliente'; // Por defecto a 'cliente' si hay error
            
            // Obtener el ID del usuario actual
            const currentUserId = await this.getCurrentUserId();
            const isCurrentUser = this.idUsuario === currentUserId;
            
            // Actualizar el título de la página
            const pageTitle = document.querySelector('#profile-page h1');
            if (pageTitle) {
                pageTitle.textContent = isCurrentUser ? 'Mi Perfil' : `Perfil de ${this.profileData.name}`;
            }
            
            // Limpiar el contenedor del perfil
            if (this.profileContainer && this.profileData) {
                this.profileContainer.innerHTML = '';
                
                // Determinar el título del perfil
                const profileTitle = isCurrentUser 
                    ? 'Mi perfil' 
                    : `Perfil de ${this.profileData.name}`;
                
                // Construir la estructura completa del perfil
                this.profileContainer.innerHTML = `
                    <!-- Sidebar con información personal -->
                    <div class="profile-sidebar">
                        <div class="profile-photo">
                            <img src="${this.profileData.photo}" alt="Foto de perfil">
                        </div>
                        <div class="profile-name">
                            <h2>${this.profileData.name}</h2>
                        </div>
                        ${userRole !== 'empleado' ? `
                            <div class="profile-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${this.profileData.stats.pets}</div>
                                    <div class="stat-label">Mascotas</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.profileData.stats.appointments}</div>
                                    <div class="stat-label">Citas</div>
                                </div>
                            </div>
                        ` : ''}
                        <div class="action-buttons2">
                            <a href="#" class="btn btn-primary btn-block">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                                Editar perfil
                            </a>
                            <a href="#" class="btn btn-outline btn-block">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                Contactar Soporte
                            </a>
                        </div>
                    </div>

                    <!-- Contenido principal del perfil -->
                    <div class="profile-content">
                        <!-- Información personal -->
                        <div class="content-card">
                            <div class="card-header">
                                <h3>Información Personal</h3>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label for="profile-name-input">Nombre</label>
                                        <input type="text" id="profile-name-input" class="form-control" value="${this.profileData.personalInfo.name}" disabled>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label for="profile-surnames-input">Apellidos</label>
                                        <input type="text" id="profile-surnames-input" class="form-control" value="${this.profileData.personalInfo.surnames}" disabled>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profile-address-input">Dirección</label>
                                <input type="text" id="profile-address-input" class="form-control" value="${this.profileData.personalInfo.address}" disabled>
                            </div>
                        </div>
                    </div>
                `;
                this.originalHTML = this.profileContainer.innerHTML;
            } else {
                console.error('No se pudo cargar el perfil: Datos no disponibles');
                this.profileContainer.innerHTML = '<p>No se pudieron cargar los datos del perfil. Por favor, intente recargar la página.</p>';
            }
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            if (this.profileContainer) {
                this.profileContainer.innerHTML = '<p>Error al cargar el perfil. Por favor, intente nuevamente.</p>';
            }
        }
    }

    /**
     * Activa/desactiva el modo de edición del perfil
     */
    toggleEditMode() {
        if (!this.isEditing) {
            // Guardar el HTML original antes de cambiarlo
            this.originalHTML = this.profileContainer.innerHTML;
            
            // Activar modo edición
            this.enableEditMode();
        } else {
            // Mostrar modal de confirmación
            this.showConfirmationModal();
        }
    }

    /**
     * Habilita el modo de edición en el formulario
     */
    enableEditMode() {
        // Cambiar el estado de edición
        this.isEditing = true;
        
        // Habilitar los campos del formulario usando sus IDs
        const nameInput = this.profileContainer.querySelector('#profile-name-input');
        const surnamesInput = this.profileContainer.querySelector('#profile-surnames-input');
        const addressInput = this.profileContainer.querySelector('#profile-address-input');
        
        if (nameInput) nameInput.disabled = false;
        if (surnamesInput) surnamesInput.disabled = false;
        if (addressInput) addressInput.disabled = false;
        
        // Agregar opción para cambiar la foto de perfil
        const photoContainer = this.profileContainer.querySelector('.profile-photo');
        if (photoContainer) {
            // Guardar la imagen original
            this.originalPhoto = photoContainer.querySelector('img').src;
            
            // Agregar botón para cambiar la foto
            photoContainer.innerHTML = `
                <img src="${this.profileData.photo}" alt="Foto de perfil">
                <div class="change-photo-overlay">
                    <label for="profile-photo-input" class="change-photo-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>Cambiar foto</span>
                    </label>
                    <input type="file" id="profile-photo-input" accept="image/*" style="display: none;">
                </div>
            `;
            
            // Agregar evento para cambiar la foto cuando se selecciona un archivo
            const photoInput = photoContainer.querySelector('#profile-photo-input');
            photoInput.addEventListener('change', (e) => this.handlePhotoChange(e));
        }
        
        // Cambiar el texto del botón de editar y agregar botón de cancelar
        const actionButtonsContainer = this.profileContainer.querySelector('.action-buttons2');
        if (actionButtonsContainer) {
            // Guardar referencia al botón de soporte si existe
            const supportButton = actionButtonsContainer.querySelector('.btn-outline');
            const supportButtonHTML = supportButton ? supportButton.outerHTML : '';
            
            // Actualizar los botones
            actionButtonsContainer.innerHTML = `
                <a href="#" class="btn btn-primary btn-block">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                    Guardar cambios
                </a>
                <a href="#" class="btn btn-outline btn-block cancel-edit-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancelar cambios
                </a>
                ${supportButtonHTML}
            `;
            
            // Añadir evento al botón de cancelar
            const cancelEditBtn = actionButtonsContainer.querySelector('.cancel-edit-btn');
            if (cancelEditBtn) {
                cancelEditBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.cancelEdit();
                });
            }
        }
    }

    /**
     * Muestra el modal de confirmación para actualizar el perfil
     */
    showConfirmationModal() {
        const modal = document.getElementById('profile-update-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * Cierra el modal especificado
     * @param {string} modalId - ID del modal a cerrar
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Cancela la edición del perfil
     */
    cancelEdit() {
        // Restaurar el HTML original
        if (this.profileContainer && this.originalHTML) {
            this.profileContainer.innerHTML = this.originalHTML;
        }
        
        // Limpiar variables temporales
        this.newPhotoFile = null;
        this.newPhotoUrl = null;
        
        // Cambiar el estado de edición
        this.isEditing = false;
        
        // Ocultar modal
        const modal = document.getElementById('profile-update-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reconfigurar eventos después de restaurar el HTML
        this.setupEventListeners();
    }

    /**
     * Maneja el cambio de foto de perfil
     * @param {Event} event - Evento de cambio de archivo
     */
    handlePhotoChange(event) {
        const file = event.target.files[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                this.showErrorMessage('Por favor, selecciona un archivo de imagen válido');
                return;
            }
            
            // Crear una URL para la imagen seleccionada
            const reader = new FileReader();
            reader.onload = (e) => {
                // Actualizar la vista previa de la imagen
                const photoImg = this.profileContainer.querySelector('.profile-photo img');
                if (photoImg) {
                    photoImg.src = e.target.result;
                    // Guardar la nueva imagen para usarla en la actualización
                    this.newPhotoFile = file;
                    this.newPhotoUrl = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * Actualiza el perfil del usuario con los datos del formulario
     */
    async updateProfile(idUsuario = null) {
        try {
            // Obtener los valores actualizados usando IDs únicos
            const nameInput = this.profileContainer.querySelector('#profile-name-input');
            const surnamesInput = this.profileContainer.querySelector('#profile-surnames-input');
            const addressInput = this.profileContainer.querySelector('#profile-address-input');
            
            // Validar que los campos requeridos tengan valor
            if (!nameInput || !surnamesInput || !addressInput) {
                console.error('No se encontraron todos los campos del formulario');
                showError('Error: No se pudieron obtener los datos del formulario');
                return false;
            }
            
            const updatedProfileData = {
                personalInfo: {
                    name: nameInput.value.trim(),
                    surnames: surnamesInput.value.trim(),
                    address: addressInput.value.trim()
                },
                // Incluir la nueva foto si se ha cambiado
                photo: this.newPhotoUrl || this.profileData.photo,
                photoFile: this.newPhotoFile
            };
            
            // Validar datos requeridos
            if (!updatedProfileData.personalInfo.name) {
                this.showWarning('Por favor ingresa tu nombre');
                nameInput.focus();
                return false;
            }
            
            // Actualizar los datos en el servidor
            const success = await ProfileManager.updateUserProfile(updatedProfileData, idUsuario);
            
            if (success) {
                // Actualizar los datos locales
                this.profileData.personalInfo = updatedProfileData.personalInfo;
                this.profileData.name = `${updatedProfileData.personalInfo.name} ${updatedProfileData.personalInfo.surnames}`.trim();
                
                // Actualizar la foto si se ha cambiado
                if (this.newPhotoUrl) {
                    this.profileData.photo = this.newPhotoUrl;
                }
                
                // Limpiar variables temporales
                this.newPhotoFile = null;
                this.newPhotoUrl = null;
                
                // Salir del modo edición
                this.isEditing = false;
                
                // Ocultar modal
                const modal = document.getElementById('profile-update-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Mostrar notificación de éxito
                notificationService.showSuccess('Perfil actualizado correctamente');
                
                // Recargar los datos del perfil para asegurar que todo esté actualizado
                this.loadProfileData(idUsuario || this.idUsuario);
                
                return true;
            } else {
                throw new Error('No se pudo actualizar el perfil');
            }
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            showError(`Error al actualizar el perfil: ${error.message || 'Error desconocido'}`);
            return false;
        }
    }
    /**
     * Obtiene el ID del usuario actual desde el token de autenticación
     * @returns {Promise<string|null>} ID del usuario o null si no se pudo obtener
     */
    async getCurrentUserId() {
        try {
            // Intentar obtener el ID del token almacenado primero
            const storedToken = localStorage.getItem('sb-kmypwriazdbxpwdxfhaf-auth-token');
            if (storedToken) {
                try {
                    const parsedToken = JSON.parse(storedToken);
                    if (parsedToken.user?.id) {
                        return parsedToken.user.id;
                    }
                } catch (error) {
                    console.error('Error al analizar el token de autenticación:', error);
                }
            }
            
            // Si no se pudo obtener del token, intentar con la API
            const response = await API.obtenerPerfilUsuario();
            if (response.success && response.data) {
                return response.data.id_usuario;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }
}

// Inicializar la interfaz del perfil cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página de perfil
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        const urlParams = new URLSearchParams(window.location.search);
        const idUsuario = urlParams.get('id');
        window.profileUI = new ProfileUI(idUsuario);
    }
});

// Método estático para cargar los datos del perfil desde cualquier parte de la aplicación
ProfileUI.loadProfileData = async function(userId = null) {
    if (window.profileUI) {
        return window.profileUI.loadProfileData(userId);
    }
    window.profileUI = new ProfileUI(userId);
    return window.profileUI.loadProfileData(userId);
};

export { ProfileUI };