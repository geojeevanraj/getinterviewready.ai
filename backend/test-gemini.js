import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAvailableModels() {
  try {
    console.log('🔍 Fetching available models...\n');
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        console.log(`  • ${model.name}`);
        console.log(`    Display Name: ${model.displayName}`);
        console.log(`    Supported: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      // Try the first available model
      const firstModel = data.models.find(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (firstModel) {
        console.log(`\n🧪 Testing with: ${firstModel.name}\n`);
        const modelName = firstModel.name.replace('models/', '');
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        console.log('✅ Success! Response:', response.text());
        console.log(`\n✨ Use this model name in your code: "${modelName}"`);
      }
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAvailableModels();
