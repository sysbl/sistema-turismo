import shutil
import subprocess
from pathlib import Path
from utils import INTERESES

RAIZ = Path(__file__).resolve().parents[1]

NIVELES = ("bajo", "medio", "alto")

def ejecutar_prolog(nivel, interes):
    if nivel not in NIVELES:
        raise ValueError(f"Nivel no valido: {nivel}")
    if interes not in INTERESES:
        raise ValueError(f"Interes no valido: {interes}")

    swipl = shutil.which("swipl")
    if swipl is None:
        raise RuntimeError("No se encontro swipl en el PATH")

    meta = (
        f"assertz(presupuesto(usuario,{nivel})),"
        f"assertz(interes(usuario,{interes})),"
        "findall(D,recomendar(usuario,D),L),"
        "atomic_list_concat(L,',',T),"
        "write(T)"
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

    texto = resultado.stdout.strip()
    return texto.split(",") if texto else []