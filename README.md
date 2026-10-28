## What is this?

A front-end for the [server-manager-service](https://github.com/Zane-T-Rice/server-manager-service) and [gloomhaven-companion-service](https://github.com/Zane-T-Rice/gloomhaven-companion-service).

One of my personal projects that I do for fun and learning.

## Requirements

```sh
node --version
v22.14.0
```

To deploy you also need [Terraform](https://developer.hashicorp.com/terraform/install) and AWS credentials.
Nothing here needs docker.

## Local Development

```sh
npm install
cp .env.example .env.dev   # then put your own Auth0 values in it. .env* files are not committed.
npm run dev
```

This should start a server on http://localhost:3100/

`npm run dev` copies `.env.dev` to `.env.local`. The example points the app at the backends running on your machine:
server-manager-service on port 3000, gloomhaven-companion-service on port 7575 and its websockets on port 8080
(see their READMEs for starting them). The app runs fine with only some of them, but the apps within the webpage for
the services that are left out will not work of course.

## Configuration

The app is a static site (Next.js `output: "export"`), so these are read when it is built, not when it is served.
Set them in `.env.dev` for development (see `.env.example`) and in the environment of the build for deployment.

- NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN is the URL to the server-manager-service.
- NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN is the URL to the gloomhaven-companion-service
- NEXT_PUBLIC_GLOOMHAVEN_COMPANION_WEBSOCKETS_URL is the websocket URI
- NEXT_PUBLIC_WEBSITE_DOMAIN is the URL to the host of this application.
- NEXT_PUBLIC_GAME_SERVER_HOST is the address players connect to, which is shown on the game server cards.
- NEXT_PUBLIC_AUTH0_DOMAIN is the URL to the Auth0 Issuer.
- NEXT_PUBLIC_AUTH0_CLIENT_ID is the id of this application in Auth0.
- NEXT_PUBLIC_AUTH0_AUDIENCE is the identifier of the Auth0 API.
- NEXT_PUBLIC_AUTH0_SCOPES are the scopes that may be needed by the user.

## Deployment

The site is uploaded to an S3 bucket configured as a website, using the Terraform in `deployments/terraform`.

### From GitHub Actions

Pushing to `main` runs `.github/workflows/cd.yml`, which builds the site and runs `terraform apply`. To host your own
copy, fork the repo and set these under Settings, Secrets and variables, Actions:

- Variables (none are secret, the first nine end up in the public JavaScript): every variable listed in Configuration
  above, plus `SITE_BUCKET_NAME`, the name of the S3 bucket for the site, and `TF_STATE_BUCKET`, the name of the S3
  bucket that stores the Terraform state. S3 bucket names are global, so both have to be your own.
- Secrets: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for an AWS user that may manage the site bucket.

Create the state bucket by hand first (turning on versioning is recommended). Nothing in the workflow needs editing.

### From your machine

Set the variables from Configuration, `TF_VAR_site_bucket_name` (the site bucket) and `TF_STATE_BUCKET` (the state
bucket) in your environment, have AWS credentials available, then:

```sh
npm run build
npm run deploy
```
