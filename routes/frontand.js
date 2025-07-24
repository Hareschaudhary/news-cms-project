import express from 'express';
const router = express.Router();

import {
    index,
    articleByCategory,
    singleArticle,
    search,
    author,  
    addComment,
    sendEmail,
    contact
} from '../controllers/side.Controller.js';

router.get('/', index);
router.get('/category/:name',articleByCategory);
router.get('/single/:id',singleArticle);
router.get('/search/',search);
router.get('/author/:name',author);
router.post('/single/:id/comment',addComment);
router.post('/send-email',sendEmail);
router.get('/contact-us',contact);

router.use((req, res, next) => {
    const error = new Error("Page Not Found");
    error.status = 404;
    next(error);
});

router.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).render("err", {
        message,
        status,
        err: err.error || "Internal Server Error",
        layout: false
    });
});


export default router;
