
import categoryModels from "../models/categoris.js";
import { validationResult } from "express-validator";
import newsModels from "../models/news.js";
import settingmodels from "../models/setting.js"

const allCategorys = async (req, res, next) => {
    try {
        const allCategory = await categoryModels.find({});

        // find all setting
        const settings = await settingmodels.findOne({});
        res.render("admin/categoris/index", { role: req.role, fullname: req.fullname, allCategory, settings ,req: req});
    } catch (error) {
        // res.status(500).send("server error");
        return next({
            message: "server error",
            status: 500,
            error: error
        });

    }
}

const addCategoryPage = async (req, res) => {
    // find all setting
    const settings = await settingmodels.findOne({});
    res.render("admin/categoris/create", { role: req.role, fullname: req.fullname, errors: [], settings ,req: req});
}

const addCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        // find all setting
        const settings = await settingmodels.findOne({});
        return res.render("admin/categoris/create", {
            role: req.role,
            fullname: req.fullname,
            errors: errors.array(),
            settings,
            req: req
        });
    }
    try {
        await categoryModels.create(req.body)
        res.redirect("/admin/category");
    } catch (err) {
        return next({
            message: "server error",
            status: 500,
            error: err
        });
    }
}

const updateCategoryPage = async (req, res, next) => {
    try {
        const user = await categoryModels.findById(req.params.id);
        if (!user) {
            return next({
                message: "category not found",
                status: 404,
                error: ''
            });
        }

        // find all setting
        const settings = await settingmodels.findOne({});
        res.render("admin/categoris/update", { role: req.role, fullname: req.fullname, category: user, errors: [], settings ,req: req});
    } catch (err) {
        return next({
            message: "server error",
            status: 500,
            error: err
        });
    }
}

const updateCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const category = await categoryModels.findById(req.params.id);
        // find all setting
        const settings = await settingmodels.findOne({});
        return res.render("admin/categoris/update", {
            role: req.role,
            fullname: req.fullname,
            category: category,
            errors: errors.array(),
            settings,
            req: req
        });
    }
    try {
        const user = await categoryModels.findById(req.params.id);
        const { name, description } = req.body
        if (!user) {
            return next({
                message: "category not found",
                status: 404,
                error: ''
            });
        }
        user.name = name || user.name;
        user.description = description || user.description;
        await user.save();
        res.redirect("/admin/category");
    } catch (error) {
        return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

const deleteCategory = async (req, res, next) => {
    try {
        const deleteCategory = await categoryModels.findById(req.params.id);
        if (!deleteCategory) {
            return next({
                message: " category not found",
                status: 404,
                error: ''
            });
        }
        const article = await newsModels.find({ category: req.params.id });
        if (article && article.length > 0) {
            return res.status(400).send({ success: false, message: "category has articles" });
        }
        await deleteCategory.deleteOne();
        res.json({ success: true });
    } catch (err) {
        return next({
            message: "server error",
            status: 500,
            error
        });
    }
}

export {
    allCategorys,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
}