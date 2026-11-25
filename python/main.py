from scala_service import ejecutar_scala, RAIZ
from prolog_service import ejecutar_prolog
from utils import pedir_nombre, pedir_entero, pedir_interes, coinciden, normalizar


def leer_destinos():
    """Lee data/destinos.txt y devuelve una lista de diccionarios."""
    ruta = RAIZ / "data" / "destinos.txt"
    lineas = ruta.read_text(encoding="utf-8").splitlines()
    destinos = []
    for linea in lineas[1:]:  # la primera linea es el encabezado
        if linea.strip():
            nombre_destino, departamento, tipo_interes, costo = linea.split(",")
            destinos.append({
                "nombre_destino": nombre_destino.strip(),
                "departamento": departamento.strip(),
                "tipo_interes": tipo_interes.strip(),
                "costo": int(costo.strip()),
            })
    return destinos


def recomendar(nombre, presupuesto, interes):
    """Calcula la recomendacion y la DEVUELVE (sin input ni print).
    Sirve igual para la consola y para la web."""
    nivel, destinos_scala = ejecutar_scala(nombre, presupuesto, interes)
    destinos_prolog, sugerencias = ejecutar_prolog(presupuesto, interes)

    # Prolog usa nombres como centro_historico; se pasan al nombre normal para mostrarlos
    nombres = {normalizar(d["nombre_destino"]): d["nombre_destino"] for d in leer_destinos()}
    cercanos = {}
    for origen, cercano in sugerencias:
        lugares = cercanos.setdefault(nombres.get(origen, origen), [])
        lugares.append(nombres.get(cercano, cercano))

    return {
        "nivel": nivel,
        "scala": destinos_scala,
        "prolog": destinos_prolog,
        "coinciden": coinciden(destinos_scala, destinos_prolog),
        "cercanos": cercanos,
    }


def consultar():
    nombre = pedir_nombre()
    presupuesto = pedir_entero( "Presupuesto: ")
    interes = pedir_interes()

    print()
    print(f"[Python] Datos: {nombre}, {presupuesto}, {interes}")

    resultado = recomendar(nombre, presupuesto, interes)
    print(f"[Scala]  Nivel: {resultado['nivel']} | Recomendados: {', '.join(resultado['scala']) or 'ninguno'}")
    print(f"[Prolog] Recomendados: {', '.join(resultado['prolog']) or 'ninguno'}")
    for origen, lugares in resultado["cercanos"].items():
        print(f"[Prolog] Cerca de {origen}: {', '.join(lugares)}")

    if resultado["coinciden"]:
        print("[Python] Scala y Prolog coinciden")
    else:
        print("[Python] Scala y Prolog NO coinciden")


def listar_destinos():
    print()
    print(f"{'Destino':<26}{'Departamento':<14}{'Tipo':<14}{'Costo (S/)':>10}")
    for d in leer_destinos():
        print(f"{d['nombre_destino']:<26}{d['departamento']:<14}{d['tipo_interes']:<14}{d['costo']:>10}")


def main():
    print("Sistema de recomendacion de destinos turisticos del Peru")
    while True:
        print()
        print("1. Recomendar destinos")
        print("2. Ver destinos disponibles")
        print("3. Salir")
        opcion = input("Opcion: ").strip()
        if opcion == "1":
            try:
                consultar()
            except (RuntimeError, ValueError) as error:
                print(f"Error: {error}")
        elif opcion == "2":
            listar_destinos()
        elif opcion == "3":
            break
        else:
            print("Opcion no valida")
    print("Hasta luego")


if __name__ == "__main__":
    main()