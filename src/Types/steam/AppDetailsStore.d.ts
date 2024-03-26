import { AppDetails } from 'decky-frontend-lib';

type AppDetailsStore = {
    GetAppDetails: (appId: number) => AppDetails | undefined;
};