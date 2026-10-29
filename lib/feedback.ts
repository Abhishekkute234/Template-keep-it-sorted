export const FEEDBACK_TOPICS = ["Idea", "Bug", "Praise", "Other"] as const;
export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number];
