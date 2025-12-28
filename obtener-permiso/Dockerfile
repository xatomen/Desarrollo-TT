FROM node:25-alpine

ARG NEXT_PUBLIC_API_BASE_URL=https://api.jorgegallardo.studio
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 8002

CMD ["npm", "start", "--", "-p", "8002"]
