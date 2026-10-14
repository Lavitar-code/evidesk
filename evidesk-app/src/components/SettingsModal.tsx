import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { exportWorkspaceBackup, importWorkspaceBackup } from "../lib/tauri";
import type { AppPreferences } from "../types/preferences";

type SettingsModalProps = {
  preferences: AppPreferences;
  onClose: () => void;
  onToggleCompactMode: (value: boolean) => void;
  onToggleReducedMotion: (value: boolean) => void;
  onToggleShowCommandHint: (value: boolean) => void;
  onToggleAutoOpenDetailPanel: (value: boolean) => void;
  onReset: () => void;
  onBackupExported: (message: string) => void;
  onBackupImported: (message: string) => void;
  onBackupError: (message: string) => void;
};

export function SettingsModal({
  preferences,
  onClose,
  onToggleCompactMode,
  onToggleReducedMotion,
  onToggleShowCommandHint,
  onToggleAutoOpenDetailPanel,
  onReset,
  onBackupExported,
  onBackupImported,
  onBackupError,
}: SettingsModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExportBackup() {
    try {
      setIsExporting(true);
      const result = await exportWorkspaceBackup();
      onBackupExported(`Backup exported to ${result.path}`);
    } catch (error) {
      onBackupError(String(error));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportBackup() {
    try {
      setIsImporting(true);

      const selectedPath = await open({
        multiple: false,
        filters: [
          {
            name: "JSON Backup",
            extensions: ["json"],
          },
        ],
      });

      if (!selectedPath || Array.isArray(selectedPath)) {
        return;
      }

      await importWorkspaceBackup(selectedPath);
      onBackupImported(`Backup imported from ${selectedPath}`);
    } catch (error) {
      onBackupError(String(error));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card settings-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Workspace Settings</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-stack">
            <div className="settings-section">
              <p className="detail-label">Interface</p>

              <SettingToggle
                checked={preferences.compactMode}
                copy="Reduce spacing and card density for higher information throughput."
                label="Compact mode"
                onChange={onToggleCompactMode}
              />

              <SettingToggle
                checked={preferences.reducedMotion}
                copy="Reduce transitions and animated emphasis across the workspace."
                label="Reduced motion"
                onChange={onToggleReducedMotion}
              />
            </div>

            <div className="settings-section">
              <p className="detail-label">Workflow</p>

              <SettingToggle
                checked={preferences.showCommandHint}
                copy="Show the Ctrl/Cmd + K hint in the UI when available."
                label="Show command palette hint"
                onChange={onToggleShowCommandHint}
              />

              <SettingToggle
                checked={preferences.autoOpenDetailPanel}
                copy="Keep detail behavior optimized for quick inspection workflows."
                label="Auto-open detail panel"
                onChange={onToggleAutoOpenDetailPanel}
              />
            </div>

            <div className="settings-section">
              <p className="detail-label">Backup</p>

              <div className="settings-actions-grid">
                <button
                  className="secondary-btn"
                  disabled={isExporting}
                  onClick={() => void handleExportBackup()}
                  type="button"
                >
                  {isExporting ? "Exporting..." : "Export workspace backup"}
                </button>

                <button
                  className="secondary-btn"
                  disabled={isImporting}
                  onClick={() => void handleImportBackup()}
                  type="button"
                >
                  {isImporting ? "Importing..." : "Import workspace backup"}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button className="secondary-btn" onClick={onReset} type="button">
                Reset defaults
              </button>

              <button className="primary-btn" onClick={onClose} type="button">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SettingToggleProps = {
  label: string;
  copy: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function SettingToggle({
  label,
  copy,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="setting-toggle-row">
      <div className="setting-toggle-copy">
        <strong>{label}</strong>
        <p>{copy}</p>
      </div>

      <button
        aria-pressed={checked}
        className={`setting-toggle ${checked ? "is-active" : ""}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className="setting-toggle-thumb" />
      </button>
    </div>
  );
}