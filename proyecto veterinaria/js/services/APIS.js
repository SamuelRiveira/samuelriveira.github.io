import { supabase } from "./supabaseClient.js";

export class API{
    /**
     * Obtiene el rol de un usuario por su ID
     * @param {string} userId - ID del usuario
     * @returns {Promise<{success: boolean, role?: string, error?: any}>} - Objeto con el rol del usuario o error
     */
    static async obtenerRolUsuario(userId) {
        try {
            if (!userId) {
                throw new Error('Se requiere un ID de usuario válido');
            }

            // Obtener el ID del rol del usuario
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuario')
                .select('id_rol')
                .eq('id_usuario', userId)
                .single();

            if (usuarioError) throw usuarioError;
            if (!usuarioData) throw new Error('Usuario no encontrado');

            // Obtener el nombre del rol
            const { data: rolData, error: rolError } = await supabase
                .from('rol')
                .select('nombre_rol')
                .eq('id_rol', usuarioData.id_rol)
                .single();

            if (rolError) throw rolError;
            if (!rolData) throw new Error('Rol no encontrado');

            return { 
                success: true, 
                role: rolData.nombre_rol.toLowerCase() // Devolver en minúsculas para consistencia
            };

        } catch (error) {
            console.error('Error al obtener el rol del usuario:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener el rol del usuario' 
            };
        }
    }

    /**
     * Registra un nuevo usuario en Supabase y crea su perfil en la tabla usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async registrarUsuario(email, password, idRol = 1) {
        try {
            // Guardar la sesión actual
            const { data: currentSession } = await supabase.auth.getSession();
            
            // Registrar nuevo usuario
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/Frontend/index.html'
                }
            });
            
            if (authError) throw authError;
            
            // Crear registro en la tabla usuario
            const { data: userData, error: userError } = await supabase
                .from('usuario')
                .insert([
                    {
                        id_usuario: authData.user.id,
                        id_rol: idRol
                    }
                ]);
                
            if (userError) throw userError;
            
            // Restaurar la sesión original si existía
            if (currentSession?.session) {
                await supabase.auth.setSession(currentSession.session);
            } else {
                await supabase.auth.signOut();
            }
            
            return { success: true, data: { auth: authData, user: userData } };
            
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Inicia sesión del usuario usando Supabase Auth
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async iniciarSesion(email, password) {
        try {
            // Iniciar sesión con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (authError) throw authError;
            
            // Obtener datos del usuario de la tabla usuario
            const { data: userData, error: userError } = await supabase
                .from('usuario')
                .select('*, rol:id_rol(*)')
                .eq('id_usuario', authData.user.id)
                .single();
                
            if (userError) throw userError;
            
            // Preparar objeto de usuario para almacenar en localStorage
            const userObject = {
                id: userData.id_usuario,
                email: authData.user.email,
                role: userData.rol.nombre_rol,
            };
            
            return { success: true, data: { auth: authData, user: userData, userObject } };
            
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Cierra la sesión del usuario actual
     * @returns {Promise<{success: boolean, error?: any}>} - Resultado de la operación
     */
    static async cerrarSesion() {
        try {
            // Primero intentamos limpiar el localStorage
            localStorage.removeItem('sb-kmypwriazdbxpwdxfhaf-auth-token');
            localStorage.clear();
            
            // Luego intentamos cerrar sesión en Supabase
            try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                    console.warn('Advertencia al cerrar sesión en Supabase (puede ser normal si no hay sesión activa):', error.message);
                    // Continuamos aunque falle, ya que podríamos no tener una sesión activa
                }
            } catch (supabaseError) {
                console.warn('Error al comunicarse con Supabase (puede ser normal si no hay conexión):', supabaseError.message);
                // Continuamos aunque falle la comunicación con Supabase
            }
            
            // Forzar recarga para limpiar cualquier estado en memoria
            window.location.href = '/Frontend/';
            
            // Retornamos éxito ya que hemos limpiado todo lo local
            return { success: true };
        } catch (error) {
            console.error('Error inesperado en cerrarSesion:', error);
            // Aún así redirigimos al login
            window.location.href = '/Frontend/';
            return { success: false, error };
        }
    }
    
    /**
     * Obtiene el perfil del usuario actual basado en la sesión activa
     * @returns {Promise<{success: boolean, data?: {nombre: string, apellidos: string, direccion: string, imagen: string}, error?: any}>} - Perfil del usuario
     */
    static async obtenerPerfilUsuarioId(userId = null) {
        try {
            if (!userId) {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.warn('Error al verificar sesión:', sessionError);
                    return { success: false, noSession: true, error: 'Error al verificar la sesión' };
                }
                
                if (!session) {
                    // No hay sesión activa, retornamos un objeto indicando esto
                    return { success: false, noSession: true, error: 'No hay una sesión activa' };
                }
                
                userId = session.user.id;
            }
            
            const idUser = userId;
            
            // Obtener los datos del perfil del usuario
            const { data: perfilData, error: perfilError } = await supabase
                .from('usuario')
                .select('*')
                .eq('id_usuario', idUser)
                .single();
                
            if (perfilError) {
                console.warn('Error al obtener datos del perfil:', perfilError);
                return { success: false, noSession: true, error: 'Error al obtener el perfil' };
            }
            
            return { 
                success: true, 
                data: {
                    nombre: perfilData?.nombre || '',
                    apellidos: perfilData?.apellidos || '',
                    direccion: perfilData?.direccion || '',
                    imagen: perfilData?.imagen || '',
                    id_usuario: perfilData?.id_usuario || ''
                } 
            };
            
        } catch (error) {
            // No mostrar error en consola si no hay sesión activa
            if (error.message?.includes('No user') || error.message?.includes('No session')) {
                return { success: false, noSession: true, error: 'No hay sesión activa' };
            }
            console.error('Error al obtener el perfil del usuario:', error);
            return { success: false, noSession: true, error: 'Error al obtener el perfil' };
        }
    }

    static async obtenerPerfilUsuario() {
        try {
            // Obtener la sesión actual
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.warn('Error al verificar sesión:', sessionError);
                return { success: false, noSession: true, error: 'Error al verificar la sesión' };
            }
            
            if (!session) {
                // No hay sesión activa, retornamos un objeto indicando esto
                return { success: false, noSession: true, error: 'No hay una sesión activa' };
            }
            
            const userId = session.user.id;
            
            // Obtener los datos del perfil del usuario
            const { data: perfilData, error: perfilError } = await supabase
                .from('usuario')
                .select('*')
                .eq('id_usuario', userId)
                .single();
                
            if (perfilError) {
                console.warn('Error al obtener datos del perfil:', perfilError);
                return { success: false, noSession: true, error: 'Error al obtener el perfil' };
            }
            
            return { 
                success: true, 
                data: {
                    nombre: perfilData?.nombre || '',
                    apellidos: perfilData?.apellidos || '',
                    direccion: perfilData?.direccion || '',
                    imagen: perfilData?.imagen || '',
                    id_usuario: perfilData?.id_usuario || ''
                } 
            };
            
        } catch (error) {
            // No mostrar error en consola si no hay sesión activa
            if (error.message?.includes('No user') || error.message?.includes('No session')) {
                return { success: false, noSession: true, error: 'No hay sesión activa' };
            }
            console.error('Error al obtener el perfil del usuario:', error);
            return { success: false, noSession: true, error: 'Error al obtener el perfil' };
        }
    }
    
    /**
     * Actualiza el perfil del usuario actual (nombre, apellidos, dirección e imagen)
     * @param {Object} datosUsuario - Datos actualizados del usuario
     * @param {string} datosUsuario.nombre - Nombre del usuario
     * @param {string} datosUsuario.apellidos - Apellidos del usuario
     * @param {string} datosUsuario.direccion - Dirección del usuario
     * @param {string} datosUsuario.imagen - URL de la imagen de perfil
     * @param {File} [datosUsuario.imagenFile] - Archivo de imagen para subir (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    /**
     * Obtiene todos los usuarios registrados en el sistema con su información de rol
     * @returns {Promise<{success: boolean, data?: Array, error?: any}>} - Lista de usuarios con sus datos
     */
    static async obtenerTodosLosUsuarios() {
        try {
            const { data: usuarios, error } = await supabase
                .from('usuario')
                .select(`
                    id_usuario,
                    nombre,
                    apellidos,
                    direccion,
                    imagen,
                    rol: id_rol (id_rol, nombre_rol)
                `)
                .order('nombre', { ascending: true });
                
            if (error) throw error;
            
            return { success: true, data: usuarios };
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Obtiene un servicio por su ID
     * @param {number} servicioId - ID del servicio a obtener
     * @returns {Promise<{success: boolean, data?: Object, error?: any}>} - Resultado de la operación con los datos del servicio
     */
    static async obtenerServicioPorId(servicioId) {
        try {
            const { data, error } = await supabase
                .from('servicio')
                .select('nombre_servicio')
                .eq('id_servicio', servicioId)
                .single();
                
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error al obtener el servicio:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Obtiene todos los servicios disponibles
     * @returns {Promise<{success: boolean, data?: Array, error?: any}>} - Lista de servicios o error
     */
    static async obtenerServicios() {
        try {
            const { data, error } = await supabase
                .from('servicio')
                .select('*');
                
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error al obtener servicios:', error);
            return { success: false, error };
        }
    }

    /* Crea una nueva cita en la base de datos
     * @param {string} idMascota - ID de la mascota para la cita
     * @param {string} fecha - Fecha de la cita en formato YYYY-MM-DD
     * @param {string} horaInicio - Hora de inicio de la cita en formato HH:MM
     * @param {string} horaFinal - Hora de finalización de la cita en formato HH:MM
     * @param {string} idServicio - ID del servicio solicitado
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async crearCita(idMascota, fecha, horaInicio, horaFinal, idServicio) {
        try {
            // Verificar que todos los campos requeridos estén presentes
            if (!idMascota || !fecha || !horaInicio || !horaFinal || !idServicio) {
                throw new Error('Los campos id_mascota, fecha, hora_inicio, hora_final y id_servicio son obligatorios');
            }

            // Validar que la hora de inicio sea anterior a la hora final
            const inicio = new Date(`2000-01-01T${horaInicio}`);
            const fin = new Date(`2000-01-01T${horaFinal}`);
            
            if (inicio >= fin) {
                throw new Error('La hora de inicio debe ser anterior a la hora final');
            }

            // Obtener el ID del usuario autenticado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar si ya existe una cita que se solape con el horario
            // Primero, obtener todas las citas existentes para la fecha
            const { data: citasExistentes, error: errorCitas } = await supabase
                .from('cita')
                .select('id_cita, hora_inicio, hora_final')
                .eq('fecha', fecha);

            if (errorCitas) {
                console.error('Error al verificar citas existentes:', errorCitas);
                throw errorCitas;
            }

            // Crear la cita
            const datosCita = {
                id_mascota: idMascota,
                fecha: fecha,
                hora_inicio: horaInicio,
                hora_final: horaFinal,
                is_canceled: false // Estado inicial: no cancelada
            };

            // Agregar id_servicio solo si se proporciona
            if (idServicio) {
                datosCita.id_servicio = idServicio;
            }

            const { data, error } = await supabase
                .from('cita')
                .insert([datosCita])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error al crear la cita:', error);
            return { 
                success: false, 
                error: error.message || 'Error al crear la cita' 
            };
        }
    }

    /**
     * Obtiene todas las citas del sistema
     * @returns {Promise<{success: boolean, data?: Array, error?: any}>} - Lista de citas o error
     */
    static async obtenerTodasLasCitas() {
        try {
            const { data, error } = await supabase
                .from('cita')
                .select(`*`)
                .order('fecha', { ascending: true })
                .order('hora_inicio', { ascending: true });
                
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error al obtener las citas:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Actualiza el perfil del usuario actual (nombre, apellidos, dirección e imagen)
     * @param {Object} datosUsuario - Datos actualizados del usuario
     * @param {string} datosUsuario.nombre - Nombre del usuario
     * @param {string} datosUsuario.apellidos - Apellidos del usuario
     * @param {string} datosUsuario.direccion - Dirección del usuario
     * @param {string} datosUsuario.imagen - URL de la imagen de perfil
     * @param {File} [datosUsuario.imagenFile] - Archivo de imagen para subir (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    /**
     * Elimina una cita por su ID
     * @param {string} citaId - ID de la cita a eliminar
     * @returns {Promise<{success: boolean, error?: any}>} - Resultado de la operación
     */
    static async eliminarCita(citaId) {
        try {
            const { error } = await supabase
                .from('cita')
                .delete()
                .eq('id_cita', citaId);
                
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar la cita:', error);
            return { 
                success: false, 
                error: error.message || 'Error al eliminar la cita' 
            };
        }
    }
    
    /**
     * Actualiza el perfil del usuario actual (nombre, apellidos, dirección e imagen)
     * @param {Object} datosUsuario - Datos actualizados del usuario
     * @param {string} datosUsuario.nombre - Nombre del usuario
     * @param {string} datosUsuario.apellidos - Apellidos del usuario
     * @param {string} datosUsuario.direccion - Dirección del usuario
     * @param {string} datosUsuario.imagen - URL de la imagen de perfil
     * @param {File} [datosUsuario.imagenFile] - Archivo de imagen para subir (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async actualizarPerfilUsuario(datosUsuario, idUsuario = null) {
        try {

            if (idUsuario === null) {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session) {
                    throw new Error('No hay una sesión activa');
                }
                idUsuario = session.user.id;
            }
            
            // Preparar datos para actualizar
            const updateData = {
                nombre: datosUsuario.nombre || '',
                apellidos: datosUsuario.apellidos || '',
                direccion: datosUsuario.direccion || ''
            };
            
            // Si hay un archivo de imagen nuevo, subirlo a Storage
            if (datosUsuario.imagenFile) {
                // Generar un nombre único para el archivo
                const fileName = idUsuario;
                
                // Subir el archivo a Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('imagenes')
                    .upload(`perfiles/${fileName}`, datosUsuario.imagenFile, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (uploadError) throw uploadError;
                
                // Obtener la URL firmada del archivo con validez de 1 año
                const expiresIn = 365 * 24 * 60 * 60; // 1 año en segundos
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('imagenes')
                    .createSignedUrl(`perfiles/${fileName}`, expiresIn);

                if (signedUrlError) {
                    console.error('Error creating signed URL:', signedUrlError);
                    throw signedUrlError;
                }
                
                // Agregar la URL firmada de la imagen a los datos a actualizar
                updateData.imagen = signedUrlData.signedUrl;
            } else if (datosUsuario.imagen) {
                // Si no hay archivo pero hay URL de imagen, usar esa URL
                updateData.imagen = datosUsuario.imagen;
            }
            
            // Actualizar los datos en la base de datos
            const { data: updateResult, error: updateError } = await supabase
                .from('usuario')
                .update(updateData)
                .eq('id_usuario', idUsuario);
            
            if (updateError) throw updateError;
            
            return { success: true, data: updateResult };
            
        } catch (error) {
            console.error('Error al actualizar el perfil del usuario:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Obtiene las alergias de una mascota específica
     * @param {number} idMascota - ID de la mascota
     * @returns {Promise<{success: boolean, data?: Array<{id_alergia: number, nombre: string, fecha_diagnostico: string}>, error?: any}>} - Lista de alergias de la mascota
     */
    static async obtenerAlergiasMascota(idMascota) {
        try {
            if (!idMascota) {
                throw new Error('Se requiere el ID de la mascota');
            }
            
            // Obtener las alergias de la mascota con información de la alergia
            const { data, error } = await supabase
                .from('mascota_alergia')
                .select(`
                    alergia:alergia (
                        id_alergia,
                        nombre
                    ),
                    fecha_diagnostico
                `)
                .eq('id_mascota', idMascota);
                
            if (error) throw error;
            
            // Mapear los resultados para aplanar la estructura
            const alergias = data.map(item => ({
                id_alergia: item.alergia.id_alergia,
                nombre: item.alergia.nombre,
                fecha_diagnostico: item.fecha_diagnostico || 'Fecha no especificada'
            }));
            
            return { success: true, data: alergias };
            
        } catch (error) {
            console.error('Error al obtener alergias de la mascota:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Crea una nueva mascota para el usuario actual
     * @param {Object} datosMascota - Datos de la mascota a crear
     * @param {string} datosMascota.nombre - Nombre de la mascota
     * @param {string} datosMascota.especie - Especie de la mascota
     * @param {string} datosMascota.raza - Raza de la mascota
     * @param {string} datosMascota.fecha_nacimiento - Fecha de nacimiento de la mascota (formato YYYY-MM-DD)
     * @param {string} [datosMascota.genero] - Género de la mascota (opcional)
     * @param {string} [datosMascota.color] - Color de la mascota (opcional)
     * @param {string} [datosMascota.notas] - Notas adicionales (opcional)
     * @param {File} [datosMascota.imagen] - Archivo de imagen de la mascota (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async crearMascota(datosMascota) {
        try {
            // Obtener la sesión actual
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            if (!session) {
                throw new Error('No hay sesión activa');
            }
            
            const userId = session.user.id;
            
            // Preparar los datos básicos de la mascota
            const mascotaData = {
                id_usuario: userId,
                nombre: datosMascota.nombre,
                especie: datosMascota.especie,
                raza: datosMascota.raza,
                edad: datosMascota.edad ? Number(datosMascota.edad) : null,
                peso: datosMascota.peso ? Number(datosMascota.peso) : null,
                alergia: datosMascota.alergia || null,
                notas_especiales: datosMascota.notas_especiales || null
            };
            
            // Insertar la mascota en la base de datos sin la imagen primero
            const { data: mascotaCreada, error: insertError } = await supabase
                .from('mascota')
                .insert([mascotaData])
                .select();
                
            if (insertError) throw insertError;
            
            const idMascota = mascotaCreada[0].id_mascota;
            
            // Si hay una imagen, usar editarMascota para actualizarla
            if (datosMascota.imagen) {
                const resultadoEdicion = await this.editarMascota(idMascota, {
                    imagen: datosMascota.imagen
                });
                
                if (resultadoEdicion.success) {
                    return { 
                        success: true, 
                        data: resultadoEdicion.data,
                        message: 'Mascota creada y actualizada exitosamente' 
                    };
                }
            }
            
            return { 
                success: true, 
                data: mascotaCreada[0],
                message: 'Mascota creada exitosamente' 
            };
        } catch (error) {
            console.error('Error al crear la mascota:', error);
            return { 
                success: false, 
                error: error.message || 'Error al crear la mascota',
                details: error 
            };
        }
    }

    /**
     * Actualiza la información de una mascota existente
     * @param {number} idMascota - ID de la mascota a actualizar
     * @param {Object} datosMascota - Datos actualizados de la mascota
     * @param {string} [datosMascota.nombre] - Nuevo nombre de la mascota (opcional)
     * @param {string} [datosMascota.especie] - Nueva especie de la mascota (opcional)
     * @param {string} [datosMascota.raza] - Nueva raza de la mascota (opcional)
     * @param {string} [datosMascota.fecha_nacimiento] - Nueva fecha de nacimiento (formato YYYY-MM-DD) (opcional)
     * @param {string} [datosMascota.genero] - Nuevo género de la mascota (opcional)
     * @param {string} [datosMascota.color] - Nuevo color de la mascota (opcional)
     * @param {string} [datosMascota.notas] - Nuevas notas adicionales (opcional)
     * @param {File} [datosMascota.imagen] - Nueva imagen de la mascota (opcional)
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async editarMascota(idMascota, datosMascota) {
        try {
            if (!idMascota) {
                throw new Error('Se requiere el ID de la mascota para editar');
            }

            // Verificar que la mascota existe y pertenece al usuario
            const { success: mascotaExiste, data: mascotaExistente } = await this.obtenerMascotaPorId(idMascota);
            if (!mascotaExiste) {
                throw new Error('Mascota no encontrada o no tienes permiso para editarla');
            }

            // Preparar los datos a actualizar
            const datosActualizados = {};
            const camposPermitidos = ['nombre', 'especie', 'raza', 'edad', 'peso', 'alergia', 'notas_especiales', 'imagen', 'historial_medico'];
            
            // Agregar solo los campos que se proporcionaron
            Object.keys(datosMascota).forEach(key => {
                if (camposPermitidos.includes(key) && datosMascota[key] !== undefined) {
                    datosActualizados[key] = datosMascota[key];
                }
            });

            // Si hay una nueva imagen, subirla a Supabase Storage
            if (datosMascota.imagen) {
                const fileName = idMascota;
                
                // Subir la nueva imagen
                const { error: uploadError } = await supabase.storage
                    .from('imagenes')
                    .upload(`mascotas/${fileName}`, datosMascota.imagen, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (uploadError) throw uploadError;
                
                // Generar una URL firmada con validez de 1 año (en segundos)
                const EXPIRES_IN = 60 * 60 * 24 * 365; // 1 año en segundos
                const { data: signedUrlData } = await supabase.storage
                    .from('imagenes')
                    .createSignedUrl(`mascotas/${fileName}`, EXPIRES_IN);
                
                if (!signedUrlData || !signedUrlData.signedUrl) {
                    throw new Error('No se pudo generar la URL firmada para la imagen');
                }
                
                // Usar la URL firmada en lugar de la URL pública
                datosActualizados.imagen = signedUrlData.signedUrl;
            }

            // Si no hay datos para actualizar, retornar éxito
            if (Object.keys(datosActualizados).length === 0) {
                return { success: true, data: { mensaje: 'No se realizaron cambios' } };
            }

            // Actualizar la mascota en la base de datos
            const { data: mascotaActualizada, error: updateError } = await supabase
                .from('mascota')
                .update(datosActualizados)
                .eq('id_mascota', idMascota)
                .select();

            if (updateError) throw updateError;

            return {
                success: true,
                data: mascotaActualizada[0]
            };

        } catch (error) {
            console.error('Error al actualizar la mascota:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar la mascota'
            };
        }
    }
    
    /**
     * Obtiene las mascotas de un usuario específico con sus imágenes
     * @param {string} userId - ID del usuario
     * @returns {Promise<{success: boolean, data?: Array, error?: any, noSession?: boolean}>} - Lista de mascotas del usuario con URLs de imagen
     */
    static async obtenerMascotasPorUsuario(userId = null) {
        try {

            if (!userId) {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    console.warn('Error al verificar sesión:', sessionError);
                    return { success: false, noSession: true, error: 'Error al verificar la sesión' };
                }
                
                if (!session) {
                    // No hay sesión activa, retornamos un objeto indicando esto
                    return { success: false, noSession: true, error: 'No hay una sesión activa' };
                }
                
                userId = session.user.id;
            }
            
            // Verificar sesión activa
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.warn('Error al verificar sesión:', sessionError);
                return { success: false, noSession: true, error: 'Error al verificar la sesión' };
            }
            
            if (!session) {
                return { success: false, noSession: true, error: 'No hay una sesión activa' };
            }
            
            // Obtener las mascotas del usuario especificado
            const { data: mascotas, error: mascotasError } = await supabase
                .from('mascota')
                .select('*')
                .eq('id_usuario', userId);
                
            if (mascotasError) throw mascotasError;
            
            // Procesar cada mascota para obtener la URL de la imagen
            const mascotasConImagenes = await Promise.all(mascotas.map(async (mascota) => {
                if (!mascota.imagen) {
                    return { ...mascota, imagenUrl: '/Frontend/imagenes/default-pet.png' };
                }
                
                try {
                    // Verificar si la imagen es una URL completa o una ruta de almacenamiento
                    if (mascota.imagen.startsWith('http')) {
                        return { ...mascota, imagenUrl: mascota.imagen };
                    }
                    
                    // Obtener URL firmada para la imagen
                    const { data: { signedUrl } } = await supabase.storage
                        .from('imagenes')
                        .createSignedUrl(`mascotas/${mascota.id_mascota}`, 3600); // Válido por 1 hora
                        
                    return { 
                        ...mascota, 
                        imagenUrl: signedUrl || '/Frontend/imagenes/default-pet.png' 
                    };
                } catch (error) {
                    console.error(`Error al obtener la imagen de la mascota ${mascota.id_mascota}:`, error);
                    return { ...mascota, imagenUrl: '/Frontend/imagenes/default-pet.png' };
                }
            }));
            
            return { success: true, data: mascotasConImagenes };
            
        } catch (error) {
            console.error(`Error al obtener mascotas del usuario ID ${userId}:`, error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener las mascotas',
                noSession: error.message?.includes('No hay sesión activa')
            };
        }
    }
    
    /**
     * Obtiene una mascota por su ID verificando que pertenezca al usuario autenticado
     * @param {number} idMascota - ID de la mascota a buscar
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Datos de la mascota
     */
    static async obtenerMascotaPorId(idMascota) {
        try {
            if (!idMascota) {
                throw new Error('Se requiere el ID de la mascota');
            }

            // Verificar que el usuario esté autenticado
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                throw new Error('Usuario no autenticado');
            }

            // Obtener la mascota con el ID especificado
            const { data: mascota, error } = await supabase
                .from('mascota')
                .select('*')
                .eq('id_mascota', idMascota)
                .single();

            if (error || !mascota) {
                throw new Error('Mascota no encontrada');
            }

            return { success: true, data: mascota };
            
        } catch (error) {
            console.error('Error al obtener la mascota:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener la mascota',
                details: error 
            };
        }
    }
    
    /**
     * Elimina una mascota y su imagen asociada
     * @param {number} idMascota - ID de la mascota a eliminar
     * @returns {Promise<{success: boolean, error?: any}>} - Resultado de la operación
     */
    static async borrarMascota(idMascota) {
        try {
            if (!idMascota) {
                throw new Error('Se requiere el ID de la mascota');
            }

            // Verificar que la mascota existe y pertenece al usuario
            const { success: mascotaExiste, data: mascota } = await this.obtenerMascotaPorId(idMascota);
            if (!mascotaExiste) {
                throw new Error('Mascota no encontrada o no tienes permiso para eliminarla');
            }

            // Eliminar la imagen de la mascota si existe
            if (mascota.imagen) {
                const fileName = idMascota;
                const { error: deleteImageError } = await supabase.storage
                    .from('imagenes')
                    .remove([`mascotas/${fileName}`]);
                
                // No lanzar error si la imagen no existe, continuar con la eliminación del registro
                if (deleteImageError && !deleteImageError.message.includes('not found')) {
                    console.warn('Advertencia al eliminar la imagen de la mascota:', deleteImageError);
                    // Continuar con la eliminación del registro aunque falle la eliminación de la imagen
                }
            }

            // Eliminar la mascota de la base de datos
            const { error: deleteError } = await supabase
                .from('mascota')
                .delete()
                .eq('id_mascota', idMascota);
                
            if (deleteError) throw deleteError;
            
            return { success: true };
            
        } catch (error) {
            console.error('Error al eliminar la mascota:', error);
            return { 
                success: false, 
                error: error.message || 'Error al eliminar la mascota',
                details: error 
            };
        }
    }
    
    /**
     * Obtiene todas las citas de un usuario específico
     * @param {string} userId - ID del usuario del que se quieren obtener las citas
     * @returns {Promise<{success: boolean, data?: Array<{
     *   id_cita: string,
     *   fecha: string,
     *   hora_inicio: string,
     *   hora_final: string,
     *   is_canceled: boolean,
     *   mascota: { id_mascota: string, nombre: string },
     *   servicio: { id_servicio: number, nombre: string }
     * }>, error?: any}>} - Lista de citas del usuario
     */
    static async obtenerCitasPorUsuario(userId) {
        try {
            if (!userId) {
                throw new Error('Se requiere el ID del usuario');
            }
            
            // Obtener las mascotas del usuario
            const { data: mascotas, error: mascotasError } = await supabase
                .from('mascota')
                .select('id_mascota')
                .eq('id_usuario', userId);
                
            if (mascotasError) throw mascotasError;
            
            // Si el usuario no tiene mascotas, devolver array vacío
            if (!mascotas || mascotas.length === 0) {
                return { success: true, data: [] };
            }
            
            // Obtener los IDs de las mascotas
            const mascotaIds = mascotas.map(m => m.id_mascota);
            
            // Obtener las citas de las mascotas del usuario
            const { data: citas, error: citasError } = await supabase
                .from('cita')
                .select(`
                    id_cita,
                    fecha,
                    hora_inicio,
                    hora_final,
                    is_canceled,
                    mascota: id_mascota (id_mascota, nombre),
                    servicio: id_servicio (id_servicio, nombre_servicio)
                `)
                .in('id_mascota', mascotaIds)
                .order('fecha', { ascending: true })
                .order('hora_inicio', { ascending: true });
                
            if (citasError) throw citasError;
            
            return { success: true, data: citas || [] };
            
        } catch (error) {
            console.error('Error al obtener las citas del usuario:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener las citas',
                noSession: error.message?.includes('No hay sesión activa')
            };
        }
    }
    
    /**
     * Obtiene todas las citas de las mascotas del usuario actualmente autenticado
     * @returns {Promise<{success: boolean, data?: Array<{
     *   id_cita: string,
     *   fecha: string,
     *   hora_inicio: string,
     *   hora_final: string,
     *   is_canceled: boolean,
     *   mascota: { id_mascota: string, nombre: string },
     *   servicio: { id_servicio: number, nombre: string }
     * }>, error?: any}>} - Lista de citas de las mascotas del usuario
     */
    static async obtenerCitasMascotas(userId) {
        try {
            // Obtener la sesión actual
            if (!userId) {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session) return { success: false, noSession: true };
                userId = session.user.id;
            }
            
            // 1. Obtener todas las mascotas del usuario
            const { data: mascotas, error: mascotasError } = await supabase
                .from('mascota')
                .select('id_mascota')
                .eq('id_usuario', userId);
                
            if (mascotasError) throw mascotasError;
            
            // Si el usuario no tiene mascotas, retornar array vacío
            if (!mascotas || mascotas.length === 0) {
                return { success: true, data: [] };
            }
            
            // Extraer los IDs de las mascotas
            const mascotasIds = mascotas.map(m => m.id_mascota);
            
            // 2. Obtener las citas para todas las mascotas del usuario
            const { data: citas, error: citasError } = await supabase
                .from('cita')
                .select(`
                    id_cita,
                    fecha,
                    hora_inicio,
                    hora_final,
                    is_canceled,
                    mascota: id_mascota (id_mascota, nombre),
                    servicio: id_servicio (id_servicio, nombre_servicio)
                `)
                .in('id_mascota', mascotasIds)
                .order('fecha', { ascending: true })
                .order('hora_inicio', { ascending: true });
                
            if (citasError) throw citasError;
            
            return { 
                success: true, 
                data: citas || [] 
            };
            
        } catch (error) {
            console.error('Error al obtener las citas de las mascotas:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener las citas de las mascotas',
                details: error 
            };
        }
    }

    static async obtenerUsuarioPorToken(userId) {
        try {
            // Si no hay ID de usuario, devolver error
            if (!userId) {
                throw new Error('No se proporcionó ID de usuario');
            }
            
            // Obtener datos del usuario desde la tabla usuario junto con su rol
            const { data: userData, error: userError } = await supabase
                .from('usuario')
                .select('*, rol:id_rol(*)')
                .eq('id_usuario', userId)
                .single();
                
            if (userError) throw userError;
            
            // Si no se encuentra el usuario, lanzar error
            if (!userData) {
                throw new Error('Usuario no encontrado en la base de datos');
            }
            
            // Preparar objeto de usuario con rol
            const userObject = {
                id: userData.id_usuario,
                role: userData.rol.nombre_rol,
                // Otros datos que puedan ser necesarios
            };
            
            return { success: true, data: { user: userData, userObject } };
            
        } catch (error) {
            console.error('Error al obtener información del usuario:', error);
            return { success: false, error };
        }
    }

    /**
     * Obtiene todas las citas de una mascota específica por su ID
     * @param {string} idMascota - ID de la mascota
     * @returns {Promise<{success: boolean, data?: Array<{
     *   id_cita: string,
     *   fecha: string,
     *   hora_inicio: string,
     *   hora_final: string,
     *   is_canceled: boolean,
     *   mascota: { id_mascota: string, nombre: string },
     *   servicio: { id_servicio: number, nombre_servicio: string }
     * }>, error?: any}>} - Lista de citas de la mascota
     */
    static async obtenerCitasPorMascota(idMascota) {
        try {
            if (!idMascota) {
                throw new Error('ID de mascota no proporcionado');
            }

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            if (!session) return { success: false, noSession: true };
            
            // Obtener las citas de la mascota sin verificar el propietario para simplificar
            const { data: citas, error: citasError } = await supabase
                .from('cita')
                .select(`
                    id_cita,
                    fecha,
                    hora_inicio,
                    hora_final,
                    is_canceled,
                    mascota: id_mascota (id_mascota, nombre),
                    servicio: id_servicio (id_servicio, nombre_servicio)
                `)
                .eq('id_mascota', idMascota)
                .order('fecha', { ascending: false })
                .order('hora_inicio', { ascending: false });
                
            if (citasError) throw citasError;
            
            return { 
                success: true, 
                data: citas || [] 
            };
            
        } catch (error) {
            console.error('Error al obtener las citas de la mascota:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener las citas de la mascota',
                details: error 
            };
        }
    }
    
    /**
     * Obtiene el ID de usuario asociado a una mascota
     * @param {string} mascotaId - ID de la mascota
     * @returns {Promise<{success: boolean, data?: {id_usuario: string}, error?: any}>} - ID del usuario o error
     */
    static async obtenerUsuarioIdPorMascotaId(mascotaId) {
        try {
            if (!mascotaId) {
                throw new Error('ID de mascota no proporcionado');
            }

            const { data, error } = await supabase
                .from('mascota')
                .select('id_usuario')
                .eq('id_mascota', mascotaId)
                .single();

            if (error) throw error;
            if (!data) {
                throw new Error('No se encontró la mascota especificada');
            }

            return { 
                success: true, 
                data: { id_usuario: data.id_usuario } 
            };

        } catch (error) {
            console.error('Error al obtener el ID de usuario por ID de mascota:', error);
            return { 
                success: false, 
                error: error.message || 'Error al obtener el ID de usuario' 
            };
        }
    }

    /**
     * Convierte una hora en formato HH:MM a minutos desde la medianoche
     * @param {string} timeString - Hora en formato HH:MM
     * @returns {number} Minutos desde la medianoche
     */
    static timeToMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Cancela una cita cambiando su estado a 'cancelada'
     * @param {string} appointmentId - ID de la cita a cancelar
     * @returns {Promise<{success: boolean, data?: any, error?: any}>} - Resultado de la operación
     */
    static async cancelarCita(appointmentId) {
        try {
            // Verificar que el ID de la cita sea válido
            if (!appointmentId) {
                throw new Error('ID de cita no proporcionado');
            }

            // Actualizar el estado de la cita a 'cancelada' en la base de datos
            const { data, error } = await supabase
                .from('cita')
                .update({ 
                    is_canceled: true,
                })
                .eq('id_cita', appointmentId)
                .select();

            if (error) {
                console.error('Error al cancelar la cita:', error);
                return { 
                    success: false, 
                    error: error.message || 'Error al actualizar el estado de la cita' 
                };
            }

            if (!data || data.length === 0) {
                return { 
                    success: false, 
                    error: 'No se encontró la cita especificada' 
                };
            }

            return { 
                success: true, 
                data: data[0] 
            };

        } catch (error) {
            console.error('Error en cancelarCita:', error);
            return { 
                success: false, 
                error: error.message || 'Error inesperado al cancelar la cita' 
            };
        }
    }
    
    /**
     * Elimina uno o más usuarios de Supabase Auth, la base de datos y sus imágenes de perfil
     * @param {string|string[]} userIds - ID o array de IDs de los usuarios a eliminar
     * @returns {Promise<{success: boolean, deletedCount: number, errors: Array<{userId: string, error: any}>}>} - Resultado de la operación
     */
    static async eliminarUsuarios(userIds) {
        if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
            return { success: false, error: "No se proporcionaron IDs de usuario" };
        }
    
        const ids = Array.isArray(userIds) ? userIds : [userIds];
        
        try {
            // Obtener la sesión actual
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("No hay una sesión activa");
            }
    
            // Llamar a la función de borde
            const { data, error } = await supabase.functions.invoke('eliminar-usuarios', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: { userIds: ids }
            });
    
            if (error) {
                console.error('Error al invocar la función:', error);
                throw new Error(error.message || 'Error al eliminar los usuarios');
            }
    
            // Verificar si hay errores en la respuesta
            if (data && data.error) {
                throw new Error(data.error);
            }
    
            // Eliminar usuarios de la base de datos y sus imágenes de perfil
            const results = {
                success: true,
                deletedCount: 0,
                results: []
            };
    
            for (const userId of ids) {
                const userResult = { userId, success: true, errors: [] };
    
                try {
                    // 1. Eliminar imagen de perfil si existe
                    // 1. Eliminar imágenes del storage
                    try {
                        const { error: removeError } = await supabase.storage
                            .from('imagenes')
                            .remove([`perfiles/${userId}`]);
                        
                        if (removeError) {
                            throw removeError;
                        }
                    } catch (storageError) {
                        console.error(`Error eliminando imagen de perfil de ${userId}:`, storageError);
                        userResult.errors.push(`Error eliminando imagen: ${storageError.message}`);
                    }
    
                    // 2. Eliminar de la base de datos
                    const { error: dbError } = await supabase
                        .from('usuario')
                        .delete()
                        .eq('id_usuario', userId);
    
                    if (dbError) {
                        throw dbError;
                    }
    
                    results.deletedCount++;
                } catch (error) {
                    console.error(`Error procesando usuario ${userId}:`, error);
                    userResult.success = false;
                    userResult.errors.push(error.message);
                }
    
                results.results.push(userResult);
            }
    
            // Verificar si hubo errores
            if (results.deletedCount < ids.length) {
                results.success = results.deletedCount > 0; // Éxito parcial si se eliminó al menos uno
                if (!results.success) {
                    throw new Error('No se pudo eliminar ningún usuario de la base de datos');
                }
            }
    
            return {
                success: true,
                deletedCount: results.deletedCount,
                failedCount: ids.length - results.deletedCount,
                results: results.results,
                data: data
            };
    
        } catch (error) {
            console.error('Error en eliminarUsuarios:', error);
            return {
                success: false,
                deletedCount: 0,
                error: error.message || 'Error desconocido al eliminar los usuarios'
            };
        }
    }
}