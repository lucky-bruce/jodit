import './popup.less';

import autobind from 'autobind-decorator';

import { IBound, IPopup, IViewBased } from '../../../types';
import { Dom } from '../../dom';
import { attr, camelCase, css, isString, markOwner, position } from '../../helpers';
import { getContainer } from '../../global';
import { UIElement } from '../';

type getBoundFunc = () => IBound;

export class Popup extends UIElement implements IPopup {
	jodit!: IViewBased;
	isOpened: boolean = false;

	private getBound!: () => IBound;

	/**
	 * Set popup content
	 * @param content
	 */
	setContent(content: HTMLElement | string): this {
		Dom.detach(this.container);

		const box = this.j.c.div(`${this.componentName}__content`);
		box.appendChild(isString(content) ? this.j.c.fromHTML(content) : content);
		this.container.appendChild(box);

		return this;
	}

	/**
	 * Open popup near with some bound
	 *
	 * @param getBound
	 * @param keepPosition
	 */
	open(getBound: getBoundFunc, keepPosition: boolean = false): this {
		// this.j.e.fire(camelCase('close-all-popups'));
		this.jodit && markOwner(this.jodit, this.container);

		this.isOpened = true;
		this.addGlobalListeners();

		this.getBound = !keepPosition ? getBound : this.getKeepBound(getBound);

		getContainer(this.jodit || this, Popup.name).appendChild(this.container);

		this.updatePosition();

		this.j.e.fire(this, 'afterOpen');

		return this;
	}

	/**
	 * Calculate static bound for point
	 * @param getBound
	 */
	protected getKeepBound(getBound: getBoundFunc): getBoundFunc {
		const oldBound = getBound();
		let elmUnderCursor = this.od.elementFromPoint(
			oldBound.left,
			oldBound.top
		);

		if (!elmUnderCursor) {
			return getBound;
		}

		const element = Dom.isHTMLElement(elmUnderCursor, this.ow)
			? elmUnderCursor
			: (elmUnderCursor.parentElement as HTMLElement);

		const oldPos = position(element);

		return () => {
			const bound = getBound();
			const newPos = position(element);

			return {
				...bound,
				top: bound.top + (newPos.top - oldPos.top),
				left: bound.left + (newPos.left - oldPos.left)
			};
		};
	}

	/**
	 * Update container position
	 */
	@autobind
	protected updatePosition(): void {
		const pos = this.getBound();

		css(this.container, {
			left: pos.left,
			top: pos.top + pos.height
		});
	}

	/**
	 * Close popup
	 */
	@autobind
	close(): this {
		if (!this.isOpened) {
			return this;
		}

		this.removeGlobalListeners();

		this.isOpened = false;
		Dom.safeRemove(this.container);

		return this;
	}

	/**
	 * Close popup if click was in outside
	 * @param e
	 */
	@autobind
	private closeOnOutsideClick(e: MouseEvent): void {
		if (!this.isOpened) {
			return;
		}

		if (e.target && Dom.isOrContains(this.container, e.target as Node)) {
			return;
		}

		this.close();
	}

	private addGlobalListeners(): void {
		const up = this.updatePosition, ow = this.ow;

		this.j.e
			.on(camelCase('close-all-popups'), this.close)
			.on('escape', this.close)
			.on('resize', up)
			.on('mousedown touchstart', this.closeOnOutsideClick)
			.on(ow, 'mousedown touchstart', this.closeOnOutsideClick)
			.on(ow, 'mousedown touchstart', this.closeOnOutsideClick)
			.on(ow, 'scroll', up)
			.on(ow, 'resize', up);
	}

	private removeGlobalListeners(): void {
		const up = this.updatePosition, ow = this.ow;

		this.j.e
			.off(camelCase('close-all-popups'), this.close)
			.off('escape', this.close)
			.off('resize', up)
			.off('mousedown touchstart', this.closeOnOutsideClick)
			.off(ow, 'mousedown touchstart', this.closeOnOutsideClick)
			.off(ow, 'scroll', up)
			.off(ow, 'resize', up);
	}

	constructor(jodit: IViewBased) {
		super(jodit);
		attr(this.container, 'role', 'popup');
	}

	/** @override **/
	destruct(): any {
		this.close();
		return super.destruct();
	}
}
