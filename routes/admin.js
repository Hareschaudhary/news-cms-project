import express from 'express';
const router = express.Router();

// import user controllers file
import{
    loginPage,
    adminLogin,
    logout,
    allUsers,
    addUserPage,
    addUser,
    updateUserPage,
    updateUser,
    deleteUser,
    dashboard,
    settings,
    savesettings

}from '../controllers/user.Controller.js'

// import category controllers
import{
    allCategorys,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
}from '../controllers/category.Controller.js'

// import article controllers
import{
    allArtcles,
    addArtclePage,
    addArtcle,
    updateArtclePage,
    updateArtcle,
    deleteArtcle
}from '../controllers/artcle.Controller.js'

// import comment controllers
import{
    allComments,
    deleteComment,
    updateComentStatus

}from '../controllers/comment.Controller.js';

// import midelware
import isLogin from '../midelware/isLogin.js';
import isAdmin from '../midelware/isAdmin.js';
import upload from '../midelware/fileLoad.js';

// import form validaction
import {
 loginValidation,
 userValidation,
 userUpdateValidation,
 categoryValidation,
 articleValidation

} from '../midelware/formValidaction.js';

// login routes
router.get('/', loginPage);
router.post('/index', loginValidation, adminLogin);
router.get('/logout', logout);
router.get('/dashboard',isLogin, dashboard);
router.get('/settings',isLogin,isAdmin, settings);
router.post('/save-settings',isLogin,isAdmin,upload.single("website_image"), savesettings);

// user CRUD routes
router.get('/users',isLogin,isAdmin,allUsers);
router.get('/add-user',isLogin,isAdmin,addUserPage); 
router.post('/add-user',isLogin,isAdmin, userValidation,addUser);
router.get('/update-user/:id',isLogin,isAdmin,updateUserPage);
router.post('/update-user/:id',isLogin,isAdmin,userUpdateValidation,updateUser);
router.delete('/delete-user/:id',isLogin,isAdmin,deleteUser);

//category CRUD routes
router.get('/category',isLogin,isAdmin,allCategorys);
router.get('/add-category',isLogin,isAdmin,addCategoryPage);
router.post('/add-category',isLogin,isAdmin,categoryValidation,addCategory);
router.get('/update-category/:id',isLogin,isAdmin,updateCategoryPage);
router.post('/update-category/:id',isLogin,isAdmin,categoryValidation,updateCategory);
router.delete('/delete-category/:id',isLogin,isAdmin,deleteCategory);

//article CRUD routes
router.get('/artcle',isLogin, allArtcles);
router.get('/add-artcle',isLogin, addArtclePage);
router.post('/add-artcle',isLogin,upload.single("image"),articleValidation, addArtcle);
router.get('/update-artcle/:id',isLogin, updateArtclePage);
router.post('/update-artcle/:id',isLogin,upload.single("image"),articleValidation, updateArtcle);
router.delete('/delete-artcle/:id',isLogin, deleteArtcle);

//comments routes
router.get('/comments',isLogin, allComments); 
router.put('/update-comment-status/:id',isLogin,updateComentStatus); 
router.delete('/delete-comment/:id',isLogin, deleteComment); 

//error routes
router.use((req, res, next) => {
    const error = new Error("Page Not Found");
    error.status = 404;
    next(error);
});

router.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).render("admin/err", {
        message,
        status,
        err: err.error || "Internal Server Error",
        layout: false
    });
});


export default router;
