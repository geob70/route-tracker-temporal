import { OpenAI } from 'openai';

import dotenv from 'dotenv';
dotenv.config();

type AIMessage = {
  subject: string;
  message: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});


/**
 * Generates a friendly delay message using AI
 * @param originAddress
 * @param destinationAddress
 * @param delay
 * @param workflowId
 * @returns { subject: string; message: string }
 *
 * If AI generation fails or the response is malformed, a fallback message is returned.
 */
export async function composeDelayMessage(
  originAddress: string,
  destinationAddress: string,
  delay: number,
  workflowId: string,
): Promise<AIMessage> {
  // Fallback message in case AI generation fails
  const fallBackMessage = `Dear customer! We’re seeing a delay of about ${delay} minutes on your delivery route ${originAddress} to ${destinationAddress}. Thanks for your patience — we’ll keep you updated!`;

  console.log('-------------------------------');
  console.log('Generating AI message... for workflow', workflowId);
  console.log('-------------------------------');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly assistant helping a logistics company called Eagle Express notify customers about delivery delays. Always respond with an object of "subject" and "message" fields.',
        },
        {
          role: 'user',
          content: `Generate a short, friendly message for a customer whose delivery route ${originAddress} to ${destinationAddress} has a traffic delay of ${delay} minutes.`,
        },
      ],
    });
    const raw = response.choices[0].message?.content as unknown as AIMessage;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!raw) {
      console.warn('⚠️ AI response is empty');
      return { subject: 'Delivery Delay Notification', message: fallBackMessage };
    }

    if (!parsed.subject || !parsed.message) {
      console.warn('⚠️ AI response missing expected fields:', parsed);
      return { subject: 'Delivery Delay Notification', message: fallBackMessage };
    }

    return parsed;
  } catch (error) {
    console.error(
      `AI message generation failed for workflow ${workflowId} route ${originAddress} to ${destinationAddress}:`,
      error,
    );

    // Fallback message
    return { subject: 'Delivery Delay Notification', message: fallBackMessage };
  }
}
