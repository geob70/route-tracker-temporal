import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';

const TASK_QUEUE = 'monitoring';

// type RouteConfig = {
//   origin: [number, number];
//   destination: [number, number];
//   threshold: number;
//   recipient: string;
// };

// const mockRoutes: RouteConfig[] = [
// {
//   origin: [51.5074, -0.1278], // London
//   destination: [52.4862, -1.8904], // Birmingham
//   threshold: 300,
//   recipient: 'sylvester.ola.george@gmail.com',
// },
// {
//   origin: [53.4808, -2.2426], // Manchester
//   destination: [55.9533, -3.1883], // Edinburgh
//   threshold: 600,
//   recipient: 'sylvester.ola.george@gmail.com',
// },
// {
//   origin: [51.4545, -2.5879], // Bristol
//   destination: [50.7192, -1.8808], // Bournemouth
//   threshold: 240,
//   recipient: 'sylvester.ola.george@gmail.com',
// },
// {
//   origin: [51.752, -1.2577], // Oxford
//   destination: [52.2053, 0.1218], // Cambridge
//   threshold: 180,
//   recipient: 'sylvester.ola.george@gmail.com',
// },
// ];

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
    // TLS and gRPC metadata configuration goes here.
  });
  try {
    const worker = await Worker.create({
      connection,
      namespace: 'default',
      taskQueue: TASK_QUEUE,
      // Workflows are registered using a path as they run in a separate JS context.
      workflowsPath: require.resolve('./workflows/workflows'),
      activities,
    });

    await worker.run();
  } finally {
    await connection.close();
  }
}

run().catch((err) => {
  console.error('Monitor worker failed:', err);
  process.exit(1);
});
