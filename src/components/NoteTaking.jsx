import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiSearch, FiFileText } = FiIcons;

const NoteTaking = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem('noteTakingNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('noteTakingNotes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const selectNote = (note) => {
    if (isEditing) {
      saveNote();
    }
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
  };

  const saveNote = () => {
    if (selectedNote && (editTitle.trim() || editContent.trim())) {
      const updatedNote = {
        ...selectedNote,
        title: editTitle.trim() || 'Untitled',
        content: editContent,
        updatedAt: new Date().toISOString()
      };
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
      setIsEditing(false);
    }
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
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
              <h1 className="text-2xl font-luxury font-bold text-gold-400">Notes</h1>
              <p className="text-gray-400">Capture your thoughts and ideas</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewNote}
            className="px-4 py-2 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} />
            <span>New Note</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
              {/* Search */}
              <div className="relative mb-4">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
              </div>

              {/* Notes Count */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <SafeIcon icon={FiFileText} className="text-4xl text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {searchQuery ? 'No notes found' : 'No notes yet'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {searchQuery ? 'Try a different search' : 'Create your first note'}
                    </p>
                  </div>
                ) : (
                  filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => selectNote(note)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 group ${
                        selectedNote && selectedNote.id === note.id
                          ? 'bg-gold-400/20 border border-gold-400/30'
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1">
                            {note.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {note.content || 'No content'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/20 rounded transition-all duration-300"
                        >
                          <SafeIcon icon={FiTrash2} className="text-sm" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
              {selectedNote ? (
                <div>
                  {/* Editor Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gold-400 placeholder-gray-500"
                          placeholder="Note title..."
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-gold-400">
                          {selectedNote.title}
                        </h2>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        Last updated: {format(new Date(selectedNote.updatedAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveNote}
                            className="px-4 py-2 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold flex items-center space-x-2"
                          >
                            <SafeIcon icon={FiSave} />
                            <span>Save</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold flex items-center space-x-2"
                          >
                            <SafeIcon icon={FiX} />
                            <span>Cancel</span>
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startEditing}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-blue-400 font-semibold flex items-center space-x-2"
                          >
                            <SafeIcon icon={FiEdit3} />
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteNote(selectedNote.id)}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-red-400 font-semibold flex items-center space-x-2"
                          >
                            <SafeIcon icon={FiTrash2} />
                            <span>Delete</span>
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Editor Content */}
                  <div className="min-h-96">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Start writing your note..."
                        className="w-full h-96 bg-gray-800/50 border border-gray-700 rounded-lg p-4 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500 resize-none"
                      />
                    ) : (
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 min-h-96">
                        {selectedNote.content ? (
                          <div className="text-gray-300 whitespace-pre-wrap">
                            {selectedNote.content}
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            This note is empty. Click "Edit" to add content.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <SafeIcon icon={FiFileText} className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a note to view or edit</p>
                  <p className="text-gray-500 text-sm mb-6">
                    Choose from your notes on the left, or create a new one
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createNewNote}
                    className="px-6 py-3 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold flex items-center space-x-2 mx-auto"
                  >
                    <SafeIcon icon={FiPlus} />
                    <span>Create New Note</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoteTaking;