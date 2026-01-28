FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir app/uploads && mkdir app/image_return

EXPOSE 8000

# CMD ["node", "index.js"]
CMD ["npm", "start"]
