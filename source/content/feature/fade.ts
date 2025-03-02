import { Page, PageType } from "../page.ts";
import { SeekrsOptions } from "../../options/options-storage.ts";
import { UserData } from "../userData.ts";

const opacityTime = '0.4s';
let styleNode: HTMLStyleElement | undefined = undefined;

const leftNavbarDomains = [
	'projects.intra.42.fr',
	'meta.intra.42.fr',
	'elearning.intra.42.fr',
];

export async function fadePreInit(page: Page, options: SeekrsOptions): Promise<void> {
	if (page.type === PageType.Unknown && !options.fadeEffectAllPages) {
		return Promise.resolve();
	}

	const oldPage = document.referrer;
	if (oldPage) {
		const oldHostname = new URL(oldPage).hostname;
		styleNode = document.createElement('style');

		const navbarAppears = !leftNavbarDomains.includes(oldHostname) && leftNavbarDomains.includes(location.hostname);

		console.log("Old Page:", oldHostname);
		console.log("New Page:", location.hostname);
		console.log("Navbar Appears:", navbarAppears);

		if (navbarAppears) {
			styleNode.textContent = `
				div.page>div.page-content, div.page div.app-sidebar-left {
					opacity: 0;
				}
			`;
		} else {
			styleNode.textContent = `
				div.page>div.page-content {
					opacity: 0;
				}
			`;
		}

		const target = document.head || document.documentElement || document.body;
		target?.appendChild(styleNode);
		console.log("Injected style fade into " + target);
	} else {
		console.log("No previous fade style found, skipping");
		document.documentElement.style.opacity = '0';
	}

	return Promise.resolve();
}

export async function fadeBackIn(page: Page, _userData: UserData, options: SeekrsOptions): Promise<void> {
	if (page.type === PageType.Unknown && !options.fadeEffectAllPages) {
		return Promise.resolve();
	}

	document.documentElement.style.transition = 'opacity ' + opacityTime;
	if (styleNode) {
		styleNode.remove();
	} else {
		document.documentElement.style.opacity = '1';
	}

	const searchBox = document.querySelector<HTMLInputElement>('input.search-input');
	if (searchBox) {
		searchBox.autofocus = false;
	}

	document.addEventListener("click", async event => {
		console.log("Click event");
		const link = (event.target as Element)?.closest("a");
		if (link && link.href && !event.defaultPrevented && link.target !== '_blank') {
			if (link.href.substring(link.baseURI.length) === '#') {
				return;
			}
			console.log("Clicked on", link.href);

			const content = [
				...document.querySelectorAll<HTMLDivElement>('div.page>div.page-content'),
			];

			if (!leftNavbarDomains.includes(link.hostname)) {
				content.push(...document.querySelectorAll<HTMLDivElement>('div.app-sidebar-left'));
			}

			if (content.length > 0) {
				for (const contentElement of content) {
					contentElement.style.transition = 'opacity ' + opacityTime;
					contentElement.style.opacity = '0';
				}
			}
		}
	});

	return Promise.resolve();
}