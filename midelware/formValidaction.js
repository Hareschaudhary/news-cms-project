import {body} from "express-validator";

const loginValidation = [
  body("username")
  .trim()
  .notEmpty()
  .withMessage("username is required")
  .matches(/^\S+$/)
  .withMessage("username must not contain spaces")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("username must be 3 to 20 chars long"),

  body("password")
  .trim()
  .notEmpty()
  .withMessage("password is required")
  .isLength({ min: 3 , max: 20 })
  .withMessage("password must be 3 to 20 chars long"), 
]

const userValidation =[
  body("fullname")
  .trim()
  .notEmpty()
  .withMessage("fullname is required")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("fullname must be 3 to 20 chars long"),

  body("username")
  .trim()
  .notEmpty()
  .withMessage("username is required")
  .matches(/^\S+$/)
  .withMessage("username must not contain spaces")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("username must be 3 to 20 chars long"),

  body("password")
  .trim()
  .notEmpty()
  .withMessage("password is required")
  .isLength({ min: 3 , max: 20 })
  .withMessage("password must be 3 to 20 chars long"),

  body("role")
  .trim()
  .notEmpty()
  .withMessage("role is required")
  .isIn(["admin","author"])
  .withMessage("role must be admin or author")
]

const userUpdateValidation =[
  body("fullname")
  .trim()
  .notEmpty()
  .withMessage("fullname is required")
  .matches(/^\S+$/)
  .withMessage("fullname must not contain spaces")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("fullname must be 3 to 20 chars long"),

  body("username")
  .trim()
  .notEmpty()
  .withMessage("username is required")
  .matches(/^\S+$/)
  .withMessage("username must not contain spaces")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("username must be 3 to 20 chars long"),

  body("password")
  .optional({checkFalsy: true})
  .isLength({ min: 3 , max: 20 })
  .withMessage("password must be 3 to 20 chars long"),

  body("role")
  .trim()
  .notEmpty()
  .withMessage("role is required")
]

const categoryValidation =[
  body("name")
  .trim()
  .notEmpty()
  .withMessage("name is required")
  .isLength({ min: 3 ,max: 20 })
  .withMessage("name must be 3 to 20 chars long"),

  body("description")
  .isLength({ min: 3 ,max: 120 })
  .withMessage("description must be 3 to 120 chars long"),

]

const articleValidation =[
  body("title")
  .trim()
  .notEmpty()
  .withMessage("title is required")
  .isLength({ min: 6 ,max: 100 })
  .withMessage("title must be 6 to 100 chars long"),

  body("content")
  .trim()
  .notEmpty()
  .withMessage("content is required")
  .isLength({ min: 50 ,max: 4000 })
  .withMessage("content must be 50 to 2000 chars long"),

  body("category")
  .trim()
  .notEmpty()
  .withMessage("category is required"),

  body("image").custom((value, { req }) => {
    if (req.file && req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png" && req.file.mimetype !== "image/jpg") {
      throw new Error("Only .jpeg and .png files are allowed!");
    }
    if (req.file && req.file.size > 1024 * 1024 * 6) {
      throw new Error("Image size should be less than 6mB!");
    }
    return true;
  }),

    
]
export {loginValidation,userValidation,userUpdateValidation,categoryValidation,articleValidation} 