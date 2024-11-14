import express from 'express';
import multer from 'multer';
import {
  registerHandler,
  loginHandler,
  authenticateGitlabHandler,
  gitlabCallbackHandler,
  checkTokenHandler,
} from './auth-controller.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/register', upload.single('image'), registerHandler);
router.post('/login', loginHandler);
router.get('/gitlab', authenticateGitlabHandler);
router.get('/gitlab/callback', gitlabCallbackHandler);
router.get('/check-token', checkTokenHandler);

export default router;
