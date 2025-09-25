import express from 'express';
import logger from '#config/logger';

const app = express();

app.get('/', (req, res) => {
  logger.info('hello from winston');
  res.status(200).send('hello from acquisitions');
});

export default app;
