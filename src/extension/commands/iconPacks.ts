import { window as codeWindow, type QuickPickItem } from 'vscode';
import { logger, toTitleCase, translate } from '../../core';
import { availableIconPacks } from '../../core/helpers/iconPacks';
import type { IconPackValue } from '../../core/models/icons/iconPack';
import { getThemeConfig, setThemeConfig } from '../shared/config';

/** Command to toggle the icons packs */
export const toggleIconPacks = async () => {
  try {
    const activeIconPacks = getActiveIconPack();
    const response = await showQuickPickItems(activeIconPacks);
    if (response) {
      handleQuickPickActions(response, activeIconPacks);
    }
  } catch (error) {
    logger.error(error);
  }
};

/** Show QuickPick items to select preferred configuration for the icon packs. */
const showQuickPickItems = (activePacks: string[]) => {
  const packs = [...availableIconPacks.sort(), 'none'] as (
    | IconPackValue
    | 'none'
  )[];
  const options = packs.map((pack): QuickPickItem => {
    const packLabel = toTitleCase(pack.replace('_', ' + '));
    const active = isPackActive(activePacks, pack);
    const iconPacksDeactivated = pack === 'none' && activePacks.length === 0;

    return {
      description: packLabel,
      detail: translate(
        `iconPacks.${pack === 'none' ? 'disabled' : 'description'}`,
        packLabel
      ),
      label: iconPacksDeactivated ? '\u2714' : active ? '\u2714' : '\u25FB',
    };
  });

  return codeWindow.showQuickPick(options, {
    placeHolder: translate('iconPacks.selectPack'),
    ignoreFocusOut: false,
    matchOnDescription: true,
    matchOnDetail: true,
  });
};

/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (
  value: QuickPickItem,
  currentActive: string[] | undefined
) => {
  if (!value || !value.description) return;
  const decision = value.description.replace(' + ', '_').toLowerCase() as
    | IconPackValue
    | 'none';

  const activeArr = Array.isArray(currentActive) ? currentActive : [];

  if (decision === 'none') {
    setThemeConfig('activeIconPack', [], true);
    return;
  }

  // Toggle logic: add if not present, remove if present
  let newActive: string[];
  if (activeArr.includes(decision)) {
    newActive = activeArr.filter((p) => p !== decision);
  } else {
    newActive = [...activeArr, decision];
  }
  // Defensive: always pass an array of strings
  if (!Array.isArray(newActive)) newActive = [decision];
  newActive = newActive.filter((v): v is string => typeof v === 'string');
  setThemeConfig('activeIconPack', newActive, true);
};

const getActiveIconPack = () => {
  const value = getThemeConfig('activeIconPack');
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
};

const isPackActive = (activePack: string[] | string, pack: string) => {
  if (Array.isArray(activePack)) {
    // Defensive: filter out non-string values
    return activePack
      .filter((p): p is string => typeof p === 'string')
      .map((p) => p.toLowerCase())
      .includes(pack.toLowerCase());
  }
  return (
    typeof activePack === 'string' &&
    activePack.toLowerCase() === pack.toLowerCase()
  );
};
