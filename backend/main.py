

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
from datetime import datetime


app = FastAPI(
    title="Sistema de Restaurante",
    description="API para domicilios y reservas",
    version="1.0.0"
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
# BASE DE DATOS
# =========================

def conectar_db():

    conexion = sqlite3.connect("restaurante.db")

    conexion.row_factory = sqlite3.Row

    return conexion


def crear_tablas():

    conexion = conectar_db()

    cursor = conexion.cursor()

    # Tabla de domicilios
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS domicilios (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL,

            telefono TEXT NOT NULL,

            direccion TEXT NOT NULL,

            pedido TEXT NOT NULL,

            observaciones TEXT,

            fecha_hora TEXT NOT NULL,

            estado TEXT NOT NULL DEFAULT 'pendiente'

        )
    """)


    # Tabla de reservas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservas (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            nombre TEXT NOT NULL,

            telefono TEXT NOT NULL,

            fecha TEXT NOT NULL,

            hora TEXT NOT NULL,

            personas INTEGER NOT NULL,

            observaciones TEXT,

            fecha_creacion TEXT NOT NULL,

            estado TEXT NOT NULL DEFAULT 'pendiente'

        )
    """)


    conexion.commit()

    conexion.close()


# Crear las tablas cuando inicia el servidor
crear_tablas()


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
        "mensaje": "Sistema del restaurante funcionando 🚀"
    }


# =========================
# CREAR DOMICILIO
# =========================

@app.post("/domicilios")
def recibir_domicilio(domicilio: Domicilio):

    conexion = conectar_db()

    cursor = conexion.cursor()


    fecha_hora = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    cursor.execute("""
        INSERT INTO domicilios
        (
            nombre,
            telefono,
            direccion,
            pedido,
            observaciones,
            fecha_hora
        )

        VALUES (?, ?, ?, ?, ?, ?)
    """, (

        domicilio.nombre,

        domicilio.telefono,

        domicilio.direccion,

        domicilio.pedido,

        domicilio.observaciones,

        fecha_hora

    ))


    conexion.commit()

    nuevo_id = cursor.lastrowid

    conexion.close()


    print("\n🛵 NUEVO DOMICILIO GUARDADO")
    print("----------------------")
    print(f"ID: {nuevo_id}")
    print(f"Cliente: {domicilio.nombre}")
    print(f"Teléfono: {domicilio.telefono}")
    print(f"Dirección: {domicilio.direccion}")
    print(f"Pedido: {domicilio.pedido}")
    print(f"Observaciones: {domicilio.observaciones}")
    print(f"Fecha: {fecha_hora}")
    print("----------------------\n")


    return {

        "estado": "recibido",

        "mensaje": "Domicilio guardado correctamente",

        "id": nuevo_id

    }


# =========================
# CREAR RESERVA
# =========================

@app.post("/reservas")
def recibir_reserva(reserva: Reserva):

    conexion = conectar_db()

    cursor = conexion.cursor()


    fecha_creacion = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    cursor.execute("""
        INSERT INTO reservas
        (
            nombre,
            telefono,
            fecha,
            hora,
            personas,
            observaciones,
            fecha_creacion
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (

        reserva.nombre,

        reserva.telefono,

        reserva.fecha,

        reserva.hora,

        reserva.personas,

        reserva.observaciones,

        fecha_creacion

    ))


    conexion.commit()

    nuevo_id = cursor.lastrowid

    conexion.close()


    print("\n📅 NUEVA RESERVA GUARDADA")
    print("----------------------")
    print(f"ID: {nuevo_id}")
    print(f"Cliente: {reserva.nombre}")
    print(f"Teléfono: {reserva.telefono}")
    print(f"Fecha: {reserva.fecha}")
    print(f"Hora: {reserva.hora}")
    print(f"Personas: {reserva.personas}")
    print(f"Observaciones: {reserva.observaciones}")
    print(f"Creada: {fecha_creacion}")
    print("----------------------\n")


    return {

        "estado": "recibida",

        "mensaje": "Reserva guardada correctamente",

        "id": nuevo_id

    }
# =========================
# CONSULTAR DOMICILIOS
# =========================

@app.get("/domicilios")
def consultar_domicilios():

    conexion = conectar_db()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT *
        FROM domicilios
        ORDER BY id ASC
    """)

    domicilios = cursor.fetchall()

    conexion.close()

    return {
        "cantidad": len(domicilios),
        "domicilios": [dict(domicilio) for domicilio in domicilios]
    }


# =========================
# CONSULTAR RESERVAS
# =========================

@app.get("/reservas")
def consultar_reservas():

    conexion = conectar_db()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT *
        FROM reservas
        ORDER BY fecha ASC, hora ASC
    """)

    reservas = cursor.fetchall()

    conexion.close()

    return {
        "cantidad": len(reservas),
        "reservas": [dict(reserva) for reserva in reservas]
    }
# =========================
# CAMBIAR ESTADO DOMICILIO
# =========================

@app.put("/domicilios/{domicilio_id}/estado")
def cambiar_estado_domicilio(domicilio_id: int, estado: str):

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

    conexion = conectar_db()
    cursor = conexion.cursor()

    cursor.execute("""
        UPDATE domicilios
        SET estado = ?
        WHERE id = ?
    """, (estado, domicilio_id))

    conexion.commit()

    filas_modificadas = cursor.rowcount

    conexion.close()

    if filas_modificadas == 0:
        return {
            "error": "Domicilio no encontrado"
        }

    return {
        "mensaje": "Estado actualizado correctamente",
        "id": domicilio_id,
        "estado": estado
    }
# =========================
# FINALIZAR / ELIMINAR DOMICILIO
# =========================

@app.delete("/domicilios/{domicilio_id}")
def eliminar_domicilio(domicilio_id: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    cursor.execute("""
        DELETE FROM domicilios
        WHERE id = ?
    """, (domicilio_id,))

    conexion.commit()

    filas_modificadas = cursor.rowcount

    conexion.close()

    if filas_modificadas == 0:
        return {
            "error": "Domicilio no encontrado"
        }

    return {
        "mensaje": "Domicilio finalizado correctamente",
        "id": domicilio_id
    }
# =========================
# FINALIZAR / ELIMINAR RESERVA
# =========================

@app.delete("/reservas/{reserva_id}")
def eliminar_reserva(reserva_id: int):

    conexion = conectar_db()
    cursor = conexion.cursor()

    cursor.execute("""
        DELETE FROM reservas
        WHERE id = ?
    """, (reserva_id,))

    conexion.commit()

    filas_modificadas = cursor.rowcount

    conexion.close()

    if filas_modificadas == 0:
        return {
            "error": "Reserva no encontrada"
        }

    return {
        "mensaje": "Reserva finalizada correctamente",
        "id": reserva_id
    }
