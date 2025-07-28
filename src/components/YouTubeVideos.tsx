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
      <Card className="shadow-medium border-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            Related YouTube Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-28 sm:h-36 lg:h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 rounded-full p-2 sm:p-3">
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    YouTube
                  </div>
                </div>
                <div className="p-2 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <h3 className="text-sm sm:text-lg font-semibold line-clamp-1 pr-2">{selectedVideo.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVideo(null)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`${selectedVideo.embed}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};