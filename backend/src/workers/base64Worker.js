import { workerData, parentPort } from 'worker_threads';

const base64 = workerData.buffer.toString('base64');
parentPort.postMessage(base64);
