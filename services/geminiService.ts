
import { GoogleGenAI, Type } from "@google/genai";
import { Prototype, GitHubRepo, ProjectAttachment } from "../types";

export async function generatePrototype(
  prompt: string, 
  attachments: ProjectAttachment[] = [],
  hasSupabase: boolean = false,
  projectLink: string = ""
): Promise<Prototype> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [
    { text: `System: You are the 'Stitch & Lovable' AI Architect. Your goal is to generate high-fidelity mobile app prototypes that strictly adhere to Google's 'Stitch' (Material 3) design principles while providing the full-stack readiness of 'Lovable'.` },
    { text: `User Prompt: "${prompt}".` }
  ];

  if (projectLink) {
    parts.push({ text: `Target Project Link: ${projectLink}. Use this as the primary reference for existing UI structure and navigation logic.` });
  }

  if (attachments.length > 0) {
    parts.push({ 
      text: `Context Analysis: The user has attached existing project files (${attachments.length} items). 
      These include: ${attachments.map(a => `${a.type} named '${a.name}'`).join(', ')}. 
      Analyze the implied structure, components, and logic from these attachments to ensure continuity.` 
    });
  }

  if (hasSupabase) {
    parts.push({ text: "Backend: The project uses Supabase. Generate a SQL schema manifest in 'databaseSchema' that perfectly maps to the UI requirements." });
  }

  parts.push({ 
    text: `Output Requirements:
    1. Generate a cohesive multi-screen prototype.
    2. Use Material 3 color tokens (Primary, Secondary, Tertiary).
    3. Ensure a logical 'Lovable' style app structure.
    4. Provide detailed props for each component (Material 3 style).` 
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 6000 },
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

export async function generateAppIcon(appName: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `App icon for "${appName}". Style: Google 'Stitch' Material 3 iconography. Flat, geometric, vibrant, 3D shadows. Vector-like precision.`,
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
  return `https://lovable.dev/app/${hash}`;
}

export async function mockFetchRepositories(): Promise<GitHubRepo[]> {
  return [
    { id: 1, name: "stitch-project-alpha", full_name: "user/stitch-project-alpha", private: false, html_url: "https://github.com/user/stitch-project-alpha" },
    { id: 2, name: "lovable-app-v2", full_name: "user/lovable-app-v2", private: true, html_url: "https://github.com/user/lovable-app-v2" },
    { id: 3, name: "material3-components", full_name: "user/material3-components", private: false, html_url: "https://github.com/user/material3-components" }
  ];
}
