import { API } from '../services/APIS.js';

/**
 * Maneja la funcionalidad de registro de usuarios
 */
import { UserAuthManager } from "../managers/UserAuthManager.js";

document.addEventListener('DOMContentLoaded', () => {
    const formularioRegistro = document.getElementById('registro-form');
    const mensajeRegistro = document.getElementById('registro-mensaje');
    
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obtener valores del formulario
            const email = document.getElementById('registro-email').value;
            const password = document.getElementById('registro-password').value;
            const terminos = document.getElementById('registro-terminos').checked;
            
            // Validaciones básicas
            if (!email || !password) {
                mostrarMensaje('Por favor, completa todos los campos', true);
                return;
            }
            
            if (!terminos) {
                mostrarMensaje('Debes aceptar los términos y condiciones', true);
                return;
            }
            
            // Validar formato de email
            if (!validarEmail(email)) {
                mostrarMensaje('Por favor, ingresa un email válido', true);
                return;
            }
            
            // Validar complejidad de contraseña
            if (password.length < 6) {
                mostrarMensaje('La contraseña debe tener al menos 6 caracteres', true);
                return;
            }
            
            try {
                // Mostrar estado de carga
                const botonRegistro = document.getElementById('boton-registro');
                botonRegistro.textContent = 'Registrando...';
                botonRegistro.disabled = true;
                
                // Llamar a la API para registrar al usuario
                const resultado = await API.registrarUsuario(email, password);
                
                if (resultado.success) {
                    // Limpiar cualquier sesión que se haya podido crear
                    await API.cerrarSesion();
                    
                    // Mostrar mensaje de éxito
                    mostrarMensaje('¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta.', false);
                    formularioRegistro.reset();
                    
                    // Redirigir al login después de un breve retraso
                    setTimeout(() => {
                        desactivar(); // Cambiar de registro a login
                        // Limpiar el mensaje después de cambiar a login
                        const mensajeLogin = document.getElementById('login-mensaje');
                        if (mensajeLogin) {
                            mensajeLogin.textContent = 'Por favor inicia sesión con tus credenciales';
                            mensajeLogin.style.display = 'block';
                        }
                    }, 2000);
                } else {
                    mostrarMensaje(`Error al registrar: ${resultado.error?.message || 'Intenta nuevamente'}`, true);
                }
            } catch (error) {
                mostrarMensaje(`Error de conexión: ${error.message}`, true);
            } finally {
                const botonRegistro = document.getElementById('boton-registro');
                botonRegistro.textContent = 'Registrarse';
                botonRegistro.disabled = false;
            }
        });
    }
    
    /**
     * Muestra un mensaje en el formulario
     * @param {string} texto - Texto del mensaje
     * @param {boolean} esError - Si es un mensaje de error
     */
    function mostrarMensaje(texto, esError) {
        mensajeRegistro.textContent = texto;
        mensajeRegistro.style.display = 'block';
        mensajeRegistro.style.color = esError ? 'red' : 'green';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            mensajeRegistro.style.display = 'none';
        }, 5000);
    }
    
    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} - Si el email es válido
     */
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
});
