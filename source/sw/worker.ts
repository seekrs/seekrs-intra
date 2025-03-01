import '../options/options-storage.ts';
import browser from 'webextension-polyfill';

async function init() {
    console.log("Setting up ServiceWorker");

    // TODO: Fetch global redirect rules (& per-user rule?)
    // TODO: Setup dynamic redirects
}

init().catch((err: unknown) => console.error(err));
