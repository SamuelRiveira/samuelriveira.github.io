/**
 * Clase de servicio para manejar las citas
 * Proporciona métodos para obtener, crear, actualizar y eliminar citas
 */

import { API } from "../services/APIS.js";

class AppointmentManager {
    /**
     * Obtiene la lista de citas del usuario
     * @returns {Promise<Array>} - Promise que resuelve con el array de citas
     */
    async getAppointments() {
        try {
            // Obtener las citas de las mascotas del usuario desde la API
            const { success, data: citas, error } = await API.obtenerCitasMascotas();
            
            if (!success) {
                console.error('Error al obtener las citas:', error);
                return [];
            }
            
            // Obtener la fecha y hora actual
            const ahora = new Date();
            const fechaActual = ahora.toISOString().split('T')[0];
            const horaActual = ahora.toTimeString().slice(0, 5);
            
            // Filtrar citas canceladas y pasadas
            const citasFiltradas = citas.filter(cita => {
                if (cita.is_canceled) return false;
                
                const fechaCita = cita.fecha;
                const horaCita = cita.hora_inicio?.split(':').slice(0, 2).join(':');
                
                // Si la fecha de la cita es posterior a hoy, mantenerla
                if (fechaCita > fechaActual) return true;
                
                // Si la cita es hoy, verificar la hora
                if (fechaCita === fechaActual) {
                    return horaCita && horaCita >= horaActual;
                }
                
                // Si la cita es de un día anterior, descartarla
                return false;
            });
            
            // Procesar las citas en paralelo para mejorar el rendimiento
            const citasProcesadas = await Promise.all(citasFiltradas.map(async (cita) => {
                // Obtener datos de la mascota
                let nombreMascota = cita.mascota?.nombre || 'Mascota sin nombre';
                let imagenMascota = "/Frontend/imagenes/default-pet.png";
                
                if (cita.mascota?.id_mascota) {
                    const { success: mascotaSuccess, data: mascotaData } = await API.obtenerMascotaPorId(cita.mascota.id_mascota);
                    if (mascotaSuccess && mascotaData) {
                        nombreMascota = mascotaData.nombre || nombreMascota;
                        imagenMascota = mascotaData.imagen || imagenMascota;
                    }
                }
                
                // Obtener nombre del servicio
                let nombreServicio = 'Sin especificar';
                if (cita.servicio?.id_servicio) {
                    const { success: servicioSuccess, data: servicioData } = await API.obtenerServicioPorId(cita.servicio.id_servicio);
                    if (servicioSuccess && servicioData) {
                        nombreServicio = servicioData.nombre_servicio || nombreServicio;
                    }
                }
                
                // Formatear la hora para mostrar solo horas y minutos
                const horaFormateada = cita.hora_inicio 
                    ? cita.hora_inicio.split(':').slice(0, 2).join(':')
                    : '';
                
                return {
                    id: cita.id_cita,
                    petId: cita.mascota?.id_mascota,
                    petName: nombreMascota,
                    petImage: imagenMascota,
                    date: cita.fecha,
                    time: horaFormateada,
                    type: nombreServicio,
                    status: cita.is_canceled ? 'cancelled' : 'pending'
                };
            }));
            
            return citasProcesadas;
        } catch (error) {
            console.error('Error inesperado al obtener las citas:', error);
            return [];
        }
    }

    /**
     * Manejador para cancelar una cita
     * @param {number} appointmentId - ID de la cita a cancelar
     */
    async handleCancelAppointment(appointmentId) {
        try {
            if (!appointmentId) {
                throw new Error('ID de cita no proporcionado');
            }

            // Llamar a la API para eliminar la cita
            const { success, error } = await API.eliminarCita(appointmentId);
            
            if (!success) {
                throw new Error(error || 'Error al eliminar la cita');
            }

            return { success: true };
        } catch (error) {
            console.error('Error en handleEditAppointment:', error);
            return { 
                success: false, 
                error: error.message || 'Error al procesar la solicitud de eliminación de cita' 
            };
        }
    }

    /**
     * Manejador para crear una cita
     * @param {string} petId - ID de la mascota
     * @param {string} serviceId - ID del servicio
     * @param {string} date - Fecha de la cita en formato YYYY-MM-DD
     * @param {string} time - Hora de la cita en formato HH:MM
     * @returns {Promise<{success: boolean, data?: any, error?: string}>} - Resultado de la operación
     */
    async handleCreateAppointment(petId, serviceId, date, time) {
        try {
            // Validar parámetros requeridos
            if (!petId || !serviceId || !date || !time) {
                throw new Error('Todos los campos son obligatorios');
            }

            // Calcular hora final (30 minutos después de la hora de inicio por defecto)
            const [hours, minutes] = time.split(':').map(Number);
            const [year, month, day] = date.split('-').map(Number);
            const startTime = new Date(year, month - 1, day, hours, minutes); // month is 0-indexed in JS Date
            const endTime = new Date(startTime.getTime() + (30 * 60 * 1000)); // Add 30 minutes in milliseconds
            const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

            // Llamar a la API para crear la cita
            const { success, data, error } = await API.crearCita(
                petId,
                date,
                time,
                endTimeStr,
                serviceId
            );

            if (!success) {
                throw new Error(error || 'Error al crear la cita');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error en handleCreateAppointment:', error);
            return { 
                success: false, 
                error: error.message || 'Error al procesar la solicitud de cita' 
            };
        }
    }

    /**
     * Obtiene los datos necesarios para el formulario de citas
     * @returns {Promise<{pets: Array<{id: string, name: string}>, services: Array<{value: string, label: string}>, occupiedTimeSlots: Array<{date: string, start: string, end: string}>}>}
     */
    async getAppointmentFormData(userId = null) {
        try {

            let petsSuccess = false;
            let petsData = [];

            if (!userId) {
                ({ success: petsSuccess, data: petsData } = await API.obtenerMascotasPorUsuario());
            } else {
                ({ success: petsSuccess, data: petsData } = await API.obtenerMascotasPorUsuario(userId));
            }

            if (!petsSuccess) {
                throw new Error('No se pudieron cargar las mascotas');
            }
            
            // Mapear las mascotas al formato esperado
            const pets = petsData.map(pet => ({
                id: pet.id_mascota,
                name: pet.nombre
            }));
            
            // Obtener servicios desde la API
            const { success: servicesSuccess, data: servicesData } = await API.obtenerServicios();
            
            if (!servicesSuccess) {
                throw new Error('No se pudieron cargar los servicios');
            }
            
            // Mapear los servicios al formato esperado
            const services = servicesData.map(servicio => ({
                value: servicio.id_servicio.toString(),
                label: servicio.nombre_servicio,
                description: servicio.descripcion || ''
            }));
            
            // Obtener citas existentes para determinar horarios ocupados
            const { success: appointmentsSuccess, data: appointments } = await API.obtenerTodasLasCitas();
            
            // Mapear citas al formato de horarios ocupados
            const occupiedTimeSlots = [];
            
            if (appointmentsSuccess && Array.isArray(appointments)) {
                appointments.forEach(appointment => {
                    if (appointment.fecha && appointment.hora_inicio && appointment.hora_final) {
                        occupiedTimeSlots.push({
                            date: appointment.fecha,
                            start: appointment.hora_inicio,
                            end: appointment.hora_final
                        });
                    }
                });
            }
            
            return {
                pets,
                services,
                occupiedTimeSlots
            };
            
        } catch (error) {
            console.error('Error al obtener datos del formulario de citas:', error);
            // Retornar datos por defecto en caso de error
            return {
                pets: [],
                services: [],
                occupiedTimeSlots: []
            };
        }
    }
}

export {AppointmentManager};
