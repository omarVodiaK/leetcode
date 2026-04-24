import Editor from '@monaco-editor/react'

interface Props {
  language: string
  value: string
  onChange: (value: string) => void
}

const MONACO_LANG_MAP: Record<string, string> = {
  python: 'python',
  bash: 'shell',
  go: 'go',
}

export default function CodeEditor({ language, value, onChange }: Props) {
  return (
    <Editor
      height="100%"
      language={MONACO_LANG_MAP[language] ?? 'plaintext'}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: language !== 'go',
        padding: { top: 12, bottom: 12 },
      }}
    />
  )
}
