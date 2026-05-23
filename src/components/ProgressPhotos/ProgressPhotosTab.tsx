/**
 * ProgressPhotosTab — Tab wrapper for ClientProfile integration.
 *
 * This is a thin adapter that wraps the main `<ProgressPhotos>` container
 * so it can be dropped into the existing ClientProfile tab system as the
 * 13th tab (after Goals). It:
 *
 *   • Receives `clientId` + optional `clientName` / `isTrainer` from the
 *     parent ClientProfile component.
 *   • Strips any extra tab-panel padding (the parent already adds it).
 *   • Delegates everything to `<ProgressPhotos>`.
 */

import ProgressPhotos from './ProgressPhotos';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProgressPhotosTabProps {
  /** Client document id — passed to the store for data loading */
  clientId: string;
  /** Display name shown in the header area */
  clientName?: string;
  /** When true, trainer annotation tools are surfaced */
  isTrainer?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Tab-friendly wrapper.
 *
 * The parent `<ClientProfile>` renders each tab panel inside a container
 * that already provides `p-6` (or similar) padding. We therefore use
 * `-m-6` (negative margin) to counteract that and let ProgressPhotos
 * own its own full-screen layout. If the parent panel doesn't add
 * padding, the wrapper is harmless.
 */
function ProgressPhotosTab({
  clientId,
  clientName,
  isTrainer = false,
}: ProgressPhotosTabProps) {
  return (
    <div className="-m-6">
      <ProgressPhotos
        clientId={clientId}
        clientName={clientName}
        isTrainer={isTrainer}
      />
    </div>
  );
}

export default ProgressPhotosTab;
