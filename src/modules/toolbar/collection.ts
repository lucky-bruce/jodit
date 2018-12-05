/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { Jodit } from '../../Jodit';
import { IDictionary } from '../../types';
import {
    Buttons,
    Controls,
    IControlType,
    IControlTypeStrong,
} from '../../types/toolbar';
import { IViewBased } from '../../types/view';
import { debounce } from '../helpers/Helpers';
import { ToolbarBreak } from './break';
import { ToolbarButton } from './button';
import { ToolbarElement } from './element';
import { ToolbarSeparator } from './separator';
import { Dom } from '../Dom';

export class ToolbarCollection extends ToolbarElement {
    private __buttons: ToolbarElement[] = [];

    private __getControlType = (
        button: IControlType | string
    ): IControlTypeStrong => {
        let buttonControl: IControlTypeStrong;
        const controls: Controls =
            this.jodit.options.controls || Jodit.defaultOptions.controls;

        if (typeof button !== 'string') {
            buttonControl = { name: 'empty', ...button };
            if (controls[buttonControl.name] !== undefined) {
                buttonControl = {
                    ...controls[buttonControl.name],
                    ...buttonControl,
                };
            }
        } else {
            const list: string[] = button.split(/\./);

            let store: IDictionary<IControlType> = controls;

            if (list.length > 1) {
                if (controls[list[0]] !== undefined) {
                    store = controls[list[0]] as IDictionary<IControlType>;
                    button = list[1];
                }
            }

            if (store[button] !== undefined) {
                buttonControl = { name: button, ...store[button] };
            } else {
                buttonControl = {
                    name: button,
                    command: button,
                    tooltip: button,
                };
            }
        }

        return buttonControl;
    };

    private closeAll = () => {
        this.jodit &&
            this.jodit.events &&
            this.jodit.events.fire('closeAllPopups');
    };

    private initEvents = () => {
        this.jodit.events
            .on(this.jodit.ownerWindow, 'mousedown touchend', this.closeAll)
            .on(this.listenEvents, this.checkActiveButtons)
            .on('afterSetMode focus', this.immedateCheckActiveButtons);
    };

    public readonly listenEvents: string =
        'changeStack mousedown mouseup keydown change afterInit readonly afterResize ' +
        'selectionchange changeSelection focus afterSetMode touchstart';

    public getButtonsList(): string[] {
        return this.__buttons
            .map((a: ToolbarElement) =>
                a instanceof ToolbarButton ? a.control.name : ''
            )
            .filter(a => a !== '');
    }

    public appendChild(button: ToolbarElement) {
        this.__buttons.push(button);
        button.parentToolbar = this;
        this.container.appendChild(button.container);
    }

    public removeChild(button: ToolbarElement) {
        const index: number = this.__buttons.indexOf(button);

        if (index !== -1) {
            this.__buttons.splice(index, 1);
            if (button.container.parentNode === this.container) {
                Dom.safeRemove(button.container);
            }
        }

        button.parentToolbar = null;
    }

    public build(
        buttons: Buttons,
        container: HTMLElement,
        target?: HTMLElement
    ) {
        let lastBtnSeparator: boolean = false;
        this.clear();
        const buttonsList: Array<IControlType | string> =
            typeof buttons === 'string' ? buttons.split(/[,\s]+/) : buttons;

        buttonsList
            .map(this.__getControlType)
            .forEach((buttonControl: IControlTypeStrong) => {
                let button: ToolbarElement | null = null;

                if (
                    this.jodit.options.removeButtons.indexOf(
                        buttonControl.name
                    ) !== -1
                ) {
                    return;
                }

                switch (buttonControl.name) {
                    case '\n':
                        button = new ToolbarBreak(this.jodit);
                        break;
                    case '|':
                        if (!lastBtnSeparator) {
                            lastBtnSeparator = true;
                            button = new ToolbarSeparator(this.jodit);
                        }
                        break;
                    default:
                        lastBtnSeparator = false;
                        button = new ToolbarButton(
                            this.jodit,
                            buttonControl,
                            target
                        );
                }

                if (button) {
                    this.appendChild(button);
                }
            });

        if (this.container.parentNode !== container) {
            container.appendChild(this.container);
        }

        this.immedateCheckActiveButtons();
    }

    public clear() {
        // in removeChild __buttons is changed
        [...this.__buttons].forEach((button: ToolbarElement) => {
            this.removeChild(button);
            button.destruct();
        });

        this.__buttons.length = 0;
    }

    public immedateCheckActiveButtons = () => {
        if (this.jodit.isLocked()) {
            return;
        }
        (this.__buttons.filter(
            (button: ToolbarElement) => button instanceof ToolbarButton
        ) as ToolbarButton[]).forEach((button: ToolbarButton) => {
            button.disable = button.isDisable();

            if (!button.disable) {
                button.active = button.isActive();
            }

            if (typeof button.control.getLabel === 'function') {
                button.control.getLabel(this.jodit, button.control, button);
            }
        });

        this.jodit.events && this.jodit.events.fire('updateToolbar');
    };

    public destruct() {
        this.jodit.events
            .off(this.jodit.ownerWindow, 'mousedown touchstart', this.closeAll)
            .off(this.listenEvents, this.checkActiveButtons)
            .off('afterSetMode focus', this.immedateCheckActiveButtons);

        this.clear();
        super.destruct();
    }

    public checkActiveButtons = debounce(
        this.immedateCheckActiveButtons,
        this.jodit.defaultTimeout
    );

    constructor(jodit: IViewBased) {
        super(jodit, 'ul', 'jodit_toolbar');
        this.initEvents();
    }
}
