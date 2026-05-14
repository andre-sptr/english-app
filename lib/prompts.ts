import type { SpeakingPrompt } from "@/types";

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: "ind-1",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Some people prefer to spend their free time alone. Others prefer to spend it with other people. Which do you prefer, and why? Use details and examples to support your answer.",
  },
  {
    id: "ind-2",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Describe a teacher or mentor who had a significant positive influence on your life. Explain how this person influenced you and give specific examples.",
  },
  {
    id: "ind-3",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Do you agree or disagree with the following statement: Students learn more effectively when they study with classmates than when they study alone. Use specific reasons and examples to support your answer.",
  },
  {
    id: "ind-4",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Some people prefer to live in a large city. Others prefer to live in a small town or rural area. Which do you prefer, and why? Include specific details and examples in your response.",
  },
  {
    id: "ind-5",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "What is one skill you wish you had learned earlier in life? Explain why this skill is important and how learning it earlier would have benefited you.",
  },
  {
    id: "ind-6",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Do you agree or disagree: Technology has made communication between people less meaningful than it was in the past. Use specific reasons and examples to support your position.",
  },
  {
    id: "ind-7",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Some people think it is better to have a few very close friends. Others believe it is better to have many friends, even if those friendships are not as deep. Which do you agree with, and why?",
  },
  {
    id: "ind-8",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Describe a goal you are currently working toward. What steps are you taking to achieve it, and what challenges have you faced so far?",
  },
  {
    id: "ind-9",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Some students prefer to take many different classes to explore various subjects. Others prefer to focus deeply on one subject area. Which approach do you think is better for a student's education, and why?",
  },
  {
    id: "ind-10",
    type: "independent",
    prepSeconds: 15,
    speakSeconds: 45,
    topic:
      "Describe a time when you had to make a difficult decision. What was the decision, how did you make it, and what was the outcome?",
  },
  {
    id: "int-1",
    type: "integrated",
    prepSeconds: 30,
    speakSeconds: 60,
    topic:
      "The university is considering a new policy that would require all students to complete 100 hours of community service before graduation. The reading passage describes the proposal. The listening passage presents a student's reaction. Summarize the student's opinion and explain the reasons the student gives for holding that opinion.",
    context:
      "Reading: A university proposal suggests requiring 100 hours of community service for graduation, arguing it builds civic responsibility and enhances employability. Critics worry about the burden on students with jobs or family obligations.\n\nListening: A student argues strongly against the proposal, saying it would be especially unfair to students who already work part-time to pay tuition. She also questions whether forced service produces genuine community benefit, citing research showing voluntary service is more impactful.",
  },
  {
    id: "int-2",
    type: "integrated",
    prepSeconds: 30,
    speakSeconds: 60,
    topic:
      "The reading passage describes the concept of 'deep work' in academic study. The professor in the listening passage challenges one of the key claims made in the reading. Explain the professor's objection and the evidence the professor uses to support it.",
    context:
      "Reading: 'Deep work' refers to focused, uninterrupted study sessions that allow students to learn complex material more effectively. Proponents argue that 90-minute focused sessions without any digital distractions lead to significantly better retention than shorter, interrupted sessions.\n\nListening: The professor argues that the 90-minute standard is too rigid. She cites studies showing that optimal focus duration varies widely between individuals — some students peak at 45 minutes while others can sustain 2+ hours. She argues the key variable is personal rhythm, not a fixed time block.",
  },
];

export function getPromptById(id: string): SpeakingPrompt | undefined {
  return SPEAKING_PROMPTS.find((p) => p.id === id);
}
