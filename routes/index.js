const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController').default;
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

router.get('/status', (req, res) => {AppController.getStatus(req, res);
});
router.get('/stats', (req, res) => {AppController.getStats(req, res);
});
router.get('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);


module.exports = router;