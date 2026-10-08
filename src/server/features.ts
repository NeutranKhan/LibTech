export const aiFeedbackEnabled = () =>
  process.env.AI_FEEDBACK_ENABLED === 'true' &&
  !!process.env.OPENAI_API_KEY &&
  !!process.env.OPENAI_MODEL;
export const profilePhotosEnabled = () =>
  process.env.PROFILE_PHOTOS_ENABLED === 'true' && !!process.env.FIREBASE_STORAGE_BUCKET;
