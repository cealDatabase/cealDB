import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface LibraryYearStatus {
  exists: boolean
  is_open_for_editing: boolean
  is_active: boolean
  message: string
  year?: number
  library_id?: number
}

export function useFormStatusChecker(apiEndpoint: string) {
  const [libraryYearStatus, setLibraryYearStatus] = useState<LibraryYearStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    const checkLibraryYearStatus = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/${params.libid}`)
        const data = await response.json()
        setLibraryYearStatus(data)
      } catch (error) {
        console.error('Failed to check library year status:', error)
        toast.error('Failed to check form availability')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.libid) {
      checkLibraryYearStatus()
    }
  }, [params.libid, apiEndpoint])

  return {
    libraryYearStatus,
    isLoading,
    isFormAvailable: libraryYearStatus?.exists && libraryYearStatus?.is_open_for_editing
  }
}
