// eslint-disable-next-line import/no-unassigned-import
import optionsStorage from '../options/options-storage.js';
import '../shared.js';

async function createBooleanOption(defaultState, name, label, description, callback) {
	const template = document.getElementById('option-boolean');

	const clone = template.content.cloneNode(true).firstElementChild;
	clone.id = `option-boolean-${name}`;
	clone.querySelector('h2').textContent = label;
	clone.querySelector('p').textContent = description;
	const checkbox = clone.querySelector('input');
	checkbox.addEventListener('change', callback);
	checkbox.checked = defaultState;
	callback({ target: checkbox });
	document.getElementById('options').appendChild(clone);
}

async function init() {
	const options = await optionsStorage.getAll();

	createBooleanOption(options.enabled, 'enabled', 'Enabled', 'Whether the entire extension is enabled or not', async (e) => {
		const checkbox = e.target;
		console.log("Setting enabled to", checkbox.checked);
		await optionsStorage.set({ enabled: checkbox.checked });

		const disabled = !checkbox.checked;
		for (const elem of document.querySelectorAll('.x-option')) {
			if (elem.id !== "option-boolean-enabled") {
				elem.disabled = disabled;
				elem.classList.toggle('opacity-50', disabled);

				for (const input of elem.querySelectorAll('input')) {
					input.disabled = disabled;
				}
			}
		}
	});

	for (const [name, label, description] of [
		['fixProjectSearch', 'Fix Project Search', 'Whether to fix the project search or not'],
		['customUserTitles', 'Custom User Titles', 'Whether to use custom user titles or not'],
		['customUserAvatars', 'Custom User Avatars', 'Whether to use custom user avatars or not'],
		['customUserBackgrounds', 'Custom User Backgrounds', 'Whether to use custom user backgrounds or not'],
		['customUserCovers', 'Custom User Covers', 'Whether to use custom user covers or not'],
		['customUserBadges', 'Custom User Badges', 'Whether to use custom user badges or not'],
	]) {
		createBooleanOption(options.features[name], name, label, description, async (e) => {
			options.features[name] = e.target.checked;
			await optionsStorage.setAll(options);
		});
	}
}

init();
