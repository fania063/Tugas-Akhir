'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Patient } from '@/types'
import { Search, ChevronDown, Check } from 'lucide-react'

interface PatientComboboxProps {
  patients: Patient[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function PatientCombobox({
  patients,
  value,
  onChange,
  placeholder = "Cari nama atau NIK pasien...",
  disabled = false,
  error
}: PatientComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedPatient = patients.find(p => p.id === value)

  const filteredPatients = patients.filter(p => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return p.nama.toLowerCase().includes(searchLower) || p.nik.includes(searchLower)
  })

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setSearch('')
          }
        }}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg bg-white cursor-pointer transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-emerald-400'}
          ${error ? 'border-red-500' : isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'}
        `}
      >
        <span className={selectedPatient ? 'text-slate-900 font-medium' : 'text-slate-500'}>
          {selectedPatient ? `${selectedPatient.nama} - ${selectedPatient.nik}` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[200] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Ketik NIK atau Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Pasien tidak ditemukan.
              </div>
            ) : (
              filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onChange(p.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors
                    ${value === p.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}
                  `}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{p.nama}</span>
                      {p.jenis_kelamin === 'L' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">L</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-bold">P</span>
                      )}
                      {p.tanggal_lahir && (() => {
                        const today = new Date()
                        const birthDate = new Date(p.tanggal_lahir)
                        
                        let ageYears = today.getFullYear() - birthDate.getFullYear()
                        let ageMonths = today.getMonth() - birthDate.getMonth()
                        let ageDays = today.getDate() - birthDate.getDate()

                        if (ageDays < 0) {
                          ageMonths--
                          const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0)
                          ageDays += previousMonth.getDate()
                        }
                        if (ageMonths < 0) {
                          ageYears--
                          ageMonths += 12
                        }

                        let ageString = ''
                        if (ageYears > 0) {
                          ageString = `${ageYears} Thn ${ageMonths} Bln ${ageDays} Hr`
                        } else if (ageMonths > 0) {
                          ageString = `${ageMonths} Bln ${ageDays} Hr`
                        } else {
                          ageString = `${ageDays} Hr`
                        }

                        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">{ageString}</span>
                      })()}
                    </div>
                    <div className="text-xs text-slate-400">{p.nik}</div>
                  </div>
                  {value === p.id && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
