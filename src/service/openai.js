import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const baseURL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const siteName = import.meta.env.VITE_SITE_NAME || 'AI React App';

    if (!apiKey) {
      console.warn('API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
      return;
    }

    this.client = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
      defaultHeaders: {
        'HTTP-Referer': siteUrl, // Optional. Site URL for rankings on openrouter.ai.
        'X-Title': siteName, // Optional. Site title for rankings on openrouter.ai.
      },
    });
  }

  async generateResponse(prompt, options = {}) {
    if (!this.client) {
      throw new Error('API client not initialized. Please check your API key.');
    }

    try {
      // Use provided messages or create default structure
      const messages = options.messages || [
        {
          role: 'system',
          content: options.systemMessage || 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      console.log('API Key:', import.meta.env.VITE_OPENAI_API_KEY);
      console.log('Base URL:', import.meta.env.VITE_OPENAI_BASE_URL);

      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        alert('API key is missing!');
      }


      const response = await this.client.chat.completions.create({
        model: options.model || 'deepseek/deepseek-r1', // Default to DeepSeek-R1
        messages: messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
      });

      return {
        success: true,
        data: response.choices[0]?.message?.content || 'No response generated.',
        usage: response.usage,
        model: response.model
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);

      let errorMessage = 'An error occurred while generating the response.';

      if (error.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenRouter API key in the .env file.';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.status === 500) {
        errorMessage = 'API service is currently unavailable. Please try again later.';
      } else if (error.status === 402) {
        errorMessage = 'Insufficient credits. Please check your OpenRouter account balance.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
  }

  async generateStreamResponse(prompt, options = {}, onChunk) {
    if (!this.client) {
      throw new Error('API client not initialized. Please check your API key.');
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || 'deepseek/deepseek-r1', // Default to DeepSeek-R1
        messages: [
          {
            role: 'system',
            content: options.systemMessage || 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          if (onChunk) {
            onChunk(content, fullResponse);
          }
        }
      }

      return {
        success: true,
        data: fullResponse
      };
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while streaming the response.'
      };
    }
  }

  isConfigured() {
    return this.client !== null;
  }
}

export default new OpenAIService(); 