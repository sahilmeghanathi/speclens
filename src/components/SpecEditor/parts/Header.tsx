import { memo } from 'react';

interface HeaderProps {
  readonly onSave?: () => void;
}

/**
 * Header component with controls for spec editor.
 * Memoized to prevent unnecessary re-renders.
 */
const HeaderComponent = memo(function Header({ onSave }: HeaderProps) {
  return (
    <div className="spec-editor-header">
      <div className="spec-editor-header-title">
        {' 📋 '}
        Spec Editor
      </div>
      <div className="spec-editor-header-actions">
        <button
          className="spec-editor-button primary"
          onClick={onSave}
          type="button"
          aria-label="Save spec"
        >
          💾 Save
        </button>
      </div>
    </div>
  );
});

HeaderComponent.displayName = 'Header';

export const Header = HeaderComponent;
