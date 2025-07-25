import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Image, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionInputProps {
  onSubmit: (question: string, image?: File) => void;
  isLoading: boolean;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [question, setQuestion] = useState('');
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
    <Card className="p-6 bg-gradient-surface shadow-soft">
      {/* Mode Selection */}
      <div className="flex gap-3 mb-4">
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('text')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Text Input
        </Button>
        <Button
          variant={mode === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('image')}
          className="flex-1"
        >
          <Image className="h-4 w-4 mr-2" />
          Image Upload
        </Button>
      </div>

      {/* Text Mode */}
      {mode === 'text' && (
        <div className="space-y-4">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask LearnFlow anything... e.g., 'Explain the theory of relativity step-by-step', 'Show the steps to solve 2x + 5 = 15'"
            className="min-h-[120px] resize-none text-base border-2 focus:border-primary"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Image Mode */}
      {mode === 'image' && (
        <div className="space-y-4">
          {!selectedImage ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
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
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-semibold">Drop an image here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  Supports: JPG, PNG, GIF, WebP (Max 4MB)
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

      {/* Submit Button */}
      <Button
        variant="solve"
        className="w-full mt-6"
        onClick={handleSubmit}
        disabled={isLoading || (mode === 'text' && !question.trim()) || (mode === 'image' && !selectedImage)}
      >
        {isLoading ? 'Processing...' : 'Get Answer'}
      </Button>
    </Card>
  );
};