#!/usr/bin/env bash
set -euo pipefail
npm install argon2 jsonwebtoken cookie-parser helmet express-rate-limit
npm install -D @types/jsonwebtoken @types/cookie-parser
node -e 'const fs=require("fs"),c=require("crypto");const p=".env";const s=fs.readFileSync(p,"utf8");if(!/^JWT_SECRET=.+$/m.test(s))fs.appendFileSync(p,"\nJWT_SECRET="+c.randomBytes(48).toString("hex")+"\n");'
