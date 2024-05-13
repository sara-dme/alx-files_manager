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
router.post('/users', (req, res) => {UsersController.postNew(req, res);})
router.get('/users/me', (req, res) => {UsersController.getMe(req, res);})

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.get('/files', FilesController.postUpload)
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;