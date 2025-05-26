import { notificationService } from "../services/NotificationService.js";
import { AppointmentManager } from "../managers/AppointmentManager.js";
import { ProfileUI } from "./ProfileUI.js";

/**
 * Clase para manejar la UI de citas
 */
class AppointmentUI {
    constructor() {
        this.appointmentsService = new AppointmentManager();
        this.appointmentsContainer = document.querySelector('.appointments-grid');
        this.initAppointments();
        this.setupFormListeners();
    }

    /**
     * Inicializa el listado de citas
     */
    async initAppointments() {
        try {
            const appointments = await this.appointmentsService.getAppointments();
            this.renderAppointments(appointments);
        } catch (error) {
            console.error('Error al cargar las citas:', error);
            this.showErrorMessage();
        }
    }

    /**
     * Renderiza las citas en el DOM
     * @param {Array} appointments - Array de objetos de citas
     */
    renderAppointments(appointments) {
        // Limpia el contenedor antes de agregar nuevas citas
        this.appointmentsContainer.innerHTML = '';

        // Restablecer estilos de cuadrícula
        this.appointmentsContainer.style.display = 'grid';
        this.appointmentsContainer.style.justifyContent = '';
        this.appointmentsContainer.style.alignItems = '';

        // Si no hay citas, muestra un mensaje
        if (!appointments || appointments.length === 0) {
            this.showNoAppointmentsMessage();
            return;
        }

        // Renderiza cada cita
        appointments.forEach(appointment => {
            this.appointmentsContainer.appendChild(this.createAppointmentCard(appointment));
        });
    }

    /**
     * Crea el elemento de tarjeta para una cita
     * @param {Object} appointment - Objeto con la información de la cita
     * @returns {HTMLElement} - Elemento DOM de la tarjeta de cita
     */
    createAppointmentCard(appointment) {
        // Extraer la fecha para formatearla
        const date = new Date(appointment.date);
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const month = monthNames[date.getMonth()];

        // Determinar el estado de la cita (por defecto 'pending' si no está definido)
        const status = appointment.status || 'pending';
        
        // Obtener la etiqueta y clase según el estado
        let statusLabel = '';
        let statusClass = '';
        
        switch (status) {
            case 'pending':
                statusLabel = 'Pendiente';
                statusClass = 'status-pending';
                break;
            case 'completed':
                statusLabel = 'Completada';
                statusClass = 'status-completed';
                break;
            case 'cancelled':
                statusLabel = 'Cancelada';
                statusClass = 'status-cancelled';
                break;
            default:
                statusLabel = 'Pendiente';
                statusClass = 'status-pending';
        }

        // Crear el elemento de la tarjeta
        const card = document.createElement('div');
        card.className = `appointment-card ${statusClass}`;
        card.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="appointment-time">
                    <span class="time-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="18" height="18" viewBox="0 0 148.000000 148.000000" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,148.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none">
                            <path d="M635 1471 c-295 -47 -526 -252 -606 -536 -32 -112 -32 -278 0 -390 71 -253 263 -445 516 -516 112 -32 278 -32 390 0 253 71 445 263 516 516 29 103 31 277 5 375 -42 153 -82 202 -135 162 -33 -24 -32 -52 4 -150 157 -436 -250 -893 -710 -797 -232 48 -432 248 -480 480 -29 141 -11 268 57 405 101 200 324 339 545 340 115 0 264 -48 361 -117 54 -38 74 -41 102 -13 47 47 11 96 -120 164 -124 65 -313 98 -445 77z"/>
                            <path d="M696 1208 c-13 -19 -16 -61 -16 -255 0 -220 1 -234 20 -253 18 -18 33 -20 195 -20 162 0 177 2 195 20 11 11 20 29 20 40 0 11 -9 29 -20 40 -18 18 -33 20 -155 20 l-135 0 0 193 c0 215 -6 237 -60 237 -18 0 -34 -8 -44 -22z"/>
                            </g>
                        </svg>
                    </span>
                    <span class="time">${appointment.time} ${parseInt(appointment.time) >= 12 ? 'PM' : 'AM'}</span>
                </div>
            </div>
            <div class="appointment-content">
                <div class="pet-info-brief">
                    <img src="${appointment.petImage}" alt="${appointment.petName}" class="pet-thumbnail">
                    <div class="pet-details">
                        <h3 class="pet-name">${appointment.petName}</h3>
                        <p class="appointment-type">${appointment.type}</p>
                    </div>
                </div>
                <div class="appointment-status">
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="appointment-actions">
                    <!-- Botón de cancelar cita -->
                    <button class="btn btn-cancel" data-id="${appointment.id}">Cancelar cita</button>
                </div>
            </div>
        `;
        
        // Los botones de acción se muestran por defecto
        // El RoleUIManager se encarga de mostrar/ocultar según el rol

        // Agregar evento al botón de cancelar
        const cancelBtn = card.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => this.showCancelConfirmation(appointment.id));

        return card;
    }

    /**
     * Muestra un mensaje cuando no hay citas
     */
    showNoAppointmentsMessage() {
        // Añadir clases de flex para centrar el contenido
        this.appointmentsContainer.style.display = 'flex';
        this.appointmentsContainer.style.justifyContent = 'center';
        this.appointmentsContainer.style.alignItems = 'center';

        const messageElement = document.createElement('div');
        messageElement.className = 'no-appointments-message';
        messageElement.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h3>No hay ninguna cita</h3>
                <p>Programa una nueva cita para tus mascotas usando el formulario de abajo.</p>
            </div>
        `;
        this.appointmentsContainer.appendChild(messageElement);
    }

    /**
     * Muestra un mensaje de error si hay problemas al cargar las citas
     */
    showErrorMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'error-message';
        messageElement.innerHTML = `
            <div class="empty-state error">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Error al cargar las citas</h3>
                <p>Ha ocurrido un problema al cargar tus citas. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
        this.appointmentsContainer.appendChild(messageElement);
    }

    /**
     * Rellena los select de mascotas y servicios con datos del formulario
     */
    async populateFormData() {
        try {
            const formData = await this.appointmentsService.getAppointmentFormData();
            
            // Obtener referencias a los select
            const petSelect = document.getElementById('pet-select');
            const serviceSelect = document.getElementById('service-select');
            const dateInput = document.getElementById('appointment-date');
            const timeInput = document.getElementById('appointment-time');

            // Limpiar opciones existentes (excepto la primera)
            while (petSelect.options.length > 1) {
                petSelect.remove(1);
            }
            while (serviceSelect.options.length > 1) {
                serviceSelect.remove(1);
            }

            // Añadir opciones de mascotas
            formData.pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = pet.name;
                petSelect.appendChild(option);
            });

            // Añadir opciones de servicios
            formData.services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.value;
                option.textContent = service.label;
                serviceSelect.appendChild(option);
            });

            // Configurar validación de tiempo ocupado considerando la fecha
            this.setupTimeValidation(formData.occupiedTimeSlots, dateInput, timeInput);
        } catch (error) {
            console.error('Error al cargar los datos del formulario:', error);
        }
    }

    /**
     * Configura la validación de tiempo ocupado
     * @param {Array} occupiedSlots - Lista de intervalos de tiempo ocupados
     * @param {HTMLInputElement} dateInput - Input de fecha
     * @param {HTMLInputElement} timeInput - Input de tiempo
     */
    setupTimeValidation(occupiedSlots, dateInput, timeInput) {
        // Eliminar cualquier validador previo
        if (timeInput.validateTime) {
            timeInput.removeEventListener('change', timeInput.validateTime);
        }
        if (dateInput.validateDate) {
            dateInput.removeEventListener('change', dateInput.validateDate);
        }

        // Función para validar la combinación de fecha y hora
        const validateDateTime = () => {
            const selectedDate = dateInput.value;
            const selectedTime = timeInput.value;
            
            // Si no hay fecha o tiempo seleccionado, no validamos
            if (!selectedDate || !selectedTime) return;
            
            const occupiedSlot = this.findOccupiedSlot(selectedDate, selectedTime, occupiedSlots);

            // Eliminar advertencias previas
            const existingWarning = document.getElementById('time-warning');
            if (existingWarning) {
                existingWarning.remove();
            }

            // Si el tiempo está ocupado, mostrar advertencia
            if (occupiedSlot) {
                const warningElement = document.createElement('div');
                warningElement.id = 'time-warning';
                warningElement.className = 'warning-message';
                warningElement.textContent = `Advertencia: Este horario (${selectedTime}) está ocupado entre ${occupiedSlot.start} y ${occupiedSlot.end} el día ${this.formatDate(occupiedSlot.date)}`;
                warningElement.style.color = 'orange';
                warningElement.style.marginTop = '10px';

                // Insertar la advertencia después del input de tiempo
                timeInput.parentNode.insertBefore(warningElement, timeInput.nextSibling);
            }
        };

        // Crear nuevos validadores
        timeInput.validateTime = () => validateDateTime();
        dateInput.validateDate = () => validateDateTime();

        // Añadir los eventos de validación
        timeInput.addEventListener('change', timeInput.validateTime);
        dateInput.addEventListener('change', dateInput.validateDate);
    }
    
    /**
     * Formatea una fecha en formato legible
     * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
     * @returns {string} - Fecha formateada
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    }

    /**
     * Encuentra el intervalo ocupado para una fecha y tiempo dados
     * @param {string} date - Fecha a verificar en formato YYYY-MM-DD
     * @param {string} time - Hora a verificar en formato HH:mm
     * @param {Array} occupiedSlots - Lista de intervalos de tiempo ocupados
     * @returns {Object|null} Intervalo ocupado o null si no está ocupado
     */
    findOccupiedSlot(date, time, occupiedSlots) {
        // Convertir la hora actual a minutos para facilitar las comparaciones
        const [hours, minutes] = time.split(':').map(Number);
        const currentTimeInMinutes = hours * 60 + minutes;
        
        return occupiedSlots.find(slot => {
            if (slot.date !== date) return false;
            
            // Convertir hora de inicio a minutos
            const [startHours, startMinutes] = slot.start.split(':').map(Number);
            const slotStartInMinutes = startHours * 60 + startMinutes;
            
            // Verificar si el tiempo actual está dentro de 30 minutos antes o después de la hora de inicio
            return Math.abs(currentTimeInMinutes - slotStartInMinutes) <= 29;
        }) || null;
    }
    
    /**
     * Configura los listeners para el formulario de citas
     */
    setupFormListeners() {
        // Buscar el formulario de citas
        const appointmentForm = document.querySelector('.appointment-form');
        
        if (appointmentForm) {
            // Clonar el formulario para eliminar cualquier listener existente
            const newForm = appointmentForm.cloneNode(true);
            appointmentForm.parentNode.replaceChild(newForm, appointmentForm);
            
            // Agregar listener al evento submit del formulario
            newForm.addEventListener('submit', (e) => {
                // Prevenir el comportamiento por defecto del formulario
                e.preventDefault();
                
                // Deshabilitar el botón de envío para evitar múltiples envíos
                const submitButton = newForm.querySelector('button[type="submit"]');
                if (submitButton && !submitButton.disabled) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Procesando...';
                    
                    // Llamar al manejador de envío
                    this.submitAppointmentForm(e).finally(() => {
                        // Re-habilitar el botón después de procesar
                        if (submitButton) {
                            submitButton.disabled = false;
                            submitButton.textContent = 'Programar cita';
                        }
                    });
                }
                
                return false;
            });
        }
    }
    
    /**
     * Maneja el envío del formulario de citas
     * @param {Event} event - Evento de submit
     */
    async submitAppointmentForm(event) {
        // Prevenir comportamiento por defecto del formulario
        event.preventDefault();
        
        // Deshabilitar el botón de envío
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Procesando...';
        }

        try {
            // Obtener los valores del formulario
            const petId = document.getElementById('pet-select').value;
            const serviceId = document.getElementById('service-select').value;
            const date = document.getElementById('appointment-date').value;
            const time = document.getElementById('appointment-time').value;
            
            // Validar que todos los campos estén completos
            if (!petId || !serviceId || !date || !time) {
                this.showFormError('Por favor, completa todos los campos del formulario');
                return;
            }
            
            // Validar que la fecha no sea anterior a la actual
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Establecer a inicio del día actual
            
            if (selectedDate < today) {
                this.showFormError('No se puede seleccionar una fecha anterior al día actual');
                return;
            }
            
            // Si la fecha seleccionada es hoy, validar que la hora sea futura
            const isToday = selectedDate.getDate() === today.getDate() &&
                          selectedDate.getMonth() === today.getMonth() &&
                          selectedDate.getFullYear() === today.getFullYear();
            
            if (isToday) {
                const now = new Date();
                const [hours, minutes] = time.split(':').map(Number);
                
                // Crear un objeto Date con la hora seleccionada
                const selectedDateTime = new Date(selectedDate);
                selectedDateTime.setHours(hours, minutes, 0, 0);
                
                // Verificar si la hora seleccionada es anterior a la hora actual
                if (selectedDateTime <= now) {
                    this.showFormError('La hora seleccionada debe ser posterior a la hora actual');
                    return;
                }
            }
            
            // Verificar si existe un mensaje de advertencia de horario ocupado
            const timeWarning = document.getElementById('time-warning');
            if (timeWarning) {
                this.showFormError('No es posible programar la cita en un horario ocupado. Por favor, selecciona otro horario.');
                return;
            }
            
            // Llamar al método handleCreateAppointment del servicio
            const result = await this.appointmentsService.handleCreateAppointment(petId, serviceId, date, time);
            
            if (result && result.success) {
                // Mostrar notificación de éxito
                notificationService.showSuccess('¡Cita programada con éxito!');
                
                // Limpiar el formulario
                document.querySelector('.appointment-form').reset();
                
                // Actualizar la lista de citas
                this.initAppointments();

                // Obtener la instancia de ProfileUI si existe
                ProfileUI.loadProfileData();
                
            } else {
                // Mostrar mensaje de error
                const errorMessage = result?.error?.message || 'Ha ocurrido un error al programar la cita. Por favor, intenta de nuevo.';
                this.showFormError(errorMessage);
            }
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            this.showFormError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        } finally {
            // Re-habilitar el botón de envío
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Programar Cita';
            }
        }
    }
    
    /**
     * Elimina todos los mensajes de advertencia del formulario
     */
    removeFormWarnings() {
        const warnings = [
            document.getElementById('form-warning'),
            document.getElementById('form-error'),
            document.getElementById('form-success')
        ];
        
        warnings.forEach(warning => {
            if (warning) warning.remove();
        });
    }
    
    /**
     * Muestra un mensaje de error en el formulario
     * @param {string} message - Mensaje de error a mostrar
     */
    showFormError(message) {
        this.removeFormWarnings();
        
        const form = document.querySelector('.appointment-form');
        const errorElement = document.createElement('div');
        errorElement.id = 'form-error';
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#d9534f';
        errorElement.style.margin = '10px 0';
        errorElement.style.padding = '8px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.borderLeft = '3px solid #d9534f';
        
        const submitButton = form.querySelector('.submit-btn');
        form.insertBefore(errorElement, submitButton);
    }
    
    /**
     * Muestra un mensaje de éxito en el formulario
     * @param {string} message - Mensaje de éxito a mostrar
     */
    showFormSuccess(message) {
        this.removeFormWarnings();
        
        const form = document.querySelector('.appointment-form');
        const successElement = document.createElement('div');
        successElement.id = 'form-success';
        successElement.className = 'success-message';
        successElement.textContent = message;
        successElement.style.color = '#28a745';
        successElement.style.margin = '10px 0';
        successElement.style.padding = '8px';
        successElement.style.borderRadius = '4px';
        successElement.style.backgroundColor = '#d4edda';
        successElement.style.borderLeft = '3px solid #28a745';
        
        const submitButton = form.querySelector('.submit-btn');
        form.insertBefore(successElement, submitButton);
    }
    
    /**
     * Muestra el modal de confirmación para cancelar una cita
     * @param {number} appointmentId - ID de la cita a cancelar
     */
    showCancelConfirmation(appointmentId) {
        // Obtener referencias al modal y sus elementos
        const modal = document.getElementById('cancel-appointment-modal');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancel-modal-btn');
        const confirmBtn = document.getElementById('confirm-cancel-btn');
        
        // Guardar referencia al ID de la cita actual
        this.currentAppointmentId = appointmentId;
        
        // Mostrar el modal
        modal.style.display = 'block';
        
        // Configurar eventos
        const closeModal = () => {
            modal.style.display = 'none';
        };
        
        // Evento para cerrar el modal
        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        
        // Evento para confirmar la cancelación
        confirmBtn.onclick = () => {
            // Llamar al método para cancelar la cita
            this.appointmentsService.handleCancelAppointment(this.currentAppointmentId)
                .then(result => {
                    if (result.success) {
                        // Cerrar el modal
                        closeModal();
                        // Mostrar mensaje de éxito
                        this.showCancellationSuccessMessage();
                        // Actualizar la lista de citas
                        this.initAppointments();
                        
                        // Obtener la instancia de ProfileUI si existe
                        ProfileUI.loadProfileData();

                    } else {
                        console.error('Error al cancelar la cita:', result.error);
                        // Mostrar mensaje de error
                        this.showFormError(result.error || 'Error al cancelar la cita');
                    }
                })
                .catch(error => {
                    console.error('Error al cancelar la cita:', error);
                    this.showFormError('Error inesperado al cancelar la cita');
                });
        };
        
        // Cerrar el modal si se hace clic fuera de él
        window.onclick = (event) => {
            if (event.target === modal) {
                closeModal();
            }
        };
    };
    
    /**
     * Muestra un mensaje de éxito al cancelar una cita
     */
    showCancellationSuccessMessage() {
        notificationService.showSuccess('La cita ha sido cancelada con éxito');
    }
}

// Inicializar el gestor de citas cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Variable para mantener la instancia única
    let appointmentUI = null;
    let formListenerAttached = false;
    
    // Función para inicializar la aplicación de citas
    function initializeAppointments() {
        const appointmentsPage = document.getElementById('appointments-page');
        if (appointmentsPage && appointmentsPage.classList.contains('active-page')) {
            // Si no existe una instancia, crearla
            if (!appointmentUI) {
                // Obtener la instancia de ProfileUI si existe
                const profileUI = window.profileUIInstance;
                // Pasar la función loadProfileData como callback
                appointmentUI = new AppointmentUI(() => {
                    if (profileUI && typeof profileUI.loadProfileData === 'function') {
                        profileUI.loadProfileData();
                    }
                });
            }
            
            // Solo configurar los listeners del formulario una vez
            if (!formListenerAttached) {
                appointmentUI.setupFormListeners();
                formListenerAttached = true;
            }
            
            // Actualizar los datos del formulario
            appointmentUI.populateFormData();
        }
    }
    
    // Inicializar en la carga de la página
    initializeAppointments();

    // Agregar un observador para cuando cambie la página activa
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                initializeAppointments();
            }
        });
    });

    // Observar cambios en la clase de la página de citas para detectar cuando se active
    const appointmentsPage = document.getElementById('appointments-page');
    if (appointmentsPage) {
        observer.observe(appointmentsPage, { attributes: true });
    }
});
