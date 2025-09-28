import { proxyActivities, sleep } from '@temporalio/workflow';
import * as activities from '../activities';

const { checkTrafficDelay, generateDelayMessage, sendNotification } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

/** Workflow to monitor a delivery route for traffic delays
 * If a delay exceeding the threshold is detected, an email notification is sent to the recipient
 * The workflow runs max of 2 times, checking for delays every 5 minutes
 * In a real-world scenario, we would want to add a way to stop the workflow gracefully (e.g. via a signal, or a timeout or if the delivery is completed)
 * @param origin
 * @param destination
 * @param threshold
 * @param recipient
 * @param originAddress
 * @param destinationAddress
 * @param workflowId
 * @return void
 */
export async function monitorRouteWorkflow(
  origin: [number, number],
  destination: [number, number],
  threshold: number,
  recipient: string,
  originAddress: string,
  destinationAddress: string,
  workflowId: string,
): Promise<void> {
  let maxChecks = 2;
  while (maxChecks > 0) {
    const delay = await checkTrafficDelay(origin, destination, threshold);
    if (delay !== null) {
      console.log('-------------------------------');
      console.log(`Delay detected for ${originAddress} to ${destinationAddress}: ${delay} minutes`);
      console.log('-------------------------------');

      const response = await generateDelayMessage(originAddress, destinationAddress, delay, workflowId);
      console.log(`Generated message for ${workflowId} with response:`, response);
      console.log('-------------------------------');

      await sendNotification(recipient, response.subject, response.message, workflowId);
    } else {
      console.log('-------------------------------');
      console.log(`No significant delay for ${originAddress} to ${destinationAddress}`);
      console.log(`Notification skipped for workflow ${workflowId}`);
      console.log('-------------------------------');
    }

    // Wait 5 minutes before checking again
    // Another approach could be to use a cron workflow to trigger this workflow every 5 minutes
    // We could also set a dynamic interval based on the traffic delay, e.g. if delay > 30 minutes, check again in 10 minutes
    // but if delay < 10 minutes, check again in 2 minutes
    // For simplicity, we use a fixed interval here
    console.log('-------------------------------');
    console.log(
      `Waiting 5 minutes before next check for workflow ${workflowId} route ${originAddress} to ${destinationAddress}`,
    );
    console.log('-------------------------------');
    await sleep('5 minute');
    maxChecks--;
  }
  console.log('-------------------------------');
  console.log(`Max checks reached. Ending workflow ${workflowId} for route ${originAddress} to ${destinationAddress}`);
  console.log('-------------------------------');
}
