import { ApiService } from "./services/api";
import DatePicker from "react-datepicker";
import { useState, useEffect, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@mui/material";
import Task from "./Task";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

function Todos() {
  const apiService = useCallback(() => {
    return new ApiService("http://localhost:3001");
  }, []);

  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    text: "",
    endDate: new Date(),
  });

  useEffect(() => {
    async function fetchData() {
      const response = await apiService().index();
      setTodos(response);
    }
    fetchData();
  }, [apiService]);

  async function addTodo({ text, endDate }) {
    if (!text) {
      alert("Add a text in the text task");
      return;
    }
    const parsedDate = endDate.toISOString().substring(0, 10);
    const response = await apiService().post({
      text,
      endDate: parsedDate,
    });
    setTodos([...todos, response]);
    setNewTodo({
      text: "",
      endDate: new Date(),
    });
  }

  async function toggleTodoCompleted(id) {
    const completed = !todos.find((todo) => todo.id === id).completed;
    await apiService().put(id, completed);
    const newTodos = [...todos];
    const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
    newTodos[modifiedTodoIndex] = {
      ...newTodos[modifiedTodoIndex],
      completed: !newTodos[modifiedTodoIndex].completed,
    };
    setTodos(newTodos);
  }

  async function deleteTodo(id) {
    const { id: taskid } = await apiService().delete(id);
    setTodos(todos.filter((todo) => todo.id !== taskid));
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={3}>
            <TextField
              fullWidth
              value={newTodo.text}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  addTodo({
                    text: newTodo.text,
                    endDate: newTodo.endDate,
                  });
                }
              }}
              onChange={(event) =>
                setNewTodo((prevValue) => ({
                  ...prevValue,
                  text: event.target.value,
                }))
              }
            />
          </Box>
          <DatePicker
            id="date-picker"
            selected={newTodo.endDate}
            onChange={(date) =>
              setNewTodo((prevValue) => ({
                ...prevValue,
                endDate: date,
              }))
            }
          />
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() =>
              addTodo({
                text: newTodo.text,
                endDate: newTodo.endDate,
              })
            }
          >
            Add
          </Button>
        </Box>
      </Paper>
      {todos.length > 0 && (
        <Paper className={classes.todosContainer}>
          <Box display="flex" flexDirection="column" alignItems="stretch">
            {todos.map(({ id, text, completed, endDate }) => {
              const task = { id, text, completed, endDate, classes };
              return (
                <Task
                  key={task.id}
                  data={task}
                  deleteTodo={deleteTodo}
                  toggleComplete={toggleTodoCompleted}
                />
              );
            })}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Todos;
