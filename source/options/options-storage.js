import OptionsSync from 'webext-options-sync';

const optionsStorage = new OptionsSync({
	defaults: {
		enabled: true,
		features: {
			fixProjectSearch: true,
			customUserTitles: true,
			customUserAvatars: true,
			customUserBackgrounds: true,
			customUserCovers: true,
			customUserBadges: true,
		},
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	storageName: 'seekrs-intra',
	logging: true,
});

export default optionsStorage;
