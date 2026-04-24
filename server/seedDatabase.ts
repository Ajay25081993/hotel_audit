import { db } from "./db";
import { users, properties, audits, auditItems, hotelGroups } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Check if users already exist to avoid duplicate seeding
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Creating demo users...");

    // Create demo users for each role
    await db.insert(users).values([
      {
        username: 'admin',
        password: 'password',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@hotel.com'
      },
      {
        username: 'auditor',
        password: 'password',
        role: 'auditor',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@audit.com'
      },
      {
        username: 'reviewer',
        password: 'password',
        role: 'reviewer',
        name: 'Michael Chen',
        email: 'michael.chen@qa.com'
      },
      {
        username: 'corporate',
        password: 'password',
        role: 'corporate',
        name: 'Corporate User',
        email: 'corporate@hotel.com'
      },
      {
        username: 'hotelgm',
        password: 'password',
        role: 'hotelgm',
        name: 'Hotel GM',
        email: 'gm@tajpalace.com'
      }
    ]);

    console.log("Creating hotel groups...");

    // Create hotel groups with SOPs
    await db.insert(hotelGroups).values([
      {
        name: 'Taj Hotels',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Rooms must be cleaned to white-glove standards with daily quality checks",
              publicAreas: "All public areas cleaned hourly, marble surfaces polished twice daily",
              restaurants: "Kitchen deep cleaning after each service, dining areas sanitized between guests"
            },
            branding: {
              signage: "All Taj branding must be prominently displayed with proper lighting",
              uniforms: "Staff uniforms must be pristine with proper name tags and accessories",
              ambiance: "Maintain luxury Indian hospitality ambiance with traditional elements"
            },
            service: {
              responseTime: "Guest requests acknowledged within 2 minutes, resolved within 10 minutes",
              greeting: "Traditional Indian greeting 'Namaste' with hands folded",
              concierge: "24/7 concierge service with local expertise and cultural knowledge"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exceeds Taj luxury standards significantly",
            good: "80-89: Meets most Taj standards with minor gaps",
            acceptable: "70-79: Basic Taj standards met, improvement needed",
            poor: "Below 70: Immediate corrective action required"
          }
        }),
        sopFiles: JSON.stringify([
          {
            name: "Taj_Brand_Standards_2024.pdf",
            type: "application/pdf",
            size: 2450000,
            url: "/uploads/sop/taj-brand-standards-2024.pdf",
            uploadedAt: new Date().toISOString()
          },
          {
            name: "Taj_Service_Excellence_Guide.docx",
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size: 1200000,
            url: "/uploads/sop/taj-service-excellence-guide.docx",
            uploadedAt: new Date().toISOString()
          }
        ])
      },
      {
        name: 'Marriott',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Marriott Clean standards with enhanced sanitization protocols",
              publicAreas: "High-touch surfaces sanitized every 30 minutes",
              restaurants: "Food safety protocols strictly followed with temperature monitoring"
            },
            branding: {
              signage: "Marriott branding consistent across all touchpoints",
              uniforms: "Professional business attire with Marriott badges",
              technology: "Mobile check-in/out capabilities fully functional"
            },
            service: {
              responseTime: "Guest requests handled within 5 minutes",
              greeting: "Warm professional greeting with eye contact",
              loyalty: "Marriott Bonvoy benefits properly communicated and delivered"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exceptional Marriott service delivery",
            good: "80-89: Solid Marriott standards compliance",
            acceptable: "70-79: Meets basic requirements, room for improvement",
            poor: "Below 70: Does not meet Marriott brand standards"
          }
        })
      },
      {
        name: 'Hilton Hotels',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Hilton CleanStay protocols with electrostatic spraying",
              publicAreas: "Enhanced cleaning with EPA-approved products",
              restaurants: "Food safety excellence with digital temperature logs"
            },
            branding: {
              signage: "Hilton blue branding with proper illumination standards",
              uniforms: "Navy blue uniforms with Hilton insignia",
              technology: "Hilton Honors app integration fully operational"
            },
            service: {
              responseTime: "Guest requests addressed within 3 minutes",
              greeting: "Professional welcome with Hilton hospitality standards",
              concierge: "Local area expertise and 24/7 assistance"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exceptional Hilton hospitality delivery",
            good: "80-89: Strong adherence to Hilton standards",
            acceptable: "70-79: Meets minimum requirements",
            poor: "Below 70: Immediate improvement required"
          }
        }),
        sopFiles: JSON.stringify([
          {
            name: "Hilton_CleanStay_Standards.pdf",
            type: "application/pdf",
            size: 1800000,
            url: "/uploads/sop/hilton-cleanstay-standards.pdf",
            uploadedAt: new Date().toISOString()
          }
        ])
      },
      {
        name: 'ITC Hotels',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "ITC's Responsible Luxury standards with eco-friendly products",
              publicAreas: "LEED-certified cleaning practices maintained",
              restaurants: "Farm-to-table hygiene protocols"
            },
            branding: {
              signage: "ITC luxury branding with traditional Indian elements",
              uniforms: "Khadi-inspired uniforms showcasing Indian craftsmanship",
              sustainability: "Visible sustainability messaging throughout property"
            },
            service: {
              responseTime: "Anticipatory service within 1 minute acknowledgment",
              greeting: "Traditional Indian welcome with modern luxury touch",
              expertise: "Local cultural expertise and heritage storytelling"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exemplary responsible luxury standards",
            good: "80-89: Good adherence to ITC principles",
            acceptable: "70-79: Basic standards met",
            poor: "Below 70: Does not reflect ITC values"
          }
        })
      },
      {
        name: 'Hyatt Hotels',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Hyatt commitment to care with enhanced protocols",
              publicAreas: "Global Biorisk Advisory Council approved cleaning",
              restaurants: "Culinary excellence with safety first approach"
            },
            branding: {
              signage: "Contemporary Hyatt branding with local inspiration",
              uniforms: "Modern professional attire with Hyatt pins",
              experience: "Purpose-driven hospitality visible throughout"
            },
            service: {
              responseTime: "Immediate acknowledgment, resolution within 5 minutes",
              greeting: "Genuine care and human connection approach",
              wellbeing: "Focus on guest wellbeing and inclusive hospitality"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Outstanding care and hospitality",
            good: "80-89: Good representation of Hyatt values",
            acceptable: "70-79: Meets basic Hyatt standards",
            poor: "Below 70: Does not align with Hyatt purpose"
          }
        })
      },
      {
        name: 'Oberoi Hotels',
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Oberoi's legendary attention to detail and perfection",
              publicAreas: "Immaculate presentation at all times",
              restaurants: "Michelin-level hygiene and presentation standards"
            },
            branding: {
              signage: "Elegant Oberoi branding with understated luxury",
              uniforms: "Impeccably tailored uniforms with Oberoi sophistication",
              ambiance: "Serene luxury atmosphere with personalized touches"
            },
            service: {
              responseTime: "Anticipatory service before guests ask",
              greeting: "Personalized recognition and gracious hospitality",
              butler: "Dedicated butler service with exceptional attention"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Epitome of luxury hospitality",
            good: "80-89: High Oberoi standards maintained",
            acceptable: "70-79: Good but room for Oberoi excellence",
            poor: "Below 70: Does not meet Oberoi's legendary standards"
          }
        })
      }
    ]);

    // Get the actual hotel group IDs from the database
    const hotelGroupsResult = await db.select().from(hotelGroups);
    const tajId = hotelGroupsResult.find(g => g.name === 'Taj Hotels')?.id;
    const marriottId = hotelGroupsResult.find(g => g.name === 'Marriott')?.id;
    const hiltonId = hotelGroupsResult.find(g => g.name === 'Hilton Hotels')?.id;
    const itcId = hotelGroupsResult.find(g => g.name === 'ITC Hotels')?.id;
    const hyattId = hotelGroupsResult.find(g => g.name === 'Hyatt Hotels')?.id;
    const oberoiId = hotelGroupsResult.find(g => g.name === 'Oberoi Hotels')?.id;

    // Create demo properties
    await db.insert(properties).values([
      {
        name: 'Taj Palace, New Delhi',
        location: 'New Delhi',
        region: 'North India',
        hotelGroupId: tajId, // Taj Hotels
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 85,
        nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'green'
      },
      {
        name: 'Taj Mahal, Mumbai',
        location: 'Mumbai',
        region: 'West India',
        hotelGroupId: tajId, // Taj Hotels
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 72,
        nextAuditDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'amber'
      },
      {
        name: 'Taj Lake Palace, Udaipur',
        location: 'Udaipur',
        region: 'North India',
        hotelGroupId: tajId, // Taj Hotels
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 92,
        nextAuditDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'green'
      },
      {
        name: 'Marriott Grand, Goa',
        location: 'Goa',
        region: 'West India',
        hotelGroupId: marriottId, // Marriott
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 78,
        nextAuditDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'amber'
      },
      {
        name: 'Marriott International, Delhi',
        location: 'Delhi',
        region: 'North India',
        hotelGroupId: marriottId, // Marriott
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 88,
        nextAuditDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'Hilton Garden Inn, Bangalore',
        location: 'Bangalore',
        region: 'South India',
        hotelGroupId: hiltonId, // Hilton Hotels
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 82,
        nextAuditDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'Hilton Chennai',
        location: 'Chennai',
        region: 'South India',
        hotelGroupId: hiltonId, // Hilton Hotels
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 75,
        nextAuditDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: 'amber'
      },
      {
        name: 'ITC Grand Central, Mumbai',
        location: 'Mumbai',
        region: 'West India',
        hotelGroupId: itcId, // ITC Hotels
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 91,
        nextAuditDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'ITC Rajputana, Jaipur',
        location: 'Jaipur',
        region: 'North India',
        hotelGroupId: itcId, // ITC Hotels
        image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 86,
        nextAuditDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'Hyatt Regency, Pune',
        location: 'Pune',
        region: 'West India',
        hotelGroupId: hyattId, // Hyatt Hotels
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 79,
        nextAuditDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        status: 'amber'
      },
      {
        name: 'Hyatt Centric, Kolkata',
        location: 'Kolkata',
        region: 'East India',
        hotelGroupId: hyattId, // Hyatt Hotels
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 84,
        nextAuditDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'The Oberoi, New Delhi',
        location: 'New Delhi',
        region: 'North India',
        hotelGroupId: oberoiId, // Oberoi Hotels
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 95,
        nextAuditDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'The Oberoi Grand, Kolkata',
        location: 'Kolkata',
        region: 'East India',
        hotelGroupId: oberoiId, // Oberoi Hotels
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 93,
        nextAuditDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'green'
      },
      {
        name: 'The Oberoi Mumbai',
        location: 'Mumbai',
        region: 'West India',
        hotelGroupId: oberoiId, // Oberoi Hotels
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 89,
        nextAuditDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
        status: 'green'
      }
    ]);

    // Create demo audits
    await db.insert(audits).values([
      {
        propertyId: 1,
        auditorId: 2, // Sarah Johnson
        reviewerId: 3, // Michael Chen
        hotelGroupId: 1, // Taj Hotels
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Rooms must be cleaned to white-glove standards with daily quality checks",
              publicAreas: "All public areas cleaned hourly, marble surfaces polished twice daily",
              restaurants: "Kitchen deep cleaning after each service, dining areas sanitized between guests"
            },
            branding: {
              signage: "All Taj branding must be prominently displayed with proper lighting",
              uniforms: "Staff uniforms must be pristine with proper name tags and accessories",
              ambiance: "Maintain luxury Indian hospitality ambiance with traditional elements"
            },
            service: {
              responseTime: "Guest requests acknowledged within 2 minutes, resolved within 10 minutes",
              greeting: "Traditional Indian greeting 'Namaste' with hands folded",
              concierge: "24/7 concierge service with local expertise and cultural knowledge"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exceeds Taj luxury standards significantly",
            good: "80-89: Meets most Taj standards with minor gaps",
            acceptable: "70-79: Basic Taj standards met, improvement needed",
            poor: "Below 70: Immediate corrective action required"
          }
        }),
        status: 'in_progress',
        overallScore: null,
        cleanlinessScore: null,
        brandingScore: null,
        operationalScore: null,
        complianceZone: null,
        findings: null,
        actionPlan: null,
        submittedAt: null,
        reviewedAt: null
      },
      {
        propertyId: 2,
        auditorId: 2, // Sarah Johnson
        reviewerId: 3, // Michael Chen
        hotelGroupId: 1, // Taj Hotels
        sop: JSON.stringify({
          brandStandards: {
            cleanliness: {
              housekeeping: "Rooms must be cleaned to white-glove standards with daily quality checks",
              publicAreas: "All public areas cleaned hourly, marble surfaces polished twice daily",
              restaurants: "Kitchen deep cleaning after each service, dining areas sanitized between guests"
            },
            branding: {
              signage: "All Taj branding must be prominently displayed with proper lighting",
              uniforms: "Staff uniforms must be pristine with proper name tags and accessories",
              ambiance: "Maintain luxury Indian hospitality ambiance with traditional elements"
            },
            service: {
              responseTime: "Guest requests acknowledged within 2 minutes, resolved within 10 minutes",
              greeting: "Traditional Indian greeting 'Namaste' with hands folded",
              concierge: "24/7 concierge service with local expertise and cultural knowledge"
            }
          },
          scoringCriteria: {
            excellent: "90-100: Exceeds Taj luxury standards significantly",
            good: "80-89: Meets most Taj standards with minor gaps",
            acceptable: "70-79: Basic Taj standards met, improvement needed",
            poor: "Below 70: Immediate corrective action required"
          }
        }),
        status: 'scheduled',
        overallScore: null,
        cleanlinessScore: null,
        brandingScore: null,
        operationalScore: null,
        complianceZone: null,
        findings: null,
        actionPlan: null,
        submittedAt: null,
        reviewedAt: null
      }
    ]);

    // Create demo audit items
    await db.insert(auditItems).values([
      {
        auditId: 1,
        category: 'Cleanliness',
        item: 'Lobby cleanliness standards',
        score: 4,
        comments: 'Very good overall, minor improvements needed in corners',
        aiAnalysis: 'Good performance with attention to detail. Recommend focusing on corner areas for consistent cleanliness standards.',
        photos: null,
        status: 'completed'
      },
      {
        auditId: 1,
        category: 'Branding',
        item: 'Logo placement compliance',
        score: 3,
        comments: 'Some inconsistencies with brand guidelines',
        aiAnalysis: 'Moderate compliance with brand standards. Several placement inconsistencies identified that require attention.',
        photos: null,
        status: 'completed'
      },
      {
        auditId: 1,
        category: 'Operational',
        item: 'Staff uniform compliance',
        score: null,
        comments: 'Item pending auditor completion',
        aiAnalysis: null,
        photos: null,
        status: 'pending'
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}