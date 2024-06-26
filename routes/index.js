const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController').default;
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

router.get('/status', (req, res) => {AppController.getStatus(req, res);
});
router.get('/stats', (req, res) => {AppController.getStats(req, res);
});
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.post('/files', FilesController.postUpload)
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.get('/files/:id/data', FilesController.getFile);

export default router;