// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL = "http://127.0.0.1:8000";


// ==========================================
// DOMICILIOS
// ==========================================

async function cargarDomicilios() {

    const container =
        document.getElementById("domiciliosContainer");

    container.innerHTML =
        '<p class="cargando">Cargando domicilios...</p>';

    try {

        const respuesta =
            await fetch(`${API_URL}/domicilios`);

        const datos =
            await respuesta.json();

        container.innerHTML = "";

        if (datos.domicilios.length === 0) {

            container.innerHTML =
                '<p class="vacio">No hay domicilios.</p>';

            return;
        }


        datos.domicilios.forEach(domicilio => {

            const elemento =
                document.createElement("div");

            elemento.className = "pedido";


            elemento.innerHTML = `

                <h3>
                    🛵 Domicilio #${domicilio.id}
                </h3>

                <p class="dato">
                    👤 <strong>Cliente:</strong>
                    ${domicilio.nombre}
                </p>

                <p class="dato">
                    📞 <strong>Teléfono:</strong>
                    ${domicilio.telefono}
                </p>

                <p class="dato">
                    📍 <strong>Dirección:</strong>
                    ${domicilio.direccion}
                </p>

                <p class="dato">
                    🍔 <strong>Pedido:</strong>
                    ${domicilio.pedido}
                </p>

                <p class="dato">
                    📝 <strong>Observaciones:</strong>
                    ${domicilio.observaciones || "Ninguna"}
                </p>

                <p class="dato">
                    🕐 <strong>Hora del pedido:</strong>
                    ${domicilio.fecha_hora}
                </p>

                <div class="estado-actual">

                    <strong>Estado:</strong>

                    <span class="estado">
                        ${domicilio.estado}
                    </span>

                </div>


                <div class="botones-estado">

                    <button
                     class="btn-cocina"
                        onclick="cambiarEstado(${domicilio.id}, 'en cocina')">

                        👨‍🍳 En cocina

                    </button>

                   <button
                        class="btn-domiciliario"
                        onclick="cambiarEstado(${domicilio.id}, 'esperando domiciliario')">

                        🛵 Esperando domiciliario

                    </button>

                    <button
                        class="btn-camino"
                        onclick="cambiarEstado(${domicilio.id}, 'en camino')">

                        🚴 En camino

                    </button>

                    <button
                        class="btn-entregado"
                        onclick="cambiarEstado(${domicilio.id}, 'entregado')">

                        ✅ Entregado

                  </button>

                    ${
                        domicilio.estado === "entregado"
                        ?
                        `
                        <button
                            class="btn-finalizar"
                            onclick="finalizarDomicilio(${domicilio.id})">

                            🗑️ Finalizar

                     </button>
                       `
                        :
                       ""
                    }

                </div>

            `;


            container.appendChild(elemento);

        });


    } catch (error) {

        console.error(error);

        container.innerHTML = `

            <p class="vacio">

                ❌ No se pudo conectar
                con el servidor.

            </p>

        `;
    }
}


// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstado(id, nuevoEstado) {

    try {

        const respuesta = await fetch(
            `${API_URL}/domicilios/${id}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
            {
                method: "PUT"
            }
        );


        const datos = await respuesta.json();


        if (datos.error) {

            alert("❌ " + datos.error);

            return;
        }


        // Volver a cargar los domicilios
        cargarDomicilios();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo actualizar el estado."
        );

    }
}

// ==========================================
// FINALIZAR DOMICILIO
// ==========================================

async function finalizarDomicilio(id) {

    const confirmar = confirm(
        "¿Seguro que quieres finalizar este domicilio?"
    );

    if (!confirmar) {
        return;
    }


    try {

        const respuesta = await fetch(
            `${API_URL}/domicilios/${id}`,
            {
                method: "DELETE"
            }
        );


        const datos = await respuesta.json();


        if (datos.error) {

            alert("❌ " + datos.error);

            return;
        }


        // Volver a cargar los domicilios
        cargarDomicilios();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo finalizar el domicilio."
        );

    }
}

// ==========================================
// RESERVAS
// ==========================================

async function cargarReservas() {

    const container =
        document.getElementById("reservasContainer");


    container.innerHTML =
        '<p class="cargando">Cargando reservas...</p>';


    try {

        const respuesta =
            await fetch(`${API_URL}/reservas`);


        const datos =
            await respuesta.json();


        container.innerHTML = "";


        if (datos.reservas.length === 0) {

            container.innerHTML =
                '<p class="vacio">No hay reservas.</p>';

            return;

        }


        datos.reservas.forEach(reserva => {

            const elemento =
                document.createElement("div");


            elemento.className = "reserva";


            elemento.innerHTML = `

                <h3>
                    📅 Reserva #${reserva.id}
                </h3>

                <p class="dato">
                    👤 <strong>Cliente:</strong>
                    ${reserva.nombre}
                </p>

                <p class="dato">
                    📞 <strong>Teléfono:</strong>
                    ${reserva.telefono}
                </p>

                <p class="dato">
                    📅 <strong>Fecha:</strong>
                    ${reserva.fecha}
                </p>

                <p class="dato">
                    🕐 <strong>Hora:</strong>
                    ${reserva.hora}
                </p>

                <p class="dato">
                    👥 <strong>Personas:</strong>
                    ${reserva.personas}
                </p>

                <p class="dato">
                    📝 <strong>Observaciones:</strong>
                    ${reserva.observaciones || "Ninguna"}
                </p>

                <span class="estado">
                    ${reserva.estado}
                </span>

                <div class="botones-reserva">

                    <button
                        class="btn-finalizar-reserva"
                        onclick="finalizarReserva(${reserva.id})">

                        ✅ Finalizado

                    </button>

                </div>

            `;


            container.appendChild(elemento);

        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <p class="vacio">

                ❌ No se pudo conectar
                con el servidor.

            </p>

        `;

    }

}
// ==========================================
// FINALIZAR RESERVA
// ==========================================

async function finalizarReserva(id) {

    const confirmar = confirm(
        "¿Seguro que quieres finalizar esta reserva?"
    );

    if (!confirmar) {
        return;
    }


    try {

        const respuesta = await fetch(
            `${API_URL}/reservas/${id}`,
            {
                method: "DELETE"
            }
        );


        const datos = await respuesta.json();


        if (datos.error) {

            alert("❌ " + datos.error);

            return;
        }


        // Volver a cargar las reservas
        cargarReservas();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo finalizar la reserva."
        );

    }
}

// ==========================================
// CARGAR AUTOMÁTICAMENTE
// ==========================================

cargarDomicilios();

cargarReservas();