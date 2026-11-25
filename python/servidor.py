"""Servidor web (Flask) del sistema de recomendacion.

Solo reutiliza recomendar() de main.py: no repite la logica de Scala/Prolog.
Ejecutar desde la raiz del proyecto:  python python/servidor.py
"""
import re
import subprocess
import threading

from flask import Flask, jsonify, request

from main import leer_destinos, recomendar
from scala_service import RAIZ
from utils import INTERESES

# static_folder: la carpeta web/ (Paso 3) se sirve desde "/"
app = Flask(__name__, static_folder=str(RAIZ / "web"), static_url_path="")

# sbt no debe correr dos veces a la vez: una consulta por turno
candado = threading.Lock()


# El nombre llega a sbt como parte de un comando: solo letras, numeros, _ y -
NOMBRE_VALIDO = re.compile(r"[\w-]{1,20}")


def error(mensaje, codigo):
    return jsonify({"error": mensaje}), codigo


@app.get("/")
def inicio():
    return app.send_static_file("index.html")


@app.get("/api/destinos")
def api_destinos():
    return jsonify(leer_destinos())


@app.post("/api/recomendar")
def api_recomendar():
    datos = request.get_json(silent=True) or {}

    nombre = str(datos.get("nombre", "")).strip()
    interes = str(datos.get("interes", "")).strip().lower()
    try:
        presupuesto = int(datos.get("presupuesto"))
    except (TypeError, ValueError):
        return error("El presupuesto debe ser un numero entero, por ejemplo 900", 400)

    if not NOMBRE_VALIDO.fullmatch(nombre):
        return error("Escribe un nombre de una sola palabra, sin espacios ni simbolos, por ejemplo Ana", 400)
    if presupuesto <= 0:
        return error("El presupuesto debe ser mayor que cero", 400)
    if interes not in INTERESES:
        return error("Interes no valido. Opciones: " + ", ".join(INTERESES), 400)

    try:
        with candado:
            return jsonify(recomendar(nombre, presupuesto, interes))
    except subprocess.TimeoutExpired:
        return error("La consulta tardo demasiado. Intenta de nuevo.", 504)
    except (RuntimeError, ValueError) as fallo:
        return error(str(fallo), 500)


if __name__ == "__main__":
    app.run(debug=False, port=5000)
