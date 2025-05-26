import { PetManager } from "../managers/PetManager.js";
import { showPage } from "../core/navigation.js";
import { PetEdit } from "./PetEdit.js";
import { notificationService } from "../services/NotificationService.js";
import { AppointmentManager } from "../managers/AppointmentManager.js";
import { API } from "../services/APIS.js";

// Instanciamos el AppointmentManager
const appointmentManager = new AppointmentManager();

// Instanciamos la clase PetManager
const petManager = new PetManager();

// Función para generar el HTML de una tarjeta de mascota
function createPetCardHTML(pet) {
    return `
        <div class="pet-card" data-pet-id="${pet.id}">
            <div style="position: relative;">
                <img src="${pet.photoUrl}" alt="Foto de ${pet.name}">
                <span class="pet-age">${pet.age} ${pet.ageUnit}</span>
            </div>
            <div class="pet-info">
                <span class="pet-type">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11.25 16.25h1.5L12 17z"></path>
                        <path d="M16 14v.5"></path>
                        <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                        <path d="M8 14v.5"></path>
                        <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                    </svg>
                    ${pet.type}</span>
                <h3 class="pet-name">${pet.name}</h3>
                <p class="pet-breed">${pet.breed}</p>
                <div class="pet-appointment">
                    <strong>Próxima cita:</strong> ${pet.appointment}
                </div>
            </div>
        </div>
    `;
}

// Función para renderizar todas las tarjetas de mascotas
async function renderPetCards(requestedUserId = null) {
    const petsGrid = document.getElementById('pets-grid');
    if (!petsGrid) {
        console.error('Elemento pets-grid no encontrado');
        return;
    }

    // Limpia la grid antes de añadir nuevas tarjetas
    petsGrid.innerHTML = '';

    try {
        // Obtiene los datos de las mascotas del PetManager
        const currentUser = await API.obtenerPerfilUsuario();
        const userId = requestedUserId || (currentUser?.data?.id_usuario);
        
        if (!userId) {
            // Si no hay usuario logueado, mostramos mensaje amigable
            petsGrid.innerHTML = `
                <div class="no-pets-message">
                    <p>Inicia sesión para ver tus mascotas</p>
                </div>`;
            return;
        }
    
        const pets = await petManager.getPetsData(userId);

        // Verifica si hay mascotas
        if (pets.length === 0) {
            // Cambia el estilo a flex para centrar el mensaje
            petsGrid.style.display = 'flex';
            petsGrid.style.justifyContent = 'center';

            // Si no hay mascotas, muestra un mensaje
            petsGrid.innerHTML = `
                <div class="no-pets-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11.25 16.25h1.5L12 17z"></path>
                        <path d="M16 14v.5"></path>
                        <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
                        <path d="M8 14v.5"></path>
                        <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
                    </svg>
                    <h3>No hay mascotas registradas</h3>
                    <p>Haz clic en "Añadir mascota" para registrar tu primera mascota.</p>
                </div>
            `;
            return;
        }

        // Si hay mascotas, asegúrate de que la grid tenga el estilo correcto
        petsGrid.style.display = 'grid';
        petsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        petsGrid.style.gap = '2rem';

        // Genera y añade el HTML para cada mascota
        pets.forEach(pet => {
            petsGrid.insertAdjacentHTML('beforeend', createPetCardHTML(pet));
        });

        // Añade los event listeners a las nuevas tarjetas
        addPetCardEventListeners();
    } catch (error) {
        console.error('Error al cargar las mascotas:', error);
        petsGrid.innerHTML = `
            <div class="no-pets-message">
                <p>Error al cargar las mascotas. Por favor, inténtalo de nuevo más tarde.</p>
            </div>`;
    }
}

// Carga los detalles de una mascota específica
async function loadPetDetails(petId) {
    // Obtener el ID del usuario actual
    const currentUser = await API.obtenerPerfilUsuario();
    const userId = currentUser?.data.id_usuario;
    
    if (!userId) {
        console.error('No se pudo obtener el ID del usuario actual');
        return;
    }
    
    // Busca la mascota por su ID usando la clase PetManager
    const pets = await petManager.getPetsData(userId);
    const pet = pets.find(p => p.id === petId);
    const appointments = await appointmentManager.getAppointments(userId);

    if (!pet) {
        console.error('Mascota no encontrada:', petId);
        return;
    }

    // Actualiza el título y la información básica
    const petNameElement = document.querySelector('#pet-detail-page h1');
    petNameElement.textContent = pet.name;
    petNameElement.id = 'pet-detail-name';
    document.querySelector('#pet-detail-page .pet-tag').nextSibling.textContent = ` ${pet.breed}`;
    document.querySelector('#pet-detail-page .pet-type').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.25 16.25h1.5L12 17z"></path>
            <path d="M16 14v.5"></path>
            <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"></path>
            <path d="M8 14v.5"></path>
            <path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path>
        </svg>
        ${pet.type}
    `;

    // Actualiza la próxima cita
    document.querySelector('#pet-detail-page .container-right h2').textContent = appointments.find(appointment => appointment.petId === pet.id)?.date || 'No hay citas programadas';

    // Actualiza la foto
    document.querySelector('#pet-detail-page .pet-photo img').src = pet.photoUrl;
    document.querySelector('#pet-detail-page .pet-photo img').alt = `Foto de ${pet.name}`;

    // Actualiza la información básica
    const infoItems = document.querySelectorAll('#pet-detail-page .info-grid .info-item');
    infoItems[0].querySelector('.info-value').textContent = pet.age;
    infoItems[1].querySelector('.info-value').textContent = pet.weight;
    infoItems[2].querySelector('.info-value').textContent = pet.owner;

    // Actualiza el historial médico
    const medicalList = document.querySelector('#pet-detail-page .medical-list');
    medicalList.innerHTML = '';
    
    let historialMedico = [];
    
    // Procesar el historial médico que puede venir en diferentes formatos
    if (Array.isArray(pet.medicalHistory)) {
        // Si ya es un array, usarlo directamente
        historialMedico = pet.medicalHistory;
    } else if (typeof pet.medicalHistory === 'string') {
        try {
            // Intentar parsear si es un string de array JSON
            if (pet.medicalHistory.trim().startsWith('[')) {
                historialMedico = JSON.parse(pet.medicalHistory);
            } else {
                // Si no es JSON, dividir por saltos de línea
                historialMedico = pet.medicalHistory.split('\n')
                    .map(item => item.trim())
                    .filter(item => item);
            }
        } catch (e) {
            // Si falla el parseo JSON, tratar como string simple
            if (pet.medicalHistory.trim()) {
                historialMedico = [pet.medicalHistory];
            }
        }
    }
    
    // Filtrar elementos vacíos y asegurarse de que todo sea string
    historialMedico = historialMedico
        .map(item => String(item).trim())
        .filter(item => item);
    
    // Renderizar los items
    if (historialMedico.length > 0) {
        historialMedico.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            medicalList.appendChild(li);
        });
    } else {
        const noHistory = document.createElement('p');
        noHistory.textContent = 'No hay historial médico registrado';
        medicalList.appendChild(noHistory);
    }

    // Actualiza las alergias
    const allergiesContainer = document.querySelector('#pet-detail-page .allergies');
    allergiesContainer.innerHTML = '<h3>Alergias</h3>';

    let alergias = [];
    
    // Handle different possible formats of allergies
    if (Array.isArray(pet.allergies)) {
        alergias = pet.allergies;
    } else if (typeof pet.allergies === 'string') {
        // If it's a string, split by commas and trim whitespace
        alergias = pet.allergies.split(',').map(a => a.trim()).filter(a => a);
    }
    
    if (alergias.length > 0) {
        alergias.forEach(allergy => {
            const allergyTag = document.createElement('p');
            allergyTag.classList.add('allergy-item');
            allergyTag.textContent = allergy;
            allergiesContainer.appendChild(allergyTag);
        });
    } else {
        const noAllergies = document.createElement('p');
        noAllergies.classList.add('allergy-item');
        noAllergies.textContent = 'No se han registrado alergias';
        allergiesContainer.appendChild(noAllergies);
    }

    // Actualiza las notas especiales
    document.querySelector('#pet-detail-page .special-notes p').textContent = pet.notes || 'Sin notas específicas.';
    
    // Inicializar la funcionalidad de edición después de cargar los detalles
    const petEdit = new PetEdit(petId);
    petEdit.initEditButton();
}

// Función para añadir event listeners a las tarjetas de mascotas
function addPetCardEventListeners() {
    const petCards = document.querySelectorAll('.pet-card');
    petCards.forEach(card => {
        card.addEventListener('click', function() {
            const petId = this.getAttribute('data-pet-id');
            // Carga los detalles de la mascota antes de mostrar la página
            loadPetDetails(petId);
            showPage('pet-detail');
        });
    });
}

/**
 * Maneja la eliminación de una o más mascotas
 * @param {number|number[]} petId - ID de la mascota o array de IDs a eliminar
 */
async function handleDeletePet(petId) {
    const confirmMessage = Array.isArray(petId) 
        ? `¿Estás seguro de que deseas eliminar las ${petId.length} mascotas seleccionadas?`
        : '¿Estás seguro de que deseas eliminar esta mascota?';

    if (!confirm(confirmMessage)) {
        notificationService.showError('Operación cancelada');
        return;
    }

    try {
        const { success, deletedCount, errors, message } = await petManager.deletePet(petId);
        
        if (success) {
            // Mostrar mensaje de éxito
            const successMessage = deletedCount === 1 
                ? 'Mascota eliminada correctamente' 
                : `${deletedCount} mascotas eliminadas correctamente`;
            notificationService.showSuccess(successMessage);
            
            // Actualizar la vista
            showPage('pets');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            await renderPetCards(currentUser?.id);
        } else {
            // Mostrar mensaje de error con detalles
            let errorMessage = message || 'Error al eliminar la(s) mascota(s)';
            notificationService.showError(errorMessage);
            
            if (errors && errors.length > 0) {
                const errorDetails = errors
                    .map(e => `• ID ${e.id}: ${e.error}`)
                    .join('\n');
                const fullErrorMessage = errorMessage + '\n\nDetalles de errores:\n' + errorDetails;
                notificationService.showError(fullErrorMessage);
            }
            
            // Si al menos algunas mascotas se eliminaron, actualizar la vista
            if (deletedCount > 0) {
                showPage('pets');
                await renderPetCards();
            }
        }
    } catch (error) {
        console.error('Error inesperado al eliminar la(s) mascota(s):', error);
        const errorMessage = error.message || 'Error al eliminar la(s) mascota(s)';
        notificationService.showError(errorMessage);
    }
}

// Crea una nueva mascota
async function handleCreatePet(petData) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userId = currentUser?.id;
        
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario actual');
        }
        
        const newPet = await petManager.createPet(petData);
        notificationService.showSuccess('Mascota creada exitosamente');
        await renderPetCards(userId);
        return newPet;
    } catch (error) {
        console.error('Error al crear la mascota:', error);
        const errorMessage = error.message || 'Error al crear la mascota';
        notificationService.showError(errorMessage);
        throw error;
    }
}

export { handleDeletePet, handleCreatePet, renderPetCards, addPetCardEventListeners };