% consultas.pl - Carga el sistema y define consultas de ejemplo

:- consult(hechos).
:- consult(reglas).

mostrar_recomendaciones(Viajero) :-
    findall(Destino, recomendar(Viajero, Destino), Lista),
    write('Recomendaciones para '), write(Viajero), write(': '),
    write(Lista), nl.
