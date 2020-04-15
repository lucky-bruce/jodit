/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { IDictionary, IJodit, IViewBased } from '../types';
import { PluginSystem } from './pluginSystem';
import { Dom } from './dom';
import { kebabCase } from './helpers/string';

export const instances: IDictionary<IJodit> = {};

/**
 * Emits events in all instances
 *
 * @param events
 * @param args
 */
export function fireEach(events: string, ...args: any[]) {
	Object.keys(instances).forEach(key => {
		const editor = instances[key];

		if (!editor.isDestructed && editor.events) {
			editor.events.fire(events, ...args);
		}
	});
}

let counter = 1;

/**
 * Generate global unique uid
 */
export function uniqueUid(): string {
	counter += 10 * (Math.random() + 1);
	return Math.round(counter).toString(16);
}

export const pluginSystem = new PluginSystem();

export const modules: IDictionary<Function> = {};

export const lang: IDictionary<IDictionary<string>> = {};

const boxes = new WeakMap<IViewBased, IDictionary<HTMLElement>>();

/**
 * Create unique box(HTMLCotainer) and remove it after destroy
 *
 * @param jodit
 * @param name
 */
export function getContainer(jodit: IViewBased, name: string): HTMLElement {
	const data = boxes.get(jodit) || {};

	if (!data[name]) {
		const box = jodit.create.div(`jodit-${kebabCase(name)}-container`);

		jodit.ownerDocument.body.appendChild(box);

		data[name] = box;

		jodit.events.on('beforeDestruct', () => {
			Dom.safeRemove(box);
			delete data[name];

			if (Object.keys(data).length) {
				boxes.delete(jodit);
			}
		});


		boxes.set(jodit, data);
	}

	return data[name];
}
