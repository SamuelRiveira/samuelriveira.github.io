// Funcionalidad de edición de mascotas
import { PetManager } from '../managers/PetManager.js';
import { notificationService } from '../services/NotificationService.js';
import { renderPetCards } from './PetView.js'; // Esta ruta ya es correcta

// Crear una instancia de PetManager
const petManager = new PetManager();

// Mantener referencia a la instancia actual
let currentPetEditInstance = null;

class PetEdit {
    constructor(petId) {
        this.petId = petId; // Store the pet ID when initializing the class
        this.editableElements = [
            { selector: 'h1[data-component-name="<h1 />"]', type: 'text', label: 'Nombre' },
            { selector: 'h1#pet-detail-name', type: 'text', label: 'Nombre' },
            { selector: 'h1', type: 'text', label: 'Nombre' },
            { selector: 'div.allergies', type: 'allergies', label: 'Alergias' },
            { selector: 'p[data-component-name="<p />"]', type: 'text', label: 'Descripción' },
            { selector: 'div.special-notes p', type: 'text', label: 'Notas especiales' },
            { selector: 'div.medical-history > ul', type: 'html', label: 'Historial médico' },
            { selector: 'div[data-component-name="<div />"] > ul', type: 'html', label: 'Historial médico' },
            { selector: '.info-grid > .info-item:nth-child(1) .info-value', type: 'text', label: 'Edad' },
            { selector: '.info-grid > .info-item:nth-child(2) .info-value', type: 'text', label: 'Peso' }
        ];
        this.originalValues = new Map();
        this.photoEditMode = false;
        this._editButton = null;
        this._clickHandler = null;
    }

    initEditButton() {
        // Limpiar instancia anterior si existe
        if (currentPetEditInstance && currentPetEditInstance !== this) {
            currentPetEditInstance.cleanup();
        }
        currentPetEditInstance = this;

        // Remover botón de edición existente si hay uno
        const existingButton = document.querySelector('.edit-button');
        if (existingButton) {
            existingButton.remove();
        }

        // Crear y agregar el nuevo botón de edición
        this._editButton = document.createElement('button');
        this._editButton.textContent = 'Editar';
        this._editButton.classList.add('edit-button');
        
        const containerTop = document.querySelector('.container-top .container-left');
        if (containerTop) {
            containerTop.appendChild(this._editButton);
        }

        // Usar una función con nombre para poder eliminarla después
        this._clickHandler = () => this.toggleEditMode();
        this._editButton.addEventListener('click', this._clickHandler);
    }

    toggleEditMode() {
        if (!this.isEditing) {
            this.enableEditMode();
        } else {
            this.showConfirmationModal();
        }
    }

    showConfirmationModal() {
        // Implementar lógica de confirmación si es necesario
        this.confirmEdit();
    }

    enableEditMode() {
        this.originalValues.clear();
        this.isEditing = true;
        
        // Hide the edit button when entering edit mode
        if (this._editButton) {
            this._editButton.style.display = 'none';
        }

        this.editableElements.forEach(elem => {
            const elements = document.querySelectorAll(elem.selector);
            elements.forEach(element => {
                // Almacenar valor original
                if (elem.type === 'html') {
                    this.originalValues.set(element, element.innerHTML);
                } else if (elem.type === 'allergies') {
                    const allergies = [];
                    element.querySelectorAll('p').forEach(p => {
                        if (p.textContent && p.textContent.trim() !== 'No se han registrado alergias') {
                            allergies.push(p.textContent.trim());
                        }
                    });
                    this.originalValues.set(element, allergies);
                } else {
                    this.originalValues.set(element, element.textContent);
                }

                if (elem.type === 'allergies') {
                    // Guardar el título de alergias
                    const title = element.querySelector('h3')?.outerHTML || '<h3>Alergias</h3>';
                    
                    // Crear contenedor para el modo edición
                    const editContainer = document.createElement('div');
                    
                    // Crear textarea para editar alergias
                    const currentAllergies = this.originalValues.get(element) || [];
                    const textarea = document.createElement('textarea');
                    textarea.value = currentAllergies.join('\n');
                    textarea.style.width = '100%';
                    textarea.style.minHeight = '60px';
                    textarea.style.padding = '5px';
                    textarea.style.border = '1px dashed #3498db';
                    textarea.style.borderRadius = '4px';
                    textarea.style.fontFamily = 'inherit';
                    textarea.style.fontSize = 'inherit';
                    textarea.style.lineHeight = 'inherit';
                    textarea.style.boxSizing = 'border-box';
                    textarea.placeholder = 'Escribe una alergia por línea';
                    textarea.style.resize = 'none';
                    textarea.style.overflow = 'hidden';
                    
                    // Ajustar altura automáticamente al contenido
                    const adjustHeight = () => {
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    };
                    textarea.addEventListener('input', adjustHeight);
                    
                    // Forzar un ajuste inicial
                    setTimeout(adjustHeight, 0);
                    
                    // Actualizar el contenido del elemento
                    element.innerHTML = title;
                    editContainer.appendChild(textarea);
                    element.appendChild(editContainer);
                    element.classList.add('editing');
                } else {
                    // Hacer el elemento editable
                    element.setAttribute('contenteditable', 'true');
                    element.classList.add('editing');
                    
                    // Añadir un borde o indicador visual para elementos editables
                    element.style.border = '1px dashed #3498db';
                    element.style.padding = '5px';
                    element.title = 'Editable - Haz clic para modificar';
                }
            });
        });
        
        // Asegurarse específicamente de que el h1 sea editable
        const mainTitle = document.querySelector('h1');
        if (mainTitle && !mainTitle.hasAttribute('contenteditable')) {
            this.originalValues.set(mainTitle, mainTitle.textContent);
            mainTitle.setAttribute('contenteditable', 'true');
            mainTitle.classList.add('editing');
            mainTitle.style.border = '1px dashed #3498db';
            mainTitle.style.padding = '5px';
            mainTitle.title = 'Editable - Haz clic para modificar';
        }

        // Agregar funcionalidad de edición de foto
        const petPhoto = document.querySelector('.pet-photo img');
        if (petPhoto) {
            this.originalPhotoSrc = petPhoto.src;
            const photoEditOverlay = document.createElement('div');
            photoEditOverlay.classList.add('photo-edit-overlay');
            photoEditOverlay.innerHTML = `
                <input type="file" id="pet-photo-input" accept="image/*" class="photo-input">
                <label for="pet-photo-input" class="photo-edit-label">
                    <span>Editar Foto</span>
                </label>
            `;
            petPhoto.parentElement.appendChild(photoEditOverlay);

            const photoInput = document.getElementById('pet-photo-input');
            photoInput.addEventListener('change', (e) => this.handlePhotoChange(e));
        }

        // Reemplazar el botón de edición con botones de confirmar/cancelar
        const buttonContainer = document.querySelector('.container-top .container-left');
        if (buttonContainer) {
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Confirmar';
            confirmButton.classList.add('confirm-edit-button');
            confirmButton.addEventListener('click', () => this.confirmEdit());

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancelar';
            cancelButton.classList.add('cancel-edit-button');
            cancelButton.addEventListener('click', () => this.disableEditMode(true));

            buttonContainer.appendChild(confirmButton);
            buttonContainer.appendChild(cancelButton);
        }
    }

    handlePhotoChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const petPhoto = document.querySelector('.pet-photo img');
                if (petPhoto) {
                    petPhoto.src = e.target.result;
                    this.photoEditMode = true;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    disableEditMode(isCancelled = false) {
        // Mostrar el botón de editar al salir del modo edición
        if (this._editButton) {
            this._editButton.style.display = 'inline-block';
        }
        
        this.editableElements.forEach(elem => {
            const elements = document.querySelectorAll(elem.selector);
            elements.forEach(element => {
                if (elem.type === 'allergies' && !isCancelled) {
                    // Guardar las alergias editadas
                    const textarea = element.querySelector('textarea');
                    if (textarea) {
                        const allergies = textarea.value
                            .split('\n')
                            .map(a => a.trim())
                            .filter(a => a);
                        
                        // Actualizar la visualización de alergias
                        element.innerHTML = '<h3>Alergias</h3>';
                        if (allergies.length > 0) {
                            allergies.forEach(allergy => {
                                const p = document.createElement('p');
                                p.textContent = allergy;
                                element.appendChild(p);
                            });
                        } else {
                            const noAllergies = document.createElement('p');
                            noAllergies.textContent = 'No se han registrado alergias';
                            element.appendChild(noAllergies);
                        }
                    }
                } else if (isCancelled && this.originalValues.has(element)) {
                    // Restaurar valores originales si se cancela
                    if (elem.type === 'html') {
                        element.innerHTML = this.originalValues.get(element);
                    } else if (elem.type === 'allergies') {
                        const allergies = this.originalValues.get(element);
                        element.innerHTML = '<h3>Alergias</h3>';
                        if (allergies && allergies.length > 0) {
                            allergies.forEach(allergy => {
                                const p = document.createElement('p');
                                p.textContent = allergy;
                                element.appendChild(p);
                            });
                        } else {
                            const noAllergies = document.createElement('p');
                            noAllergies.textContent = 'No se han registrado alergias';
                            element.appendChild(noAllergies);
                        }
                    } else {
                        element.textContent = this.originalValues.get(element);
                    }
                }
                
                // Quitar atributos de edición
                element.removeAttribute('contenteditable');
                element.classList.remove('editing');
                element.style.border = '';
                element.style.padding = '';
            });
        });

        // Restaurar el botón de editar
        if (this._editButton) {
            this._editButton.style.display = 'inline-block';
        }

        // Eliminar botones de confirmar/cancelar
        const confirmButton = document.querySelector('.confirm-edit-button');
        const cancelButton = document.querySelector('.cancel-edit-button');
        if (confirmButton) confirmButton.remove();
        if (cancelButton) cancelButton.remove();

        // Restaurar el cursor normal en todos los elementos editables
        document.querySelectorAll('.editable').forEach(el => {
            if (document.body.contains(el)) {
                el.classList.remove('editable');
                el.removeAttribute('contenteditable');
            }
        });
        
        // Limpiar el overlay de edición de foto si existe
        const photoOverlay = document.querySelector('.photo-edit-overlay');
        if (photoOverlay) {
            photoOverlay.remove();
        }
        
        this.photoEditMode = false;
        this.isEditing = false;
    }

    cleanup() {
        // Remover event listeners
        if (this._editButton && this._clickHandler) {
            this._editButton.removeEventListener('click', this._clickHandler);
        }
        
        // Limpiar referencias
        this._editButton = null;
        this._clickHandler = null;
        this.originalValues.clear();
        
        // Deshabilitar modo de edición si está activo
        if (this.isEditing) {
            this.disableEditMode(true);
        }
    }

    async confirmEdit() {
        const editedData = {
            id: this.petId,
            _debug_id_type: typeof this.petId,
            _debug_id_value: this.petId
        };
        
        // Definir campos a capturar
        const fields = [
            { id: '#pet-detail-name', key: 'nombre' },
            { id: '.info-item:nth-child(1) .info-value', key: 'edad' },
            { id: '.info-item:nth-child(2) .info-value', key: 'peso' },
            { id: '.medical-history ul', key: 'historial_medico', isHtml: true },
            { id: '.special-notes p', key: 'notas_especiales' }
        ];
        
        // Recorrer y capturar todos los campos
        fields.forEach(field => {
            const element = document.querySelector(field.id);
            if (element) {
                editedData[field.key] = element.textContent.trim();
            }
        });
        
        // Manejar el historial médico por separado
        const medicalHistoryElement = document.querySelector('.medical-history ul');
        if (medicalHistoryElement) {
            const medicalItems = Array.from(medicalHistoryElement.querySelectorAll('li'))
                .map(li => li.textContent.trim())
                .filter(item => item); // Eliminar elementos vacíos
            editedData.historial_medico = medicalItems.length > 0 ? medicalItems : ['No hay historial médico registrado'];
        }
        
        // Capturar alergias
        const allergiesContainer = document.querySelector('.allergies');
        if (allergiesContainer) {
            const textarea = allergiesContainer.querySelector('textarea');
            if (textarea) {
                // Si estamos en modo edición con textarea
                editedData.alergias = textarea.value.trim();
            } else {
                // Si no hay textarea, capturar desde los párrafos
                const allergyParagraphs = allergiesContainer.querySelectorAll('p:not(h3)');
                const allergies = [];
                allergyParagraphs.forEach(p => {
                    const allergyText = p.textContent.trim();
                    if (allergyText && allergyText !== 'No se han registrado alergias') {
                        allergies.push(allergyText);
                    }
                });
                editedData.alergias = allergies.join('\n');
            }
        }
    
        // Agregar datos de la foto si se editó
        if (this.photoEditMode) {
            const petPhoto = document.querySelector('.pet-photo img');
            if (petPhoto) {
                editedData.foto = petPhoto.src;
            }
        }
    
        // Validar datos antes de enviar
        const validationErrors = this.validateEditedData(editedData);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }
    
        try {
            const success = await petManager.handlePetEdit(editedData);
            
            if (success) {
                // Deshabilitar el modo de edición solo si la operación fue exitosa
                this.disableEditMode(false);
                notificationService.showSuccess('Mascota editada correctamente');
            } else {
                notificationService.showError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            notificationService.showError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
        }
    }

    validateEditedData(data) {
        const errors = [];

        // Validar que el nombre esté presente y tenga al menos 2 caracteres
        if (!data.nombre || data.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        // Validar longitud de alergias si existen
        if (data.alergias) {
            const alergiasText = typeof data.alergias === 'string' 
                ? data.alergias 
                : Array.isArray(data.alergias) 
                    ? data.alergias.join('\n')
                    : '';
                    
            if (alergiasText.length > 500) {
                errors.push('Las alergias no pueden superar los 500 caracteres');
            }
        }

        // Validar longitud de la descripción si existe
        if (data.descripcion && data.descripcion.length > 1000) {
            errors.push('La descripción no puede superar los 1000 caracteres');
        }

        return errors;
    }

    showValidationErrors(errors) {
        // Crear un modal o alerta para mostrar los errores de validación
        const errorModal = document.createElement('div');
        errorModal.classList.add('validation-error-modal');
        errorModal.innerHTML = `
            <div class="error-content">
                <h3>Errores de validación</h3>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
                <button class="close-error-modal">Cerrar</button>
            </div>
        `;

        document.body.appendChild(errorModal);

        const closeButton = errorModal.querySelector('.close-error-modal');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(errorModal);
        });
    }
}

// Exportar la clase PetEdit para que pueda ser utilizada en otros archivos
export { PetEdit };
