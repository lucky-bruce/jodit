/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Licensed under GNU General Public License version 2 or later or a commercial license or MIT;
 * For MIT see LICENSE-MIT.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 *  Inserts HTML line breaks before all newlines in a string
 * @param html
 */
export const nl2br = (html: string): string => {
	return html.replace(/([^>])([\n\r]+)/g, '$1<br/>$2');
};
