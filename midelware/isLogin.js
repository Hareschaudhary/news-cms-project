import jwt from "jsonwebtoken";

const isLogin =async (req,res,next)=>{
try{
    const token = req.cookies.token;
    if(!token){
            return res.redirect("/admin/");
    }else{
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      req.fullname = decoded.fullname;
      req.role = decoded.role;
      req.id = decoded.id;
      next();
    }
}catch(err){
    console.log(err);
    res.status(500).send("invelid token");
}
}

export default isLogin