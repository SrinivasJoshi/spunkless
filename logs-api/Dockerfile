FROM node:23-alpine3.20
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . . 
EXPOSE 8002
CMD ["npx", "nodemon", "src/index.js"]
