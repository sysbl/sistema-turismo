package app

import scala.io.Source
import app.modelos.{Destino, Viajero}
import app.servicios.{DestinoService, ViajeroService}

object Integracion {
  def main(args: Array[String]): Unit = {
    val viajero = Viajero(args(0), args(1).toInt, args(2))

    val lineas = Source.fromFile("data/destinos.txt").getLines().toList
    val destinos = lineas
      .filter(linea => linea.trim.nonEmpty)
      .drop(1)
      .map { linea =>
        val partes = linea.split(",")
        // partes(1) es el departamento: lo usan Python y la web, Scala no lo necesita
        Destino(partes(0).trim, partes(2).trim, partes(3).trim.toInt)
      }

    val recomendados = DestinoService.recomendar(destinos, viajero)
    val nivel = ViajeroService.nivelPresupuesto(viajero)
    val nombres = recomendados.map(destino => destino.nombre_destino).mkString(",")
    println(s"RESULTADO|nivel=$nivel|destinos=$nombres")
  }
}