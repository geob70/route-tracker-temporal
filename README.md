# Eagle Brain – Route Monitoring API

A project to monitor delivery routes for traffic delays using Temporal workflows.
You can test this either using Express js or using Temporal commands

## Temporal command

- `origin`: `[lat, lng]` array
- `destination`: `[lat, lng]` array
- `threshold`: Number (minutes)
- `recipient`: Email address

## How It Works (Temporal)

- Starts a Temporal workflow for each route to monitor traffic delays.
- Sends email notifications if delays exceed the threshold.

## Testing (Temporal)

1. **Start Temporal Server**
     Ensure Temporal server is running locally on port `7233`.
     Run:

     ```temporal server start-dev
     ```

2. **Start Worker**
     Run:

     ```bash
     ts-node src/worker.ts
     # or
     npm run start
     ```

3. **Set Environment Variables**
     - Google Maps API key
     - SMTP settings for email notifications

4. **Start Client workflow**
     - Run:

         ```bash
         ts-node src/client.ts
         # or
         npm run workflow
         ```

## Express js

### `POST localhost:8000/monitor-routes`

**Payload Example:**

```json
[
    {
        "origin": [12.9716, 77.5946],
        "destination": [13.0827, 80.2707],
        "threshold": 30,
        "recipient": "user@example.com"
    }
]
```

- `origin`: `[lat, lng]` array
- `destination`: `[lat, lng]` array
- `threshold`: Number (minutes)
- `recipient`: Email address

**Response:**
Returns `202 Accepted` if workflows started successfully.

## How It Works (Express js)

- Start express server for Route Monitoring API
- Starts a Temporal workflow for each route to monitor traffic delays.
- Sends email notifications if delays exceed the threshold.

## Testing (Express js)

1. **Start Express Server**
    Run:

    ```bash
    npm run server
    ```

2. **Start Temporal Server**
     Ensure Temporal server is running locally on port `7233`.
     Run:

     ```temporal server start-dev
     ```

3. **Start Worker**
     Run:

     ```bash
     ts-node src/worker.ts
     # or
     npm run start
     ```

4. **Set Environment Variables**
     - Google Maps API key
     - SMTP settings for email notifications

5. **Send Test Request**
     - Use Postman to POST to `/monitor-routes` with the payload above.
     - Or run:

         ```bash
         ts-node src/sendRequest.ts
         # or
         npm run test:server
         ```

## Notes

- All required environment variables must be set before testing.
- The API expects a JSON array of routes.
