# SGR-BIZ01-frontend

Este es el proyecto frontend para la consola de administración **Conecta Biz / Bizpartner**, construido utilizando **React 18**, **PrimeReact** y **Formik**.

---

## 📑 Índice

- [🎨 Guía de Paleta de Colores](#-guía-de-paleta-de-colores)
- [🔤 Guía de Tipografía](#-guía-de-tipografía)
- [🔲 Guía de Botones y Formas](#-guía-de-botones-y-formas)
- [🧩 Componentes y Patrones Adicionales](#-componentes-y-patrones-adicionales)
- [✅ Checklist de Unificación Pendiente](#-checklist-de-unificación-pendiente)
- [🚀 Comandos del Proyecto](#-comandos-del-proyecto)
- [🛠️ Tecnologías Principales](#️-tecnologías-principales)

---

## 🎨 Guía de Paleta de Colores

Para mantener la consistencia en el diseño y respetar la identidad de marca, se definen dos especificaciones de paletas de colores: una para el Login (acceso externo) y otra para la Aplicación Interna (consola de administración).

### 1. Paleta de Inicio de Sesión (Login)

Esta paleta define los colores aplicados en la pantalla de acceso del sistema para crear una experiencia de bienvenida profesional y enfocada.

| Color | Hex | Uso recomendado | Variable SCSS |
| :--- | :--- | :--- | :--- |
| **Navy oscuro** | `#2e4878` | Texto de marca, fondo navy | `$color-navy` |
| **Gris acero** | `#9198a7` | Texto secundario, labels | `$color-gris-acero` |
| **Azul grisáceo medio** | `#646e8c` | Tono de transición / divisores | `$color-divisor` |
| **Azul vivo** | `#0e71ae` | Acentos, enlaces, botón principal | `$color-azul-vivo` |
| **Azul muy claro** | `#d0e5f0` | Fondos sutiles, hover claro, círculos de iconos, botones tonales | `$color-azul-tonal` |


#### Referencia Visual de la Paleta de Login:
![Paleta de Colores del Login](file:///C:/Users/CAMARENA/.gemini/antigravity-ide/brain/a1f4ee77-1ee6-4e87-9f51-343beedb675b/media__1782156561601.png)

---

### 2. Paleta Interna de la Aplicación

Esta paleta rige el diseño de los paneles, sidebars, tablas, estados y botones interactivos dentro del sistema de administración una vez iniciada la sesión.

| Color | Hex | Uso recomendado | Variable SCSS |
| :--- | :--- | :--- | :--- |
| **Navy (marca)** | `#2e4878` | Sidebar completo, header de marca, títulos de pantalla | `$color-navy` |
| **Azul vivo (acento único)** | `#0e71ae` | Todos los botones de acción primaria, íconos de "ver"/"editar", enlaces | `$color-azul-vivo` |
| **Azul tonal** | `#d0e5f0` | Botones secundarios/tonales (ej. "Buscar"), fondos de íconos en círculo | `$color-azul-tonal` |
| **Gris acero** | `#9198a7` | Texto secundario, placeholders de "Buscar...", íconos inactivos en el sidebar | `$color-gris-acero` |
| **Verde estado activo** | `#1d9e75` | Badge de "Activo" (para lectura rápida de estado) | `$color-verde-activo` |
| **Rojo eliminar** | `#dd4b39` | Botones de eliminar (se mantiene igual, no tocar) | `$color-rojo-eliminar` |
| **Gris muy claro** | `#f8f9fa` | Fondo de encabezados de tabla, filas alternas, estados vacíos | `$color-gris-fondo` |

#### Referencia Visual de la Paleta Interna:
![Paleta de Colores de la Aplicación](file:///C:/Users/CAMARENA/.gemini/antigravity-ide/brain/a1f4ee77-1ee6-4e87-9f51-343beedb675b/media__1782157197032.png)

#### Ejemplo de Interfaz Interna con Colores Aplicados:
![Ejemplo de Interfaz de la Aplicación](file:///C:/Users/CAMARENA/.gemini/antigravity-ide/brain/a1f4ee77-1ee6-4e87-9f51-343beedb675b/media__1782157167705.png)

---

## 🔤 Guía de Tipografía

| Elemento | Tamaño | Peso | Variable SCSS | Dónde se usa |
| :--- | :--- | :--- | :--- | :--- |
| H1 — Título de pantalla | `28px` | `700` | `$font-h1` | "Gestión Consultores", "Reportes", "Datos del Consultor" |
| H2 — Saludo de header | `18px` | `600` | `$font-h2` | "Hola, admin1" |
| H3 — Encabezado de sección | `15px` | `700` | `$font-h3` | "Especializaciones", "Datos Generales" |
| Encabezado de columna/tabla | `13px` | `600` | `$font-table-head` | "Nombres", "Apellido Paterno" |
| Cuerpo / celda de tabla | `14px` | `400` | `$font-body` | Datos de filas |
| Label de campo de formulario | `13px` | `600` | `$font-label` | "Nombres", "Tipo documento de Identidad" |
| Valor dentro de input/select | `14px` | `400` | `$font-input` | Texto ingresado por el usuario |
| Texto de botón | `14px` | `600` | `$font-button` | "Guardar cambios", "Buscar" |
| Placeholder / texto de ayuda | `13px` | `400` | `$font-placeholder` | "Buscar...", "Seleccione el Tipo de Reporte" |

> ℹ️ A diferencia de los colores (valores exactos de pixel), estos tamaños son una **estimación visual estandarizada** a partir de capturas de pantalla, no una extracción exacta. Valida con DevTools → Inspeccionar elemento si necesitas el valor preciso de tu CSS actual.

```scss
$font-family-display: 'Poppins', sans-serif;       // Títulos, botones, marca
$font-family-body: 'Inter', system-ui, sans-serif;  // Tablas, inputs, texto de cuerpo
```

**Por qué dos familias:** Poppins (la del logo) tiene formas geométricas circulares que a tamaños pequeños (13-14px) en tablas con mucha data reducen la legibilidad. Se reserva para elementos de bajo volumen de texto y alto impacto visual (títulos, botones, marca); el resto usa una fuente neutra optimizada para lectura densa.

---

## 🔲 Guía de Botones y Formas

| Componente | Forma | Radio | Alto | Variable SCSS | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Botón primario (interno) | Rectángulo redondeado | `8px` | `40px` | `$radius-btn` | bg `$color-azul-vivo`, texto blanco |
| Botón secundario/tonal | Rectángulo redondeado | `8px` | `40px` | `$radius-btn` | bg `$color-azul-tonal`, texto `$color-azul-vivo` |
| Botón outline | Rectángulo redondeado | `8px` | `40px` | `$radius-btn` | borde `$color-azul-vivo`, fondo transparente |
| Ícono de acción (ver/editar/eliminar) | **Cuadrado redondeado** | `8px` | `32px` | `$radius-icon-btn` | ver: `$color-azul-tonal` · editar: `$color-azul-vivo` · eliminar: `$color-rojo-eliminar` |
| Botón adjunto a input (calendario) | Cuadrado redondeado | igual al input | igual al input | `$radius-input` | bg `$color-azul-vivo`, ícono blanco |
| Botón del Login (excepción) | Píldora | `24px` | `44px` | `$radius-pill` | Solo aplica a la pantalla de login — el resto del sistema NO usa píldora |

> 🔴 **Hallazgo de auditoría:** "Gestión Consultores" usa íconos de acción **circulares**, mientras que "Socios", "Tickets" y "Datos del Consultor" usan **cuadrado redondeado**. La forma cuadrada es la predominante (3 pantallas vs. 1) y debe ser el estándar único.

```scss
$radius-btn: 8px;
$radius-icon-btn: 8px;
$radius-input: 8px;   // Paneles internos
$radius-pill: 24px;   // Exclusivo del login
```

---

## 🧩 Componentes y Patrones Adicionales

| Componente | Especificación |
| :--- | :--- |
| Paginación — página activa | Círculo relleno `$color-azul-tonal`, texto `$color-azul-vivo`, negrita |
| Paginación — páginas inactivas | Texto `$color-gris-acero`, sin fondo |
| Estado vacío (ej. "Vista Previa de Resultados") | Fondo `$color-gris-fondo`, ícono de info gris, texto centrado `$color-gris-acero` |
| Indicador de campo obligatorio | Asterisco rojo `*` después del label, color `$color-rojo-eliminar` |
| Botón "volver" (breadcrumb) | Ícono circular outline neutro, ubicado antes del H1, sin relleno |
| Estado activo del sidebar | Fondo `$color-azul-tonal` + borde izquierdo de `3px` en `$color-azul-vivo` |
| Input de búsqueda por columna (tabla) | Mismo radio que `$radius-input`, alto reducido (`32px` vs `40px` del input estándar) |

---

## 🚀 Comandos del Proyecto

En el directorio del proyecto, puedes ejecutar:

### `npm start`
Ejecuta la aplicación en modo de desarrollo en el puerto **3006**.<br>
Abre [http://localhost:3006](http://localhost:3006) para verla en el navegador.

### `npm run build`
Compila la aplicación para producción en la carpeta `build`. Se optimiza y minifica el código para lograr el mejor rendimiento.

---

## 🛠️ Tecnologías Principales

- **React** (v18.2.0)
- **PrimeReact** (v9.0.0) como biblioteca de componentes UI
- **Formik & Yup** para gestión y validación de formularios
- **Sass** para estilos modulares
