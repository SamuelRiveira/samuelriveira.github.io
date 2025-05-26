/**
 * Script de inicialización de la aplicación CuidaPet
*/
import { RoleUIManager } from "../ui/RoleUIManager.js";
import { UserAuthManager } from "../managers/UserAuthManager.js";

// Inicializar el sistema de roles cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia del gestor de UI basado en roles
    const roleManager = new RoleUIManager();
});
