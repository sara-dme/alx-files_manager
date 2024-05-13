const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController').default;
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

router.get('/status', (req, res) => {AppController.getStatus(req, res);
});
router.get('/stats', (req, res) => {AppController.getStats(req, res);
});
router.post('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.get('/files', FilesController.postUpload)
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;