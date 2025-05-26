
import { API } from "../services/APIS.js";

class PetManager {

    async getPetsData(userId = null) {
        try {
            let perfilSuccess, perfil, perfilError, noSession;
    
            if (userId === null) {
                // Obtener el perfil del usuario para el nombre del propietario
                const result = await API.obtenerPerfilUsuario();
                perfilSuccess = result.success;
                perfil = result.data;
                perfilError = result.error;
                noSession = result.noSession;
            } else {
                // Obtener el perfil de un usuario específico
                const result = await API.obtenerPerfilUsuarioId(userId);
                perfilSuccess = result.success;
                perfil = result.data;
                perfilError = result.error;
                noSession = result.noSession;
                userId = perfil.id_usuario;
            }
    
            // Handle the results
            if (!perfilSuccess) {
                console.error('Error obteniendo perfil:', perfilError);
                return { success: false, error: perfilError };
            }
            
            
            if (!perfilSuccess) {
                if (noSession) {
                    // No hay sesión activa, no es un error
                    return [];
                }
                console.warn('Error al obtener perfil del usuario:', perfilError);
                return [];
            }
            
            // Crear el nombre completo del propietario
            const nombrePropietario = [
                perfil?.nombre || '',
                perfil?.apellidos || ''
            ].filter(Boolean).join(' ').trim() || 'Sin propietario';
            
            // Obtener las mascotas del usuario desde la API
            const { success, data: mascotas, error } = await API.obtenerMascotasPorUsuario(userId);
            
            if (!success) {
                console.error('Error al obtener mascotas:', error);
                return [];
            }
            
            if (!mascotas || mascotas.length === 0) {
                return [];
            }
            
            // Mapear los datos de la API al formato esperado por la aplicación
            return mascotas.map(mascota => ({
                id: mascota.id_mascota?.toString() || '',
                name: mascota.nombre || 'Sin nombre',
                type: mascota.especie || 'Sin especificar',
                breed: mascota.raza || 'Sin raza específica',
                age: mascota.edad?.toString() || '0',
                ageUnit: 'años',
                appointment: mascota.proxima_cita || 'No programada',
                photoUrl: mascota.imagen || '/Frontend/imagenes/default-pet.png',
                weight: mascota.peso ? `${mascota.peso}` : 'No especificado',
                owner: nombrePropietario,
                medicalHistory: mascota.historial_medico || [],
                allergies: mascota.alergia || [],
                notes: mascota.notas_especiales || ''
            }));
            
        } catch (error) {
            console.error('Error en getPetsData:', error);
            return [];
        }
    }

    /**
     * Crea una nueva mascota utilizando la API
     * @param {Object} petData - Datos de la mascota a crear
     * @param {string} petData.name - Nombre de la mascota
     * @param {string} petData.type - Tipo/Especie de la mascota
     * @param {string} petData.breed - Raza de la mascota
     * @param {number} petData.weight - Peso de la mascota
     * @param {string|number} petData.age - Edad de la mascota
     * @param {string} [petData.notes] - Notas adicionales
     * @param {File} [petData.imagen] - Archivo de imagen de la mascota (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    async createPet(petData) {
        try {
            // Mapear los datos al formato esperado por la API
            const datosMascota = {
                nombre: petData.name,
                especie: petData.type,
                raza: petData.breed,
                peso: petData.weight,
                edad: petData.age,
                notas: petData.notes || '',
                // Incluir la imagen si está presente
                ...(petData.imagen && { imagen: petData.imagen })
            };

            // Llamar a la API para crear la mascota
            const resultado = await API.crearMascota(datosMascota);
            
            if (!resultado.success) {
                console.error('Error al crear la mascota:', resultado.error);
                return { success: false, error: resultado.error };
            }

            return { success: true, data: resultado.data };
        } catch (error) {
            console.error('Error en createPet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina una o más mascotas por sus IDs
     * @param {number|number[]} listPetId - ID de la mascota o array de IDs a eliminar
     * @returns {Promise<{success: boolean, deletedCount: number, errors: Array<{id: number, error: any}>}>} - Resultado de la operación
     */
    async deletePet(listPetId) {
        try {
            // Convertir a array si se proporciona un solo ID
            const ids = Array.isArray(listPetId) ? listPetId : [listPetId];
            
            if (ids.length === 0) {
                return { success: false, deletedCount: 0, errors: [], message: 'No se proporcionaron IDs de mascotas' };
            }
            
            const results = {
                success: true,
                deletedCount: 0,
                errors: []
            };
            
            // Procesar cada ID de mascota secuencialmente
            for (const id of ids) {
                try {
                    const { success, error } = await API.borrarMascota(id);
                    
                    if (success) {
                        results.deletedCount++;
                    } else {
                        results.success = false;
                        results.errors.push({
                            id,
                            error: error || 'Error desconocido al eliminar la mascota'
                        });
                    }
                } catch (error) {
                    results.success = false;
                    results.errors.push({
                        id,
                        error: error.message || 'Error al procesar la eliminación de la mascota'
                    });
                }
            }
            
            // Si no se pudo eliminar ninguna mascota, devolver el primer error
            if (results.deletedCount === 0 && results.errors.length > 0) {
                return {
                    success: false,
                    deletedCount: 0,
                    errors: results.errors,
                    message: `No se pudo eliminar ninguna mascota: ${results.errors[0].error}`
                };
            }
            
            // Si se eliminaron algunas pero no todas las mascotas
            if (results.deletedCount > 0 && results.errors.length > 0) {
                return {
                    success: false,
                    deletedCount: results.deletedCount,
                    errors: results.errors,
                    message: `Se eliminaron ${results.deletedCount} mascotas, pero hubo errores con ${results.errors.length} mascotas`
                };
            }
            
            // Si todo fue exitoso
            return {
                success: true,
                deletedCount: results.deletedCount,
                errors: [],
                message: `Se eliminaron exitosamente ${results.deletedCount} mascotas`
            };
            
        } catch (error) {
            console.error('Error en deletePet:', error);
            return {
                success: false,
                deletedCount: 0,
                errors: [{ id: null, error: error.message || 'Error inesperado al eliminar las mascotas' }],
                message: 'Error inesperado al procesar la solicitud'
            };
        }
    }

    /**
     * Maneja la edición de una mascota
     * @param {Object} editedData - Datos editados de la mascota
     * @returns {Promise<boolean>} - True si la operación fue exitosa, false en caso contrario
     */
    async handlePetEdit(editedData) {
        try {
            // Obtener el ID de la mascota de los datos editados
            const petId = editedData.id;

            if (!petId) {
                console.error('No se encontró el ID de la mascota en los datos editados');
                return false;
            }


            // Mapear los campos editados al formato esperado por la API
            const datosActualizados = {};
            
            // Mapear campos básicos
            const fieldMappings = {
                'nombre': 'nombre',
                'edad': 'edad',
                'peso': 'peso',
                'notas_especiales': 'notas_especiales'
            };

            // Mapear campos directos
            Object.entries(fieldMappings).forEach(([source, target]) => {
                if (editedData[source] !== undefined) {
                    datosActualizados[target] = editedData[source];
                }
            });
            
            // Procesar historial médico
            if (editedData.historial_medico !== undefined) {
                // Si viene como string con saltos de línea, convertirlo a array
                if (typeof editedData.historial_medico === 'string') {
                    datosActualizados.historial_medico = editedData.historial_medico
                        .split('\n')
                        .filter(item => item.trim() !== '');
                } 
                // Si ya es un array, asegurarse de que esté en el formato correcto
                else if (Array.isArray(editedData.historial_medico)) {
                    datosActualizados.historial_medico = editedData.historial_medico
                        .filter(item => item.trim() !== '');
                }
            }
            
            // Mapear alergias (si existen)
            if (editedData.alergias) {
                // Si es un array, convertirlo a string separado por comas
                if (Array.isArray(editedData.alergias)) {
                    datosActualizados.alergia = editedData.alergias.join(', ');
                } 
                // Si es un string, limpiarlo y asegurar el formato
                else if (typeof editedData.alergias === 'string') {
                    // Eliminar corchetes y comillas si existen
                    let alergiasStr = editedData.alergias
                        .replace(/[\[\]"]/g, '')
                        .trim();
                    // Asegurar que no haya comas dobles
                    alergiasStr = alergiasStr.split(',')
                        .map(a => a.trim())
                        .filter(a => a)
                        .join(', ');
                    datosActualizados.alergia = alergiasStr;
                }
            }

            // Si hay una nueva foto, agregarla a los datos
            if (editedData.foto && (editedData.foto.startsWith('data:image') || editedData.foto.startsWith('http'))) {
                // Si es una URL, ya está en el servidor, solo guardar la ruta
                if (editedData.foto.startsWith('http')) {
                    datosActualizados.foto = editedData.foto;
                } else {
                    // Si es una imagen en base64, convertirla a archivo
                    const response = await fetch(editedData.foto);
                    const blob = await response.blob();
                    const file = new File([blob], 'pet_photo.jpg', { type: 'image/jpeg' });
                    datosActualizados.imagen = file;
                }
            }

            // Llamar a la API para actualizar la mascota
            const { success, data, error } = await API.editarMascota(petId, datosActualizados);
            
            if (!success) {
                throw new Error(error || 'Error al actualizar la mascota');
            }

            return true;
            
        } catch (error) {
            console.error('Error en handlePetEdit:', error);
            // Mostrar mensaje de error al usuario
            showError(`Error al guardar los cambios: ${error.message}`);
            return false;
        }
    }
}

export { PetManager };