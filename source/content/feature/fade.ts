import { Page, PageType } from "../page.ts";
import { SeekrsOptions } from "../../options/options-storage.ts";
import { UserData } from "../userData.ts";

const opacityTime = '0.5s';
const lsKey = 'seekrs-intra.features.fade.origin';
let styleNode: HTMLStyleElement | undefined = undefined;

export async function fadePreInit(page: Page, options: SeekrsOptions): Promise<void> {
	if (page.type === PageType.Unknown && !options.fadeEffectAllPages) {
		return Promise.resolve();
	}

	const oldPage = localStorage.getItem(lsKey);
	if (oldPage !== null) {
		localStorage.removeItem(lsKey);

		styleNode = document.createElement('style');
		if (new URL(oldPage).hostname === 'projects.intra.42.fr' && location.hostname === 'projects.intra.42.fr') {
			styleNode.textContent = `
				div.page>div.page-content {
					opacity: 0;
					transition: opacity ${opacityTime};
				}
			`;
		} else {
			styleNode.textContent = `
				div.page>div.page-content, div.page div.app-sidebar-left {
					opacity: 0;
					transition: opacity ${opacityTime};
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
	document.documentElement.style.opacity = '1';
	if (styleNode) {
		console.log("Removing injected style fade");
		styleNode.remove();
	}

	const searchBox = document.querySelector<HTMLInputElement>('input.search-input');
	if (searchBox) {
		searchBox.autofocus = false;
	}

	document.addEventListener("click", event => {
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

			if (link.hostname === 'profile.intra.42.fr') {
				content.push(...document.querySelectorAll<HTMLDivElement>('div.page div.app-sidebar-left'));
			}

			if (content.length > 0) {
				console.log("Setting fade origin to", location.href);
				localStorage.setItem(lsKey, location.href);
				for (const contentElement of content) {
					contentElement.style.transition = 'opacity ' + opacityTime;
					contentElement.style.opacity = '0';
				}
			}
		}
	});

	return Promise.resolve();
}