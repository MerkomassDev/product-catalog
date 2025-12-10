FROM node:18-alpine

WORKDIR /app

# Kopírování package souborů
COPY package*.json ./

# Instalace závislostí
RUN npm install --production

# Kopírování zdrojového kódu
COPY . .

# Exponování portu
EXPOSE 5000

# Spuštění aplikace
CMD ["node", "src/index.js"]
