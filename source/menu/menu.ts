import { optionsStorage } from '../options/options-storage.ts';
import { Feature, enabled, featuresList } from '../content/features.ts';
import '../shared.css';

async function createBooleanOption(
	feature: Feature,
	initialState: boolean,
	callback: (checkbox: HTMLInputElement) => Promise<void>,
): Promise<[HTMLInputElement, (checkbox: HTMLInputElement) => Promise<void>]> {
	const template = document.querySelector('#option-boolean');
	if (template === null) {
		return Promise.reject(new Error('Template not found'));
	}

	const clone = ((template as HTMLTemplateElement).content.cloneNode(true) as Element).firstElementChild;
	if (clone === null) {
		return Promise.reject(new Error('Clone not found'));
	}

	clone.id = `option-boolean-${feature.id}`;
	clone.querySelector('h2')!.textContent = feature.name;
	clone.querySelector('p')!.textContent = feature.description;

	const checkbox = clone.querySelector('input')!;
	checkbox.addEventListener('change', async event => {
		await callback(event.target as HTMLInputElement);
	});
	checkbox.checked = initialState;
	await callback(checkbox);

	document.querySelector('#options')?.append(clone);

	return [checkbox, callback];
}

async function init() {
	const options = await optionsStorage.getAll();

	const [enabledCheckbox, enabledCallback] = await createBooleanOption(enabled, options.enabled, async checkbox => {
		console.log('Setting enabled to', checkbox.checked);
		options.enabled = checkbox.checked;
		await optionsStorage.setAll(options);

		const disabled = !checkbox.checked;
		for (const element of document.querySelectorAll('.x-option')) {
			if (element.id !== 'option-boolean-enabled') {
				if (disabled) {
					element.classList.add('opacity-50');
				} else {
					element.classList.remove('opacity-50');
				}

				for (const input of element.querySelectorAll('input')) {
					input.disabled = disabled;
				}
			}
		}
	});

	for (const feature of featuresList) {
		if (feature === enabled) {
			continue;
		}
		await createBooleanOption(feature, options[feature.id] as boolean, async checkbox => {
			console.log('Setting', feature.id, 'to', checkbox.checked);
			options[feature.id] = checkbox.checked;
			await optionsStorage.setAll(options);
		});
	}

	await enabledCallback(enabledCheckbox);
}

init().catch((error: unknown) => {
	console.error(error);
});
