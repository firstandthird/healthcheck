# healthcheck

### Install

`npm install firstandthird/healthcheck -g`

### Running

`healthcheck --config urls.yaml --log logdb.json`

or with a remote config

`healthcheck --configUrl https://gist.githubusercontent.com/dawnerd/ea2a0bf8db74544395cbf77dba799350/raw/f60f0cf33978885ea6808f457c896dc8658b7d7e/healthcheck-test.yaml --log logdb.json`

### Config

```yaml
maxEntries: 100 # Removes older entries (per url) | default: 100
interval: 'every 10 seconds' # Global interval | default: every 5 minutes
verbose: true # Enables verbose logging | default: false
timeout: 10000 # Maximum milliseconds before considering endpoint as being down | default: 10000
responseThreshold: 30 # Maximum milliseconds before considering endpoint as being slow | default: 1000
retryDelay: 1000 # Amount of time to wait between retries | default: 1000
retryCount: 1 # How many times to retry before marking as down or slow | default: 1
headers: # Override headers sent
  User-Agent: 'custom-check/1.0.0' # User-Agent defaults to healthcheck/<version>
urls:
  -
    name: 'Random' # Optional friendly name | default: url
    url: http://localhost:8080/api/random
    type: http # Can be http or ping. If ping only provide the hostname as the url.
    interval: 'every 2 seconds' # Any valid https://bunkat.github.io/later/ string | default: every 5 minutes
    responseThreshold: 30 # Maximum milliseconds before considering endpoint as being slow | default: 1000
    timeout: 10000 # Maximum milliseconds before considering endpoint as being down | default: 10000
    retryDelay: 1000 # Amount of time to wait between retries | default: 100
    retryCount: 1 # How many times to retry before marking as down or slow | default: 1
    statusCode: 200 # Status code to check for | default: 200
```

### Endpoints

`/api/all` - returns data about all endpoints
`/api/single?name=<friendly name>` - returns data about a single endpoint. If name isn't set in url config, use the url.
`/api/random` - Returns a random 200, 404, or 500 status code (for testing notifications).

### Logging

The log file is a json representation of stored data that will persist between restarts. Can be read using https://github.com/mafintosh/flat-file-db

### Log Tags

*Note: If the service is slow or down it will be rechecked as many times as defined in retryCount.*

`service-slow` - The endpoint exceeded the responseThreshold but didn't time out

`service-down` - The endpoint timed out.

`service-up` - Only used when verbose enabled.
