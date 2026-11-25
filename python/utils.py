TABLA = str.maketrans("áéíóúñ", "aeioun") # tabla que lo del primer texto se converte en el segundo


def normalizar(nombre):
    texto = nombre.strip().lower() # quita espacios y pasa a minuscula
    texto = texto.translate(TABLA) # aplica la tabla quitando las tildes
    return texto.replace(" ", "_") # convierte los espacios en _


def normalizar_lista(nombres):
    resultado = []
    for nombre in nombres:
        resultado.append(normalizar(nombre)) # añado al final y llama a la funcion anterior
    return resultado


def coinciden(lista_scala, lista_prolog):
    return set(normalizar_lista(lista_scala)) == set(normalizar_lista(lista_prolog))
    # se convierte la lista en conjunto y se compara para ver si tienen los mismos elementos

INTERESES = ("historia", "playa", "gastronomia", "aventura" , "naturaleza")


def pedir_nombre():
    while True:
        nombre = input("Nombre: ").strip()
        if nombre and " " not in nombre:
            return nombre
        print("Escribe un nombre sin espacios, por ejemplo Ana")


def pedir_entero(mensaje):
    while True:
        texto = input(mensaje).strip()
        try:
            valor = int(texto)
        except ValueError:
            print("Escribe solo numeros enteros, por ejemplo 900")
            continue
        if valor > 0:
            return valor
        print("El valor debe ser mayor que cero")


def pedir_interes():
    print("Intereses disponibles: " + ", ".join(INTERESES))
    while True:
        interes = input("Interes: ").strip().lower()
        if interes in INTERESES:
            return interes
        print("Interes no valido")