import multer from "multer";
import path from "path";

const storsge = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const filefilter = (req, file, cb) => {      
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer(
    {
         storage: storsge,
         limits: {
             fileSize: 1024 * 1024 * 6,
         },
         fileFilter: filefilter
         }
);
export default upload;