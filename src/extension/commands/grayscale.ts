import { window as codeWindow, type QuickPickItem } from 'vscode';
import { logger, translate } from '../../core';
import { getThemeConfig, setThemeConfig } from '../shared/config';

/** Command to toggle grayscale. */
export const toggleGrayscale = async () => {
  try {
    const status = checkGrayscaleStatus();
    const response = await showQuickPickItems(status);
    if (response) {
      handleQuickPickActions(response);
    }
  } catch (error) {
    logger.error(error);
  }
};

/** Show QuickPick items to select preferred configuration for grayscale icons. */
const showQuickPickItems = (status: boolean) => {
  const on: QuickPickItem = {
    description: translate('toggleSwitch.on'),
    detail: translate('grayscale.enable'),
    label: status ? '\u2714' : '\u25FB',
  };
  const off: QuickPickItem = {
    description: translate('toggleSwitch.off'),
    detail: translate('grayscale.disable'),
    label: !status ? '\u2714' : '\u25FB',
  };
  return codeWindow.showQuickPick([on, off], {
    placeHolder: translate('grayscale.toggle'),
    ignoreFocusOut: false,
    matchOnDescription: true,
  });
};

/** Handle the actions from the QuickPick. */
const handleQuickPickActions = (value: QuickPickItem) => {
  if (!value || !value.description) return;
  switch (value.description) {
    case translate('toggleSwitch.on'): {
      return setThemeConfig('saturation', 0, true);
    }
    case translate('toggleSwitch.off'): {
      return setThemeConfig('saturation', 1, true);
    }
    default:
      return;
  }
};

/** Is grayscale icons enabled? */
export const checkGrayscaleStatus = (): boolean => {
  return getThemeConfig<number>('saturation') === 0;
};
