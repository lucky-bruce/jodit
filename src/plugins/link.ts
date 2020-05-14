/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { Config } from '../config';
import { Dom } from '../core/dom';
import {
	attr,
	convertMediaUrlToVideoEmbed,
	isURL,
	refs,
	stripTags
} from '../core/helpers/';
import { Select } from '../core/selection';
import { IDictionary, IJodit, IControlType, Nullable } from '../types';

/**
 * @property {object}  link `{@link link|link}` plugin's options
 * @property {boolean} link.followOnDblClick=true Follow lnk address after dblclick
 * @property {boolean} link.processVideoLink=true Replace inserted youtube/vimeo link toWYSIWYG `iframe`
 * @property {boolean} link.processPastedLink=true Wrap inserted link in &lt;a href="link">link&lt;/a>
 * @property {boolean} link.removeLinkAfterFormat=true When the button is pressed toWYSIWYG clean format,
 * if it was done on the link is removed like command `unlink`
 */

declare module '../config' {
	interface Config {
		link: {
			formTemplate: (editor: IJodit) => string;
			formClassName?: string;
			followOnDblClick: boolean;
			processVideoLink: boolean;
			processPastedLink: boolean;
			removeLinkAfterFormat: boolean;
			noFollowCheckbox: boolean;
			openInNewTabCheckbox: boolean;
		};
	}
}

Config.prototype.link = {
	formTemplate: (editor): string => {
		const i18n = editor.i18n.bind(editor);

		return `<form class="jodit-form">
			<div class="jodit-form__group">
				<input ref="url_input" class="jodit_input" required type="text" name="url" placeholder="http://" type="text"/>
			</div>
			<div ref="content_input_box" class="jodit-form__group">
				<input ref="content_input" class="jodit_input" name="text" placeholder="${i18n(
					'Text'
				)}" type="text"/>
			</div>
			<label ref="target_checkbox_box">
				<input ref="target_checkbox" class="jodit-checkbox" name="target" type="checkbox"/>
				<span>${i18n('Open in new tab')}</span>
			</label>
			<label ref="nofollow_checkbox_box">
				<input ref="nofollow_checkbox" class="jodit-checkbox" name="nofollow" type="checkbox"/>
				<span>${i18n('No follow')}</span>
			</label>
			<div class="jodit-buttons">
				<button ref="unlink" class="jodit-button jodit_unlink_button" type="button">${i18n(
					'Unlink'
				)}</button>
				<button ref="insert" class="jodit-button jodit_link_insert_button" type="submit">${i18n(
					'Insert'
				)}</button>
			</div>
		<form/>`;
	},
	followOnDblClick: true,
	processVideoLink: true,
	processPastedLink: true,
	removeLinkAfterFormat: true,
	noFollowCheckbox: true,
	openInNewTabCheckbox: true
};

Config.prototype.controls.unlink = {
	exec: (editor: IJodit, current: Node) => {
		const anchor: HTMLAnchorElement | false = Dom.closest(
			current,
			'a',
			editor.editor
		) as HTMLAnchorElement;

		if (anchor) {
			Dom.unwrap(anchor);
		}

		editor.e.fire('hidePopup');
	},
	tooltip: 'Unlink'
} as IControlType;

Config.prototype.controls.link = {
	isActive: (editor: IJodit): boolean => {
		const current = editor.selection.current();
		return Boolean(current && Dom.closest(current, 'a', editor.editor));
	},

	popup: (
		editor: IJodit,
		current: HTMLElement | false,
		self: IControlType,
		close: () => void
	) => {
		const i18n = editor.i18n.bind(editor),
			{
				openInNewTabCheckbox,
				noFollowCheckbox,
				formTemplate,
				formClassName
			} = editor.o.link,
			form = editor.c.fromHTML(formTemplate(editor), {
				target_checkbox_box: openInNewTabCheckbox,
				nofollow_checkbox_box: noFollowCheckbox
			}) as HTMLFormElement;

		const elements = refs(form),
			{ insert, unlink, content_input_box } = elements,
			{
				target_checkbox,
				nofollow_checkbox,
				url_input
			} = elements as IDictionary<HTMLInputElement>,
			currentElement = current,
			isImageContent = Dom.isImage(currentElement, editor.editorWindow);

		let { content_input } = elements as IDictionary<HTMLInputElement>;

		if (!content_input) {
			content_input = editor.c.element('input', {
				type: 'hidden',
				ref: 'content_input'
			});
		}

		if (formClassName) {
			form.classList.add(formClassName);
		}

		if (isImageContent) {
			Dom.hide(content_input_box);
		}

		let link: false | HTMLAnchorElement;

		const getSelectionText = () =>
			link
				? link.innerText
				: stripTags(
						editor.selection.range.cloneContents(),
						editor.editorDocument
				  );

		if (current && Dom.closest(current, 'a', editor.editor)) {
			link = Dom.closest(
				current,
				'a',
				editor.editor
			) as HTMLAnchorElement;
		} else {
			link = false;
		}

		if (!isImageContent && current) {
			content_input.value = getSelectionText();
		}

		if (link) {
			url_input.value = attr(link, 'href') || '';

			if (openInNewTabCheckbox && target_checkbox) {
				target_checkbox.checked = attr(link, 'target') === '_blank';
			}

			if (noFollowCheckbox && nofollow_checkbox) {
				nofollow_checkbox.checked = attr(link, 'rel') === 'nofollow';
			}

			insert.textContent = i18n('Update');
		} else {
			Dom.hide(unlink);
		}

		const snapshot = editor.observer.snapshot.make();

		if (unlink) {
			editor.e.on(unlink, 'click', (e: MouseEvent) => {
				editor.observer.snapshot.restore(snapshot);

				if (link) {
					Dom.unwrap(link);
				}

				close();
				e.preventDefault();
			});
		}

		editor.e.on(form, 'submit', (event: Event) => {
			event.preventDefault();
			event.stopImmediatePropagation();

			if (!url_input.value.trim().length) {
				url_input.focus();
				url_input.classList.add('jodit_error');
				return false;
			}

			let links: HTMLAnchorElement[];

			editor.observer.snapshot.restore(snapshot);

			const textWasChanged =
				getSelectionText() !== content_input.value.trim();

			if (!link) {
				if (!editor.selection.isCollapsed()) {
					links = editor.selection.wrapInTag(
						'a'
					) as HTMLAnchorElement[];
				} else {
					const a = editor.createInside.element('a');
					editor.selection.insertNode(a);
					links = [a];
				}
			} else {
				links = [link];
			}

			links.forEach(a => {
				a.setAttribute('href', url_input.value);

				if (!isImageContent) {
					if (content_input.value.trim().length) {
						if (textWasChanged) {
							a.textContent = content_input.value;
						}
					} else {
						a.textContent = url_input.value;
					}
				}

				if (openInNewTabCheckbox && target_checkbox) {
					if (target_checkbox.checked) {
						a.setAttribute('target', '_blank');
					} else {
						a.removeAttribute('target');
					}
				}

				if (noFollowCheckbox && nofollow_checkbox) {
					if (nofollow_checkbox.checked) {
						a.setAttribute('rel', 'nofollow');
					} else {
						a.removeAttribute('rel');
					}
				}
			});

			close();
			return false;
		});

		return form;
	},
	tags: ['a'],
	tooltip: 'Insert link'
} as IControlType;

/**
 * Process link. Insert, dbclick or remove format
 *
 * @module plugins/link
 */
export function link(jodit: IJodit) {
	if (jodit.o.link.followOnDblClick) {
		jodit.e.on('afterInit changePlace', () => {
			jodit.e.off('dblclick.link').on(
				jodit.editor,
				'dblclick.link',
				function(this: HTMLAnchorElement, e: MouseEvent) {
					const href = attr(this, 'href');

					if (href) {
						location.href = href;
						e.preventDefault();
					}
				},
				'a'
			);
		});
	}

	if (jodit.o.link.processPastedLink) {
		jodit.e.on(
			'processPaste.link',
			(event: ClipboardEvent, html: string): HTMLAnchorElement | void => {
				if (isURL(html)) {
					if (jodit.o.link.processVideoLink) {
						const embed = convertMediaUrlToVideoEmbed(html);

						if (embed !== html) {
							return jodit.createInside.fromHTML(
								embed
							) as HTMLAnchorElement;
						}
					}

					const a = jodit.createInside.element('a');

					a.setAttribute('href', html);
					a.textContent = html;

					return a;
				}
			}
		);
	}

	if (jodit.o.link.removeLinkAfterFormat) {
		jodit.e.on('afterCommand.link', (command: string) => {
			const sel: Select = jodit.selection;

			let newtag: Node, node: Nullable<Node>;

			if (command === 'removeFormat') {
				node = sel.current();
				if (node && !Dom.isTag(node, 'a')) {
					node = Dom.closest(node, 'a', jodit.editor);
				}
				if (Dom.isTag(node, 'a')) {
					if (node.innerHTML === node.textContent) {
						newtag = jodit.createInside.text(
							(node as HTMLElement).innerHTML
						);
					} else {
						newtag = jodit.createInside.element('span');
						(newtag as HTMLElement).innerHTML = (node as HTMLElement).innerHTML;
					}

					if (node.parentNode) {
						node.parentNode.replaceChild(newtag, node);
						jodit.selection.setCursorIn(newtag, true);
					}
				}
			}
		});
	}
}
