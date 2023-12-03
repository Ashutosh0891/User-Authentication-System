const express = require('express');
const { postUserSignup, postUserLogin, postUserLogout, getUserDetails, updateUserDetails, deleteUserDetails, deleteUserOnPasswordConfirmation, updateUserPassword, getTokenToUserPassword, recoverUserAccount } = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();
const { body } = require('express-validator');


router.post('/register', [
    body('name', 'please enter a valid name').isString().isLength({ max: 20 }).notEmpty(),
    body('username', 'please enter a valid username').isString().isAlphanumeric().notEmpty(),
    body('bio', 'please enter a valid bio').isString().isLength({ max: 40 }).notEmpty(),
    body('age', 'please enter a valid age').isInt({ min: 1, max: 100 }).notEmpty(),
    body('password', 'please enter a valid password').isString().isAlphanumeric().isLength({ min: 5 }).notEmpty()
], postUserSignup);

router.post('/login', [
    body('username', 'please enter a valid username').isString().isAlphanumeric().notEmpty(),
    body('password', 'please enter a valid password').isString().isAlphanumeric().isLength({ min: 5 }).notEmpty()
], postUserLogin);

router.post('/logout', requireLogin, postUserLogout);

router.get('/details', requireLogin, getUserDetails);


router.put('/update', [
    body('name', 'please enter a valid name').isString().isLength({ max: 20 }).notEmpty(),
    body('username', 'please enter a valid username').isString().isAlphanumeric().notEmpty(),
    body('bio', 'please enter a valid bio').isString().isLength({ max: 40 }).notEmpty(),
    body('age', 'please enter a valid age').isInt({ min: 1, max: 100 }).notEmpty()
], requireLogin, updateUserDetails);


router.delete('/delete', requireLogin, deleteUserDetails);

router.get('/recover-account', requireLogin, recoverUserAccount);

router.post('/confirm-delete', [
    body('password', 'please enter a valid password').isString().isAlphanumeric().isLength({ min: 5 }).notEmpty()
], requireLogin, deleteUserOnPasswordConfirmation);

router.get('/reset-password-token', requireLogin, getTokenToUserPassword);

router.post('/reset-password', [
    body('password', 'please enter a valid password').isString().isAlphanumeric().isLength({ min: 5 }).notEmpty()
], requireLogin, updateUserPassword);

module.exports = router;