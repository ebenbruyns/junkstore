type AppStore = {
    GetAppOverviewByAppID: (appId: number) => AppOverview | undefined;
    GetIconURLForApp: (appOverview: AppOverview) => string;
    allApps: AppOverview[];
};