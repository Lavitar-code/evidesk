import { Modal } from "./Modal";

type ConfirmDangerModalProps = {
  title: string;
  message: string;
  confirmLabel: string;
  isSubmitting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export function ConfirmDangerModal({
  title,
  message,
  confirmLabel,
  isSubmitting,
  onConfirm,
  onClose,
}: ConfirmDangerModalProps) {
  return (
    <Modal onClose={onClose} title={title}>
      <div className="confirm-danger-body">
        <p className="muted-text">{message}</p>

        <div className="form-actions">
          <button className="secondary-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="danger-btn"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            type="button"
          >
            {isSubmitting ? "Archiving..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}