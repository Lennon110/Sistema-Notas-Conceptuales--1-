# 📝 Sistema de Gestión de Convocatoria de Notas Conceptuales 2026

Sistema web institucional para administrar el ciclo de vida completo de las **Notas Conceptuales** (Anexo 1 de la Convocatoria de investigación 2026), desarrollado con **Vue 3**, **TypeScript** y **Vite**, empaquetado en contenedores ligeros con **Docker** y **Nginx**.

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Tecnologías Utilizadas](#2-tecnologías-utilizadas)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Módulos y Reglas de Negocio](#4-módulos-y-reglas-de-negocio)
5. [Desarrollo Local (npm)](#5-desarrollo-local-npm)
6. [Despliegue con Docker y Docker Hub](#6-despliegue-con-docker-y-docker-hub)
7. [Datos Precargados (Seed Data)](#7-datos-precargados-seed-data)
8. [Capturas de Pantalla](#8-capturas-de-pantalla)

---

## 1. Descripción del Proyecto

El **Sistema de Gestión de Convocatoria de Notas Conceptuales 2026** digitaliza el formulario institucional `FOR ANEXO 1 DE LA CONVOCATORIA DE NOTAS CONCEPTUALES 2026.docm`.

El sistema permite gestionar:
* **Convocatorias**: Creación, apertura, cierre y control de vigencia.
* **Directores**: Registro de directores de proyecto asociados a departamentos institucionales.
* **Notas Conceptuales**: Registro en 6 secciones principales con catálogos dinámicos y en cascada (ODS, CINE-UNESCO, Plan Nacional de Desarrollo, etc.).
* **Consultas y Reportes**: Búsqueda avanzada por filtros y generación de estadísticas de impacto y presupuesto.

Todos los datos se gestionan mediante una arquitectura desacoplada basada en servicios y estado en memoria.

---

## 2. Tecnologías Utilizadas

| Tecnología | Rol en el Proyecto |
| --- | --- |
| **Vue.js 3** | Framework progresivo para la construcción de interfaces dinámicas |
| **TypeScript 5** | Tipado estático estricto (`strict: true`), interfaces y modelos POO |
| **Vite 5** | Bundler y servidor de desarrollo ultra-rápido |
| **CSS3 Vanilla** | Estilos institucionales personalizados y diseño responsive |
| **Docker & Multi-stage Builds** | Contenedorización optimizada con entorno de compilación Node 20 |
| **Nginx (Alpine)** | Servidor web de alto rendimiento para servir la aplicación en producción |

---

## 3. Estructura del Proyecto

```text
Sistema-Notas-Conceptuales/
├── public/                 # Recursos estáticos servidos directamente
├── src/
│   ├── assets/             # Recursos visuales (imágenes, íconos)
│   ├── classes/            # Manejo de eventos u observadores globales (EventBus)
│   ├── data/               # Catálogos estáticos (ODS, CINE, PND, Departamentos, etc.)
│   ├── enums/              # Enumeraciones de estado (EstadoNota, Cobertura, etc.)
│   ├── interfaces/         # Contratos de datos (INota, IDirector, IPresupuesto, etc.)
│   ├── models/             # Clases de dominio del modelo POO
│   ├── services/           # Lógica de negocio y repositorios en memoria
│   ├── styles/             # Hojas de estilo CSS globales e independientes
│   ├── utils/              # Funciones auxiliares y formateadores
│   ├── validators/         # Validadores de fechas, presupuestos y reglas de negocio
│   ├── views/              # Componentes de vistas principales de la aplicación
│   ├── App.vue             # Componente raíz de Vue 3
│   ├── main.ts             # Punto de entrada de la aplicación
│   └── shims-vue.d.ts      # Declaración de tipos para módulos Vue
├── .dockerignore           # Archivos ignorados en la construcción Docker
├── .gitignore              # Archivos ignorados por Git
├── Dockerfile              # Construcción multi-stage (Node + Nginx)
├── index.html              # Archivo HTML de montaje principal
├── nginx.conf              # Configuración de Nginx para SPA (Single Page Application)
├── package.json            # Dependencias y scripts del proyecto
├── tsconfig.json           # Configuración del compilador TypeScript
└── vite.config.ts          # Configuración del bundler Vite y alias de rutas (@/)
```

---

## 4. Módulos y Reglas de Negocio

### Módulos Principales
1. **Dashboard**: Métricas clave, estado de convocatorias activas y resumen de notas.
2. **Convocatorias**: Administración del período y estado de las convocatorias de investigación.
3. **Directores**: Registro y gestión de investigadores/directores.
4. **Notas Conceptuales**: Formulario estructurado en 6 secciones (Datos Generales, Alineamiento, Población Beneficiaria, Presupuesto, Cronograma, etc.).
5. **Consultas**: Búsqueda por código, director, nombre, estado o convocatoria.
6. **Reportes**: Indicadores de inversión, cobertura geográfica y sectorial.

### Reglas de Negocio Validadas
* **Período de Convocatoria**: Las notas solo pueden registrarse dentro del rango de fechas activo de la convocatoria.
* **Presupuesto**: Límite máximo de **$20,000 USD** por nota conceptual con cálculo automático por ítem (cantidad × valor unitario).
* **Población Beneficiaria**: Jerarquía estricta: `Población Objetivo ≤ Población Potencial ≤ Población Referencial`.
* **Cronograma**: Las actividades deben ejecutarse obligatoriamente dentro del rango de fechas de la nota conceptual.
* **Validación de Registro**: Confirmación de datos completos e integridad antes del estado final `REGISTRADA`.

---

## 5. Desarrollo Local (npm)

### Requisitos Previos
* **Node.js** 18+ o 20+ instalado.
* **npm** 9+ instalado.

### Comandos de Ejecución

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Iniciar servidor de desarrollo con Hot Reload
npm run dev

# 3. Compilar para producción (validación de tipos TypeScript + Vite build)
npm run build

# 4. Probar la build de producción localmente
npm run preview
```

Al ejecutar `npm run dev`, la aplicación estará disponible en `http://localhost:5173` (o el puerto indicado por Vite).

---

## 6. Despliegue con Docker y Docker Hub

El proyecto incluye un `Dockerfile` multi-stage que compila el código TypeScript/Vue en una etapa inicial con **Node 20 Alpine** y sirve los archivos estáticos resultantes mediante **Nginx Alpine**, logrando una imagen ligera, segura y eficiente.

### 1. Construir la Imagen Docker

```bash
docker build -t TU_USUARIO_DOCKERHUB/sistema-notas-conceptuales:1.0 .
```
*(Reemplaza `TU_USUARIO_DOCKERHUB` por tu nombre de usuario en Docker Hub)*.

### 2. Probar la Imagen Localmente

```bash
docker run -d \
  --name sistema-notas \
  -p 8080:80 \
  --restart unless-stopped \
  TU_USUARIO_DOCKERHUB/sistema-notas-conceptuales:1.0
```

Accede desde tu navegador web a: `http://localhost:8080`

### 3. Subir la Imagen a Docker Hub

Para hacer disponible la imagen en cualquier servidor o máquina remota:

```bash
# Iniciar sesión en Docker Hub
docker login

# Publicar la imagen etiquetada
docker push TU_USUARIO_DOCKERHUB/sistema-notas-conceptuales:1.0
```

### 4. Descargar y Ejecutar en Cualquier Otra Máquina

En cualquier servidor o equipo con Docker instalado (sin necesidad de tener Node.js ni el código fuente):

```bash
# Descargar la imagen desde Docker Hub
docker pull TU_USUARIO_DOCKERHUB/sistema-notas-conceptuales:1.0

# Ejecutar el contenedor
docker run -d \
  --name sistema-notas \
  -p 8080:80 \
  --restart unless-stopped \
  TU_USUARIO_DOCKERHUB/sistema-notas-conceptuales:1.0
```

### Comandos Útiles de Gestión Docker

```bash
# Ver estado del contenedor
docker ps

# Ver logs del servidor Nginx en tiempo real
docker logs -f sistema-notas

# Detener el contenedor
docker stop sistema-notas

# Eliminar el contenedor
docker rm sistema-notas
```

---

## 7. Datos Precargados (Seed Data)

Para facilitar las pruebas e interacción inmediata, el sistema cuenta con un servicio `SeedService` que se ejecuta al iniciar la aplicación si no existen registros:
* **Convocatoria por Defecto**: *"Convocatoria de Notas Conceptuales 2026"* (Estado `ABIERTA`, 6 meses de vigencia).
* **Directores de Ejemplo**: 2 directores vinculados a departamentos institucionales.
* **Catálogos Fijos**: Catálogos completos de ODS, CINE-UNESCO, PND y 10 Departamentos institucionales.

---



