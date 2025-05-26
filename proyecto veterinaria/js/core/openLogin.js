//Container Login and Register
const contenedor = document.querySelector('.contenedor');

export function activar() {
    contenedor.classList.add("active");
}

export function desactivar() {
    contenedor.classList.remove("active");
}

export function abrir() {
    contenedor.classList.add("active-popup");
}

export function cerrar() {
    contenedor.classList.remove("active-popup");
    setTimeout(function () {
        contenedor.classList.remove("active");
    }, 500);
}

// Hacer las funciones disponibles globalmente para compatibilidad con código antiguo
window.activar = activar;
window.desactivar = desactivar;
window.abrir = abrir;
window.cerrar = cerrar;

// Las funciones están definidas como globales para ser accesibles desde otros scripts

