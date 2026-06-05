import { useState, useCallback, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

const BUTTON_SIZE = 56;

export default function FloatingChatButton() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Set default position on mount
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({ x: vw - BUTTON_SIZE - 24, y: vh - BUTTON_SIZE - 24 });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos({
      x: Math.max(8, Math.min(dragRef.current.initialX + dx, vw - BUTTON_SIZE - 8)),
      y: Math.max(8, Math.min(dragRef.current.initialY + dy, vh - BUTTON_SIZE - 8)),
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle window resize
  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPos(prev => ({
        x: Math.max(8, Math.min(prev.x, vw - BUTTON_SIZE - 8)),
        y: Math.max(8, Math.min(prev.y, vh - BUTTON_SIZE - 8)),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        zIndex: 9998,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      className="rounded-full bg-gradient-to-br from-[#00AEEF] to-[#008DC4] text-white shadow-[0_4px_20px_rgba(0,174,239,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      aria-label="Open AI Chat"
    >
      <MessageCircle size={26} />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#00AEEF] animate-ping opacity-20" style={{ animationDuration: '2.5s' }} />
    </button>
  );
}
