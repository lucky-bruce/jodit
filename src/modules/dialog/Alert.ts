/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */
import { Dialog } from './Dialog';
import { dom } from '../helpers/Helpers';
import { ToolbarIcon } from '..';
import { Jodit } from '../../Jodit';

/**
 * Show `alert` dialog. Work without Jodit object
 *
 * @method Alert
 * @param {string} msg Message
 * @param {string|function} [title] Title or callback
 * @param {function} [callback] callback
 * @param {string} [className]
 * @example
 * ```javascript
 * Jodit.Alert("File was uploaded");
 * Jodit.Alert("File was uploaded", "Message");
 * Jodit.Alert("File was uploaded", function() {
 *    $('form').hide();
 * });
 * Jodit.Alert("File wasn't uploaded", "Error", function() {
 *    $('form').hide();
 * });
 * ```
 */
export const Alert = (
    msg: string | HTMLElement,
    title?: string | (() => void | false),
    callback?: string | ((dialog: Dialog) => void | false),
    className: string = 'jodit_alert'
): Dialog => {
    if (typeof title === 'function') {
        callback = title;
        title = undefined;
    }

    const dialog: Dialog = new Dialog(),
        $div: HTMLDivElement = dom(
            '<div class="' + className + '"></div>',
            dialog.document
        ) as HTMLDivElement,
        $ok: HTMLAnchorElement = dom(
            '<a href="javascript:void(0)" style="float:right;" class="jodit_button">' +
                ToolbarIcon.getIcon('cancel') +
                '<span>' +
                Jodit.prototype.i18n('Ok') +
                '</span></a>',
            dialog.document
        ) as HTMLAnchorElement;

    $div.appendChild(dom(msg, dialog.document));

    $ok.addEventListener('click', () => {
        if (
            !callback ||
            typeof callback !== 'function' ||
            callback(dialog) !== false
        ) {
            dialog.close();
        }
    });

    dialog.setFooter([$ok]);

    dialog.open($div, (title as string) || '&nbsp;', true, true);
    $ok.focus();

    return dialog;
};

(Jodit as any).Alert = Alert;
