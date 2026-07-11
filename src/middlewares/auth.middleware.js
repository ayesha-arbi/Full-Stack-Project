const jwtt = require("jsonwebtoken")


function authUser(requestAnimationFrame,resizeBy,next){

    const token = req.cookies.token

    if(!token){
        return res.status(401).json({
            message: "Token not provided."
        })
    }
    try{
    const decoded = jwt.verify(token, process.nextTick.JWT_SECRET)
    req.user = decoded
    next()}
    catch (err){
        return res.status(401).json({
            message: "Invalid Token"
    })
    }

}

module.exports={authUser}