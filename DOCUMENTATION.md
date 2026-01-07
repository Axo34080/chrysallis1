# DOCUMENTATION COMPLÈTE - CHRYSALLIS BACKEND

## 1. APERÇU DU PROJET

### 1.1 Vue Générale
Chrysallis est une application backend NestJS destinée à la gestion de missions d'agents secrets. Elle fournit une API RESTful complète et des fonctionnalités WebSocket en temps réel pour la collaboration et les notifications.

### 1.2 Stack Technologique

| Composant | Technologie | Version |
|-----------|------------|---------|
| **Framework** | NestJS | 11.0.1 |
| **Runtime** | Node.js | TypeScript 5.7.3 |
| **Base de Données** | PostgreSQL | 8.11.3 |
| **ORM** | TypeORM | 0.3.17 |
| **WebSocket** | Socket.io | 4.8.1 |
| **HTTP Client** | Axios | 4.0.1 |
| **Santé** | Terminus | 11.0.0 |
| **Planification** | Schedule | 6.1.0 |
| **Documentation** | Swagger | 11.2.1 |

### 1.3 Scripts de Démarrage

```bash
npm run build          # Compiler le projet
npm start             # Démarrer en production
npm run start:dev     # Démarrer en mode développement avec watch
npm run start:debug   # Démarrer en mode debug
npm run start:prod    # Démarrer depuis le dist compilé
npm run test          # Lancer les tests
npm run lint          # Linting avec auto-fix
```

---

## 2. ARCHITECTURE GÉNÉRALE

### 2.1 Structure des Modules

```
src/
├── entities/              # Entités TypeORM
│   ├── mission.entity.ts
│   ├── step.entity.ts
│   ├── field-report.entity.ts
│   ├── user.entity.ts
│   └── post.entity.ts
├── mission/              # Module Missions
│   ├── mission.module.ts
│   ├── mission.controller.ts
│   ├── mission.service.ts
│   └── dto/
├── steps/               # Module Étapes
│   ├── steps.module.ts
│   ├── steps.controller.ts
│   ├── steps.service.ts
│   └── dto/
├── field-reports/       # Module Rapports
│   ├── field-reports.module.ts
│   ├── field-reports.controller.ts
│   ├── field-reports.service.ts
│   └── dto/
├── chat/               # Module Chat & WebSocket
│   ├── chat.module.ts
│   ├── chat.gateway.ts
│   └── dto/
├── health/            # Module Santé (Health Checks)
│   ├── health.module.ts
│   └── health.controller.ts
├── tasks/             # Module Tâches Planifiées
│   ├── tasks.module.ts
│   └── tasks.service.ts
├── app.module.ts      # Module Root
├── app.controller.ts  # Controller Root
├── app.service.ts     # Service Root
└── main.ts           # Point d'entrée
```

### 2.2 Diagramme des Relations d'Entités

```
User (1) ──── (N) Post
Mission (1) ──── (N) Step
Mission (1) ──── (N) FieldReport
```

---

## 3. ENTITÉS/MODÈLES

### 3.1 Entité Mission

**Table:** `missions`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | string (100) | Non | - | Identifiant unique (clé primaire) |
| **codeName** | string (200) | Oui | NULL | Nom de code (ex: "Opération Phénix") |
| **description** | text | Oui | NULL | Description détaillée |
| **location** | string (200) | Oui | NULL | Lieu d'exécution |
| **startDate** | timestamp | Oui | NULL | Date de début |
| **endDate** | timestamp | Oui | NULL | Date de fin prévue |
| **status** | enum | Non | ASSIGNED | ASSIGNED, IN_PROGRESS, COMPLETED, COMPROMISED, CANCELLED |
| **classificationLevel** | enum | Non | CONFIDENTIAL | TOP_SECRET, SECRET, CONFIDENTIAL |
| **encryptedData** | text | Oui | NULL | Données chiffrées |
| **agentId** | string (100) | Oui | NULL | ID de l'agent assigné |
| **title** | string (200) | Oui | NULL | Titre de la mission |
| **createdAt** | timestamp | Non | AUTO | Date de création |
| **updatedAt** | timestamp | Non | AUTO | Date de mise à jour |

**Relations:**
- `steps: Step[]` - OneToMany (cascade delete)
- `reports: FieldReport[]` - OneToMany (cascade delete)

---

### 3.2 Entité Step

**Table:** `steps`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | uuid | Non | AUTO | Identifiant unique |
| **description** | text | Oui | NULL | Description de l'étape |
| **assignedAgent** | string (200) | Oui | NULL | Agent assigné à cette étape |
| **location** | string (200) | Oui | NULL | Lieu de l'étape |
| **startDate** | timestamp | Oui | NULL | Date de début |
| **endDate** | timestamp | Oui | NULL | Date de fin |
| **status** | string (50) | Non | ASSIGNED | Statut de l'étape |
| **createdAt** | timestamp | Non | AUTO | Date de création |
| **updatedAt** | timestamp | Non | AUTO | Date de mise à jour |

**Relations:**
- `mission: Mission` - ManyToOne

---

### 3.3 Entité FieldReport

**Table:** `field_reports`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | uuid | Non | AUTO | Identifiant unique |
| **details** | text | Non | - | Détails du rapport |
| **authorAgent** | string (200) | Oui | NULL | Agent auteur du rapport |
| **location** | string (200) | Oui | NULL | Localisation d'envoi |
| **latitude** | decimal (10,7) | Oui | NULL | Coordonnée GPS |
| **longitude** | decimal (10,7) | Oui | NULL | Coordonnée GPS |
| **status** | enum | Non | draft | draft, submitted, reviewed, classified |
| **attachments** | simple-array | Oui | NULL | URLs des pièces jointes |
| **createdAt** | timestamp | Non | AUTO | Date d'envoi |
| **updatedAt** | timestamp | Non | AUTO | Dernière modification |

**Relations:**
- `mission: Mission` - ManyToOne

---

### 3.4 Entité User

**Table:** `users`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | int | Non | AUTO | Identifiant numérique |
| **name** | string (100) | Non | - | Nom complet |
| **email** | string | Non | - | Email (unique) |
| **password** | string | Non | - | Mot de passe |
| **role** | string | Non | agent | Rôle (admin, agent) |

---

### 3.5 Entité Post

**Table:** `posts`

| Champ | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| **id** | int | Non | AUTO | Identifiant numérique |
| **title** | string (200) | Non | - | Titre du post |
| **content** | text | Non | - | Contenu |

---

## 4. ENDPOINTS API REST

### 4.1 AppController - `/`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Message de bienvenue |

---

### 4.2 MissionController - `/missions`

| Méthode | Route | Description | Body/Params |
|---------|-------|-------------|-------------|
| GET | `/missions` | Liste toutes les missions | - |
| POST | `/missions` | Crée une mission | CreateMissionDto |
| GET | `/missions/:id` | Récupère une mission | id: string |
| PUT | `/missions/:id` | Met à jour une mission | UpdateMissionDto |
| DELETE | `/missions/:id` | Supprime une mission | - |
| PATCH | `/missions/:id/cancel` | Annule une mission | - |
| PATCH | `/missions/:id/complete` | Termine une mission | - |
| GET | `/missions/:id/steps` | Liste les étapes d'une mission | id: string |
| POST | `/missions/:id/steps` | Ajoute une étape | CreateStepDto |
| PUT | `/missions/:id/steps/:stepId` | Met à jour une étape | UpdateStepDto |
| DELETE | `/missions/:id/steps/:stepId` | Supprime une étape | - |
| GET | `/missions/:id/reports` | Liste les rapports | id: string |
| POST | `/missions/:id/reports` | Ajoute un rapport | CreateFieldReportDto |
| PUT | `/missions/:id/reports/:reportId` | Met à jour un rapport | UpdateFieldReportDto |
| DELETE | `/missions/:id/reports/:reportId` | Supprime un rapport | - |

---

### 4.3 StepsController - `/steps`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/steps` | Liste toutes les étapes |
| POST | `/steps` | Crée une étape |
| GET | `/steps/:id` | Récupère une étape |
| PUT | `/steps/:id` | Met à jour une étape |
| DELETE | `/steps/:id` | Supprime une étape |
| GET | `/steps/health/live` | Liveness check |
| GET | `/steps/health/ready` | Readiness check |

---

### 4.4 FieldReportsController - `/field-reports`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/field-reports` | Liste tous les rapports |
| POST | `/field-reports` | Crée un rapport |
| GET | `/field-reports/:id` | Récupère un rapport |
| PUT | `/field-reports/:id` | Met à jour un rapport |
| DELETE | `/field-reports/:id` | Supprime un rapport |

---

### 4.5 HealthController - `/health`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check complet (DB + mémoire) |
| GET | `/health/readiness` | Readiness probe (Kubernetes) |
| GET | `/health/liveness` | Liveness probe (Kubernetes) |

---

## 5. WEBSOCKET GATEWAY

### 5.1 Configuration

```typescript
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  transports: ['websocket', 'polling'],
})
```

### 5.2 Événements Écoutés (Client → Serveur)

#### `register`
Enregistre un agent.

```typescript
// Payload
{ agentId: string, agentName: string }

// Response
{ success: boolean, message: string }
```

#### `chat-message`
Envoie un message de chat.

```typescript
// Payload
{
  senderId: string,
  senderName: string,
  message: string,
  timestamp?: Date  // auto-généré si absent
}
```

### 5.3 Événements Émis (Serveur → Client)

#### `agent-connected`
Notifie quand un agent se connecte.

```typescript
{ agentId: string, agentName: string }
```

#### `chat-message`
Broadcast des messages de chat.

```typescript
{
  senderId: string,
  senderName: string,
  message: string,
  timestamp: Date
}
```

#### `mission-notification`
Notifications de missions.

```typescript
{
  missionId: string,
  eventType: 'created' | 'updated' | 'deleted' | 'cancelled' | 'completed',
  agentId: string,
  message: string,
  timestamp: Date
}
```

---

## 6. DTOs (Data Transfer Objects)

### 6.1 CreateMissionDto

```typescript
{
  id: string;                    // Auto-généré si vide
  title: string;                 // Obligatoire
  codeName?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  classificationLevel?: string;
  encryptedData?: string;
  agentId?: string;
}
```

### 6.2 CreateStepDto

```typescript
{
  description?: string;
  assignedAgent?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
```

### 6.3 CreateFieldReportDto

```typescript
{
  details: string;               // Obligatoire
  authorAgent?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  attachments?: string[];
}
```

### 6.4 ChatMessageDto

```typescript
{
  senderId: string;              // Obligatoire
  senderName: string;            // Obligatoire
  message: string;               // Obligatoire
  timestamp?: Date;
}
```

---

## 7. TÂCHES PLANIFIÉES (Cron Jobs)

### 7.1 checkMissions
- **Fréquence:** Tous les jours à minuit
- **Action:** Vérifie les missions expirées

### 7.2 cleanupOldData
- **Fréquence:** Tous les jours à minuit
- **Action:**
  - Supprime les missions complétées depuis > 90 jours
  - Supprime les rapports de terrain > 6 mois

---

## 8. CONFIGURATION

### 8.1 Variables d'Environnement (.env)

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=chrysallis_db

# Application
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=changeme
DATABASE_NAME=chrysallis_db
PORT=3001
```

### 8.2 Configuration TypeORM

```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'changeme',
  database: process.env.DATABASE_NAME || 'chrysallis_db',
  entities: [User, Post, Mission, Step, FieldReport],
  synchronize: true,  // ⚠️ Mettre à false en production
}
```

---

## 9. EXEMPLES D'UTILISATION

### 9.1 Créer une Mission

```bash
curl -X POST http://localhost:3001/missions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Opération Phoenix",
    "codeName": "OP-PHX-001",
    "location": "Paris, France",
    "agentId": "agent-001",
    "startDate": "2025-01-15T00:00:00Z",
    "endDate": "2025-01-20T00:00:00Z"
  }'
```

### 9.2 Ajouter une Étape

```bash
curl -X POST http://localhost:3001/missions/{missionId}/steps \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Infiltration du bâtiment",
    "description": "Entrer par le toit",
    "order": 1
  }'
```

### 9.3 Connexion WebSocket (JavaScript)

```javascript
const socket = io('http://localhost:3001');

// S'enregistrer
socket.emit('register', {
  agentId: 'agent-001',
  agentName: 'Agent Smith'
});

// Écouter les notifications
socket.on('mission-notification', (data) => {
  console.log('Notification:', data);
});

// Envoyer un message
socket.emit('chat-message', {
  senderId: 'agent-001',
  senderName: 'Agent Smith',
  message: 'Position confirmée'
});
```

---

## 10. RÉSUMÉ TECHNIQUE

| Aspect | Détail |
|--------|--------|
| **Framework** | NestJS 11 + TypeScript 5.7 |
| **Base de Données** | PostgreSQL + TypeORM |
| **WebSocket** | Socket.io |
| **Health Checks** | Terminus |
| **Cron Jobs** | NestJS Schedule |
| **Port** | 3001 |
| **Entités** | 5 (User, Post, Mission, Step, FieldReport) |
| **Endpoints REST** | 20+ |
| **Événements WebSocket** | 4 |

---

**Documentation générée le:** 7 janvier 2026
**Version:** 0.0.1
