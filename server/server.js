import express from 'express';
import bodyParser from 'body-parser';
import {ObjectID} from 'mongodb';
import {mongoose} from './db/mongoose';
import {Stores} from './models/stores';

const { Stores } = require('./models/stores');
const { Items } = require('./models/items');
const { Services } = require('./models/services');


const app = express();
const port  = process.env.PORT || 3000;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
