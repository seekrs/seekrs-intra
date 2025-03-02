import OptionsSync, { type Options } from 'webext-options-sync';

export type SeekrsOptions = Options & {
	enabled: boolean;
	enabledDataRepository: string;
	fadeEffect: boolean;
	fadeEffectAllPages: boolean;
	fadeEffectSlidingSidebar: boolean;
	fadeSpinner: boolean;
	fadeSpinnerUrl: string;
	fixProjectSearch: boolean;
	customTitles: boolean;
	customTitlesOverrideIntra: boolean;
	customAvatars: boolean;
	customBackgrounds: boolean;
	customCovers: boolean;
	customBadges: boolean;
};

export function computeDefaultOptions(): SeekrsOptions {
	return {
		enabled: true,
		enabledDataRepository: 'https://data.seekrs.top',
		fadeEffect: true,
		fadeEffectAllPages: true,
		fadeEffectSlidingSidebar: true,
		fadeSpinner: false,
		fadeSpinnerUrl: 'https://data.seekrs.top/assets/fishe.gif',
		fixProjectSearch: true,
		customTitles: true,
		customTitlesOverrideIntra: false,
		customAvatars: true,
		customBackgrounds: true,
		customCovers: true,
		customBadges: true,
	};
}

const optionsStorage = new OptionsSync<SeekrsOptions>({
	defaults: computeDefaultOptions(),
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	storageName: 'seekrs-intra',
	logging: false,
});

export { optionsStorage };
