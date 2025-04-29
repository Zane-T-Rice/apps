## What is this?

A front-end for the [server-manager-service](https://github.com/Zane-T-Rice/server-manager-service). Has seperate apps for admins and users to be able to control servers managed by an instance of the server-manage-service.

## Requirements

```sh
# Docker is required to run the application.
docker --version
Docker version 27.5.1, build v27.5.1

# The rest of these are only required to write code.
node --version
v22.14.0

# If you want this app to be managed by server-manager-service, then it will need
# to be on a docker bridge network named server-manager-service.
# Here is an example of how to create such a network.
docker network create \
  --driver=bridge \
  --subnet=172.19.0.0/16 \
  --ip-range=172.19.0.0/16 \
  --gateway=172.19.5.254 \
  -o enable_icc=true \
  server-manager-service-network
```

## Deployment

- NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN is the URL to the server-manager-service.
- NEXT_PUBLIC_WEBSITE_DOMAIN is the URL to the host of this application.

```sh
(
cp docker/deployment/Dockerfile .
cp docker/deployment/start-apps-server.sh .
docker stop apps
docker rm apps
docker build -t apps --no-cache .
docker run --name=apps -d \
 -p 3100:3100/tcp \
 --restart unless-stopped \
 --network server-manager-service-network \
 --env NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN="" \
 --env NEXT_PUBLIC_WEBSITE_DOMAIN="" \
 apps
)
```

## Local Development

```
npm install
npm run dev
```

This should start a server on http://localhost:3100/
