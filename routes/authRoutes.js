const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, getUserById, getUserByUsername, addUser, updateUser, updatePassword, deleteUser } = require('../controllers/authController');

// Router auth
router.post('/login', loginUser);
router.post('/register', registerUser);

// Router Get User
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/username/:username', getUserByUsername);

// Router Post User
router.post('/', addUser);

// Router Put User
router.put('/:id', updateUser);
router.put('/:id', updatePassword);

// Router Delete User
router.delete('/:id', deleteUser);

module.exports = router;