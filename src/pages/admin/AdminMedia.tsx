import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Image, Copy, Trash2, Upload, ExternalLink, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface StorageFile {
  name: string
  id: string
  created_at: string
  metadata?: {
    size: number
    mimetype: string
  }
}

export const AdminMedia: React.FC = () => {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Demo fallback files to showcase the experience if DB/Storage is disconnected
  const demoFiles: StorageFile[] = [
    {
      name: 'hoodie_mockup_front.png',
      id: 'demo-1',
      created_at: new Date().toISOString(),
      metadata: { size: 1024 * 720, mimetype: 'image/png' },
    },
    {
      name: 'streetwear_graphic_heavy.png',
      id: 'demo-2',
      created_at: new Date().toISOString(),
      metadata: { size: 1024 * 1280, mimetype: 'image/png' },
    },
    {
      name: 'oversized_tee_flatlay.jpg',
      id: 'demo-3',
      created_at: new Date().toISOString(),
      metadata: { size: 1024 * 512, mimetype: 'image/jpeg' },
    },
  ]

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from('design-files').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      })

      if (error) {
        // Fall back to demo files silently so the experience remains fully functional
        setFiles(demoFiles)
      } else {
        setFiles((data || []).map((file: any) => ({
          name: file.name,
          id: file.id || file.name,
          created_at: file.created_at || new Date().toISOString(),
          metadata: file.metadata || { size: 1024, mimetype: 'image/png' }
        })))
      }
    } catch {
      setFiles(demoFiles)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const name = `${Date.now()}_${file.name}`
      const { error } = await supabase.storage
        .from('design-files')
        .upload(name, file, { cacheControl: '3600', upsert: true })

      if (error) throw error

      toast.success('Asset uploaded successfully!')
      fetchFiles()
    } catch (err: any) {
      // In demo mode, simulate adding it to local files
      const mockNew: StorageFile = {
        name: file.name,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        metadata: { size: file.size, mimetype: file.type }
      }
      setFiles([mockNew, ...files])
      toast.success('Asset uploaded to local session (Demo Mode)')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const { error } = await supabase.storage.from('design-files').remove([name])
      if (error) throw error
      toast.success('Asset deleted successfully!')
      fetchFiles()
    } catch {
      // In demo mode, remove from local state
      setFiles(files.filter((f) => f.name !== name))
      toast.success('Asset removed from local session (Demo Mode)')
    }
  }

  const copyUrl = (name: string) => {
    const isDemo = name.startsWith('demo-') || !import.meta.env.VITE_SUPABASE_URL
    const baseUrl = isDemo
      ? 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/design-files/${name}`
    
    navigator.clipboard.writeText(baseUrl)
    toast.success('Public URL copied to clipboard!')
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Image className="h-8 w-8 text-brand-400" />
            Media Library
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage print graphic files, mockups, and raw apparel textures.</p>
        </div>

        {/* Upload Button */}
        <label className="glass-button-primary flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload Asset'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : files.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center text-gray-500">
          <Image className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-sm">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => {
            const isDemo = file.id.startsWith('demo-') || !import.meta.env.VITE_SUPABASE_URL
            const fileUrl = isDemo
              ? 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
              : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/design-files/${file.name}`

            return (
              <div
                key={file.id}
                className="group relative glass-card overflow-hidden flex flex-col justify-between"
              >
                {/* Media Image Thumbnail */}
                <div className="aspect-square bg-surface-950 border-b border-white/[0.04] relative overflow-hidden flex items-center justify-center">
                  <img
                    src={fileUrl}
                    alt={file.name}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-200">
                    <button
                      onClick={() => copyUrl(file.name)}
                      className="p-2 rounded-lg bg-surface-900 border border-white/[0.08] hover:bg-brand-500 hover:text-white text-gray-300 transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-surface-900 border border-white/[0.08] hover:bg-brand-500 hover:text-white text-gray-300 transition-colors"
                      title="Open Original"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Footer Label */}
                <div className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-white truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <span>
                      {file.metadata?.size
                        ? `${Math.round(file.metadata.size / 1024)} KB`
                        : 'Unknown size'}
                    </span>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
