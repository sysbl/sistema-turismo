# Sistema de Recomendación de Destinos Turísticos del Perú

Proyecto del curso **Lenguajes de Programación** (UTP), desarrollado con **Scala**, **Prolog** y **Python**.

El sistema recomienda destinos turísticos del Perú según el **presupuesto** y el **interés** de cada viajero.

- **Avance 1:** módulos de Scala (programación funcional) y Prolog (programación lógica), ejecutados de forma independiente.
- **Avance 2:** integración con Python, que pide los datos, llama a Scala y a Prolog y compara sus resultados.

## Estructura del proyecto

```
sistema-turismo/
├── python/
│   ├── main.py             (menú y flujo principal)
│   ├── utils.py            (validación de datos y comparación de resultados)
│   ├── scala_service.py    (ejecuta Scala y lee su respuesta)
│   └── prolog_service.py   (ejecuta Prolog y lee su respuesta)
├── src/main/scala/app/
│   ├── Main.scala          (Avance 1: ejecución independiente)
│   ├── Integracion.scala   (Avance 2: punto de entrada para Python)
│   ├── modelos/
│   │   ├── Destino.scala
│   │   └── Viajero.scala
│   └── servicios/
│       ├── DestinoService.scala
│       └── ViajeroService.scala
├── prolog/
│   ├── hechos.pl           (destinos, presupuestos, intereses, niveles)
│   ├── reglas.pl           (puede_pagar, recomendar)
│   ├── consultas.pl        (Avance 1: consultas de ejemplo)
│   └── integracion.pl      (Avance 2: carga hechos y reglas para Python)
├── data/
│   ├── destinos.txt        (lo lee Integracion.scala)
│   └── viajeros.txt        (viajeros de prueba del Avance 1)
├── build.sbt
├── project/build.properties
└── README.md
```

## Cómo funciona (Avance 2)

1. `main.py` pide nombre, presupuesto e interés, y valida los datos.
2. Python ejecuta Scala con esos datos como argumentos (`sbt -batch "runMain app.Integracion ..."`). Scala imprime una línea `RESULTADO|nivel=...|destinos=...`.
3. Python lee esa línea y obtiene el **nivel de presupuesto** y los destinos recomendados por Scala.
4. Python ejecuta Prolog (`swipl`) pasándole el nivel y el interés. Prolog imprime sus destinos recomendados.
5. Python normaliza ambas listas y muestra si **Scala y Prolog coinciden**.

Solo Python da órdenes: Scala y Prolog no se comunican entre sí, y todo el intercambio se hace con texto.

## Requisitos

- Python 3.15.2
- JDK 21 (Temurin)
- Scala 2.13.18
- sbt 1.12.15
- SWI-Prolog 10.1.18
- `sbt` y `swipl` deben estar disponibles en el PATH del sistema.
- IntelliJ IDEA con el plugin de Scala (opcional).

## Cómo ejecutar

### Sistema completo (Python + Scala + Prolog)

Desde la carpeta raíz del proyecto:

```
python python\main.py
```

Menú:

```
1. Recomendar destinos
2. Ver destinos disponibles
3. Salir
```

La opción 1 pide nombre, presupuesto e interés. Cada consulta tarda unos segundos porque sbt arranca en cada llamada.

### Solo Scala (Avance 1)

Desde la carpeta raíz del proyecto:

```
sbt "runMain app.Main"
```

También se puede ejecutar `app.Main` con el botón Run de IntelliJ.

### Solo Prolog (Avance 1)

1. Abrir `prolog/consultas.pl` con SWI-Prolog (doble clic). Este archivo carga `hechos.pl` y `reglas.pl`.
2. Escribir consultas en la consola, por ejemplo:

```prolog
?- recomendar(ana, D).
?- recomendar(carla, D).
?- puede_pagar(luis, cusco).
?- mostrar_recomendaciones(diego).
```

Si se modifica algún archivo `.pl`, recargar con `make.`

## Resultados esperados

| Viajero | Presupuesto | Interés | Nivel | Recomendación |
|---|---|---|---|---|
| Ana | 900 | historia | medio | Cusco, Arequipa |
| Luis | 450 | historia | bajo | Arequipa |
| Carla | 1500 | playa | alto | Máncora, Paracas |
| Diego | 600 | aventura | medio | Huaraz |
| Sofía | 1300 | naturaleza | alto | Iquitos |

## Nota sobre ambos módulos

Scala compara **montos** (costo del destino frente al presupuesto), mientras que Prolog compara **niveles** (bajo, medio, alto). Los datos se eligieron para que ambos módulos produzcan las mismas recomendaciones.

## Trabajo pendiente (Proyecto Final)

- Completar las pruebas.
- Agregar más reglas de recomendación.
- Integrar el sistema con un chatbot de Telegram.
