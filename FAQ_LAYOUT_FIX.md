# Corrección del despliegue de preguntas frecuentes

La posición visual cerrada de la sección permanece intacta.

Al abrir una o varias respuestas:

- el parche, el póster, el cóctel y el encabezado de preguntas frecuentes permanecen anclados en su posición original;
- la altura de la sección aumenta únicamente por la altura real de las respuestas visibles;
- los dos botones se desplazan hacia abajo en la misma medida;
- la imagen de utensilios se desplaza junto con los botones;
- las respuestas no pueden quedar debajo de los botones ni sobre los utensilios;
- al cerrar las respuestas, todos los elementos inferiores regresan a su posición inicial.

Validaciones realizadas:

- TypeScript: aprobado con `tsc --noEmit`.
- ESLint: aprobado sin advertencias ni errores.
