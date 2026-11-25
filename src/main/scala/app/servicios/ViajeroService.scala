package app.servicios

import app.modelos.Viajero

object ViajeroService {

  def nivelPresupuesto(viajero: Viajero): String = viajero.presupuesto match {
    case p if p < 500  => "bajo"
    case p if p < 1000 => "medio"
    case _             => "alto"
  }
}