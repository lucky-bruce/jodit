/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import "./view-with-toolbar.less";

import {
	IViewWithToolbar,
	IToolbarCollection, Buttons
} from '../../types';
import { View } from './view';
import { isString, splitArray } from '../helpers';
import { STATUSES } from '../component';
import { Dom } from '../dom';
import { makeCollection } from '../../modules/toolbar/factory';

export abstract class ViewWithToolbar extends View implements IViewWithToolbar {
	toolbar: IToolbarCollection = makeCollection(this);

	private defaultToolbarContainer: HTMLElement = this.c.div(
		'jodit-toolbar__box'
	);

	/**
	 * Container for toolbar
	 */
	get toolbarContainer(): HTMLElement
	{
		if (
			!this.o.fullsize &&
			(isString(this.o.toolbar) ||
				Dom.isHTMLElement(this.o.toolbar, this.j.ow))
		) {
			return this.resolveElement(this.o.toolbar);
		}

		Dom.appendChildFirst(this.container, this.defaultToolbarContainer);
		return this.defaultToolbarContainer;
	}

	/**
	 * Change panel container
	 * @param element
	 */
	setPanel(element: HTMLElement | string): void {
		this.j.o.toolbar = element;
		this.buildToolbar();
	}

	/**
	 * Helper for append toolbar in its place
	 */
	protected buildToolbar(): void {
		if (!this.o.toolbar) {
			return;
		}

		const buttons = splitArray(this.o.buttons) as Buttons;

		this.toolbar
			.build(buttons.concat(this.o.extraButtons))
			.appendTo(this.toolbarContainer);
	}

	destruct() {
		this.setStatus(STATUSES.beforeDestruct);
		this.toolbar.destruct();
		delete this.toolbar;
		super.destruct();
	}
}
