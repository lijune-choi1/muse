// src/pages/CritiqueService.js - Updated with flexible image handling

class CritiqueService {
  constructor() {
    this.communities = [];
    this.critiquePosts = [];
    this.whiteboardData = {};
    this.userPreferences = {};
  
    // Load from localStorage first
    this._loadFromLocalStorage();
    
    // Check if we need to initialize default data
    console.log('After loading from localStorage:');
    console.log('- Communities:', this.communities.length);
    console.log('- Posts:', this.critiquePosts.length);
    
    // Always initialize default data if communities array is empty
    if (this.communities.length === 0) {
      console.log('Initializing default communities...');
      this._initializeDefaultData();
    }
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
      
            // Save the initialized data to localStorage
        this._saveToLocalStorage();
        console.log('Default data initialized and saved to localStorage');
        console.log('- Communities:', this.communities.length);
        
        return Promise.resolve();
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

  // getAllCommunities() {
  //   return Promise.resolve([...this.communities]);
  // }

  // getUserCreatedCommunities(username) {
  //   const communities = this.communities.filter(
  //     community => community.createdBy === username || 
  //                 (community.moderators && community.moderators.some(mod => mod.name === username))
  //   );
  //   return Promise.resolve(communities);
  // }

  // getUserFollowedCommunities(username) {
  //   const userPrefs = this.userPreferences[username];
  //   if (!userPrefs || !userPrefs.followedCommunities) {
  //     return Promise.resolve([]);
  //   }
    
  //   const followedCommunities = this.communities.filter(
  //     community => userPrefs.followedCommunities.includes(community.id)
  //   );
  //   return Promise.resolve(followedCommunities);
  // }
  
  // followCommunity(username, communityId) {
  //   if (!this.userPreferences[username]) {
  //     this.userPreferences[username] = { followedCommunities: [] };
  //   }
    
  //   if (!this.userPreferences[username].followedCommunities.includes(communityId)) {
  //     this.userPreferences[username].followedCommunities.push(communityId);
  //     this._saveToLocalStorage();
  //   }
    
  //   return Promise.resolve({ success: true });
  // }
  
  // unfollowCommunity(username, communityId) {
  //   if (!this.userPreferences[username] || !this.userPreferences[username].followedCommunities) {
  //     return Promise.resolve({ success: false, error: 'User not found or no followed communities' });
  //   }
    
  //   this.userPreferences[username].followedCommunities = 
  //     this.userPreferences[username].followedCommunities.filter(id => id !== communityId);
  //   this._saveToLocalStorage();
    
  //   return Promise.resolve({ success: true });
  // }
  
  // getCommunityByName(name) {
  //   const community = this.communities.find(comm => comm.name.toLowerCase() === name.toLowerCase());
  //   return Promise.resolve(community || null);
  // }
  // Improved getAllCommunities method with better error handling
// Replace this method in your CritiqueService.js file

// Replace this method in your CritiqueService.js file

getAllCommunities() {
  console.log('getAllCommunities called');
  
  try {
    // Make sure we have communities
    if (!Array.isArray(this.communities) || this.communities.length === 0) {
      console.log('No communities found, initializing default data');
      this._initializeDefaultData();
    }
    
    console.log('Returning communities:', this.communities);
    
    // Check if communities is somehow still empty
    if (!this.communities || this.communities.length === 0) {
      console.log('Still no communities after initialization, using hardcoded defaults');
      return Promise.resolve([
        {
          id: 1,
          name: 'r/ijuneneedshelp',
          description: 'Community board for Iijune to get feedback for design',
          stats: { members: 128, online: 42 },
          createdBy: 'lijune.choi20'
        },
        {
          id: 2,
          name: 'r/Graphic4ever',
          description: 'A community for graphic designers to share and critique professional work',
          stats: { members: 256, online: 78 },
          createdBy: 'GraphicPro'
        }
      ]);
    }
    
    return Promise.resolve([...this.communities]);
  } catch (error) {
    console.error('Error in getAllCommunities:', error);
    
    // Return default communities as fallback
    return Promise.resolve([
      {
        id: 1,
        name: 'r/ijuneneedshelp',
        description: 'Community board for Iijune to get feedback for design',
        stats: { members: 128, online: 42 },
        createdBy: 'lijune.choi20'
      },
      {
        id: 2,
        name: 'r/Graphic4ever',
        description: 'A community for graphic designers to share and critique professional work',
        stats: { members: 256, online: 78 },
        createdBy: 'GraphicPro'
      }
    ]);
  }
}
// Replace just the createCommunity method in your CritiqueService.js file

createCommunity(communityData) {
  console.log('createCommunity called with:', communityData);
  
  try {
    // Make sure communities is initialized
    if (!Array.isArray(this.communities)) {
      console.log('this.communities is not an array in createCommunity, creating new array');
      this.communities = [];
    }
    
    // Generate a new ID
    const highestId = this.communities.reduce((max, community) => 
      community && community.id > max ? community.id : max, 0);
    
    const newCommunity = {
      ...communityData,
      id: highestId + 1,
      stats: { members: 1, online: 1 },
      moderators: [{ id: 1, name: communityData.createdBy || 'Founder' }],
      createdDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    
    console.log('New community object created:', newCommunity);
    
    // Add to communities array
    this.communities.push(newCommunity);
    console.log('Community pushed. New length:', this.communities.length);
    
    // Manually update user preferences instead of calling followCommunity
    const createdBy = newCommunity.createdBy;
    if (createdBy) {
      if (!this.userPreferences[createdBy]) {
        this.userPreferences[createdBy] = { followedCommunities: [] };
      }
      if (!this.userPreferences[createdBy].followedCommunities.includes(newCommunity.id)) {
        this.userPreferences[createdBy].followedCommunities.push(newCommunity.id);
        console.log(`User ${createdBy} now follows community ID ${newCommunity.id}`);
      }
    }
    
    // Save to localStorage
    this._saveToLocalStorage();
    
    return Promise.resolve(newCommunity);
  } catch (error) {
    console.error('Error in createCommunity:', error);
    return Promise.reject(error);
  }
}

// createCommunity(communityData) {
//   try {
//     console.log('Creating new community:', communityData);
    
//     // Generate a new ID (one higher than the highest existing ID)
//     const highestId = this.communities.reduce((max, community) => 
//       community.id > max ? community.id : max, 0);
    
//     const newCommunity = {
//       ...communityData,
//       id: highestId + 1,
//       stats: { members: 1, online: 1 },
//       moderators: [{ id: 1, name: communityData.createdBy || 'Founder' }],
//       createdDate: new Date().toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       })
//     };
    
//     // Add to communities array
//     this.communities.push(newCommunity);
//     console.log('Added new community. Total communities:', this.communities.length);
    
//     // Make sure user follows their own community
//     if (newCommunity.createdBy) {
//       if (!this.userPreferences[newCommunity.createdBy]) {
//         this.userPreferences[newCommunity.createdBy] = { followedCommunities: [] };
//       }
      
//       if (!this.userPreferences[newCommunity.createdBy].followedCommunities.includes(newCommunity.id)) {
//         this.userPreferences[newCommunity.createdBy].followedCommunities.push(newCommunity.id);
//         console.log('User now follows their new community');
//       }
//     }
    
//     // Save to localStorage
//     this._saveToLocalStorage();
//     return Promise.resolve(newCommunity);
//   } catch (error) {
//     console.error('Error creating community:', error);
//     return Promise.reject(error);
//   }
// }

// Make sure we have multiple ways to get user communities
getFollowedCommunities(username) {
  return this.getUserFollowedCommunities(username);
}

getUserFollowedCommunities(username) {
  try {
    console.log('Getting followed communities for:', username);
    console.log('User preferences:', this.userPreferences);
    
    const userPrefs = this.userPreferences[username];
    if (!userPrefs || !userPrefs.followedCommunities) {
      console.log('No followed communities found for user');
      return Promise.resolve([]);
    }
    
    console.log('User followed community IDs:', userPrefs.followedCommunities);
    
    const followedCommunities = this.communities.filter(
      community => userPrefs.followedCommunities.includes(community.id)
    );
    
    console.log('Returning followed communities:', followedCommunities);
    return Promise.resolve(followedCommunities);
  } catch (error) {
    console.error('Error in getUserFollowedCommunities:', error);
    return Promise.resolve([]);
  }
}

// Add or update this method in your CritiqueService.js
getCommunityByName(name) {
  try {
    console.log('Looking for community with name:', name);
    
    // Make sure we have default communities
    if (this.communities.length === 0) {
      this._initializeDefaultData();
    }
    
    // Find the community by name (case insensitive)
    const community = this.communities.find(
      comm => comm.name && comm.name.toLowerCase() === name.toLowerCase()
    );
    
    console.log('Found community:', community);
    return Promise.resolve(community || null);
  } catch (error) {
    console.error('Error in getCommunityByName:', error);
    return Promise.resolve(null);
  }
}

// Similar function for created communities
getOwnedCommunities(username) {
  return this.getUserCreatedCommunities(username);
}

getUserCreatedCommunities(username) {
  try {
    console.log('Getting created communities for:', username);
    
    const communities = this.communities.filter(
      community => community.createdBy === username || 
                  (community.moderators && community.moderators.some(mod => mod.name === username))
    );
    
    console.log('Returning created communities:', communities);
    return Promise.resolve(communities);
  } catch (error) {
    console.error('Error in getUserCreatedCommunities:', error);
    return Promise.resolve([]);
  }
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

  // Add this method to your CritiqueService.js file
followCommunity(username, communityId) {
  console.log(`followCommunity called: user=${username}, communityId=${communityId}`);
  
  try {
    if (!this.userPreferences[username]) {
      this.userPreferences[username] = { followedCommunities: [] };
    }
    
    if (!this.userPreferences[username].followedCommunities.includes(communityId)) {
      this.userPreferences[username].followedCommunities.push(communityId);
      console.log(`User ${username} now follows community ID ${communityId}`);
    }
    
    this._saveToLocalStorage();
    return Promise.resolve({ success: true });
  } catch (error) {
    console.error('Error in followCommunity:', error);
    return Promise.resolve({ success: false, error: error.message });
  }
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
        } else {
          console.log('No communities found in localStorage');
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
        console.log('- Saved communities:', this.communities.length);

      } catch (e) {
        console.error('Error saving to localStorage:', e);
        
      }
    }
  }
}


// Export a singleton instance of the service
const critiqueService = new CritiqueService();
export default critiqueService;