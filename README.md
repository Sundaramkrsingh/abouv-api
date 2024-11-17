# PWA API

> RESTful APIs for PWA

<!-- [![Build Status](https://travis-ci.org/yourusername/your-frontend-app.svg?branch=master)](https://travis-ci.org/yourusername/your-frontend-app) -->

## Prerequisites

- [Node >=18.x](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [DBeaver](https://dbeaver.io/download/)/[pgAdmin](https://www.pgadmin.org/download/)

## Installation

```shell
pnpm install
```

## Project Setup Guide

- Create `.env` file by duplicating `.env.example` file

## Running the app

> App will run at http://localhost:3001

> Swagger Documentation run at http://localhost:3001/swagger

```bash
# 1. Creates Postgres DB container with Docker
$ pnpm run dev:db:create

# 2. Create DB connection with DBeaver/pgAdmin
# - Check .env file for the DB connection detail

# 3. Adds required and fake data to DB
$ pnpm run dev:db:setupdata

# Start development
$ pnpm run start

# or

# Start development in watch mode
$ pnpm run start:dev
```

- To empty DB run `pnpm run db:reset`, then run `$ pnpm run dev:db:setupdata` to populate data
- To remove DB run `pnpm run dev:db:remove`

## Prisma

- After making changes to the database schema run following command and commit it:

```bash
pnpm prisma migrate dev --name [name_of_change]
```

- After pulling the latest code changes, if the database schema has been updated, run the following command:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
pnpm run dev:db:seed
```

## Code Formatting

If you don't have the Prettier extension installed and configured to format the code on save, run the following command manually to format the project:

```bash
pnpm run format
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
