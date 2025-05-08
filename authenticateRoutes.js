 const jwt=require("jsonwebtoken")

 function authenticateRoutes(req,res,next){
     const token=req.cookies.token
     if(!token){
         return res.redirect("/")
     }
     jwt.verify(token, "Secret", (err, decoded) => {
        if (err) {
          console.log("JWT verification failed:", err);
          return res.redirect("/");
        }
    
        req.user = decoded; // Attach decoded token to request object
    
        next(); // ✅ Allow access
      });
    }
     module.exports=authenticateRoutes;