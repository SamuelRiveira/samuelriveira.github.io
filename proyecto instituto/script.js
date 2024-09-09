// CICLOS //
const basica = document.getElementById("fp-basica");
const media = document.getElementById("fp-media");
const superior = document.getElementById("fp-superior");

// MODULOS //
const modulos = [];
// i <= numero de modulos
for (let i = 1; i <= 42; i++) {
    modulos.push(document.getElementById(`modulo${i}`));
}
const fondo = document.getElementById("fondito");

// CICLOS FORMATIVOS //

function cambiarABasica() {
    basica.classList.add("activo");
    media.classList.remove("activo");
    superior.classList.remove("activo");
    cargarYMostrarXML('basica.xml', 'fp-basica');
}

function cambiarAMedia() {
    basica.classList.remove("activo");
    media.classList.add("activo");
    superior.classList.remove("activo");
    cargarYMostrarXML('media.xml', 'fp-media');
}

function cambiarASuperior() {
    basica.classList.remove("activo");
    media.classList.remove("activo");
    superior.classList.add("activo");
    cargarYMostrarXML('superior.xml', 'fp-superior');
}

// MODULOS //

function activepopupmodulo(index) {
    const modulo = document.getElementById(`modulo${index}`);
    if (modulo) {
        modulo.classList.add("activepopup");
    }
    if (fondo) {
        fondo.classList.add("fondo-oscuro");
    }
}

function desactivepopupmodulos() {
    const ventanasProyectos = document.querySelectorAll('.ventana-modulo');
    ventanasProyectos.forEach(modulo => {
        modulo.classList.remove("activepopup");
    });
    if (fondo) {
        fondo.classList.remove("fondo-oscuro");
    }
}

// Función para cargar y mostrar el contenido del XML
function cargarYMostrarXML(archivo, contenedorID) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.status == 200) {
            construirHTML(this, contenedorID);
        } else {
            console.error('Error al cargar el XML');
        }
    };
    xhttp.open("GET", archivo, true);
    xhttp.send();
}

function construirHTML(xml, contenedorID) {
    let xmlDoc = xml.responseXML;
    let codigoHTML = '';
    const ciclos = ['primer-año', 'segundo-año'];
    const idBase = contenedorID.split('-')[1]; // Extrae 'basica', 'media' o 'superior' del contenedorID
    let moduloIndexOffset = idBase === 'basica' ? 1 : idBase === 'media' ? 11 : 25; // Para el cálculo de índices de modulos

    ciclos.forEach((ciclo, cicloIndex) => {
        let modulos = xmlDoc.getElementsByTagName(ciclo)[0].getElementsByTagName("modulo");
        let ventanas = xmlDoc.getElementsByTagName(ciclo)[0].getElementsByTagName("ventana-modulo");

        if (modulos.length > 0) {
            codigoHTML += `<div class="navegacion-ciclos">` +
                          `<h1 id="${ciclo}-${idBase}">${ciclo.replace('-', ' ')} - ${idBase.toUpperCase()}</h1>` +
                          (cicloIndex > 0 ? `<a href="#${ciclos[cicloIndex - 1]}-${idBase}"><ion-icon name="arrow-round-up"></ion-icon></a>` : '') +
                          (cicloIndex < ciclos.length - 1 ? `<a href="#${ciclos[cicloIndex + 1]}-${idBase}"><ion-icon name="arrow-round-down"></ion-icon></a>` : '') +
                          `</div>` +
                          `<div class="tarjetas-modulos">`;

            for (let i = 0; i < modulos.length; i++) {
                let imagenModulo = modulos[i].getElementsByTagName("imagen")[0].textContent;
                let tituloModulo = modulos[i].getElementsByTagName("titulo")[0].textContent;

                let imagenVentana = ventanas[i].getElementsByTagName("imagen")[0].textContent;
                let tituloVentana = ventanas[i].getElementsByTagName("titulo")[0].textContent;
                let contenidoVentana = ventanas[i].getElementsByTagName("contenido")[0].textContent;

                // Calcular el índice global basado en el ciclo y el módulo
                let globalIndex = moduloIndexOffset + i + (cicloIndex * modulos.length);

                codigoHTML += `<div onclick="activepopupmodulo(${globalIndex})" class="modulos">`;
                codigoHTML +=   `<img src="${imagenModulo}">`;
                codigoHTML +=   `<div class="contenedor-titulo-modulo"><h2>${tituloModulo}</h2></div>`;
                codigoHTML += '</div>';

                codigoHTML += `<div id="modulo${globalIndex}" class="ventana-modulo">`;
                codigoHTML +=   `<div id="icono-cierre" onclick="desactivepopupmodulos()"><ion-icon class="cierre" name="close"></ion-icon></div>`;
                codigoHTML +=   `<img src="${imagenVentana}" alt="">`;
                codigoHTML +=   `<div><h1>${tituloVentana}</h1></div>`;
                codigoHTML +=   `<p>${contenidoVentana}</p>`;
                codigoHTML += '</div>';
            }

            codigoHTML += '</div>';
        }
    });

    document.getElementById(contenedorID).innerHTML = codigoHTML;
}

// Esperar a que todo el contenido del DOM esté cargado y cargar por defecto el ciclo Superior
document.addEventListener('DOMContentLoaded', () => {
    cambiarASuperior();
});