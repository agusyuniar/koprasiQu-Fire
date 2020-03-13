const jwt = require('jsonwebtoken')

module.exports = {
    createJWTtoken : (payload) => {
        return jwt.sign(payload, 'secretrahasiajwt', {expiresIn:'24h'})
    }
}