FROM alpine

RUN apk add --no-cache bash git npm

RUN git clone https://github.com/Zane-T-Rice/apps.git
WORKDIR /apps
RUN npm install
RUN npm run build

COPY ./start-apps-server.sh /start-apps-server.sh

# start the server!
ENTRYPOINT ["bash", "/start-apps-server.sh"]