import { sendEmail } from './libs/email';
import { composeDelayMessage } from './libs/openAiMessage';
import { getRouteDuration } from './libs/routeApi';
import { convertSecondsToMinutes } from './utils/time';

/**
 *
 * @param origin
 * @param destination
 * @param threshold
 * @returns number | null
 * Checks for traffic delay between origin and destination
 * If delay exceeds threshold, returns the delay in minutes
 * Otherwise, returns null
 */
export async function checkTrafficDelay(
  origin: [number, number],
  destination: [number, number],
  threshold: number, // in minutes
): Promise<number | null> {
  // Fetch live route data
  // The value for duration is the current estimated time taken considering traffic
  // The value for staticDuration is the estimated time taken without traffic
  // The values are in seconds
  // If the difference between duration and staticDuration exceeds the threshold, return the delay in minutes
  // Otherwise, return null
  const { duration, staticDuration } = await getRouteDuration(origin, destination);
  const delay = convertSecondsToMinutes(duration) - convertSecondsToMinutes(staticDuration);

  return delay > threshold ? delay : null;
}

/**
 *
 * @param originAddress
 * @param destinationAddress
 * @param delay
 * @param workflowId
 * @returns { subject: string; message: string }
 * Generates a friendly delay message using AI
 */
export async function generateDelayMessage(
  originAddress: string,
  destinationAddress: string,
  delay: number,
  workflowId: string,
): Promise<{ subject: string; message: string }> {
  const message = await composeDelayMessage(originAddress, destinationAddress, delay, workflowId);
  return message;
}

export async function sendNotification(
  recipient: string,
  subject: string,
  message: string,
  workflowId: string,
): Promise<void> {
  await sendEmail(recipient, subject, message, workflowId);
}
