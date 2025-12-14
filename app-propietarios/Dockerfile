FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

EXPOSE 8082

CMD ["npm", "run", "web"]
