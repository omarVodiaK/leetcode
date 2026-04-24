import axios from 'axios'
import type { Question, QuestionSummary, SubmitResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
})

export async function fetchQuestions(): Promise<QuestionSummary[]> {
  const { data } = await api.get<QuestionSummary[]>('/questions')
  return data
}

export async function fetchQuestion(id: string): Promise<Question> {
  const { data } = await api.get<Question>(`/questions/${id}`)
  return data
}

export async function submitCode(
  questionId: string,
  language: string,
  code: string,
  mode: 'run' | 'submit'
): Promise<SubmitResponse> {
  const { data } = await api.post<SubmitResponse>('/submit', {
    question_id: questionId,
    language,
    code,
    mode,
  })
  return data
}
