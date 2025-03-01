import { optionsStorage } from '../options/options-storage.ts';
import '../shared.css';

async function createBooleanOption(
	defaultState: boolean,
	name: string,
	label: string,
	description: string,
	callback: (checkbox: HTMLInputElement) => Promise<void>,
) {
	const template = document.querySelector('#option-boolean');
	if (template === null) {
		return;
	}

	const clone = ((template as HTMLTemplateElement).content.cloneNode(true) as Element).firstElementChild;
	if (clone === null) {
		return;
	}

	clone.id = `option-boolean-${name}`;
	clone.querySelector('h2')!.textContent = label;
	clone.querySelector('p')!.textContent = description;

	const checkbox = clone.querySelector('input')!;
	checkbox.addEventListener('change', async event => {
		await callback(event.target as HTMLInputElement);
	});
	checkbox.checked = defaultState;
	await callback(checkbox);

	document.querySelector('#options')?.append(clone);
}

async function init() {
	const options = await optionsStorage.getAll();

	await createBooleanOption(options.enabled as boolean, 'enabled', 'Enabled', 'Whether the entire extension is enabled or not', async checkbox => {
		console.log('Setting enabled to', checkbox.checked);
		await optionsStorage.set({ enabled: checkbox.checked });

		const disabled = !checkbox.checked;
		for (const element of document.querySelectorAll('.x-option')) {
			if (element.id !== 'option-boolean-enabled') {
				element.classList.toggle('opacity-50', disabled);

				for (const input of element.querySelectorAll('input')) {
					input.disabled = disabled;
				}
			}
		}
	});

	for (const [name, label, description] of [
		['fixProjectSearch', 'Fix Project Search', 'Whether to fix the project search or not'],
		['customUserTitles', 'Custom User Titles', 'Enables custom user names & titles'],
		['customTitlesOverrideIntra', 'Custom Titles Override Intra', 'Whether to completely override default Intra titles, or use custom ones only when none are already present'],
		['customUserAvatars', 'Custom User Avatars', 'Enables custom user avatars'],
		// ['customUserBackgrounds', 'Custom User Backgrounds', 'Whether to use custom user backgrounds or not'],
		// ['customUserCovers', 'Custom User Covers', 'Whether to use custom user covers or not'],
		['customUserBadges', 'Custom User Badges', 'Enable custom user badges'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		await createBooleanOption(options[name] as boolean, name, label, description, async checkbox => {
			options[name] = checkbox.checked;
			await optionsStorage.setAll(options);
		});
	}
}

init().catch((error: unknown) => {
	console.error(error);
});
