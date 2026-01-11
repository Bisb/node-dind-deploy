# Docker Deployment API - Volume Mounts Guide

This guide explains how host-to-stack volume mounts are handled by this application, depending on the Docker execution mode.

## 1. Docker-outside-of-Docker (DooD) - Default
Current setup uses `/var/run/docker.sock` to communicate with the host's Docker daemon.

### The Problem
When you trigger a deployment for a stack located at `/app/stacks/my-stack`, the host's Docker daemon is the one executing the command. It looks for files at `/app/stacks/my-stack` **on the host machine**.

If your `compose.yaml` in the stack has:
```yaml
volumes:
  - ./data:/data
```
The host daemon will try to mount `data` from whatever it thinks is the current directory of the compose file **on the host**.

### The Solution: Path Mirroring
To make host mounts work reliably in DooD, you should ensure that the path inside the container and the path on the host are **identical**.

**In your main `compose.yaml`:**
Instead of:
```yaml
volumes:
  - ./stacks:/app/stacks
```
Use the absolute path of your project on the host:
```yaml
volumes:
  - /home/user/project/stacks:/home/user/project/stacks
```
And in `stacks.json`, use that same absolute path:
```json
  "stackPath": "/home/user/project/stacks/stack1/compose.yaml"
```

## 2. True Docker-in-Docker (DinD)
If you run a real Docker daemon inside the container (using `docker:dind` image and `--privileged` flag):

- **It works perfectly.** Since the daemon is local to the container, it sees `/app/stacks` and any relative volumes correctly within its own filesystem.
- **Safety:** This is the most isolated way, as the host filesystem is not directly involved in the stack's volume mounts (unless explicitly passed through).

## 3. Recommended Approach: Named Volumes
For the highest portability and to avoid path mapping issues, use **Named Volumes** instead of bind mounts whenever possible:

```yaml
services:
  web:
    image: nginx
    volumes:
      - my-data:/usr/share/nginx/html

volumes:
  my-data:
```
Named volumes are managed by the Docker daemon and work seamlessly in both DooD and DinD without worrying about host paths.
