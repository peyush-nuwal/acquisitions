import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('hello from winston');
  res.status(200).send('hello from acquisitions');
});
app.use((req, res, ) => {
  res.status(404).json({ message: 'Route not found' });
});


// Global error handler
app.use((err, req, res, ) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});
export default app;
