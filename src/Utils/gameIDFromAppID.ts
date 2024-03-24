
export const gameIDFromAppID = (appid: number) => {
    let game = appStore.GetAppOverviewByAppID(appid);

    if (game) {
        return game.m_gameid;
    } else {
        return -1;
    }
};
