FROM node:16-alpine
WORKDIR "/app"
COPY ./package.json ./
# pull in wait-for-it bash script because we want to wait for the RabbitMQ server to be running before the consumer tries to connect to it
RUN apk add --no-cache bash && \
    wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    chmod +x /bin/wait-for-it.sh

RUN npm install
COPY . .
CMD ["npm", "run", "start"]