% hechos.pl - Base de conocimientos

% destino(Nombre, Tipo, NivelCosto)
destino(cusco, historia, medio).
destino(arequipa, historia, bajo).
destino(machu_picchu, historia, alto).
destino(mancora, playa, medio).
destino(paracas, playa, bajo).
destino(lima, gastronomia, medio).
destino(huaraz, aventura, medio).
destino(iquitos, naturaleza, alto).

% presupuesto(Viajero, Nivel)
presupuesto(ana, medio).
presupuesto(luis, bajo).
presupuesto(carla, alto).
presupuesto(diego, medio).
presupuesto(sofia, alto).

% interes(Viajero, Tipo)
interes(ana, historia).
interes(luis, historia).
interes(carla, playa).
interes(diego, aventura).
interes(sofia, naturaleza).

% nivel_valor(Nivel, Numero)
nivel_valor(bajo, 1).
nivel_valor(medio, 2).
nivel_valor(alto, 3).
