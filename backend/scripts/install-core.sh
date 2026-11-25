#!/usr/bin/env bash
set -euo pipefail
npm install sequelize@6 pg pg-hstore dotenv
npm pkg set 'scripts.db:migrate=node scripts/migrate.cjs'
if [ ! -f .env ]; then cp .env.example .env; fi
printf '\n.env\n.env.*\n!.env.example\nnode_modules/\ndist/\n' >> .gitignore
