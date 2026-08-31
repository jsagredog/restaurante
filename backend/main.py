from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import os


# =========================
# CARGAR VARIABLES
# =========================

load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env"
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# =========================
# FASTAPI
# =========================

app = FastAPI(
    title="Sistema de Restaurante",
    description="API para domicilios y reservas",
    version="2.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODELOS
# =========================

class Domicilio(BaseModel):

    nombre: str

    telefono: str

    direccion: str

    pedido: str

    observaciones: Optional[str] = ""


class Reserva(BaseModel):

    nombre: str

    telefono: str

    fecha: str

    hora: str

    personas: int

    observaciones: Optional[str] = ""


# =========================
# RUTA PRINCIPAL
# =========================

@app.get("/")
def inicio():

    return {
        "mensaje": "Sistema del restaurante funcionando 🚀",
        "base_de_datos": "Supabase ☁️"
    }


# =========================
# CREAR DOMICILIO
# =========================

@app.post("/domicilios")
def recibir_domicilio(domicilio: Domicilio):

    try:

        resultado = supabase.table("domicilios").insert({

            "nombre": domicilio.nombre,

            "telefono": domicilio.telefono,

            "direccion": domicilio.direccion,

            "pedido": domicilio.pedido,

            "observaciones": domicilio.observaciones

        }).execute()


        nuevo_domicilio = resultado.data[0]


        print("\n🛵 NUEVO DOMICILIO GUARDADO")
        print("----------------------")
        print(f"ID: {nuevo_domicilio['id']}")
        print(f"Cliente: {domicilio.nombre}")
        print(f"Teléfono: {domicilio.telefono}")
        print(f"Dirección: {domicilio.direccion}")
        print(f"Pedido: {domicilio.pedido}")
        print(f"Observaciones: {domicilio.observaciones}")
        print("----------------------\n")


        return {

            "estado": "recibido",

            "mensaje": "Domicilio guardado correctamente",

            "id": nuevo_domicilio["id"]

        }


    except Exception as error:

        print("ERROR AL GUARDAR DOMICILIO:", error)

        return {
            "error": "No se pudo guardar el domicilio",
            "detalle": str(error)
        }


# =========================
# CREAR RESERVA
# =========================

@app.post("/reservas")
def recibir_reserva(reserva: Reserva):

    try:

        resultado = supabase.table("reservas").insert({

            "nombre": reserva.nombre,

            "telefono": reserva.telefono,

            "fecha": reserva.fecha,

            "hora": reserva.hora,

            "personas": reserva.personas,

            "observaciones": reserva.observaciones

        }).execute()


        nueva_reserva = resultado.data[0]


        print("\n📅 NUEVA RESERVA GUARDADA")
        print("----------------------")
        print(f"ID: {nueva_reserva['id']}")
        print(f"Cliente: {reserva.nombre}")
        print(f"Teléfono: {reserva.telefono}")
        print(f"Fecha: {reserva.fecha}")
        print(f"Hora: {reserva.hora}")
        print(f"Personas: {reserva.personas}")
        print(f"Observaciones: {reserva.observaciones}")
        print("----------------------\n")


        return {

            "estado": "recibida",

            "mensaje": "Reserva guardada correctamente",

            "id": nueva_reserva["id"]

        }


    except Exception as error:

        print("ERROR AL GUARDAR RESERVA:", error)

        return {
            "error": "No se pudo guardar la reserva",
            "detalle": str(error)
        }


# =========================
# CONSULTAR DOMICILIOS
# =========================

@app.get("/domicilios")
def consultar_domicilios():

    try:

        resultado = (
            supabase
            .table("domicilios")
            .select("*")
            .order("id", desc=False)
            .execute()
        )


        domicilios = resultado.data


        return {

            "cantidad": len(domicilios),

            "domicilios": domicilios

        }


    except Exception as error:

        print("ERROR AL CONSULTAR DOMICILIOS:", error)

        return {

            "error": "No se pudieron consultar los domicilios",

            "domicilios": []

        }


# =========================
# CONSULTAR RESERVAS
# =========================

@app.get("/reservas")
def consultar_reservas():

    try:

        resultado = (
            supabase
            .table("reservas")
            .select("*")
            .order("fecha", desc=False)
            .order("hora", desc=False)
            .execute()
        )


        reservas = resultado.data


        return {

            "cantidad": len(reservas),

            "reservas": reservas

        }


    except Exception as error:

        print("ERROR AL CONSULTAR RESERVAS:", error)

        return {

            "error": "No se pudieron consultar las reservas",

            "reservas": []

        }


# =========================
# CAMBIAR ESTADO DOMICILIO
# =========================

@app.put("/domicilios/{domicilio_id}/estado")
def cambiar_estado_domicilio(
    domicilio_id: int,
    estado: str
):

    estados_validos = [

        "en cocina",

        "esperando domiciliario",

        "en camino",

        "entregado"

    ]


    if estado not in estados_validos:

        return {

            "error": "Estado no válido"

        }


    try:

        resultado = (
            supabase
            .table("domicilios")
            .update({
                "estado": estado
            })
            .eq("id", domicilio_id)
            .execute()
        )


        if not resultado.data:

            return {

                "error": "Domicilio no encontrado"

            }


        return {

            "mensaje": "Estado actualizado correctamente",

            "id": domicilio_id,

            "estado": estado

        }


    except Exception as error:

        print("ERROR AL CAMBIAR ESTADO:", error)

        return {

            "error": "No se pudo actualizar el estado"

        }


# =========================
# FINALIZAR DOMICILIO
# =========================

@app.delete("/domicilios/{domicilio_id}")
def eliminar_domicilio(domicilio_id: int):

    try:

        resultado = (
            supabase
            .table("domicilios")
            .delete()
            .eq("id", domicilio_id)
            .execute()
        )


        if not resultado.data:

            return {

                "error": "Domicilio no encontrado"

            }


        return {

            "mensaje": "Domicilio finalizado correctamente",

            "id": domicilio_id

        }


    except Exception as error:

        print("ERROR AL ELIMINAR DOMICILIO:", error)

        return {

            "error": "No se pudo finalizar el domicilio"

        }


# =========================
# FINALIZAR / ELIMINAR RESERVA
# =========================

@app.delete("/reservas/{reserva_id}")
def eliminar_reserva(reserva_id: int):

    try:

        resultado = (
            supabase
            .table("reservas")
            .delete()
            .eq("id", reserva_id)
            .execute()
        )

        if not resultado.data:

            return {
                "error": "Reserva no encontrada"
            }

        return {
            "mensaje": "Reserva finalizada correctamente",
            "id": reserva_id
        }

    except Exception as e:

        print("Error al eliminar reserva:", e)

        return {
            "error": "No se pudo eliminar la reserva",
            "detalle": str(e)
        }