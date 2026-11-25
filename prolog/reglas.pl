% reglas.pl - Reglas de recomendacion

% El viajero puede pagar un destino si su presupuesto alcanza el costo exacto.
puede_pagar(Viajero, Destino) :-
    presupuesto(Viajero, Monto),
    destino(Destino, _, Costo),
    Costo =< Monto.

recomendar(Viajero, Destino) :-
    interes(Viajero, TipoInteres),
    destino(Destino, TipoInteres, _),
    puede_pagar(Viajero, Destino).

% Dos destinos distintos son cercanos si estan en el mismo departamento.


cercano(Destino, Otro) :-
    en_departamento(Destino, Departamento),
    en_departamento(Otro, Departamento),
    Destino \== Otro.

% Sugerencia: un destino cercano a uno recomendado, que el viajero tambien puede
% pagar (cualquier tipo de interes) y que todavia no esta en sus recomendaciones.


sugerido_cerca(Viajero, Destino, Otro) :-
    recomendar(Viajero, Destino),
    cercano(Destino, Otro),
    puede_pagar(Viajero, Otro),
    \+ recomendar(Viajero, Otro).
