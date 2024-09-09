const contenedor = document.querySelector('.contenedor');

const galeria1 = document.getElementById("galeria1");
const galeria2 = document.getElementById("galeria2");

const masinfo = document.getElementById("descripcion");
const anfitrion = document.getElementById("anfitrion");
const menos = document.getElementById("mostrarMas");

const moverImg = document.getElementById("imgDesc");
const moverFlecha = document.getElementById("flechaDescripcion");
const flecha = document.getElementById("flechaDescripcion");

const fondo = document.getElementById("fondito");

var seccion1 = document.getElementById("servicios");
var seccion2 = document.getElementById("habitaciones");
var seccion3 = document.getElementById("reglas");
var seccion4 = document.getElementById("puntos-interes");

var habitacion1 = document.getElementById("habitacion1")
var habitacion2 = document.getElementById("habitacion2")



function activar(){
    contenedor.classList.add("active");
}

function desactivar(){
    contenedor.classList.remove("active");
}

function abrir(){
    contenedor.classList.add("active-popup");
}

function cerrar(){
    contenedor.classList.remove("active-popup");
    setTimeout(function() {
        contenedor.classList.remove("active");
    }, 500);
};

var contador = 1;
setInterval(function(){
    document.getElementById('radio' + contador).checked = true;
    contador++;
    if (contador > 4){
        contador = 1
    }
}, 5000);


function abrirGaleria1(){
    galeria1.classList.add("active-galeria")
};

function cerrarGaleria1(){
    galeria1.classList.remove("active-galeria")
};

function abrirGaleria2(){
    galeria2.classList.add("active-galeria")
};

function cerrarGaleria2(){
    galeria2.classList.remove("active-galeria")
};


function mostrarMas(){
    masinfo.classList.toggle("active-masinfo")
    anfitrion.classList.toggle("active-mostrarinfo")
    menos.classList.toggle("mostrarBoton")
    if (menos.innerHTML === "Mostrar más") {
        menos.innerHTML = "Mostrar menos";
    } else {
        menos.innerHTML = "Mostrar más";
    }
};

function moverVentana(){
    var moverImg = document.querySelector("#imgDesc");
    var moverFlecha = document.querySelector("#flechaDescripcion");
    
    if (moverImg && moverFlecha) {
        moverImg.classList.toggle("img-movida");
        moverFlecha.classList.toggle("flecha-movida");
        
        var valorFlecha = moverFlecha.getAttribute('name');

        if (valorFlecha === 'arrow-forward') {
            moverFlecha.outerHTML = '<ion-icon name="arrow-back" id="flechaDescripcion" class="flecha flecha-movida" onclick="moverVentana()"></ion-icon>';
        } else if (valorFlecha === 'arrow-back') {
            moverFlecha.outerHTML = '<ion-icon name="arrow-forward" id="flechaDescripcion" class="flecha" onclick="moverVentana()"></ion-icon>';
        }
    }
};


var clases = document.getElementsByClassName("opciones-seleccion");

if (clases.length > 0) {
  clases[0].className += " seleccionado";
};

for (var i = 0; i < clases.length; i++) {
  clases[i].addEventListener("click", function() {
    var seleccionado = document.getElementsByClassName("seleccionado");
    if (seleccionado.length > 0) {
      seleccionado[0].className = seleccionado[0].className.replace("seleccionado", "");
    }
    this.className += " seleccionado";
  });
};



seccion1.classList.add("activadoSeccion")
seccion2.classList.remove("activadoSeccion")
seccion3.classList.remove("activadoSeccion")
seccion4.classList.remove("activadoSeccion")

function activarSección1(){
    seccion1.classList.add("activadoSeccion")
    seccion2.classList.remove("activadoSeccion")
    seccion3.classList.remove("activadoSeccion")
    seccion4.classList.remove("activadoSeccion")
};

function activarSección2(){
    seccion2.classList.add("activadoSeccion")
    seccion1.classList.remove("activadoSeccion")
    seccion3.classList.remove("activadoSeccion")
    seccion4.classList.remove("activadoSeccion")
};

function activarSección3(){
    seccion1.classList.remove("activadoSeccion")
    seccion2.classList.remove("activadoSeccion")
    seccion3.classList.add("activadoSeccion")
    seccion4.classList.remove("activadoSeccion")
};

function activarSección4(){
    seccion1.classList.remove("activadoSeccion")
    seccion2.classList.remove("activadoSeccion")
    seccion3.classList.remove("activadoSeccion")
    seccion4.classList.add("activadoSeccion")
};


document.addEventListener('DOMContentLoaded', (event) => {
    let xhr, url, city, apiKey;

    city = "Playa Honda";
    apiKey = "7c5f20c2bf8231c37e559843a2cd4409";

    url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(city) + "&appid=" + apiKey + "&units=metric";

    xhr = new XMLHttpRequest();
    xhr.onload = function() {
        mostrarInformacion(this);
    };
    xhr.open("GET", url);
    xhr.send();

    function mostrarInformacion(xhr) {
        let obj, temp, icon, codigoHTML;

        if (xhr.status >= 200 && xhr.status < 300) { // Asegurarse de que la solicitud fue exitosa
            console.log(xhr.responseText);
            obj = JSON.parse(xhr.responseText);
            temp = obj.main.temp;
            icon = obj.weather[0].icon;
            console.log(temp, icon);

            codigoHTML = 
                '<p>' + temp + '<sup>ºC</sup></p>' +
                '<img src="https://openweathermap.org/img/wn/' + icon + '@2x.png">';

            document.getElementById("tiempo").innerHTML = codigoHTML;
            document.getElementById("tiempo2").innerHTML = codigoHTML;
        } else {
            console.error('Error al realizar la solicitud:', xhr.statusText);
        }
    }
});


function activarHabitacion1(){
    habitacion1.classList.add("active-habitacion")
    fondo.classList.add("fondo-oscuro")
}

function desactiveHabitacion1(){
    habitacion1.classList.remove("active-habitacion")
    fondo.classList.remove("fondo-oscuro")
}

function activarHabitacion2(){
    habitacion2.classList.add("active-habitacion")
    fondo.classList.add("fondo-oscuro")
}

function desactiveHabitacion2(){
    habitacion2.classList.remove("active-habitacion")
    fondo.classList.remove("fondo-oscuro")
}



let xmlDoc;

mostrar()
function mostrar(){
    let xhttp;

    xhttp = new XMLHttpRequest();
    xhttp.onload = function(){
        mostrarInformacion(this);
    }
    xhttp.open("GET", "serviciosEN.xml");
    xhttp.send();
}

function mostrarInformacion(xml){
    let i, codigoHTML, logo, contenido, servicio;

    xmlDoc = xml.responseXML;
    console.log(xmlDoc)
    servicio = xmlDoc.getElementsByTagName("servicio").length;
    codigoHTML = ""

    for (i=0; i<servicio ; i++){
        codigoHTML += '<div class="servicio">';
        logo = xmlDoc.getElementsByTagName("logo")[i].childNodes[0].nodeValue;
        contenido = xmlDoc.getElementsByTagName("contenido")[i].childNodes[0].nodeValue;
        
        codigoHTML +=   '<ion-icon name="'+logo+'"></ion-icon>' +
                        '<p>'+contenido+'</p>' +
                    '</div>';
        
    }
    document.getElementById("resultado-servicios").innerHTML = codigoHTML;
}

let indice = 0;

document.querySelector('.prev-boton').addEventListener('click', () => {
   navigate(-1);
});

document.querySelector('.next-boton').addEventListener('click', () => {
   navigate(1);
});

function navigate(direction) {
   const galeriaContenedor = document.querySelector('.galeria2-contenedor');
   const totalImagenes = document.querySelectorAll('.galeria2-objeto').length;

   indice = (indice + direction + totalImagenes) % totalImagenes;
   const offset = -indice * 100;

   galeriaContenedor.style.transform = `translateX(${offset}%)`;
}


let indice2 = 0;

document.querySelector('.prev-boton2').addEventListener('click', () => {
   navigate2(-1);
});

document.querySelector('.next-boton2').addEventListener('click', () => {
   navigate2(1);
});

function navigate2(direction) {
   const galeriaContenedor2 = document.querySelector('.galeria3-contenedor');
   const totalImagenes2 = document.querySelectorAll('.galeria3-objeto').length;

   indice2 = (indice2 + direction + totalImagenes2) % totalImagenes2;
   const offset = -indice2 * 100;

   galeriaContenedor2.style.transform = `translateX(${offset}%)`;
}