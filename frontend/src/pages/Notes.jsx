import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const Notes = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  
  const STORAGE_KEY = "habit_tracker_notes";

  // Load notes on component mount
  useEffect(() => {
    const storedNotes = localStorage.getItem(STORAGE_KEY);
    
    if (storedNotes) {
      try {
        const parsedNotes = JSON.parse(storedNotes);
        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        } else {
          setNotes([]);
        }
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  // Save notes whenever they change
  useEffect(() => {
    if (notes && Array.isArray(notes) && notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } else if (notes && Array.isArray(notes) && notes.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [notes]);

  const addNote = () => {
    if (newNote.trim()) {
      const newNoteObj = { 
        id: Date.now(),
        text: newNote.trim(), 
        completed: false,
        timestamp: new Date().toISOString()
      };
      
      setNotes(prevNotes => {
        const newNotes = [...(Array.isArray(prevNotes) ? prevNotes : []), newNoteObj];
        return newNotes;
      });
      setNewNote("");
    }
  };

  const toggleComplete = (id) => {
    setNotes(prevNotes => {
      return prevNotes.map(note => 
        note.id === id ? { ...note, completed: !note.completed } : note
      );
    });
  };

  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const clearAllNotes = () => {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      setNotes([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const startEditing = (id) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex !== -1) {
      setEditingIndex(noteIndex);
      setEditingText(notes[noteIndex].text);
    }
  };

  const finishEditing = () => {
    if (editingText.trim() === "") return;
    
    setNotes(prevNotes => {
      const updated = [...prevNotes];
      if (updated[editingIndex]) {
        updated[editingIndex].text = editingText.trim();
      }
      return updated;
    });
    
    setEditingIndex(null);
    setEditingText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setEditingIndex(null);
      setEditingText("");
    } else if (e.key === "Enter") {
      finishEditing();
    }
  };

  // Sort completed notes to the bottom
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
  });

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-r from-blue-200 to-pink-200 text-black"}`}>
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800 dark:text-white">📝 My Notes</h1>
          <button
            onClick={clearAllNotes}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            className={`px-4 py-2 border rounded-md flex-1 ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}
            placeholder="Write a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={addNote}
          >
            Add
          </button>
        </div>

        {sortedNotes.length === 0 ? (
          <div className={`p-6 text-center rounded-lg shadow-md ${darkMode ? "bg-gray-700 text-gray-300" : "bg-white text-gray-500"}`}>
            <p className="text-lg">No notes yet. Add one to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedNotes.map((note) => (
              <li
                key={note.id}
                className={`flex items-center justify-between p-4 rounded shadow-md transition-all ${
                  note.completed 
                    ? (darkMode ? "bg-gray-800 opacity-70" : "bg-gray-100 opacity-80") 
                    : (darkMode ? "bg-gray-700" : "bg-white")
                }`}
              >
                <div className="flex items-center space-x-3 w-full">
                  <input
                    type="checkbox"
                    checked={note.completed}
                    onChange={() => toggleComplete(note.id)}
                    className="w-5 h-5 accent-purple-600"
                  />
                  {editingIndex === notes.findIndex(n => n.id === note.id) ? (
                    <input
                      className={`flex-1 px-2 py-1 border-b focus:outline-none ${
                        darkMode ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
                      }`}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-lg flex-1 cursor-pointer ${
                        note.completed ? "line-through opacity-60" : ""
                      }`}
                      onDoubleClick={() => startEditing(note.id)}
                    >
                      {note.text}
                    </span>
                  )}
                </div>
                <button
                  className="text-red-500 hover:text-red-700 font-bold ml-3 px-2 py-1"
                  onClick={() => deleteNote(note.id)}
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notes;