# Bot Discord "Zéro Insulte"

Un bot Discord permettant de suivre et d'encourager une dynamique de non-insulte dans un serveur entre amis.

## Fonctionnalités

- Détecte automatiquement les insultes dans les messages
- Compte les jours consécutifs sans insulte
- Enregistre le record de jours sans insulte
- Commandes slash pour consulter ou réinitialiser le compteur

## Installation

1. Clonez ce dépôt
```bash
git clone https://github.com/votre-username/insulte-discord.git
cd insulte-discord
```

2. Installez les dépendances
```bash
npm install
```

3. Créez un fichier `.env` basé sur `.env.example` et ajoutez vos informations d'identification Discord

4. Déployez les commandes slash
```bash
npm run deploy-commands
```

5. Démarrez le bot
```bash
npm start
```

## Commandes disponibles

- `/status` : Affiche le streak actuel de jours sans insulte
- `/record` : Affiche le record du serveur
- `/reset` : Réinitialise manuellement le compteur (admin seulement)
- `/config` : Configure la liste des mots interdits (admin seulement)

## Configuration

Le bot stocke les données dans un fichier JSON. La configuration initiale comprend une liste de base d'insultes qui peut être modifiée via la commande `/config`. 

## Gestion du fallback Gemini

L'application utilise une clé API principale pour Gemini (`GEMINI_API_KEY`). Si la limite de requêtes (rate limit) est atteinte (erreur 429), elle bascule automatiquement sur la clé de secours (`FALLBACK_GEMINI_API_KEY`) si elle est définie dans le fichier `.env`.

- Le basculement est persistant : l'état est stocké dans `src/data/gemini_fallback.json`.
- Après 24h, l'application retente automatiquement d'utiliser la clé principale.
- Si la clé de secours n'est pas définie, seul un message d'erreur est retourné en cas de rate limit.

**Variables d'environnement à définir dans `.env` :**

```
GEMINI_API_KEY=...              # Clé API principale Gemini
FALLBACK_GEMINI_API_KEY=...     # Clé API de secours Gemini (optionnelle)
``` 