/**
 * Clase encargada de gestionar los datos de citas
 * Proporciona métodos para obtener, filtrar y gestionar citas
 */

import { API } from "./APIS.js";

class AppointmentDataManager {
    /**
     * Constructor de la clase
     */
    constructor() {
        
    }

    /**
     * Obtiene las citas según los filtros proporcionados
     * @param {Object} filters - Filtros para las citas (status, fecha, etc.)
     * @returns {Promise<Array>} - Promesa que resuelve a un array de citas
     */
    async getAppointments(filters = {}) {
        try {
            const { success, data: citas, error } = await API.obtenerTodasLasCitas();
            
            if (!success) {
                console.error('Error al obtener las citas:', error);
                return [];
            }
            
            // Mapear los datos de la API al formato esperado por la aplicación
            let formattedAppointments = citas.map(cita => {
                const appointmentDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
                const now = new Date();
                
                // Determinar el estado de la cita
                let status = 'pending';
                if (cita.is_canceled) {
                    status = 'cancelled';
                } else if (appointmentDate < now) {
                    status = 'completed';
                }
                
                return {
                    id: cita.id_cita,
                    date: appointmentDate,
                    status: status,
                    is_canceled: cita.is_canceled,
                    id_mascota: cita.id_mascota,
                    id_servicio: cita.id_servicio,
                    // Incluir más datos necesarios para las tarjetas
                    petName: cita.mascota?.nombre || 'Mascota',
                    petImage: cita.mascota?.imagen || '/Frontend/imagenes/default-pet.png',
                    serviceName: cita.servicio?.nombre || 'Servicio'
                };
            });
            
            // Aplicar filtros
            if (filters.status) {
                formattedAppointments = formattedAppointments.filter(app => {
                    if (filters.status === 'all') return true;
                    return app.status === filters.status;
                });
            }
            
            if (filters.date) {
                const filterDate = new Date(filters.date);
                formattedAppointments = formattedAppointments.filter(app => {
                    return app.date.toDateString() === filterDate.toDateString();
                });
            }
            
            // Ordenar por fecha (más recientes primero)
            formattedAppointments.sort((a, b) => a.date - b.date);
            
            return formattedAppointments;
                
            } catch (error) {
                console.error('Error en getAppointments:', error);
                return [];
            }
    }

    /**
     * Genera datos simulados de citas para desarrollo
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} - Array de objetos de citas
     */
    getMockAppointments(filters = {}) {
        // Crear conjunto de citas de ejemplo
        // TODO: Implementar llamada a API
        const appointments = [
            {
                id: 1,
                date: new Date(2025, 4, 15, 10, 30),
                status: 'pending',
                pet: {
                    id: 1,
                    name: 'Luna',
                    type: 'Perro',
                    breed: 'Labrador',
                    imageUrl: '/Frontend/imagenes/img_luna.jpg'
                },
                owner: {
                    id: 1,
                    name: 'Ana García',
                    phone: '612-345-678'
                },
                service: {
                    id: 1,
                    name: 'Revisión general',
                    duration: 30,
                    price: 35.00
                },
                notes: 'Revisar estado de vacunas',
                vet: {
                    id: 1,
                    name: 'Dr. Martínez'
                }
            },
            {
                id: 2,
                date: new Date(2025, 4, 16, 11, 0),
                status: 'completed',
                pet: {
                    id: 2,
                    name: 'Mia',
                    type: 'Gato',
                    breed: 'Siamés',
                    imageUrl: '/Frontend/imagenes/img_mia.jpg'
                },
                owner: {
                    id: 1,
                    name: 'Ana García',
                    phone: '612-345-678'
                },
                service: {
                    id: 2,
                    name: 'Vacunación',
                    duration: 15,
                    price: 25.00
                },
                notes: 'Vacuna anual contra la rabia',
                vet: {
                    id: 2,
                    name: 'Dra. López'
                }
            },
            {
                id: 3,
                date: new Date(2025, 4, 17, 9, 15),
                status: 'pending',
                pet: {
                    id: 3,
                    name: 'Max',
                    type: 'Perro',
                    breed: 'Bulldog',
                    imageUrl: '/Frontend/imagenes/img_max.jpg'
                },
                owner: {
                    id: 2,
                    name: 'Carlos Rodríguez',
                    phone: '623-456-789'
                },
                service: {
                    id: 3,
                    name: 'Limpieza dental',
                    duration: 45,
                    price: 50.00
                },
                notes: 'Primera limpieza dental',
                vet: {
                    id: 1,
                    name: 'Dr. Martínez'
                }
            },
            {
                id: 4,
                date: new Date(2025, 4, 18, 16, 0),
                status: 'cancelled',
                pet: {
                    id: 4,
                    name: 'Rocky',
                    type: 'Perro',
                    breed: 'Pastor Alemán',
                    imageUrl: '/Frontend/imagenes/img_rocky.jpg'
                },
                owner: {
                    id: 3,
                    name: 'Elena Sánchez',
                    phone: '634-567-890'
                },
                service: {
                    id: 4,
                    name: 'Corte de pelo',
                    duration: 60,
                    price: 40.00
                },
                notes: 'Cliente canceló por emergencia familiar',
                vet: {
                    id: 3,
                    name: 'Dra. Gómez'
                }
            },
            {
                id: 5,
                date: new Date(2025, 4, 18, 10, 0),
                status: 'pending',
                pet: {
                    id: 5,
                    name: 'Simba',
                    type: 'Gato',
                    breed: 'Persa',
                    imageUrl: '/Frontend/imagenes/img_simba.jpg'
                },
                owner: {
                    id: 3,
                    name: 'Elena Sánchez',
                    phone: '634-567-890'
                },
                service: {
                    id: 1,
                    name: 'Revisión general',
                    duration: 30,
                    price: 35.00
                },
                notes: 'Chequeo rutinario',
                vet: {
                    id: 2,
                    name: 'Dra. López'
                }
            }
        ];

        // Aplicar filtros si se especificaron
        let filteredAppointments = [...appointments];
        
        if (filters.status && filters.status !== 'all') {
            filteredAppointments = filteredAppointments.filter(
                app => app.status === filters.status
            );
        }
        
        if (filters.date) {
            const filterDate = new Date(filters.date);
            // Convertir a fecha UTC para comparar solo por día
            const filterYear = filterDate.getFullYear();
            const filterMonth = filterDate.getMonth();
            const filterDay = filterDate.getDate();
            
            filteredAppointments = filteredAppointments.filter(app => {
                const appYear = app.date.getFullYear();
                const appMonth = app.date.getMonth();
                const appDay = app.date.getDate();
                
                return appYear === filterYear && 
                       appMonth === filterMonth && 
                       appDay === filterDay;
            });
        }
        
        return filteredAppointments;
    }

    /**
     * Formatea una fecha para mostrarla como hora de cita
     * @param {Date} date - La fecha a formatear
     * @returns {string} - Hora formateada (ej: "10:30 AM")
     */
    static formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Si es 0, debería ser 12 en formato 12h
        
        return `${hours}:${minutes} ${ampm}`;
    }
    
    /**
     * Obtiene el nombre del mes en español
     * @param {number} monthIndex - Índice del mes (0-11)
     * @returns {string} - Nombre del mes en español
     */
    static getMonthName(monthIndex) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[monthIndex];
    }
    
    /**
     * Obtiene la etiqueta según el estado de la cita
     * @param {string} status - Estado de la cita
     * @returns {Object} - Objeto con clase CSS y texto para la etiqueta
     */
    static getStatusLabel(status) {
        switch (status) {
            case 'pending':
                return { class: 'status-pending', text: 'Pendiente' };
            case 'expired':
                return { class: 'status-expired', text: 'Expirada' };
            case 'cancelled':
                return { class: 'status-cancelled', text: 'Cancelada' };
            default:
                return { class: 'status-unknown', text: 'Desconocido' };
        }
    }
    
    /**
     * Actualiza el estado de una cita pasando al siguiente en el ciclo
     * pendiente -> completada -> cancelada -> pendiente
     * @param {number} appointmentId - ID de la cita a actualizar
     * @returns {string} - El nuevo estado de la cita
     */
    async updateAppointmentStatus(appointmentId) {
        // Esto se hará mediante una llamada a la API
        // TODO: Implementar llamada a API
        const appointments = await this.getAppointments();
        const appointment = appointments.find(app => app.id === appointmentId);
        
        if (!appointment) {
            console.error(`No se encontró la cita con ID: ${appointmentId}`);
            return null;
        }
        
        // Actualizar el estado siguiendo el ciclo: pendiente -> completada -> cancelada -> pendiente
        switch (appointment.status) {
            case 'pending':
                appointment.status = 'expired';
                break;
            case 'expired':
                appointment.status = 'cancelled';
                break;
            case 'cancelled':
            default:
                appointment.status = 'pending';
                break;
        }
        
        // Aquí enviarémos el cambio a la API
        // TODO: Implementar llamada a API
        console.log(`Cita ${appointmentId} actualizada a estado: ${appointment.status}`);
        
        return appointment.status;
    }
    
    /**
     * Método estático para ciclar el estado de una cita
     * @param {string} currentStatus - Estado actual de la cita
     * @returns {string} - Siguiente estado en el ciclo
     */
    static cycleAppointmentStatus(currentStatus) {
        switch (currentStatus) {
            case 'pending':
                return 'expired';
            case 'expired':
                return 'cancelled';
            case 'cancelled':
            default:
                return 'pending';
        }
    }
}

export { AppointmentDataManager };
