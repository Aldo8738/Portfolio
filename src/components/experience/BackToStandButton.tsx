import type { RefObject } from 'react';
import styles from './PhotoControls.module.css';

interface Props {
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  autoFocus?: boolean;
}

export function BackToStandButton({
  onClick,
  buttonRef,
  autoFocus = false,
}: Props) {
  return (
    <button
      className={styles.back}
      ref={buttonRef}
      type="button"
      autoFocus={autoFocus}
      onClick={onClick}
    >
      <span aria-hidden="true">←</span> Back to stand
    </button>
  );
}
