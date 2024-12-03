'use client'

import { useState, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleConvert = () => {
    // This is where you'd implement the conversion logic
    console.log('Converting', file?.name, 'to', outputFormat)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">File Converter</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Upload file
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-1"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="output-format" className="block text-sm font-medium text-gray-700">
              Output format
            </Label>
            <Select onValueChange={setOutputFormat}>
              <SelectTrigger id="output-format">
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleConvert} 
            className="w-full" 
            disabled={!file || !outputFormat}
          >
            Convert
          </Button>
        </div>
      </div>
    </div>
  )
}
