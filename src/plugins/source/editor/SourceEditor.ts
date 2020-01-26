/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Licensed under GNU General Public License version 2 or later or a commercial license or MIT;
 * For MIT see LICENSE-MIT.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { CallbackFunction, IJodit } from '../../../types';

export abstract class SourceEditor<T> {
	instance: T;
	className: string = '';

	constructor(
		readonly jodit: IJodit,
		readonly container: HTMLElement,
		readonly toWYSIWYG: CallbackFunction,
		readonly fromWYSIWYG: CallbackFunction
	) {}

	abstract init(editor: IJodit): void;

	isReady: boolean = false;
	protected onReady() {
		this.isReady = true;
		this.jodit.events.fire(this, 'ready');
	}

	onReadyAlways(onReady: CallbackFunction) {
		if (!this.isReady) {
			this.jodit.events?.on(this, 'ready', onReady);
		} else {
			onReady();
		}
	}
}
