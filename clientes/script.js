// ==========================================
// CONFIGURACIÓN
// ==========================================

// Dirección de nuestro backend
const API_URL = "http://127.0.0.1:8000";


// ==========================================
// DOMICILIOS
// ==========================================

const domicilioForm = document.getElementById("domicilioForm");

domicilioForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Obtener información del formulario
    const domicilio = {

        nombre: document.getElementById("nombreDomicilio").value,

        telefono: document.getElementById("telefonoDomicilio").value,

        direccion: document.getElementById("direccionDomicilio").value,

        pedido: document.getElementById("pedidoDomicilio").value,

        observaciones:
            document.getElementById("observacionesDomicilio").value

    };


    try {

        // Enviar información al backend
        const respuesta = await fetch(`${API_URL}/domicilios`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(domicilio)

        });


        const datos = await respuesta.json();

        console.log(datos);

        alert("🛵 ¡Domicilio enviado correctamente!");

        // Limpiar formulario
        domicilioForm.reset();

    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

});


// ==========================================
// RESERVACIONES
// ==========================================

const reservaForm = document.getElementById("reservaForm");

reservaForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    // Obtener información del formulario
    const reserva = {

        nombre:
            document.getElementById("nombreReserva").value,

        telefono:
            document.getElementById("telefonoReserva").value,

        fecha:
            document.getElementById("fechaReserva").value,

        hora:
            document.getElementById("horaReserva").value,

        personas:
            Number(
                document.getElementById("personasReserva").value
            ),

        observaciones:
            document.getElementById("observacionesReserva").value

    };


    try {

        // Enviar información al backend
        const respuesta = await fetch(`${API_URL}/reservas`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reserva)

        });


        const datos = await respuesta.json();

        console.log(datos);

        alert("📅 ¡Reserva enviada correctamente!");

        // Limpiar formulario
        reservaForm.reset();

    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

});