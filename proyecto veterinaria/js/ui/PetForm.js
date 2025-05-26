import { PetManager } from '../managers/PetManager.js';
import { notificationService } from '../services/NotificationService.js';
import { renderPetCards } from './PetView.js';
import { ProfileUI } from './ProfileUI.js';

// Create a global instance of PetManager
const petManager = new PetManager();

document.addEventListener('DOMContentLoaded', function() {
    const addPetBtn = document.getElementById('add-pet-btn');
    const modal = document.getElementById('add-pet-modal');
    const closeModal = document.querySelector('.close-modal');
    const addPetForm = document.getElementById('add-pet-form');

    // Abrir el modal al hacer clic en el botón
    addPetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.display = 'block';
    });

    // Cerrar el modal al hacer clic en la X
    closeModal.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.display = 'none';
    });

    // Cerrar el modal al hacer clic fuera de él
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Variable para controlar el estado del envío
    let isSubmitting = false;

    // Función para manejar el envío del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        // Si ya se está procesando un envío, no hacer nada
        if (isSubmitting) return;
        
        const submitBtn = addPetForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        try {
            // Marcar como enviando
            isSubmitting = true;
            
            // Deshabilitar el botón para evitar múltiples envíos
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            const petName = document.getElementById('pet-name').value;
            const petType = document.getElementById('pet-type').value;
            const petBreed = document.getElementById('pet-breed').value;
            const petWeight = parseFloat(document.getElementById('pet-weight').value) || null;
            const petAge = parseInt(document.getElementById('pet-age').value) || null;
            const petNotes = document.getElementById('pet-notes').value;
            const petImage = document.getElementById('pet-photo').files[0] || null;

            const newPet = {
                name: petName,
                type: petType,
                breed: petBreed,
                weight: petWeight,
                age: petAge,
                ageUnit: 'años', // Siempre será años
                notas_especiales: petNotes || null,
                imagen: petImage
            };

            // Añadir la mascota a través de la instancia de PetManager
            const result = await petManager.createPet(newPet);

            // Renderizar las tarjetas de mascotas y actualizar perfil
            setTimeout(async () => {
                await renderPetCards();
                // Si estamos en la página de perfil, recargar los datos del perfil
                const profilePage = document.getElementById('profile-page');
                if (profilePage) {
                    const profileUI = new ProfileUI();
                    await profileUI.loadProfileData();
                }
            }, 500);
            
            if (result && result.success) {
                // Cerrar el modal y resetear el formulario solo si la operación fue exitosa
                modal.style.display = 'none';
                addPetForm.reset();
                
                // Mostrar notificación de éxito
                if (!window.petCreationAlertShown) {
                    window.petCreationAlertShown = true;
                    notificationService.showSuccess(`¡${petName} ha sido añadida con éxito!`);
                    
                    // Recargar la lista de mascotas después de un breve retraso
                    setTimeout(() => {
                        if (window.location.pathname.endsWith('mascotas.html')) {
                            window.location.reload();
                        }
                        window.petCreationAlertShown = false;
                    }, 3000);
                }
            } else {
                throw new Error(result?.error || 'Error desconocido al crear la mascota');
            }
        } catch (error) {
            console.error('Error al crear la mascota:', error);
            if (!window.errorAlertShown) {
                window.errorAlertShown = true;
                notificationService.showError(`Error al crear la mascota: ${error.message}`);
                setTimeout(() => { window.errorAlertShown = false; }, 3000);
            }
        } finally {
            // Restaurar el estado del formulario
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    // Manejar el envío del formulario
    addPetForm.addEventListener('submit', handleSubmit, { once: false });
});