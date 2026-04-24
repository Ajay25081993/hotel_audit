export interface ChecklistItem {
  id: string;
  category: string;
  subcategory?: string;
  item: string;
  description: string;
  maxScore: number;
  weight: number; // Importance weight for AI scoring
  mediaTypes: ('photo' | 'video' | 'text')[];
  requiredMedia?: ('photo' | 'video' | 'text')[];
  aiScoringCriteria: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  items: ChecklistItem[];
}

export const HOTEL_AUDIT_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'arrival-checkin',
    name: 'Arrival & Check-In Experience',
    description: 'First impression and check-in process evaluation',
    weight: 0.25,
    items: [
      {
        id: 'valet-greeting',
        category: 'arrival-checkin',
        subcategory: 'exterior-service',
        item: 'Valet and Bellboy Greeting',
        description: 'Immediate acknowledgment and warm greeting upon arrival',
        maxScore: 10,
        weight: 0.8,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess greeting warmth, promptness (within 30 seconds), professionalism, and adherence to Taj hospitality standards'
      },
      {
        id: 'luggage-assistance',
        category: 'arrival-checkin',
        subcategory: 'exterior-service',
        item: 'Luggage Assistance Offered',
        description: 'Proactive offer and handling of guest luggage',
        maxScore: 10,
        weight: 0.7,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate proactive offering, careful handling, efficient transportation to room'
      },
      {
        id: 'lobby-greeting',
        category: 'arrival-checkin',
        subcategory: 'reception',
        item: 'Staff Greeting (Namaste/Welcome Drink)',
        description: 'Traditional Taj greeting and welcome amenity presentation',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Assess cultural greeting authenticity, welcome drink quality/presentation, staff warmth and Tajness embodiment'
      },
      {
        id: 'guest-name-usage',
        category: 'arrival-checkin',
        subcategory: 'personalization',
        item: 'Use of Guest Name (Minimum 2x)',
        description: 'Personalized service through frequent, appropriate name usage',
        maxScore: 10,
        weight: 0.8,
        mediaTypes: ['text', 'video'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Count name usage frequency, assess naturalness and appropriateness of usage'
      },
      {
        id: 'checkin-efficiency',
        category: 'arrival-checkin',
        subcategory: 'process',
        item: 'Efficient Check-in Process (Under 5 Minutes)',
        description: 'Streamlined check-in without delays or complications',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['text', 'video'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Measure time duration, assess process smoothness, staff preparedness, system efficiency'
      },
      {
        id: 'room-key-presentation',
        category: 'arrival-checkin',
        subcategory: 'process',
        item: 'Room Key and Information Presentation',
        description: 'Professional handover of room keys with property information',
        maxScore: 10,
        weight: 0.6,
        mediaTypes: ['photo', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate presentation style, information completeness, directions clarity'
      }
    ]
  },
  {
    id: 'room-experience',
    name: 'Room Experience & Amenities',
    description: 'In-room service quality and amenity standards',
    weight: 0.3,
    items: [
      {
        id: 'room-cleanliness',
        category: 'room-experience',
        subcategory: 'housekeeping',
        item: 'Room Cleanliness and Readiness',
        description: 'Overall cleanliness, organization, and preparation standards',
        maxScore: 20,
        weight: 1.0,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Assess cleanliness of all surfaces, bathroom condition, bed preparation, dust-free environment, overall presentation'
      },
      {
        id: 'amenity-availability',
        category: 'room-experience',
        subcategory: 'amenities',
        item: 'Amenity Availability and Quality',
        description: 'Complete amenity setup including toiletries, linens, and room supplies',
        maxScore: 15,
        weight: 0.8,
        mediaTypes: ['photo', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Check amenity completeness, quality, presentation, brand consistency, expiration dates'
      },
      {
        id: 'welcome-personalization',
        category: 'room-experience',
        subcategory: 'personalization',
        item: 'Personalized Welcome Note or Gift',
        description: 'Customized welcome gesture reflecting guest preferences',
        maxScore: 10,
        weight: 0.7,
        mediaTypes: ['photo', 'text'],
        requiredMedia: ['photo'],
        aiScoringCriteria: 'Evaluate personalization level, presentation quality, relevance to guest profile'
      },
      {
        id: 'appliance-functionality',
        category: 'room-experience',
        subcategory: 'technical',
        item: 'Functional Appliances and Climate Control',
        description: 'All room appliances working properly including AC, TV, lighting',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Test all appliances, assess climate control responsiveness, lighting functionality, technology integration'
      },
      {
        id: 'room-maintenance',
        category: 'room-experience',
        subcategory: 'maintenance',
        item: 'Room Maintenance and Aesthetics',
        description: 'Physical condition of room including fixtures, furniture, decor',
        maxScore: 15,
        weight: 0.8,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Assess furniture condition, wall/ceiling condition, fixture functionality, aesthetic appeal'
      },
      {
        id: 'bathroom-standards',
        category: 'room-experience',
        subcategory: 'bathroom',
        item: 'Bathroom Standards and Amenities',
        description: 'Bathroom cleanliness, amenities, and functionality',
        maxScore: 20,
        weight: 0.9,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Evaluate cleanliness, water pressure, amenity quality, towel condition, overall maintenance'
      }
    ]
  },
  {
    id: 'dining-experience',
    name: 'Dining Experience',
    description: 'Restaurant service quality and food standards',
    weight: 0.25,
    items: [
      {
        id: 'host-greeting-seating',
        category: 'dining-experience',
        subcategory: 'reception',
        item: 'Host Greeting and Seating',
        description: 'Restaurant host welcome and table assignment process',
        maxScore: 10,
        weight: 0.7,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess greeting warmth, waiting time, seating appropriateness, host professionalism'
      },
      {
        id: 'menu-explanation',
        category: 'dining-experience',
        subcategory: 'service',
        item: 'Menu Explanation and Specials',
        description: 'Server knowledge and presentation of menu items and daily specials',
        maxScore: 15,
        weight: 0.8,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate menu knowledge, special dish presentation, dietary accommodation, recommendation quality'
      },
      {
        id: 'service-timeliness',
        category: 'dining-experience',
        subcategory: 'efficiency',
        item: 'Timeliness of Service',
        description: 'Speed and efficiency of order taking, food delivery, and service',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['text', 'video'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Measure ordering time, food delivery time, service intervals, overall efficiency'
      },
      {
        id: 'food-quality',
        category: 'dining-experience',
        subcategory: 'culinary',
        item: 'Taste, Temperature, and Presentation',
        description: 'Food quality assessment including taste, proper temperature, and visual presentation',
        maxScore: 20,
        weight: 1.0,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Assess food temperature appropriateness, visual presentation, portion size, taste quality based on description'
      },
      {
        id: 'dining-ambiance',
        category: 'dining-experience',
        subcategory: 'atmosphere',
        item: 'Dining Ambiance and Environment',
        description: 'Restaurant atmosphere, cleanliness, and overall dining environment',
        maxScore: 10,
        weight: 0.6,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['photo'],
        aiScoringCriteria: 'Evaluate cleanliness, lighting, music level, table setup, overall atmosphere'
      }
    ]
  },
  {
    id: 'staff-interaction',
    name: 'Staff Interaction & Service',
    description: 'Staff professionalism and adherence to Taj standards',
    weight: 0.2,
    items: [
      {
        id: 'grooming-uniform',
        category: 'staff-interaction',
        subcategory: 'appearance',
        item: 'Grooming and Uniform Standards',
        description: 'Staff appearance, uniform condition, and personal grooming',
        maxScore: 15,
        weight: 0.8,
        mediaTypes: ['photo', 'text'],
        requiredMedia: ['photo', 'text'],
        aiScoringCriteria: 'Assess uniform cleanliness and fit, grooming standards, name tag visibility, overall professional appearance'
      },
      {
        id: 'hospitality-markers',
        category: 'staff-interaction',
        subcategory: 'behavior',
        item: 'Hospitality Markers (Smile, Empathy)',
        description: 'Demonstration of genuine hospitality through body language and demeanor',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate smile frequency, eye contact, empathetic responses, positive body language'
      },
      {
        id: 'tajness-adherence',
        category: 'staff-interaction',
        subcategory: 'brand-standards',
        item: 'Adherence to "Tajness" – Mindfulness, Grace, Warmth',
        description: 'Embodiment of Taj brand values through service delivery',
        maxScore: 20,
        weight: 1.0,
        mediaTypes: ['video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess mindful service approach, graceful interactions, warmth demonstration, cultural sensitivity, brand value embodiment'
      },
      {
        id: 'problem-resolution',
        category: 'staff-interaction',
        subcategory: 'service-recovery',
        item: 'Problem Resolution and Service Recovery',
        description: 'Staff ability to handle issues and recover service failures',
        maxScore: 15,
        weight: 0.8,
        mediaTypes: ['text', 'video'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate problem-solving approach, recovery speed, guest satisfaction, proactive solutions'
      },
      {
        id: 'local-knowledge',
        category: 'staff-interaction',
        subcategory: 'expertise',
        item: 'Local Knowledge and Recommendations',
        description: 'Staff knowledge of local attractions, culture, and recommendations',
        maxScore: 10,
        weight: 0.6,
        mediaTypes: ['text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess local knowledge depth, recommendation quality, cultural insights, personalized suggestions'
      }
    ]
  },
  {
    id: 'checkout-experience',
    name: 'Check-Out Experience',
    description: 'Final impression and departure process evaluation',
    weight: 0.1,
    items: [
      {
        id: 'billing-accuracy',
        category: 'checkout-experience',
        subcategory: 'billing',
        item: 'Timely and Accurate Billing',
        description: 'Efficient checkout process with accurate billing and no delays',
        maxScore: 15,
        weight: 0.9,
        mediaTypes: ['photo', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess billing accuracy, checkout time (under 3 minutes), clarity of charges, resolution of any discrepancies'
      },
      {
        id: 'farewell-gesture',
        category: 'checkout-experience',
        subcategory: 'hospitality',
        item: 'Farewell Gesture and Appreciation',
        description: 'Warm farewell with gratitude expression and safe travel wishes',
        maxScore: 10,
        weight: 0.8,
        mediaTypes: ['video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate warmth of farewell, gratitude expression, personal touch, cultural appropriateness of farewell'
      },
      {
        id: 'loyalty-membership-offer',
        category: 'checkout-experience',
        subcategory: 'relationship-building',
        item: 'Loyalty Membership or Future Booking Offer',
        description: 'Proactive offering of loyalty program benefits and future stay opportunities',
        maxScore: 10,
        weight: 0.7,
        mediaTypes: ['text', 'photo'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess proactive offering, benefit explanation clarity, enthusiasm in presentation, follow-up commitment'
      },
      {
        id: 'luggage-departure-assistance',
        category: 'checkout-experience',
        subcategory: 'service',
        item: 'Luggage and Transportation Assistance',
        description: 'Assistance with luggage and transportation arrangements upon departure',
        maxScore: 10,
        weight: 0.6,
        mediaTypes: ['photo', 'video', 'text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Evaluate luggage handling care, transportation arrangement efficiency, staff proactiveness'
      },
      {
        id: 'feedback-collection',
        category: 'checkout-experience',
        subcategory: 'improvement',
        item: 'Guest Feedback Collection',
        description: 'Solicitation of guest feedback and suggestions for future improvements',
        maxScore: 5,
        weight: 0.5,
        mediaTypes: ['text'],
        requiredMedia: ['text'],
        aiScoringCriteria: 'Assess feedback solicitation approach, listening quality, note-taking, promise of follow-up action'
      }
    ]
  }
];

export const getChecklistItemById = (id: string): ChecklistItem | undefined => {
  for (const category of HOTEL_AUDIT_CHECKLIST) {
    const item = category.items.find(item => item.id === id);
    if (item) return item;
  }
  return undefined;
};

export const calculateCategoryScore = (categoryId: string, itemScores: Record<string, number>): number => {
  const category = HOTEL_AUDIT_CHECKLIST.find(cat => cat.id === categoryId);
  if (!category) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  category.items.forEach(item => {
    const score = itemScores[item.id] || 0;
    const weightedScore = (score / item.maxScore) * item.weight;
    totalWeightedScore += weightedScore;
    totalWeight += item.weight;
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
};

export const calculateOverallScore = (itemScores: Record<string, number>): number => {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  HOTEL_AUDIT_CHECKLIST.forEach(category => {
    const categoryScore = calculateCategoryScore(category.id, itemScores);
    totalWeightedScore += (categoryScore / 100) * category.weight;
    totalWeight += category.weight;
  });

  return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
};