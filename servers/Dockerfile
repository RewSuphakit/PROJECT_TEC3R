FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN mkdir uploads/ && mkdir image_return/

COPY . .


EXPOSE 8000

# CMD ["node", "index.js"]
CMD ["npm", "start"]
