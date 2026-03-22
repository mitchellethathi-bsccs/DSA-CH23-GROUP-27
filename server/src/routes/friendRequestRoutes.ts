import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests
} from '../controllers/friendRequestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getPendingRequests);
router.route('/:id').post(protect, sendFriendRequest);
router.route('/:id/accept').put(protect, acceptFriendRequest);
router.route('/:id/reject').put(protect, rejectFriendRequest);

export default router;
