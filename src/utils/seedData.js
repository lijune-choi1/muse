// src/utils/seedData.js
export const dummyPosts = [
    {
      title: "Need feedback on my logo design",
      description: "I'm working on a logo for a coffee shop. Would love some constructive criticism on the color scheme and typography.",
      imageUrl: "https://via.placeholder.com/600x400?text=Logo+Design",
      community: "r/Graphic4ever",
      communityName: "r/Graphic4ever",
      author: "lijune.choi20",
      authorName: "lijune.choi20",
      status: "Open",
      editNumber: 0,
      comments: [
        {
          userId: "user123",
          username: "designpro",
          text: "The color palette works well, but I'd suggest making the font a bit bolder.",
          createdAt: new Date(2024, 4, 10)
        }
      ],
      createdAt: new Date(2024, 5, 8)
    },
    {
      title: "UI Design for Mobile App",
      description: "I'm designing a fitness tracking app and would appreciate feedback on the dashboard screen.",
      imageUrl: "https://via.placeholder.com/600x400?text=UI+Design",
      community: "r/Graphic4ever",
      communityName: "r/Graphic4ever",
      author: "designuser42",
      authorName: "designuser42",
      status: "Open",
      editNumber: 2,
      comments: [],
      createdAt: new Date(2024, 5, 9)
    },
    {
      title: "Help with drawing hands",
      description: "I've been practicing figure drawing but still struggle with hands. Any tips or resources?",
      imageUrl: "https://via.placeholder.com/600x400?text=Drawing+Hands",
      community: "r/ijuneneedshelp",
      communityName: "r/ijuneneedshelp",
      author: "artlover99",
      authorName: "artlover99",
      status: "In Progress",
      editNumber: 1,
      comments: [
        {
          userId: "user456",
          username: "handdrawingpro",
          text: "Try breaking down hands into simple shapes first. I recommend Proko's hand drawing tutorial on YouTube.",
          createdAt: new Date(2024, 5, 7)
        },
        {
          userId: "user789",
          username: "lijune.choi20",
          text: "Practice by tracing photos of hands in different positions, then gradually move to drawing from reference.",
          createdAt: new Date(2024, 5, 7)
        }
      ],
      createdAt: new Date(2024, 5, 6)
    },
    {
      title: "Color scheme for nature website",
      description: "I'm designing a website for a national park. Would these colors work well together?",
      imageUrl: "https://via.placeholder.com/600x400?text=Color+Scheme",
      community: "r/ijuneneedshelp",
      communityName: "r/ijuneneedshelp",
      author: "webdev2024",
      authorName: "webdev2024",
      status: "Open",
      editNumber: 0,
      comments: [],
      createdAt: new Date(2024, 5, 11)
    },
    {
      title: "Poster design for music festival",
      description: "Created this poster for an electronic music festival. Looking for feedback on composition and typography.",
      imageUrl: "https://via.placeholder.com/600x400?text=Festival+Poster",
      community: "r/Graphic4ever",
      communityName: "r/Graphic4ever",
      author: "designguru",
      authorName: "designguru",
      status: "Closed",
      editNumber: 3,
      comments: [
        {
          userId: "user321",
          username: "posterpro",
          text: "Great visual hierarchy! The typography stands out nicely against the background.",
          createdAt: new Date(2024, 5, 1)
        }
      ],
      createdAt: new Date(2024, 4, 30)
    }
  ];
  
  export const dummyCommunities = [
    {
      name: "r/ijuneneedshelp",
      description: "A community for creative people to get feedback and help with their projects.",
      guidelines: [
        "Be constructive with your criticism",
        "Explain your reasoning",
        "Be respectful to other members"
      ],
      rules: [
        "No spam or self-promotion",
        "Always provide context with your posts",
        "Give feedback to others if you're asking for feedback"
      ],
      visibility: "Public",
      createdBy: "lijune.choi20",
      creatorUsername: "lijune.choi20",
      moderators: ["lijune.choi20"],
      members: ["lijune.choi20", "artlover99", "webdev2024"],
      createdAt: new Date(2024, 4, 15)
    },
    {
      name: "r/Graphic4ever",
      description: "A place for graphic designers to share work and receive professional critique.",
      guidelines: [
        "Focus on specific aspects you want feedback on",
        "Include information about your design process",
        "Respond to feedback and show iterations"
      ],
      rules: [
        "Professional critiques only",
        "No low-effort posts",
        "Credit others' work when referenced"
      ],
      visibility: "Public",
      createdBy: "designguru",
      creatorUsername: "designguru",
      moderators: ["designguru", "lijune.choi20"],
      members: ["designguru", "lijune.choi20", "designuser42"],
      createdAt: new Date(2024, 3, 20)
    }
  ];