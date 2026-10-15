# Spec Delta

## Purpose

Reglas de cálculo del voto cuadrático de la plataforma: cuánto cuesta votar, qué reparto es válido, cómo se suma el resultado de un grupo y cómo se reparte un presupuesto según ese resultado. Son independientes de la pantalla para poder usarse en el Fogón, en el servidor y, más adelante, en otros mecanismos.

## ADDED Requirements

### Requirement: Costo cuadrático
Poner *n* votos (a favor o en contra) a una opción SHALL costar *n²* créditos. El costo de un reparto SHALL ser la suma de los costos de sus opciones.

#### Scenario: Tres votos
- **WHEN** una persona pone 3 votos a una opción
- **THEN** esa opción le cuesta 9 créditos

#### Scenario: Reparto completo
- **WHEN** una persona pone 5, 5 y 3 votos a tres opciones
- **THEN** el reparto cuesta 59 créditos y le quedan 41 de 100

### Requirement: Reparto válido
A reparto SHALL be valid only if every vote count is an integer, every option belongs to the consultation, its total cost is at most the consultation credits (100), and negative votes appear only when the consultation allows votes against. An invalid reparto MUST be rejected whole, with the reason.

#### Scenario: Se pasa de los créditos
- **WHEN** una persona pone 7, 7 y 2 votos (102 créditos)
- **THEN** el reparto se rechaza con el motivo "te pasás de los créditos" y no se guarda nada

#### Scenario: Votos en contra apagados
- **WHEN** la consulta no permite votos en contra y el reparto trae −2 en una opción
- **THEN** el reparto se rechaza

#### Scenario: Votos en contra permitidos
- **WHEN** la consulta permite votos en contra y el reparto trae −2 en una opción y 4 en otra
- **THEN** el reparto es válido y cuesta 20 créditos

#### Scenario: Opción ajena o no entera
- **WHEN** el reparto trae una opción que no es de la consulta, o 1,5 votos
- **THEN** el reparto se rechaza

### Requirement: Créditos iguales para todas las personas
Every person SHALL receive the same number of credits (100) in each consultation; credits MUST NOT depend on role, plan, contribution or money, MUST NOT be transferable, and MUST NOT carry over between consultations.

#### Scenario: Inversor y explorador
- **WHEN** una persona con Pase Fundador y una persona exploradora abren la misma consulta
- **THEN** las dos tienen 100 créditos

### Requirement: Agregado por votos
The group result SHALL add up votes (not credits) per option across the last valid reparto of each person. For each option it SHALL report net votes, the number of people who supported it (positive votes) and, if votes against are allowed, the number who voted against.

#### Scenario: Dos personas
- **WHEN** una persona reparte A 4 y B 2, y otra reparte A 2, B 1 y C 1
- **THEN** A tiene 6 votos y 2 personas que la apoyaron, B tiene 3 votos y 2 personas, y C tiene 1 voto y 1 persona

### Requirement: Porcentaje por opción
The percentage of an option SHALL be its share of the sum of positive net votes, shown as whole numbers that add up to 100 (largest remainder). Options with zero or negative net votes SHALL show 0 %. Without any positive vote the percentages MUST be "sin dato", never 0.

#### Scenario: Seis, tres y uno
- **WHEN** A tiene 6 votos, B 3 y C 1
- **THEN** A tiene 60 %, B 30 % y C 10 %

#### Scenario: Sin votos
- **WHEN** nadie repartió todavía
- **THEN** cada opción muestra "sin dato" en lugar del porcentaje

### Requirement: Orden del resultado
Options in a result SHALL be ordered by net votes (descending), then by number of supporters (descending), then by their original order in the consultation.

#### Scenario: Empate
- **WHEN** A y B tienen 5 votos, A con 1 persona y B con 3
- **THEN** B aparece antes que A

### Requirement: Reparto de presupuesto proporcional
In budget mode the amount SHALL be split in proportion to positive net votes, in whole cents, with the rounding remainder assigned by largest remainder so the parts add up exactly to the amount assigned. Options without positive net votes SHALL get nothing.

#### Scenario: Sin tope ni piso
- **WHEN** el monto es USD 10.000 y A tiene 6 votos, B 3 y C 1
- **THEN** A recibe USD 6.000, B USD 3.000 y C USD 1.000

### Requirement: Tope y piso
An option MAY have a cap (what it asks for) and a floor. The split SHALL never give an option more than its cap nor, if it has positive votes, less than its floor; what is freed SHALL be redistributed among the remaining options in proportion to their votes. Money that no option can take SHALL be reported as unassigned.

#### Scenario: Tope
- **WHEN** el monto es USD 10.000, A tiene 6 votos con tope USD 5.000, B 3 votos y C 1 voto
- **THEN** A recibe USD 5.000, B USD 3.750 y C USD 1.250

#### Scenario: Piso
- **WHEN** el monto es USD 10.000, A tiene 6 votos, B 3 votos y C 1 voto con piso USD 2.000
- **THEN** C recibe USD 2.000, A USD 5.333,33 y B USD 2.666,67

#### Scenario: Todos topados
- **WHEN** el monto es USD 10.000 y A, B y C tienen votos y tope USD 1.000 cada una
- **THEN** cada una recibe USD 1.000 y quedan USD 7.000 sin asignar

#### Scenario: Pisos imposibles
- **WHEN** los pisos de las opciones con votos suman más que el monto
- **THEN** el reparto no aplica ningún piso y avisa "Los pisos suman más que el monto: no se aplicaron"

### Requirement: Monto que falta
If the budget amount is unknown, every allocated amount MUST be "sin dato", never 0 or an invented value; the same applies when there are no positive votes yet.

#### Scenario: Presupuesto sin monto
- **WHEN** una consulta de presupuesto no tiene monto cargado
- **THEN** cada opción muestra "sin dato" en lugar de un monto
