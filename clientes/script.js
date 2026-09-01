
// ==========================================
// CONFIGURACIÓN
// ==========================================

// Dirección del backend online
const API_URL = "https://restaurante-backend-4kc1.onrender.com";


// ==========================================
// DOMICILIOS
// ==========================================

const domicilioForm = document.getElementById("domicilioForm");

domicilioForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const domicilio = {

        nombre: document.getElementById("nombreDomicilio").value,

        telefono: document.getElementById("telefonoDomicilio").value,

        direccion: document.getElementById("direccionDomicilio").value,

        pedido: document.getElementById("pedidoDomicilio").value,

        observaciones:
            document.getElementById("observacionesDomicilio").value

    };


    try {

        const respuesta = await fetch(`${API_URL}/domicilios`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(domicilio)

        });


        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);


        // Comprobar si el backend respondió correctamente
        if (!respuesta.ok || datos.error) {

            alert(
                "❌ No se pudo enviar el domicilio.\n" +
                (datos.error || "Error del servidor.")
            );

            return;
        }


        alert("🛵 ¡Domicilio enviado correctamente!");

        domicilioForm.reset();


    } catch (error) {

        console.error("Error:", error);

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

        const respuesta = await fetch(`${API_URL}/reservas`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reserva)

        });


        const datos = await respuesta.json();

        console.log("Respuesta del servidor:", datos);


        // Comprobar si el backend respondió correctamente
        if (!respuesta.ok || datos.error) {

            alert(
                "❌ No se pudo enviar la reserva.\n" +
                (datos.error || "Error del servidor.")
            );

            return;
        }


        alert("📅 ¡Reserva enviada correctamente!");

        reservaForm.reset();


    } catch (error) {

        console.error("Error:", error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

});
