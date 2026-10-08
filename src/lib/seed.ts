import type { Block, Course, Lesson } from './domain';
import { guide, guideBlocks, workflowBlock } from './ai-guide';
type Content = [string, string, string, string, string[], string, string];
const content: Content[][] = [
  [
    [
      'What is Artificial Intelligence?',
      'AI systems use patterns in data to make predictions or generate outputs. They do not need human-like understanding to be useful.',
      'A spam filter predicts whether a message is unwanted from patterns in past messages.',
      'Which task is a practical use of AI?',
      [
        'Sorting likely spam emails',
        'Guaranteeing every email is truthful',
        'Reading a person’s private thoughts',
      ],
      'Sorting likely spam emails',
      'AI identifies patterns; it does not guarantee truth or read minds.',
    ],
    [
      'Generative AI',
      'Generative AI produces new text, images, audio, or code from patterns learned during training. Its output can be useful without being accurate.',
      'A teacher asks an assistant to draft five discussion questions about a story.',
      'What makes this task generative?',
      [
        'It creates new discussion questions',
        'It proves the story is factual',
        'It only stores existing files',
      ],
      'It creates new discussion questions',
      'Generating content differs from retrieving or storing a file.',
    ],
    [
      'What AI Can and Cannot Do',
      'AI can draft, classify, and suggest. It can also invent facts, miss context, and reproduce unfair patterns. Treat its work as a first draft.',
      'An assistant writes a confident answer with a citation that does not exist.',
      'What is the best next step?',
      [
        'Verify the claim against a reliable original source',
        'Trust it because it sounds confident',
        'Ask for the same answer in a nicer tone',
      ],
      'Verify the claim against a reliable original source',
      'Confidence and fluency are not evidence of accuracy.',
    ],
  ],
  [
    [
      'Understanding AI assistants',
      'An AI assistant uses the instructions and conversation context available to it. It may not know current events or have access to your files.',
      'You ask about a report without sharing it. The assistant cannot reliably summarize that report.',
      'What should you provide for a useful summary?',
      [
        'The relevant, non-sensitive report text',
        'Only the report’s filename',
        'Your account password',
      ],
      'The relevant, non-sensitive report text',
      'Share relevant material only after checking privacy and access rules.',
    ],
    [
      'Giving Clear Instructions',
      'Name the task with a specific action: summarize, compare, draft, explain, or extract. Tell the assistant what success looks like.',
      'Instead of “help with work,” ask “Draft three subject lines for our workshop invitation.”',
      'Which instruction is clearest?',
      [
        'List three subject lines for a workshop invitation',
        'Do something helpful',
        'Make it better',
      ],
      'List three subject lines for a workshop invitation',
      'A clear verb, deliverable, and quantity narrow the task.',
    ],
    [
      'Context and Constraints',
      'Context explains the situation. Constraints set limits such as tone, audience, word count, and information the assistant must avoid.',
      '“Explain solar power to 12-year-olds in 120 words. Avoid technical jargon.”',
      'Which part is a constraint?',
      ['In 120 words', 'Solar power', 'Explain'],
      'In 120 words',
      'A word limit defines the boundaries of the output.',
    ],
  ],
  [
    [
      'Anatomy of a Good Prompt',
      'A useful prompt contains a task, context, constraints, and output format. Start with what you want; add only the detail the task needs.',
      '“Create a five-item checklist for a teacher preparing a science class. Use simple language and bullet points.”',
      'What output format is requested?',
      ['A bullet-point checklist', 'A 20-page report', 'An image'],
      'A bullet-point checklist',
      'The prompt explicitly asks for bullet points and five items.',
    ],
    [
      'Improving Weak Prompts',
      'Weak prompts leave important decisions to the model. Improve one part at a time and compare the results.',
      'Weak: “Write an email.” Better: “Draft a polite 80-word email asking my supplier for a delivery update. Do not invent an order number.”',
      'Which added detail prevents invented information?',
      ['Do not invent an order number', 'Write an email', 'Make the email useful'],
      'Do not invent an order number',
      'Negative constraints can identify facts the model must not invent.',
    ],
    [
      'Prompt Challenge',
      'Build a prompt for an application letter. Specify the role, experience, tone, and length. Use fictional details for practice.',
      '“Draft a professional 200-word application letter for a bank assistant role. The applicant has two years of customer service experience. Do not invent qualifications.”',
      'Write your own application-letter prompt. Include the words: bank, experience, professional, and words.',
      [],
      'Draft a professional application letter of 200 words for a bank role. Use the applicant’s customer service experience. Do not invent qualifications.',
      'Add the job, relevant experience, professional tone, and a length in words.',
    ],
  ],
  [
    [
      'Writing Professional Emails',
      'Give an email a purpose, audience, and requested next action. Review names, dates, and commitments before sending.',
      '“Draft a friendly reminder to a colleague about Friday’s deadline. Ask them to confirm by Thursday. Keep it under 80 words.”',
      'What should you review before sending?',
      ['Dates, names, and commitments', 'Only the font', 'Nothing; send automatically'],
      'Dates, names, and commitments',
      'You remain responsible for the message sent in your name.',
    ],
    [
      'Creating Reports',
      'Give the assistant your source facts and an outline. Ask it to label missing information instead of making up numbers.',
      '“Using these sales figures, write an executive summary. Separate observed results from hypotheses. Mark missing figures as unknown.”',
      'What should AI do with a missing sales figure?',
      ['Mark it unknown', 'Invent a plausible number', 'Reuse an unrelated figure'],
      'Mark it unknown',
      'Missing data should remain visibly missing.',
    ],
    [
      'Creating CVs and Application Letters',
      'AI can improve the clarity of a CV. It should never add experience, qualifications, or achievements you do not have.',
      '“Rewrite this bullet to be clearer, preserving all facts: handled customer queries at reception.”',
      'Which revision is acceptable?',
      [
        'Responded to customer enquiries at reception',
        'Managed a 50-person team',
        'Increased revenue by 200%',
      ],
      'Responded to customer enquiries at reception',
      'The first revision preserves the facts instead of inventing achievements.',
    ],
    [
      'Research and Summarization',
      'Distinguish summarizing supplied text from researching the world. Ask for source links when available, then open them and verify important claims.',
      'An assistant summarizes a supplied report, then you compare each key finding with the original section.',
      'What makes a summary trustworthy?',
      [
        'It accurately reflects the original source',
        'It is longer than the source',
        'It uses confident language',
      ],
      'It accurately reflects the original source',
      'Check fidelity to the source, especially qualifiers and numbers.',
    ],
  ],
  [
    [
      'Hallucinations',
      'A hallucination is generated information that is false or unsupported. Fluent language can hide mistakes, including fabricated sources.',
      'An assistant gives a book title and author. You cannot find the book in a library catalog.',
      'How should you treat the book citation?',
      [
        'As unverified until checked',
        'As proven because it is specific',
        'As more reliable if repeated',
      ],
      'As unverified until checked',
      'Specific details can still be invented.',
    ],
    [
      'Privacy',
      'Before sharing data, check whether you have permission and whether the tool is approved for that data. Remove personal and confidential details.',
      'Replace customer names with neutral labels before using an approved assistant to summarize feedback.',
      'What is the safest practice?',
      [
        'Minimize and anonymize approved data',
        'Paste customer passwords',
        'Upload confidential files to any tool',
      ],
      'Minimize and anonymize approved data',
      'Permission, minimization, and an approved tool all matter.',
    ],
    [
      'Verification',
      'Use original sources for important facts. Check dates, units, calculations, and whether the source actually supports the claim.',
      'A generated report says costs fell by 30%. Recalculate from the original figures before using it.',
      'What should you do with the claimed 30% reduction?',
      [
        'Recalculate it from the original figures',
        'Round it to 40%',
        'Trust the report’s formatting',
      ],
      'Recalculate it from the original figures',
      'Independent calculation checks the claim.',
    ],
    [
      'Responsible Usage',
      'Consider who could be affected by an AI-assisted decision. Look for unfair assumptions, disclose AI assistance when required, and retain human review.',
      'A hiring assistant ranks applicants. A human checks relevance, bias, and the evidence before decisions are made.',
      'Who remains accountable for the final hiring decision?',
      ['The people making the decision', 'The assistant alone', 'Nobody'],
      'The people making the decision',
      'Human responsibility does not disappear when AI is involved.',
    ],
  ],
  [
    [
      'Practical AI Challenge',
      'Create a prompt for a useful work task. Include a task, audience, output format, privacy instruction, and verification step.',
      '“Draft a professional email for my team in 100 words using anonymized project notes. Verify dates against the notes and flag missing facts.”',
      'Write a prompt containing: email, team, words, anonymized, and verify.',
      [],
      'Draft a professional email for my team in 100 words using anonymized notes. Verify dates and flag missing facts.',
      'Add a task, audience, word limit, privacy instruction, and verification step.',
    ],
    [
      'Final Quiz',
      'Bring your skills together. A passing score of 80% is required. You can review lessons and retry; repeated passes never earn extra XP.',
      'A useful workflow is: define the task, supply safe context, constrain the output, then verify the result.',
      'Which action should come before publishing AI-generated research?',
      [
        'Verify claims against original sources',
        'Remove every citation',
        'Make the prose sound more confident',
      ],
      'Verify claims against original sources',
      'Publishing creates responsibility for the claims you share.',
    ],
  ],
];
export const moduleTitles = [
  'Understanding AI',
  'Working with AI Assistants',
  'Prompt Engineering',
  'AI for Real Work',
  'Responsible AI',
  'Final Challenge',
];
const block = (
  id: string,
  type: Block['type'],
  text: string,
  extra: Partial<Block> = {},
): Block => ({
  id,
  type,
  text,
  options: [],
  answer: '',
  explanation: '',
  rubric: [],
  required: true,
  ...extra,
});
export const seedCourse: Course = {
  id: 'ai-essentials',
  slug: 'ai-essentials',
  title: 'AI Essentials: Learn AI by Doing',
  description:
    'A step-by-step beginner’s guide for ordinary people—no coding or technical background needed. Explore how AI works, write useful prompts, practice everyday writing and research, protect private information, and check unreliable answers. Includes 19 detailed lessons, guided examples, 66 interactive activities, a practical project, and a 10-question final assessment.',
  category: 'AI foundations',
  difficulty: 'Beginner',
  priceCents: 0,
  duration: 'About 6 hours with practice',
  instructor: 'LibTech Learning Team',
  ownerId: 'platform',
  status: 'PUBLISHED',
  order: 0,
  revision: 1,
  thumbnail: '',
  outcomes: [
    'Write clear, specific prompts',
    'Draft and improve everyday work',
    'Verify AI-generated facts and sources',
    'Protect private and confidential information',
    'Build a repeatable, responsible AI workflow',
  ],
  requirements:
    'No coding or previous AI experience needed. A browser and internet connection are enough. All course activities work without a paid external AI account. Allow about 15–25 minutes per lesson, plus time for the practical project; learn at your own pace.',
  passingPercent: 80,
  modules: content.map((items, mi) => ({
    id: 'module-' + (mi + 1),
    title: moduleTitles[mi],
    lessons: items.map(([title, text, example, q, options, answer, explanation], li): Lesson => {
      const id = 'm' + (mi + 1) + '-l' + (li + 1);
      const final = mi === 5 && li === 1;
      const blocks = [
        block('learn', 'TEXT', text),
        ...guideBlocks(id),
        block('example', 'PROMPT_EXAMPLE', example),
        block(
          'practice',
          options.length ? 'MULTIPLE_CHOICE' : mi === 2 ? 'AI_EXERCISE' : 'PRACTICE_EXERCISE',
          q,
          {
            options,
            answer,
            explanation,
            rubric: options.length
              ? []
              : mi === 2
                ? ['bank', 'experience', 'professional', 'words']
                : ['email', 'team', 'words', 'anonymized', 'verify'],
          },
        ),
      ];
      if (final) {
        blocks.find((b) => b.id === 'practice-lab')!.required = false;
        blocks.push(
          block(
            'privacy',
            'TRUE_FALSE',
            'It is safe to paste customer passwords into an AI assistant.',
            {
              options: ['True', 'False'],
              answer: 'False',
              explanation: 'Never share passwords with an AI assistant.',
            },
          ),
          block(
            'context',
            'FILL_BLANK',
            'A prompt usually includes task, context, constraints, and output ____.',
            { answer: 'format', explanation: 'Format defines the shape of the response.' },
          ),
          block(
            'trust',
            'MULTIPLE_CHOICE',
            'A confident AI answer contains a source you cannot find. What should you do?',
            {
              options: ['Treat it as unverified', 'Trust the confidence', 'Cite it anyway'],
              answer: 'Treat it as unverified',
              explanation: 'Fluent, specific answers can still be false.',
            },
          ),
          block(
            'facts',
            'MULTIPLE_CHOICE',
            'How should an AI assistant handle missing facts in a report?',
            {
              options: ['Label them as unknown', 'Invent plausible details', 'Delete all caveats'],
              answer: 'Label them as unknown',
              explanation: 'Preserve uncertainty instead of inventing facts.',
            },
          ),
        );
        blocks.push(
          workflowBlock,
          block(
            'capabilities',
            'MULTIPLE_CHOICE',
            'An assistant has not been given a report. Which next step supports an accurate summary?',
            {
              options: [
                'Ask it to guess from the filename',
                'Provide the relevant text after checking permission',
                'Assume it can see every private file',
              ],
              answer: 'Provide the relevant text after checking permission',
              explanation:
                'The assistant needs the source, and you need permission to share it. A filename does not supply the contents.',
            },
          ),
          block(
            'commitments',
            'MULTIPLE_CHOICE',
            'A draft promises a refund you are not authorized to offer. What should you do?',
            {
              options: [
                'Send it because AI wrote it',
                'Keep the promise but remove your name',
                'Remove the promise and obtain the appropriate approval',
              ],
              answer: 'Remove the promise and obtain the appropriate approval',
              explanation:
                'You remain responsible for commitments in a message you send. Drafting does not create authority to make promises.',
            },
          ),
          block(
            'fairness',
            'MULTIPLE_CHOICE',
            'Which basis is relevant when assigning fictional volunteer tasks?',
            {
              options: [
                'Stated skills and availability',
                'Guesses from a person’s name',
                'Unsupported assumptions about age',
              ],
              answer: 'Stated skills and availability',
              explanation:
                'Use relevant evidence consistently, and retain human review instead of relying on personal assumptions.',
            },
          ),
        );
      }
      if (id === 'm6-l1') blocks.push(workflowBlock);
      // Rotate choices deterministically so the original practice answers are not
      // always the first option. Answer text and stable IDs remain unchanged.
      for (const b of blocks) {
        if (b.type === 'MULTIPLE_CHOICE' && b.options.length > 1) {
          const shift = (mi + li + 1) % b.options.length;
          b.options = [...b.options.slice(shift), ...b.options.slice(0, shift)];
        }
      }
      blocks.push(block('summary', 'SUMMARY', guide[id].takeaway));
      return {
        id,
        title,
        minutes: final ? 25 : id === 'm6-l1' ? 30 : 18,
        published: true,
        final,
        blocks,
      };
    }),
  })),
};
