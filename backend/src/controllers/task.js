const { v4: generateId } = require('uuid');
const database = require("../database");
const index = async (req, res) => {
    const { offset } = req.query;
    const todos = database.client.db('todos').collection('todos');
    let response = await todos.find({}).toArray();
    response = response.sort((a,b) => a.position - b.position);
    res.status(200);
    res.json(response);
    res.end();
}
const post = async (req, res) => {
    const { text, endDate } = req.body;
    const position = await database.client.db('todos').collection('todos').countDocuments();
    const todo = { id: generateId(), text, completed: false, endDate, position };
    await database.client.db('todos').collection('todos').insertOne(todo);
    res.status(201);
    res.json(todo);
    res.end();
};

const put = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const myquery = { id: id };
    const newvalues = { $set: { completed } };
    await database.client.db('todos').collection('todos').updateOne(myquery, newvalues)
    res.json({ id })
    res.status(200);
    res.end();
}
const destroy = async (req, res) => {
    const { id } = req.params;
    await database.client.db('todos').collection('todos').deleteOne({ id });
    res.status(203);
    res.end();
  }

module.exports = {
    destroy,
    post,
    put,
    index,
}