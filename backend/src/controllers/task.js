const { v4: generateId } = require('uuid');
const database = require("../database");
const index = async (req, res) => {
    let { offset } = req.query;
    offset = (offset)  ? offset :0; 
    const todos = database.client.db('todos').collection('todos');
    let response = await todos.find({}).toArray();
    response = response.sort((a,b) => a.position - b.position);
    const start = (parseInt(offset));
    const end = start + 20;
    const splitedArray = response.slice(start, end);
    res.status(200);
    res.json(splitedArray);
    return res.end();
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

const reorderTasks = async (position) => {
    const tasks = await database.client.db('todos').collection('todos').find( { position: { $gt: (position - 1) } } ).toArray();
    tasks.forEach(async (task) => {
        const newPostion =task.position + 1
        await database.client.db('todos').collection('todos').updateOne({
            id: task.id
        }, { $set: {position: newPostion } })
    });
}

const put = async (req, res) => {
    const { id } = req.params;
    const { completed, position } = req.body;
    let fields= { completed };
    if (position) {
        fields.position = position;
        await reorderTasks(position);
    }
    const myquery = { id: id };
    const newvalues = { $set: fields };
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