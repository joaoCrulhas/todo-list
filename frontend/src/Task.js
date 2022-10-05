import DatePicker from "react-datepicker";
import { useState, useEffect } from "react";
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

const Task = ({ deleteTodo, data, toggleComplete }) => {
  const { id, completed, text, endDate, classes } = data;
  return (
    <Box
      key={id}
      display="flex"
      flexDirection="row"
      alignItems="center"
      className={classes.todoContainer}
    >
      <Checkbox
        checked={completed}
        onChange={() => toggleComplete(id)}
      ></Checkbox>
      <Box flexGrow={1}>
        <Typography
          className={completed ? classes.todoTextCompleted : ""}
          variant="body1"
        >
          {text}
        </Typography>
      </Box>
      <Box flexGrow={1}>
        <Typography
          className={completed ? classes.todoTextCompleted : ""}
          variant="body1"
        >
          {endDate}
        </Typography>
      </Box>
      <Button
        className={classes.deleteTodo}
        startIcon={<Icon>delete</Icon>}
        onClick={() => deleteTodo(id)}
      >
        Delete
      </Button>
    </Box>
  );
};

export default Task;
