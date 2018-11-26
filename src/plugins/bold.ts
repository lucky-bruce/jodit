/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { Config } from '../Config';
import { Jodit } from '../Jodit';
import { IDictionary } from '../types';
import { IControlType } from '../types/toolbar';

Config.prototype.controls.subscript = {
    tags: ['sub'],
    tooltip: 'subscript',
} as IControlType;

Config.prototype.controls.superscript = {
    tags: ['sup'],
    tooltip: 'superscript',
} as IControlType;

Config.prototype.controls.bold = {
    tagRegExp: /^(strong|b)$/i,
    tags: ['strong', 'b'],
    css: {
        'font-weight': ['bold', '700'],
    },
    tooltip: 'Bold',
} as IControlType;

Config.prototype.controls.italic = {
    tagRegExp: /^(em|i)$/i,
    tags: ['em', 'i'],
    css: {
        'font-style': 'italic',
    },
    tooltip: 'Italic',
} as IControlType;

Config.prototype.controls.underline = {
    tagRegExp: /^(u)$/i,
    tags: ['u'],
    css: {
        'text-decoration': 'underline',
    },
    tooltip: 'Underline',
} as IControlType;
Config.prototype.controls.strikethrough = {
    tagRegExp: /^(s)$/i,
    tags: ['s'],
    css: {
        'text-decoration': 'line-through',
    },
    tooltip: 'Strike through',
} as IControlType;

/**
 * Bold plugin - change B to Strong, i to Em
 */
export function bold(editor: Jodit) {
    const callBack = (command: string): false | void => {
        const control: IControlType = Jodit.defaultOptions.controls[
                command
            ] as IControlType,
            cssOptions:
                | IDictionary<string | string[]>
                | IDictionary<(editor: Jodit, value: string) => boolean> = {
                ...control.css,
            },
            cssRules: IDictionary<string> = {};

        Object.keys(cssOptions).forEach((key: string) => {
            cssRules[key] = Array.isArray(cssOptions[key])
                ? (cssOptions[key] as any)[0]
                : cssOptions[key];
        });

        editor.selection.applyCSS(
            cssRules,
            control.tags ? control.tags[0] : undefined,
            control.css as any
        );

        editor.setEditorValue();
        return false;
    };

    editor
        .registerCommand('bold', {
            exec: callBack,
            hotkeys: ['ctrl+b', 'cmd+b'],
        })

        .registerCommand('italic', {
            exec: callBack,
            hotkeys: ['ctrl+i', 'cmd+i'],
        })

        .registerCommand('underline', {
            exec: callBack,
            hotkeys: ['ctrl+u', 'cmd+u'],
        })

        .registerCommand('strikethrough', {
            exec: callBack,
        });
}
