FROM alpine

ARG NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN
ARG NEXT_PUBLIC_WEBSITE_DOMAIN
ARG NEXT_PUBLIC_AUTH0_DOMAIN
ARG NEXT_PUBLIC_AUTH0_CLIENT_ID
ARG NEXT_PUBLIC_AUTH0_AUDIENCE

RUN apk add --no-cache bash git npm

RUN git clone https://github.com/Zane-T-Rice/apps.git
WORKDIR /apps
RUN npm install
RUN npm run build

COPY ./start-apps-server.sh /start-apps-server.sh

# start the server!
ENTRYPOINT ["bash", "/start-apps-server.sh"]