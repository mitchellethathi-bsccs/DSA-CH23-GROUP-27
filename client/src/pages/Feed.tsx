import { useState, useEffect, useMemo } from 'react';
import PostCard from '../components/PostCard';
import StoryCreator from '../components/StoryCreator';
import StoryViewer from '../components/StoryViewer';
import { rankPosts } from '../utils/sorting';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user, socket } = useAuth() as any;
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [sidebarData, setSidebarData] = useState({
    suggestions: [],
    birthdays: [],
    onlineFriends: []
  });

  const fetchSidebar = async () => {
    try {
      const { data } = await api.get('/users/homepage-sidebar');
      setSidebarData(data);
    } catch (error) {
      console.error('Failed to fetch sidebar data', error);
    }
  };

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        const [postsRes, storiesRes] = await Promise.all([
          api.get('/posts/feed'),
          api.get('/stories')
        ]);
        setPosts(postsRes.data);
        setStories(storiesRes.data);
      } catch (error) {
        console.error('Failed to fetch feed data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchFeedData();
      fetchSidebar();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewPost = (newPost: any) => {
      // Don't add if it's our own post already added optimistically
      setPosts(prev => {
        if (prev.find(p => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    };

    const handleStatusChange = () => {
      // Re-fetch sidebar data to ensure all names/avatars are correct
      if (user) fetchSidebar();
    };

    socket.on('post_created', handleNewPost);
    socket.on('user_status_change', handleStatusChange);

    return () => {
      socket.off('post_created', handleNewPost);
      socket.off('user_status_change', handleStatusChange);
    };
  }, [socket, user]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      const { data } = await api.post('/posts', { content: newPostContent, visibility: 'public' });
      setPosts([data, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  // Convert backend createdAt to timestamp for rankPosts
  const formattedPosts = useMemo(() => {
    return posts.map(p => ({
      ...p,
      id: p._id,
      timestamp: new Date(p.createdAt).getTime(),
      likes: p.likes?.length || 0,
      comments: p.comments?.length || 0
    }));
  }, [posts]);

  // ===== DSA: Merge Sort for Feed Ranking =====
  // Posts are ranked using merge sort with a composite score (recency + engagement)
  const rankedPosts = useMemo(() => rankPosts(formattedPosts), [formattedPosts]);

  if (!user) return null;

  return (
    <div className="px-4 md:px-8 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 py-8">
      {/* Main Feed */}
      <section className="max-w-[680px] mx-auto w-full space-y-8 pb-20">
        {/* Story Bar */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <div onClick={() => setShowStoryCreator(true)} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-outline-variant p-0.5 group-hover:border-primary transition-colors">
              <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">add</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-on-surface-variant">Your Story</span>
          </div>
          {stories.map(story => (
            <div key={story._id} onClick={() => setActiveStory(story)} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`relative w-16 h-16 rounded-full p-[2px] ring-2 ring-primary ring-offset-2 ring-offset-surface ${story.views?.includes(user._id) ? 'ring-outline-variant/30' : ''}`}>
                <img src={story.user.avatar} alt={story.user.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-[10px] font-semibold text-on-surface">{story.user.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Create Post */}
        <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm border border-outline-variant/10">
          <div className="flex gap-4">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-surface-container-high/50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary/20 placeholder:text-outline h-24 resize-none"
                placeholder={`Share what's on your mind, ${user.name.split(' ')[0]}...`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-blue-500 text-[20px]">image</span>
                <span className="text-xs font-semibold">Photo</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-green-500 text-[20px]">videocam</span>
                <span className="text-xs font-semibold">Video</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-orange-500 text-[20px]">mood</span>
                <span className="text-xs font-semibold">Feeling</span>
              </button>
            </div>
            <button onClick={handleCreatePost} className="bg-primary text-white px-6 py-1.5 rounded-full text-xs font-bold hover:bg-primary-container transition-colors">
              Post
            </button>
          </div>
        </div>

        {/* Feed Posts (ranked by merge sort) */}
        {loading ? (
          <div className="text-center py-8 text-on-surface-variant">Loading posts...</div>
        ) : (
          rankedPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </section>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex flex-col gap-6 sticky top-20 h-fit">
        {/* Birthdays */}
        <div className="bg-surface-container-lowest rounded-lg p-5 shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary">featured_seasonal_and_gifts</span>
            <h4 className="text-sm font-bold text-on-surface">Birthdays</h4>
          </div>
          {sidebarData.birthdays.length > 0 ? (
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">{(sidebarData.birthdays[0] as any).name}</span> 
              {sidebarData.birthdays.length > 1 && ` and ${sidebarData.birthdays.length - 1} others`} have birthdays today.
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant">No birthdays today.</p>
          )}
        </div>

        {/* Friend Suggestions */}
        <div className="bg-surface-container-lowest rounded-lg p-5 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-on-surface">Suggestions</h4>
            <button className="text-xs font-semibold text-primary hover:underline">See all</button>
          </div>
          <div className="space-y-5">
            {sidebarData.suggestions.length > 0 ? sidebarData.suggestions.map((s: any) => (
              <div key={s.user._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={s.user.avatar} alt={s.user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-on-surface">{s.user.name}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {s.mutualCount} mutual friends
                    </p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await api.post(`/friend-requests/${s.user._id}`);
                      alert('Friend request sent!');
                    } catch(e: any) { alert(e.response?.data?.message || 'Error'); }
                  }}
                  className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
              </div>
            )) : (
              <p className="text-xs text-on-surface-variant">No new suggestions.</p>
            )}
          </div>
        </div>

        {/* Online Friends */}
        <div className="bg-surface-container-lowest rounded-lg p-5 shadow-sm border border-outline-variant/10">
          <h4 className="text-sm font-bold text-on-surface mb-6">Online</h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {sidebarData.onlineFriends.map((user: any) => (
              <div key={user._id} className="relative flex-shrink-0" title={user.name}>
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            ))}
            {sidebarData.onlineFriends.length === 0 && (
              <p className="text-xs text-on-surface-variant">No friends online.</p>
            )}
          </div>
        </div>
      </aside>

      {showStoryCreator && (
        <StoryCreator 
          onClose={() => setShowStoryCreator(false)} 
          onCreated={(newStory: any) => setStories([newStory, ...stories])} 
        />
      )}
      {activeStory && (
        <StoryViewer 
          story={activeStory} 
          onClose={() => setActiveStory(null)} 
        />
      )}
    </div>
  );
}
