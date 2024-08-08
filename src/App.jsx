import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle, AlertCircle, Trash2, Clipboard } from 'lucide-react';

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('currentDayTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [currentTask, setCurrentTask] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('currentDayTasks', JSON.stringify(tasks));
  }, [tasks]);

  const startTracking = () => {
    if (currentTask.trim() === '') {
      setError('Please enter a task name before starting the timer.');
      return;
    }
    setError('');
    setIsTracking(true);
    startTimeRef.current = Date.now() - elapsedTime * 1000;
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTracking(false);
    if (currentTask && elapsedTime > 0) {
      const newTask = { 
        id: Date.now(),
        name: currentTask, 
        duration: elapsedTime,
        date: new Date().toISOString(),
        durations: {}
      };

      const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'short' });
      const formattedDuration = formatTime(elapsedTime);
      newTask.durations[dayOfWeek] = formattedDuration;

      setTasks(prevTasks => [...prevTasks, newTask]);
      setCurrentTask('');
      setElapsedTime(0);
      setFeedback('Task saved');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setFeedback('Task deleted');
    setTimeout(() => setFeedback(''), 3000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitData = async () => {
    try {
      console.log('Submitting tasks:', JSON.stringify(tasks, null, 2));
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks })
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      setSubmissionFeedback('Data submitted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmissionFeedback('Failed to submit data');
    }
    setTimeout(() => setSubmissionFeedback(''), 3000);
  };

  const totalTime = tasks.reduce((acc, task) => acc + task.duration, 0);

  const fetchTasks = async () => {
    const response = await fetch('http://localhost:3000/tasks');
    const tasks = await response.json();
    setTasks(tasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-grow text-center">
          <h1 className="text-2xl font-bold">Flexile Time Tracker</h1>
        </div>
        <div className="text-sm text-right">
          <div>{currentDateTime.toLocaleDateString()}</div>
          <div>{currentDateTime.toLocaleTimeString()}</div>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={currentTask}
          onChange={(e) => {
            setCurrentTask(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter task name"
          className={`w-full p-2 border rounded ${error ? 'border-red-500' : ''}`}
        />
        {error && (
          <div className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`flex items-center px-4 py-2 rounded ${
            isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isTracking ? <StopCircle className="mr-2" /> : <Play className="mr-2" />}
          {isTracking ? 'Stop' : 'Start'}
        </button>
        <div className="text-xl font-mono">{formatTime(elapsedTime)}</div>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Today's Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{task.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{formatTime(task.duration)}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold">Total Time:</span>
        <span className="font-mono">{formatTime(totalTime)}</span>
      </div>
      <div className="mt-4">
        <button
          onClick={submitData}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          <Clipboard className="mr-2" />
          Submit Data
        </button>
      </div>
      {feedback && (
        <div className="mt-2 text-center text-green-600">{feedback}</div>
      )}
      {submissionFeedback && (
        <div className={`mt-2 text-center ${submissionFeedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {submissionFeedback}
        </div>
      )}
    </div>
  );
};

export default App;