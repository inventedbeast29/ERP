
function roleCheck(...allowedRoles){
 return function (req, res, next){
    const userrole=req.user.role;
    console.log(userrole)
    console.log(allowedRoles)
    if(!allowedRoles.includes(userrole)){   //allowedRoles is an array
        return res.send("Unauthorized")
    }
    next()
}}
module.exports=roleCheck;