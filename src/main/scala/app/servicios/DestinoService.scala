package app.servicios

import app.modelos.{Destino, Viajero}

object DestinoService {

  def accesibles(destinos: List[Destino], viajero: Viajero): List[Destino] =
    destinos.filter(destino => destino.costo <= viajero.presupuesto)

  def recomendar(destinos: List[Destino], viajero: Viajero): List[Destino] =
    accesibles(destinos, viajero).filter(destino => destino.tipo == viajero.interes)

  def mensaje(recomendados: List[Destino]): String = recomendados match {
    case Nil         => "No hay destinos para ese presupuesto e interés"
    case List(unico) => s"Te recomendamos: ${unico.nombre}"
    case varios      => s"Te recomendamos: ${varios.map(destino => destino.nombre).mkString(", ")}"
  }
}