// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL = "https://restaurante-backend-4kc1.onrender.com";


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");
const loginMensaje = document.getElementById("loginMensaje");

const loginContainer = document.getElementById("loginContainer");
const panelEmpleados = document.getElementById("panelEmpleados");


// ==========================================
// COMPROBAR SESIÓN EXISTENTE
// ==========================================

const tokenGuardado = localStorage.getItem("token");

if (tokenGuardado) {

    mostrarPanel();

}


// ==========================================
// FUNCIÓN LOGIN
// ==========================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginMensaje.textContent = "⏳ Iniciando sesión...";
    loginMensaje.style.color = "";


    const usuario =
        document.getElementById("usuario").value.trim();

    const contrasena =
        document.getElementById("contrasena").value;


    try {

        // OAuth2PasswordRequestForm necesita
        // application/x-www-form-urlencoded

        const datos = new URLSearchParams();

        datos.append("username", usuario);
        datos.append("password", contrasena);


        const respuesta = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: datos
            }
        );


        const resultado = await respuesta.json();


        // ==========================================
        // LOGIN CORRECTO
        // ==========================================

        if (respuesta.ok) {

            if (!resultado.access_token) {

                throw new Error(
                    "El servidor no devolvió el token."
                );

            }


            // Guardar JWT

            localStorage.setItem(
                "token",
                resultado.access_token
            );


            loginMensaje.textContent =
                "✅ Inicio de sesión correcto.";


            mostrarPanel();

            return;
        }


        // ==========================================
        // LOGIN INCORRECTO
        // ==========================================

        loginMensaje.textContent =
            "❌ " +
            (
                resultado.detail ||
                "Usuario o contraseña incorrectos."
            );

    } catch (error) {

        console.error(
            "Error durante el login:",
            error
        );


        loginMensaje.textContent =
            "❌ No se pudo conectar con el servidor.";

    }

});


// ==========================================
// MOSTRAR PANEL
// ==========================================

function mostrarPanel() {

    loginContainer.style.display = "none";

    panelEmpleados.style.display = "block";


    // Cargar información

    cargarDomicilios();

    cargarReservas();

}


// ==========================================
// CERRAR SESIÓN
// ==========================================

const cerrarSesion =
    document.getElementById("cerrarSesion");


if (cerrarSesion) {

    cerrarSesion.addEventListener(
        "click",
        function() {

            localStorage.removeItem("token");

            loginContainer.style.display = "flex";

            panelEmpleados.style.display = "none";

            loginForm.reset();

            loginMensaje.textContent = "";

        }
    );

}


// ==========================================
// DOMICILIOS
// ==========================================

async function cargarDomicilios() {

    const container =
        document.getElementById("domiciliosContainer");

    if (!container) {
        return;
    }


    container.innerHTML =
        '<p class="cargando">Cargando domicilios...</p>';


    try {

        const respuesta =
            await fetch(`${API_URL}/domicilios`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok || datos.error) {

            throw new Error(
                datos.error ||
                "Error al consultar domicilios"
            );

        }


        container.innerHTML = "";


        if (
            !datos.domicilios ||
            datos.domicilios.length === 0
        ) {

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
                    ${domicilio.fecha_hora || "No disponible"}
                </p>

                <div class="estado-actual">

                    <strong>Estado:</strong>

                    <span class="estado">
                        ${domicilio.estado || "pendiente"}
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

        console.error(
            "Error cargando domicilios:",
            error
        );


        container.innerHTML = `

            <p class="vacio">

                ❌ No se pudieron cargar los domicilios.

            </p>

        `;

    }

}


// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstado(id, nuevoEstado) {

    const token =
        localStorage.getItem("token");


    try {

        const respuesta = await fetch(
            `${API_URL}/domicilios/${id}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
            {
                method: "PUT",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || datos.error) {

            alert(
                "❌ " +
                (
                    datos.error ||
                    "No se pudo actualizar el estado."
                )
            );

            return;
        }


        cargarDomicilios();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

}


// ==========================================
// FINALIZAR DOMICILIO
// ==========================================

async function finalizarDomicilio(id) {

    const confirmar = confirm(
        "¿Seguro que quieres finalizar este domicilio?\n\nSe eliminará de la lista."
    );


    if (!confirmar) {
        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const respuesta = await fetch(
            `${API_URL}/domicilios/${id}`,
            {
                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || datos.error) {

            alert(
                "❌ " +
                (
                    datos.error ||
                    "No se pudo finalizar."
                )
            );

            return;
        }


        alert("✅ Domicilio finalizado.");


        cargarDomicilios();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

}


// ==========================================
// RESERVAS
// ==========================================

async function cargarReservas() {

    const container =
        document.getElementById("reservasContainer");


    if (!container) {
        return;
    }


    container.innerHTML =
        '<p class="cargando">Cargando reservas...</p>';


    try {

        const respuesta =
            await fetch(`${API_URL}/reservas`);


        const datos =
            await respuesta.json();


        if (!respuesta.ok || datos.error) {

            throw new Error(
                datos.error ||
                "Error al consultar reservas"
            );

        }


        container.innerHTML = "";


        if (
            !datos.reservas ||
            datos.reservas.length === 0
        ) {

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
                    ${reserva.estado || "pendiente"}
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

                ❌ No se pudieron cargar las reservas.

            </p>

        `;

    }

}


// ==========================================
// FINALIZAR RESERVA
// ==========================================

async function finalizarReserva(id) {

    const confirmar = confirm(
        "¿Seguro que quieres finalizar esta reserva?\n\nSe eliminará de la lista."
    );


    if (!confirmar) {
        return;
    }


    const token =
        localStorage.getItem("token");


    try {

        const respuesta = await fetch(
            `${API_URL}/reservas/${id}`,
            {
                method: "DELETE",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


        const datos =
            await respuesta.json();


        if (!respuesta.ok || datos.error) {

            alert(
                "❌ " +
                (
                    datos.error ||
                    "No se pudo finalizar la reserva."
                )
            );

            return;
        }


        alert("✅ Reserva finalizada.");


        cargarReservas();


    } catch (error) {

        console.error(error);

        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

}


// ==========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================================

setInterval(() => {

    // Solo actualizar si hay sesión

    if (localStorage.getItem("token")) {

        cargarDomicilios();

        cargarReservas();

    }

}, 10000);