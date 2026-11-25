import shutil
import subprocess  #herramienta para ejecutar otro programa
from pathlib import Path #

RAIZ = Path(__file__).resolve().parents[1]

def ejecutar_scala(nombre,presupuesto,interes):
    sbt =shutil.which("sbt") # busca el progrmama en el path de windows y retorna su ruta
    if sbt is None:
        raise RuntimeError("No se encontro sbt en el Path")

    comando = [sbt, "-batch", f"runMain app.Integracion {nombre} {presupuesto} {interes}"]
    resultado = subprocess.run(
        comando,
        cwd=RAIZ, # ejecuta desde la raiz del proyecto
        capture_output=True, # guarda lo que imprime - no muestra
        text=True, # recibir como texto - str
        encoding="utf-8", #para evitar fallos x simbolos
        errors="replace", # sustituir
        timeout=180,
    )

    for linea in resultado.stdout.splitlines():
        if linea.startswith("RESULTADO|"):
            partes = linea.split("|")
            nivel = partes[1].replace("nivel=", "")
            texto = partes[2].replace("destinos=", "")
            destinos = texto.split(",") if texto else []
            return nivel, destinos

    raise RuntimeError("Scala no devolvio una linea RESULTADO")