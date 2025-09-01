import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Image, Upload, X, Mic, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';

interface QuestionInputProps {
  onSubmit: (question: string, image?: File, linkUrl?: string) => void;
  isLoading: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'text' | 'image' | 'voice' | 'link'>('text');
  const [question, setQuestion] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (mode === 'text' && question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
    } else if (mode === 'image' && selectedImage) {
      onSubmit('Please analyze this image and provide a detailed explanation.', selectedImage);
      handleImageRemove();
    } else if (mode === 'link' && linkUrl.trim()) {
      onSubmit(`Please analyze this link: ${linkUrl.trim()}`, undefined, linkUrl.trim());
      setLinkUrl('');
    }
  };

  const handleImageSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Image size must be less than 4MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleImageSelect(files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-surface shadow-soft">
      {/* Mode Selection */}
      <div className="flex gap-1 sm:gap-2 mb-4">
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('text')}
          className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Text</span>
        </Button>
        <Button
          variant={mode === 'voice' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('voice')}
          className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Voice</span>
        </Button>
        <Button
          variant={mode === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('image')}
          className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Image</span>
        </Button>
        <Button
          variant={mode === 'link' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('link')}
          className="flex-1 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Link className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Link</span>
        </Button>
      </div>

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask LearnFlow anything... e.g., 'Explain relativity', 'Solve 2x + 5 = 15'"
            className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base border-2 focus:border-primary"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Voice Mode */}
      {mode === 'voice' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-xl p-6 sm:p-8 text-center">
            <Mic className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm sm:text-lg font-semibold">Voice Input</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Click the microphone button below to start recording
              </p>
            </div>
            <div className="mt-6">
              <VoiceRecorder 
                onSubmit={(text) => onSubmit(text)} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Link Mode */}
      {mode === 'link' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Website Link</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com or paste any link here..."
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              disabled={isLoading}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p>• Paste any website URL, article link, or web page</p>
            <p>• The AI will analyze the content for you</p>
          </div>
        </div>
      )}

      {/* Image Mode */}
      {mode === 'image' && (
        <div className="space-y-4">
          {!selectedImage ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors",
                isDragOver ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50",
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-lg font-semibold">Drop image or click to browse</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  JPG, PNG, GIF, WebP (Max 4MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-medium">
                <img
                  src={imagePreview!}
                  alt="Selected"
                  className="w-full max-h-64 object-contain bg-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={handleImageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submit Button - Hide for voice mode since VoiceRecorder handles submission */}
      {mode !== 'voice' && (
        <Button
          variant="solve"
          className="w-full mt-4 sm:mt-6 h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={isLoading || (mode === 'text' && !question.trim()) || (mode === 'image' && !selectedImage) || (mode === 'link' && !linkUrl.trim())}
        >
          {isLoading ? 'Processing...' : 'Get Answer'}
        </Button>
      )}
    </Card>
  );
};