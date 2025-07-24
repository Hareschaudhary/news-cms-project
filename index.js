import express from 'express';
const app = express();
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import expressEjsLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import FrontendRouter from './routes/frontand.js';
import AdminRouter from './routes/admin.js';


// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// midelware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressEjsLayouts);
app.set("layout", "layout");

app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => { 
    console.log('Connected to MongoDB');
    }).catch(err => {   
    console.error('MongoDB connection error:', err);
});


app.use('/admin',(req,res,next)=>{
  res.locals.layout = "admin/layout";
  next();
});

app.use('/admin',AdminRouter);

// routes
app.use('/',FrontendRouter);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});