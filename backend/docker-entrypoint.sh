#!/bin/sh
set -e

prisma migrate deploy
tsx prisma/seed.ts

exec node dist/main.js
