package app

import app.modelos.{Destino, Viajero}
import app.servicios.{DestinoService, ViajeroService}

object Main extends App {

  val destinos = List(
    Destino("Cusco", "historia", 800),
    Destino("Arequipa", "historia", 450),
    Destino("Machu Picchu", "historia", 1300),
    Destino("Mancora", "playa", 600),
    Destino("Paracas", "playa", 400),
    Destino("Lima", "gastronomia", 500),
    Destino("Huaraz", "aventura", 550),
    Destino("Iquitos", "naturaleza", 1200)
  )

   val viajeros = List(
    Viajero("Ana", 900, "historia"),
    Viajero("Luis", 450, "historia"),
    Viajero("Carla", 1500, "playa"),
    Viajero("Diego", 600, "aventura"),
    Viajero("Sofia", 1300, "naturaleza")
  )

  viajeros.foreach { viajero =>
    ViajeroService.mostrar(viajero)
    println(s"Nivel de presupuesto: ${ViajeroService.nivelPresupuesto(viajero)}")
    val recomendados = DestinoService.recomendar(destinos, viajero)
    println(DestinoService.mensaje(recomendados))
    println()
  }
}