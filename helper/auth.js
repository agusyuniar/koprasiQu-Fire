const jwt = require('jsonwebtoken')

module.exports = {
    auth: (req, res, next) => {
        console.log(req.body, 'res auth');
        if(req.token==null){
            req.token = req.body.token
        }
        if (req.method !== 'OPTIONS') {
            jwt.verify(req.token, 'secretrahasiajwt', (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: "User not authorized.", error: "User not authorized." });
                }
                // console.log(decoded);
                req.user = decoded;
                next()
            })
        } else {
            next()
        }
    }
}