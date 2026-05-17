'use client'
import { ChangeEvent } from 'react'

interface SearchBarProps {
  onSearch: (value: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="search-bar mb-6">
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="w-full p-3 border rounded-lg"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
      />
    </div>
  )
}