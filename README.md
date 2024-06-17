# Phoenix Framework
An easy-to-use, extensible framework built for ecommerce applications and others
that require flexibility and ease-of-use. Written for bun for maximum performance

## Vision
An ultra-fast, easy-to-use framework that has "ready for the big time" features

## Primary components
* Typescript
* Apollo Server
* TypeGoose/Mongoose

## Features included right now
* Plugin architecture that allows you to create and extend models and resolvers via plugins
* Role-Based auth
* Integration and e2e tests
* Event system backed by Kafka
* Job-queue system backed by BullMq

## Features under construction
Check the [GH issues](https://github.com/Phoenix-Codeworx/phoenix-framework/issues) for things I plan to add in the near future

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run start
```

To run with auto restart:

```bash
bun run dev
```

To run unit and integration tests: (not many beyond a poc for now)

```bash
bun test
```

To run e2e tests

```bash
bun run test:e2e
```

