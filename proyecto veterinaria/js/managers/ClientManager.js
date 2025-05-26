/**
 * Clase encargada de la gestión de datos de clientes y sus mascotas
 * Proporciona métodos para obtener, crear, actualizar y eliminar clientes
 */
class ClientManager {
    /**
     * Obtiene la lista de clientes
     * @returns {Promise<Array>} - Promise que resuelve con el array de clientes
     */
    getClients() {
        // Por ahora devolvemos datos simulados
        // TODO: Implementar llamada a API
        return new Promise((resolve) => {
            const clients = [
                {
                    id: 1,
                    name: "Samuel Riveira Escudero",
                    email: "samuel.riveira@example.com",
                    phone: "+34 612 345 678",
                    address: "Calle Principal 123, 28001 Madrid",
                    registerDate: "2023-05-10",
                    pets: [101, 102, 103, 104, 105]
                },
                {
                    id: 2,
                    name: "Ana García López",
                    email: "ana.garcia@example.com",
                    phone: "+34 623 456 789",
                    address: "Avenida Central 45, 28002 Madrid",
                    registerDate: "2023-07-15",
                    pets: [106, 107]
                },
                {
                    id: 3,
                    name: "Carlos Martínez Ruiz",
                    email: "carlos.martinez@example.com",
                    phone: "+34 634 567 890",
                    address: "Plaza Mayor 10, 28003 Madrid",
                    registerDate: "2023-08-22",
                    pets: [108]
                }
            ];
            resolve(clients);
        });
    }

    /**
     * Obtiene los datos de un cliente específico
     * @param {number} clientId - ID del cliente
     * @returns {Promise<Object>} - Promise que resuelve con los datos del cliente
     */
    getClientById(clientId) {
        return new Promise((resolve, reject) => {
            // Datos simulados del cliente
            // TODO: Implementar llamada a API
            if (clientId === 1) {
                resolve({
                    id: 1,
                    name: "Samuel Riveira Escudero",
                    email: "samuel.riveira@example.com",
                    phone: "+34 612 345 678",
                    address: "Calle Principal 123, 28001 Madrid",
                    registerDate: "2023-05-10",
                    pets: [
                        {
                            id: 101,
                            name: "Luna",
                            type: "Gato",
                            breed: "Gato Azul Ruso",
                            age: "3",
                            ageUnit: "años",
                            appointment: "10/06/2025",
                            photoUrl: "/Frontend/imagenes/img_luna.jpg",
                            weight: "4.5 kg",
                            medicalHistory: [
                                "Vacunación completa (01/01/2024)",
                                "Chequeo dental (15/03/2025)",
                                "Desparasitación interna (01/05/2025)"
                            ],
                            allergies: ["Polen"],
                            notes: "Disfruta observar por la ventana y cazar insectos pequeños."
                        },
                        {
                            id: 102,
                            name: "Simba",
                            type: "Perro",
                            breed: "Labrador Retriever",
                            age: "5",
                            ageUnit: "años",
                            appointment: "22/06/2025",
                            photoUrl: "/Frontend/imagenes/img_simba.jpg",
                            weight: "28.5 kg",
                            medicalHistory: [
                                "Vacunación completa (12/01/2024)",
                                "Tratamiento contra ácaros (20/02/2025)",
                                "Control de peso (10/04/2025)"
                            ],
                            allergies: ["Pollo"],
                            notes: "Muy activo y obediente. Le encanta nadar."
                        },
                        {
                            id: 103,
                            name: "Rocky",
                            type: "Perro",
                            breed: "Bulldog Francés",
                            age: "2",
                            ageUnit: "años",
                            appointment: "No programada",
                            photoUrl: "/Frontend/imagenes/img_rocky.jpg",
                            weight: "12.3 kg",
                            medicalHistory: [
                                "Revisión respiratoria (05/02/2025)",
                                "Vacunación parcial",
                                "Limpieza de oídos (20/03/2025)"
                            ],
                            allergies: ["Lácteos"],
                            notes: "Sensible al calor. Necesita paseos cortos y frecuentes."
                        },
                        {
                            id: 104,
                            name: "Mia",
                            type: "Perro",
                            breed: "Caniche Toy",
                            age: "8",
                            ageUnit: "meses",
                            appointment: "02/08/2025",
                            photoUrl: "/Frontend/imagenes/img_mia.jpg",
                            weight: "3.1 kg",
                            medicalHistory: [
                                "Primera vacunación (03/03/2025)",
                                "Desparasitación externa (10/04/2025)",
                                "Revisión oftalmológica (01/05/2025)"
                            ],
                            allergies: ["Cereal"],
                            notes: "Muy inteligente y fácil de entrenar. Le gusta estar cerca de la gente."
                        },
                        {
                            id: 105,
                            name: "Max",
                            type: "Perro",
                            breed: "Beagle",
                            age: "6",
                            ageUnit: "años",
                            appointment: "27/09/2025",
                            photoUrl: "/Frontend/imagenes/img_max.jpg",
                            weight: "18.9 kg",
                            medicalHistory: [
                                "Control de peso (01/01/2025)",
                                "Chequeo auditivo (11/03/2025)",
                                "Vacunación completa (22/04/2025)"
                            ],
                            allergies: ["Soja"],
                            notes: "Le encanta olfatear durante los paseos. Muy sociable con otros perros."
                        }
                    ]
                });
            } else if (clientId === 2) {
                resolve({
                    id: 2,
                    name: "Ana García López",
                    email: "ana.garcia@example.com",
                    phone: "+34 623 456 789",
                    address: "Avenida Central 45, 28002 Madrid",
                    registerDate: "2023-07-15",
                    pets: [
                        {
                            id: 106,
                            name: "Coco",
                            type: "Perro",
                            breed: "Yorkshire Terrier",
                            age: "4",
                            ageUnit: "años",
                            appointment: "15/07/2025",
                            photoUrl: "/Frontend/imagenes/img_coco.jpg",
                            weight: "2.8 kg",
                            medicalHistory: [
                                "Limpieza dental (15/02/2025)",
                                "Vacunación anual (30/04/2025)"
                            ],
                            allergies: [],
                            notes: "Muy juguetón y cariñoso. Le gusta dormir en sofás."
                        },
                        {
                            id: 107,
                            name: "Nala",
                            type: "Gato",
                            breed: "Siamés",
                            age: "2",
                            ageUnit: "años",
                            appointment: "20/08/2025",
                            photoUrl: "/Frontend/imagenes/img_nala.jpg",
                            weight: "3.9 kg",
                            medicalHistory: [
                                "Esterilización (10/01/2025)",
                                "Vacunación completa (05/03/2025)"
                            ],
                            allergies: ["Pescado"],
                            notes: "Muy independiente. Prefiere estar en lugares altos."
                        }
                    ]
                });
            } else if (clientId === 3) {
                resolve({
                    id: 3,
                    name: "Carlos Martínez Ruiz",
                    email: "carlos.martinez@example.com",
                    phone: "+34 634 567 890",
                    address: "Plaza Mayor 10, 28003 Madrid",
                    registerDate: "2023-08-22",
                    pets: [
                        {
                            id: 108,
                            name: "Thor",
                            type: "Perro",
                            breed: "Pastor Alemán",
                            age: "3",
                            ageUnit: "años",
                            appointment: "05/07/2025",
                            photoUrl: "/Frontend/imagenes/img_thor.jpg",
                            weight: "32.5 kg",
                            medicalHistory: [
                                "Revisión articular (20/02/2025)",
                                "Vacunación anual (15/04/2025)",
                                "Desparasitación (01/05/2025)"
                            ],
                            allergies: [],
                            notes: "Muy bien entrenado. Excelente guardián."
                        }
                    ]
                });
            } else {
                reject(new Error("Cliente no encontrado"));
            }
        });
    }

    /**
     * Obtiene las mascotas de un cliente específico
     * @param {number} clientId - ID del cliente
     * @returns {Promise<Array>} - Promise que resuelve con las mascotas del cliente
     */
    getClientPets(clientId) {
        return new Promise((resolve, reject) => {
            this.getClientById(clientId)
                .then(client => {
                    resolve(client.pets);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    /**
     * Obtiene una mascota específica por su ID
     * @param {number} petId - ID de la mascota
     * @returns {Promise<Object>} - Promise que resuelve con los datos de la mascota
     */
    getPetById(petId) {
        return new Promise((resolve, reject) => {
            // Datos simulados de mascotas
            // TODO: Implementar llamada a API
            const allPets = [
                {
                    id: 101,
                    name: "Luna",
                    type: "Gato",
                    breed: "Gato Azul Ruso",
                    age: "3",
                    ageUnit: "años",
                    appointment: "10/06/2025",
                    photoUrl: "/Frontend/imagenes/img_luna.jpg",
                    weight: "4.5 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    },
                    medicalHistory: [
                        "Vacunación completa (01/01/2024)",
                        "Chequeo dental (15/03/2025)",
                        "Desparasitación interna (01/05/2025)"
                    ],
                    allergies: ["Polen"],
                    notes: "Disfruta observar por la ventana y cazar insectos pequeños."
                },
                {
                    id: 102,
                    name: "Simba",
                    type: "Perro",
                    breed: "Labrador Retriever",
                    age: "5",
                    ageUnit: "años",
                    appointment: "22/06/2025",
                    photoUrl: "/Frontend/imagenes/img_simba.jpg",
                    weight: "28.5 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    },
                    medicalHistory: [
                        "Vacunación completa (12/01/2024)",
                        "Tratamiento contra ácaros (20/02/2025)",
                        "Control de peso (10/04/2025)"
                    ],
                    allergies: ["Pollo"],
                    notes: "Muy activo y obediente. Le encanta nadar."
                },
                // Más mascotas...
            ];

            const pet = allPets.find(p => p.id === petId);
            if (pet) {
                resolve(pet);
            } else {
                reject(new Error("Mascota no encontrada"));
            }
        });
    }

    /**
     * Crea un nuevo cliente
     * @param {Object} clientData - Datos del nuevo cliente
     * @returns {Promise<Object>} - Promise que resuelve con el cliente creado
     */
    createClient(clientData) {
        return new Promise((resolve) => {
            // Simulamos la creación asignando un ID
            // TODO: Implementar llamada a API
            const newClient = {
                ...clientData,
                id: Math.floor(Math.random() * 1000) + 100,
                registerDate: new Date().toISOString().split('T')[0],
                pets: []
            };
            
            console.log('Cliente creado con éxito:', newClient);
            resolve(newClient);
        });
    }

    /**
     * Actualiza los datos de un cliente
     * @param {number} clientId - ID del cliente a actualizar
     * @param {Object} clientData - Nuevos datos del cliente
     * @returns {Promise<Object>} - Promise que resuelve con el cliente actualizado
     */
    updateClient(clientId, clientData) {
        return new Promise((resolve, reject) => {
            // Simulamos la actualización
            // TODO: Implementar llamada a API
            if (clientId) {
                const updatedClient = {
                    ...clientData,
                    id: clientId
                };
                
                console.log('Cliente actualizado con éxito:', updatedClient);
                resolve(updatedClient);
            } else {
                reject(new Error("Cliente no encontrado"));
            }
        });
    }

    /**
     * Elimina un cliente
     * @param {number} clientId - ID del cliente a eliminar
     * @returns {Promise<boolean>} - Promise que resuelve con el resultado de la operación
     */
    deleteClient(clientId) {
        return new Promise((resolve, reject) => {
            // Simulamos la eliminación
            // TODO: Implementar llamada a API
            if (clientId) {
                console.log('Cliente eliminado con éxito. ID:', clientId);
                resolve(true);
            } else {
                reject(new Error("Cliente no encontrado"));
            }
        });
    }

    /**
     * Crea una nueva mascota para un cliente
     * @param {number} clientId - ID del cliente propietario
     * @param {Object} petData - Datos de la nueva mascota
     * @returns {Promise<Object>} - Promise que resuelve con la mascota creada
     */
    createPet(clientId, petData) {
        return new Promise((resolve, reject) => {
            if (clientId) {
                // Simulamos la creación asignando un ID
                // TODO: Implementar llamada a API
                const newPet = {
                    ...petData,
                    id: Math.floor(Math.random() * 1000) + 200,
                    owner: {
                        id: clientId
                    }
                };
                
                console.log('Mascota creada con éxito:', newPet);
                resolve(newPet);
            } else {
                reject(new Error("Cliente no encontrado"));
            }
        });
    }

    /**
     * Actualiza los datos de una mascota
     * @param {number} petId - ID de la mascota a actualizar
     * @param {Object} petData - Nuevos datos de la mascota
     * @returns {Promise<Object>} - Promise que resuelve con la mascota actualizada
     */
    updatePet(petId, petData) {
        return new Promise((resolve, reject) => {
            // Simulamos la actualización
            // TODO: Implementar llamada a API
            if (petId) {
                const updatedPet = {
                    ...petData,
                    id: petId
                };
                
                console.log('Mascota actualizada con éxito:', updatedPet);
                resolve(updatedPet);
            } else {
                reject(new Error("Mascota no encontrada"));
            }
        });
    }

    /**
     * Obtiene todas las mascotas
     * @returns {Promise<Array>} - Promise que resuelve con todas las mascotas
     */
    getAllPets() {
        return new Promise((resolve) => {
            // Datos simulados
            // TODO: Implementar llamada a API
            const pets = [
                {
                    id: 101,
                    name: "Luna",
                    type: "Gato",
                    breed: "Gato Azul Ruso",
                    age: "3",
                    ageUnit: "años",
                    appointment: "10/06/2025",
                    photoUrl: "/Frontend/imagenes/img_luna.jpg",
                    weight: "4.5 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    }
                },
                {
                    id: 102,
                    name: "Simba",
                    type: "Perro",
                    breed: "Labrador Retriever",
                    age: "5",
                    ageUnit: "años",
                    appointment: "22/06/2025",
                    photoUrl: "/Frontend/imagenes/img_simba.jpg",
                    weight: "28.5 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    }
                },
                {
                    id: 103,
                    name: "Rocky",
                    type: "Perro",
                    breed: "Bulldog Francés",
                    age: "2",
                    ageUnit: "años",
                    appointment: "No programada",
                    photoUrl: "/Frontend/imagenes/img_rocky.jpg",
                    weight: "12.3 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    }
                },
                {
                    id: 104,
                    name: "Mia",
                    type: "Perro",
                    breed: "Caniche Toy",
                    age: "8",
                    ageUnit: "meses",
                    appointment: "02/08/2025",
                    photoUrl: "/Frontend/imagenes/img_mia.jpg",
                    weight: "3.1 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    }
                },
                {
                    id: 105,
                    name: "Max",
                    type: "Perro",
                    breed: "Beagle",
                    age: "6",
                    ageUnit: "años",
                    appointment: "27/09/2025",
                    photoUrl: "/Frontend/imagenes/img_max.jpg",
                    weight: "18.9 kg",
                    owner: {
                        id: 1,
                        name: "Samuel Riveira Escudero"
                    }
                },
                {
                    id: 106,
                    name: "Coco",
                    type: "Perro",
                    breed: "Yorkshire Terrier",
                    age: "4",
                    ageUnit: "años",
                    appointment: "15/07/2025",
                    photoUrl: "/Frontend/imagenes/img_coco.jpg",
                    weight: "2.8 kg",
                    owner: {
                        id: 2,
                        name: "Ana García López"
                    }
                },
                {
                    id: 107,
                    name: "Nala",
                    type: "Gato",
                    breed: "Siamés",
                    age: "2",
                    ageUnit: "años",
                    appointment: "20/08/2025",
                    photoUrl: "/Frontend/imagenes/img_nala.jpg",
                    weight: "3.9 kg",
                    owner: {
                        id: 2,
                        name: "Ana García López"
                    }
                },
                {
                    id: 108,
                    name: "Thor",
                    type: "Perro",
                    breed: "Pastor Alemán",
                    age: "3",
                    ageUnit: "años",
                    appointment: "05/07/2025",
                    photoUrl: "/Frontend/imagenes/img_thor.jpg",
                    weight: "32.5 kg",
                    owner: {
                        id: 3,
                        name: "Carlos Martínez Ruiz"
                    }
                }
            ];
            resolve(pets);
        });
    }
}
