FROM node:24
WORKDIR /app-node

COPY package*.json ./
RUN npm install

COPY . .
# Gera o build de produção
RUN npm run build

ENTRYPOINT npm start