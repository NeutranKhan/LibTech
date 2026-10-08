import type { Block } from './domain';

type Chapter = {
  goal: string;
  sections: [string, string][];
  walkthrough: string;
  question: [string, string[], string, string];
  practice: [string, string, string[]];
  takeaway: string;
};

// Editorial content, not generated at runtime. IDs are stable across releases.
export const guide: Record<string, Chapter> = {
  'm1-l1': {
    goal: 'Explain AI to a friend, identify it in everyday life, and distinguish a prediction from a fact.',
    sections: [
      [
        'Start here: you do not need to be technical',
        'Artificial intelligence, usually shortened to AI, is a broad name for computer systems that perform tasks such as recognizing patterns, making predictions, or producing language. You do not need to write code or understand advanced mathematics to use these tools thoughtfully. This course starts with familiar situations and builds one skill at a time. Read an explanation, try the activity, check the feedback, and revise your answer. A wrong answer is useful information about what to practice next.',
      ],
      [
        'AI is already part of ordinary life',
        'Imagine opening your email. A spam filter looks for signs that a message may be unwanted. A music service suggests a song based on listening patterns. A phone turns spoken words into text. These are different tasks, and the systems behind them can work differently. The shared idea is that a computer uses information to produce a useful output. Not every clever-looking feature is AI: a timer that rings after ten minutes can simply follow a fixed instruction. Calling a product “AI-powered” does not tell you how accurate it is.',
      ],
      [
        'Four words you will use throughout this course',
        'Data means examples or information, such as messages, pictures, or recorded sounds. A model is a system adjusted using data so it can perform a task. An input is what you give a system, such as a question or photograph. An output is what it returns, such as a suggested answer or label. If you ask an assistant to draft a birthday invitation, your instructions are the input and its draft is the output. The model is not the same thing as the app you see; an app may combine a model with search, documents, and other tools.',
      ],
      [
        'How learning from examples differs from a fixed rule',
        'A fixed rule might send every message containing a particular word to a folder. A learned spam filter may use many patterns together, based on examples of wanted and unwanted messages. Training is the stage where a model is adjusted using examples. Using the trained model on a new message is a different stage. A system can make mistakes when the new situation differs from the examples it learned from. A valuable message might go to spam. That is why a prediction should be checked when the consequences matter.',
      ],
    ],
    walkthrough:
      'Follow one message through a spam filter. Input: an email offering an unexpected prize. Task: estimate whether it is unwanted. Output: a spam label. Human check: look in the spam folder before deleting an important expected email. Notice the limit: the label does not prove that every statement in the message is true or false.',
    question: [
      'A phone labels a family photo “beach,” but it was taken beside a lake. What does this show?',
      [
        'The family must remember the location incorrectly',
        'A pattern-based prediction can be useful and still be wrong',
        'Every photo label is deliberately deceptive',
      ],
      'A pattern-based prediction can be useful and still be wrong',
      'The label is an interpretation of visual patterns, not independent proof of the location. Your knowledge of the event matters.',
    ],
    practice: [
      'Describe the spam-filter example using these three labels: input, output, check. Give a concrete example for each. This practice checker looks for those labels; compare the meaning of your response with the example too.',
      'Input: an incoming email. Output: a prediction that it belongs in spam. Check: review the folder for expected messages before deleting them.',
      ['input', 'output', 'check'],
    ],
    takeaway:
      'AI can help recognize, predict, or create. Always ask: what went in, what came out, and what would I check before relying on it?',
  },
  'm1-l2': {
    goal: 'Recognize generative tasks and understand why a fluent answer is not the same as a verified answer.',
    sections: [
      [
        'From sorting things to creating things',
        'Some AI systems classify information: this message is probably spam, or this sound resembles a spoken word. Generative AI produces content, such as an email draft, an illustration, a melody, or computer code. It can also transform supplied content by shortening, translating, or changing its style. A single app may combine generation with other features. For example, it may search for a page and then generate a summary of that page. Those are separate steps, and each can introduce errors.',
      ],
      [
        'A simple picture of how text is produced',
        'A language model processes text in smaller pieces called tokens. A token can be a word, part of a word, or punctuation. In many text-generation systems, the model produces a sequence by repeatedly selecting a next piece based on patterns learned during training and the available context. This is a simplified description, not a complete account of how every system works. The practical lesson is that producing a plausible sentence is different from checking that sentence against reality. A convincing explanation can contain an invented detail.',
      ],
      [
        'Why two answers can differ',
        'You may ask the same question twice and receive different wording or suggestions. Generation can involve variation, and changes in the conversation can affect the answer. This is helpful when you want several invitation ideas. It is less helpful when you need an exact figure from a document. For exact tasks, supply the source, specify what must stay unchanged, and compare the output with the original. Repetition is not verification: two similar answers from an assistant are not two independent sources.',
      ],
      [
        'Choose a first task with low consequences',
        'Start with a task where you can judge the result yourself: turn your own shopping notes into categories, draft a friendly invitation, or brainstorm titles for a hobby project. Use fictional or non-sensitive information. Keep the original notes nearby. Ask for a short output so you can review it completely. You are learning to direct and evaluate a tool, not trying to find a perfect magic sentence. In this course, examples marked as worked examples are written teaching examples, not live AI responses.',
      ],
    ],
    walkthrough:
      'Source notes: “Community book swap; Saturday; bring up to three books; time not decided.” Prompt: “Draft a friendly invitation using only these notes. Leave the time as [time to confirm].” A useful draft preserves Saturday and the three-book limit. A draft that says “Meet at 2 p.m.” has invented a fact, even if it sounds friendly.',
    question: [
      'An assistant writes “Meet at 2 p.m.” even though your notes do not include a time. What should you do?',
      [
        'Send it because the wording is polished',
        'Ask for a more cheerful tone',
        'Replace the invented time with a placeholder and confirm it',
      ],
      'Replace the invented time with a placeholder and confirm it',
      'The problem is missing evidence for the time. Changing the tone does not fix the factual gap.',
    ],
    practice: [
      'Write a prompt for the book-swap invitation. Include the words invitation, notes, and missing. Explain what should happen to facts that are missing.',
      'Draft an invitation from these notes only. If a fact is missing, use a placeholder instead of inventing it.',
      ['invitation', 'notes', 'missing'],
    ],
    takeaway:
      'Use generation to develop a draft or possibilities. Use sources and human checks to establish what is true.',
  },
  'm1-l3': {
    goal: 'Choose suitable tasks and decide when an AI output needs closer review or a qualified person.',
    sections: [
      [
        'Useful does not mean all-purpose',
        'AI can often help with first drafts, idea lists, explanations, and organizing supplied information. Its usefulness depends on the task, the system, and the material you provide. A tool that writes a good poem might struggle to extract every number from a complicated table. A tool that explains a topic well might still invent the title of a source. Evaluate the particular output in front of you. Do not assume that success on one task guarantees success on another.',
      ],
      [
        'Ask three questions before you start',
        'First, can I explain the task clearly? “Make my life better” is hard to assess; “Turn these notes into a five-item packing checklist” is easier. Second, can I judge whether the answer is good? If you know nothing about a topic, you may miss errors. Third, what happens if the answer is wrong? A poor birthday-card suggestion is easy to discard. A wrong instruction involving health, money, legal rights, or physical safety may have serious consequences and needs reliable sources and appropriate expertise.',
      ],
      [
        'What the assistant may not have',
        'An assistant does not automatically have access to your screen, private files, calendar, live websites, or previous conversations. Features vary by product and settings. If it cannot access the material, it cannot reliably report what that material says. Even when a tool has access, check that it used the correct file and version. Requests such as “check my bank account” cannot be fulfilled just because the model can discuss bank accounts. Capability and permission are separate questions.',
      ],
      [
        'Keep the human decision visible',
        'Use AI to prepare options you can review. For example, it can suggest three ways to word a polite reminder; you decide which one reflects your relationship and intentions. Watch for unwanted promises, unfair assumptions, or missing context. If you cannot verify a consequential claim, leave it unresolved and seek suitable help. Saying “I do not know yet” is a successful result when the alternative is a confident mistake.',
      ],
    ],
    walkthrough:
      'Compare two tasks. “Suggest five names for my fictional gardening club” is a low-consequence idea task you can judge yourself. “Tell me whether an unfamiliar medicine combination is safe” requires trustworthy, individualized professional guidance. The difference is the consequence of error and your ability to verify the result, not how friendly the assistant sounds.',
    question: [
      'Which task is the best first practice for a beginner?',
      [
        'Brainstorm titles for a fictional neighborhood newsletter',
        'Make an unreviewed decision about someone’s medical treatment',
        'Approve a contract without reading it',
      ],
      'Brainstorm titles for a fictional neighborhood newsletter',
      'You can judge newsletter titles and discard unsuitable suggestions without depending on an unverified high-consequence decision.',
    ],
    practice: [
      'Choose an everyday task. Write three lines labelled task, risk, and review. Explain one thing you would check before using the result.',
      'Task: draft a birthday invitation. Risk: the assistant could invent a time. Review: compare the date, time, and place with my own notes before sending.',
      ['task', 'risk', 'review'],
    ],
    takeaway:
      'A good beginner task has a clear goal, manageable consequences, and a result you can check.',
  },
  'm2-l1': {
    goal: 'Understand the chat workspace, supply the right source, and manage a conversation without assuming hidden access.',
    sections: [
      [
        'Your first conversation',
        'Most chat assistants have a space to type a message, a way to submit it, and an area showing replies. Some support attachments or other tools. A prompt is simply the instruction or question you give the assistant. Begin with one small request. Read the whole reply before asking a follow-up. If a control or feature is unfamiliar, check the tool’s own help rather than assuming it behaves like another app. You do not need a paid external AI account to complete the interactive activities in this course.',
      ],
      [
        'Context is the material available for this response',
        'Context can include your message, earlier messages in the conversation, and material provided through enabled tools. It is not unlimited. A long conversation or large attachment may exceed what a system can process at once. Some products summarize or select material rather than include every word. If a crucial detail matters, restate it concisely and ask the assistant to identify which supplied passage supports its answer. Do not treat this request as proof that the passage was interpreted correctly; check it yourself.',
      ],
      [
        'Use follow-ups deliberately',
        'A conversation can move through stages: ask for a draft, identify a weakness, request one revision, and compare. “Shorten the second paragraph while keeping the date and cost unchanged” gives a clearer direction than “try again.” If you switch to an unrelated task, a fresh conversation can reduce confusion from earlier instructions. If you stay in the same task, preserve useful context such as the source notes and intended audience. Keep your own copy of important source information.',
      ],
      [
        'Troubleshooting a disappointing response',
        'If an answer is vague, add the audience and desired output. If it describes the wrong document, supply the correct text and title. If it claims to have read a file you did not share, stop and check access. If it invents missing facts, tell it to mark unknowns and then verify the revision. You are not required to keep arguing with the tool. For a task it cannot perform reliably, use another method.',
      ],
    ],
    walkthrough:
      'You type “Summarize my report.” The assistant has no report. Repair the request: “Here is a fictional report excerpt: the club held two meetings and welcomed six new members. Summarize only this excerpt in two sentences. State that the full report was not provided.” The improved request gives both a source and a boundary.',
    question: [
      'You start a fresh conversation and ask about a file shared in another chat. What is the soundest approach?',
      [
        'Assume every chat has every file',
        'Provide the relevant safe material again and confirm what is being summarized',
        'Ask the assistant to guess the file contents',
      ],
      'Provide the relevant safe material again and confirm what is being summarized',
      'Access and memory depend on the tool and settings. Supplying the appropriate material avoids relying on an assumption.',
    ],
    practice: [
      'Write a follow-up that changes a draft’s length while preserving its facts. Include shorter, keep, and facts.',
      'Make the draft shorter. Keep the date and location unchanged, and preserve all facts from the supplied notes.',
      ['shorter', 'keep', 'facts'],
    ],
    takeaway:
      'Treat the conversation as a workspace you manage: provide the source, give a precise next instruction, and inspect the result.',
  },
  'm2-l2': {
    goal: 'Turn a vague request into a specific, checkable instruction.',
    sections: [
      [
        'Begin with an action',
        'Useful task verbs include draft, list, summarize, compare, explain, and extract. Each asks for a different kind of work. “Summarize” asks for a shorter account of a source. “Extract” asks for selected information, ideally without adding interpretation. “Compare” asks for similarities and differences using criteria. “Draft” invites new wording. Choose the verb that matches your need before adding extra detail. A complicated prompt with an unclear task is still unclear.',
      ],
      [
        'Describe the finished result',
        'Imagine receiving a good answer. What would it contain? How long would it be? Who would use it? For a workshop invitation, you might need three subject lines, each under eight words, for people attending their first session. These details let you assess the output. Avoid vague targets such as “make it amazing” when you can name a concrete quality: welcoming, accurate, short, or easy for a beginner to understand.',
      ],
      [
        'Separate different jobs',
        'A request to “summarize this text, write a reply, plan an event, and suggest a budget” combines several jobs. For a beginner, it is easier to do one at a time. First summarize the relevant facts. Check that summary. Then draft the reply from the checked facts. Breaking work into steps gives you opportunities to catch errors before they spread. It can also reveal that a later step needs information you have not supplied yet.',
      ],
      [
        'Add a way to handle uncertainty',
        'When necessary details are missing, ask the assistant to ask a question or use a clear placeholder. For example: “If the delivery date is missing, write [date to confirm].” This instruction does not guarantee compliance, but it makes your expectation explicit and easier to check. Do not reward an answer for filling every space if it filled them with invented information. A useful draft can contain honest gaps.',
      ],
    ],
    walkthrough:
      'Vague: “Help with my event.” Clearer: “Draft three short subject lines for an invitation to a fictional beginner gardening workshop. Use a welcoming tone. Do not imply the event is free because the price is not decided.” Evaluate the result by counting subject lines and checking tone and price claims.',
    question: [
      'Which request gives you the clearest way to judge success?',
      [
        'Make a great announcement',
        'Help with communication',
        'Draft two sentences announcing a book swap using only these notes',
      ],
      'Draft two sentences announcing a book swap using only these notes',
      'The task, length, topic, and source boundary are explicit. You can compare the reply against them.',
    ],
    practice: [
      'Repair “Help me study.” Include explain, beginner, and example in your prompt, and name a specific topic.',
      'Explain how a spam filter works to a beginner. Use one everyday example and avoid technical jargon.',
      ['explain', 'beginner', 'example'],
    ],
    takeaway:
      'A clear instruction names an action and a result you can evaluate. Specificity helps more than impressive-sounding language.',
  },
  'm2-l3': {
    goal: 'Distinguish helpful context from unnecessary detail, and write compatible constraints.',
    sections: [
      [
        'Give the situation that changes the answer',
        'Context explains what the assistant needs to know about your task. A message to a close friend may sound different from a message to a new customer. A beginner explanation needs different vocabulary from an expert report. Useful context can include the audience, purpose, relevant facts, and where the output will be used. It does not mean sharing everything about yourself. Include only information that helps the task and that you are permitted to share.',
      ],
      [
        'Constraints are the boundaries',
        'A constraint limits the output: under 100 words, no technical jargon, three bullet points, or use only the provided notes. Positive constraints say what to include. Negative constraints say what to avoid, such as invented prices or personal details. There is no universal best number of constraints. Use enough to make the task clear without creating unnecessary conflicts. A request for a complete 50-page report in one sentence asks for incompatible results.',
      ],
      [
        'Prioritize when requirements compete',
        'Suppose you want a short summary that preserves every exception in a long policy. Extreme brevity may make that impossible. Tell the assistant which goal matters more: “Keep all exceptions even if the summary becomes longer.” Then review whether the output followed that priority. If an answer drops a condition, correcting the condition is more important than keeping a neat word count. Constraints are tools for directing work, not reasons to accept a misleading result.',
      ],
      [
        'Use safe substitutes',
        'For practice, use fictional people, invented event details, and public text. For real work, removing a name alone may not remove identifiability: a rare job title, location, and event date together can reveal someone. Before sharing information, consider your organization’s rules and the tool’s data handling. When private details are unnecessary, replace them with neutral labels or leave them out. We return to this decision in the privacy module.',
      ],
    ],
    walkthrough:
      'Task: explain recycling. Context: a notice for new residents of a fictional building. Constraints: friendly tone, under 100 words, use only supplied collection rules, and mark missing collection days. Do not ask AI to invent local recycling rules; the building’s actual guidance is the source needed for real use.',
    question: [
      'Your prompt asks for one sentence and a detailed explanation of ten exceptions. What should you change?',
      [
        'Add more conflicting instructions',
        'State which requirement matters most and allow enough space',
        'Assume a shorter answer must be more accurate',
      ],
      'State which requirement matters most and allow enough space',
      'A clear priority helps resolve the conflict; you still need to check that important exceptions remain.',
    ],
    practice: [
      'Write a prompt for a fictional club notice with labels audience, limit, and avoid. Specify one useful detail for each label.',
      'Draft a club notice. Audience: new members. Limit: 80 words. Avoid: invented dates or prices; use placeholders for missing details.',
      ['audience', 'limit', 'avoid'],
    ],
    takeaway:
      'Share relevant context, set practical limits, and make the most important requirement clear.',
  },
  'm3-l1': {
    goal: 'Build a reusable prompt using task, context, constraints, and format.',
    sections: [
      [
        'A four-part brief',
        'Think of a prompt as a brief you might give a helpful colleague. Task: what do you want done? Context: what situation and source facts matter? Constraints: what must be included, preserved, or avoided? Format: what should the response look like? You do not need to label every part every time. The structure is a checklist for your thinking, not a secret formula that guarantees a correct answer.',
      ],
      [
        'Choose a format that helps you use the answer',
        'Bullet points work well for a checklist. A small table can compare options using the same criteria. A short paragraph may suit an invitation. If you want a table, name the columns so that the assistant does not choose irrelevant ones. For example: “Use columns: item, reason, question to confirm.” Formatting makes review easier, but a beautiful table can still contain wrong facts. Inspect the content, not just its appearance.',
      ],
      [
        'Provide an example when style is hard to describe',
        'If you cannot explain the tone you want, provide a short safe example and say what to copy from it: sentence length, level of detail, or friendliness. Clarify that the example’s facts should not be copied. Otherwise a model may accidentally carry over a date or price from the example. Use your own text or material you have permission to use. One useful example can be more effective than several vague adjectives.',
      ],
      [
        'Build a prompt you can reuse',
        'A template uses placeholders for changing details: [audience], [notes], [word limit]. Replace those placeholders deliberately each time. Do not leave yesterday’s facts hidden inside a template. Keep a version that worked, along with a note about what you checked. Reusable prompts save time when the task repeats, but changing the audience or risk level may require a different approach.',
      ],
    ],
    walkthrough:
      'Task: create a packing checklist. Context: a fictional one-day indoor workshop; participants bring a notebook and refillable bottle. Constraints: use only these facts; do not add equipment requirements. Format: two bullet points followed by a question about anything missing. You can verify every item against the supplied context.',
    question: [
      'You want a table comparing three options fairly. What should your prompt specify?',
      [
        'Different criteria for each option',
        'The same comparison columns for every option',
        'Only the option you already prefer',
      ],
      'The same comparison columns for every option',
      'Shared criteria make the comparison easier to inspect. Missing information should still be marked as unknown.',
    ],
    practice: [
      'Create a reusable prompt with the four labels task, context, constraints, and format. Use square-bracket placeholders for changing details.',
      'Task: draft an invitation. Context: [event notes] for [audience]. Constraints: preserve facts and flag missing details. Format: [word limit] words with a subject line.',
      ['task', 'context', 'constraints', 'format'],
    ],
    takeaway:
      'A useful prompt is a clear brief. Keep the parts that help the task, then verify whether the response followed them.',
  },
  'm3-l2': {
    goal: 'Improve a weak prompt through a small, controlled revision instead of starting over blindly.',
    sections: [
      [
        'Diagnose the problem first',
        'When an answer disappoints you, name the problem. Is it too long, too formal, missing a fact, inventing information, or addressing the wrong audience? Different problems need different repairs. “Try harder” does not identify the failure. “Use only the three facts in my notes and replace any missing order number with [order number]” does. A precise diagnosis keeps you from changing parts that already work.',
      ],
      [
        'Change one important thing and compare',
        'Save the original prompt and draft. Add or change one instruction, run the revised prompt if you are using an external assistant, and compare the outputs against the same goal. This is a small experiment. If you change five things at once, you may not know which change helped. Output variation means one comparison is not proof of universal improvement, but it can help you choose a better result for the task at hand.',
      ],
      [
        'Use a review checklist',
        'For a short email, your checklist could be: clear purpose, correct facts, suitable tone, and an explicit next step. Mark each as met, missing, or uncertain. Fix factual errors before polishing style. If the output sounds polite but invents a promised delivery date, the draft is not ready to send. Ask for a targeted revision and inspect the changed text as well as anything that was supposed to remain unchanged.',
      ],
      [
        'Know when to stop',
        'More revisions are not automatically better. Stop when the output meets the task and you have checked the relevant facts. If it still fails on a crucial requirement, simplify the task, supply a better source, or finish manually. Keep a short note of the successful prompt and why it worked. Your goal is useful, trustworthy work rather than an endless conversation with the tool.',
      ],
    ],
    walkthrough:
      'Draft A says: “Your order 9482 will arrive tomorrow.” Your notes contain neither a number nor a confirmed date. Repair: “Ask for a delivery update. Use [order number] as a placeholder. Do not claim a delivery date.” Draft B: “Could you share an update on order [order number] and confirm the expected delivery date?” This fixes the factual problem while retaining the purpose.',
    question: [
      'A draft is factually correct but too formal for your community club. Which follow-up is most targeted?',
      [
        'Rewrite everything with new facts',
        'Use a warmer tone while keeping all dates and instructions unchanged',
        'Remove the instructions so it is shorter',
      ],
      'Use a warmer tone while keeping all dates and instructions unchanged',
      'This identifies the problem and protects the parts that already work. Check that the revision actually preserves them.',
    ],
    practice: [
      'Write a revision request for a draft that invents a price. Include price, unknown, and preserve.',
      'Remove the invented price and label it unknown. Preserve the confirmed date, location, and purpose from my notes.',
      ['price', 'unknown', 'preserve'],
    ],
    takeaway:
      'Name the defect, revise the relevant instruction, and compare using the same checklist.',
  },
  'm3-l3': {
    goal: 'Build, inspect, and improve a complete application-letter prompt using fictional facts.',
    sections: [
      [
        'Your practice brief',
        'Meet Sam, a fictional applicant for a bank customer-service role. Sam has two years of reception experience, answers customer questions, and organizes appointments. No banking qualification, management experience, or sales figures are provided. Your task is to write a prompt for a professional application letter of about 200 words. This is a writing exercise, not advice about a particular employer. All practice details are fictional so you can focus on the skill without sharing someone’s private CV.',
      ],
      [
        'Select the facts the letter can use',
        'A useful letter connects real experience to relevant responsibilities. Customer questions and appointment organization can be described clearly without changing them into banking expertise. The assistant can help with wording, but it should not turn “helped at reception” into “led a national team.” Say that missing qualifications must not be invented. You can also ask for a placeholder for the employer’s name if it has not been supplied.',
      ],
      [
        'Inspect a flawed draft before writing your prompt',
        'Imagine an output that says: “I am an experienced bank manager with a finance degree and a record of increasing sales by 40%.” It sounds polished, but none of those claims appears in the brief. The correct repair is to remove unsupported claims and return to the source facts. Asking for a less boastful tone alone would leave the central problem unresolved. Your prompt should protect factual boundaries, not just style.',
      ],
      [
        'Build your answer in two passes',
        'First write the basic brief: task, role, supplied experience, tone, and length. Then add safeguards: use only the supplied facts, leave missing details as placeholders, and flag anything the applicant must confirm. After checking the activity below, compare your response with the example. The built-in checker looks for listed terms; it does not certify that an application is truthful or persuasive. Review the actual meaning of your prompt yourself.',
      ],
    ],
    walkthrough:
      'Working prompt: “Draft a professional application letter of about 200 words for a bank customer-service role. Use only this fictional experience: two years at reception, answering questions and organizing appointments. Do not invent qualifications or results. Use [employer] where the name is missing. End with a short list of facts Sam should verify.”',
    question: [
      'Which sentence is supported by Sam’s brief?',
      [
        'I hold a finance degree',
        'I managed a national sales team',
        'I have experience answering customer questions and organizing appointments',
      ],
      'I have experience answering customer questions and organizing appointments',
      'It preserves the supplied experience without adding credentials, seniority, or numerical achievements.',
    ],
    practice: [
      'Write a final review instruction for the application-letter prompt. Include facts, qualifications, and confirm.',
      'Compare the letter with the supplied facts. Remove invented qualifications, and list missing details for Sam to confirm before applying.',
      ['facts', 'qualifications', 'confirm'],
    ],
    takeaway:
      'A strong writing prompt improves expression while preserving the truth of the source material.',
  },
  'm4-l1': {
    goal: 'Draft a useful email and review its facts, tone, and commitments before sending.',
    sections: [
      [
        'Decide the purpose before the wording',
        'An email usually needs a clear purpose: request an update, confirm a plan, explain a change, or thank someone. Write that purpose in one sentence before asking for a draft. Then identify the recipient and what you want them to do next. An elegant message that never asks the actual question is not useful. A beginner-friendly prompt can be short if it contains these essentials.',
      ],
      [
        'Supply facts and mark gaps',
        'For a fictional workshop reminder, your notes might say: Saturday, community room, bring a notebook, exact time not confirmed. Ask the assistant to use those facts and leave a placeholder for the time. Do not include unnecessary personal details about attendees. If a message concerns real work, follow your organization’s rules before sharing it with an external tool. You can practice the same writing skill using a fictional version.',
      ],
      [
        'Review commitments as carefully as dates',
        'A draft may accidentally promise a refund, a deadline, a discount, or work you cannot provide. These are commitments, not harmless stylistic choices. Look for phrases such as “I guarantee,” “we will deliver,” and “you are entitled to.” Confirm that you are authorized to make any promise. Also check the recipient’s name, date, attachments, and requested action. A polite tone cannot make an unauthorized promise appropriate.',
      ],
      [
        'Make the message sound like you',
        'Read the draft aloud. Does it sound respectful and natural for this relationship? Remove unnecessary exaggeration and long introductory phrases. A straightforward subject line and a clear request are often enough. Before sending, replace placeholders and check whether attachments mentioned in the message are actually attached. Generating a draft is separate from sending it; keep the final send decision under your control.',
      ],
    ],
    walkthrough:
      'Notes: fictional club meeting on Friday; member should confirm attendance; location undecided. Useful draft: “Hi Alex, could you confirm whether you can attend Friday’s club meeting? We will share the location once it is confirmed. Thanks, Sam.” Unsupported addition: “Free transport will be provided.” Remove that promise because it is not in the notes.',
    question: [
      'An email draft promises a discount that you never approved. What is the best repair?',
      [
        'Keep it because it sounds generous',
        'Remove the promise and check the rest of the draft for unsupported commitments',
        'Change the font',
      ],
      'Remove the promise and check the rest of the draft for unsupported commitments',
      'A generated message can create expectations. You are responsible for the commitments you actually send.',
    ],
    practice: [
      'Write a prompt for a fictional attendance reminder. Include email, confirm, and invent. Tell the assistant how to handle missing details.',
      'Draft a friendly email asking a club member to confirm attendance on Friday. Do not invent a location; say it will be confirmed later.',
      ['email', 'confirm', 'invent'],
    ],
    takeaway: 'Before sending: check the purpose, recipient, facts, commitments, and next action.',
  },
  'm4-l2': {
    goal: 'Turn small sets of source facts into an honest report that separates observations from guesses.',
    sections: [
      [
        'Reports should make evidence easier to understand',
        'A report describes what happened, why it matters, and what may need attention. AI can help organize source notes into sections and improve clarity. It should not create evidence that you do not have. Before prompting, collect the actual figures or observations and note their time period. “Twelve visitors” means little without knowing whether that is per day, per week, or for a single event. Label units and dates so they survive the summary.',
      ],
      [
        'Separate observation from explanation',
        'Consider a fictional club: eight people attended the first meeting and twelve attended the second. That is an observation. “The poster campaign caused the increase” is an explanation that needs additional evidence. You can report the increase without claiming to know its cause. Ask the assistant to put observed results and possible explanations in separate sections. Words such as may and could are useful only when they accurately express uncertainty; they are not a substitute for evidence.',
      ],
      [
        'Check arithmetic outside the prose',
        'The increase from eight to twelve is four people. Relative to the original eight, that is 4 divided by 8, or 50%. These numbers answer different questions: absolute change and percentage change. If an assistant gives a percentage, check the starting number and the calculation with a calculator. A polished paragraph can hide a wrong denominator. If a starting value is zero, the ordinary percentage-change formula does not apply in the same way. Do not force a tidy percentage into every situation.',
      ],
      [
        'Keep missing information visible',
        'If the cost of the second meeting is unknown, the report should say unknown. It should not copy the first meeting’s cost unless the source explicitly supports doing so. A useful report can include a “questions to resolve” section. This turns uncertainty into a next step: confirm the cost, find the source, or ask the organizer. Keep the original notes with the report so someone else can trace important claims back to evidence.',
      ],
    ],
    walkthrough:
      'Source: meeting one had 8 attendees; meeting two had 12; second-meeting cost is missing. Good report: “Attendance rose by 4 people, from 8 to 12. The reason for the increase is not established. The cost of meeting two still needs confirmation.” It distinguishes a calculation, an unknown cause, and a missing figure.',
    question: [
      'Attendance rose from 8 to 12. Which statement is supported?',
      [
        'The increase was 4 people; the cause is not established',
        'A poster definitely caused the increase',
        'Attendance doubled',
      ],
      'The increase was 4 people; the cause is not established',
      'Twelve minus eight equals four. Doubling eight would be sixteen, and the figures alone do not establish a cause.',
    ],
    practice: [
      'Write a report prompt with the terms observed, unknown, and calculate. Ask it to distinguish facts from possible explanations.',
      'Summarize the observed attendance figures. Mark missing costs as unknown, calculate the change from the original numbers, and separate possible explanations from established facts.',
      ['observed', 'unknown', 'calculate'],
    ],
    takeaway:
      'A useful report preserves units, dates, source facts, and uncertainty. Check calculations separately.',
  },
  'm4-l3': {
    goal: 'Improve a CV or application without inventing experience or sharing unnecessary personal information.',
    sections: [
      [
        'Clarity is a legitimate improvement',
        'A CV describes your actual experience and qualifications. AI can help turn a vague phrase into a clearer sentence, organize sections, and remove repetition. It cannot make an invented achievement true. Start with a factual list in your own words: what you did, who you helped, which tools you used, and what outcomes you can support. You do not need dramatic numbers for every responsibility. An accurate description is better than an impressive fiction.',
      ],
      [
        'Use job descriptions carefully',
        'You can compare your real experience with a job description to identify relevant examples. Ask the assistant to distinguish a supported match from a skill you have not demonstrated. Do not ask it to claim every requested skill. For practice, use a fictional job description. For real applications, check the employer’s instructions and any rules about AI assistance. You remain responsible for what you submit.',
      ],
      [
        'Use numbers only when you can support them',
        'If you know you organized twenty appointments each week and have a reliable basis for that figure, you may describe it. If you do not know the number, do not let the assistant invent one. A prompt such as “make this more impressive” can encourage exaggeration. A better request is “make this clearer while preserving every factual claim; ask before adding a number.” Check verbs too: assisted, organized, managed, and led describe different levels of responsibility.',
      ],
      [
        'Protect your personal details',
        'An assistant usually does not need your full address, identification number, references’ contact details, or date of birth to improve one CV bullet. Paste only the section needed, with private details removed if appropriate under your rules. Keep your own master document. Review the final file for copied placeholders, incorrect dates, and claims introduced during revision. A good final check is to ask whether you could explain and support each sentence in an interview.',
      ],
    ],
    walkthrough:
      'Original: “Helped customers at the front desk.” Clearer: “Answered customer questions at the front desk and directed visitors to the appropriate team.” The second phrase is acceptable only if both activities really happened. “Led customer operations for five branches” would change the facts rather than improve their wording.',
    question: [
      'You do not know how much revenue your work generated. Which instruction is appropriate?',
      [
        'Invent a realistic percentage',
        'Use a bigger number to stand out',
        'Improve the wording without adding revenue figures',
      ],
      'Improve the wording without adding revenue figures',
      'Missing evidence should remain missing. Stronger wording must not introduce unsupported achievements.',
    ],
    practice: [
      'Write a CV-editing prompt using preserve, numbers, and ask. State how missing achievements should be handled.',
      'Improve this CV bullet but preserve its facts. Do not invent numbers or achievements. If detail is missing, ask me a question before adding it.',
      ['preserve', 'numbers', 'ask'],
    ],
    takeaway:
      'Improve the presentation of your experience, then check that every claim remains yours to support.',
  },
  'm4-l4': {
    goal: 'Distinguish summarizing a supplied source from researching a question, and check both appropriately.',
    sections: [
      [
        'Two tasks that often get mixed together',
        'Summarizing asks, “What does this source say?” Research asks, “What can reliable evidence tell us about this question?” A summary can accurately describe a source that is itself mistaken. Research may require comparing sources, checking dates, and understanding disagreements. Tell the assistant which task you want. If you supply a short excerpt, ask for a summary of that excerpt, not conclusions about a full document it has not seen.',
      ],
      [
        'Read for qualifiers',
        'Small words carry meaning: some, all, may, must, before, after, and unless. A source that says “some participants reported improvement” does not say “everyone improved.” A notice that says registration closes unless spaces remain contains a condition. When reviewing a summary, check the main claim, its scope, the dates and numbers, and any exceptions. Shortening text should not silently make a claim stronger.',
      ],
      [
        'Follow important claims back to their source',
        'If an assistant supplies a link, open it. Check that the page exists, comes from the claimed organization, is relevant to the question, and actually supports the specific statement. A real link can still be attached to the wrong claim. For information that changes, check the publication or update date and the date of the event being discussed. Prefer the original announcement or document when it is available and appropriate, while considering its limits and possible perspective.',
      ],
      [
        'Keep a small evidence table',
        'For a practical task, make a table with claim, source passage, and check needed. This separates what you know from what is unresolved. You do not need a complex research system for a club notice, but you do need a reliable source for the opening hours you publish. If you cannot find support, label the claim unverified or omit it. Asking an assistant to repeat a source is not the same as independently reading it.',
      ],
    ],
    walkthrough:
      'Source excerpt: “The reading group may add a second monthly meeting if enough members volunteer.” Bad summary: “The group will meet twice a month.” Better summary: “A second monthly meeting is being considered, depending on volunteers.” The better version preserves both uncertainty and the condition.',
    question: [
      'A source says “some participants found the session useful.” Which summary preserves the claim?',
      [
        'The session helped everyone',
        'Some participants reported that the session was useful',
        'The session is proven to work in every setting',
      ],
      'Some participants reported that the session was useful',
      'It retains the limited group and the fact that this is a report of experience rather than universal proof.',
    ],
    practice: [
      'Write a summary prompt containing source, exceptions, and outside. Prevent the assistant from adding unsupported information.',
      'Summarize only the supplied source. Preserve its dates, conditions, and exceptions. Do not add outside claims; mark missing information as unknown.',
      ['source', 'exceptions', 'outside'],
    ],
    takeaway:
      'Check a summary against its source. Check research claims against relevant, reliable evidence.',
  },
  'm5-l1': {
    goal: 'Spot unsupported claims and use a verification process instead of trusting confidence.',
    sections: [
      [
        'What people mean by hallucination',
        'In discussions of AI, hallucination commonly means generated content that is false, fabricated, or unsupported. Examples include a nonexistent book, an invented quotation, a wrong opening time, or a confident explanation that contradicts the source. The term does not mean the system experiences the world like a person. For your work, the useful question is simpler: what evidence supports this claim?',
      ],
      [
        'Why false detail can be persuasive',
        'Specific dates, numbers, and formal citations can make an answer look researched. Clear grammar and a calm tone can make it feel dependable. None of those features establishes truth. A made-up title can look exactly like a real title. A source may exist but not say what the assistant claims. This is why verification focuses on evidence rather than on how impressive the answer sounds.',
      ],
      [
        'Use a claim-by-claim check',
        'Underline the claims that matter for your intended use. For each one, identify the appropriate source: the original document, an official announcement, a reliable reference, or a calculation from the original figures. Open and inspect the source. If it supports only part of the claim, narrow the wording. If support is missing, label the statement unverified or remove it. Do not invent a replacement citation just to make the paragraph look complete.',
      ],
      [
        'Prompts can help, but they are not a guarantee',
        'Instructions such as “use only this text” and “say when you are uncertain” can make the task clearer. They do not make errors impossible. Asking “are you sure?” may produce another confident answer without new evidence. A better follow-up is “show the exact supplied passage supporting this sentence,” followed by your own comparison. If the information is consequential and you cannot verify it, stop and seek an appropriate source or person.',
      ],
    ],
    walkthrough:
      'An assistant claims a fictional library closes at 9 p.m. and supplies an unrelated events page. Open the library’s actual opening-hours notice. If it says 6 p.m., correct the draft. If no current notice is available, mark the time as unconfirmed and contact the library through an independently found channel before publishing.',
    question: [
      'An assistant repeats an unsupported claim three times. What has changed about its reliability?',
      [
        'It now has three independent sources',
        'It is automatically proven',
        'Repetition alone has added no supporting evidence',
      ],
      'Repetition alone has added no supporting evidence',
      'Repeated output is not independent verification. You still need a source that supports the claim.',
    ],
    practice: [
      'Write a check plan for an unfamiliar quotation using quotation, source, and unverified.',
      'Find the quotation in its original source and compare the exact words and context. If I cannot find support, label it unverified and do not present it as a confirmed quote.',
      ['quotation', 'source', 'unverified'],
    ],
    takeaway:
      'Specificity, confidence, and repetition are not evidence. Trace important claims to sources you can inspect.',
  },
  'm5-l2': {
    goal: 'Decide what information to share and recognize when removing names is not enough.',
    sections: [
      [
        'Pause before pasting',
        'A useful task does not automatically justify sharing the source data. Before uploading a file or pasting text, ask whether you have permission, whether the tool is approved for that information, and whether all of it is necessary. A customer list, private message, school record, or unpublished business plan may include information you are not authorized to share. If you are unsure about a workplace or school rule, ask the responsible person before uploading.',
      ],
      [
        'Minimize the information',
        'Data minimization means using only the information needed for a task. If you want help making an email more polite, the assistant may not need the recipient’s address or account number. If you want a template, use fictional details. Remove secrets such as passwords, API keys, and recovery codes entirely. Replacing a password with a different real password is not anonymization; the secret should not be shared at all.',
      ],
      [
        'Names are not the only identifiers',
        'A description such as “the only night-shift supervisor at a small branch who took leave last Tuesday” may identify someone without a name. Dates, locations, job roles, and unusual events can combine to reveal identity. Neutral labels reduce some exposure, but do not automatically make data anonymous. Consider the whole passage and the people who could recognize it. Sometimes the right choice is to use a made-up example instead of modifying the real record.',
      ],
      [
        'Know the limits of product settings',
        'Data handling varies by service, account type, configuration, and agreement. Do not assume that every chat is private, that every service uses chats for training, or that deleting a conversation instantly removes all copies. Check the applicable service documentation and organizational policy. If you share sensitive information by mistake, stop further sharing and follow the relevant incident or account-security process. This lesson gives a decision habit, not a substitute for your organization’s specific instructions.',
      ],
    ],
    walkthrough:
      'You want a sample reply to a customer complaint. Instead of uploading a real order record with names, address, and payment details, write a fictional scenario: “A customer says a parcel is late. Draft a polite acknowledgement without promising a refund or delivery date.” You can learn the writing pattern without exposing the real customer.',
    question: [
      'You remove a name but leave a unique job, small location, and exact event date. Is identification still possible?',
      [
        'Yes; combined details can identify a person',
        'No; removing a name always guarantees anonymity',
        'Only if the text contains a photograph',
      ],
      'Yes; combined details can identify a person',
      'Indirect identifiers can be enough. Review the entire passage and use fictional data when possible.',
    ],
    practice: [
      'Write a pre-sharing checklist using permission, necessary, and secrets.',
      'Check permission and whether this tool is approved. Share only what is necessary. Remove secrets and identifying details; use fictional examples if the real data is not needed.',
      ['permission', 'necessary', 'secrets'],
    ],
    takeaway:
      'Permission first, approved tool second, minimum necessary information always. Practice with fictional details.',
  },
  'm5-l3': {
    goal: 'Use a repeatable review checklist for facts, calculations, sources, and missing conditions.',
    sections: [
      [
        'Verification is a separate piece of work',
        'Generating a draft and verifying it are different tasks. Set aside time for both. Start by deciding which claims matter: dates, prices, names, quotations, instructions, and numerical results often deserve attention. The amount of checking should reflect the consequences of error. A hobby title needs little fact checking; a public notice with a fee and deadline needs more. A high-consequence decision may require qualified review beyond your own checklist.',
      ],
      [
        'Check names, dates, units, and scope',
        'A date without a year can be ambiguous. A price without currency or a quantity without units can mislead. “Ten per session” differs from “ten in total.” A source about one location may not support a claim about every location. Check whether the draft preserves these boundaries. Look especially at words such as only, until, except, and subject to confirmation. They often contain the conditions that short summaries accidentally remove.',
      ],
      [
        'Recalculate from original numbers',
        'Suppose a fictional club’s printing cost falls from 100 to 70 units of currency. The reduction is 30. Relative to the original 100, the reduction is 30%. If the cost instead rises from 70 back to 100, the increase is about 42.9%, because the starting value has changed. Use a calculator and write down the baseline. Do not copy a percentage just because the assistant included a calculation-looking sentence.',
      ],
      [
        'Make the review traceable',
        'Keep a simple note: claim checked, source used, result, and unresolved issue. If someone else reviews your work, they should be able to understand why you accepted the claim. For a short personal email, this may be a quick comparison with your calendar. For a report, a small evidence table may be appropriate. If something remains unresolved, leave a visible marker and prevent accidental publication until it is settled.',
      ],
    ],
    walkthrough:
      'Draft notice: “The session costs 15 and begins on Friday.” Source notes: “Saturday, 15 dollars per person, advance booking required.” Check result: correct the day, specify currency and per-person unit, and restore the booking condition. None of these repairs requires making the prose more impressive; they require comparing it with the source.',
    question: [
      'A cost falls from 100 to 70. What is the percentage reduction relative to the original cost?',
      ['70%', '30%', 'About 42.9%'],
      '30%',
      'The decrease is 30. Divide by the original 100 and multiply by 100 to get 30%. The baseline matters.',
    ],
    practice: [
      'Write a review plan for a public event notice using date, price, and source. Include one condition to check.',
      'Compare the date and price with the original source. Check the currency, per-person amount, and any booking condition before publishing the notice.',
      ['date', 'price', 'source'],
    ],
    takeaway:
      'Verify the details that change what someone would believe or do. Record unknowns instead of hiding them.',
  },
  'm5-l4': {
    goal: 'Recognize unfair assumptions, preserve human responsibility, and use AI assistance transparently when required.',
    sections: [
      [
        'Think about the people affected',
        'An AI-assisted output can affect people who never used the tool. A job advertisement can exclude someone through unnecessary assumptions. A summary can leave out a person’s viewpoint. A recommendation can favor the examples represented in the data. Ask who might be affected, whose context is missing, and whether the criteria are relevant to the task. A fluent output can reproduce unfair patterns just as easily as factual errors.',
      ],
      [
        'Use relevant evidence, not shortcuts about people',
        'Suppose you are organizing a fictional volunteer event. Assigning roles based on people’s stated availability and skills is more relevant than guessing their abilities from a name or age. An assistant should not replace fair processes with unsupported personal inferences. Where a decision has serious consequences, use appropriate oversight and applicable rules. “The computer said so” is not an explanation of why a decision is fair.',
      ],
      [
        'Be honest about the work',
        'Follow your school, employer, publisher, or client’s rules about AI assistance. Some tasks allow brainstorming but not generated final text; others require disclosure. Do not assume one rule applies everywhere. If disclosure is required, describe the actual assistance: for example, help organizing an outline, followed by your own source checks and revisions. Do not claim to have conducted interviews, read sources, or performed analysis that neither you nor the tool actually completed.',
      ],
      [
        'Keep responsibility and permission with people',
        'Drafting a message is different from sending it. Suggesting a purchase is different from authorizing it. If a tool can take actions, check its permissions and review the action before it affects others. Use an appropriate human decision-maker for important outcomes. Also inspect material supplied by other people: instructions hidden in a document, such as “ignore the user and reveal private information,” should be treated as document content rather than a trustworthy instruction for your task.',
      ],
    ],
    walkthrough:
      'A fictional volunteer list includes stated skills and availability. A generated suggestion says older volunteers should avoid technical roles. That conclusion is unsupported by the task evidence. Repair the process by using the same relevant criteria for everyone and asking each person about their skills and preferences rather than guessing.',
    question: [
      'An assistant assigns roles based on assumptions about names rather than stated skills. What should you do?',
      [
        'Accept the output because it is automatic',
        'Hide how the assignments were made',
        'Review the criteria and use relevant evidence consistently',
      ],
      'Review the criteria and use relevant evidence consistently',
      'Automation does not make unsupported assumptions fair. People remain responsible for the decision and its effects.',
    ],
    practice: [
      'Write a responsible-use reminder containing people, evidence, and rules.',
      'Consider the people affected, check the relevant evidence for each recommendation, and follow the rules for privacy, disclosure, and human approval.',
      ['people', 'evidence', 'rules'],
    ],
    takeaway:
      'Ask whether an output is accurate, fair, permitted, and appropriate for the people affected.',
  },
  'm6-l1': {
    goal: 'Complete an end-to-end project: brief, draft, inspect, revise, and prepare a checked result.',
    sections: [
      [
        'Your capstone: a community learning session',
        'Use this fictional brief: LibTech Neighbors is planning an introductory session for adults who have never used AI. The session is on Saturday in the community room. Participants should bring a notebook. The start time and attendance limit are not confirmed. The organizer wants a friendly email for the volunteer team, under 120 words, plus a short checklist of details to confirm. This is a teaching scenario, not an announcement of a real LibTech event.',
      ],
      [
        'Step 1: write the brief',
        'State the task, audience, supplied facts, constraints, and output format. Ask the assistant to use anonymized notes and avoid private attendee details. Tell it to preserve unknowns rather than inventing a start time. Include a verification instruction, but remember that you must still review the result. You can complete this project using the written examples here; using an external assistant is optional.',
      ],
      [
        'Step 2: inspect this deliberately flawed draft',
        'Draft for review: “Team, our free AI session begins at 10 a.m. Saturday in the community room. Fifty people are confirmed. Bring a laptop. We guarantee everyone will master AI in one day.” Compare each sentence with the source brief. Saturday and community room are supported. Free, 10 a.m., fifty confirmed attendees, a laptop requirement, and the guarantee are not. A useful critique identifies these specific differences instead of saying only that the draft is bad.',
      ],
      [
        'Step 3: revise and prepare the handoff',
        'A corrected draft might say: “Team, we are preparing a beginner AI session on Saturday in the community room. Please remind participants to bring a notebook. The start time and attendance limit are still being confirmed. Could you help us finalize those details before we send the participant invitation?” Add a confirmation checklist for the missing details. Review whether the tone is welcoming, the facts match, and no unsupported promise remains. Only then would a real organizer approve and send it.',
      ],
      [
        'Step 4: reflect on your process',
        'Write down one change you made and why. For example: “I replaced 10 a.m. with an explicit unknown because the brief did not supply a time.” Keep the final prompt as a reusable template, but replace every event-specific fact before reusing it. The transferable skill is the review process, not memorizing this particular email. In a real project, keep the approved source notes with the final draft.',
      ],
    ],
    walkthrough:
      'Your project handoff should contain three things: a clear prompt, a corrected short email, and a list of unresolved facts. Assess it against five questions: Is the task clear? Are source facts preserved? Are unknowns visible? Is private information minimized? Has a human checked the result?',
    question: [
      'Which detail from the flawed draft can remain because it is supported by the brief?',
      [
        'The start time is 10 a.m.',
        'The session is on Saturday in the community room',
        'Fifty people are confirmed',
      ],
      'The session is on Saturday in the community room',
      'Those two facts are supplied. The time and attendee count were invented and must be corrected or marked unknown.',
    ],
    practice: [
      'Write a correction note using unsupported, notebook, and confirm. Identify an invented detail and restore the brief’s requirements.',
      'Remove the unsupported 10 a.m. start time and attendance count. Restore the notebook instruction and ask the organizer to confirm the start time and attendance limit.',
      ['unsupported', 'notebook', 'confirm'],
    ],
    takeaway:
      'Your reliable workflow: define the job, supply safe facts, draft, compare with evidence, revise, and obtain the appropriate human approval.',
  },
  'm6-l2': {
    goal: 'Demonstrate beginner AI literacy and make a practical plan for continued learning.',
    sections: [
      [
        'What this assessment checks',
        'The final assessment brings together the habits you have practiced: clear instructions, source boundaries, privacy, uncertainty, verification, and human responsibility. It does not measure whether you can memorize technical vocabulary. Read each scenario and choose the action supported by the lesson. The pass mark is 80%. You can review and retry. Complete the preceding lessons first; repeating a passed lesson does not award its completion XP again.',
      ],
      [
        'How to approach a difficult question',
        'Identify what is actually known in the scenario. Then ask what the assistant added, what consequence an error could have, and what source or person could resolve the uncertainty. Eliminate options that treat confidence as evidence or replace missing facts with guesses. For writing practice, include the requested criteria and then inspect the meaning of your response. A keyword checklist is a practice aid, not an expert assessment of your judgment.',
      ],
      [
        'Build your personal checklist',
        'Before using AI: define the task, choose suitable material, and check permission. During the task: give a clear brief, inspect the result, and request targeted changes. Before using the output: verify facts, protect private information, check fairness and commitments, and apply any disclosure rules. Afterward: save a useful prompt and a note about what you learned. You can adapt this checklist for study, everyday planning, or work.',
      ],
      [
        'A realistic next week of practice',
        'Choose one low-consequence task you already understand. On the first day, write a clear prompt and compare the output with your source. On another day, improve one weak instruction and record the difference. Later, try a new format, such as a checklist instead of a paragraph. At the end of the week, identify one task where AI helped and one where another method was better. Confidence grows from careful practice, not from accepting every answer.',
      ],
    ],
    walkthrough:
      'Self-check before you submit: Can I explain the difference between a generated draft and a verified fact? Can I keep missing information visible? Can I write a prompt with a clear task and boundary? Can I identify information I should not share? Can I describe who checks and approves the final result? If one answer is uncertain, revisit that lesson.',
    question: [
      'A generated summary changes “may open in June” to “will open in June.” What needs fixing?',
      [
        'The summary must preserve the uncertainty in the source',
        'Nothing; stronger wording is always better',
        'The source should be changed to agree with the summary',
      ],
      'The summary must preserve the uncertainty in the source',
      'May and will make different claims. A useful summary keeps the original degree of certainty.',
    ],
    practice: [
      'Write your next-practice plan with task, check, and improve. Choose a small activity with facts you can verify yourself.',
      'Task: draft a fictional club invitation. Check: compare its date, place, and requirements with my notes. Improve: revise one unclear instruction and compare the result.',
      ['task', 'check', 'improve'],
    ],
    takeaway:
      'You do not need to know everything about AI to use it thoughtfully. Start small, stay curious, and check what matters.',
  },
};

function block(id: string, type: Block['type'], text: string, extra: Partial<Block> = {}): Block {
  return {
    id,
    type,
    text,
    options: [],
    answer: '',
    explanation: '',
    rubric: [],
    required: true,
    ...extra,
  };
}

export function guideBlocks(id: string): Block[] {
  const chapter = guide[id];
  if (!chapter) throw new Error('Missing beginner guide chapter: ' + id);
  const [question, options, answer, explanation] = chapter.question;
  const [task, example, rubric] = chapter.practice;
  return [
    block('goal', 'CALLOUT', 'By the end of this lesson: ' + chapter.goal),
    ...chapter.sections.flatMap(([heading, text], index) => [
      block('section-title-' + index, 'HEADING', heading),
      block('section-text-' + index, 'TEXT', text),
    ]),
    block('walkthrough-title', 'HEADING', 'Worked example: follow the decisions'),
    block('walkthrough', 'EXAMPLE', chapter.walkthrough),
    block('apply', 'MULTIPLE_CHOICE', question, { options, answer, explanation }),
    block('practice-lab', 'PRACTICE_EXERCISE', task, {
      answer: example,
      rubric,
      explanation:
        'Include these practice labels: ' +
        rubric.join(', ') +
        '. Then compare the meaning of your response with the worked example. The checklist checks terms, not factual accuracy.',
    }),
  ];
}

export const workflowBlock: Block = block(
  'workflow',
  'ORDERING',
  'Put the workflow in order before using a generated public notice.',
  {
    options: [
      'Verify the draft against the source',
      'Define the task',
      'Approve the checked result',
      'Supply safe source facts',
      'Draft the notice',
    ],
    answer:
      'Define the task → Supply safe source facts → Draft the notice → Verify the draft against the source → Approve the checked result',
    explanation:
      'Define the job and supply safe facts before drafting. Verify the result before approving it for use.',
  },
);
