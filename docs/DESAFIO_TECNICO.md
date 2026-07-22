# Plataforma SSCatFacts

Julio 2026

Para los cat lovers no hay nada mejor que aprender más de sus queridas mascotas. La Plataforma SSCatFacts consiste en una aplicación web que vas a desarrollar de acuerdo con los siguientes requerimientos y características.

## Requerimientos Funcionales (50 pts)

1. Los usuarios deben poder registrarse en la plataforma. (10 pts)
   a. Verificar username único.
   b. Verificar contraseña de 8 o más caracteres.
2. Los usuarios registrados deben poder ingresar a la plataforma. (10 pts)
3. Los usuarios ingresados pueden consultar y marcar un cat Fact para indicar que les gusta. (10 pts)
4. Los usuarios ingresados deben poder ver una lista de los cat Facts que les ha gustado. (10 pts)
5. Los usuarios ingresados deben poder visualizar los cat Facts más populares de la comunidad. (10 pts)

## Requerimientos No Funcionales (50 pts)

### Arquitectura y Servicios

Para hacer esto tenemos las siguientes condiciones:

1. El backend de la plataforma debe consumir la [API de cat facts](https://catfact.ninja/). (20 pts)
2. Desacople de frontend y backend. (20 pts)
3. Usar una base de datos relacional. (10 pts)

### Calidad de Desarrollo (50 pts)

Se evaluarán los siguientes criterios de calidad del proyecto:

1. Documentación para levantar Entorno, y decisiones de Diseño. Si hubo algo que es importante entender sobre cómo implementaste tu producto, ¡cuéntanos! (10 pts)
2. Buenas prácticas de diseño de software como SOLID. Si incluiste otras buenas prácticas que quieras hacer notar, no dudes en documentarlo. (20 pts)
3. Tests. (10 pts)
4. Integrar herramienta de _linter_ a frontend y backend. (5 pts)
5. Buenas prácticas de manejo de git. (5 pts)
   a. Usar alguna convención de ramas como [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/index.es_ES.html) (Si conoces otra, no dudes en documentarlo).
   b. Commits o introducción de cambios pequeños.

## Bonus

Los siguientes son requerimientos adicionales que puedes incluir como bonus:

1. Usar docker + docker-compose para deploy en local. (5 pts)
2. Implementar limit rating para inicio de sesión. (10 pts)
3. Implementar inicio de sesión con Autenticación en dos Pasos. (2FA) (15 pts)
4. Pipelines de Github Actions para correr tests y/o linter. (5 pts)
5. Pipelines de Github Actions para ejecutar deploy. (5 pts)
6. Deploy. (5 pts)
7. Para el Frontend implementar la librería de estilos [tailwind css](https://tailwindcss.com/). (10 pts)
8. Diagramas UML de tu sistema (10 pts):
   a. Diagrama de Secuencia. (3pts)
   b. Diagrama de Despliegue. (3 pts)
   c. Diagrama Entidad - Relación. (2 pts)
   d. Diagrama de Clases / Diagrama de Componentes. (1 pt)
   e. Diagrama de Casos de uso / Otros Diagramas UML. (1 pt)

## Entregable

Se debe entregar lo siguiente:
· URL a repositorio (o repositorios si se hicieron muchos) público.
· En el repositorio debe estar presente el código fuente y toda la documentación que hayan agregado al proyecto.
