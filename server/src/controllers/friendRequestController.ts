import { Request, Response } from 'express';
import FriendRequest from '../models/FriendRequest';
import User from '../models/User';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Send a friend request
// @route   POST /api/friend-requests/:id
// @access  Private
export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (receiverId === senderId.toString()) {
      res.status(400).json({ message: 'You cannot add yourself as a friend' });
      return;
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (sender.friends.includes(receiverId as any)) {
      res.status(400).json({ message: 'You are already friends' });
      return;
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      res.status(400).json({ message: 'Friend request already exists' });
      return;
    }

    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    await Notification.create({
      user: receiverId,
      relatedUser: senderId,
      type: 'friend_request',
      content: 'sent you a friend request.',
      actionIcon: 'person_add',
      actionColor: 'text-blue-500'
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};

// @desc    Accept a friend request
// @route   PUT /api/friend-requests/:id/accept
// @access  Private
export const acceptFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await FriendRequest.findById(req.params.id);

    if (!request) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to accept this request' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({ message: 'Request is already processed' });
      return;
    }

    request.status = 'accepted';
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (sender && receiver) {
      if (!sender.friends.includes(receiver._id as any)) {
        sender.friends.push(receiver._id as any);
        await sender.save();
      }
      if (!receiver.friends.includes(sender._id as any)) {
        receiver.friends.push(sender._id as any);
        await receiver.save();
      }
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};

// @desc    Reject a friend request
// @route   PUT /api/friend-requests/:id/reject
// @access  Private
export const rejectFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await FriendRequest.findById(req.params.id);

    if (!request) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to reject this request' });
      return;
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friend-requests
// @access  Private
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'name avatar title');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};
