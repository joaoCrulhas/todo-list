import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { ApiService } from "./services/api";
import DatePicker from "react-datepicker";
import { useState, useEffect, useCallback, useRef } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  TextField,
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  Grid,
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

  const [loading, setLoading] = useState(true);
  const loader = useRef(null);
  const [page, setPage] = useState(0);
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [finish, setFinish] = useState(false);
  const [newTodo, setNewTodo] = useState({
    text: "",
    endDate: new Date(),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response = await apiService().index(page * 20);
    setTodos((prev) => {
      return [...prev, ...response];
    });
    if (!response.length || response.length < 20) {
      setFinish(true);
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [apiService, page]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && !finish) {
        setPage((prev) => prev + 1);
      }
    },
    [loading, finish]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) {
      observer.observe(loader.current);
    }
  }, [handleObserver]);

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
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={8} md={8}>
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
            </Grid>
            <Grid item xs={4} md={2} sx={{ display: "flex" }}>
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
            </Grid>
            <Grid
              item
              xs={4}
              md={2}
              sx={{ display: "flex", justifyContent: "center" }}
            >
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
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {todos.length ? (
        <DragDropContext
          onDragEnd={async (...props) => {
            const oldTodos = todos;
            const { destination, source, draggableId } = props[0];
            try {
              await apiService().put(draggableId, undefined, destination.index);
              const minIndex = Math.min(destination.index, source.index);
              const maxIndex = Math.max(destination.index, source.index);
              const newSortedTodos = todos.map((todo) => {
                let direction = 1;
                if (destination.index > source.index) {
                  direction = -1;
                }
                if (todo.position < minIndex || todo.position > maxIndex) {
                  return todo;
                }
                if (todo.id === draggableId) {
                  return {
                    ...todo,
                    position: destination.index,
                  };
                }
                return {
                  ...todo,
                  position: todo.position + direction,
                };
              });
              newSortedTodos.sort((a, b) => a.position - b.position);
              console.log(newSortedTodos);
              setTodos(newSortedTodos);
            } catch (error) {
              setTodos(oldTodos);
            }
          }}
        >
          <Droppable droppableId="todoList">
            {(provider) => (
              <div ref={provider.innerRef} {...provider.droppableProps}>
                <TodoList
                  classes={classes}
                  data={todos}
                  deleteTodo={deleteTodo}
                  toggleComplete={toggleTodoCompleted}
                />
                {provider.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : null}
      {finish ? null : <div ref={loader} />}
    </Container>
  );
}

const TodoList = ({ classes, data, deleteTodo, toggleComplete }) => {
  return (
    <Paper className={classes.todosContainer}>
      <Box display="flex" flexDirection="column" alignItems="stretch">
        {data.map(({ id, text, completed, endDate }, index) => {
          const task = { id, text, completed, endDate, classes };
          return (
            <Draggable key={task.id} index={index} draggableId={task.id}>
              {(provider) => (
                <div
                  {...provider.draggableProps}
                  {...provider.dragHandleProps}
                  ref={provider.innerRef}
                >
                  <Task
                    data={task}
                    deleteTodo={deleteTodo}
                    toggleComplete={toggleComplete}
                  />
                  {/* {provider.placeholder} */}
                </div>
              )}
            </Draggable>
          );
        })}
      </Box>
    </Paper>
  );
};

export default Todos;
