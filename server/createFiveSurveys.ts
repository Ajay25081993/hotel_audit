import { db } from "./db";
import { users, properties, audits, auditItems, hotelGroups } from "@shared/schema";

export async function createFiveSurveys() {
  console.log("Creating 5 additional comprehensive surveys...");

  try {
    // Get existing data
    const existingUsers = await db.select().from(users);
    const existingProperties = await db.select().from(properties);
    const existingHotelGroups = await db.select().from(hotelGroups);

    // Create additional properties for diversity
    const newProperties = await db.insert(properties).values([
      {
        name: "Marriott Executive Apartments, Bangalore",
        location: "Whitefield, Bangalore",
        region: "South India",
        hotelGroupId: 2, // Marriott
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        lastAuditScore: 92,
        status: 'green'
      },
      {
        name: "Hilton Garden Inn, Gurgaon",
        location: "Cyber City, Gurgaon",
        region: "North India",
        hotelGroupId: 3, // Hilton
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        lastAuditScore: 76,
        status: 'amber'
      },
      {
        name: "ITC Grand Central, Mumbai",
        location: "Parel, Mumbai",
        region: "West India",
        hotelGroupId: 4, // ITC
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        lastAuditScore: 88,
        status: 'green'
      },
      {
        name: "Hyatt Regency, Chennai",
        location: "Anna Salai, Chennai",
        region: "South India",
        hotelGroupId: 5, // Hyatt
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        lastAuditScore: 65,
        status: 'red'
      },
      {
        name: "Taj Bengal, Kolkata",
        location: "Alipore, Kolkata",
        region: "East India",
        hotelGroupId: 1, // Taj
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        lastAuditScore: 94,
        status: 'green'
      }
    ]).returning();

    console.log("Created new properties:", newProperties.length);

    // Survey 1: Excellent Performance (Marriott Executive Apartments) - Score: 92
    const survey1 = await db.insert(audits).values({
      propertyId: newProperties[0].id,
      auditorId: 2, // auditor
      reviewerId: 3, // reviewer
      hotelGroupId: 2,
      sop: existingHotelGroups.find(g => g.id === 2)?.sop || "{}",
      status: 'completed',
      overallScore: 92,
      cleanlinessScore: 95,
      brandingScore: 90,
      operationalScore: 91,
      complianceZone: 'green',
      findings: JSON.stringify({
        strengths: [
          "Exceptional cleanliness standards maintained throughout property",
          "Marriott branding perfectly aligned across all touchpoints",
          "Staff training excellence evident in guest interactions",
          "Technology integration seamless and user-friendly"
        ],
        improvements: [
          "Minor wear and tear in elevator lobby requires attention",
          "Restaurant ambient lighting could be enhanced during evening hours"
        ],
        criticalIssues: []
      }),
      actionPlan: JSON.stringify({
        immediate: [],
        shortTerm: [
          "Schedule elevator lobby maintenance within 2 weeks",
          "Install dimmer controls in restaurant by month-end"
        ],
        longTerm: [
          "Continue current excellence standards",
          "Consider staff recognition program expansion"
        ]
      }),
      submittedAt: new Date('2025-01-25T10:30:00Z'),
      reviewedAt: new Date('2025-01-26T14:20:00Z')
    }).returning();

    // Survey 1 Items
    await db.insert(auditItems).values([
      {
        auditId: survey1[0].id,
        category: "Cleanliness",
        item: "Guest Room Hygiene Standards",
        score: 5,
        comments: "Rooms consistently meet Marriott Clean standards. Enhanced sanitization protocols properly implemented.",
        aiAnalysis: "AI Analysis: Visual inspection confirms exceptional cleanliness. All surfaces properly sanitized, linens crisp and fresh. Temperature monitoring logs show consistent adherence to protocols.",
        photos: JSON.stringify(["/images/marriott-room-clean.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey1[0].id,
        category: "Cleanliness",
        item: "Public Area Maintenance",
        score: 5,
        comments: "Lobby, corridors, and common areas maintained to premium standards.",
        aiAnalysis: "AI Analysis: High-touch surfaces show proper sanitization frequency. Floors are spotless with no visible debris. Restroom facilities exceed cleanliness expectations.",
        photos: JSON.stringify(["/images/marriott-lobby-clean.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey1[0].id,
        category: "Branding",
        item: "Visual Identity Compliance",
        score: 4,
        comments: "Marriott branding consistent across property. Minor scuffing on entrance signage noted.",
        aiAnalysis: "AI Analysis: Brand colors and fonts properly applied throughout. Signage illumination optimal. Minor maintenance needed on entrance sign but overall excellent brand representation.",
        photos: JSON.stringify(["/images/marriott-branding.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey1[0].id,
        category: "Operations",
        item: "Staff Service Standards",
        score: 5,
        comments: "Staff demonstrate exceptional Marriott service culture. Response times consistently under 3 minutes.",
        aiAnalysis: "AI Analysis: Observed multiple positive guest interactions. Staff uniforms immaculate, proper greeting protocols followed. Mobile check-in process smooth and efficient.",
        photos: JSON.stringify(["/images/marriott-staff.jpg"]),
        status: 'completed'
      }
    ]);

    // Survey 2: Poor Performance (Hyatt Regency Chennai) - Score: 65
    const survey2 = await db.insert(audits).values({
      propertyId: newProperties[3].id,
      auditorId: 2,
      reviewerId: 3,
      hotelGroupId: 5,
      sop: existingHotelGroups.find(g => g.id === 5)?.sop || "{}",
      status: 'completed',
      overallScore: 65,
      cleanlinessScore: 60,
      brandingScore: 68,
      operationalScore: 67,
      complianceZone: 'red',
      findings: JSON.stringify({
        strengths: [
          "Property architecture and location remain attractive",
          "Kitchen food safety protocols mostly followed",
          "Some staff members demonstrate good service attitude"
        ],
        improvements: [
          "Guest room cleanliness requires immediate attention",
          "Staff training on Hyatt service standards needed",
          "Technology systems need updates and maintenance",
          "Branding signage requires repair and cleaning"
        ],
        criticalIssues: [
          "Multiple guest complaints about room cleanliness",
          "Elevator out of service for extended periods",
          "Restaurant service delays exceeding acceptable limits"
        ]
      }),
      actionPlan: JSON.stringify({
        immediate: [
          "Deep clean all guest rooms within 48 hours",
          "Repair main elevator immediately",
          "Implement emergency housekeeping training"
        ],
        shortTerm: [
          "Complete staff retraining program within 2 weeks",
          "Upgrade POS systems in restaurant",
          "Clean and repair all exterior signage"
        ],
        longTerm: [
          "Comprehensive property renovation planning",
          "Management restructuring consideration",
          "Guest satisfaction recovery program"
        ]
      }),
      submittedAt: new Date('2025-01-23T09:15:00Z'),
      reviewedAt: new Date('2025-01-24T16:45:00Z')
    }).returning();

    // Survey 2 Items
    await db.insert(auditItems).values([
      {
        auditId: survey2[0].id,
        category: "Cleanliness",
        item: "Guest Room Hygiene Standards",
        score: 2,
        comments: "Multiple rooms failed inspection. Bathroom hygiene below acceptable standards.",
        aiAnalysis: "AI Analysis: Visual evidence shows stained carpets, unclean bathroom fixtures, and dust accumulation on surfaces. This falls significantly below Hyatt cleanliness commitments.",
        photos: JSON.stringify(["/images/hyatt-room-issues.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey2[0].id,
        category: "Operations",
        item: "Response Time to Guest Requests",
        score: 2,
        comments: "Average response time 18 minutes, far exceeding Hyatt 5-minute standard.",
        aiAnalysis: "AI Analysis: Multiple instances observed of delayed responses. Staff appear undertrained or understaffed. Guest frustration visible in interactions.",
        photos: JSON.stringify(["/images/hyatt-service-delay.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey2[0].id,
        category: "Branding",
        item: "Technology Integration",
        score: 3,
        comments: "Hyatt app integration partially functional. Check-in kiosks frequently offline.",
        aiAnalysis: "AI Analysis: Technology systems show multiple error messages. Mobile check-in success rate below 60%. This impacts brand promise of seamless digital experience.",
        photos: JSON.stringify(["/images/hyatt-tech-issues.jpg"]),
        status: 'completed'
      }
    ]);

    // Survey 3: Good Performance (ITC Grand Central) - Score: 88
    const survey3 = await db.insert(audits).values({
      propertyId: newProperties[2].id,
      auditorId: 2,
      reviewerId: 3,
      hotelGroupId: 4,
      sop: existingHotelGroups.find(g => g.id === 4)?.sop || "{}",
      status: 'completed',
      overallScore: 88,
      cleanlinessScore: 90,
      brandingScore: 85,
      operationalScore: 89,
      complianceZone: 'green',
      findings: JSON.stringify({
        strengths: [
          "ITC's responsible luxury philosophy well-implemented",
          "Eco-friendly practices visible throughout property",
          "Staff demonstrate cultural expertise and warmth",
          "Local art and craftsmanship beautifully showcased",
          "Farm-to-table restaurant concept excellently executed"
        ],
        improvements: [
          "Some sustainability messaging could be more prominent",
          "Wi-Fi connectivity in conference rooms needs strengthening",
          "Spa booking system requires minor technical updates"
        ],
        criticalIssues: []
      }),
      actionPlan: JSON.stringify({
        immediate: [],
        shortTerm: [
          "Enhance sustainability signage in public areas",
          "Upgrade conference room network infrastructure",
          "Update spa management software"
        ],
        longTerm: [
          "Expand local artisan partnership program",
          "Consider additional eco-certification pursuits",
          "Enhance guest education on responsible luxury"
        ]
      }),
      submittedAt: new Date('2025-01-24T14:20:00Z'),
      reviewedAt: new Date('2025-01-25T11:30:00Z')
    }).returning();

    // Survey 3 Items
    await db.insert(auditItems).values([
      {
        auditId: survey3[0].id,
        category: "Cleanliness",
        item: "Eco-Friendly Cleaning Standards",
        score: 5,
        comments: "LEED-certified cleaning practices excellently maintained. All products environmentally responsible.",
        aiAnalysis: "AI Analysis: Cleaning supply storage shows exclusive use of eco-certified products. Staff properly trained on green cleaning protocols. Air quality consistently excellent.",
        photos: JSON.stringify(["/images/itc-eco-cleaning.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey3[0].id,
        category: "Branding",
        item: "Cultural Heritage Integration",
        score: 4,
        comments: "Local craftsmanship beautifully integrated. Some areas could showcase more regional elements.",
        aiAnalysis: "AI Analysis: Excellent display of local art and traditional crafts. Khadi-inspired uniforms authentic and well-maintained. Opportunity to enhance cultural storytelling in certain spaces.",
        photos: JSON.stringify(["/images/itc-culture.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey3[0].id,
        category: "Operations",
        item: "Farm-to-Table Restaurant Standards",
        score: 5,
        comments: "Restaurant exemplifies ITC's sustainable dining philosophy. Local sourcing well-documented.",
        aiAnalysis: "AI Analysis: Menu clearly indicates local farm partnerships. Food quality exceptional with minimal food waste observed. Staff knowledgeable about ingredient sourcing.",
        photos: JSON.stringify(["/images/itc-restaurant.jpg"]),
        status: 'completed'
      }
    ]);

    // Survey 4: Marginal Performance (Hilton Garden Inn) - Score: 76
    const survey4 = await db.insert(audits).values({
      propertyId: newProperties[1].id,
      auditorId: 2,
      reviewerId: 3,
      hotelGroupId: 3,
      sop: existingHotelGroups.find(g => g.id === 3)?.sop || "{}",
      status: 'completed',
      overallScore: 76,
      cleanlinessScore: 78,
      brandingScore: 75,
      operationalScore: 75,
      complianceZone: 'amber',
      findings: JSON.stringify({
        strengths: [
          "CleanStay protocols generally followed",
          "Front desk staff courteous and helpful",
          "Business center well-maintained and functional",
          "Parking facilities adequate and secure"
        ],
        improvements: [
          "Guest room amenities need refresh and updates",
          "Restaurant service during peak hours inconsistent",
          "Hilton Honors app features not fully utilized by staff",
          "Fitness center equipment requires maintenance",
          "Some Hilton branding elements showing wear"
        ],
        criticalIssues: [
          "Hot water inconsistency in several guest rooms",
          "Wi-Fi connectivity issues in upper floors"
        ]
      }),
      actionPlan: JSON.stringify({
        immediate: [
          "Address hot water system issues within 24 hours",
          "Investigate and resolve Wi-Fi connectivity problems"
        ],
        shortTerm: [
          "Replace worn branding elements",
          "Service fitness center equipment",
          "Conduct Hilton Honors training for staff",
          "Improve restaurant staffing during peak periods"
        ],
        longTerm: [
          "Plan comprehensive room amenity upgrade",
          "Consider infrastructure improvements for network stability",
          "Implement guest satisfaction improvement program"
        ]
      }),
      submittedAt: new Date('2025-01-22T13:45:00Z'),
      reviewedAt: new Date('2025-01-23T10:15:00Z')
    }).returning();

    // Survey 4 Items
    await db.insert(auditItems).values([
      {
        auditId: survey4[0].id,
        category: "Cleanliness",
        item: "Guest Room Standards",
        score: 4,
        comments: "Rooms meet basic CleanStay standards but some wear visible. Deep cleaning needed in corners.",
        aiAnalysis: "AI Analysis: Overall cleanliness acceptable but attention to detail lacking. Carpet shows stains in some rooms. Bathroom fixtures functional but could be shinier.",
        photos: JSON.stringify(["/images/hilton-room-marginal.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey4[0].id,
        category: "Operations",
        item: "Technology Integration",
        score: 3,
        comments: "Hilton Honors app integration inconsistent. Staff need additional training on features.",
        aiAnalysis: "AI Analysis: Digital key functionality works intermittently. Staff unfamiliarity with app features impacts guest experience. System requires updates and staff training.",
        photos: JSON.stringify(["/images/hilton-tech-training.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey4[0].id,
        category: "Branding",
        item: "Visual Brand Standards",
        score: 3,
        comments: "Hilton blue branding present but some signage faded. Illumination inconsistent across property.",
        aiAnalysis: "AI Analysis: Brand colors correct but some exterior signage showing weather damage. Interior branding better maintained. Lighting levels below Hilton standards in parking areas.",
        photos: JSON.stringify(["/images/hilton-branding-wear.jpg"]),
        status: 'completed'
      }
    ]);

    // Survey 5: Outstanding Performance (Taj Bengal) - Score: 94
    const survey5 = await db.insert(audits).values({
      propertyId: newProperties[4].id,
      auditorId: 2,
      reviewerId: 3,
      hotelGroupId: 1,
      sop: existingHotelGroups.find(g => g.id === 1)?.sop || "{}",
      status: 'completed',
      overallScore: 94,
      cleanlinessScore: 96,
      brandingScore: 93,
      operationalScore: 93,
      complianceZone: 'green',
      findings: JSON.stringify({
        strengths: [
          "Exemplary Taj luxury standards exceeded in all areas",
          "White-glove cleanliness standards consistently maintained",
          "Staff demonstrate genuine Indian hospitality with modern refinement",
          "Concierge service showcases exceptional local cultural knowledge",
          "Marble surfaces and traditional elements perfectly maintained",
          "Guest satisfaction scores consistently above industry benchmarks"
        ],
        improvements: [
          "Some guest room technology could benefit from minor updates",
          "Pool area furniture shows slight wear from weather"
        ],
        criticalIssues: []
      }),
      actionPlan: JSON.stringify({
        immediate: [],
        shortTerm: [
          "Upgrade in-room entertainment systems to latest generation",
          "Replace pool furniture with weather-resistant alternatives"
        ],
        longTerm: [
          "Continue excellence trajectory with staff recognition programs",
          "Consider additional cultural heritage showcases",
          "Explore opportunities to share best practices with other Taj properties"
        ]
      }),
      submittedAt: new Date('2025-01-26T11:00:00Z'),
      reviewedAt: new Date('2025-01-27T15:30:00Z')
    }).returning();

    // Survey 5 Items
    await db.insert(auditItems).values([
      {
        auditId: survey5[0].id,
        category: "Cleanliness",
        item: "Luxury Cleanliness Standards",
        score: 5,
        comments: "White-glove standards consistently exceeded. Marble surfaces pristine with perfect polish.",
        aiAnalysis: "AI Analysis: Exceptional attention to detail evident in every surface. Marble floors show mirror-like finish. Guest rooms immaculate with luxury touches properly maintained.",
        photos: JSON.stringify(["/images/taj-luxury-clean.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey5[0].id,
        category: "Operations",
        item: "Cultural Hospitality Excellence",
        score: 5,
        comments: "Staff demonstrate perfect balance of traditional Indian hospitality with modern luxury service.",
        aiAnalysis: "AI Analysis: Observed multiple interactions showing genuine warmth combined with professional efficiency. Traditional greeting protocols flawlessly executed. Cultural knowledge impressive.",
        photos: JSON.stringify(["/images/taj-service-excellence.jpg"]),
        status: 'completed'
      },
      {
        auditId: survey5[0].id,
        category: "Branding",
        item: "Heritage and Modern Luxury Integration",
        score: 5,
        comments: "Perfect integration of Taj heritage with contemporary luxury amenities. Branding elements showcase Indian craftsmanship.",
        aiAnalysis: "AI Analysis: Traditional architectural elements beautifully preserved alongside modern amenities. Taj branding sophisticated and culturally authentic throughout property.",
        photos: JSON.stringify(["/images/taj-heritage-branding.jpg"]),
        status: 'completed'
      }
    ]);

    // Update property scores
    await db.update(properties)
      .set({ lastAuditScore: 92, status: 'green' })
      .where({ id: newProperties[0].id });

    await db.update(properties)
      .set({ lastAuditScore: 76, status: 'amber' })
      .where({ id: newProperties[1].id });

    await db.update(properties)
      .set({ lastAuditScore: 88, status: 'green' })
      .where({ id: newProperties[2].id });

    await db.update(properties)
      .set({ lastAuditScore: 65, status: 'red' })
      .where({ id: newProperties[3].id });

    await db.update(properties)
      .set({ lastAuditScore: 94, status: 'green' })
      .where({ id: newProperties[4].id });

    console.log("Successfully created 5 comprehensive surveys with varied results:");
    console.log("1. Marriott Executive Apartments - Excellent (92%)");
    console.log("2. Hyatt Regency Chennai - Poor Performance (65%)");
    console.log("3. ITC Grand Central Mumbai - Good Performance (88%)");
    console.log("4. Hilton Garden Inn Gurgaon - Marginal Performance (76%)");
    console.log("5. Taj Bengal Kolkata - Outstanding Performance (94%)");

  } catch (error) {
    console.error("Error creating surveys:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createFiveSurveys()
    .then(() => {
      console.log("Survey creation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to create surveys:", error);
      process.exit(1);
    });
}