# Sergio's Landscaping — App de Riego: Guía de uso

Una guía en lenguaje sencillo para la oficina y el equipo de campo. La misma
guía está disponible dentro de la app (**Más → Guía de uso**, o **Guía de uso**
en la barra lateral).

> 🇺🇸 English version: [`USER_GUIDE.md`](USER_GUIDE.md)

---

## Qué hace la app

Convierte una **inspección** de riego en campo en una **cotización** con precios
y una **orden de trabajo** aprobada por el admin — una sola app con dos caras:

- **Cara de campo** (teléfono/tablet): el técnico captura la inspección.
- **Cara de oficina** (escritorio): la oficina cotiza, aprueba y da seguimiento.

Funciona **sin conexión** en el campo y se sincroniza al reconectar.

---

## Iniciar sesión

Abre la app, elige tu cuenta y selecciona tu idioma con los botones
**Español / English** en la tarjeta de inicio de sesión — **tu elección se
mantiene al entrar a la app**. Escribe tu contraseña y toca **Iniciar sesión**.
(Ya adentro, puedes cambiar el idioma en cualquier momento desde la barra
superior.) En modo demo — antes de conectar una base de datos — cualquier
contraseña funciona.

---

## Tu panel

Al iniciar sesión llegas a tu **panel**. La lista **Requiere tu atención** es
personal:

- **Técnicos / líderes** ven solo *sus propios* trabajos que necesitan acción —
  los **devueltos** para rehacer, los **borradores** por terminar, y sus
  **órdenes aprobadas / en progreso** por realizar.
- **Oficina / admin** ven lo que necesita la oficina — **enviadas / en revisión**
  por revisar, luego **aprobadas** por programar.

Un **globo con el número** en la pestaña **Panel** (barra lateral en escritorio,
pestaña inferior en el teléfono) muestra cuántos elementos te esperan — incluido
un trabajo que te acaban de **reasignar**. Cuando no hay pendientes dice *Estás
al día.*

---

## Técnico de campo — capturar una inspección

1. **Nueva inspección** (el botón ＋). Escribe un nombre para **buscar clientes
   existentes**, o ingresa uno nuevo. Escribe la dirección para **elegirla de
   Google**, o toca **Usar mi ubicación** para llenarla por GPS.
2. **Vista del sistema** — marca/modelo del controlador, antisifón, presión
   estática, sensor de lluvia. El **número de estaciones crea esa cantidad de
   zonas** automáticamente.
3. **Zonas** es el punto base. Abre cada zona y:
   - marca qué riega (pasto/jardineras) y los tipos de cabezas,
   - toca **Agregar problema** → elige el problema → responde el detalle (p. ej.
     tipo de cabeza) → indica la cantidad y la gravedad → agrega una **foto**. El
     **precio aparece solo**.
4. Agrega **problemas generales** (controlador, antisifón, presión) desde las
   Zonas.
5. Opcional: abre el **Mapa del sitio** desde las Zonas para ver la propiedad
   desde arriba — elige una zona, **dibuja su cobertura** y coloca **aspersores**.
   Toca una forma o pin para seleccionarlo, luego **Eliminar**. **Guarda el
   mapa** al terminar.
6. Toca **Revisar y cotizar**. Pide al **cliente que firme** para aprobar el
   estimado, luego **Enviar a revisión**.

Los precios se pueden ocultar por persona (un técnico sin el permiso de "ver
precios" nunca ve montos).

---

## Oficina / admin — cotizar y órdenes de trabajo

1. Las inspecciones enviadas aparecen en **Trabajos** (con conteos en el panel).
   Al abrir una se marca **en revisión**.
2. Abre una para llegar al **editor de cotización**:
   - ajusta las líneas; agrega piezas / mano de obra / ensambles / compras
     locales,
   - marca cada línea como **en cotización / diferido / rechazado**,
   - el lado derecho muestra piezas, mano de obra, costo, **margen** y total,
   - las **firmas del cliente se muestran (solo lectura) con su fecha**.
3. **Reasigna** el trabajo a otro técnico con el selector **Asignado a** — pasa a
   la cola del panel de esa persona.
4. **Aprobar → crea una orden de trabajo** (el único punto de control
   deliberado).
5. **Iniciar trabajo**, luego **Marcar completado** y captura la **firma de
   finalización** del cliente.
6. **Imprime** cualquiera de los cuatro documentos (ver *Documentos
   imprimibles* abajo).

La facturación posterior a completar un trabajo la maneja la oficina, fuera de
la app.

**Ciclo de vida:** borrador → (el cliente firma) enviado → en revisión →
aprobado (orden de trabajo) → en progreso → completado.

---

## Documentos imprimibles

Desde la pantalla **Revisar** de cualquier trabajo, los botones debajo de los
totales abren documentos con marca que puedes **imprimir o guardar como PDF** —
uno por etapa:

| Documento | Muestra | Disponible |
| --- | --- | --- |
| **Reporte de inspección** | Vista del sistema, zonas, hallazgos (gravedad + notas), fotos — sin precios | Siempre |
| **Estimado** | Líneas con precio + trabajos para visita futura + la **firma de aprobación del cliente y la fecha** | Cuando puedes ver precios |
| **Orden de trabajo** | La lista de tareas del equipo (trabajo · cantidad · una casilla **Hecho** para marcar en campo), más la nota de aprobación — sin precios al cliente | Una vez aprobado |
| **Certificado de finalización** | Trabajo completado + la **firma de finalización y la fecha** | Una vez completado |

Cada uno abre en una página limpia; toca **Imprimir / guardar PDF** (elige
"Guardar como PDF" en el diálogo de impresión para enviarlo por correo o
archivarlo).

---

## Clientes e historial de trabajos

Abre **Clientes** (barra lateral en escritorio, menú **Más** en el teléfono)
para ver a todos en la base de datos, con búsqueda por nombre, dirección o
ciudad. Toca un cliente para abrir su registro:

- **Historial de trabajos** — cada inspección y orden de trabajo pasada en esa
  propiedad, con la fecha, el estado, lo que se encontró y el total. Toca
  cualquier trabajo pasado para ver el detalle completo (piezas y mano de obra
  usadas) — útil para "¿qué hicimos aquí la última vez?"
- **Nueva inspección aquí** — inicia un trabajo con ese cliente ya cargado.
- Los admins pueden **eliminar** un cliente agregado por error (las inspecciones
  conservan su propia copia del nombre, así que nada queda huérfano).

---

## Corregir errores y limpieza

- Si sales de una inspección nueva **antes de capturar algo**, no queda ninguna
  entrada vacía. Lo que capturaste después de la primera pantalla se guarda como
  borrador.
- **Los admins pueden eliminar de forma permanente** una inspección/cotización —
  desde la pantalla **Revisar** o el icono de bote en una fila de **Trabajos** —
  para limpiar pruebas y errores.
- Toda **acción destructiva pide confirmación** primero.

---

## Admin — catálogo y equipo

- **Catálogo**: piezas, mano de obra, ensambles y tipos de problema. Las piezas
  se **agrupan por tipo de componente** con un filtro por categoría. Para
  **agregar una pieza**, elige su **tipo de componente** de la lista — el nombre
  se llena en **ambos idiomas automáticamente**, sin traducir a mano; luego
  captura la marca, modelo, SKU y precio (esos son iguales en cualquier idioma).
  "Otro — escríbelo" cubre un tipo que aún no está en la lista. **Cargar
  elementos iniciales** trae el catálogo inicial completo sin sobrescribir tus
  cambios. Los precios iniciales son de ejemplo — reemplázalos con los tuyos.
- **Equipo**: *solo* personas y accesos — agrega personas; define el rol y los
  interruptores de permisos (ver precios, fijar/cambiar precios, administrar
  catálogo, aprobar órdenes). Asigna o **genera una contraseña** — verás el valor
  al asignarla para poder compartirla. Las contraseñas se guardan cifradas y no
  se pueden mostrar después; reiníciala aquí cuando quieras.

## Modo de entrenamiento

Activa el **Modo de entrenamiento** (al final de la barra lateral en escritorio,
o el menú **Más** en el teléfono) para practicar con datos de ejemplo — clientes
e inspecciones en cada etapa del ciclo. Mientras está activo, aparece un aviso
arriba y **nada de lo que hagas afecta los registros reales** (no se guarda en el
servidor ni en el dispositivo). Desactívalo para volver a tus datos reales,
exactamente como los dejaste. Es la forma segura de capacitar a alguien nuevo o
probar un flujo de principio a fin — sin cargar ni borrar, sin mezclar con
clientes reales.

---

## Roles y permisos

El acceso se compone de **cuatro permisos individuales**. Un **rol** es solo un
paquete inicial de esos permisos — puedes activar o desactivar cualquier
interruptor por persona en **Equipo**.

### Los cuatro permisos

| Permiso | Qué habilita |
| --- | --- |
| **Ver precios** | Ve los montos en todos lados (líneas de cotización, totales, la propuesta). Sin él, la persona captura y trabaja pero nunca ve dinero. |
| **Fijar / cambiar precios** | Puede cambiar el precio de una línea y agregar líneas de compra local (comprar en el camino) al armar una cotización. Implica trabajar con precios, así que va junto con *Ver precios*. |
| **Aprobar órdenes de trabajo** | Puede aprobar una inspección ya cotizada y convertirla en **orden de trabajo** — el único punto de control entre "cotización" y "ir a hacer el trabajo". |
| **Administrar catálogo y admin** | Poder de admin: editar el catálogo (piezas, mano de obra, ensambles, tipos de problema), administrar el **Equipo** (agregar/quitar personas, asignar contraseñas) y **eliminar** registros (trabajos, clientes). Esto es lo que hace admin a alguien. |

### Los cuatro roles iniciales

| Rol | Ver precios | Fijar precios | Aprobar | Admin | En la práctica |
| --- | :---: | :---: | :---: | :---: | --- |
| **Técnico de campo** | — | — | — | — | Captura inspecciones y hace el trabajo; nunca ve dinero. |
| **Líder** | ✓ | — | — | — | Técnico senior que puede ver precios/cotizaciones pero no cambiarlos. |
| **Oficina** | ✓ | ✓ | — | — | Arma y cotiza trabajos. No puede autoaprobar ni eliminar — ese es el control del admin. |
| **Admin** | ✓ | ✓ | ✓ | ✓ | Todo: aprueba órdenes, administra el catálogo y el equipo, limpia registros. |

**Por qué la oficina no aprueba sus propias cotizaciones:** la aprobación es el
único punto de control entre cotizar un trabajo y comprometerse a hacerlo, así
que se mantiene separada de la cotización — un admin aprueba. Si quieres que una
persona de oficina también apruebe, solo activa su interruptor **Aprobar órdenes
de trabajo** en Equipo.

La validación es real en el servidor, no solo oculta en la pantalla — p. ej.,
eliminar un registro o editar el catálogo se rechaza para quien no tenga el
permiso de admin, incluso desde la API.

---

## Sin conexión y sincronización

La app de campo funciona sin señal — todo se guarda en el dispositivo y se
sincroniza al reconectar. La etiqueta en el panel muestra el estado
(**Sincronizado**, **Esperando sincronizar** u **Offline — guardado en el
dispositivo**).
