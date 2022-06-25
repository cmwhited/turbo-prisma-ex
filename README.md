# turborepo | prisma example

- api:
  - expressjs
  - graphql, with apollo-server-express
  - prisma for the db layer
- docker

```bash
# install deps
pnpm i

# build docker image
pnpm docker:build

# start
pnpm docker:up
```
