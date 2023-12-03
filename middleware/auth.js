const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';

exports.requireLogin = (req, res, next) => {
    console.log(req.session.user)
    if (req.session && req.session.user && req.session.user._doc._id && req.session.user.authToken) {
        const token = req.header('auth-token');
        if (!token) {
            res.status(401).json({ error: "authenticate using valid token" })
        }
        try {
            const data = jwt.verify(token, JWT_SECRET);
            console.log(data)
            req.user = data.user;
            next()
        } catch (error) {
            res.status(401).json({ error: "authenticate using valid token" })
        }

    } else {
        res.status(401).send({ error: "Login first" });
    }
}