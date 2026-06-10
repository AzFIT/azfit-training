import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Eye, Upload, CheckCircle2, Award, X, Camera } from 'lucide-react';
import { useAppDataStore } from '@/stores/useAppDataStore';
import type { PhotoCategory, ClientPhoto } from '@/types/entities';

function parsePhotoDate(date: string) {
  // Expected format: DD/MM/YYYY or ISO
  if (date.includes('/')) {
    return new Date(date.split('/').reverse().join('-')).getTime();
  }
  return new Date(date).getTime();
}

export default function PhotosTab() {
  const { id: clientId } = useParams<{ id: string }>();
  const { photos } = useAppDataStore();

  const [categoryFilter, setCategoryFilter] = useState<PhotoCategory | 'All'>('All');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [viewingPhoto, setViewingPhoto] = useState<ClientPhoto | null>(null);

  const progressPhotos = useMemo(() => {
    if (!clientId) return [];
    return Object.values(photos)
      .filter((p) => p.clientId === clientId)
      .sort((a, b) => parsePhotoDate(b.date) - parsePhotoDate(a.date));
  }, [photos, clientId]);

  const filtered = progressPhotos.filter((p) => categoryFilter === 'All' || p.category === categoryFilter);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const comparePhotos = progressPhotos.filter((p) => selectedForCompare.includes(p.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-dark-primary">Progress Photos</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${compareMode ? 'bg-cyan text-white' : 'bg-az-black-elevated text-dark-secondary hover:text-dark-primary'}`}>
            <Eye size={14} /> Compare Mode
          </button>
          <button className="flex items-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]">
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-dark-muted" />
        <span className="text-xs text-dark-muted">Category:</span>
        {(['All', 'Front', 'Back', 'Side', 'Other'] as const).map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${categoryFilter === c ? 'bg-dark-hover text-cyan' : 'text-dark-muted hover:text-dark-secondary'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Compare View */}
      {compareMode && selectedForCompare.length === 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-az-black-card border border-dark-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-dark-primary mb-4">Side-by-Side Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            {comparePhotos.map((p) => (
              <div key={p.id} className="text-center">
                <div className="aspect-[3/4] bg-az-black-elevated rounded-lg overflow-hidden mb-3">
                  <img src={p.thumbnailUrl || p.url} alt={p.category} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-dark-primary font-medium">{p.date}</p>
                <p className="text-xs text-dark-secondary">{p.category} · {p.weight ?? '--'}kg · {p.bodyFatPercentage ?? '--'}% BF</p>
                {p.trainerNotes && <p className="text-xs text-cyan mt-1">{p.trainerNotes}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-az-black-elevated rounded-lg text-center">
            <p className="text-sm text-dark-primary">
              Weight change: <span className="text-success font-semibold">{(comparePhotos[1]?.weight ?? 0) - (comparePhotos[0]?.weight ?? 0)} kg</span>
              <span className="mx-3 text-dark-border">|</span>
              Body Fat change: <span className="text-success font-semibold">{((comparePhotos[1]?.bodyFatPercentage ?? 0) - (comparePhotos[0]?.bodyFatPercentage ?? 0)).toFixed(1)}%</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Photo Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-dark-border rounded-xl">
          <Camera size={32} className="mx-auto text-dark-muted mb-3" />
          <p className="text-sm text-dark-secondary">No photos yet.</p>
          <p className="text-xs text-dark-muted mt-1">Upload progress photos to track visual changes over time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((photo, i) => {
            const isSelected = selectedForCompare.includes(photo.id);
            return (
              <motion.div
                key={photo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative bg-az-black-card border rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-cyan ring-2 ring-cyan/30' : 'border-dark-border hover:border-dark-subtle'}`}
                onClick={() => {
                  if (compareMode) toggleCompare(photo.id);
                  else setViewingPhoto(photo);
                }}
              >
                <div className="aspect-[3/4] bg-az-black-elevated relative">
                  <img src={photo.thumbnailUrl || photo.url} alt={photo.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {compareMode && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-cyan border-cyan' : 'bg-black/50 border-white/50'}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  )}
                  {photo.isMilestone && (
                    <div className="absolute top-2 left-2">
                      <Award size={18} className="text-warning" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-secondary font-mono">{photo.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,174,239,0.1)] text-cyan">{photo.category}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-dark-muted font-mono">{photo.weight ?? '--'}kg</span>
                    <span className="text-xs text-dark-muted">·</span>
                    <span className="text-xs text-dark-muted font-mono">{photo.bodyFatPercentage ?? '--'}% BF</span>
                  </div>
                  {photo.isGoalAchieved && (
                    <span className="inline-block mt-1 text-xs text-success font-medium">Goal Achieved!</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-az-black-card border border-dark-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <div>
                  <h3 className="text-base font-semibold text-dark-primary">{viewingPhoto.category} — {viewingPhoto.date}</h3>
                  <p className="text-xs text-dark-muted font-mono">{viewingPhoto.weight ?? '--'}kg · {viewingPhoto.bodyFatPercentage ?? '--'}% BF</p>
                </div>
                <button onClick={() => setViewingPhoto(null)} className="w-8 h-8 rounded-lg bg-az-black-elevated hover:bg-dark-hover flex items-center justify-center text-dark-secondary transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <div className="aspect-[3/4] bg-az-black-elevated rounded-lg overflow-hidden mb-4">
                  <img src={viewingPhoto.url} alt={viewingPhoto.category} className="w-full h-full object-contain" />
                </div>
                {viewingPhoto.notes && (
                  <div className="mb-3">
                    <p className="text-xs text-dark-muted mb-1">Client Notes</p>
                    <p className="text-sm text-dark-primary">{viewingPhoto.notes}</p>
                  </div>
                )}
                {viewingPhoto.trainerNotes && (
                  <div className="p-3 bg-cyan-glow rounded-lg border border-[rgba(0,174,239,0.2)]">
                    <p className="text-xs text-cyan mb-1">Trainer Notes</p>
                    <p className="text-sm text-dark-primary">{viewingPhoto.trainerNotes}</p>
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
