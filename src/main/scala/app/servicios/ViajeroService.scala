package app.servicios

import app.modelos.Viajero

object ViajeroService {

  def mostrar(viajero: Viajero): Unit =
    println(s"Viajero: ${viajero.nombre} | Presupuesto: ${viajero.presupuesto} | Interés: ${viajero.interes}")

  def nivelPresupuesto(viajero: Viajero): String = viajero.presupuesto match {
    case p if p < 500  => "bajo"
    case p if p < 1000 => "medio"
    case _             => "alto"
  }
}