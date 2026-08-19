FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3004
CMD ["node", "-r", "./src/tracing.js", "src/index.js"]
