/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { Jodit } from '../../Jodit';
import { IControlType, IControlTypeStrong } from '../../types/toolbar';
import { IViewBased } from '../../types/view';
import { each } from '../helpers/Helpers';
import { ToolbarButton } from './button';
import { ToolbarCollection } from './collection';
import { ToolbarPopup } from './popup';

export class ToolbarList extends ToolbarPopup {
    private defaultControl = {
        template: (editor: Jodit, key: string, value: string) =>
            this.jodit.i18n(value),
    };

    protected doClose() {
        if (this.toolbar) {
            this.toolbar.destruct();
        }
    }

    protected getContainer = () => this.toolbar.container;

    protected doOpen(control: IControlTypeStrong) {
        this.toolbar = new ToolbarCollection(this.jodit);

        const list: any =
            typeof control.list === 'string'
                ? control.list.split(/[\s,]+/)
                : control.list;

        each<string>(list, (key, value) => {
            let button: ToolbarButton;

            if (this.jodit.options.controls[value] !== undefined) {
                button = new ToolbarButton(
                    this.jodit,
                    {
                        name: value.toString(),
                        ...this.jodit.options.controls[value],
                    },
                    this.current
                ); // list like array {"align": {list: ["left", "right"]}}
            } else if (
                this.jodit.options.controls[key] !== undefined &&
                typeof value === 'object'
            ) {
                button = new ToolbarButton(
                    this.jodit,
                    {
                        name: key.toString(),
                        ...this.jodit.options.controls[key],
                        ...(value as IControlType),
                    },
                    this.current
                ); // list like object {"align": {list: {"left": {exec: alert}, "right": {}}}}
            } else {
                button = new ToolbarButton(
                    this.jodit,
                    {
                        name: key.toString(),
                        exec: control.exec,
                        command: control.command,
                        isActive: control.isActiveChild,
                        isDisable: control.isDisableChild,
                        mode: control.mode,
                        args: [
                            (control.args && control.args[0]) || key,
                            (control.args && control.args[1]) || value,
                        ],
                    },
                    this.current
                ); // list like object {"align": {list: {"left": {exec: alert}, "right": {}}}}

                const template =
                    control.template || this.defaultControl.template;

                button.textBox.innerHTML = template(
                    this.jodit,
                    key.toString(),
                    value
                );
            }

            this.toolbar.appendChild(button);
        });

        this.container.appendChild(this.toolbar.container);
        this.container.style.marginLeft = null;

        this.toolbar.checkActiveButtons();
    }

    public toolbar: ToolbarCollection;

    constructor(
        jodit: IViewBased,
        readonly target: HTMLElement,
        readonly current?: HTMLElement,
        readonly className: string = 'jodit_toolbar_list'
    ) {
        super(jodit, target, current, className);
    }
}
