FROM positivly/prisma-binaries:latest as prisma
FROM node:16.15-alpine3.16
RUN apk add --no-cache git curl python3 make gcc libc-dev g++ libc6-compat openssl openssl-dev \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node
RUN ln -sf python3 /usr/bin/python
COPY --from=prisma /prisma-engines/query-engine /prisma-engines/migration-engine /prisma-engines/
ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
  PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
  PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
  PRISMA_CLIENT_ENGINE_TYPE=binary

WORKDIR /app

EXPOSE 4000/tcp

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

COPY ./package.json /app/package.json
COPY ./pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY ./turbo.json   /app/turbo.json
COPY ./apps/api/package.json  /app/apps/api/package.json
COPY ./apps/api/prisma/schema.prisma /app/apps/api/prisma/schema.prisma
COPY ./pnpm-lock.yaml /app/pnpm-lock.yaml

# install the packages

COPY . .

# build .env in /app/apps/api

RUN cd /app/apps/api \
  && touch .env \
  && echo "DATABASE_URL=${DATABASE_URL}" >> .env \
  && cat .env

RUN --mount=type=secret,id=npmrc,dst=/root/.npmrc \
  pnpm i --prod false

RUN pnpm build