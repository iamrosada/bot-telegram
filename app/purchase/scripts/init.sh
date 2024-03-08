#!/bin/bash
echo "Running startup commands"

npx prisma generate
npm run start