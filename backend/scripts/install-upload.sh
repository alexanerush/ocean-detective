#!/bin/bash
set -e
npm install multer@^2
npm install -D @types/multer
cd ..
printf '\n/private-uploads/\n' >> .gitignore
