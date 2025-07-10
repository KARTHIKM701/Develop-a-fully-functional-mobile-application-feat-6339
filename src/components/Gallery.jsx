import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiImage, FiVideo, FiDownload, FiTrash2, FiX, FiPlay, FiPause } = FiIcons;

const Gallery = () => {
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const savedMedia = localStorage.getItem('galleryMedia');
    if (savedMedia) {
      setMedia(JSON.parse(savedMedia));
    }
  }, []);

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const deleteMedia = (id) => {
    const updatedMedia = media.filter(item => item.id !== id);
    setMedia(updatedMedia);
    localStorage.setItem('galleryMedia', JSON.stringify(updatedMedia));
    setSelectedMedia(null);
  };

  const downloadMedia = (item) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    link.click();
  };

  const importMedia = (event) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      size: file.size,
      createdAt: new Date().toISOString(),
      source: 'imported'
    }));
    
    const updatedMedia = [...media, ...newMedia];
    setMedia(updatedMedia);
    localStorage.setItem('galleryMedia', JSON.stringify(updatedMedia));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 bg-gold-400/20 border border-gold-400/30 rounded-lg hover:bg-gold-400/30 transition-all duration-300 text-gold-400"
            >
              <SafeIcon icon={FiArrowLeft} className="text-xl" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-luxury font-bold text-gold-400">Gallery</h1>
              <p className="text-gray-400">Your photos and videos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              id="import-media"
              multiple
              accept="image/*,video/*"
              onChange={importMedia}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('import-media').click()}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-blue-400 font-semibold"
            >
              Import Media
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/camera')}
              className="px-4 py-2 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold"
            >
              Take Photo
            </motion.button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {['all', 'image', 'video'].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                filter === type 
                  ? 'bg-gold-400 text-black' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-2 text-sm">
                ({type === 'all' ? media.length : media.filter(item => item.type === type).length})
              </span>
            </motion.button>
          ))}
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiImage} className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No media found</p>
            <p className="text-gray-500 text-sm mb-4">
              Take photos with the camera or import from your device
            </p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/camera')}
                className="px-6 py-3 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold"
              >
                Open Camera
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('import-media').click()}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-blue-400 font-semibold"
              >
                Import Media
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMedia(item)}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <SafeIcon icon={FiVideo} className="text-3xl text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center">
                    <p className="text-sm font-semibold truncate px-2">{item.name}</p>
                    <p className="text-xs text-gray-300">
                      {item.source === 'imported' ? 'Imported' : 'Captured'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Media Viewer Modal */}
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMedia(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl max-h-full bg-gray-900 rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h3 className="font-semibold">{selectedMedia.name}</h3>
                      <p className="text-sm text-gray-300">
                        {selectedMedia.source === 'imported' ? 'Imported' : 'Captured'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => downloadMedia(selectedMedia)}
                        className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-blue-400"
                      >
                        <SafeIcon icon={FiDownload} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteMedia(selectedMedia.id)}
                        className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-red-400"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedMedia(null)}
                        className="p-2 bg-gray-500/20 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-all duration-300 text-gray-400"
                      >
                        <SafeIcon icon={FiX} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Media Content */}
                <div className="relative">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        src={selectedMedia.url}
                        controls
                        className="max-w-full max-h-[80vh] object-contain"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Gallery;