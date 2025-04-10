// src/components/home/TrendingCritiques.jsx
import React from 'react';
import Card from '../common/Card';

const TrendingCritiques = () => {
  const critiques = [
    {
      id: 1,
      community: 'r/ijuneneedshelp',
      date: '2 days ago',
      title: 'POST NAME: I need help with my poster design.',
      description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
      image: null, // This would be the image URL in a real application
    },
    {
      id: 2,
      community: 'r/ijuneneedshelp',
      date: '2 days ago',
      title: 'POST NAME: I need help with my poster design.',
      description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
      image: null,
    },
    {
      id: 3,
      community: 'r/ijuneneedshelp',
      date: '2 days ago',
      title: 'POST NAME: I need help with my poster design.',
      description: 'Hi, I am doing an assignment for Type II and I need help with my poster design. I think the composition is off but I am not too sure... Any advice?',
      image: null,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Top Trending Critiques</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {critiques.map((critique) => (
          <Card
            key={critique.id}
            community={critique.community}
            date={critique.date}
            title={critique.title}
            description={critique.description}
            image={critique.image}
            onEnterClick={() => console.log(`Enter critique ${critique.id}`)}
            onEditClick={() => console.log(`Edit critique ${critique.id}`)}
            hasEditButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingCritiques;