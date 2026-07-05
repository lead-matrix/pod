import React from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useMockupTaskResult } from '../../hooks/usePrintful'

interface MockupPreviewProps {
  taskId: string | null
  onGenerationComplete: (mockups: Array<{ url: string; variant_ids: number[] }>) => void
}

export const MockupPreview: React.FC<MockupPreviewProps> = ({ taskId, onGenerationComplete }) => {
  const { data, isLoading } = useMockupTaskResult(taskId || '')

  if (!taskId) return null

  const taskStatus = data?.result?.status || 'pending'
  const mockups = data?.result?.mockups || []

  // Map mockups once completed
  if (taskStatus === 'completed' && mockups.length > 0) {
    const formattedMockups = mockups.map((m: { extra: Array<{ title: string; url: string }>; variant_ids: number[] }) => ({
      url: m.extra[0]?.url || '',
      variant_ids: m.variant_ids,
    })).filter((m: { url: string }) => m.url !== '')

    // Pass up to parent
    onGenerationComplete(formattedMockups)
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        {taskStatus === 'pending' || isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        ) : taskStatus === 'completed' ? (
          <CheckCircle className="h-5 w-5 text-green-400" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-400" />
        )}
        <h4 className="text-sm font-semibold text-white">Printful Mockup Generator Status</h4>
      </div>

      {taskStatus === 'pending' && (
        <p className="text-xs text-gray-500">
          Generating high-resolution mockups for your variant selections. This may take up to 30 seconds...
        </p>
      )}

      {taskStatus === 'completed' && mockups.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-4">
          {mockups.map((m: { extra: Array<{ title: string; url: string }>; variant_ids: number[] }, idx: number) => (
            <div key={idx} className="aspect-square bg-surface-950 border border-white/[0.06] rounded-xl overflow-hidden relative group">
              <img
                src={m.extra[0]?.url}
                alt="Mockup Preview"
                className="h-full w-full object-cover object-center"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider text-white">
                Variant Mockup
              </span>
            </div>
          ))}
        </div>
      )}

      {taskStatus === 'failed' && (
        <p className="text-xs text-red-400">
          Failed to generate mockups. Verify your print design format and dimensions, then try again.
        </p>
      )}
    </div>
  )
}
