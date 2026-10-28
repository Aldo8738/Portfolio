import { useEffect, useRef } from 'react';
import { photos, type MediaItem } from '../../content/media';
import styles from './PhotoControls.module.css';

interface Props {
  photo: MediaItem;
  moving: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function PhotoControls({ photo, moving, onClose, onSelect }: Props) {
  const back = useRef<HTMLButtonElement>(null);
  const index = photos.findIndex((item) => item.id === photo.id);
  useEffect(() => back.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  const select = (offset: number) => {
    const next = photos[(index + offset + photos.length) % photos.length];
    if (next) onSelect(next.id);
  };
  return (
    <nav
      className={styles.controls}
      aria-label="Photo navigation"
      aria-describedby="focused-photo-description"
      aria-busy={moving}
      data-photo-controls
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          select(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      <p className="sr-only" id="focused-photo-description" role="status">
        {moving
          ? `Moving to ${photo.title}.`
          : `${photo.title}. ${photo.alt} Photo ${index + 1} of ${photos.length}.`}
      </p>
      <button
        className={styles.previous}
        type="button"
        aria-label="Previous photo"
        onClick={() => select(-1)}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        className={styles.back}
        ref={back}
        type="button"
        onClick={onClose}
      >
        Back to stand
      </button>
      <button
        className={styles.next}
        type="button"
        aria-label="Next photo"
        onClick={() => select(1)}
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
