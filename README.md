# Sistema de Recomendación de Destinos Turísticos del Perú

Proyecto del curso **Lenguajes de Programación** (UTP), desarrollado con **Scala**, **Prolog** y **Python**.

El sistema recomienda destinos turísticos del Perú según el **presupuesto** y el **interés** de cada viajero.

- **Avance 1:** módulos de Scala (programación funcional) y Prolog (programación lógica). El programa independiente de Scala (`Main.scala`) ya no está en el proyecto; se conserva en el tag `avance2` de Git.
- **Avance 2:** integración con Python, que pide los datos, llama a Scala y a Prolog y compara sus resultados.

## Estructura del proyecto

```
sistema-turismo/
├── python/
│   ├── main.py             (menú y flujo principal)
│   ├── utils.py            (validación de datos y comparación de resultados)
│   ├── scala_service.py    (ejecuta Scala y lee su respuesta)
│   ├── prolog_service.py   (ejecuta Prolog y lee su respuesta)
│   └── servidor.py         (servidor Flask de la página web)
├── src/main/scala/app/
│   ├── Integracion.scala   (Avance 2: punto de entrada para Python)
│   ├── modelos/
│   │   ├── Destino.scala
│   │   └── Viajero.scala
│   └── servicios/
│       ├── DestinoService.scala
│       └── ViajeroService.scala
├── prolog/
│   ├── hechos.pl           (destinos con costo, departamentos)
│   ├── reglas.pl           (puede_pagar, recomendar, cercano, sugerido_cerca)
│   └── integracion.pl      (Avance 2: carga hechos y reglas para Python)
├── data/
│   └── destinos.txt        (lo leen Integracion.scala, main.py y la web)
├── web/                    (página para turistas: index.html, css, js, img)
├── build.sbt
├── project/build.properties
└── README.md
```

## Cómo funciona (Avance 2)

1. `main.py` pide nombre, presupuesto e interés, y valida los datos.
2. Python ejecuta Scala con esos datos como argumentos (`sbt -batch "runMain app.Integracion ..."`). Scala imprime una línea `RESULTADO|nivel=...|destinos=...`.
3. Python lee esa línea y obtiene el nivel de presupuesto (solo como etiqueta) y los destinos recomendados por Scala.
4. Python ejecuta Prolog (`swipl`) pasándole el presupuesto y el interés. Prolog imprime sus destinos recomendados y, además, **destinos cercanos** (del mismo departamento, de cualquier interés) que el viajero también puede pagar.
5. Python normaliza ambas listas y muestra si **Scala y Prolog coinciden**. Los cercanos se muestran bajo cada destino recomendado.

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

### Página web

```
pip install flask
python python\servidor.py
```

Abrir `http://localhost:5000/`. Cada búsqueda tarda unos segundos porque sbt arranca en cada llamada. Con `?tecnico=1` al final de la dirección se ve el detalle de Scala y Prolog, y `sistema.html` explica el funcionamiento.

## Resultados esperados

| Viajero | Presupuesto | Interés | Nivel | Recomendación |
|---|---|---|---|---|
| Ana | 900 | historia | medio | Centro historico, Valle Sagrado |
| Luis | 450 | historia | bajo | Centro historico |
| Carla | 1500 | playa | alto | Paracas, Mancora |
| Diego | 600 | aventura | medio | Misti, Montana de Siete Colores, Huaraz |
| Sofía | 1300 | naturaleza | alto | Colca, Parque Huascaran, Iquitos |

## Nota sobre ambos módulos

Scala y Prolog usan el **mismo criterio**: el costo exacto del destino debe ser menor o igual al presupuesto. Los costos viven en `data/destinos.txt` y en `prolog/hechos.pl`, y deben ser iguales. Los niveles (bajo, medio, alto) solo se usan como etiqueta del presupuesto.

## Trabajo pendiente (Proyecto Final)

- Completar las pruebas.
- Agregar más reglas de recomendación.
- Integrar el sistema con un chatbot de Telegram.
