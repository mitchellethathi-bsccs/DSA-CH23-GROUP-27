import express from 'express';
import {
  createStory,
  getFeedStories,
  viewStory
} from '../controllers/storyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createStory).get(protect, getFeedStories);
router.route('/:id/view').put(protect, viewStory);

export default router;
