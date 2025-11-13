# QuePlan Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

> **QuePlan Backend** es un servidor NestJS construido con TypeScript que gestiona amigos y proporciona notificaciones en tiempo real mediante WebSockets. Utiliza PostgreSQL como base de datos y Sequelize ORM para obtener el listado.

## ��� Descripción del Proyecto

QuePlan Backend es un servidor de aplicación diseñado para:

- **Gestión de Amigos**: CRUD básico de amigos (obtener lista completa)
- **Notificaciones en Tiempo Real**: Sistema de WebSockets que escucha cambios en la base de datos PostgreSQL
- **Listener de Base de Datos**: Servicio que se conecta a PostgreSQL mediante LISTEN/NOTIFY
- **Sincronización en Vivo**: Emite eventos a clientes conectados cuando hay cambios en la BD

### Stack Tecnológico

- **Framework**: NestJS 10.x (Node.js)
- **Lenguaje**: TypeScript
- **ORM**: Sequelize 6.x + sequelize-typescript
- **Base de Datos**: PostgreSQL
- **Comunicación en Tiempo Real**: Socket.IO
- **Documentación API**: Swagger
- **Testing**: Jest
- **Contenedorización**: Docker & Docker Compose

---

## ��� Configuración del Proyecto

### Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **PostgreSQL**: v12 o superior
- **Docker** (opcional): para ejecutar en contenedores

### Instalación

```bash
# Instalar dependencias
npm install
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Base de Datos
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/queplan
PG_CHANNEL=db_changes

# Servidor
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=*
```

---

## ��� Ejecución del Proyecto

### Paso 1: Levantar PostgreSQL y pgAdmin con Docker

Antes de ejecutar la aplicación, debes iniciar PostgreSQL y pgAdmin usando Docker Compose:

```bash
# Iniciar contenedores de PostgreSQL y pgAdmin
docker compose up
```

Esto levantará:
- **PostgreSQL**: Servidor de base de datos en `localhost:5432`
- **pgAdmin**: Interfaz gráfica para gestionar PostgreSQL en `http://localhost:5050`

Para detener los contenedores:

```bash
# Detener contenedores
docker compose down
```

### Paso 2: Ejecutar la Aplicación NestJS

Una vez que PostgreSQL esté en funcionamiento, ejecuta la aplicación:


```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run start:prod

# Compilar proyecto
npm run build

# Debug
npm run start:debug
```

La aplicación se iniciará en `http://localhost:3000` y se conectará automáticamente a PostgreSQL usando la `DATABASE_URL` configurada en `.env`.

---

## ��� Testing

```bash
# Ejecutar todas las pruebas unitarias
npm run test

# Modo observación (re-ejecutar al cambiar archivos)
npm run test:watch

# Cobertura de tests
npm run test:cov

# Tests con debug
npm run test:debug

# Tests E2E
npm run test:e2e
```

### Cobertura Actual

- **FriendService**: Pruebas de éxito y manejo de errores
- **FriendController**: Validación de endpoint GET
- **DbListenerService**: Conexión, listeners, notificaciones y destrucción
- **RealtimeGateway**: Inicialización, callbacks y emisión de eventos

---

## ��� Endpoints y Funcionalidad

### REST API

#### 1. **Obtener Lista de Amigos**

```http
GET /friends
```

**Descripción**: Retorna la lista completa de amigos registrados.

**Respuesta (200 OK)**:
```json
{
  "statusCode": 200,
  "message": "Friends retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan García",
      "gender": "Masculino"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "María López",
      "gender": "Femenino"
    }
  ]
}
```

**Respuesta (500 Internal Server Error)**:
```json
{
  "statusCode": 500,
  "message": "Error retrieving friends",
  "data": null
}
```

**cURL**:
```bash
curl -X GET http://localhost:3000/friends
```

---

### WebSocket Events (Real-time)

#### 1. **Escuchar Cambios en la Base de Datos**

**Evento**: `db-change`

**Descripción**: El servidor emite este evento a todos los clientes conectados cuando hay cambios en la base de datos (INSERT, UPDATE, DELETE).

**Ejemplo de Payload**:
```json
{
  "action": "UPDATE",
  "table": "my_friends",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "oldValue": "Carlos Pérez",
  "newValue": "Alejandro García"
}
```

**Cliente JavaScript (Socket.IO)**:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('db-change', (payload) => {
  console.log('Cambio en la base de datos:', payload);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});

## ��� Arquitectura y Estructura del Proyecto

```
src/
├── app.module.ts                 # Módulo principal
├── main.ts                       # Entry point
├── common/
│   ├── gateway/
│   │   ├── realtime.gateway.ts   # Gateway WebSocket
│   │   └── realtime.gateway.spec.ts
│   ├── listener/
│   │   ├── db-listener.service.ts # Servicio de escucha a PostgreSQL
│   │   └── db-listener.service.spec.ts
│   └── common.module.ts
├── friend/
│   ├── friend.module.ts
│   ├── controllers/
│   │   ├── friend.controller.ts
│   │   └── friend.controller.spec.ts
│   └── services/
│       ├── friend.service.ts
│       └── friend.service.spec.ts
└── model/
    ├── dto/
    │   └── common/
    │       └── base-response-list.dto.ts
    └── entities/
        └── friend.ts
```

### Componentes Clave

#### **FriendService** (`src/friend/services/friend.service.ts`)
- Maneja la lógica de negocio para amigos
- Método `findAll()`: obtiene todos los amigos de la BD

#### **FriendController** (`src/friend/controllers/friend.controller.ts`)
- Define el endpoint REST `/friends GET`
- Delega en `FriendService`

#### **DbListenerService** (`src/common/listener/db-listener.service.ts`)
- Se ejecuta al inicializar el módulo (`OnModuleInit`)
- Conecta a PostgreSQL y ejecuta `LISTEN` en el canal configurado
- Emite eventos mediante callback `onChange`
- Se desconecta al destruir el módulo (`OnModuleDestroy`)

#### **RealtimeGateway** (`src/common/gateway/realtime.gateway.ts`)
- Gateway WebSocket de NestJS
- Se inyecta `DbListenerService`
- En `afterInit()` configura el callback para emitir eventos a clientes

#### **Friend Entity** (`src/model/entities/friend.ts`)
- Modelo Sequelize con decoradores de `sequelize-typescript`
- Tabla: `my_friends`
- Campos: `id` (UUID), `name`, `gender`

---

## ��� Flujo de Datos en Tiempo Real

```
PostgreSQL Database
        ↓
   NOTIFY (evento)
        ↓
DbListenerService (escucha LISTEN)
        ↓
   onChange callback
        ↓
RealtimeGateway.afterInit()
        ↓
   server.emit('db-change')
        ↓
Clientes conectados (Socket.IO)
```

---

## ��� Troubleshooting

### Conexión a PostgreSQL fallida

**Error**: `Error connecting to database`

**Solución**:
1. Verifica que PostgreSQL esté ejecutándose
2. Valida `DATABASE_URL` en `.env`
3. Comprueba credenciales y permisos

### WebSocket no recibe eventos

**Comprueba**:
1. El canal PostgreSQL en `.env` (`PG_CHANNEL`)
2. Que la aplicación esté emitiendo NOTIFY en PostgreSQL
3. CORS configurado correctamente (`CORS_ORIGIN`)

### Tests fallan

```bash
# Limpia cache de Jest
npm test -- --clearCache

# Ejecuta tests específicos
npm test -- src/friend/services/friend.service.spec.ts
```

---

## ��� Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `npm run start` | Inicia en modo producción |
| `npm run start:dev` | Inicia con hot-reload |
| `npm run start:debug` | Inicia con debugger activo |
| `npm run build` | Compila a JavaScript |
| `npm test` | Ejecuta pruebas unitarias |
| `npm run test:watch` | Pruebas en modo observación |
| `npm run test:cov` | Pruebas con cobertura |
| `npm run test:e2e` | Pruebas end-to-end |
| `npm run lint` | Valida y corrige código |
| `npm run format` | Formatea código con Prettier |

---

## ��� Recursos Útiles

- [NestJS Documentation](https://docs.nestjs.com)
- [Sequelize Documentation](https://sequelize.org)
- [Socket.IO Documentation](https://socket.io/docs)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-listen.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## ��� Créditos de IA

Este proyecto utilizó IA para:
- Crear la funcionalidad de notificación de cambios en la base de datos (listener)
- Crear emisión de evento al frontend (gateway)
- Realizar primeros pasos con el ORM Sequelize
- Generar estructura base con decoradores de sequelize-typescript
- Realizar las pruebas unitarias
- Generar documentación

---

## ��� Licencia

Este proyecto es **UNLICENSED** (Hector Luis Ramirez).

---

## ���‍��� Autor

**Hector Luis Ramirez**
