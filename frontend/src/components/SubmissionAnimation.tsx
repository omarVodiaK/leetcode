import { useEffect, useState } from 'react'
import correctImg from '../assets/correct.png'
import wrongImg from '../assets/wrong.png'
import type { SubmitStatus } from '../types'

interface Props {
  status: SubmitStatus | null
  trigger: number // increment to re-trigger
}

export default function SubmissionAnimation({ status, trigger }: Props) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!status || trigger === 0) return
    setFading(false)
    setVisible(true)
    const hideTimer = setTimeout(() => setFading(true), 2200)
    const removeTimer = setTimeout(() => setVisible(false), 2800)
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [trigger])

  if (!visible || !status) return null

  const isCorrect = status === 'accepted'

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      style={{ transition: 'opacity 0.5s', opacity: fading ? 0 : 1 }}
    >
      <img
        src={isCorrect ? correctImg : wrongImg}
        alt={isCorrect ? 'Correct!' : 'Wrong answer'}
        className={isCorrect ? 'correct-sticker' : 'wrong-sticker'}
        style={{ width: 320, maxWidth: '70vw' }}
      />

      <style>{`
        @keyframes flyIn {
          0%   { transform: translateX(120vw) rotate(20deg) scale(0.5); opacity: 0; }
          60%  { transform: translateX(-20px) rotate(-4deg) scale(1.08); opacity: 1; }
          75%  { transform: translateX(10px) rotate(2deg) scale(0.97); }
          88%  { transform: translateX(-6px) rotate(-1deg) scale(1.02); }
          100% { transform: translateX(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%   { transform: translateX(0) rotate(0deg); opacity: 0; scale: 0.3; }
          10%  { opacity: 1; scale: 1; }
          20%  { transform: translateX(-18px) rotate(-6deg); }
          35%  { transform: translateX(18px) rotate(6deg); }
          50%  { transform: translateX(-14px) rotate(-4deg); }
          65%  { transform: translateX(14px) rotate(4deg); }
          80%  { transform: translateX(-8px) rotate(-2deg); }
          90%  { transform: translateX(8px) rotate(2deg); }
          100% { transform: translateX(0) rotate(0deg); opacity: 1; }
        }
        .correct-sticker {
          animation: flyIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          filter: drop-shadow(0 8px 32px rgba(0,184,163,0.5));
        }
        .wrong-sticker {
          animation: shake 0.9s ease-out forwards;
          filter: drop-shadow(0 8px 32px rgba(239,71,67,0.5));
        }
      `}</style>
    </div>
  )
}
