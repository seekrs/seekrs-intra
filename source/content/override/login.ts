import { optionsStorage, SeekrsOptions } from "../../options/options-storage.ts";
import { Page, PageType } from "../page.ts";
import { fetchUserData, LoginOverrideData, UserData } from "../userData.ts";

export function formatLogin(login: LoginOverrideData, original: string): string | undefined {
    if (login.full) {
        return login.full;
    }
    if (login.prefix || login.suffix) {
        const sep = login.separator ?? " ";

        let full = "";
        if (login.prefix) {
            full += login.prefix;
            full += sep;
        }
        full += login.login ?? original;
        if (login.suffix) {
            full += sep;
            full += login.suffix;
        }
        return full;
    }
    return login.login;
}

export async function setupProfileTitles(page: Page, userData: UserData, options: SeekrsOptions) {
    let name = document.querySelector<HTMLSpanElement>("h2.profile-name>span.name>span");
    if (!name) {
        name = document.querySelector<HTMLSpanElement>("h2.profile-name>span.name")
    }
    if (name) {
        name.innerText = userData.override.name ?? name.innerText;
    }

    if (page.type === PageType.Home) {
        // Account for the title switcher dropdown
        let login = document.querySelector<HTMLSpanElement>("div#title-selector span.login[data-login]");
        if (login) {
            const actualLogin = login.dataset['login']!;
            const displayLogin = login.innerText;

            const titleDropdown = document.querySelector<HTMLUListElement>("div#title-selector ul.dropdown-menu");
            if (titleDropdown) {
                const noTitleSelector = titleDropdown.querySelector<HTMLAnchorElement>("a[href*='/titles_users/unselected']");
                if (noTitleSelector) {
                    noTitleSelector.innerText = formatLogin(userData.override.login, actualLogin) ?? actualLogin;
                }
                for (const anchor of titleDropdown.querySelectorAll<HTMLAnchorElement>("a[href*='/titles_users/']")) {
                    anchor.addEventListener('click', async _ => {
                        const options = await optionsStorage.getAll();
                        await setupProfileTitles(page, userData, options);
                    });
                }
            }

            const hasIntraTitle = actualLogin !== displayLogin;
            if (hasIntraTitle && !options.customTitlesOverrideIntra) {
                return;
            }

            login.innerText = formatLogin(userData.override.login, actualLogin) ?? actualLogin;
            return;
        }
    }

    const login = document.querySelector<HTMLSpanElement>("h2.profile-name>span.login[data-login]");
    if (login) {
        const actualLogin = login.dataset['login']!;
        const displayLogin = login.innerText;

        const hasIntraTitle = actualLogin !== displayLogin;
        if (hasIntraTitle && !options.customTitlesOverrideIntra) {
            return;
        }

        login.innerText = formatLogin(userData.override.login, actualLogin) ?? displayLogin;
    }
}

export async function setupProfileBadges(page: Page, userData: UserData, options: SeekrsOptions) {
    //TODO
}

export async function fetchProfileData(page: Page, localUserData: UserData, options: SeekrsOptions): Promise<UserData> {
    if (page.type === PageType.Profile) {
        const username = document.querySelector<HTMLDataElement>("span.login[data-login]")?.dataset['login'];
        if (!username) {
            throw new Error('Could not find profile username');
        }
        return await fetchUserData(username);
    }
    return localUserData;
}

/**
 * Replaces the currently logged in user's navbar login with the one provided
 * in the custom user data.
 * 
 * @param page The currently loaded Intra Page.
 * @param userData The user data for the currently logged in user.
 */
export async function replaceSelfLogin(page: Page, userData: UserData) {
    const login = document.querySelector<HTMLSpanElement>("span.dropdown span[data-login]");
    if (login) {
        login.innerText = userData.override.login.login ?? login.innerText;
    }
}