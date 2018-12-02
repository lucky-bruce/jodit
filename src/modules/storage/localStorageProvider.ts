/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License GNU General Public License version 2 or later;
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import { IStorage } from '../../types';

export class localStorageProvider implements IStorage {
    public set(key: string, value: string | number) {
        localStorage.setItem(key, value.toString());
    }

    public get(key: string): string | null {
        return localStorage.getItem(key);
    }
}
