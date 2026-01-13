import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { GoogleGenAI, Chat } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private systemInstruction: string = '';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  // Initialize or update the chat session with product context
  private initChat(products: Product[]) {
      // Create a condensed product context for the AI
      const productCatalog = products.map(p => 
        `[ID:${p.id}] ${p.name} (${p.brand}): $${p.price}, ${p.category}. Stock: ${p.stock}`
      ).join('\n');

      this.systemInstruction = `You are the AI Personal Stylist for ONYX, a premium urban fashion brand created by Asim Nawaz.
      
      Your personality: Stylish, professional, helpful, and concise.
      
      Store Policies:
      - Returns: 30-day return policy on unworn items.
      - Shipping: Free shipping on orders over $50. Standard delivery is 3-5 days.
      - Contact: support@onyx.com for human assistance.
      
      Current Product Catalog:
      ${productCatalog}
      
      Instructions:
      1. Answer user questions about specific products, prices, or stock availability using the catalog provided.
      2. If asked for recommendations, suggest specific items from the catalog by name.
      3. Keep responses under 80 words unless detailing a specific outfit.
      4. If a product is out of stock (Stock: 0), mention that it is currently unavailable.
      5. Do not invent products that are not in the catalog.
      6. Use markdown for formatting (bolding product names, etc).
      `;

      // Create a new chat session if it doesn't exist. 
      // Note: Updating products mid-session isn't directly supported without starting a new chat context or injecting it as a user message, 
      // but for this scope, initialization is sufficient.
      if (!this.chatSession) {
         this.chatSession = this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
               systemInstruction: this.systemInstruction,
               temperature: 0.7,
            }
         });
      }
  }
  
  async sendMessageStream(message: string, products: Product[]): Promise<AsyncIterable<string>> {
    try {
      if (!process.env['API_KEY']) {
        return (async function*() { yield "I am currently in demo mode. Please configure the API_KEY to enable my full fashion intelligence!"; })();
      }

      this.initChat(products);

      if (!this.chatSession) throw new Error("Chat session failed to initialize");

      // FIXED: Use the correct return type from sendMessageStream
      const result = this.chatSession.sendMessageStream({ message });
      
      return (async function*() {
         for await (const chunk of result) {
            yield chunk.text || '';
         }
      })();

    } catch (error) {
      console.error('Gemini API Error:', error);
      return (async function*() { yield "I'm having trouble connecting to the styling server. Please try again in a moment."; })();
    }
  }
}
