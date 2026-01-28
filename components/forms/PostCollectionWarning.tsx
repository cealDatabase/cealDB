interface PostCollectionWarningProps {
  className?: string
}

export function PostCollectionWarning({ className = "" }: PostCollectionWarningProps) {
  return (
    <div className={`bg-red-50 border-2 border-red-400 rounded-lg p-4 ${className}`}>
      <div className="flex gap-3">
        <div className="flex-1 px-2 md:px-4">
          <h3 className="text-base font-bold text-red-900 mb-2">
            ⚠️ Post-Collection Period Modification
          </h3>
          <p className="text-sm text-red-800 mb-3">
            <strong>Caution:</strong> The regular data collection period for this form has closed. 
            You are modifying data that has already been submitted by the institution.
          </p>
          <div className="bg-red-100 rounded p-3 mb-3">
            <p className="text-sm text-red-900 font-medium mb-2">
              Please be aware:
            </p>
            <ul className="text-sm text-red-800 space-y-1.5 list-disc list-inside">
              <li>Any changes you make will <strong>overwrite previously collected data</strong></li>
              <li>All modifications are being <strong>logged and traceable</strong></li>
              <li>This action should only be taken if you are <strong>certain the data requires correction</strong></li>
            </ul>
          </div>
          <p className="text-xs text-red-700 italic">
            Only submit this form if you have verified the accuracy of your changes.
          </p>
        </div>
      </div>
    </div>
  )
}
