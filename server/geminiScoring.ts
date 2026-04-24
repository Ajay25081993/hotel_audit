import { GoogleGenAI } from "@google/genai";
import type { Audit, AuditItem } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AIAnalysisResult {
  overallScore: number;
  cleanlinessScore: number;
  brandingScore: number;
  operationalScore: number;
  complianceZone: 'green' | 'amber' | 'red';
  findings: string;
  actionPlan: string;
}

interface CorrectiveActionPlan {
  propertyName: string;
  auditDate: string;
  overallScore: number;
  complianceZone: string;
  criticalIssues: string[];
  immediateActions: {
    title: string;
    description: string;
    timeline: string;
    responsibility: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  improvementRecommendations: {
    category: string;
    recommendation: string;
    expectedOutcome: string;
    implementationCost: string;
    timeline: string;
  }[];
  followUpSchedule: {
    action: string;
    timeline: string;
    responsible: string;
  }[];
  budgetEstimate: {
    category: string;
    estimatedCost: string;
    justification: string;
  }[];
}

export async function generateCorrectiveActionPlan(
  audit: Audit, 
  auditItems: AuditItem[], 
  propertyName: string
): Promise<CorrectiveActionPlan> {
  try {
    const auditContext = {
      propertyName,
      auditDate: audit.submittedAt || audit.createdAt || new Date(),
      overallScore: audit.overallScore,
      cleanlinessScore: audit.cleanlinessScore,
      brandingScore: audit.brandingScore,
      operationalScore: audit.operationalScore,
      complianceZone: audit.complianceZone,
      findings: audit.findings,
      categories: groupItemsByCategory(auditItems),
      observations: auditItems.map(item => ({
        category: item.category,
        item: item.item,
        comments: item.comments,
        score: item.score,
        hasEvidence: item.photos && item.photos.length > 0
      }))
    };

    const systemPrompt = `You are an expert hotel operations consultant specializing in franchise compliance and operational improvements. Generate a comprehensive Corrective Action Plan for hotel franchisee owners based on audit findings.

FOCUS AREAS:
- Immediate critical issues requiring urgent attention
- Cost-effective improvement recommendations
- Clear timelines and responsibilities
- Realistic budget estimates
- Measurable outcomes and follow-up schedules

PRIORITIZATION:
- Safety and compliance issues (High priority)
- Brand standard violations (Medium-High priority)
- Guest experience improvements (Medium priority)
- Operational efficiency gains (Low-Medium priority)

Provide actionable, specific recommendations that a franchisee owner can implement.`;

    const planPrompt = `Generate a comprehensive Corrective Action Plan for this hotel audit:

Property: ${auditContext.propertyName}
Audit Date: ${new Date(auditContext.auditDate || new Date()).toLocaleDateString()}
Overall Score: ${auditContext.overallScore}%
Compliance Zone: ${auditContext.complianceZone}

Detailed Findings: ${auditContext.findings}

Category Scores:
- Cleanliness: ${auditContext.cleanlinessScore}%
- Branding: ${auditContext.brandingScore}%
- Operations: ${auditContext.operationalScore}%

Specific Issues Found:
${Object.entries(auditContext.categories).map(([category, items]) => 
  `\n${category}:
${items.map((item: any) => 
  `- ${item.item}: Score ${item.score || 'N/A'}/5 - ${item.comments || 'No comments'} ${item.hasEvidence ? '(Evidence documented)' : ''}`
).join('\n')}`
).join('\n')}

Please provide a detailed JSON response with the following structure:
{
  "propertyName": "${auditContext.propertyName}",
  "auditDate": "${new Date(auditContext.auditDate || new Date()).toLocaleDateString()}",
  "overallScore": ${auditContext.overallScore},
  "complianceZone": "${auditContext.complianceZone}",
  "criticalIssues": ["List of critical issues requiring immediate attention"],
  "immediateActions": [
    {
      "title": "Action title",
      "description": "Detailed description of what needs to be done",
      "timeline": "Specific timeframe (e.g., 24 hours, 1 week)",
      "responsibility": "Who should handle this (e.g., GM, Housekeeping Manager)",
      "priority": "High/Medium/Low"
    }
  ],
  "improvementRecommendations": [
    {
      "category": "Cleanliness/Branding/Operations",
      "recommendation": "Specific improvement recommendation",
      "expectedOutcome": "What improvement this will achieve",
      "implementationCost": "Estimated cost range",
      "timeline": "Implementation timeframe"
    }
  ],
  "followUpSchedule": [
    {
      "action": "Follow-up action required",
      "timeline": "When to complete",
      "responsible": "Who is responsible"
    }
  ],
  "budgetEstimate": [
    {
      "category": "Budget category",
      "estimatedCost": "Cost estimate",
      "justification": "Why this investment is needed"
    }
  ]
}`;

    const model = ai.getModel("gemini-2.5-pro");
    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + planPrompt }]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text());
    return result as CorrectiveActionPlan;

  } catch (error) {
    console.error('Error generating corrective action plan:', error);
    
    // Fallback plan based on audit data
    return generateFallbackActionPlan(audit, auditItems, propertyName);
  }
}

function generateFallbackActionPlan(audit: Audit, auditItems: AuditItem[], propertyName: string): CorrectiveActionPlan {
  const lowScoreItems = auditItems.filter(item => item.score && item.score < 4);
  
  return {
    propertyName,
    auditDate: new Date(audit.submittedAt || audit.createdAt || new Date()).toLocaleDateString(),
    overallScore: audit.overallScore || 0,
    complianceZone: audit.complianceZone || 'red',
    criticalIssues: lowScoreItems.slice(0, 3).map(item => `${item.category}: ${item.item}`),
    immediateActions: [
      {
        title: "Address Critical Compliance Issues",
        description: "Review and resolve all items scoring below 4/5 in the audit",
        timeline: "7 days",
        responsibility: "General Manager",
        priority: "High" as const
      },
      {
        title: "Staff Training Update",
        description: "Conduct refresher training on brand standards and operational procedures",
        timeline: "14 days",
        responsibility: "Department Managers",
        priority: "Medium" as const
      }
    ],
    improvementRecommendations: [
      {
        category: "Operations",
        recommendation: "Implement daily quality checks and monitoring systems",
        expectedOutcome: "Improved consistency in service delivery",
        implementationCost: "$500-1000",
        timeline: "30 days"
      }
    ],
    followUpSchedule: [
      {
        action: "Re-audit critical areas",
        timeline: "30 days",
        responsible: "QA Team"
      }
    ],
    budgetEstimate: [
      {
        category: "Training & Development",
        estimatedCost: "$1,000-2,500",
        justification: "Essential for maintaining brand standards and compliance"
      }
    ]
  };
}

export async function analyzeAuditData(audit: Audit, auditItems: AuditItem[]): Promise<AIAnalysisResult> {
  try {
    // Prepare audit data for AI analysis
    const auditContext = {
      propertyId: audit.propertyId,
      totalItems: auditItems.length,
      categories: groupItemsByCategory(auditItems),
      observations: auditItems.map(item => ({
        category: item.category,
        item: item.item,
        comments: item.comments,
        hasEvidence: item.photos && item.photos.length > 0
      }))
    };

    const systemPrompt = `You are an expert hotel brand audit analyst. Analyze the following hotel audit data and provide scores and recommendations.

SCORING CRITERIA:
- Overall Score (0-100): Weighted average of all categories
- Cleanliness Score (0-100): Based on hygiene, maintenance, and cleanliness observations
- Branding Score (0-100): Based on brand compliance, signage, and standards adherence
- Operational Score (0-100): Based on service quality, staff performance, and operational efficiency

COMPLIANCE ZONES:
- Green (85-100): Excellent compliance, minimal issues
- Amber (70-84): Good compliance with minor improvements needed
- Red (0-69): Poor compliance, significant issues requiring immediate attention

Provide detailed findings and a comprehensive action plan for improvement.`;

    const analysisPrompt = `Analyze this hotel audit data:

Property ID: ${auditContext.propertyId}
Total Audit Items: ${auditContext.totalItems}

Categories and Observations:
${Object.entries(auditContext.categories).map(([category, items]) => 
  `\n${category}:
${items.map((item: any) => 
  `- ${item.item}: ${item.comments || 'No comments'} ${item.hasEvidence ? '(Evidence provided)' : '(No evidence)'}`
).join('\n')}`
).join('\n')}

Please provide a JSON response with the following structure:
{
  "overallScore": number,
  "cleanlinessScore": number,
  "brandingScore": number,
  "operationalScore": number,
  "complianceZone": "green" | "amber" | "red",
  "findings": "Detailed analysis of key findings and issues discovered",
  "actionPlan": "Comprehensive action plan with prioritized recommendations"
}`;

    const model = ai.getModel("gemini-2.5-pro");
    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + analysisPrompt }]
      }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const rawJson = response.text();
    console.log('AI Analysis Response:', rawJson);

    if (rawJson) {
      const analysis: AIAnalysisResult = JSON.parse(rawJson);
      
      // Validate scores are within reasonable ranges
      analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore));
      analysis.cleanlinessScore = Math.max(0, Math.min(100, analysis.cleanlinessScore));
      analysis.brandingScore = Math.max(0, Math.min(100, analysis.brandingScore));
      analysis.operationalScore = Math.max(0, Math.min(100, analysis.operationalScore));
      
      return analysis;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error('Gemini AI Analysis error:', error);
    
    // Fallback analysis based on basic heuristics
    return generateFallbackAnalysis(auditItems);
  }
}

function groupItemsByCategory(auditItems: AuditItem[]): Record<string, AuditItem[]> {
  return auditItems.reduce((groups, item) => {
    const category = item.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, AuditItem[]>);
}

function generateFallbackAnalysis(auditItems: AuditItem[]): AIAnalysisResult {
  // Basic scoring based on available data
  const totalItems = auditItems.length;
  const itemsWithComments = auditItems.filter(item => item.comments && item.comments.trim() !== '').length;
  const itemsWithEvidence = auditItems.filter(item => item.photos && item.photos.length > 0).length;
  
  // Simple scoring algorithm
  const completionRate = totalItems > 0 ? (itemsWithComments / totalItems) * 100 : 0;
  const evidenceRate = totalItems > 0 ? (itemsWithEvidence / totalItems) * 100 : 0;
  
  const baseScore = Math.round((completionRate + evidenceRate) / 2);
  const overallScore = Math.max(60, Math.min(95, baseScore)); // Keep in reasonable range
  
  const complianceZone: 'green' | 'amber' | 'red' = 
    overallScore >= 85 ? 'green' : 
    overallScore >= 70 ? 'amber' : 'red';

  return {
    overallScore,
    cleanlinessScore: Math.max(65, overallScore - 5),
    brandingScore: Math.max(70, overallScore + 5),
    operationalScore: Math.max(60, overallScore),
    complianceZone,
    findings: `Analysis completed based on ${totalItems} audit items. ${itemsWithComments} items included detailed observations, and ${itemsWithEvidence} items provided supporting evidence. Key areas for attention have been identified across cleanliness, branding, and operational standards.`,
    actionPlan: `1. Review and address items lacking detailed observations\n2. Increase evidence collection for compliance verification\n3. Focus on areas scoring below target thresholds\n4. Implement regular monitoring for sustained improvements\n5. Schedule follow-up audit within 30-60 days`
  };
}

// Rate limiting for API calls
let lastApiCall = 0;
const API_RATE_LIMIT_MS = 6000; // 6 seconds between calls for free tier (10 calls per minute)

async function rateLimitedApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_RATE_LIMIT_MS) {
    const waitTime = API_RATE_LIMIT_MS - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
  return await apiCall();
}

// Individual audit item analysis with media support
export async function generateAuditInsights(audit: Audit, auditItems: AuditItem[]): Promise<{ findings: string; actionPlan: string }> {
  try {
    const systemPrompt = "You are an expert hotel audit analyst. Generate comprehensive findings and action plans based on audit data.";
    const prompt = `Generate findings and action plan for audit of property ${audit.propertyId} with ${auditItems.length} audit items. Focus on key issues and improvement recommendations.`;
    
    const response = await rateLimitedApiCall(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              findings: { type: "string" },
              actionPlan: { type: "string" }
            }
          }
        },
        contents: prompt
      });
    });
    
    const result = JSON.parse(response.text || '{}');
    return {
      findings: result.findings || "Analysis completed based on individual item scores.",
      actionPlan: result.actionPlan || "Continue monitoring and maintain current standards."
    };
  } catch (error) {
    console.log('AI insights unavailable:', error);
    return {
      findings: "Analysis completed based on individual item scores. AI insights temporarily unavailable.",
      actionPlan: "Review individual item scores and address low-scoring areas. Consider re-running analysis when AI service is available."
    };
  }
}



export async function analyzeIndividualItem(auditItem: AuditItem, checklistDetails?: any): Promise<{ score: number; aiAnalysis: string }> {
  try {
    const systemPrompt = `You are an expert hotel brand audit analyst. Analyze this specific audit checklist item and provide a score (0-5) and detailed analysis.

SCORING CRITERIA:
- 5: Excellent - Exceeds brand standards, no issues identified
- 4: Good - Meets brand standards with minor suggestions for improvement  
- 3: Satisfactory - Meets basic requirements but has room for improvement
- 2: Below Standard - Notable issues that need attention
- 1: Poor - Significant problems requiring immediate action
- 0: Critical Failure - Does not meet minimum standards, major compliance issues

Analyze the auditor's comments AND any visual evidence (photos/videos) provided. When analyzing images, look for:
- Cleanliness and hygiene standards
- Brand compliance (logos, colors, signage)
- Operational efficiency and organization
- Safety and maintenance issues
- Overall quality and presentation`;

    // Parse media evidence and prepare content for analysis
    let contentParts: any[] = [];
    let mediaContext = 'No evidence provided';
    let mediaItems: any[] = [];
    
    // Add text prompt
    let textPrompt = `Analyze this hotel audit checklist item:

Category: ${auditItem.category}
Item: ${auditItem.item}
Auditor Comments: ${auditItem.comments || 'No comments provided'}
Current Status: ${auditItem.status || 'Not completed'}

${checklistDetails ? `
Checklist Details:
- Description: ${checklistDetails.description || 'N/A'}
- Weight: ${checklistDetails.weight || 'Standard'}
- Max Score: ${checklistDetails.maxScore || 5}
` : ''}`;

    if (auditItem.photos && auditItem.photos !== '[]' && auditItem.photos !== 'null') {
      try {
        mediaItems = JSON.parse(auditItem.photos);
        const photoCount = mediaItems.filter(item => item.type === 'photo').length;
        const videoCount = mediaItems.filter(item => item.type === 'video').length;
        const textCount = mediaItems.filter(item => item.type === 'text').length;
        
        mediaContext = `Evidence provided: ${photoCount} photos, ${videoCount} videos, ${textCount} text notes`;
        
        // Add photos for visual analysis
        const photoItems = mediaItems.filter(item => item.type === 'photo' && item.content);
        for (const photo of photoItems.slice(0, 3)) { // Limit to 3 photos to avoid token limits
          if (photo.content && photo.content.startsWith('data:image/')) {
            contentParts.push({
              inlineData: {
                mimeType: photo.content.split(',')[0].split(':')[1].split(';')[0],
                data: photo.content.split(',')[1]
              }
            });
          }
        }
        
        // Add text content from media items
        const textContent = mediaItems
          .filter(item => item.type === 'text' && item.content)
          .map(item => `Text note: "${item.content}"`)
          .join('\n');
        
        if (textContent) {
          textPrompt += `\n\nText Evidence:\n${textContent}`;
        }
        
        if (photoItems.length > 0) {
          textPrompt += `\n\nPlease analyze the ${photoItems.length} photo(s) provided along with the text information.`;
        }
      } catch (e) {
        console.error('Error parsing media items:', e);
        mediaContext = 'Evidence provided but could not be parsed';
      }
    }

    textPrompt += `\n\nPlease provide a JSON response with:
{
  "score": number (0-5),
  "aiAnalysis": "Detailed analysis explaining the score based on auditor comments and visual evidence. Include specific observations about what you see in photos/videos and provide actionable recommendations."
}`;

    // Add text prompt as first content part
    contentParts.unshift({ text: textPrompt });

    const response = await rateLimitedApiCall(() => 
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "number", minimum: 0, maximum: 5 },
              aiAnalysis: { type: "string" }
            },
            required: ["score", "aiAnalysis"]
          }
        },
        contents: contentParts
      })
    );

    const rawJson = response.text;
    console.log(`AI Item Analysis for ${auditItem.item}:`, rawJson);

    if (rawJson) {
      const analysis = JSON.parse(rawJson);
      
      // Validate score is within range
      analysis.score = Math.max(0, Math.min(5, Math.round(analysis.score)));
      
      return analysis;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error('Gemini AI Item Analysis error:', error);
    
    // Fallback scoring based on basic heuristics
    return generateFallbackItemAnalysis(auditItem);
  }
}

function generateFallbackItemAnalysis(auditItem: AuditItem): { score: number; aiAnalysis: string } {
  let score = 3; // Default satisfactory score
  let analysis = "Analysis completed using fallback scoring. ";

  // Adjust score based on available data
  if (auditItem.comments && auditItem.comments.trim() !== '') {
    const comments = auditItem.comments.toLowerCase();
    
    // Check for positive indicators
    if (comments.includes('excellent') || comments.includes('perfect') || comments.includes('outstanding')) {
      score = 5;
      analysis += "Positive feedback indicates excellent performance. ";
    } else if (comments.includes('good') || comments.includes('satisfactory') || comments.includes('meets')) {
      score = 4;
      analysis += "Comments indicate good compliance with standards. ";
    } else if (comments.includes('issue') || comments.includes('problem') || comments.includes('needs improvement')) {
      score = 2;
      analysis += "Issues identified that require attention. ";
    } else if (comments.includes('critical') || comments.includes('poor') || comments.includes('unacceptable')) {
      score = 1;
      analysis += "Critical issues identified requiring immediate action. ";
    }
  } else {
    score = 2;
    analysis += "No detailed comments provided, limiting assessment accuracy. ";
  }

  // Bonus for evidence provided
  if (auditItem.photos && auditItem.photos.length > 0) {
    score = Math.min(5, score + 0.5);
    analysis += "Supporting evidence provided enhances reliability of assessment. ";
  }

  return {
    score: Math.round(score),
    aiAnalysis: analysis + "Recommend detailed review and follow-up to ensure compliance standards are maintained."
  };
}