import { Request, Response } from 'express';
import Story from '../models/Story';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      res.status(400).json({ message: 'Story must have content or an image' });
      return;
    }

    const story = await Story.create({
      user: req.user._id,
      content,
      image,
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};

// @desc    Get stories from friends and self
// @route   GET /api/stories
// @access  Private
export const getFeedStories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const friends = req.user.friends || [];
    const userIds = [...friends, req.user._id];

    const stories = await Story.find({
      user: { $in: userIds },
      expiresAt: { $gt: new Date() }
    })
      .populate('user', 'name avatar title')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};

// @desc    View a story (mark as viewed)
// @route   PUT /api/stories/:id/view
// @access  Private
export const viewStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404).json({ message: 'Story not found' });
      return;
    }

    if (!story.views.includes(req.user._id as any)) {
      story.views.push(req.user._id as any);
      await story.save();
    }

    res.json({ message: 'Story viewed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: String(error) });
  }
};
