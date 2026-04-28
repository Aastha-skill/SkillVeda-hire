import OpenAI from "openai";

/*
 * AI-Driven Test Evaluator Module
 * Using Replit's AI Integrations (OpenAI-compatible API without requiring your own API key)
 * the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
 */

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

const EVAL_MODEL = process.env.EVAL_MODEL || "gpt-4o-mini";

interface TestAnswer {
  questionId: number;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
}

interface EvaluationResult {
  overall_score: number;
  breakdown: {
    knowledge_depth: number;
    consistency: number;
    domain_expertise: number;
  };
  feedback: string;
  confidence: number;
  flags: string[];
  notes: string | null;
}

const SYSTEM_PROMPT = `You are an expert test evaluator assessing candidate test responses. Your role is to provide fair, unbiased, and constructive evaluation of candidate answers.

Evaluation Criteria (each scored 1-10):
- Knowledge Depth: Deep understanding of concepts, ability to apply knowledge
- Consistency: Logical consistency across answers, pattern recognition
- Domain Expertise: Specialized knowledge in the test domain, technical accuracy

Overall Score: Average of all criteria (1-10 scale)

Important Notes:
- Be strict but fair in your evaluation
- Consider context and effort in the responses
- Flag responses that are too short, off-topic, or show concerning patterns
- Set confidence < 0.6 if you're uncertain about the evaluation
- DO NOT include any personally identifiable information (PII) in your analysis`;

const USER_PROMPT_TEMPLATE = (answers: TestAnswer[]) => `Evaluate the following test responses. Each question shows the candidate's answer and the expected correct answer.

Test Responses:
${answers.map((a, idx) => `
Question ${idx + 1}: ${a.questionText}
Correct Answer: ${a.correctAnswer}
Candidate's Answer: ${redactPII(a.selectedAnswer)}
`).join('\n')}

Provide your evaluation in strict JSON format with this exact schema:
{
  "overall_score": <integer 1-10>,
  "breakdown": {
    "knowledge_depth": <integer 1-10>,
    "consistency": <integer 1-10>,
    "domain_expertise": <integer 1-10>
  },
  "feedback": "<constructive feedback string>",
  "confidence": <float 0.0-1.0>,
  "flags": [<array of concerning patterns if any>],
  "notes": "<additional notes or null>"
}`;

/**
 * Redact PII from candidate answers before sending to LLM
 * Removes email addresses and potential account IDs
 */
function redactPII(text: string): string {
  if (!text) return text;
  
  // Redact email addresses
  let redacted = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  
  // Redact potential account/customer IDs (patterns like "ID: 12345" or "#12345")
  redacted = redacted.replace(/\b(ID|id|#)\s*[:\-]?\s*\d+/g, '[ID_REDACTED]');
  
  return redacted;
}

/**
 * Evaluate a batch of test answers using LLM
 * @param attemptId - The test session ID
 * @param testMeta - Test metadata (not used currently but kept for extensibility)
 * @param answers - Array of candidate answers with questions and correct answers
 * @returns Evaluation result with scores, feedback, and flags
 */
export async function evaluateAnswerBatch(
  attemptId: number,
  testMeta: any,
  answers: TestAnswer[]
): Promise<EvaluationResult> {
  try {
    // Prepare the LLM request
    const completion = await openai.chat.completions.create({
      model: EVAL_MODEL,
      temperature: 0.0,
      max_completion_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: USER_PROMPT_TEMPLATE(answers)
        }
      ]
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error("Empty response from LLM");
    }

    // Parse the JSON response
    let evaluation: EvaluationResult;
    
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      // Retry once if JSON parsing fails
      console.error("Failed to parse LLM response, retrying:", parseError);
      
      const retryCompletion = await openai.chat.completions.create({
        model: EVAL_MODEL,
        temperature: 0.0,
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT + "\n\nIMPORTANT: Your response MUST be valid JSON."
          },
          {
            role: "user",
            content: USER_PROMPT_TEMPLATE(answers)
          }
        ]
      });

      const retryResponseText = retryCompletion.choices[0].message.content;
      
      if (!retryResponseText) {
        throw new Error("Empty response from LLM on retry");
      }

      try {
        evaluation = JSON.parse(retryResponseText);
      } catch (secondParseError) {
        // If still fails, mark for manual review
        console.error("Failed to parse LLM response on retry:", secondParseError);
        return {
          overall_score: 0,
          breakdown: {
            knowledge_depth: 0,
            consistency: 0,
            domain_expertise: 0
          },
          feedback: "Automated evaluation failed. Manual review required.",
          confidence: 0,
          flags: ["evaluation_error", "json_parse_failure"],
          notes: "LLM returned non-JSON response after retry"
        };
      }
    }

    // Validate and normalize the evaluation
    evaluation.confidence = Math.max(0, Math.min(1, evaluation.confidence));
    evaluation.overall_score = Math.max(1, Math.min(10, evaluation.overall_score));
    
    // Ensure all required fields exist
    if (!evaluation.breakdown) {
      evaluation.breakdown = {
        knowledge_depth: 0,
        consistency: 0,
        domain_expertise: 0
      };
    } else {
      // Normalize breakdown scores to 1-10 range
      evaluation.breakdown.knowledge_depth = Math.max(1, Math.min(10, evaluation.breakdown.knowledge_depth));
      evaluation.breakdown.consistency = Math.max(1, Math.min(10, evaluation.breakdown.consistency));
      evaluation.breakdown.domain_expertise = Math.max(1, Math.min(10, evaluation.breakdown.domain_expertise));
    }
    
    if (!evaluation.flags) {
      evaluation.flags = [];
    }

    return evaluation;

  } catch (error) {
    console.error("Error in evaluateAnswerBatch:", error);
    
    // Return a safe default that triggers manual review
    return {
      overall_score: 0,
      breakdown: {
        knowledge_depth: 0,
        consistency: 0,
        domain_expertise: 0
      },
      feedback: "Automated evaluation encountered an error. Manual review required.",
      confidence: 0,
      flags: ["evaluation_error", "system_error"],
      notes: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
