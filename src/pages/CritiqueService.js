// src/pages/CritiqueService.js - Updated with flexible image handling

class CritiqueService {
  constructor() {
    this.communities = [];
    this.critiquePosts = [];
    this.whiteboardData = {};
    this.userPreferences = {};
  
    // Force initialization if needed - add this line
  
    this._loadFromLocalStorage();
    this._initializeDefaultData();
  }

  _initializeDefaultData() {
    // Only initialize default data if no data exists
    if (this.communities.length === 0) {
      this.critiquePosts = [
        {
          id: 1,
          title: 'I need help with my poster design',
          description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
          date: 'Apr 3, 2025',
          status: 'just-started',
          editNumber: 1,
          community: 'r/ijuneneedshelp',
          author: 'lijune.choi20',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset-6-type.png', // Note the leading slash
          image: '/assets/images/asset-6-type.png'     // Note the leading slash
        },
        {
          id: 2,
          title: 'Feedback on my logo design',
          description: 'Working on a brand identity for a coffee shop. Would love some critique on the logo design.',
          date: 'Apr 2, 2025',
          status: 'in-progress',
          editNumber: 2,
          community: 'r/Graphic4ever',
          author: 'lijune.choi20',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset1-gd.png',  // Note the leading slash
          image: '/assets/images/asset1-gd.png'      // Note the leading slash
        },
        {
          id: 3,
          title: 'My latest illustration for a book cover',
          description: 'I created this illustration for a fantasy novel. Looking for feedback on style and execution.',
          date: 'Apr 1, 2025',
          status: 'in-progress',
          editNumber: 1,
          community: 'r/Graphic4ever',
          author: 'CreativeLead',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset-3-illust.png',  // Note the leading slash
          image: '/assets/images/asset-3-illust.png'      // Note the leading slash
        },
        {
          id: 4,
          title: 'Product design portfolio piece',
          description: 'This is a recent product design I completed for my portfolio. Looking for industry feedback.',
          date: 'Mar 30, 2025',
          status: 'just-started',
          editNumber: 1,
          community: 'r/ijuneneedshelp',
          author: 'DesignMentor',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset-2-pd.png',  // Note the leading slash
          image: '/assets/images/asset-2-pd.png'      // Note the leading slash
        },
        {
          id: 5,
          title: 'Digital drawing practice',
          description: 'Been working on improving my digital illustration skills. Any tips on my technique?',
          date: 'Mar 28, 2025',
          status: 'completed',
          editNumber: 3,
          community: 'r/ijuneneedshelp',
          author: 'lijune.choi20',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset-5-draw.png',  // Note the leading slash
          image: '/assets/images/asset-5-draw.png'      // Note the leading slash
        },
        {
          id: 6,
          title: 'Game UI design concept',
          description: 'Created this UI concept for a mobile game. Looking for feedback on usability and visual style.',
          date: 'Mar 25, 2025',
          status: 'in-progress',
          editNumber: 2,
          community: 'r/Graphic4ever',
          author: 'GraphicPro',
          isThread: true,
          threadId: null,
          imageUrl: '/assets/images/asset-4-gd.png',  // Note the leading slash
          image: '/assets/images/asset-4-gd.png'      // Note the leading slash
        }
      ];

      // Initialize some sample posts if none exist
      if (this.critiquePosts.length === 0) {
        this.critiquePosts = [
          {
            id: 1,
            title: 'I need help with my poster design',
            description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
            date: 'Apr 3, 2025',
            status: 'just-started',
            editNumber: 1,
            community: 'r/ijuneneedshelp',
            author: 'lijune.choi20',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset-6-type.png', // For Home.jsx
            image: 'assets/images/asset-6-type.png'     // For CritiqueRoom.jsx
          },
          {
            id: 2,
            title: 'Feedback on my logo design',
            description: 'Working on a brand identity for a coffee shop. Would love some critique on the logo design.',
            date: 'Apr 2, 2025',
            status: 'in-progress',
            editNumber: 2,
            community: 'r/Graphic4ever',
            author: 'lijune.choi20',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset1-gd.png',  // For Home.jsx
            image: 'assets/images/asset1-gd.png'      // For CritiqueRoom.jsx
          },
          {
            id: 3,
            title: 'My latest illustration for a book cover',
            description: 'I created this illustration for a fantasy novel. Looking for feedback on style and execution.',
            date: 'Apr 1, 2025',
            status: 'in-progress',
            editNumber: 1,
            community: 'r/Graphic4ever',
            author: 'CreativeLead',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset-3-illust.png',  // For Home.jsx
            image: 'assets/images/asset-3-illust.png'      // For CritiqueRoom.jsx
          },
          {
            id: 4,
            title: 'Product design portfolio piece',
            description: 'This is a recent product design I completed for my portfolio. Looking for industry feedback.',
            date: 'Mar 30, 2025',
            status: 'just-started',
            editNumber: 1,
            community: 'r/ijuneneedshelp',
            author: 'DesignMentor',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset-2-pd.png',  // For Home.jsx
            image: 'assets/images/asset-2-pd.png'      // For CritiqueRoom.jsx
          },
          {
            id: 5,
            title: 'Digital drawing practice',
            description: 'Been working on improving my digital illustration skills. Any tips on my technique?',
            date: 'Mar 28, 2025',
            status: 'completed',
            editNumber: 3,
            community: 'r/ijuneneedshelp',
            author: 'lijune.choi20',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset-5-draw.png',  // For Home.jsx
            image: 'assets/images/asset-5-draw.png'      // For CritiqueRoom.jsx
          },
          {
            id: 6,
            title: 'Game UI design concept',
            description: 'Created this UI concept for a mobile game. Looking for feedback on usability and visual style.',
            date: 'Mar 25, 2025',
            status: 'in-progress',
            editNumber: 2,
            community: 'r/Graphic4ever',
            author: 'GraphicPro',
            isThread: true,
            threadId: null,
            imageUrl: 'assets/images/asset-4-gd.png',  // For Home.jsx
            image: 'assets/images/asset-4-gd.png'      // For CritiqueRoom.jsx
          }
        ];
      }
      
      // Initialize user preferences
      if (Object.keys(this.userPreferences).length === 0) {
        this.userPreferences = {
          'lijune.choi20': {
            followedCommunities: [1, 2] // IDs of followed communities
          }
        };
      }
      
      this._saveToLocalStorage();
    }
  }

  // When creating a new post, make sure it has both image property names
  createPost(postData) {
    try {
      const newPost = {
        ...postData,
        id: this.critiquePosts.length + 1,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      };

      // Make sure both image properties are set
      if (newPost.image && !newPost.imageUrl) {
        newPost.imageUrl = newPost.image;
      } else if (newPost.imageUrl && !newPost.image) {
        newPost.image = newPost.imageUrl;
      }

      this.critiquePosts.unshift(newPost);
      this._saveToLocalStorage();
      return Promise.resolve(newPost);
    } catch (err) {
      console.error('Failed to create post:', err);
      return Promise.reject(new Error('Failed to create post'));
    }
  }

  // The rest of your service methods remain unchanged
  getAllPosts(communityName) {
    const posts = this.critiquePosts.filter(
      post => post.community === communityName
    );
    
    // Ensure all posts have both image properties for compatibility
    posts.forEach(post => {
      if (post.image && !post.imageUrl) {
        post.imageUrl = post.image;
      } else if (post.imageUrl && !post.image) {
        post.image = post.imageUrl;
      }
    });
    
    return Promise.resolve(posts);
  }

  getUserPosts(username) {
    const posts = this.critiquePosts.filter(
      post => post.author === username
    );
    return Promise.resolve(posts);
  }

  getAllThreads(communityName) {
    const threads = this.critiquePosts.filter(
      post => post.community === communityName && post.threadId === null && post.isThread
    );
    return Promise.resolve(threads);
  }

  getPostsInThread(threadId) {
    const posts = this.critiquePosts.filter(
      post => post.threadId === threadId
    );
    return Promise.resolve(posts);
  }

  getAllCommunities() {
    return Promise.resolve([...this.communities]);
  }

  getUserCreatedCommunities(username) {
    const communities = this.communities.filter(
      community => community.createdBy === username || 
                  (community.moderators && community.moderators.some(mod => mod.name === username))
    );
    return Promise.resolve(communities);
  }

  getUserFollowedCommunities(username) {
    const userPrefs = this.userPreferences[username];
    if (!userPrefs || !userPrefs.followedCommunities) {
      return Promise.resolve([]);
    }
    
    const followedCommunities = this.communities.filter(
      community => userPrefs.followedCommunities.includes(community.id)
    );
    return Promise.resolve(followedCommunities);
  }
  
  followCommunity(username, communityId) {
    if (!this.userPreferences[username]) {
      this.userPreferences[username] = { followedCommunities: [] };
    }
    
    if (!this.userPreferences[username].followedCommunities.includes(communityId)) {
      this.userPreferences[username].followedCommunities.push(communityId);
      this._saveToLocalStorage();
    }
    
    return Promise.resolve({ success: true });
  }
  
  unfollowCommunity(username, communityId) {
    if (!this.userPreferences[username] || !this.userPreferences[username].followedCommunities) {
      return Promise.resolve({ success: false, error: 'User not found or no followed communities' });
    }
    
    this.userPreferences[username].followedCommunities = 
      this.userPreferences[username].followedCommunities.filter(id => id !== communityId);
    this._saveToLocalStorage();
    
    return Promise.resolve({ success: true });
  }
  
  getCommunityByName(name) {
    const community = this.communities.find(comm => comm.name.toLowerCase() === name.toLowerCase());
    return Promise.resolve(community || null);
  }
  
  isUserFollowingCommunity(username, communityId) {
    if (!this.userPreferences[username] || !this.userPreferences[username].followedCommunities) {
      return Promise.resolve(false);
    }
    
    return Promise.resolve(this.userPreferences[username].followedCommunities.includes(communityId));
  }

  getPostById(postId) {
    const id = parseInt(postId);
    const post = this.critiquePosts.find(p => p.id === id);
    if (!post) return Promise.reject(new Error(`Post with ID ${postId} not found`));
    return Promise.resolve(post);
  }

  getWhiteboardData(postId) {
    const id = parseInt(postId);
    const data = this.whiteboardData[id] || { comments: [], stamps: [] };
    return Promise.resolve(data);
  }

  saveWhiteboardData(postId, data) {
    const id = parseInt(postId);
    this.whiteboardData[id] = data;
    this._saveToLocalStorage();
    return Promise.resolve({ success: true });
  }

  getPostsWithWhiteboardData(communityName) {
    const allPosts = this.critiquePosts.filter(post => post.community === communityName);
    const postsWithData = allPosts.filter(post =>
      this.whiteboardData[post.id] &&
      (this.whiteboardData[post.id].comments?.length > 0 ||
       this.whiteboardData[post.id].stamps?.length > 0)
    );
    return Promise.resolve(postsWithData);
  }

  addWhiteboardComment(postId, comment) {
    const id = parseInt(postId);
    if (!this.whiteboardData[id]) {
      this.whiteboardData[id] = { comments: [], stamps: [] };
    }
    this.whiteboardData[id].comments.push(comment);
    this._saveToLocalStorage();
    return Promise.resolve(comment);
  }

  addWhiteboardStamp(postId, stamp) {
    const id = parseInt(postId);
    if (!this.whiteboardData[id]) {
      this.whiteboardData[id] = { comments: [], stamps: [] };
    }
    this.whiteboardData[id].stamps.push(stamp);
    this._saveToLocalStorage();
    return Promise.resolve(stamp);
  }

  getWhiteboardStats(postId) {
    const id = parseInt(postId);
    const data = this.whiteboardData[id] || { comments: [], stamps: [] };
    const stats = { technical: 0, conceptual: 0, details: 0, total: 0 };
    if (data.comments?.length > 0) {
      data.comments.forEach(comment => {
        if (['technical', 'conceptual', 'details'].includes(comment.type?.toLowerCase())) {
          stats[comment.type.toLowerCase()]++;
          stats.total += comment.points || 0;
        }
      });
    }
    return Promise.resolve(stats);
  }

  createCommunity(communityData) {
    const newCommunity = {
      ...communityData,
      id: this.communities.length + 1,
      stats: { members: 1, online: 1 },
      moderators: [{ id: 1, name: communityData.createdBy || 'Founder' }],
      createdDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    
    this.communities.push(newCommunity);
    
    // Automatically follow a community when creating it
    if (newCommunity.createdBy) {
      this.followCommunity(newCommunity.createdBy, newCommunity.id);
    }
    
    this._saveToLocalStorage();
    return Promise.resolve(newCommunity);
  }

  _loadFromLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedCommunities = localStorage.getItem('critiqueCommunities');
        const savedPosts = localStorage.getItem('critiquePosts');
        const savedWhiteboardData = localStorage.getItem('whiteboardData');
        const savedUserPreferences = localStorage.getItem('userPreferences');

        if (savedCommunities) {
          this.communities = JSON.parse(savedCommunities);
        }
        if (savedPosts) {
          this.critiquePosts = JSON.parse(savedPosts);
          
          // Ensure all posts have both image and imageUrl properties
          this.critiquePosts.forEach(post => {
            if (post.image && !post.imageUrl) {
              post.imageUrl = post.image;
            } else if (post.imageUrl && !post.image) {
              post.image = post.imageUrl;
            }
          });
        }
        if (savedWhiteboardData) {
          this.whiteboardData = JSON.parse(savedWhiteboardData);
        }
        if (savedUserPreferences) {
          this.userPreferences = JSON.parse(savedUserPreferences);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  }

  _saveToLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Before saving, ensure all posts have both image properties
        this.critiquePosts.forEach(post => {
          if (post.image && !post.imageUrl) {
            post.imageUrl = post.image;
          } else if (post.imageUrl && !post.image) {
            post.image = post.imageUrl;
          }
        });
        
        localStorage.setItem('critiqueCommunities', JSON.stringify(this.communities));
        localStorage.setItem('critiquePosts', JSON.stringify(this.critiquePosts));
        localStorage.setItem('whiteboardData', JSON.stringify(this.whiteboardData));
        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }
}


// Export a singleton instance of the service
const critiqueService = new CritiqueService();
export default critiqueService;