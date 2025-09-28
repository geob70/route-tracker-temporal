import { Connection, Client } from '@temporalio/client';
import { monitorRouteWorkflow } from './workflows/workflows';
import { nanoid } from 'nanoid';

type RouteConfig = {
  origin: [number, number];
  destination: [number, number];
  threshold: number;
  recipient: string;
};

const mockRoute: RouteConfig = {
  origin: [53.4808, -2.2426], // Manchester
  destination: [55.9533, -3.1883], // Edinburgh
  threshold: 600,
  recipient: 'sylvester.ola.george@gmail.com',
};

/**
 * Run the Temporal client example
 * Starts a workflow to monitor a route for traffic delays
 * The workflow checks for delays every 5 minutes, up to 2 times
 * If a delay exceeding the threshold is detected, an email notification is sent to the recipient
 * Make sure a Temporal server is running locally on default port 7233
 * Make sure the worker is running (ts-node src/worker.ts or npm run start) to process the workflows
 * Test client by running: ts-node src/client.ts or npm run workflow
 * Note: Ensure Google Maps API key is set in environment variables
 * Note: Ensure SMTP settings are set in environment variables for email notifications
 */
async function run() {
  // Connect to the default Server location
  const connection = await Connection.connect({ address: 'localhost:7233' });
  // In production, pass options to configure TLS and other settings:
  // {
  //   address: 'foo.bar.tmprl.cloud',
  //   tls: {}
  // }

  const client = new Client({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });

  const handle = await client.workflow.start(monitorRouteWorkflow, {
    taskQueue: 'monitoring',
    // type inference works! args: [name: string]
    args: [
      mockRoute.origin,
      mockRoute.destination,
      mockRoute.threshold,
      mockRoute.recipient,
      'Manchester',
      'Edinburgh',
      'test-workflow',
    ],
    // in practice, use a meaningful business ID, like customerId or transactionId
    workflowId: 'workflow-' + nanoid(),
  });
  console.log(`Started workflow ${handle.workflowId}`);

  console.log(await handle.result());
  await connection.close();

  console.log('Connection closed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
