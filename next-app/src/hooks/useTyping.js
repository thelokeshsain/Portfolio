import { useState, useEffect } from 'react'
export default function useTyping(words, speed=75, delSpeed=45, pause=1900) {
  const [text, setText] = useState('')
  const [wi, setWi] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[wi % words.length]
    const t = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1))
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), pause)
      } else {
        setText(word.slice(0, text.length - 1))
        if (text.length === 1) { setDeleting(false); setWi(i => i + 1) }
      }
    }, deleting ? delSpeed : speed)
    return () => clearTimeout(t)
  }, [text, deleting, wi, words, speed, delSpeed, pause])
  return text
}
