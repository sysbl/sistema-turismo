package app.servicios

import app.modelos.{Destino, Viajero}

object DestinoService {

  def accesibles(destinos: List[Destino], viajero: Viajero): List[Destino] =
    destinos.filter(destino => destino.costo <= viajero.presupuesto)

  def recomendar(destinos: List[Destino], viajero: Viajero): List[Destino] =
    accesibles(destinos, viajero).filter(destino => destino.tipo_interes == viajero.interes)

}