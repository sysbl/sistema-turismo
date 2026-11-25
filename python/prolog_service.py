import shutil
import subprocess
from pathlib import Path
from utils import INTERESES

RAIZ = Path(__file__).resolve().parents[1]

def ejecutar_prolog(presupuesto, interes):
    """Devuelve (destinos recomendados, sugerencias cercanas).
    Las sugerencias son pares (destino recomendado, destino cercano)."""
    if not isinstance(presupuesto, int) or presupuesto <= 0:
        raise ValueError(f"Presupuesto no valido: {presupuesto}")
    if interes not in INTERESES:
        raise ValueError(f"Interes no valido: {interes}")

    swipl = shutil.which("swipl")
    if swipl is None:
        raise RuntimeError("No se encontro swipl en el PATH")

    meta = (
        f"assertz(presupuesto(usuario,{presupuesto})),"
        f"assertz(interes(usuario,{interes})),"
        "findall(D,recomendar(usuario,D),L),"
        "atomic_list_concat(L,',',T),"
        "write(T),nl,"
        "findall(X,(sugerido_cerca(usuario,A,B),atomic_list_concat([A,B],':',X)),C),"
        "atomic_list_concat(C,',',U),"
        "write(U)"
    )

    comando = [swipl, "-q", "-s", "prolog/integracion.pl", "-g", meta, "-t", "halt"]
    resultado = subprocess.run(
        comando,
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )

    if resultado.returncode != 0:
        raise RuntimeError(f"Prolog fallo: {resultado.stderr.strip()}")

    # Linea 1: destinos recomendados. Linea 2: sugerencias "recomendado:cercano".
    lineas = resultado.stdout.splitlines() + ["", ""]
    destinos = lineas[0].strip().split(",") if lineas[0].strip() else []
    sugerencias = [par.split(":") for par in lineas[1].strip().split(",") if par]
    return destinos, sugerencias