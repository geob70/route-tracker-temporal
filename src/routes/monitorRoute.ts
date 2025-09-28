import express from 'express';
import { Connection, WorkflowClient } from '@temporalio/client';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getLocationName } from '../libs/routeApi';

const router = express.Router();

const coordinateSchema = z.tuple([z.number(), z.number()]);

const routeSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  threshold: z.number().min(1),
  recipient: z.string().email(),
});

const payloadSchema = z.array(routeSchema);

/** Route to monitor delivery routes
 * Expects payload:
 * [
 *   {
 *     origin: [lat, lng],
 *     destination: [lat, lng],
 *     threshold: number (in minutes),
 *     recipient: string (email)
 *   },
 *   ...
 * ]
 * Returns 202 Accepted if workflows started successfully
 * The aim is to start a Temporal workflow for each route to monitor traffic delays
 * The routes are sent to the /monitor-routes endpoint as a JSON array from the client
 * Test on postman or run ts-node src/sendRequest.ts to send a test request
 * Note: Ensure Temporal server is running locally on default port 7233
 * Note: Ensure the worker is running (ts-node src/worker.ts or npm run start)
 * Note: Ensure Google Maps API key is set in environment variables
 * Note: Ensure SMTP settings are set in environment variables for email notifications
 */

router.post('/monitor-routes', async (req, res) => {
  const parse = payloadSchema.safeParse(req.body);
  if (!parse.success) {
    console.log('<-------------------------------');
    console.warn('⚠️ Invalid input:', parse.error.errors);
    console.log('<-------------------------------');
    return res.status(400).json({ error: 'Invalid input', details: parse.error.errors });
  }

  const routes = parse.data;

  try {
    const connection = await Connection.connect();
    const client = new WorkflowClient({ connection });

    const startedWorkflows = await Promise.all(
      routes.map(async ({ origin, destination, threshold, recipient }) => {
        const workflowId = `monitor-${randomUUID()}-${Date.now()}`;

        // get original and destination addresses
        const originAddress = await getLocationName(origin);
        const destinationAddress = await getLocationName(destination);
        console.log('<-------------------------------');
        console.log('Received route to monitor:', {
          origin,
          destination,
          threshold,
          recipient,
          originAddress,
          destinationAddress,
        });
        console.log('<-------------------------------');

        await client.start('monitorRouteWorkflow', {
          taskQueue: 'monitoring',
          workflowId,
          args: [origin, destination, threshold, recipient, originAddress, destinationAddress, workflowId],
        });
        return { origin, destination, workflowId, originAddress, destinationAddress };
      }),
    );

    res.status(202).json({ status: 'Workflows started', workflows: startedWorkflows });
  } catch (err) {
    console.error('Failed to start workflows:', err);
    res.status(500).json({ error: 'Workflow start failed' });
  }
});

export default router;
