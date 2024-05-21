const app = require('./app');
const express= require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts')
dotenv.config({path : './config.env'});
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');



// Routes
const GeneralRoutes = require('./routes/GeneralRoutes');
const StudentRoutes = require('./routes/StudentRoutes');
const AdminRoutes = require('./routes/AdminRoutes');
const InstructorRoutes = require('./routes/InstructorRoutes')

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.use(session({
    secret:'learn',
    cookie:{maxAge:60000},
    resave:false,
    saveUninitialized:false
}));
app.use(flash())

app.use(methodOverride('_method'));


LOCAL_CONN_STR = process.env.LOCAL_CONN_STR;

mongoose.connect(LOCAL_CONN_STR,{})
.then((conn)=>{
    console.log("DB Connection SucessFull");
}).catch((error)=>{
    console.log("DB Connection Failed");
})

PORT = process.env.PORT||2500;

app.listen(PORT , ()=>{
    console.log("Server Is Started");
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use('/eLearning/api/v1',GeneralRoutes);
app.use('/eLearning/api/v1/student',StudentRoutes);
app.use('/eLearning/api/v1/admin',AdminRoutes);
app.use('/eLearning/api/v1/instructor',InstructorRoutes);
