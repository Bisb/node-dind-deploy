# Docker DinD Deployer

A simple Node.js application to trigger Docker Compose deployments via HTTP POST requests. This is particularly useful for CI/CD pipelines where you want to trigger a redeploy of a stack on a remote server.

## Features

- Simple API to pull and redeploy Docker Compose stacks.
- Support for multiple stacks.
- Token-based authentication per stack.
- Customizable commands for each stack.
- Runs inside Docker with access to the host's Docker socket.

## Prerequisites

- Docker and Docker Compose installed on the host machine.

## Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Bisb/node-dind-deploy.git
   cd docker-dind
   ```

2. **Configure your stacks:**
   Copy `stacks.example.json` to `stacks.json` and configure your stacks.
   ```bash
   cp stacks.example.json stacks.json
   ```

3. **Modify `stacks.json`:**
   Define your stacks, tokens, and paths to your `compose.yaml` files.
   ```json
   {
     "my-app": {
       "token": "your-secure-token",
       "stackPath": "/app/stacks/my-app/compose.yaml"
     }
   }
   ```

4. **Prepare your stacks:**
   Ensure the paths you defined in `stacks.json` are accessible within the container. You can mount them via `compose.yaml` or `compose.override.yaml`.

## Running the Application

You can run the application using Docker Compose:

```bash
docker compose up -d
```

By default, the application will be available on a dynamically assigned port (or port 3000 if configured in `compose.yaml`).

## API Endpoints

### POST `/deploy`

Triggers a deployment for a specific stack.

**Request Body:**
```json
{
  "stack": "stack-name"
}
```

**Headers:**
- `Authorization`: The token defined for the stack in `stacks.json`.

**Example:**
```bash
curl -X POST http://localhost:3000/deploy \
     -H "Content-Type: application/json" \
     -H "Authorization: your-secure-token" \
     -d '{"stack": "my-app"}'
```

## Configuration (`stacks.json`)

- `token`: (Required) The authentication token for the stack.
- `stackPath`: (Required) String or Array of strings representing the path(s) to the `compose.yaml` file(s).
- `commands`: (Optional) Array of commands to execute. If not provided, it defaults to:
  1. `docker compose -f <stackPath> pull`
  2. `docker compose -f <stackPath> up -d --remove-orphans`
