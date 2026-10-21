'use client'

// Show or Hide tab on /libraries: every institution, hidden or not, and a
// button to show or hide each one (app/api/admin/libraries/visibility).

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface InstitutionRow {
  id: number
  library_name: string
  hidden: boolean
  users: number
}

type Filter = 'all' | 'shown' | 'hidden'

const WHERE_HIDDEN =
  'the institution list, Sign Up New User, the Participation and Supplementary reports, and the Organizational Structure export'

export default function InstitutionVisibility() {
  const { toast } = useToast()
  const [rows, setRows] = useState<InstitutionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/libraries/visibility')
        const data = await response.json()
        if (data.success) {
          setRows(data.libraries)
        } else {
          setError(data.error || 'Could not load the institutions.')
        }
      } catch (err) {
        console.error('Error loading institutions:', err)
        setError('Could not load the institutions.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hiddenCount = rows.filter((row) => row.hidden).length
  const shown = useMemo(() => {
    const words = search.trim().toLowerCase()
    return rows.filter((row) =>
      (filter === 'all' || (filter === 'hidden') === row.hidden) &&
      (!words || row.library_name.toLowerCase().includes(words))
    )
  }, [rows, search, filter])

  const setHidden = async (row: InstitutionRow, hidden: boolean) => {
    const question = hidden
      ? `Hide "${row.library_name}"?\n\nIt will no longer appear in ${WHERE_HIDDEN}. Its users and data are kept.`
      : `Show "${row.library_name}"?\n\nIt will appear in ${WHERE_HIDDEN}.`
    if (!window.confirm(question)) return

    setSavingId(row.id)
    try {
      const response = await fetch('/api/admin/libraries/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, hidden }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not change the institution.')
      }
      setRows((current) => current.map((r) => (r.id === row.id ? { ...r, hidden } : r)))
      toast({
        title: hidden ? 'Hidden' : 'Shown',
        description: `${row.library_name} is now ${hidden ? 'hidden' : 'shown'}.`,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not change the institution.',
        variant: 'destructive',
      })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="w-5 h-5" />
          Show or Hide Institutions
        </CardTitle>
        <p className="text-gray-600">
          A hidden institution is left out of {WHERE_HIDDEN}. Its users, forms and past data are kept, and it can be
          shown again at any time. Most hidden institutions last reported many years ago. One that is hidden but
          still has users is marked, in case it was hidden by mistake.
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                placeholder="Search institutions"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-sm"
              />
              <Select value={filter} onValueChange={(value) => setFilter(value as Filter)}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All institutions</SelectItem>
                  <SelectItem value="shown">Shown only</SelectItem>
                  <SelectItem value="hidden">Hidden only</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 sm:ml-auto self-center sm:whitespace-nowrap">
                {rows.length} institutions · {rows.length - hiddenCount} shown · {hiddenCount} hidden
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="text-left p-3 font-semibold border-r border-gray-300">Institution</th>
                    <th className="text-center p-3 font-semibold border-r border-gray-300 w-24">Users</th>
                    <th className="text-center p-3 font-semibold border-r border-gray-300 w-40">Status</th>
                    <th className="text-center p-3 font-semibold w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => {
                    const suspicious = row.hidden && row.users > 0
                    return (
                      <tr
                        key={row.id}
                        className={`${suspicious ? 'bg-amber-50' : row.hidden ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}
                      >
                        <td className="p-3 border-r border-gray-300">
                          <Link href={`/libraries/${row.id}`} className="font-medium text-blue-600 hover:underline">
                            {row.library_name}
                          </Link>
                        </td>
                        <td className="p-3 text-center border-r border-gray-300">{row.users}</td>
                        <td className="p-3 text-center border-r border-gray-300">
                          {row.hidden ? (
                            <span className={suspicious ? 'text-amber-700 font-medium' : 'text-gray-500'}>
                              Hidden{suspicious ? ', has users' : ''}
                            </span>
                          ) : (
                            <span className="text-green-700 font-medium">Shown</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingId === row.id}
                            onClick={() => setHidden(row, !row.hidden)}
                          >
                            {row.hidden ? (
                              <><Eye className="w-4 h-4 mr-1" />Show</>
                            ) : (
                              <><EyeOff className="w-4 h-4 mr-1" />Hide</>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-600">No institutions match.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
