FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY src/ ./src/
COPY public/ ./public/
EXPOSE 7074
CMD ["node", "src/index.js"]
