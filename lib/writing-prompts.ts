import type { WritingPrompt } from "@/types";

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "wind-1",
    type: "independent",
    minuteLimit: 30,
    targetWords: 300,
    topic:
      "Do you agree or disagree with the following statement? It is better to have a job you enjoy than a job that pays well. Use specific reasons and examples to support your answer.",
  },
  {
    id: "wind-2",
    type: "independent",
    minuteLimit: 30,
    targetWords: 300,
    topic:
      "Some people believe that universities should require students to take a variety of courses outside their major field of study. Others believe that students should specialize in their major field. Which view do you agree with, and why?",
  },
  {
    id: "wind-3",
    type: "independent",
    minuteLimit: 30,
    targetWords: 300,
    topic:
      "Do you agree or disagree: The most important characteristic of a good leader is the ability to make quick decisions. Use specific reasons and examples to support your position.",
  },
  {
    id: "wind-4",
    type: "independent",
    minuteLimit: 30,
    targetWords: 300,
    topic:
      "Some people prefer to get advice from friends or family when making important decisions. Others prefer to make decisions on their own. Which approach do you prefer, and why? Use specific reasons and examples.",
  },
  {
    id: "wind-5",
    type: "independent",
    minuteLimit: 30,
    targetWords: 300,
    topic:
      "Do you agree or disagree: Social media has had a more negative than positive impact on society. Support your position with specific reasons and examples.",
  },
  {
    id: "wint-1",
    type: "integrated",
    minuteLimit: 20,
    targetWords: 150,
    topic:
      "Summarize the points made in the lecture and explain how they cast doubt on specific points in the reading passage.",
    context:
      "Reading: Many experts argue that remote work significantly boosts employee productivity. Studies show that employees working from home complete 13% more tasks, report higher job satisfaction, and experience fewer interruptions than office workers. Additionally, remote work saves commuting time, which employees can redirect to productive tasks. Companies also benefit from reduced overhead costs.\n\nLecture (summary): The professor challenges the reading's claims. First, the 13% productivity increase was measured only for routine, individual tasks — collaborative and creative work actually declined by 20%. Second, job satisfaction surveys were taken during the first six months; follow-up studies at 18 months showed increased feelings of isolation and burnout. Third, the cost savings were offset by increased IT infrastructure and cybersecurity expenses.",
  },
  {
    id: "wint-2",
    type: "integrated",
    minuteLimit: 20,
    targetWords: 150,
    topic:
      "Summarize the points made in the lecture and explain how they challenge the claims in the reading passage.",
    context:
      "Reading: Gamification — applying game design elements like points, badges, and leaderboards to non-game contexts — has been shown to dramatically improve student motivation and learning outcomes. Research indicates that gamified classrooms see up to 40% higher engagement rates, with students voluntarily spending more time on course material. Proponents argue that gamification taps into intrinsic motivation and makes learning inherently rewarding.\n\nLecture (summary): The professor argues the reading overstates gamification's benefits. The 40% engagement increase was measured by time-on-task, not actual learning — students were clicking to earn badges, not processing content deeply. Long-term studies show the motivational boost disappears within 8-10 weeks as the novelty wears off. Most critically, gamification was found to reduce intrinsic motivation over time: students began performing only when rewards were offered, undermining the very self-motivation the reading claims it builds.",
  },
];

export function getWritingPromptById(id: string): WritingPrompt | undefined {
  return WRITING_PROMPTS.find((p) => p.id === id);
}
