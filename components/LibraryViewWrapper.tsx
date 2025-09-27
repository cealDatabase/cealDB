'use client'

import { useState } from 'react'
import { SingleLibraryType } from "@/types/types"
import LibraryEditForm from "./LibraryEditForm"
import { Button } from "./Button"

interface LibraryViewWrapperProps {
  library: SingleLibraryType
  canEdit: boolean
  children: React.ReactNode
}

export default function LibraryViewWrapper({ library, canEdit, children }: LibraryViewWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    // Refresh the page to show updated data
    window.location.reload()
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <LibraryEditForm
        library={library}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <main>
      <div className="flex flex-col items-center justify-between mb-8">
        <h1>{library.library_name}</h1>
        {canEdit && (
          <Button onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>
      {children}
    </main>
  )
}
