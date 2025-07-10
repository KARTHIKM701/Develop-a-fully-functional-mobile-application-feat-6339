import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiCamera, FiVideo, FiRotateCcw, FiDownload, FiTrash2, FiCheck } = FiIcons;

const Camera = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [facingMode, setFacingMode] = useState('user');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const media = {
        id: Date.now(),
        name: `photo_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`,
        url: imageSrc,
        type: 'image',
        createdAt: new Date().toISOString(),
        source: 'camera'
      };
      setCapturedMedia(media);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      });
      
      mediaRecorder.addEventListener('stop', () => {
        // Recording stopped, chunks will be processed in useEffect
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  }, [recordingInterval]);

  React.useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const media = {
        id: Date.now(),
        name: `video_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`,
        url: url,
        type: 'video',
        createdAt: new Date().toISOString(),
        source: 'camera'
      };
      setCapturedMedia(media);
      setRecordedChunks([]);
    }
  }, [recordedChunks, isRecording]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const saveMedia = () => {
    if (capturedMedia) {
      const savedMedia = JSON.parse(localStorage.getItem('galleryMedia') || '[]');
      const updatedMedia = [...savedMedia, capturedMedia];
      localStorage.setItem('galleryMedia', JSON.stringify(updatedMedia));
      setCapturedMedia(null);
      navigate('/gallery');
    }
  };

  const downloadMedia = () => {
    if (capturedMedia) {
      const link = document.createElement('a');
      link.href = capturedMedia.url;
      link.download = capturedMedia.name;
      link.click();
    }
  };

  const discardMedia = () => {
    if (capturedMedia) {
      URL.revokeObjectURL(capturedMedia.url);
      setCapturedMedia(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
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
              <h1 className="text-2xl font-luxury font-bold text-gold-400">Camera</h1>
              <p className="text-gray-400">Capture photos and videos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/gallery')}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-300 text-purple-400 font-semibold"
            >
              Gallery
            </motion.button>
          </div>
        </div>

        {!capturedMedia ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
            {/* Camera Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMediaType('photo')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    mediaType === 'photo' 
                      ? 'bg-gold-400 text-black' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Photo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMediaType('video')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    mediaType === 'video' 
                      ? 'bg-gold-400 text-black' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Video
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchCamera}
                className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-gray-400"
              >
                <SafeIcon icon={FiRotateCcw} />
              </motion.button>
            </div>

            {/* Camera View */}
            <div className="relative bg-black rounded-xl overflow-hidden mb-6">
              <Webcam
                ref={webcamRef}
                audio={mediaType === 'video'}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-auto"
              />
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Mode Indicator */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {mediaType === 'photo' ? 'Photo Mode' : 'Video Mode'}
              </div>
            </div>

            {/* Capture Controls */}
            <div className="flex items-center justify-center">
              {mediaType === 'photo' ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center hover:bg-gold-500 transition-all duration-300 shadow-lg"
                >
                  <SafeIcon icon={FiCamera} className="text-3xl text-black" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gold-400 hover:bg-gold-500'
                  }`}
                >
                  <SafeIcon 
                    icon={FiVideo} 
                    className={`text-3xl ${isRecording ? 'text-white' : 'text-black'}`} 
                  />
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          /* Preview Captured Media */
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gold-400 mb-2">
                {capturedMedia.type === 'image' ? 'Photo Captured!' : 'Video Recorded!'}
              </h2>
              <p className="text-gray-400">Review your {capturedMedia.type} and choose what to do next</p>
            </div>

            <div className="bg-black rounded-xl overflow-hidden mb-6">
              {capturedMedia.type === 'image' ? (
                <img
                  src={capturedMedia.url}
                  alt="Captured"
                  className="w-full h-auto max-h-96 object-contain"
                />
              ) : (
                <video
                  src={capturedMedia.url}
                  controls
                  className="w-full h-auto max-h-96 object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={discardMedia}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-red-400 font-semibold flex items-center space-x-2"
              >
                <SafeIcon icon={FiTrash2} />
                <span>Discard</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadMedia}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-blue-400 font-semibold flex items-center space-x-2"
              >
                <SafeIcon icon={FiDownload} />
                <span>Download</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveMedia}
                className="px-6 py-3 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold flex items-center space-x-2"
              >
                <SafeIcon icon={FiCheck} />
                <span>Save to Gallery</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Camera;