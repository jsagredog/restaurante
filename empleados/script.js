// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL = "https://restaurante-backend-4kc1.onrender.com";


// ==========================================
// ELEMENTOS HTML
// ==========================================

const loginForm = document.getElementById("loginForm");
const loginMensaje = document.getElementById("loginMensaje");

const loginContainer = document.getElementById("loginContainer");
const panelEmpleados = document.getElementById("panelEmpleados");

const cerrarSesion = document.getElementById("cerrarSesion");


// ==========================================
// INICIAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");

    if (token) {
        verificarToken();
    }

});


// ==========================================
// VERIFICAR TOKEN
// ==========================================

async function verificarToken() {

    const token = localStorage.getItem("token");

    if (!token) {
        mostrarLogin();
        return;
    }

    try {

        const respuesta = await fetch(`${API_URL}/domicilios`, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });


        // TOKEN INVALIDO

        if (respuesta.status === 401) {

            console.warn("Token inválido o expirado.");

            localStorage.removeItem("token");

            mostrarLogin();

            loginMensaje.textContent =
                "🔐 Tu sesión ha expirado. Inicia sesión nuevamente.";

            return;
        }


        // OTRO ERROR

        if (!respuesta.ok) {

            console.error(
                "Error verificando sesión:",
                respuesta.status
            );

            mostrarLogin();

            return;
        }


        // TOKEN CORRECTO

        mostrarPanel();

    } catch (error) {

        console.error(
            "Error conectando con el servidor:",
            error
        );

        mostrarLogin();

        loginMensaje.textContent =
            "❌ No se pudo conectar con el servidor.";

    }

}


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    loginContainer.style.display = "flex";

    panelEmpleados.style.display = "none";

}


// ==========================================
// MOSTRAR PANEL
// ==========================================

function mostrarPanel() {

    loginContainer.style.display = "none";

    panelEmpleados.style.display = "block";


    cargarDomicilios();

    cargarReservas();

}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    loginMensaje.textContent =
        "⏳ Iniciando sesión...";


    const usuario =
        document.getElementById("usuario").value.trim();


    const contrasena =
        document.getElementById("contrasena").value;


    try {

        // ==========================================
        // DATOS DEL LOGIN
        // ==========================================

        const datos = new URLSearchParams();

        datos.append("username", usuario);

        datos.append("password", contrasena);


        // ==========================================
        // PETICIÓN AL BACKEND
        // ==========================================

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


        const resultado =
            await respuesta.json();


        console.log("Respuesta login:", resultado);


        // ==========================================
        // LOGIN CORRECTO
        // ==========================================

        if (respuesta.ok) {

            if (!resultado.access_token) {

                throw new Error(
                    "El servidor no devolvió el token."
                );

            }


            // Guardar token

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
// CERRAR SESIÓN
// ==========================================

if (cerrarSesion) {

    cerrarSesion.addEventListener(
        "click",
        function() {

            localStorage.removeItem("token");

            mostrarLogin();

            loginForm.reset();

            loginMensaje.textContent = "";

        }
    );

}


// ==========================================
// OBTENER TOKEN
// ==========================================

function obtenerToken() {

    return localStorage.getItem("token");

}


// ==========================================
// MANEJAR TOKEN INVALIDO
// ==========================================

function manejarTokenInvalido() {

    console.warn(
        "⚠️ El servidor rechazó el token."
    );


    localStorage.removeItem("token");


    mostrarLogin();


    loginMensaje.textContent =
        "🔐 Sesión inválida. Inicia sesión nuevamente.";

}


// ==========================================
// DOMICILIOS
// ==========================================

async function cargarDomicilios() {

    const container =
        document.getElementById(
            "domiciliosContainer"
        );


    if (!container) {
        return;
    }


    const token =
        obtenerToken();


    if (!token) {

        mostrarLogin();

        return;

    }


    container.innerHTML =
        '<p class="cargando">⏳ Cargando domicilios...</p>';


    try {

        // ==========================================
        // CONSULTAR DOMICILIOS
        // ==========================================

        const respuesta = await fetch(
            `${API_URL}/domicilios`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        // ==========================================
        // TOKEN INVALIDO
        // ==========================================

        if (respuesta.status === 401) {

            manejarTokenInvalido();

            return;

        }


        const datos =
            await respuesta.json();


        console.log(
            "Domicilios recibidos:",
            datos
        );


        // ==========================================
        // ERROR
        // ==========================================

        if (!respuesta.ok) {

            throw new Error(
                datos.detail ||
                datos.error ||
                "Error al consultar domicilios"
            );

        }


        // ==========================================
        // COMPATIBILIDAD
        // ==========================================

        const domicilios =
            Array.isArray(datos)
                ? datos
                : (datos.domicilios || []);


        container.innerHTML = "";


        // ==========================================
        // SIN DOMICILIOS
        // ==========================================

        if (domicilios.length === 0) {

            container.innerHTML =
                '<p class="vacio">No hay domicilios.</p>';

            return;

        }


        // ==========================================
        // MOSTRAR DOMICILIOS
        // ==========================================

        domicilios.forEach(domicilio => {

            const elemento =
                document.createElement("div");


            elemento.className =
                "pedido";


            elemento.innerHTML = `

                <h3>
                    🛵 Domicilio #${domicilio.id}
                </h3>

                <p class="dato">
                    👤 <strong>Cliente:</strong>
                    ${domicilio.nombre || ""}
                </p>

                <p class="dato">
                    📞 <strong>Teléfono:</strong>
                    ${domicilio.telefono || ""}
                </p>

                <p class="dato">
                    📍 <strong>Dirección:</strong>
                    ${domicilio.direccion || ""}
                </p>

                <p class="dato">
                    🍔 <strong>Pedido:</strong>
                    ${domicilio.pedido || ""}
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
                        onclick="cambiarEstado(
                            ${domicilio.id},
                            'en cocina'
                        )">

                        👨‍🍳 En cocina

                    </button>


                    <button
                        class="btn-domiciliario"
                        onclick="cambiarEstado(
                            ${domicilio.id},
                            'esperando domiciliario'
                        )">

                        🛵 Esperando domiciliario

                    </button>


                    <button
                        class="btn-camino"
                        onclick="cambiarEstado(
                            ${domicilio.id},
                            'en camino'
                        )">

                        🚴 En camino

                    </button>


                    <button
                        class="btn-entregado"
                        onclick="cambiarEstado(
                            ${domicilio.id},
                            'entregado'
                        )">

                        ✅ Entregado

                    </button>


                    ${
                        domicilio.estado === "entregado"
                        ?
                        `
                        <button
                            class="btn-finalizar"
                            onclick="finalizarDomicilio(
                                ${domicilio.id}
                            )">

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
// CAMBIAR ESTADO DEL DOMICILIO
// ==========================================

async function cambiarEstado(
    id,
    nuevoEstado
) {

    const token =
        obtenerToken();


    if (!token) {

        mostrarLogin();

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/domicilios/${id}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (respuesta.status === 401) {

            manejarTokenInvalido();

            return;

        }


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                "❌ " +
                (
                    datos.detail ||
                    datos.error ||
                    "No se pudo actualizar el estado."
                )
            );

            return;

        }


        console.log(
            "Estado actualizado:",
            datos
        );


        cargarDomicilios();


    } catch (error) {

        console.error(
            "Error cambiando estado:",
            error
        );


        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

}


// ==========================================
// FINALIZAR DOMICILIO
// ==========================================

async function finalizarDomicilio(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres finalizar este domicilio?\n\nSe eliminará de la lista."
        );


    if (!confirmar) {
        return;
    }


    const token =
        obtenerToken();


    if (!token) {

        mostrarLogin();

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/domicilios/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (respuesta.status === 401) {

            manejarTokenInvalido();

            return;

        }


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                "❌ " +
                (
                    datos.detail ||
                    datos.error ||
                    "No se pudo finalizar."
                )
            );

            return;

        }


        alert(
            "✅ Domicilio finalizado."
        );


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
        document.getElementById(
            "reservasContainer"
        );


    if (!container) {
        return;
    }


    const token =
        obtenerToken();


    if (!token) {

        mostrarLogin();

        return;

    }


    container.innerHTML =
        '<p class="cargando">⏳ Cargando reservas...</p>';


    try {

        const respuesta =
            await fetch(
                `${API_URL}/reservas`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (respuesta.status === 401) {

            manejarTokenInvalido();

            return;

        }


        const datos =
            await respuesta.json();


        console.log(
            "Reservas recibidas:",
            datos
        );


        if (!respuesta.ok) {

            throw new Error(
                datos.detail ||
                datos.error ||
                "Error al consultar reservas"
            );

        }


        const reservas =
            Array.isArray(datos)
                ? datos
                : (datos.reservas || []);


        container.innerHTML = "";


        if (reservas.length === 0) {

            container.innerHTML =
                '<p class="vacio">No hay reservas.</p>';

            return;

        }


        reservas.forEach(reserva => {

            const elemento =
                document.createElement("div");


            elemento.className =
                "reserva";


            elemento.innerHTML = `

                <h3>
                    📅 Reserva #${reserva.id}
                </h3>

                <p class="dato">
                    👤 <strong>Cliente:</strong>
                    ${reserva.nombre || ""}
                </p>

                <p class="dato">
                    📞 <strong>Teléfono:</strong>
                    ${reserva.telefono || ""}
                </p>

                <p class="dato">
                    📅 <strong>Fecha:</strong>
                    ${reserva.fecha || ""}
                </p>

                <p class="dato">
                    🕐 <strong>Hora:</strong>
                    ${reserva.hora || ""}
                </p>

                <p class="dato">
                    👥 <strong>Personas:</strong>
                    ${reserva.personas || ""}
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
                        onclick="finalizarReserva(
                            ${reserva.id}
                        )">

                        ✅ Finalizado

                    </button>

                </div>

            `;


            container.appendChild(elemento);

        });


    } catch (error) {

        console.error(
            "Error cargando reservas:",
            error
        );


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

    const confirmar =
        confirm(
            "¿Seguro que quieres finalizar esta reserva?\n\nSe eliminará de la lista."
        );


    if (!confirmar) {
        return;
    }


    const token =
        obtenerToken();


    if (!token) {

        mostrarLogin();

        return;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/reservas/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (respuesta.status === 401) {

            manejarTokenInvalido();

            return;

        }


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                "❌ " +
                (
                    datos.detail ||
                    datos.error ||
                    "No se pudo finalizar la reserva."
                )
            );

            return;

        }


        alert(
            "✅ Reserva finalizada."
        );


        cargarReservas();


    } catch (error) {

        console.error(
            "Error finalizando reserva:",
            error
        );


        alert(
            "❌ No se pudo conectar con el servidor."
        );

    }

}


// ==========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ==========================================

setInterval(() => {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return;
    }


    // Actualizar cada 10 segundos

    cargarDomicilios();

    cargarReservas();

}, 10000);