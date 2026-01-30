
import { GoogleGenAI, Type } from "@google/genai";
import { Prototype, GitHubRepo, ProjectAttachment } from "../types";

export interface IconConcept {
  id: string;
  style: string;
  description: string;
  prompt: string;
}

export async function generatePrototype(
  prompt: string, 
  attachments: ProjectAttachment[] = [],
  hasSupabase: boolean = false,
  projectLink: string = "",
  gitLensData: string = ""
): Promise<Prototype> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [
    { text: `System: You are the 'Stitch & Lovable' App Factory Architect. 
    Your mission is to transform a Web Proposal, Codebase ZIP, Image Mockups, or Live Link into a comprehensive native-optimized blueprint for Android, iOS, and Windows.
    Focus on high-fidelity components, platform-specific navigation patterns (Android Bottom Nav, iOS Tab Bar, Windows Sidebar), and seamless design continuity.
    Strictly use Material 3 (Stitch) tokens for the core design system.` },
    { text: `User Goal: "${prompt || "Transform my source material (Web/Image/Code) into a native multi-platform app experience."}".` }
  ];

  if (gitLensData) {
    parts.push({ text: `Development Context: ${gitLensData}. Maintain the logic and state flow found in the codebase history.` });
  }

  if (projectLink) {
    parts.push({ text: `Source Web Link: ${projectLink}. Extract the visual structure, layout hierarchy, and user journey from this URL to create the app equivalent.` });
  }

  if (attachments.length > 0) {
    const zipFiles = attachments.filter(a => a.type === 'zip').map(a => a.name);
    const folders = attachments.filter(a => a.type === 'folder').map(a => a.name);
    const images = attachments.filter(a => a.type === 'image').map(a => a.name);
    
    parts.push({ 
      text: `Proposal Context & Attachments: 
      Images/Mockups: ${images.join(', ') || 'None'}. (Treat these as the UI Source of Truth).
      ZIP (Code Artifacts): ${zipFiles.join(', ') || 'None'}.
      Folders (Web Structure): ${folders.join(', ') || 'None'}.
      Convert these visual/logic structures into their native app blueprint counterparts.` 
    });
  }

  if (hasSupabase) {
    parts.push({ text: "Backend: Integration with Supabase Cloud is active. Ensure the schema reflects the existing database migrations found in the proposal." });
  }

  parts.push({ 
    text: `Output Format:
    1. A cohesive multi-screen blueprint.
    2. Theme definition for Material 3.
    3. Detailed UI components and data models.
    4. Adaptive layouts for mobile and desktop (Windows).` 
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 8000 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          theme: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.STRING },
              accent: { type: Type.STRING },
              isDark: { type: Type.BOOLEAN }
            },
            required: ["primary", "secondary", "accent", "isDark"]
          },
          screens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                components: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["button", "text", "input", "image", "card", "list", "header"] },
                      props: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          placeholder: { type: Type.STRING },
                          content: { type: Type.STRING },
                          src: { type: Type.STRING },
                          color: { type: Type.STRING },
                          style: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["id", "type", "props"]
                  }
                }
              },
              required: ["id", "name", "components"]
            }
          },
          databaseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                columns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      isNullable: { type: Type.BOOLEAN }
                    },
                    required: ["name", "type", "isNullable"]
                  }
                }
              },
              required: ["name", "columns"]
            }
          }
        },
        required: ["id", "name", "description", "screens", "theme"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
}

export async function generateIconConcepts(appName: string, appDesc: string): Promise<IconConcept[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 4 distinct app icon concepts for a multi-platform app named "${appName}" (${appDesc}). 
    Provide: 1. Style name, 2. Brief description, 3. Visual prompt for an image generator.
    Styles should include: Adaptive Material 3, Premium Glassmorphism (iOS), Modern Fluent (Windows), and Minimalist High-Contrast.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            style: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING }
          },
          required: ["id", "style", "description", "prompt"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function generateAppIcon(customPrompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional, high-fidelity app icon suitable for Android Adaptive Icons, iOS App Store, and Windows Store. Prompt: ${customPrompt}. Solid background, centralized design, 4k, digital art style.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "https://picsum.photos/512/512"; 
}

export async function generateLovableLink(prototype: Prototype): Promise<string> {
  const hash = btoa(prototype.name + prototype.id).substring(0, 12).toLowerCase();
  return `https://lovable.dev/project/${hash}`;
}

export async function mockFetchRepositories(): Promise<GitHubRepo[]> {
  return [
    { id: 1, name: "stitch-project-alpha", full_name: "user/stitch-project-alpha", private: false, html_url: "https://github.com/user/stitch-project-alpha" },
    { id: 2, name: "lovable-app-v2", full_name: "user/lovable-app-v2", private: true, html_url: "https://github.com/user/lovable-app-v2" },
    { id: 3, name: "material3-components", full_name: "user/material3-components", private: false, html_url: "https://github.com/user/material3-components" }
  ];
}
