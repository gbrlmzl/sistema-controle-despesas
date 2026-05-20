FROM node:24
WORKDIR /app-node
COPY . .

RUN npm install
ENTRYPOINT npm start