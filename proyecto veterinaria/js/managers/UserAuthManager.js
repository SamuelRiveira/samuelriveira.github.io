/**
 * Clase encargada de la gestión de autenticación y autorización de usuarios
 * Proporciona funciones para verificar el estado de sesión y los roles de usuario
 */
import { API } from "../services/APIS.js";

class UserAuthManager {
    
    /**
     * Verifica el estado de sesión y rol del usuario actual
     * @returns {Promise<Object>} Estado de sesión y datos del usuario según su rol
     */
    static async getUserStatus() {
        const storedToken = localStorage.getItem('sb-kmypwriazdbxpwdxfhaf-auth-token');
        
        if (!storedToken) {
            return { isLoggedIn: false };
        }
        
        try {
            const parsedToken = JSON.parse(storedToken);
            
            if (!parsedToken.user?.id) {
                console.error('Token inválido: no contiene ID de usuario');
                return { isLoggedIn: false };
            }
            
            const userId = parsedToken.user.id;
            const userResult = await API.obtenerUsuarioPorToken(userId);
            
            if (!userResult.success) {
                console.error('Error al obtener información del usuario:', userResult.error);
                return { isLoggedIn: false };
            }
            
            const { userObject } = userResult.data;
            const userRole = userObject.role;
            
            return {
                isLoggedIn: true,
                userRole: userRole
            };
            
        } catch (error) {
            console.error('Error al procesar el estado del usuario:', error);
            return { isLoggedIn: false };
        }
    }
    
    /**
     * Realiza el inicio de sesión
     * @param {string} email - Correo electrónico del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<boolean>} - Éxito de la operación
     */
    static async login(email, password) {
        try {
            const resultado = await API.iniciarSesion(email, password);
            return resultado.success;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            return false;
        }
    }
    
    /**
     * Cierra la sesión del usuario actual
     * @returns {Promise<boolean>} - Éxito de la operación
     */
    static async logout() {
        try {
            const resultado = await API.cerrarSesion();
            return resultado.success;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return false;
        }
    }
}

export { UserAuthManager };
