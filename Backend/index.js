const express = require('express');  
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const swaggerDocsUI = require('./swagger');

swaggerDocsUI(app);
app.use(express.json());
app.use(cors()); // cross origin resource sharing

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'task_manager'
});

db.connect((err) => {
    if (err) {
        console.log(err);
    }
    console.log('Database connected');
});

/**
 * @swagger
 * /addtask:
 *   post:
 *     summary: Add a new task
 *     description: This endpoint adds a new task to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task added successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Task name must be unique
 *       500:
 *         description: Internal server error
 */
app.post('/addtask', (req, res) => {
    const { name, description, due_date } = req.body;
    if (!name || !description || !due_date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const checkDuplicate = 'SELECT * FROM tasks WHERE name = ?';
    db.query(checkDuplicate, [name], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to check for duplicate task" });
        }

        if (result.length > 0) {
            return res.status(409).json({ error: "Task with this name already exists" });
        }

        const sql = 'INSERT INTO tasks (name, description, due_date) VALUES (?, ?, ?)';
        db.query(sql, [name, description, due_date], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Failed to add task" });
            }
            res.status(201).json({ message: 'Task added', taskId: result.insertId });
        });
    });
});


/**
 * @swagger
 * /gettasks:
 *   get:
 *     summary: Retrieve all tasks
 *     description: Fetches all tasks from the database.
 *     responses:
 *       200:
 *         description: A list of tasks
 *       500:
 *         description: Failed to fetch tasks
 */
app.get('/gettasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to fetch tasks" });
        }
        res.send(result);
    });
});

/**
 * @swagger
 * /update/{id}:
 *   put:
 *     summary: Update an existing task
 *     description: Updates the name, description, and due date of an existing task.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Failed to update task
 */
app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, due_date } = req.body;
    if (!name || !description || !due_date) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const checkDuplicate = 'SELECT * FROM tasks WHERE name = ? AND id != ?';
    db.query(checkDuplicate, [name, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to check for duplicate task" });
        }

        if (result.length > 0) {
            return res.status(409).json({ error: "Task with this name already exists" });
        }

        const sql = 'UPDATE tasks SET name = ?, description = ?, due_date = ? WHERE id = ?';
        db.query(sql, [name, description, due_date, id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Failed to update task" });
            }
            res.status(200).json({ message: 'Task updated' });
        });
    });
});


/**
 * @swagger
 * /delete-task:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task based on the provided task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       400:
 *         description: Task ID is required
 *       500:
 *         description: Failed to delete task
 */
app.delete('/delete-task', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to delete task" });
        }
        res.status(200).json({ message: 'Task deleted' });
    });
});

/**
 * @swagger
 * /complete-task:
 *   post:
 *     summary: Mark a task as complete
 *     description: Updates the task status to "complete" based on the provided task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task completed
 *       400:
 *         description: Task ID is required
 *       404:
 *         description: Task not found
 *       500:
 *         description: Failed to complete task
 */
app.post('/complete-task', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Task ID is required" });
    }
    const sql = 'UPDATE tasks SET status = true WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed to complete task" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: 'Task completed' });
    });
});

app.listen(5000, () => {
    console.log('Server started on port 5000');
});
