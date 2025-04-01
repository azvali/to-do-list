import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks')
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    fetchTasks()
  }, [])

  const handleAddTask = async () => {
    if (!task.trim()) return

    try {
      const response = await fetch('http://localhost:5000/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: task }),
      })

      if (!response.ok) {
        throw new Error('Failed to add task')
      }

      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setTask('') 
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleToggleComplete = async (id, completed) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }
  
  const handleRemoveTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/remove/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove task')
      }

      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error('Error removing task:', error)
    }
  }

  return (
    <>
      <div className="container">
        <h1>Task Manager</h1>
        
        <div className="input-section">
          <input 
            type="text"
            placeholder="Enter a new task..."
            className="task-input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <button className="add-button" onClick={handleAddTask}>Add Task</button>
        </div>

        <div className="tasks-container">
          <ul className="tasks-list">
            {tasks.map((task) => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                    className="task-checkbox"
                  />
                  <span>{task.title}</span>
                </div>
                <button className='remove-button' onClick={() => handleRemoveTask(task.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default App
