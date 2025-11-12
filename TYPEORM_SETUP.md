# Configuration TypeORM - Chrysallis

## Entités créées

### User (`src/entities/user.entity.ts`)
- `id`: Clé primaire auto-incrémentée
- `name`: Nom de l'utilisateur (max 100 caractères)
- `email`: Email unique
- Relation: OneToMany avec `Post`

### Post (`src/entities/post.entity.ts`)
- `id`: Clé primaire auto-incrémentée
- `title`: Titre du post (max 200 caractères)
- `content`: Contenu du post (type text)
- `author`: Relation ManyToOne avec `User` (cascade delete)

## Configuration

La configuration TypeORM est dans `src/app.module.ts`:
- **Base de données**: PostgreSQL (conteneurisé avec Docker)
- **Synchronisation**: Activée en développement, désactivée en production
- **Entités enregistrées**: User, Post

### Variables d'environnement (.env)

Créez un fichier `.env` à partir de `.env.example`:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=chrysallis_db
```

## Démarrage

### Avec Docker Compose (recommandé)

```powershell
# Copier le fichier d'exemple
Copy-Item .env.example .env

# Lancer les conteneurs (PostgreSQL + App)
docker-compose up -d

# Voir les logs
docker-compose logs -f app
```

### En développement local

```powershell
# Installer les dépendances
npm install

# Démarrer PostgreSQL avec Docker
docker-compose up -d db

# Lancer l'app en mode développement
npm run start:dev

# Compiler le projet
npm run build
```

Au premier démarrage, TypeORM créera automatiquement les tables `users` et `posts` dans PostgreSQL.

## Prochaines étapes

1. Créer des controllers et services pour manipuler les entités
2. Ajouter des DTOs pour la validation
3. Configurer les migrations pour la production (désactiver `synchronize`)
4. Ajouter des seeds pour les données de test
