const express = require('express');
const taskController = require("./controllers/task")

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


function validateBodyRequest(req, res, next) {
  const { text } = req.body;
  if (typeof text !== 'string') {
    res.status(400);
    res.json({ message: "invalid 'text' expected string" });
    return;
  }
  next()
}

function validateBodyRequestPut(req, res, next) {
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    res.status(400);
    res.json({ message: "invalid 'completed' expected boolean" });
    return;
  }
  next()
}

app.get('/', taskController.index);
app.put('/:id', validateBodyRequestPut, taskController.put);
app.post('/', validateBodyRequest, taskController.post);
app.delete('/:id', taskController.destroy);

module.exports = app;
