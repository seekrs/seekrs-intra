import { getCurrentPage, PageType, type Page } from "./page.ts";
import { fetchProfileData, replaceSelfLogin, setupProfileBadges, setupProfileTitles } from "./override/login.ts";
import { fetchUserData, type UserData } from "./userData.ts";
import { computeDefaultOptions, optionsStorage, SeekrsOptions } from "../options/options-storage.ts";
import { featuresList } from "./features.ts";
import browser from 'webextension-polyfill';

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

const quickOptsStorageKey = 'seekrs-intra.options';

function getQuickOpts(): SeekrsOptions {
	const string = browser.storage.local.get(quickOptsStorageKey)?.[quickOptsStorageKey];
	if (string) {
		return JSON.parse(string) as SeekrsOptions;
	}
	return computeDefaultOptions();
}

function setQuickOpts(options: SeekrsOptions) {
	browser.storage.local.set({ [quickOptsStorageKey]: JSON.stringify(options) });
}

async function init() {
	let options = getQuickOpts();
	if (!options.enabled) {
		options = await optionsStorage.getAll();
		if (!options.enabled) {
			console.log("Extension disabled, skipping init...");
			return;
		}
		setQuickOpts(options);
	}

	console.log("[SEEKRS/init] Initializing...");

	const page = getCurrentPage();

	const promises: Array<Promise<void>> = [];
	for (const feature of featuresList) {
		if (options[feature.id] === true) {
			promises.push((async () => {
				console.log("[SEEKRS/init] Running early init for", feature.id);
				await feature.earlyInit?.(page, options);
			})());
		}
	}
	await Promise.all(promises);

	options = await optionsStorage.getAll();
	optionsStorage.onChanged((opts: SeekrsOptions, _: SeekrsOptions) => {
		setQuickOpts(opts);
	});

	document.addEventListener('DOMContentLoaded', async _ => {
		const localLogin = findCurrentLogin(page);
		const userData = await fetchUserData(localLogin);
		console.log("[SEEKRS/init] Fetched user data for", localLogin);
		console.log(userData);

		const promises: Array<Promise<void>> = [];
		for (const feature of featuresList) {
			if (options[feature.id] === true) {
				promises.push((async () => {
					console.log("[SEEKRS/init] Running document ready for", feature.id);
					await feature.documentReady?.(page, userData, options);
				})());
			}
		}
		await Promise.all(promises);
	});

	// const engines: ReplacementEngine[] = [...globalEngines];
	// for (const engine of replacementEngines) {
	// 	const enabled = options[engine.featureFlag];
	// 	if (!enabled) {
	// 		continue;
	// 	}
	// 	if (!engine.types.includes(page.type)) {
	// 		continue;
	// 	}
	// 	engines.push(engine)
	// }

	// if (engines.length === 0) {
	// 	return;
	// }

	// document.addEventListener('DOMContentLoaded', async _ => {
	// 	userDataCache.clear();

	// 	function isPageEngine(engine: ReplacementEngine): engine is PageReplacementEngine {
	// 		return engine['fetchTarget'] !== undefined;
	// 	}


	// 	const dataToEngine = new Map<ReplacementEngine, UserData>();
	// 	let promises: Array<Promise<void>> = [];
	// 	for (const engine of engines) {
	// 		promises.push((async () => {
	// 			if (isPageEngine(engine)) {
	// 				const targetData = await engine.fetchTarget!(page, userData, options);
	// 				dataToEngine.set(engine, targetData);
	// 			} else {
	// 				dataToEngine.set(engine, userData);
	// 			}
	// 		})());
	// 	}
	// 	await Promise.all(promises);

	// 	promises = [];
	// 	for (const engine of engines) {
	// 		promises.push((async () => {
	// 			const data = dataToEngine.get(engine)!;
	// 			await engine.fn(page, data, options);
	// 		})());
	// 	}
	// 	await Promise.all(promises);

		
	// });
}

init();