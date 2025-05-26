import { UserAuthManager } from "../managers/UserAuthManager.js";

// Manejo del formulario de inicio de sesión
document.addEventListener('DOMContentLoaded', () => {
    const formularioLogin = document.getElementById('login-form');
    const mensajeLogin = document.getElementById('login-mensaje');
    
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obtener valores del formulario
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Validaciones básicas
            if (!email || !password) {
                mostrarMensaje('Por favor, completa todos los campos', true);
                return;
            }
            
            // Validar formato de email
            if (!validarEmail(email)) {
                mostrarMensaje('Por favor, ingresa un email válido', true);
                return;
            }
            
            try {
                // Mostrar estado de carga
                const botonLogin = document.getElementById('boton-login');
                botonLogin.disabled = true;
                
                // Llamar al método login de UserAuthManager
                const success = await UserAuthManager.login(email, password);
                
                if (success) {
                    // Mostrar mensaje de éxito
                    mostrarMensaje('¡Inicio de sesión exitoso!', false);
                    formularioLogin.reset();
                    
                    // Cerrar el modal después de un breve retraso para que se vea el mensaje
                    setTimeout(() => {
                        document.querySelector('.contenedor').style.display = 'none';
                        window.location.reload();
                    }, 500);
                } else {
                    mostrarMensaje('Email o contraseña incorrectos', true);
                }
            } catch (error) {
                mostrarMensaje(`Error: ${error.message}`, true);
            } finally {
                const botonLogin = document.getElementById('boton-login');
                botonLogin.disabled = false;
            }
        });
    }
    
    /**
     * Muestra un mensaje en el formulario
     * @param {string} texto - Texto del mensaje
     * @param {boolean} esError - Si es un mensaje de error
     */
    function mostrarMensaje(texto, esError) {
        mensajeLogin.textContent = texto;
        mensajeLogin.style.display = 'block';
        mensajeLogin.style.color = esError ? 'red' : 'green';
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            mensajeLogin.style.display = 'none';
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