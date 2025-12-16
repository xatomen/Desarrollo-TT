FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

EXPOSE 8081

CMD ["npm", "run", "web"]
