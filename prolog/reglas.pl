% reglas.pl - Reglas de recomendación

puede_pagar(Viajero, Destino) :-
    presupuesto(Viajero, NivelViajero),
    destino(Destino, _, NivelDestino),
    nivel_valor(NivelViajero, ValorViajero),
    nivel_valor(NivelDestino, ValorDestino),
    ValorDestino =< ValorViajero.

recomendar(Viajero, Destino) :-
    interes(Viajero, Tipo),
    destino(Destino, Tipo, _),
    puede_pagar(Viajero, Destino).
