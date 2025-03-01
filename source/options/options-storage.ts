import OptionsSync, { type Options } from 'webext-options-sync';

export type SeekrsOptions = Options & {
	enabled: boolean;
	fixProjectSearch: boolean;
	customUserTitles: boolean;
	customTitlesOverrideIntra: boolean;
	customUserAvatars: boolean;
	customUserBackgrounds: boolean;
	customUserCovers: boolean;
	customUserBadges: boolean;
};

const optionsStorage = new OptionsSync<SeekrsOptions>({
	defaults: {
		enabled: true,
		fixProjectSearch: true,
		customUserTitles: true,
		customTitlesOverrideIntra: true,
		customUserAvatars: true,
		customUserBackgrounds: true,
		customUserCovers: true,
		customUserBadges: true,
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	storageName: 'seekrs-intra',
	logging: false,
});

export { optionsStorage };
