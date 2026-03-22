import { useState } from 'react';
import api from '../utils/api';

export default function StoryCreator({ onClose, onCreated }: any) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/stories', { content, image });
      onCreated(data);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-[fadeIn_0.2s_ease-out]">
        <button onClick={onClose} className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4">Create Story</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-surface-container-highest p-3 rounded-lg border-none focus:ring-1 focus:ring-primary h-24 resize-none"
          />
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full bg-surface-container-highest p-3 rounded-lg border-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading || (!content && !image)}
            className="bg-primary text-white py-2 rounded-xl font-bold mt-2 disabled:opacity-50 hover:bg-primary-container transition-colors"
          >
            {loading ? 'Posting...' : 'Share Story'}
          </button>
        </form>
      </div>
    </div>
  );
}
