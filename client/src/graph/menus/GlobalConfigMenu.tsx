import { useEffect, useState } from "react";
import { CollapsibleSection } from "../../components/CollapsibleSection";
import { useGlobalConfig } from "../../context/globalConfig/useGlobalConfig";
import type { KeyboardAction } from "../../types";
import "./Menus.css";
import type { NodeActions } from "../useGraphNodes";

interface GlobalConfigMenuProps {
    nodeActions: NodeActions;
};

export function GlobalConfigMenu({nodeActions}: GlobalConfigMenuProps) {
    const config = useGlobalConfig();
    
    useEffect(() => {
        nodeActions.updateLabels();
    }, [config.showLabel, config.useIdAsLabel, nodeActions]);

    const [editingAction, setEditingAction] = useState<KeyboardAction | null>(null);
    const [newKey, setNewKey] = useState("");
    const [modifiers, setModifiers] = useState({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
    });

    const handleStartEdit = (action: KeyboardAction) => {
        const shortcut = config.getShortcutByAction(action);
        if (shortcut) {
        setEditingAction(action);
        setNewKey(shortcut.key);
        setModifiers({
            ctrlKey: shortcut.ctrlKey || false,
            altKey: shortcut.altKey || false,
            shiftKey: shortcut.shiftKey || false,
        });
        }
    };

    const handleSave = () => {
        if (editingAction && newKey) {
        config.updateShortcut(editingAction, newKey, modifiers);
        setEditingAction(null);
        setNewKey("");
        setModifiers({ ctrlKey: false, altKey: false, shiftKey: false });
        }
    };

    const handleCancel = () => {
        setEditingAction(null);
        setNewKey("");
        setModifiers({ ctrlKey: false, altKey: false, shiftKey: false });
    };

    const formatShortcut = (shortcut: ReturnType<typeof config.getShortcutByAction>) => {
        if (!shortcut) return "";
        const parts = [];
        if (shortcut.ctrlKey) parts.push("Ctrl");
        if (shortcut.altKey) parts.push("Alt");
        if (shortcut.shiftKey) parts.push("Shift");
        parts.push(shortcut.key.toUpperCase());
        return parts.join(" + ");
    };

    return (
        <div className="params">
            <CollapsibleSection title="Layout">
                <div className="params-group">
                    <label htmlFor="useNoise">Show label?: </label>
                    <input 
                        id="useNoise"
                        type="checkbox" 
                        checked={config.showLabel}
                        onChange={(e) => {
                            config.updateShowLabel(e.target.checked);
                            nodeActions.updateLabels();
                        }}
                    />
                    <label htmlFor="useNoise">Use Id as label?: </label>
                    <input 
                        id="useNoise"
                        type="checkbox" 
                        checked={config.useIdAsLabel}
                        onChange={(e) => { 
                            config.updateUseIdAsLabel(e.target.checked);
                            nodeActions.updateLabels();
                        }}
                    />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Keyboard Shortcuts">
                <div className="shortcuts-list">
                {config.keyboardShortcuts.map((shortcut) => {
                    const hasConflict = config.hasConflict(shortcut.action);
                    const conflictingActions = config.getConflictingActions(shortcut.action);

                    return (
                    <div key={shortcut.action} className="shortcut-item">
                        {editingAction === shortcut.action ? (
                        <div className="shortcut-edit">
                            <span className="shortcut-description">{shortcut.description}:</span>
                            <div className="shortcut-input-group">
                            <label>
                                <input
                                type="checkbox"
                                checked={modifiers.ctrlKey}
                                onChange={(e) => setModifiers(m => ({ ...m, ctrlKey: e.target.checked }))}
                                />
                                Ctrl
                            </label>
                            <label>
                                <input
                                type="checkbox"
                                checked={modifiers.altKey}
                                onChange={(e) => setModifiers(m => ({ ...m, altKey: e.target.checked }))}
                                />
                                Alt
                            </label>
                            <label>
                                <input
                                type="checkbox"
                                checked={modifiers.shiftKey}
                                onChange={(e) => setModifiers(m => ({ ...m, shiftKey: e.target.checked }))}
                                />
                                Shift
                            </label>
                            <input
                                type="text"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                placeholder="Key"
                                maxLength={1}
                                className="key-input"
                            />
                            </div>
                            <div className="shortcut-actions">
                            <button onClick={handleSave}>Save</button>
                            <button onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                        ) : (
                        <div className="shortcut-view">
                            <span className="shortcut-description">{shortcut.description}:</span>
                            <span className={`shortcut-keys ${hasConflict ? 'conflict' : ''}`}>
                                {formatShortcut(shortcut)}
                            </span>
                            <button onClick={() => handleStartEdit(shortcut.action)}>Edit</button>
                            {hasConflict && (
                            <span className="conflict-warning" title={`Conflicts with: ${conflictingActions.join(', ')}`}>
                            </span>
                            )}
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
                <button onClick={config.resetToDefaults} className="reset-button">
                Reset to Defaults
                </button>
            </CollapsibleSection>
        </div>
    );
}