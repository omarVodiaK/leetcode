export interface QuestionSummary {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  languages: string[]
}

export interface Example {
  input: string
  output: string
  explanation?: string
}

export interface TestCase {
  id: number
  description: string
  input: string
  expected_output: string
  hidden: boolean
}

export interface Question {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  languages: string[]
  description: string
  constraints: string[]
  examples: Example[]
  starter_code: Record<string, string>
  test_cases: TestCase[]
}

export interface TestResult {
  test_case_id: number
  description: string
  passed: boolean
  runtime_ms: number
  hidden: boolean
  actual_output: string | null
  expected_output: string | null
}

export type SubmitStatus =
  | 'accepted'
  | 'partial'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'runtime_error'

export interface SubmitResponse {
  status: SubmitStatus
  results: TestResult[]
  total: number
  passed: number
}

export type SolveStatus = 'not_started' | 'attempted' | 'solved'
export type Progress = Record<string, SolveStatus>
