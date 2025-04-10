// src/services/CritiqueService.js

// This is a mock service that would be replaced with actual API calls in a real application
class CritiqueService {
    constructor() {
      // Initialize with some mock data for threads
      this.threads = [
        {
          id: 101,
          title: 'Poster Design Critique Thread',
          community: 'r/ijuneneedshelp',
          description: 'Thread for poster design critiques',
          createdAt: '2024-03-10',
          posts: [
            {
              id: 144,
              threadId: 101,
              author: 'r/ijuneneedshelp',
              date: '2 days ago',
              title: 'POST NAME: I need help with my poster design.',
              description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
              editNumber: 2,
              status: 'in-progress',
              image: null
            },
            {
              id: 147,
              threadId: 101,
              author: 'user123',
              date: '1 day ago',
              title: 'UPDATE: Poster design after feedback',
              description: 'I adjusted the composition based on the feedback. How does it look now?',
              editNumber: 3,
              status: 'near-completion',
              image: null
            }
          ]
        },
        {
          id: 102,
          title: 'Typography Project Feedback',
          community: 'r/ijuneneedshelp',
          description: 'Thread for typography project feedback',
          createdAt: '2024-03-12',
          posts: [
            {
              id: 145,
              threadId: 102,
              author: 'r/ijuneneedshelp',
              date: '3 days ago',
              title: 'POST NAME: Need feedback on my typography project',
              description: 'Working on a typography project and would like some feedback on the layout and spacing. This is my first attempt and I feel like something is off with the hierarchy.',
              editNumber: 1,
              status: 'just-started',
              image: null
            }
          ]
        },
        {
          id: 103,
          title: 'Branding Project Final Review',
          community: 'r/ijuneneedshelp',
          description: 'Thread for branding project review',
          createdAt: '2024-03-15',
          posts: [
            {
              id: 146,
              threadId: 103,
              author: 'r/ijuneneedshelp',
              date: '1 day ago',
              title: 'POST NAME: Final check on my branding project',
              description: 'This is almost ready for submission but I want to make sure the color palette works well together and the logo variations are consistent. Any last suggestions?',
              editNumber: 3,
              status: 'near-completion',
              image: null
            }
          ]
        }
      ];
      
      // Load data from localStorage if available
      this._loadFromLocalStorage();
    }
    
    // Get all threads
    getAllThreads() {
      console.log('Getting all threads:', this.threads);
      return Promise.resolve([...this.threads]);
    }
    
    // Get threads for a specific community
    getThreadsByCommunity(community) {
      const threads = this.threads.filter(t => t.community === community);
      console.log(`Getting threads for community ${community}:`, threads);
      return Promise.resolve(threads);
    }
    
    // Get a thread by ID
    getThreadById(id) {
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log(`Looking for thread with ID: ${numericId}`);
      const thread = this.threads.find(t => t.id === numericId);
      console.log('Found thread:', thread);
      
      return Promise.resolve(thread || null);
    }
    
    // Create a new thread with an initial post
    createThread(threadData, postData) {
      const threadId = Date.now();
      const postId = threadId + 1; // Just ensure it's different
      
      const newThread = {
        id: threadId,
        title: threadData.title,
        community: threadData.community,
        description: threadData.description,
        createdAt: new Date().toISOString().split('T')[0],
        posts: [
          {
            id: postId,
            threadId,
            author: postData.author || threadData.community,
            date: 'Just now',
            title: postData.title,
            description: postData.description,
            editNumber: postData.editNumber || 1,
            status: postData.status || 'just-started',
            image: postData.image
          }
        ]
      };
      
      this.threads.unshift(newThread); // Add to the beginning
      this._saveToLocalStorage();
      
      console.log('Created new thread:', newThread);
      return Promise.resolve(newThread);
    }
    
    // Add a post to an existing thread
    addPostToThread(threadId, postData) {
      // Convert id to number if it's a string
      const numericThreadId = typeof threadId === 'string' ? parseInt(threadId, 10) : threadId;
      
      const threadIndex = this.threads.findIndex(t => t.id === numericThreadId);
      if (threadIndex === -1) {
        return Promise.reject(new Error('Thread not found'));
      }
      
      const postId = Date.now();
      const newPost = {
        id: postId,
        threadId: numericThreadId,
        author: postData.author || this.threads[threadIndex].community,
        date: 'Just now',
        title: postData.title,
        description: postData.description,
        editNumber: postData.editNumber || 1,
        status: postData.status || 'just-started',
        image: postData.image
      };
      
      this.threads[threadIndex].posts.push(newPost);
      this._saveToLocalStorage();
      
      console.log(`Added post to thread ${numericThreadId}:`, newPost);
      return Promise.resolve(newPost);
    }
    
    // Get a specific post by ID
    getPostById(postId) {
      // Convert id to number if it's a string
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;
      
      for (const thread of this.threads) {
        const post = thread.posts.find(p => p.id === numericPostId);
        if (post) {
          console.log(`Found post ${numericPostId} in thread ${thread.id}:`, post);
          return Promise.resolve({ thread, post });
        }
      }
      
      console.log(`Post ${numericPostId} not found`);
      return Promise.resolve(null);
    }
    
    // Helper method to load from localStorage
    _loadFromLocalStorage() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const savedThreads = localStorage.getItem('critiqueThreads');
          if (savedThreads) {
            this.threads = JSON.parse(savedThreads);
            console.log('Loaded threads from localStorage:', this.threads);
          }
        } catch (e) {
          console.error('Error loading critique threads from localStorage:', e);
        }
      }
    }
    
    // Helper method to save to localStorage
    _saveToLocalStorage() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('critiqueThreads', JSON.stringify(this.threads));
          console.log('Saved threads to localStorage');
        } catch (e) {
          console.error('Error saving critique threads to localStorage:', e);
        }
      }
    }
  }
  
  // Create and export a singleton instance
  const critiqueService = new CritiqueService();
  export default critiqueService;