import { Page, PageType } from "./page";

export type BadgeData =
    | { type: 'color', color: string, url?: never }
    | { type: 'image', url: string, color?: never };

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Keys extends keyof T
    ? Pick<T, Keys> & Partial<Omit<T, Keys>>
    : never;

export type LoginOverrideData = {
    prefix?: string,
    suffix?: string,
    login?: string,
    separator?: string,
    full?: string,
};

export type UserData = {
    login: string;
    override: {
        name?: string;
        login: RequireAtLeastOne<LoginOverrideData, 'prefix' | 'suffix' | 'login' | 'full'>,
        images: {
            avatar?: string,
            cover?: string,
        },
        badges: Array<BadgeData>,
    },
    customization: {
        links: Array<{
            name: string,
            url: string,
            icon?: string,
        }>
    }
};

export const userDataCache = new Map<string, UserData>();

export async function fetchUserData(username: string) : Promise<UserData> {
    if (userDataCache.has(username)) {
        return userDataCache.get(username)!;
    }

	const nonce = Math.random().toString(36).slice(2);
	const response = await fetch(`https://data.seekrs.top/users/${username}.json?cachebust=${nonce}`, {
		method: 'GET',
		redirect: 'error',
	});
	if (response.ok) {
		const userData = await response.json() as UserData;
		if (userData.login !== username) {
			return Promise.reject(new Error(`User data for ${username} returned login ${userData.login}, what..?`));
		}
        userDataCache.set(username, userData);
		return userData;
	} else {
		return Promise.reject(new Error(`Failed to fetch user data for ${username} (${response.status} ${response.statusText})`));
	}
}