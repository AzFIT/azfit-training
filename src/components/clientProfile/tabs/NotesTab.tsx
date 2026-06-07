import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, X, Edit3, Save } from 'lucide-react';
import { useAppDataStore } from '@/stores/useAppDataStore';
import type { ClientNote } from '@/types/entities';

export function NotesTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { notes, addNote } = useAppDataStore();
  const clientNotes = Object.values(notes)
    .filter((n) => n.clientId === clientId)
    .sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());

  const [selected, setSelected] = useState<ClientNote | null>(clientNotes[0] || null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Trainer' | 'Client' | 'Important'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const filtered = clientNotes.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ? true : filter === 'Important' ? n.important : n.author === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = () => {
    if (newTitle.trim() && newContent.trim() && clientId) {
      const note: ClientNote = {
        id: `note_${Date.now()}`,
        clientId,
        title: newTitle.trim(),
        content: newContent.trim(),
        author: 'Trainer',
        date: new Date().toLocaleDateString('en-GB'),
        category: newCategory,
        important: false,
      };
      addNote(note);
      setSelected(note);
      setIsAdding(false);
      setNewTitle('');
      setNewContent('');
      setNewCategory('General');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Left — Note List */}
      <div className="bg-[az-black-card] border border-dark-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-border space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[az-black-elevated] rounded-lg border border-dark-border px-3">
              <Search size={14} className="text-dark-muted flex-shrink-0" />
              <input
                type="text" placeholder="Search notes..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-dark-primary placeholder-[dark-muted] py-2 px-2 outline-none"
              />
            </div>
            <button onClick={() => setIsAdding(true)} className="w-8 h-8 rounded-lg bg-cyan hover:bg-cyan-hover flex items-center justify-center text-white transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-1">
            {(['All', 'Trainer', 'Client', 'Important'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-dark-hover text-cyan' : 'text-dark-muted hover:text-dark-secondary'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((note) => (
            <button
              key={note.id} onClick={() => { setSelected(note); setIsAdding(false); }}
              className={`w-full text-left p-3 rounded-lg transition-all ${selected?.id === note.id && !isAdding ? 'bg-cyan-glow border border-[rgba(0,174,239,0.3)]' : 'bg-[az-black-elevated] border border-dark-divider hover:bg-dark-hover'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-cyan">{note.category}</span>
                {note.important && <span className="text-warning">★</span>}
              </div>
              <p className="text-sm text-dark-primary font-medium truncate">{note.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded ${note.author === 'Trainer' ? 'bg-[rgba(0,174,239,0.1)] text-cyan' : 'bg-[rgba(139,92,246,0.1)] text-violet'}`}>{note.author}</span>
                <span className="text-xs text-dark-muted">{note.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Note Viewer/Editor */}
      <div className="lg:col-span-2 bg-[az-black-card] border border-dark-border rounded-xl p-5 overflow-y-auto">
        {isAdding ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-dark-primary">Add New Note</h3>
              <button onClick={() => setIsAdding(false)} className="text-dark-muted hover:text-dark-primary"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs text-dark-secondary mb-1 block">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[az-black-elevated] border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-primary outline-none focus:border-cyan">
                {['General', 'Form Check', 'Nutrition', 'Goals', 'Progress'].map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-dark-secondary mb-1 block">Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title..."
                className="w-full bg-[az-black-elevated] border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-primary placeholder-[dark-muted] outline-none focus:border-cyan" />
            </div>
            <div>
              <label className="text-xs text-dark-secondary mb-1 block">Content</label>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your note here..." rows={12}
                className="w-full bg-[az-black-elevated] border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-primary placeholder-[dark-muted] outline-none focus:border-cyan resize-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg text-sm text-dark-secondary hover:bg-dark-hover transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-cyan hover:bg-cyan-hover text-white font-medium transition-colors flex items-center gap-2">
                <Save size={14} /> Save Note
              </button>
            </div>
          </div>
        ) : selected ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-cyan bg-[rgba(0,174,239,0.1)] px-2 py-0.5 rounded">{selected.category}</span>
                  {selected.important && <span className="text-xs text-warning font-semibold">Important</span>}
                </div>
                <h3 className="text-lg font-semibold text-dark-primary">{selected.title}</h3>
              </div>
              <button className="text-dark-muted hover:text-cyan transition-colors"><Edit3 size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-border">
              <span className={`text-xs px-2 py-0.5 rounded-full ${selected.author === 'Trainer' ? 'bg-[rgba(0,174,239,0.1)] text-cyan' : 'bg-[rgba(139,92,246,0.1)] text-violet'}`}>{selected.author}</span>
              <span className="text-xs text-dark-muted">{selected.date}</span>
            </div>
            <p className="text-sm text-dark-primary leading-relaxed whitespace-pre-line">{selected.content}</p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-dark-muted">
            No note selected
          </div>
        )}
      </div>
    </div>
  );
}
