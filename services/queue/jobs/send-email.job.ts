import { Queue, Worker, QueueEvents } from 'bullmq';
import sendEmailProcessor from '../processes/send-email.process';
import logger from '../../../utils/logger';

const queue = new Queue('SendEmail');

export const sendEmail = (data: any) => {
  queue.add('excel-to-pdf', data);
}

new Worker('SendEmail', async job => {
  if (job.name === 'excel-to-pdf') {
    await sendEmailProcessor(job.data);
  }
});

const queueEvents = new QueueEvents('SendEmail');
queueEvents.on('completed', ({ jobId }) => {
  logger.info('Email has been sent successfully');
});
queueEvents.on(
  'failed',
  ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    logger.error('Error sending mail', failedReason);
  },
);