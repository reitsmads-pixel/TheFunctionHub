import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, PROVINCES } from '../data/taxonomy'

interface Props {
  initialQ?: string
  initialCategory?: string
  initialProvince?: string
}

export default function SearchBar({ initialQ = '', initialCategory = '', initialProvince = '' }: Props) {
  const navigate = useNavigate()
  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)
  const [province, setProvince] = useState(initialProvince)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category) params.set('category', category)
    if (province) params.set('province', province)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <form className="searchbar" onSubmit={onSubmit} role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Venue, caterer, DJ, photographer…"
        aria-label="What are you looking for?"
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select value={province} onChange={(e) => setProvince(e.target.value)} aria-label="Province">
        <option value="">Anywhere in SA</option>
        {PROVINCES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <button className="btn btn-gold" type="submit">
        Search
      </button>
    </form>
  )
}
