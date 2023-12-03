const User = require("../models/userSchema");
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';
const crypto = require('crypto');
const { validationResult } = require('express-validator');

exports.postUserSignup = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
        const name = req.body.name;
        const username = req.body.username;
        const bio = req.body.bio;
        const age = req.body.age;
        const password = req.body.password;

        if (name && username && bio && age && password) {

            let existingUser = await User.findOne({ username: username });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'User exists already' })
            }
            // hash the password before saving it to database
            let hashPass = await bycrypt.hash(password, 10);

            const newUser = new User({
                name: name,
                username: username,
                bio: bio,
                age: age,
                password: hashPass
            });
            await newUser.save();
            res.status(201).json({ success: true, message: "user created successfully", user: newUser });
        } else {
            return res.status(400).json({ success: false, error: 'please fill out all fields' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.postUserLogin = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
        const username = req.body.username;
        const password = req.body.password;

        if (username && password) {
            let user = await User.findOne({ username: username });
            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            let passMatch = await bycrypt.compare(password, user.password);
            if (!passMatch) {
                return res.status(401).json({ success: false, error: 'Invalid Credentials' });
            }

            const payload = {
                user: {
                    id: user._id
                }
            }
            const token = jwt.sign(payload, JWT_SECRET);

            req.session.user = { ...user, authToken: token };
            res.json({ success: true, token });

        }
        else {
            return res.status(400).json({ success: false, error: 'please fill out all fields' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.postUserLogout = async (req, res, next) => {
    try {

        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                req.session.destroy(() => {
                    res.json({ success: true, message: 'Logout successful' });
                });
            } else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.getUserDetails = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {

                let userId = req.user.id;
                const user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({ message: "No user found" });
                }
                res.status(200).json({ success: true, user: user });
            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.updateUserDetails = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let userId = req.user.id;

                let name = req.body.name;
                let username = req.body.username;
                let bio = req.body.bio;
                let age = req.body.age;

                // Fetch user by ID
                let user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                let updateUser = {};
                if (name) {
                    updateUser.name = name;
                }
                if (username) {
                    updateUser.username = username;
                }
                if (bio) {
                    updateUser.bio = bio;
                }
                if (age) {
                    updateUser.age = age;
                }

                let updatedUser = await User.findByIdAndUpdate(userId, { $set: updateUser }, { new: true });
                res.status(201).json({ success: true, updatedUser: updatedUser });

            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.deleteUserDetails = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let userId = req.user.id;
                // Fetch user by ID
                let user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                let confirmDelete = req.query.deleteConfirmation;

                if (!confirmDelete) {
                    return res.status(400).json({ error: 'Confirmation required to delete the account' });
                }

                if (user.recoveryToken !== '' && user.recoveryExpirationDate && Date.now() > user.recoveryExpirationDate.getTime()) {
                    let deletedUser = await User.findByIdAndDelete(userId);
                    res.status(200).json({ success: true, message: 'User Deleted Succesfully', deletedUser: deletedUser });
                }
                else {

                    user.recoveryToken = crypto.randomBytes(32).toString("hex");
                    let expirationTime = 1 * 60 * 1000;
                    user.recoveryExpirationDate = Date.now() + expirationTime;
                    await user.save();
                    res.status(200).json({ message: `Account will be Deleted after ${user.recoveryExpirationDate} minutes` });
                }

            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.recoverUserAccount = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let userId = req.user.id;
                // Fetch user by ID
                let user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                if (Date.now() < user.recoveryExpirationDate.getTime() && user.recoveryToken !== '') {
                    user.recoveryToken = '';
                    user.recoveryExpirationDate = null;
                    await user.save();
                    res.status(200).json({ success: true, message: 'Account recovery successful', user: user });
                }
                else {
                    return res.status(400).json({ error: 'Grace period for account recovery has expired' });
                }


            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}


exports.deleteUserOnPasswordConfirmation = async (req, res, next) => {
    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let password = req.body.password;
                let userId = req.user.id;

                // Fetch user by ID
                let user = await User.findById(userId);

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Check if the provided password matches the user's password
                let passwordMatch = await bycrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Incorrect password' });
                }

                // Delete the user by ID
                await User.findByIdAndDelete(userId);

                res.json({ success: true, message: 'Account deleted successfully' });
            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}

exports.getTokenToUserPassword = async (req, res, next) => {

    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let userId = req.user.id;

                let user = await User.findById(userId);
                if (!user) {
                    return res.status(404).json({ error: "No such user exists." })
                }
                let resetToken = crypto.randomBytes(32).toString("hex");
                user.token = resetToken;
                await user.save();
                res.status(200).json({ success: true, resetToken: resetToken, user: user });
            }
            else {
                res.status(401).json({ error: "authenticate using valid token" })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}

exports.updateUserPassword = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
        if (req.session && req.session.user) {
            let token = req.header('auth-token');
            if (token == req.session.user.authToken) {
                let resetToken = req.header('reset-token');
                let password = req.body.password;

                if (!resetToken) {
                    return res.status(404).json({ error: "no token provided" });
                }
                let user = await User.findOne({ token: resetToken });
                if (!user) {
                    return res.status(404).json({ error: "Invalid Token" });
                }
                let newPassword = await bycrypt.hash(password, 10);
                user.password = newPassword;
                user.token = '';
                await user.save();

                req.session.destroy(() => {
                    res.json({ success: true, message: 'password changed successfully, login again' });
                });
            } else {
                res.status(401).json({ error: "authenticate using valid token" });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error occured');
    }
}

