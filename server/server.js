import express from 'express';
import bodyParser from 'body-parser';
import storeRoutes from './routes/store';
import './config/config';
import { mongoose } from './db/mongoose';

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use('/navyget-api/v1/store', storeRoutes);

app.listen(port, () => {
  console.log(`Started on Navyget store micro-service on ${port}`);
});
