FROM node:25-alpine

ARG NEXT_PUBLIC_API_BASE_URL=http://api.jorgegallardo.studio
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8081

CMD ["npm", "run", "web"]
