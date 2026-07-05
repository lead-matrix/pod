import React, { useRef, useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getPublicStorageUrl } from '../../lib/utils'

interface DesignUploaderProps {
  onUploadComplete: (url: string, path: string) => void
}

export const DesignUploader: React.FC<DesignUploaderProps> = ({ onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic file validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, SVG, or PDF.')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Storage path structure: design-files/{timestamp}_{random_hash}.{ext}
      const fileExt = file.name.split('.').pop()
      const randHash = Math.random().toString(36).substring(7)
      const path = `${Date.now()}_${randHash}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const publicUrl = getPublicStorageUrl('design-files', path)
      setFilePath(path)
      onUploadComplete(publicUrl, path)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload file. Check storage RLS rules.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Design / Print File</h3>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-150 ${
          filePath
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-white/[0.08] hover:border-brand-500/50 bg-white/[0.01]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".png,.jpg,.jpeg,.svg,.pdf"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-brand-300">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm font-medium">Uploading high-res design file...</p>
          </div>
        ) : filePath ? (
          <div className="flex flex-col items-center gap-2 text-green-400">
            <CheckCircle className="h-10 w-10" />
            <p className="text-sm font-semibold">Design file uploaded</p>
            <p className="text-xs text-gray-500 font-mono line-clamp-1">{filePath}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <UploadCloud className="h-10 w-10 opacity-70" />
            <p className="text-sm font-medium">Click to upload print design</p>
            <p className="text-xs text-gray-500">Supports high-res PNG, JPEG, SVG, PDF up to 50MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs mt-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
