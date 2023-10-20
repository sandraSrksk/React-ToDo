import React, { useEffect, useState } from 'react';
import Axios from 'axios';

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks from the server when the component mounts
    Axios.get('/api/tasks') // Replace with the actual endpoint URL
      .then((response) => setTasks(response.data))
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  const handleDeleteTask = (taskId) => {
    // Send a DELETE request to the server to delete the task
    Axios.delete(`/api/tasks/${taskId}`) // Replace with the actual DELETE endpoint
      .then(() => {
        // Remove the deleted task from the tasks state
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  return (
    <div>
      <h1>Task List</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.name}
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;

