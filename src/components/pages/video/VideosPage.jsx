import React, { useState } from "react";
import { PlayCircle, Search, Filter } from "lucide-react";
import { lessons } from "./../data/Lesson";
import VideoModal from "./VideoModal";

const VideosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const videos = lessons.filter(lesson => lesson.videoLink);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Video Library</h1>
        
        {/* Search */}
        <div className="mb-8">
          <div className="flex max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                    {video.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{video.videoTitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{video.level}</span>
                  <span className="text-xs text-gray-500">{video.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoLink={selectedVideo.videoLink}
          videoTitle={selectedVideo.videoTitle || selectedVideo.title}
        />
      )}
    </div>
  );
};

export default VideosPage;