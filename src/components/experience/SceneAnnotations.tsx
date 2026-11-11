import { useState, type CSSProperties, type RefObject } from 'react';
import { photos } from '../../content/media';
import {
  sceneAnnotations,
  type AnnotationElements,
} from '../../lib/scene-annotations';
import styles from './SceneAnnotations.module.css';

interface Props {
  available: boolean;
  layer: RefObject<HTMLDivElement | null>;
  elements: RefObject<AnnotationElements>;
  drawingsTrigger: RefObject<HTMLButtonElement | null>;
  guitarTrigger: RefObject<HTMLButtonElement | null>;
  onDrawings: () => void;
  onGuitar: () => void;
  onPhoto: (id: string) => void;
}

export function SceneAnnotations({
  available,
  layer,
  elements,
  drawingsTrigger,
  guitarTrigger,
  onDrawings,
  onGuitar,
  onPhoto,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      hidden={!available}
      ref={layer}
      className={styles.layer}
      data-scene-annotations
      data-menu-open={menuOpen}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        const picker = event.currentTarget.querySelector('details[open]');
        if (picker instanceof HTMLDetailsElement) {
          picker.open = false;
          picker.querySelector('summary')?.focus();
        } else {
          setMenuOpen(false);
          event.currentTarget
            .querySelector<HTMLButtonElement>('[data-explore]')
            ?.focus();
        }
      }}
    >
      <button
        type="button"
        className={styles.explore}
        data-explore
        aria-expanded={menuOpen}
        aria-controls="stand-actions"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? 'Close explore' : 'Explore'}{' '}
        <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
      </button>
      <nav
        id="stand-actions"
        className={styles.items}
        aria-label="Stand interactions"
      >
        {sceneAnnotations.map(({ id, x, y }) => (
          <div
            key={id}
            ref={(element) => {
              elements.current[id] = element;
            }}
            className={styles.annotation}
            data-annotation={id}
            data-side={x < 0 ? 'left' : 'right'}
            style={
              {
                '--label-x': `${x}px`,
                '--label-y': `${y}px`,
              } as CSSProperties
            }
          >
            {id === 'work' && (
              <a className={styles.control} href="/work" data-annotation-work>
                Work <span aria-hidden="true">↗</span>
              </a>
            )}
            {id === 'photos' && (
              <details className={styles.picker} data-photo-picker>
                <summary className={styles.control}>
                  Photos <span aria-hidden="true">↗</span>
                </summary>
                <nav aria-label="Photos" className={styles.photos}>
                  {photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.original ?? photo.preview}
                      onClick={(event) => {
                        event.preventDefault();
                        onPhoto(photo.id);
                      }}
                    >
                      {photo.title}
                    </a>
                  ))}
                </nav>
              </details>
            )}
            {id === 'drawings' && (
              <button
                className={styles.control}
                ref={drawingsTrigger}
                type="button"
                aria-label="Drawings"
                onClick={onDrawings}
              >
                Drawings <span aria-hidden="true">↗</span>
              </button>
            )}
            {id === 'guitar' && (
              <button
                className={styles.control}
                ref={guitarTrigger}
                type="button"
                aria-label="Play Aldo's guitar video"
                onClick={onGuitar}
              >
                Guitar <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
