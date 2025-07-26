import userModels from "../models/users.js";
import newsModels from "../models/news.js";
import categoryModels from "../models/categoris.js";
import settingmodels from "../models/setting.js";
import commentModels from "../models/comment.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import getCloudinaryPublicId from "../utilitis/cloudnaryPublicID.js"
import transporter from "../midelware/nodemailer.js";



// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const loginPage = async (req, res) => {
        res.render("admin/login",
                {
                        layout: false,
                        message: "",
                        errors: []
                });
}

// admin login page data add
const adminLogin = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.render("admin/login",
                        {
                                layout: false,
                                message: "",
                                errors: errors.array()
                        }
                );
        }
        const { username, password } = req.body;
        try {
                const user = await userModels.findOne({ username })

                if (!user) {
                        return res.render("admin/login", {
                                layout: false,
                                message: "username or password not match",
                                errors: []
                        });
                }

                const isMatch = await bcrypt.compare(password, user.password)

                if (!isMatch) {
                        return res.render("admin/login", {
                                layout: false,
                                message: "username or password not match",
                                errors: []
                        });
                }

                const token = jwt.sign({ id: user._id, fullname: user.fullname, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

                res.cookie("token", token, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60,
                })
                // *********************************user loginsend mail start**********************                 
                try {
                const info = await transporter.sendMail({
                from: "nayanchaudhary539@gmail.com", 
                to: 'nayanchaudhary539@gmail.com', 
                subject: "Blog CMS Project Login newUser",
                text: `From: Blog CMS Project Login newUser ${user.fullname}`,
                });
                } catch (error) {
                console.log(error);
                }
                // *********************************user loginsend mail end**********************
                res.redirect("/admin/dashboard");
        } catch (err) {
                console.log(err);
                return next({
                        message: "server error",
                        status: 500,
                        error: err
                });

        }
}

const logout = async (req, res) => {
        res.clearCookie("token");
        res.redirect("/admin/");
}

const dashboard = async (req, res, next) => {
        try {
                let allUsersCount = ""
                let allArtclesCount = ""
                let allCategoriesCount = ""
                let allCommentsCount = ""
                if (req.role === "admin") {
                        allUsersCount = await userModels.countDocuments({});
                        allArtclesCount = await newsModels.countDocuments({});
                        allCategoriesCount = await categoryModels.countDocuments({});
                        allCommentsCount = await commentModels.countDocuments({});
                } else {
                        allArtclesCount = await newsModels.countDocuments({ author: req.id });
                        allCategoriesCount = await categoryModels.countDocuments({});
                        const allArtcles = await newsModels.find({ author: req.id });
                        let allArtclesid = allArtcles.map(allArtcles => allArtcles._id);
                        allCommentsCount = await commentModels.countDocuments({ article: { $in: allArtclesid } });
                }

                // find all setting
                const settings = await settingmodels.findOne({});
                res.render("admin/dashboard", {
                        role: req.role,
                        fullname: req.fullname,
                        allUsersCount,
                        allArtclesCount,
                        allCategoriesCount,
                        settings,
                        req: req,
                        allCommentsCount
                });
        } catch (error) {
                return next({
                        message: "server error",
                        status: 500,
                        error, error
                });
        }
}

const settings = async (req, res, next) => {
        try {
                const settings = await settingmodels.findOne({});


                res.render("admin/settings", {
                        settings,
                        role: req.role,
                        fullname: req.fullname,
                        req: req
                });
        } catch (error) {
                // console.log(error);
                // res.status(500).send("server error");
                return next({
                        message: "server error",
                        status: 500,
                        error, error
                });
        }
}

const savesettings = async (req, res, next) => {
        try {
                const { website_name, website_description, website_old_image } = req.body;
                
                console.log("website_old_image:", website_old_image);
                let website_image = ""; // declare early

                if (req.cloudinaryUrl) {
                const oldImagePublicId = getCloudinaryPublicId(website_old_image); // fix version issue

                if (oldImagePublicId) {
                try {
                await cloudinary.uploader.destroy(oldImagePublicId, { invalidate: true });
                console.log("✅ Deleted from Cloudinary:", oldImagePublicId);
                } catch (err) {
                if (err.message !== 'not found') {
                        console.log("❌ Error deleting from Cloudinary:", err);
                }
                }
                }

                website_image = req.cloudinaryUrl; // assign new image URL
                } else {
                website_image = null ; // or keep old if you prefer
                }


                const settings = await settingmodels.findOne({});

                if (!settings) {
                        const newSettings = new settingmodels({
                                website_name,
                                website_description,
                                website_image
                        });
                      let data =  await newSettings.save();
                //       return res.json(data)

                        res.redirect("/admin/settings");
                } else {
                        settings.website_name = website_name;
                        settings.website_description = website_description;
                        if (website_image) {
                                settings.website_image = website_image;
                        }
                        let data = await settings.save();
                        // return res.json(data)
                        res.redirect("/admin/settings");
                }
        } catch (error) {
                // console.log(error);
                // res.status(500).send("server error");

                return next({
                        message: "server error",
                        status: 500,
                        error: error
                });
        }
}

const allUsers = async (req, res, next) => {
        try {
                const users = await userModels.find({});
                // find all setting
                const settings = await settingmodels.findOne({});
                res.render("admin/users/index", { users, role: req.role, fullname: req.fullname, settings, req: req });
        } catch (error) {
                return next({
                        message: "server error",
                        status: 500,
                        error: error
                });
        }
}

const addUserPage = async (req, res, next) => {
        const settings = await settingmodels.findOne({});
        res.render("admin/users/create",{role: req.role, fullname: req.fullname, settings,errors: [], req:req });
}

const addUser = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                 const settings = await settingmodels.findOne({});
                return res.render("admin/users/create", {
                        role: req.role,
                        fullname: req.fullname,
                        settings,
                        errors: errors.array(),
                        req: req
                });
        }

        try {
                await userModels.create(req.body);
                res.redirect("/admin/users");
        } catch (err) {
                // console.log(err);
                // res.status(500).send("server error");
                return next({
                        message: "server error",
                        status: 500,
                        error: err
                });
        }
}

const updateUserPage = async (req, res, next) => {
        try {
                const user = await userModels.findById(req.params.id);
                if (!user) {
                        // return res.status(404).send("User not found");
                        return next({
                                message: "User not found",
                                status: 404,
                                error: ""

                        });
                }
                res.render("admin/users/update", { user, role: req.role, fullname: req.fullname, errors: [], req: req });
        } catch (err) {
                // console.log(err);
                // res.status(500).send("internal server error");
                return next({
                        message: "server error",
                        status: 500,
                        error
                });
        }
}

const updateUser = async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                const user = await userModels.findById(req.params.id);
                return res.render("admin/users/update", {
                        user: user,
                        role: req.role,
                        fullname: req.fullname,
                        errors: errors.array()
                });
        }

        const id = req.params.id;

        const { fullname, username, password, role } = req.body;

        try {
                const user = await userModels.findById(id);
                if (!user) {
                        // res.status(404).send("user not found")
                        return next({
                                message: "User not found",
                                status: 404,
                                error: ""
                        });
                }

                user.fullname = fullname || user.fullname;
                user.username = username || user.username;
                user.role = role || user.role;
                if (password) {
                        user.password = password;
                }

                await user.save();
                res.redirect("/admin/users");
        } catch (err) {
                // console.log(err);
                // res.status(500).send("server error");
                return next({
                        message: "server error",
                        status: 500,
                        error
                });
        }
}

const deleteUser = async (req, res, next) => {
        try {
                const deleteUser = await userModels.findById(req.params.id);
                if (!deleteUser) {
                        return next({
                                message: "User not found",
                                status: 404,
                                error: ''
                        });
                }
                const article = await newsModels.find({ author: req.params.id });
                if (article && article.length > 0) {
                        return res.status(400).send({ success: false, message: "User has articles" });
                }
                await deleteUser.deleteOne();
                res.json({ success: true });
        } catch (err) {
                return next({
                        message: "server error",
                        status: 500,
                        error: err
                });
        }
}



export {
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
}