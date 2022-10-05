const express = require('express');
const { v4: generateId } = require('uuid');
const database = require('./database');
const ObjectID = require('mongodb').ObjectID;

const app = express();

function requestLogger(req, res, next) {
  res.once('finish', () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push('->', res.statusCode);
    // eslint-disable-next-line no-console
    console.log(log.join(' '));
  });
  next();
}

app.use(requestLogger);
app.use(require('cors')());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  const { offset } = req.query;
  const todos = database.client.db('todos').collection('todos');
  const response = await todos.find({}).limit(20).skip(parseInt(offset)).toArray();
  res.status(200);
  res.json(response);
});

app.post('/', async (req, res) => {
  const { text, endDate } = req.body;
  if (typeof text !== 'string') {
    res.status(400);
    res.json({ message: "invalid 'text' expected string" });
    return;
  } 

  const todo = { id: generateId(), text, completed: false, endDate };
  await database.client.db('todos').collection('todos').insertOne(todo);
  res.status(201);
  res.json(todo);
});

app.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    res.status(400);
    res.json({ message: "invalid 'completed' expected boolean" });
    return;
  }
  const myquery = { id: id };
  const newvalues = { $set: { completed } };
  await database.client.db('todos').collection('todos').updateOne(myquery, newvalues)
  res.json({ id })
  res.status(200);
  res.end();
});

app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await database.client.db('todos').collection('todos').deleteOne({ id });
  res.status(203);
  res.end();
});

module.exports = app;
