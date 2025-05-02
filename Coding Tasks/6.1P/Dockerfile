FROM node:18
WORKDIR /task5_1P
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3040 
CMD ["node", "server.js"]