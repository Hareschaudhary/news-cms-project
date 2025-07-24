import userModels from "../models/users.js";
import newsModels from "../models/news.js";
import categoryModels from "../models/categoris.js";
import settingmodels from "../models/setting.js";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();
import { fileURLToPath } from 'url';


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
                res.redirect("/admin/dashboard");
        } catch (err) {
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
                if (req.role === "admin") {
                        allUsersCount = await userModels.countDocuments({});
                        allArtclesCount = await newsModels.countDocuments({});
                        allCategoriesCount = await categoryModels.countDocuments({});
                } else {
                        allArtclesCount = await newsModels.countDocuments({ author: req.id });
                        allCategoriesCount = await categoryModels.countDocuments({});
                }

                // find all setting
                const settings = await settingmodels.findOne({});
                res.render("admin/dashboard", {
                        role: req.role,
                        fullname: req.fullname,
                        allUsersCount,
                        allArtclesCount,
                        allCategoriesCount,
                        settings
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
                        fullname: req.fullname
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
                let website_image = ""
                if (req.file) {
                        website_image = req.file.filename
                        if (website_old_image) {
                                let oldpath = path.join(__dirname, `../public/uploads/${website_old_image}`);
                                try {
                                        fs.unlinkSync(oldpath);
                                } catch (err) {
                                        console.log(err);
                                }
                        }
                } else {
                        website_image = null
                }
                const settings = await settingmodels.findOne({});
                if (!settings) {
                        const newSettings = new settingmodels({
                                website_name,
                                website_description,
                                website_image
                        });
                        await newSettings.save();
                        res.redirect("/admin/settings");
                } else {
                        settings.website_name = website_name;
                        settings.website_description = website_description;
                        if (website_image) {
                                settings.website_image = website_image;
                        }
                        await settings.save();
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
                res.render("admin/users/index", { users, role: req.role, fullname: req.fullname, settings });
        } catch (error) {
                return next({
                        message: "server error",
                        status: 500,
                        error: error
                });
        }
}

const addUserPage = async (req, res) => {
        res.render("admin/users/create", { role: req.role, fullname: req.fullname, errors: [] });
}

const addUser = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.render("admin/users/create", {
                        role: req.role,
                        fullname: req.fullname,
                        errors: errors.array()
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
                res.render("admin/users/update", { user, role: req.role, fullname: req.fullname, errors: [] });
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