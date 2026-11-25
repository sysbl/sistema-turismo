% integracion.pl - Carga el sistema para la integracion con Python (Avance 2).
% Declara como dinamicos los hechos del viajero para poder agregarlos con assertz
% desde Python, sin modificar hechos.pl ni reglas.pl.

:- dynamic presupuesto/2, interes/2.

:- consult(hechos).
:- consult(reglas).
