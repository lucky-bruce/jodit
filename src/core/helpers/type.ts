/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2021 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * Helper for create Error object
 * @param message
 */
export function error(message: string): Error {
	return new TypeError(message);
}
