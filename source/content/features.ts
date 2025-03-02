import { SeekrsOptions } from "../options/options-storage.ts";
import { fadeBackIn, fadePreInit } from "./feature/fade.ts";
import { Page } from "./page.ts";
import { UserData } from "./userData.ts";

export type FeatureTag = 'ui' | 'ux' | 'customization' | 'experimental' | 'hidden';

export type Descriptor = {
    id: string,
    name: string,
    description: string,
};

export type Feature = Descriptor & {
    tags?: Array<FeatureTag>,
    defaultState?: boolean,
    parents?: Array<Feature>,
    earlyInit?: (page: Page, options: SeekrsOptions) => Promise<void>,
    documentReady?: (page: Page, userData: UserData, options: SeekrsOptions) => Promise<void>,
    settings?: Array<FeatureSetting<any>>,
};

export type FeatureSettingType = string | number | boolean;

export type FeatureSetting<T extends FeatureSettingType> = Descriptor & {
    defaultValue: T,
};

export const enabled: Feature = {
    id: 'enabled',
    name: 'Enable Extension',
    description: 'Whether the entire extension is enabled or not',
    settings: [
        {
            id: 'dataRepository',
            name: 'Data Store URL',
            description: 'The URL of the data store. If you do not know what this is, leave it as is.',
            defaultValue: 'https://data.seekrs.top',
        },
    ],
};

export const fadeEffect: Feature = {
    id: 'fadeEffect',
    name: 'Fade Effect',
    description: 'Adds a fade effect to page transitions.',
    parents: [enabled],
    tags: ['experimental', 'ui'],
    earlyInit: fadePreInit,
    documentReady: fadeBackIn,
    settings: [
        {
            id: 'allPages',
            name: 'All Pages',
            description: 'Whether to fade all pages, or only pages that are known by the extension.',
            defaultValue: false,
        },
        {
            id: 'slidingSidebar',
            name: 'Sliding Sidebar',
            description: 'Slides the sidebar when loading/unloading pages.',
            defaultValue: true,
        }
    ]
};

export const fadeSpinner: Feature = {
    id: 'fadeSpinner',
    name: 'Fade Effect Spinner',
    description: 'Adds a spinner to page transitions when they take a while.',
    parents: [fadeEffect],
    tags: ['experimental', 'ui'],
    settings: [
        {
            id: 'url',
            name: 'Spinner URL',
            description: 'The URL of the spinner GIF',
            defaultValue: 'https://data.seekrs.top/assets/fishe.gif',
        }
    ]
};

export const fixProjectSearch: Feature = {
    id: 'fixProjectSearch',
    name: 'Fix Project Search',
    description: 'Apply some fixes to the search page, notably for projects.',
    parents: [enabled],
    tags: ['experimental', 'ux'],
};

export const customUserTitles: Feature = {
    id: 'customTitles',
    name: 'Custom User Titles',
    description: 'Enables custom user names & titles.',
    parents: [enabled],
    tags: ['customization'],
    settings: [
        {
            id: 'overrideIntra',
            name: 'Override Intra Titles',
            description: 'Whether to completely override default Intra titles, or use custom ones only when none are already present.',
            defaultValue: false,
        }
    ]
};

export const customUserAvatars: Feature = {
    id: 'customAvatars',
    name: 'Custom User Avatars',
    description: 'Enables custom user avatars.',
    parents: [enabled],
    tags: ['customization'],
};

export const customUserBackgrounds: Feature = {
    id: 'customBackgrounds',
    name: 'Custom User Backgrounds',
    description: 'Whether to use custom user backgrounds or not.',
    parents: [enabled],
    tags: ['experimental', 'customization'],
};

export const customUserCovers: Feature = {
    id: 'customCovers',
    name: 'Custom User Covers',
    description: 'Whether to use custom user covers or not.',
    parents: [enabled],
    tags: ['experimental', 'customization', 'hidden'],
};

export const customUserBadges: Feature = {
    id: 'customBadges',
    name: 'Custom User Badges',
    description: 'Enable custom user badges.',
    parents: [enabled],
    tags: ['experimental', 'customization', 'hidden']
};

export const featuresList = [
    enabled,
    fadeEffect, fadeSpinner,
    fixProjectSearch,
    customUserTitles, customUserAvatars, customUserBackgrounds, customUserCovers, customUserBadges,
] as const;