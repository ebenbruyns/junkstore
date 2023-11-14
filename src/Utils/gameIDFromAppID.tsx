
export const gameIDFromAppID = (appid: number) => {
    //@ts-ignore
    let game = appStore.GetAppOverviewByAppID(appid);

    if (game !== null) {
        return game.m_gameid;
    } else {
        return -1;
    }
};
