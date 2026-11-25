from scala_service import ejecutar_scala, RAIZ
from prolog_service import ejecutar_prolog
from utils import pedir_nombre, pedir_entero, pedir_interes, coinciden


def consultar():
    nombre = pedir_nombre()
    presupuesto = pedir_entero( "Presupuesto: ")
    interes = pedir_interes()

    print()
    print(f"[Python] Datos: {nombre}, {presupuesto}, {interes}")

    nivel, destinos_scala = ejecutar_scala(nombre, presupuesto, interes)
    print(f"[Scala]  Nivel: {nivel} | Recomendados: {', '.join(destinos_scala) or 'ninguno'}")

    destinos_prolog = ejecutar_prolog(nivel, interes)
    print(f"[Prolog] Recomendados: {', '.join(destinos_prolog) or 'ninguno'}")

    if coinciden(destinos_scala, destinos_prolog):
        print("[Python] Scala y Prolog coinciden")
    else:
        print("[Python] Scala y Prolog NO coinciden")


def listar_destinos():
    ruta = RAIZ / "data" / "destinos.txt"
    lineas = ruta.read_text(encoding="utf-8").splitlines()
    print()
    print(f"{'Destino':<15}{'Tipo':<14}{'Costo (S/)':>10}")
    for linea in lineas[1:]:
        if linea.strip():
            nombre, tipo, costo = linea.split(",")
            print(f"{nombre.strip():<15}{tipo.strip():<14}{costo.strip():>10}")


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