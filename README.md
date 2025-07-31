# api-gateway

Proxy server that emulates a simple AWS API Gateway locally. The published
package already includes the compiled JavaScript so it can be executed directly
with **npx** or after installing globally.

## Installation

Use `npx` to run the latest released version without installing:

```bash
npx api-gateway start --help
```

Or install globally and use the `agw` command:

```bash
npm install -g api-gateway
agw start --help
```

## Usage

Run with inline configuration:

```bash
npx api-gateway start -p 8000 \
  --node auth --destiny http://localhost:9000 \
  --node products --destiny http://localhost:9001
```

If you omit options the CLI will prompt for them using **inquirer**.

### Config files

Save a configuration to `~/.agw/myconfig.json` using `--save`:

```bash
npx api-gateway start --save myconfig
```

Run the gateway using that configuration:

```bash
npx api-gateway start --config myconfig
```

### Background mode

Start the gateway in the background and log each service to
`~/.agw/logs/[node].log`:

```bash
npx api-gateway start --config myconfig --daemon
```

View a service log:

```bash
npx api-gateway logs auth
```

## Options (start command)

- `-p, --port`      Port to listen on.
- `-n, --node`      Path prefix to route (repeatable).
- `-d, --destiny`   Destination URL (repeatable to match nodes).
- `-c, --config`    Configuration name or path.
- `-s, --save`      Save provided/interactive options as configuration.
- `--log`           Enable console request logging.
- `--daemon`        Run in background.
For viewing logs use:

```bash
npx api-gateway logs <node>
```

## License

ISC

## Development

The compiled JavaScript in `dist/` is generated automatically by a GitHub Action when code is pushed to `main`. The workflow uses conventional commits to determine the next version, installs dependencies with caching, runs the Jest test suite, builds the TypeScript sources with Node&nbsp;22 and then publishes the release with sources and compiled output. The same workflow also publishes the package to **npm** using the generated version.

Local builds can be run with:

```bash
npm run build
```

Tests are executed with Jest:

```bash
npm test
```
