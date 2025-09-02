"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { UnprocessedInstructions } from "@/components/instructions/unprocessed"
import { Button } from "@/components/ui/button"
import { BookOpen, X, Save, Send } from "lucide-react"
import { Container } from "@/components/Container"
import { StatusMessage } from "@/components/forms/StatusMessage"
import { AdminBreadcrumb } from "@/components/AdminBreadcrumb"

interface UnprocessedFormData {
  ubchinese?: number;
  ubjapanese?: number;
  ubkorean?: number;
  ubnoncjk?: number;
  ubtotal?: number;
  ubnotes?: string;
}

interface UnprocessedFormProps {
  libid: string;
}

const UnprocessedForm = ({ libid }: UnprocessedFormProps) => {
  const [formData, setFormData] = useState<UnprocessedFormData>({
    ubchinese: undefined,
    ubjapanese: undefined,
    ubkorean: undefined,
    ubnoncjk: undefined,
    ubtotal: undefined,
    ubnotes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isFormEnabled, setIsFormEnabled] = useState(false);

  // Auto-calculate total when individual values change
  useEffect(() => {
    const chinese = formData.ubchinese || 0;
    const japanese = formData.ubjapanese || 0;
    const korean = formData.ubkorean || 0;
    const noncjk = formData.ubnoncjk || 0;
    const total = chinese + japanese + korean + noncjk;
    
    setFormData(prev => ({ ...prev, ubtotal: total }));
  }, [formData.ubchinese, formData.ubjapanese, formData.ubkorean, formData.ubnoncjk]);

  // Load existing data and check form status
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/unprocessed/status/${libid}`);
        const result = await response.json();
        
        if (result.exists && result.is_open_for_editing) {
          setIsFormEnabled(true);
          if (result.data) {
            setFormData({
              ubchinese: result.data.ubchinese || undefined,
              ubjapanese: result.data.ubjapanese || undefined,
              ubkorean: result.data.ubkorean || undefined,
              ubnoncjk: result.data.ubnoncjk || undefined,
              ubtotal: result.data.ubtotal || undefined,
              ubnotes: result.data.ubnotes || ""
            });
          }
        } else {
          setIsFormEnabled(false);
          setInfoMessage(result.message || 'Form is not available for editing');
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setStatusMessage({
          type: 'error',
          message: 'Failed to load form data'
        });
      }
    };

    if (libid) {
      loadData();
    }
  }, [libid]);

  const handleInputChange = (field: keyof UnprocessedFormData, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/unprocessed/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          libid,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage({
          type: 'success',
          message: result.message || 'Form submitted successfully'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: result.error || 'Failed to submit form'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatusMessage({
        type: 'error',
        message: 'Failed to submit form. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Unprocessed/Backlog Materials Form</h2>
      
      {infoMessage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{infoMessage}</p>
        </div>
      )}
      
      {statusMessage && (
        <StatusMessage 
          type={statusMessage.type} 
          message={statusMessage.message} 
          show={true}
        />
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              01. Unprocessed Chinese
            </label>
            <input
              type="number"
              min="0"
              disabled={!isFormEnabled || isLoading}
              value={formData.ubchinese || ''}
              onChange={(e) => handleInputChange('ubchinese', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              02. Unprocessed Japanese
            </label>
            <input
              type="number"
              min="0"
              disabled={!isFormEnabled || isLoading}
              value={formData.ubjapanese || ''}
              onChange={(e) => handleInputChange('ubjapanese', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              03. Unprocessed Korean
            </label>
            <input
              type="number"
              min="0"
              disabled={!isFormEnabled || isLoading}
              value={formData.ubkorean || ''}
              onChange={(e) => handleInputChange('ubkorean', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              04. Unprocessed Non-CJK
            </label>
            <input
              type="number"
              min="0"
              disabled={!isFormEnabled || isLoading}
              value={formData.ubnoncjk || ''}
              onChange={(e) => handleInputChange('ubnoncjk', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 70"
            />
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              05. Unprocessed Total (auto-calculated: 01 + 02 + 03 + 04)
            </label>
            <input
              type="number"
              value={formData.ubtotal || 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            06. Memo/Footnote for this form
          </label>
          <textarea
            disabled={!isFormEnabled || isLoading}
            value={formData.ubnotes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ubnotes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={4}
            placeholder="Enter any notes or footnotes..."
          />
        </div>
        
        {isFormEnabled && (
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save & Submit'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const UnprocessedPage = () => {
  const [showInstructions, setShowInstructions] = useState(false)
  const params = useParams()
  const libid = params?.libid as string

  return (
    <>
      <Container>
        <AdminBreadcrumb libraryName="Library" />
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Unprocessed Backlog Materials (volumes or pieces)
        </h1>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-md bg-black text-white font-bold"
            size="lg"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? (
              <>
                <X className="h-4 w-4" />
                Hide Instructions
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                View Instructions
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-6 max-w-full">
          {/* Instructions Column - 1/3 width */}
          {showInstructions && (
            <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto max-h-[80vh] sticky top-4">
              <UnprocessedInstructions />
            </div>
          )}

          {/* Form Column - 2/3 width when instructions shown, full width when hidden */}
          <div className={showInstructions ? "w-2/3" : "w-full max-w-[1200px]"}>
            <UnprocessedForm libid={libid} />
          </div>
        </div>
      </Container>
    </>
  )
}

export default UnprocessedPage