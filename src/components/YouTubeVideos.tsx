import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  embed: string;
}

interface YouTubeVideosProps {
  videos: YouTubeVideo[];
}

export const YouTubeVideos: React.FC<YouTubeVideosProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-red-500" />
            Related YouTube Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-shadow"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold line-clamp-1">{selectedVideo.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`${selectedVideo.embed}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};