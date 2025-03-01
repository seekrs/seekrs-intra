import { getCurrentPage, PageType, type Page } from "./page.ts";
import { fetchProfileData, replaceSelfLogin, setupProfileBadges, setupProfileTitles } from "./override/login.ts";
import { fetchUserData, userDataCache, type UserData } from "./userData.ts";
import { optionsStorage, SeekrsOptions } from "../options/options-storage.ts";

type ReplacementEngine = {
	fn: (page: Page, userData: UserData, options: SeekrsOptions) => Promise<void>, 
	featureFlag: string, 
};

type PageReplacementEngine = ReplacementEngine & {
	types: PageType[],
	fetchTarget?: (page: Page, localUserData: UserData, options: SeekrsOptions) => Promise<UserData>,
};

const globalEngines: ReplacementEngine[] = [
	{ fn: replaceSelfLogin, featureFlag: 'customUserTitles' },
];

const replacementEngines: PageReplacementEngine[] = [
	{ fn: setupProfileTitles, featureFlag: 'customUserTitles', types: [PageType.Profile, PageType.Home], fetchTarget: fetchProfileData },
	{ fn: setupProfileBadges, featureFlag: 'customUserBadges', types: [PageType.Profile, PageType.Home], fetchTarget: fetchProfileData },
];

function findCurrentLogin(page: Page): string {
	let currentUserLogin = document.querySelector<HTMLDataElement>('a>span[data-login]')?.dataset['login'];

	if (!currentUserLogin && page.url.hostname === 'companies.intra.42.fr') {
		const anchors = [
			...document.querySelectorAll<HTMLAnchorElement>('a[href^="/en/users/"]'),
			...document.querySelectorAll<HTMLAnchorElement>('a[href^="/es/users/"]'),
			...document.querySelectorAll<HTMLAnchorElement>('a[href^="/fr/users/"]'),
		];
		if (anchors.length >= 0) {
			currentUserLogin = anchors[0].href.split('/')[3];
		}
	}

	if (!currentUserLogin) {
		throw new Error('Could not find current user login');
	}

	return currentUserLogin;
}

async function init() {
	const lsKey = 'seekrs-intra.travel-from-page';
	let styleNode: HTMLStyleElement | undefined = undefined;
	const lsOldPage = localStorage.getItem(lsKey);
	if (lsOldPage !== null) {
		localStorage.removeItem(lsKey);
		styleNode = document.createElement('style');
		if (new URL(lsOldPage).hostname === 'projects.intra.42.fr' && location.hostname === 'projects.intra.42.fr') {
			styleNode.textContent = `
				div.page>div.page-content {
					opacity: 0;
					transition: opacity 0.5s;
				}
			`;
		} else {
			styleNode.textContent = `
				div.page>div.page-content, div.page div.app-sidebar-left {
					opacity: 0;
					transition: opacity 0.5s;
				}
			`;
		}
		const target = document.head || document.documentElement || document.body;
		target?.appendChild(styleNode);
	} else {
		document.documentElement.style.opacity = '0';
	}

	const options = await optionsStorage.getAll();
	if (!options.enabled) {
		return;
	}

	const page = getCurrentPage();
	console.log(page);

	const engines: ReplacementEngine[] = [...globalEngines];
	for (const engine of replacementEngines) {
		const enabled = options[engine.featureFlag];
		if (!enabled) {
			continue;
		}
		if (!engine.types.includes(page.type)) {
			continue;
		}
		engines.push(engine)
	}

	if (engines.length === 0) {
		document.documentElement.style.transition = 'opacity 0.5s';
		document.documentElement.style.opacity = '1';
		if (styleNode) {
			styleNode.remove();
		}
		return;
	}

	document.addEventListener('DOMContentLoaded', async _ => {
		const localLogin = findCurrentLogin(page);

		userDataCache.clear();

		function isPageEngine(engine: ReplacementEngine): engine is PageReplacementEngine {
			return engine['fetchTarget'] !== undefined;
		}

		const userData = await fetchUserData(localLogin); 
		console.log("Fetched user data for", localLogin);
		console.log(userData);

		const dataToEngine = new Map<ReplacementEngine, UserData>();
		let promises: Array<Promise<void>> = [];
		for (const engine of engines) {
			promises.push((async () => {
				if (isPageEngine(engine)) {
					const targetData = await engine.fetchTarget!(page, userData, options);
					dataToEngine.set(engine, targetData);
				} else {
					dataToEngine.set(engine, userData);
				}
			})());
		}
		await Promise.all(promises);

		promises = [];
		for (const engine of engines) {
			promises.push((async () => {
				const data = dataToEngine.get(engine)!;
				await engine.fn(page, data, options);
			})());
		}
		await Promise.all(promises);

		document.documentElement.style.transition = 'opacity 0.5s';
		document.documentElement.style.opacity = '1';
		if (styleNode) {
			styleNode.remove();
		}

		const searchBox = document.querySelector<HTMLInputElement>('input.search-input');
		if (searchBox) {
			searchBox.autofocus = false;
		}

		document.addEventListener("click", event => {
			const link = (event.target as Element)?.closest("a");
			if (link && link.href && !event.defaultPrevented && link.target !== '_blank') {
				console.log(link.baseURI);
				console.log("User clicked on:", link.href);
				if (link.href.substring(link.baseURI.length) === '#') {
					return;
				}
				const content = [
					...document.querySelectorAll<HTMLDivElement>('div.page>div.page-content'),
				];
				if (link.hostname === 'profile.intra.42.fr') {
					content.push(...document.querySelectorAll<HTMLDivElement>('div.page div.app-sidebar-left'));
				}
				if (content.length > 0) {
					this.localStorage.setItem(lsKey, location.href);
					for (const contentElement of content) {
						contentElement.style.transition = 'opacity 0.5s';
						contentElement.style.opacity = '0';
					}
				}
			}
		});
	});
}

init().catch((error: unknown) => {
	console.error("[SEEKRS/entry] " + error);
});