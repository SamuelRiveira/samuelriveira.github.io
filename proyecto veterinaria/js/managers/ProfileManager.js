import { API } from '../services/APIS.js';

/**
 * Clase encargada de la gestión de datos del perfil de usuario
 */
class ProfileManager {
    /**
     * Obtiene los datos del perfil de usuario
     * @param {string} userId - ID del usuario (opcional, si no se proporciona se usa el usuario actual)
     * @returns {Promise<Object>} Datos del perfil
     */
    static async getUserProfile(userId = null) {
        try {
            // Si no se proporciona un ID de usuario, intentar obtener el ID del usuario actual
            if (!userId) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    return this.getDefaultProfile();
                }
                userId = session.user.id;
            }

            // Obtener datos del perfil
            const profileResponse = await API.obtenerPerfilUsuarioId(userId);
            
            // Si no hay sesión activa o hay un error, devolver datos por defecto
            if (profileResponse.noSession || !profileResponse.success) {
                console.warn('No se pudo obtener el perfil:', profileResponse.error);
                return this.getDefaultProfile();
            }
            
            const profileData = profileResponse.data;
            
            // Obtener las mascotas del usuario en paralelo con las citas para mejor rendimiento
            const [petsResponse, citasResponse] = await Promise.all([
                API.obtenerMascotasPorUsuario(userId),
                API.obtenerCitasPorUsuario(userId)
            ]);
            
            // Verificar si hubo error al obtener las mascotas
            if (petsResponse.noSession || !petsResponse.success) {
                console.warn('No se pudieron obtener las mascotas:', petsResponse.error);
            }
            
            const totalMascotas = petsResponse.data?.length || 0;
            let totalCitas = 0;
            
            // Procesar citas si la respuesta fue exitosa
            if (citasResponse.success && Array.isArray(citasResponse.data)) {
                const ahora = new Date();
                const fechaActual = ahora.toISOString().split('T')[0];
                const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' + 
                                 ahora.getMinutes().toString().padStart(2, '0');
                
                // Filtrar citas: no canceladas y futuras (fecha y hora)
                const citasFuturas = citasResponse.data.filter(cita => {
                    if (!cita || cita.is_canceled) return false;
                    
                    // Si la cita es de una fecha posterior a hoy, la contamos
                    if (cita.fecha > fechaActual) return true;
                    
                    // Si es hoy, comprobamos la hora
                    if (cita.fecha === fechaActual) {
                        return cita.hora_inicio >= horaActual;
                    }
                    
                    return false;
                });
                
                totalCitas = citasFuturas.length;
            } else {
                console.warn('No se pudieron obtener las citas:', citasResponse.error);
            }

            // Formatear los datos para que coincidan con el formato esperado
            return {
                photo: profileData?.imagen || "/Frontend/imagenes/img_perfil.png",
                name: `${profileData?.nombre || ''} ${profileData?.apellidos || ''}`.trim() || 'Usuario',
                stats: {
                    pets: totalMascotas,
                    appointments: totalCitas
                },
                personalInfo: {
                    name: profileData?.nombre || '',
                    surnames: profileData?.apellidos || '',
                    address: profileData?.direccion || 'Dirección no especificada',
                    email: profileData?.email || '',
                    phone: profileData?.telefono || ''
                },
                // Guardar datos adicionales para uso futuro
                _rawData: {
                    profile: profileData,
                    petsCount: totalMascotas,
                    appointmentsCount: totalCitas
                }
            };
        } catch (error) {
            console.error('Error en getUserProfile:', error);
            // Devolver datos por defecto en caso de error
            return this.getDefaultProfile();
        }
    }
    
    /**
     * Devuelve un perfil por defecto
     * @returns {Object} Datos de perfil por defecto
     */
    static getDefaultProfile() {
        return {
            photo: "/Frontend/imagenes/img_perfil.png",
            name: "Usuario",
            stats: { 
                pets: 0, 
                appointments: 0 
            },
            personalInfo: { 
                name: "", 
                surnames: "", 
                address: "",
                email: "",
                phone: ""
            },
            _rawData: {
                profile: {},
                petsCount: 0,
                appointmentsCount: 0
            }
        };
    }

    /**
     * Actualiza los datos del perfil de usuario
     * @param {Object} profileData - Datos actualizados del perfil
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async updateUserProfile(profileData, idUsuario = null) {
        try {
            // Preparar los datos para la API
            const datosActualizacion = {
                nombre: profileData.personalInfo.name,
                apellidos: profileData.personalInfo.surnames,
                direccion: profileData.personalInfo.address,
                imagen: profileData.originalPhoto
            };
            
            // Si hay una nueva foto, incluir el archivo para subir
            if (profileData.photoFile) {
                datosActualizacion.imagenFile = profileData.photoFile;
            }
            
            // Llamar al método de la API para actualizar el perfil
            const resultado = await API.actualizarPerfilUsuario(datosActualizacion, idUsuario);
            
            if (!resultado.success) {
                throw resultado.error || new Error('Error al actualizar el perfil');
            }
            
            // Si se subió una nueva imagen, actualizar la URL de la imagen en los datos de retorno
            if (profileData.photoFile) {
                // Obtener la URL de la imagen del resultado o de los datos de actualización
                const nuevaImagenUrl = resultado.data?.imagen || 
                                     (await API.obtenerPerfilUsuario())?.data?.imagen;
                
                if (nuevaImagenUrl) {
                    resultado.data = { ...resultado.data, imagen: nuevaImagenUrl };
                }
            }
            
            return { success: true, data: resultado.data };
            
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            return { success: false, error };
        }
    }

    /**
     * Obtiene todos los usuarios registrados en el sistema
     * @returns {Promise<{success: boolean, data?: Array, error?: any}>} - Lista de usuarios con todos sus datos
     */
    static async getAllUsers() {
        try {
            const resultado = await API.obtenerTodosLosUsuarios();
            
            if (!resultado.success) {
                throw resultado.error || new Error('Error al obtener los usuarios');
            }
            
            return { success: true, data: resultado.data };
            
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            return { success: false, error };
        }
    }
}

export { ProfileManager };