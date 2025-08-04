# proxy.sh

Proxy server that emulates a simple AWS API Gateway locally. The published
package already includes the compiled JavaScript so it can be executed directly
with **npx** or after installing globally.

## Installation

Use `npx` to run the latest released version without installing:

```bash
npx proxy.sh start --help
```

Or install globally and use the `proxy` command:

```bash
npm install -g proxy.sh
proxy start --help
```

## Usage

Run with inline configuration:

```bash
npx proxy.sh start -p 8000 \
  --node auth:http://localhost:9000 \
  --node products:http://localhost:9001
```

If you omit options the CLI will prompt for them using **inquirer**. When
stored configurations exist, the CLI also lets you select one to use.

### Config files

Save a configuration to `~/.proxy/myconfig.json` using `--save`:

```bash
npx proxy.sh start --save myconfig
```

Run the gateway using that configuration:

```bash
npx proxy.sh start --config myconfig
```

Configurations are stored as JSON objects where each property maps a node to
its destination:

```json
{
  "port": 8000,
  "nodes": {
    "auth": "http://localhost:9001/auth",
    "invoices": "http://localhost:9002/invoices"
  },
  "log": true
}
```

### Background mode

Start the gateway in the background and log each service to
`~/.proxy/logs/[node].log`:

```bash
npx proxy.sh start --config myconfig --daemon
```

View a service log:

```bash
npx proxy.sh logs auth
```

## Options (start command)

- `-p, --port`      Port to listen on.
- `-n, --node`      Node mapping in `node:destiny` form (repeatable).
- `-c, --config`    Configuration name or path.
- `-s, --save`      Save provided/interactive options as configuration.
- `--log`           Enable console request logging.
- `--daemon`        Run in background.
For viewing logs use:

```bash
npx proxy.sh logs <node>
```

## License

MIT

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
