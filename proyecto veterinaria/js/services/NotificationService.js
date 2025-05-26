/**
 * Servicio de notificaciones para mostrar mensajes al usuario
 */
class NotificationService {
    constructor() {
        // Asegurarse de que los estilos estén en el documento
        this.ensureStyles();
    }

    /**
     * Muestra una notificación de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {number} [duration=4000] - Duración en milisegundos que se mostrará la notificación
     */
    showSuccess(message, duration = 4000) {
        this.showNotification(message, 'success', duration);
    }

    /**
     * Muestra un indicador de carga
     * @param {string} message - Mensaje a mostrar
     * @returns {string} - ID de la notificación para poder cerrarla después
     */
    showLoading(message) {
        const id = 'loading-' + Date.now();
        this.showNotification(message, 'info', 0); // Duración 0 para que no se cierre automáticamente
        return id;
    }
    
    /**
     * Cierra una notificación de carga
     * @param {string} id - ID de la notificación a cerrar
     */
    close(id) {
        const notification = document.querySelector(`[data-notification-id="${id}"]`);
        if (notification) {
            notification.style.animation = 'notificationFadeOut 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    /**
     * Muestra una notificación de error
     * @param {string} message - Mensaje a mostrar
     * @param {number} [duration=4000] - Duración en milisegundos que se mostrará la notificación
     */
    showError(message, duration = 4000) {
        this.showNotification(message, 'error', duration);
    }

    /**
     * Muestra una notificación de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {number} [duration=4000] - Duración en milisegundos que se mostrará la notificación
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    }

    /**
     * Muestra una notificación de información
     * @param {string} message - Mensaje a mostrar
     * @param {number} [duration=4000] - Duración en milisegundos que se mostrará la notificación
     */
    showInfo(message, duration = 4000) {
        this.showNotification(message, 'info', duration);
    }

    /**
     * Muestra un diálogo de confirmación
     * @param {string} message - Mensaje a mostrar
     * @param {string} [details] - Detalles adicionales (opcional)
     * @returns {Promise<boolean>} - Resuelve a true si se confirma, false si se cancela
     */
    showConfirmation(message, details = '') {
        return new Promise((resolve) => {
            // Crear el overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                opacity: 0;
                animation: fadeIn 0.3s forwards;
            `;
            
            // Crear el diálogo
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                transform: translateY(20px);
                animation: slideUp 0.3s forwards;
            `;
            
            // Contenido del diálogo
            dialog.innerHTML = `
                <h3 style="margin-top: 0; color: #333; font-size: 1.25rem; margin-bottom: 16px;">${message}</h3>
                ${details ? `<p style="color: #555; margin-bottom: 24px; line-height: 1.5;">${details}</p>` : ''}
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button id="confirm-cancel" style="
                        padding: 8px 16px;
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                        cursor: pointer;
                        color: #495057;
                        font-weight: 500;
                    ">Cancelar</button>
                    <button id="confirm-ok" style="
                        padding: 8px 16px;
                        background: #dc3545;
                        border: 1px solid #dc3545;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-weight: 500;
                    ">Eliminar</button>
                </div>
            `;
            
            // Agregar al DOM
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            // Manejar eventos
            const handleConfirm = (confirmed) => {
                // Animación de salida
                overlay.style.animation = 'fadeOut 0.3s forwards';
                dialog.style.animation = 'slideDown 0.3s forwards';
                
                // Eliminar elementos después de la animación
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
                
                resolve(confirmed);
            };
            
            // Event listeners
            dialog.querySelector('#confirm-ok').addEventListener('click', () => handleConfirm(true));
            dialog.querySelector('#confirm-cancel').addEventListener('click', () => handleConfirm(false));
            
            // Cerrar al hacer clic fuera del diálogo
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    handleConfirm(false);
                }
            });
            
            // Cerrar con Escape
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    handleConfirm(false);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
        });
    }
    
    /**
     * Muestra una notificación personalizada
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     * @param {number} duration - Duración en milisegundos
     * @private
     */
    showNotification(message, type = 'info', duration = 4000) {
        const colors = {
            success: { bg: '#d4edda', text: '#155724', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
            error: { bg: '#f8d7da', text: '#721c24', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
            warning: { bg: '#fff3cd', text: '#856404', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            info: { bg: '#d1ecf1', text: '#0c5460', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
        };

        const { bg, text, icon } = colors[type] || colors.info;
        
        // Crear elemento para el mensaje
        const messageContainer = document.createElement('div');
        messageContainer.className = `notification-message notification-${type}`;
        messageContainer.style.position = 'fixed';
        messageContainer.style.bottom = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.backgroundColor = bg;
        messageContainer.style.color = text;
        messageContainer.style.padding = '15px 20px';
        messageContainer.style.borderRadius = '4px';
        messageContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.transition = 'all 0.3s ease';
        messageContainer.style.animation = 'notificationSlideIn 0.3s forwards';
        messageContainer.style.display = 'flex';
        messageContainer.style.alignItems = 'center';
        messageContainer.style.maxWidth = '350px';
        messageContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px; flex-shrink: 0;">
                <path d="${icon}"></path>
            </svg>
            <span>${message}</span>
        `;
        
        // Agregar el mensaje al DOM
        document.body.appendChild(messageContainer);
        
        // Eliminar el mensaje después de la duración especificada
        setTimeout(() => {
            messageContainer.style.animation = 'notificationFadeOut 0.3s forwards';
            setTimeout(() => {
                messageContainer.remove();
            }, 300);
        }, duration);
    }

    /**
     * Asegura que los estilos necesarios estén en el documento
     * @private
     */
    ensureStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notificationFadeOut {
                to { opacity: 0; transform: translateX(100%); }
            }
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
            @keyframes slideUp {
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideDown {
                to { transform: translateY(20px); opacity: 0; }
            }
            
            .notification-message:last-child {
                margin-bottom: 0;
            }
            
            .notification-message {
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Exportar una instancia global
const notificationService = new NotificationService();

export { NotificationService, notificationService };
