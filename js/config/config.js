export const CONFIG = {
  CHATBOT_NAME: "Stella",
  CHATBOT_SUBTITLE: "Your AI Assistant",
  STORAGE_KEY: "tataPlay_chat_history",
  EMAIL_STORAGE_KEY: "Shayanta.Chaudhuri@tataplay.com",

  // API Configuration
  USE_MOCK_API: false, // Set to false to use real Lambda API
  API_ENDPOINT: "https://tplay-api.kreedatesting.in",
  
  // Streaming Configuration
  STREAMING_DELAY_MIN: 50,
  STREAMING_DELAY_MAX: 100,
  THINKING_DELAY_MIN: 1000,
  THINKING_DELAY_MAX: 2000,
  
  // Message Limits
  MAX_MESSAGE_LENGTH: 500,
  MIN_MESSAGE_LENGTH: 1,
};
