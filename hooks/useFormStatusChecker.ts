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
  data?: any
  existingData?: any
  previousYearData?: any
  libraryYear?: any
}

interface FormPermission {
  canEdit: boolean
  isAfterClosing: boolean
  isPrivilegedPostClosing: boolean
  reason?: string
  surveySession?: any
  userRoles?: string[]
}

export function useFormStatusChecker(apiEndpoint: string) {
  const [libraryYearStatus, setLibraryYearStatus] = useState<LibraryYearStatus | null>(null)
  const [formPermission, setFormPermission] = useState<FormPermission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    const checkLibraryYearStatus = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/${params.libid}`)
        const data = await response.json()
        setLibraryYearStatus(data)

        // Also check form permissions based on survey session
        if (data.year) {
          console.log('[useFormStatusChecker] Fetching permissions for year:', data.year);
          const permResponse = await fetch(`/api/form-permissions?year=${data.year}`)
          const permData = await permResponse.json()
          console.log('[useFormStatusChecker] Permission response:', permData);
          if (permResponse.ok) {
            console.log('[useFormStatusChecker] isPrivilegedPostClosing:', permData.isPrivilegedPostClosing);
            setFormPermission(permData)
          }
        }
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

  // Determine if form is in read-only mode
  // If permission hasn't been checked yet, default to read-only for security (fail closed)
  const canEdit = formPermission?.canEdit ?? false // Default to NOT allow if not checked
  const isAfterClosing = formPermission?.isAfterClosing ?? false
  
  // Form is read-only if we're still loading OR user cannot edit
  // Once loaded, canEdit already incorporates all role-based permission logic
  const isReadOnly = isLoading || !canEdit

  return {
    libraryYearStatus,
    formPermission,
    isLoading,
    isFormAvailable: libraryYearStatus?.exists && libraryYearStatus?.is_open_for_editing,
    existingData: libraryYearStatus?.data || libraryYearStatus?.existingData,
    previousYearData: libraryYearStatus?.previousYearData,
    isReadOnly,
    canEdit,
    isAfterClosing,
    isPrivilegedPostClosing: formPermission?.isPrivilegedPostClosing ?? false
  }
}
