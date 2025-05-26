// Importar dependencias
import { PetManager } from '../managers/PetManager.js';
import { addPetCardEventListeners, renderPetCards } from './PetView.js';
import { notificationService } from '../services/NotificationService.js';
import { ProfileUI } from './ProfileUI.js';

// Inicializar instancia de PetManager
const petManager = new PetManager();

// Funcionalidad para borrar mascotas

// Variables para controlar el modo de borrado
let deleteModeActive = false;
const selectedPets = new Set();

// Elementos del DOM
let petsGrid;
let deleteBtn;
let confirmDeleteBtn;
let cancelDeleteBtn;
let deleteConfirmContainer;
let petActionButtons;

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos del DOM
    petsGrid = document.getElementById('pets-grid');
    deleteBtn = document.getElementById('delete-pet-btn');
    confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    deleteConfirmContainer = document.getElementById('delete-confirm-container');
    petActionButtons = document.querySelector('.pet-action-buttons');

    // Asignar event listeners a los botones
    if (deleteBtn) {
        deleteBtn.addEventListener('click', toggleDeleteMode);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', cancelDelete);
    }
});

// Función para activar/desactivar el modo de borrado
function toggleDeleteMode() {
    deleteModeActive = !deleteModeActive;
    
    // Activar/desactivar la visualización de los controles de borrado
    if (deleteModeActive) {
        // Activar modo de borrado
        petsGrid.classList.add('delete-mode');
        deleteConfirmContainer.style.display = 'flex';
        petActionButtons.style.display = 'none';
        
        // Añadir checkboxes a cada tarjeta de mascotas
        addCheckboxesToPetCards();
        
        // Cambiar el comportamiento del clic en las tarjetas
        updatePetCardEventListeners();
    } else {
        // Desactivar modo de borrado
        resetDeleteMode();
    }
}

// Función para añadir checkboxes a las tarjetas de mascotas
function addCheckboxesToPetCards() {
    const petCards = document.querySelectorAll('.pet-card');
    
    petCards.forEach(card => {
        // Evitar duplicados
        if (!card.querySelector('.pet-checkbox')) {
            const checkbox = document.createElement('div');
            checkbox.className = 'pet-checkbox';
            card.appendChild(checkbox);
        }
    });
}

// Función para actualizar el comportamiento de los event listeners en las tarjetas
function updatePetCardEventListeners() {
    const petCards = document.querySelectorAll('.pet-card');
    
    petCards.forEach(card => {
        // Eliminar todos los event listeners anteriores (forma indirecta)
        const cardClone = card.cloneNode(true);
        card.parentNode.replaceChild(cardClone, card);
        
        // Añadir nuevo event listener para modo de borrado
        cardClone.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const petId = this.getAttribute('data-pet-id');
            // Solo permitir selección si deleteModeActive es true
            if (deleteModeActive) {
                togglePetSelection(this, petId);
            }
        });
    });
}

// Función para seleccionar/deseleccionar una mascota
function togglePetSelection(card, petId) {
    const checkbox = card.querySelector('.pet-checkbox');
    
    if (selectedPets.has(petId)) {
        // Deseleccionar
        selectedPets.delete(petId);
        card.classList.remove('selected');
        checkbox.classList.remove('checked');
    } else {
        // Seleccionar
        selectedPets.add(petId);
        card.classList.add('selected');
        checkbox.classList.add('checked');
    }
    
    // Actualizar el texto del botón de confirmar
    updateConfirmButtonText();
}

// Función para actualizar el texto del botón de confirmar según la cantidad de mascotas seleccionadas
function updateConfirmButtonText() {
    const count = selectedPets.size;
    
    if (count === 0) {
        confirmDeleteBtn.textContent = 'Confirmar Borrado';
        confirmDeleteBtn.disabled = true;
    } else if (count === 1) {
        confirmDeleteBtn.textContent = 'Borrar 1 Mascota';
        confirmDeleteBtn.disabled = false;
    } else {
        confirmDeleteBtn.textContent = `Borrar ${count} Mascotas`;
        confirmDeleteBtn.disabled = false;
    }
}

// Función para confirmar la eliminación de las mascotas seleccionadas
function confirmDelete() {
    if (selectedPets.size === 0) return;
    
    // Convertir el Set a Array para procesarlo
    const petIdsToDelete = Array.from(selectedPets);
    
    // Llamar a la función deletePet para cada mascota seleccionada
    petIdsToDelete.forEach(petId => {
        petManager.deletePet(petId);
    });
    
    // Mostrar mensaje de confirmación
    if (petIdsToDelete.length === 1) {
        notificationService.showSuccess('Se ha eliminado 1 mascota correctamente');
    } else {
        notificationService.showSuccess(`Se han eliminado ${petIdsToDelete.length} mascotas correctamente`);
    }
    
    // Resetear el modo de borrado
    resetDeleteMode();
    
    // Actualizar la vista de mascotas
    setTimeout(async () => {
        await renderPetCards();
        // Si estamos en la página de perfil, recargar los datos del perfil
        const profilePage = document.getElementById('profile-page');
        if (profilePage) {
            const profileUI = new ProfileUI();
            await profileUI.loadProfileData();
        }
    }, 500);
}

// Función para cancelar el modo de borrado
function cancelDelete() {
    resetDeleteMode();
    // Evitar la selección de tarjeta hasta que se active nuevamente el modo de eliminación
    deleteModeActive = false;
}

// Función para resetear el modo de borrado
function resetDeleteMode() {
    deleteModeActive = false;
    selectedPets.clear();
    
    // Restaurar la visualización normal
    petsGrid.classList.remove('delete-mode');
    deleteConfirmContainer.style.display = 'none';
    petActionButtons.style.display = 'flex';
    
    // Quitar la selección de todas las tarjetas
    const petCards = document.querySelectorAll('.pet-card');
    petCards.forEach(card => {
        card.classList.remove('selected');
        
        // Reiniciar checkboxes de eliminación
        const checkbox = card.querySelector('.pet-checkbox');
        if (checkbox) {
            checkbox.classList.remove('checked');
        }
    });
    
    // Restaurar el comportamiento original de clic en las tarjetas
    if (typeof addPetCardEventListeners === 'function') {
        addPetCardEventListeners();
    }
}
