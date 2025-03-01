export enum PageType {
    Home,                   // https://profile.intra.42.fr/
    Slots,                  // https://profile.intra.42.fr/slots
    Settings,               // https://profile.intra.42.fr/users/kiroussa/edit

    Profile,                // https://profile.intra.42.fr/users/kiroussa
    
    SearchPage,             // https://profile.intra.42.fr/searches
    SearchResults,          // https://profile.intra.42.fr/searches/search?query=minishell

    CoalitionOverview,      // https://profile.intra.42.fr/blocs/64/coalitions
    CoalitionPage,          // https://profile.intra.42.fr/blocs/64/coalitions/seekers
    CoalitionScores,        // https://profile.intra.42.fr/blocs/64/coalitions/seekers/scores
    CoalitionCompare,       // https://profile.intra.42.fr/blocs/64/scores

    ProjectListSelf,        // https://projects.intra.42.fr/
    ProjectList,            // https://projects.intra.42.fr/projects/list
    ProjectGraph,           // https://projects.intra.42.fr/projects/graph
    ProjectTeam,            // https://projects.intra.42.fr/42cursus-minishell/mine ??????
                            // https://projects.intra.42.fr/projects/42cursus-minishell/projects_users/3595228
    ProjectPage,            // https://projects.intra.42.fr/projects/42cursus-minishell
    
    Unknown,
};

export type Page = {
    type: PageType;
    title: string;
    url: URL;
    path: string;
    params: URLSearchParams;
};

function normalizePath(path: string): string {
    const newPath = path.replace(/\/$/, '');
    if (newPath === '') {
        return '/';
    }
    return newPath;
}

function countChar(str: string, char: string): number {
    return str.split(char).length - 1;
}

const settingsPagesPaths = [
    '/gitlab_users', // SSH Keys
    '/languages',
    '/mails', // Notifications
    '/securities',
    '/expertises_users',
    '/v3_early_access',
];

export function getCurrentPage(): Page {
    const params = new URLSearchParams(location.search);
    const path = normalizePath(location.pathname);
    const url = new URL(location.href);
    const slashCount = countChar(path, '/');

    let type: PageType = PageType.Unknown;
    if (url.hostname === 'projects.intra.42.fr') {
        if (path === '/') {
            type = PageType.ProjectListSelf;
        } else if (path === '/projects/list') {
            type = PageType.ProjectList;
        } else if (path === '/projects/graph') {
            type = PageType.ProjectGraph;
        } else if (path.startsWith('/projects/') && slashCount === 2) {
            type = PageType.ProjectPage;
        } else if (path === '/cursus_subscriptions' || path.startsWith('/users/') || path.endsWith("project_users") || path.endsWith("projects_users/all")) {
            type = PageType.Unknown;
        } else { //TODO: better recognition
            type = PageType.ProjectTeam;
        }
    } else if (url.hostname === 'profile.intra.42.fr') {
        if (path === '/') {
            type = PageType.Home;
        } else if (path === '/slots') {
            type = PageType.Slots;
        } else if (path.startsWith('/users/') && slashCount === 2) {
            type = PageType.Profile;
        } else if (path.startsWith('/users/') && slashCount === 3 && path.split('/')[3] === 'edit') {
            type = PageType.Settings;
        } else if (path in settingsPagesPaths || path.startsWith('/oauth/applications')) {
            type = PageType.Settings;
        } else if (path === '/searches') {
            type = PageType.SearchPage;
        } else if (path === '/searches/search') {
            type = PageType.SearchResults;
        } else if (path.startsWith('/blocs/')) {
            let innerPath = path.split('/').slice(3).join('/');
            if (innerPath === '' || innerPath[0] !== '/') {
                innerPath = '/' + innerPath;
            }
            const innerSlashCount = countChar(innerPath, '/');
            if (innerPath === '/coalitions') {
                type = PageType.CoalitionOverview;
            } else if (innerPath === '/scores') {
                type = PageType.CoalitionCompare;
            } else if (innerPath.startsWith('/coalitions/') && innerSlashCount === 2) {
                type = PageType.CoalitionPage;
            } else if (innerPath.startsWith('/coalitions/') && innerSlashCount === 3 && innerPath.split('/')[3] === 'scores') {
                type = PageType.CoalitionScores;
            }
        }
    }

    return {
        type,
        title: document.title,
        url,
        path,
        params,
    };
}