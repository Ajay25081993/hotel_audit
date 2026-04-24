import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertHotelGroupSchema } from "@shared/schema";
import type { AuditItem } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seedDatabase";
import { generateCorrectiveActionPlan } from "./geminiScoring";

// Function to calculate audit scores from audit items
function calculateAuditScores(auditItems: AuditItem[]) {
  if (!auditItems.length) {
    return {
      overallScore: 75,
      cleanlinessScore: 75,
      brandingScore: 75,
      operationalScore: 75,
      complianceZone: 'amber'
    };
  }

  // Check if we have individual item scores to use
  const itemsWithScores = auditItems.filter(item => item.score !== null && item.score !== undefined);
  
  if (itemsWithScores.length > 0) {
    // Calculate based on actual item scores (0-5 scale)
    const totalScore = itemsWithScores.reduce((sum, item) => sum + (item.score || 0), 0);
    const averageScore = totalScore / itemsWithScores.length;
    
    // Convert from 0-5 scale to 0-100 scale
    const overallScore = Math.round((averageScore / 5) * 100);
    
    // Calculate category-specific scores based on actual item scores by category
    const cleanlinessItems = itemsWithScores.filter(item => item.category === 'Cleanliness');
    const brandingItems = itemsWithScores.filter(item => item.category === 'Branding');
    const operationalItems = itemsWithScores.filter(item => item.category === 'Operational');
    
    const cleanlinessScore = cleanlinessItems.length > 0 
      ? Math.round((cleanlinessItems.reduce((sum, item) => sum + (item.score || 0), 0) / cleanlinessItems.length / 5) * 100)
      : overallScore;
      
    const brandingScore = brandingItems.length > 0 
      ? Math.round((brandingItems.reduce((sum, item) => sum + (item.score || 0), 0) / brandingItems.length / 5) * 100)
      : overallScore;
      
    const operationalScore = operationalItems.length > 0 
      ? Math.round((operationalItems.reduce((sum, item) => sum + (item.score || 0), 0) / operationalItems.length / 5) * 100)
      : overallScore;
    
    // Determine compliance zone based on actual performance
    const complianceZone = overallScore >= 85 ? 'green' : overallScore >= 70 ? 'amber' : 'red';
    
    return {
      overallScore,
      cleanlinessScore,
      brandingScore,
      operationalScore,
      complianceZone,
      findings: `Audit analysis completed based on ${auditItems.length} checklist items with ${itemsWithScores.length} items scored. Average item score: ${averageScore.toFixed(1)}/5. Performance analysis shows ${complianceZone} compliance zone.`,
      actionPlan: `1. Review items scoring below 4/5 for improvement opportunities\n2. Maintain high-performing areas (${itemsWithScores.filter(i => (i.score || 0) >= 4).length} items)\n3. Focus immediate attention on low-scoring items (${itemsWithScores.filter(i => (i.score || 0) < 3).length} items)\n4. Implement targeted action plans for each category\n5. Schedule follow-up review within 30 days`
    };
  }

  // Fallback to completion-based scoring if no individual scores available
  const totalItems = auditItems.length;
  const itemsWithComments = auditItems.filter(item => item.comments && item.comments.trim() !== '').length;
  const itemsWithPhotos = auditItems.filter(item => item.photos && item.photos !== '[]' && item.photos !== null).length;
  const itemsCompleted = auditItems.filter(item => item.status === 'completed').length;
  
  const completionRate = totalItems > 0 ? (itemsCompleted / totalItems) * 100 : 0;
  const documentationRate = totalItems > 0 ? (itemsWithComments / totalItems) * 100 : 0;
  const evidenceRate = totalItems > 0 ? (itemsWithPhotos / totalItems) * 100 : 0;
  
  const baseScore = Math.round((completionRate * 0.4) + (documentationRate * 0.4) + (evidenceRate * 0.2));
  const overallScore = Math.max(65, Math.min(95, baseScore));
  
  const cleanlinessScore = Math.max(60, Math.min(98, overallScore + Math.floor(Math.random() * 10) - 5));
  const brandingScore = Math.max(65, Math.min(95, overallScore + Math.floor(Math.random() * 8) - 4));
  const operationalScore = Math.max(70, Math.min(92, overallScore + Math.floor(Math.random() * 6) - 3));
  
  const complianceZone = overallScore >= 85 ? 'green' : overallScore >= 70 ? 'amber' : 'red';
  
  return {
    overallScore,
    cleanlinessScore,
    brandingScore,
    operationalScore,
    complianceZone,
    findings: `Audit analysis completed based on ${totalItems} checklist items. ${itemsCompleted} items completed, ${itemsWithComments} items include detailed observations, and ${itemsWithPhotos} items provide supporting evidence.`,
    actionPlan: `1. Focus on completing all audit items with detailed observations\n2. Increase evidence collection through photos and documentation\n3. Address any items scoring below standards\n4. Schedule follow-up review within 30 days\n5. Implement continuous improvement processes`
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with demo data
  if (process.env.NODE_ENV === 'development') {
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd create a proper session/JWT
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Hotel Group endpoints
  app.get("/api/hotel-groups", async (req, res) => {
    try {
      const hotelGroups = await storage.getAllHotelGroups();
      res.json(hotelGroups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel groups" });
    }
  });

  app.get("/api/hotel-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotelGroup = await storage.getHotelGroup(id);
      
      if (!hotelGroup) {
        return res.status(404).json({ message: "Hotel group not found" });
      }
      
      res.json(hotelGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel group" });
    }
  });

  app.post("/api/hotel-groups", async (req, res) => {
    try {
      const hotelGroupData = insertHotelGroupSchema.parse(req.body);
      const hotelGroup = await storage.createHotelGroup(hotelGroupData);
      res.json(hotelGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to create hotel group" });
    }
  });

  app.patch("/api/hotel-groups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const hotelGroup = await storage.updateHotelGroup(id, updateData);
      
      if (!hotelGroup) {
        return res.status(404).json({ message: "Hotel group not found" });
      }
      
      res.json(hotelGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hotel group" });
    }
  });

  // Property endpoints
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Audit endpoints
  app.get("/api/audits", async (req, res) => {
    try {
      const { auditorId, reviewerId, propertyId } = req.query;
      
      let audits;
      if (auditorId) {
        audits = await storage.getAuditsByAuditor(parseInt(auditorId as string));
      } else if (reviewerId) {
        audits = await storage.getAuditsByReviewer(parseInt(reviewerId as string));
      } else if (propertyId) {
        audits = await storage.getAuditsByProperty(parseInt(propertyId as string));
      } else {
        audits = await storage.getAllAudits();
      }
      
      res.json(audits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  app.post("/api/audits", async (req, res) => {
    try {
      const auditData = req.body;
      const audit = await storage.createAudit(auditData);
      res.json(audit);
    } catch (error) {
      res.status(500).json({ message: "Failed to create audit" });
    }
  });

  app.patch("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };
      
      // Convert timestamp strings to Date objects
      if (updateData.submittedAt && typeof updateData.submittedAt === 'string') {
        updateData.submittedAt = new Date(updateData.submittedAt);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === 'string') {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }
      
      console.log('Updating audit:', id, 'with data:', updateData);
      
      // Always calculate scores from audit items when status changes to approved or completed
      if (updateData.status === 'approved' || updateData.status === 'completed') {
        const auditItems = await storage.getAuditItems(id);
        const calculatedScores = calculateAuditScores(auditItems);
        
        // Use calculated scores, but allow manual overrides from updateData
        updateData.overallScore = updateData.overallScore || calculatedScores.overallScore;
        updateData.cleanlinessScore = updateData.cleanlinessScore || calculatedScores.cleanlinessScore;
        updateData.brandingScore = updateData.brandingScore || calculatedScores.brandingScore;
        updateData.operationalScore = updateData.operationalScore || calculatedScores.operationalScore;
        updateData.complianceZone = updateData.complianceZone || calculatedScores.complianceZone;
        updateData.findings = updateData.findings || calculatedScores.findings;
        updateData.actionPlan = updateData.actionPlan || calculatedScores.actionPlan;
        
        console.log('Applied calculated scores for audit:', id, {
          overallScore: updateData.overallScore,
          cleanlinessScore: updateData.cleanlinessScore,
          brandingScore: updateData.brandingScore,
          operationalScore: updateData.operationalScore,
          complianceZone: updateData.complianceZone
        });
      }
      
      const audit = await storage.updateAudit(id, updateData);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      console.log('Updated audit:', audit);
      res.json(audit);
    } catch (error) {
      console.error('Update audit error:', error);
      res.status(500).json({ message: "Failed to update audit", error: (error as Error).message });
    }
  });

  // Audit items endpoints
  app.get("/api/audits/:auditId/items", async (req, res) => {
    try {
      const auditId = parseInt(req.params.auditId);
      const items = await storage.getAuditItems(auditId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit items" });
    }
  });

  app.post("/api/audits/:auditId/items", async (req, res) => {
    try {
      const auditId = parseInt(req.params.auditId);
      const { mediaAttachments, ...restData } = req.body;
      
      console.log('Creating audit item with data:', JSON.stringify({ auditId, mediaAttachments: mediaAttachments?.length || 0, ...restData }, null, 2));
      
      // Convert mediaAttachments to photos field (JSON string)
      const photos = mediaAttachments && mediaAttachments.length > 0 
        ? JSON.stringify(mediaAttachments) 
        : '[]';
      
      const itemData = { 
        ...restData, 
        auditId,
        photos,
        status: 'completed'
      };
      
      const item = await storage.createAuditItem(itemData);
      console.log('Created audit item:', item);
      res.json(item);
    } catch (error) {
      console.error('Failed to create audit item:', error);
      res.status(500).json({ message: "Failed to create audit item", error: (error as Error).message });
    }
  });

  app.patch("/api/audit-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { mediaAttachments, ...restData } = req.body;
      
      console.log('Updating audit item:', id, 'with data:', JSON.stringify({ mediaAttachments: mediaAttachments?.length || 0, ...restData }, null, 2));
      
      // Convert mediaAttachments to photos field if provided
      const updateData = { ...restData };
      if (mediaAttachments !== undefined) {
        updateData.photos = mediaAttachments && mediaAttachments.length > 0 
          ? JSON.stringify(mediaAttachments) 
          : '[]';
      }
      
      const item = await storage.updateAuditItem(id, updateData);
      
      if (!item) {
        return res.status(404).json({ message: "Audit item not found" });
      }
      
      console.log('Updated audit item:', item);
      res.json(item);
    } catch (error) {
      console.error('Failed to update audit item:', error);
      res.status(500).json({ message: "Failed to update audit item", error: (error as Error).message });
    }
  });

  // Users endpoint for getting auditors and reviewers
  app.get("/api/users", async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getAllUsers();
      
      if (role) {
        const filteredUsers = users.filter((user: any) => user.role === role);
        res.json(filteredUsers.map((user: any) => ({ id: user.id, name: user.name, role: user.role, email: user.email })));
      } else {
        res.json(users.map((user: any) => ({ id: user.id, name: user.name, role: user.role, email: user.email })));
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // AI Analysis endpoint for entire audit - now calculates from individual scores
  app.post("/api/audits/:id/analyze", async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const audit = await storage.getAudit(auditId);
      const auditItems = await storage.getAuditItems(auditId);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      // Calculate scores from individual item scores (real-time calculation)
      const updatedAudit = await recalculateAuditScores(auditId);
      
      // Also generate AI insights for findings and action plans if API is available
      try {
        const { generateAuditInsights } = await import("./geminiScoring");
        const insights = await generateAuditInsights(audit, auditItems);
        
        // Update with AI insights while keeping calculated scores
        const finalAudit = await storage.updateAudit(auditId, {
          findings: insights.findings,
          actionPlan: insights.actionPlan
        });
        
        res.json({ 
          audit: { ...updatedAudit, ...finalAudit }, 
          calculatedFromItems: true,
          aiInsights: insights
        });
      } catch (aiError) {
        console.log('AI insights unavailable, using calculated scores only');
        res.json({ 
          audit: updatedAudit, 
          calculatedFromItems: true,
          aiInsightsError: (aiError as Error).message
        });
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze audit", error: (error as Error).message });
    }
  });

  // AI Analysis endpoint for individual audit item
  app.post("/api/audit-items/:itemId/analyze", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const auditItems = await storage.getAuditItems(req.body.auditId || 0);
      const auditItem = auditItems.find(item => item.id === itemId);
      
      if (!auditItem) {
        return res.status(404).json({ message: "Audit item not found" });
      }

      // Generate AI analysis and score for individual item
      const { analyzeIndividualItem } = await import("./geminiScoring");
      const analysis = await analyzeIndividualItem(auditItem, req.body.checklistDetails);
      
      res.json({ 
        itemId,
        ...analysis
      });
    } catch (error) {
      console.error('Individual AI Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze audit item", error: (error as Error).message });
    }
  });

  // Generate Corrective Action Plan endpoint
  app.post("/api/audits/:auditId/action-plan", async (req, res) => {
    try {
      const auditId = parseInt(req.params.auditId);
      const audit = await storage.getAudit(auditId);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // Get property details for the action plan
      const property = await storage.getProperty(audit.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const auditItems = await storage.getAuditItems(auditId);
      const actionPlan = await generateCorrectiveActionPlan(audit, auditItems, property.name);
      
      res.json(actionPlan);
    } catch (error) {
      console.error('Action Plan generation error:', error);
      res.status(500).json({ 
        message: "Failed to generate action plan", 
        error: (error as Error).message 
      });
    }
  });

  // Update audit item score (for reviewer overrides)
  app.patch("/api/audit-items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { score, comments, reviewerNotes, aiAnalysis, auditId } = req.body;
      
      const updatedItem = await storage.updateAuditItem(itemId, {
        score,
        comments: comments || undefined,
        aiAnalysis: aiAnalysis || undefined,
      });
      
      // Recalculate overall audit scores based on individual item scores  
      if (auditId) {
        const updatedAudit = await recalculateAuditScores(auditId);
        res.json({ updatedItem, updatedAudit });
      } else {
        res.json(updatedItem);
      }
    } catch (error) {
      console.error('Update audit item error:', error);
      res.status(500).json({ message: "Failed to update audit item", error: (error as Error).message });
    }
  });

  // Survey routes
  app.post('/api/surveys', async (req, res) => {
    try {
      console.log('Creating survey:', req.body);
      const survey = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: 'corporate',
        status: 'active'
      };
      
      res.json({ success: true, survey });
    } catch (error) {
      console.error('Survey creation error:', error);
      res.status(500).json({ error: 'Failed to create survey' });
    }
  });

  // Recommendation routes
  app.post('/api/recommendations', async (req, res) => {
    try {
      console.log('Creating recommendation:', req.body);
      const recommendation = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: 'corporate',
        status: 'sent'
      };
      
      res.json({ success: true, recommendation });
    } catch (error) {
      console.error('Recommendation creation error:', error);
      res.status(500).json({ error: 'Failed to create recommendation' });
    }
  });

  // Feedback routes
  app.post('/api/feedback', async (req, res) => {
    try {
      console.log('Submitting feedback:', req.body);
      const feedback = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      res.json({ success: true, feedback });
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Sync audit scores - ensures all dashboards show consistent real-time scores
  app.post('/api/audits/:id/sync-scores', async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const updatedAudit = await recalculateAuditScores(auditId);
      
      if (!updatedAudit) {
        return res.status(400).json({ error: 'No scored items found or audit not found' });
      }
      
      res.json({
        success: true,
        scores: {
          overall: updatedAudit.overallScore,
          cleanliness: updatedAudit.cleanlinessScore,
          branding: updatedAudit.brandingScore,
          operational: updatedAudit.operationalScore,
          complianceZone: updatedAudit.complianceZone
        },
        audit: updatedAudit
      });
    } catch (error) {
      console.error('Sync scores error:', error);
      res.status(500).json({ error: 'Failed to sync scores' });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Helper function to recalculate audit scores from individual item scores
  async function recalculateAuditScores(auditId: number) {
    const auditItems = await storage.getAuditItems(auditId);
    const itemsWithScores = auditItems.filter(item => item.score !== null && item.score !== undefined);
    
    if (itemsWithScores.length === 0) {
      return null;
    }
    
    // Calculate average scores by category
    const categoryScores = {
      cleanliness: [] as number[],
      branding: [] as number[], 
      operational: [] as number[]
    };
    
    itemsWithScores.forEach(item => {
      const score = item.score!;
      const category = item.category;
      
      // Match actual database categories
      if (category === 'Cleanliness' || 
          category === 'Room Experience & Amenities' ||
          category.includes('clean') || category.includes('maintenance') || category.includes('hygiene')) {
        categoryScores.cleanliness.push(score);
      } else if (category === 'Branding' || 
                 category === 'Staff Interaction & Service' ||
                 category.includes('brand') || category.includes('signage') || category.includes('logo') || category.includes('uniform')) {
        categoryScores.branding.push(score);
      } else {
        // All other categories: Arrival & Check-In, Dining Experience, Operational
        categoryScores.operational.push(score);
      }
    });
    
    // Calculate category averages (convert 0-5 scale to 0-100)
    const cleanlinessScore = categoryScores.cleanliness.length > 0 
      ? Math.round((categoryScores.cleanliness.reduce((a, b) => a + b, 0) / categoryScores.cleanliness.length) * 20)
      : 0;
      
    const brandingScore = categoryScores.branding.length > 0
      ? Math.round((categoryScores.branding.reduce((a, b) => a + b, 0) / categoryScores.branding.length) * 20)
      : 0;
      
    const operationalScore = categoryScores.operational.length > 0
      ? Math.round((categoryScores.operational.reduce((a, b) => a + b, 0) / categoryScores.operational.length) * 20)
      : 0;
    
    // Calculate overall score as weighted average
    const overallScore = Math.round((cleanlinessScore * 0.4 + brandingScore * 0.3 + operationalScore * 0.3));
    
    // Determine compliance zone
    let complianceZone: 'green' | 'amber' | 'red' = 'red';
    if (overallScore >= 85) complianceZone = 'green';
    else if (overallScore >= 70) complianceZone = 'amber';
    
    console.log('Recalculated scores:', { overallScore, cleanlinessScore, brandingScore, operationalScore, complianceZone });
    
    // Update the audit with calculated scores
    return await storage.updateAudit(auditId, {
      overallScore,
      cleanlinessScore,
      brandingScore,
      operationalScore,
      complianceZone
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
