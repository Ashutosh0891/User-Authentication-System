const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./db');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');


dotenv.config();
const app = express();
const PORT = process.env.PORT;
connectDB();

app.use(express.json());
app.use(session({
    secret: 'session secret',
    resave: true,
    saveUninitialized: false
}));

app.use('/api/users', userRoutes);


app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`)
})

