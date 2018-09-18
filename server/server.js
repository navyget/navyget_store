import express from 'express';
import bodyParser from 'body-parser';
import storeRoutes from './routes/store';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/navyget-api/v1/store', storeRoutes)

app.listen(port, () => {
  console.log(`Started on Navyget store micro-service on ${port}`);
});
