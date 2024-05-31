import { MdErrorOutline, MdNoFood, MdSocialDistance } from "react-icons/md";
import Logger from "./logger";
import { SiBrave, SiCodingninjas } from "react-icons/si";
import { FaCat, FaEgg, FaRebel, FaStar, FaUserSecret } from "react-icons/fa6";
import { FaSkullCrossbones } from "react-icons/fa";
import { Toaster } from "decky-frontend-lib";


type Achievement = string; // Each achievement is represented by a base64 string
export interface AchievementDetails {
    name: string;
    description: string;
    icon: JSX.Element;
}
export const achievements = [
    {
        name: 'Oops! My bad!',
        description: 'You just got your first error!',
        icon: <MdErrorOutline />
    },
    {
        name: 'Hack-mode Activate!',
        description: 'You enabled developer mode!',
        icon: <SiCodingninjas />
    },
    {
        name: 'Curiosity killed the cat',
        description: 'You inspected your first achievement!',
        icon: <FaCat />
    },
    {
        name: 'Hidden treasure',
        description: 'Installed a custom backend!',
        icon: <FaUserSecret />
    },
    {
        name: "Don't feed the gremlins!",
        description: "Started a new gaming session, just after midnight!",
        icon: <MdNoFood />
    },
    {
        name: 'Fearless Friday',
        description: 'You played on Friday the 13th!',
        icon: <FaSkullCrossbones />
    },
    {
        name: 'Rebel clicker',
        description: 'You clicked the button!',
        icon: <FaRebel />
    },
    {
        name: 'Chicken clicker',
        description: 'Not so brave now, are we?',
        icon: <FaEgg />
    },
    {
        name: 'Daredevil clicker',
        description: 'Consequenced be damned.',
        icon: <SiBrave />
    },
    {
        name: 'Social Butterfly',
        description: 'Clicked on a social link!',
        icon: <MdSocialDistance />
    },
    {
        name: 'Gold Star',
        description: 'Unlocked 10 achievements',
        icon: <FaStar />
    }
]


const logger = new Logger("ahcivements");
export const getAchievementDetails = (achievementBase64: Achievement): AchievementDetails => {
    try {
        const achievement = parseInt(atob(achievementBase64), 2);
        return achievements[achievement - 1];
    } catch (e) {
        logger.error("Error getting achievement details: ", e);
        return {
            name: 'Unknown',
            description: 'Unknown',
            icon: <MdErrorOutline />
        };
    }
}
export const resetAchievements = () => {
    try {
        localStorage.removeItem('achievements');
    }
    catch (e) {
        logger.error("Error resetting achievements: ", e);
    }
}
export const checkAchievements = (): number => {
    try {
        const achievements = localStorage.getItem('achievements');
        return achievements ? parseInt(atob(achievements), 2) : 0;
    }
    catch (e) {
        logger.error("Error checking achievements: ", e);
        return 0;
    }
}
export let toastAchievement: (achievement: string) => void;

export const toastFactory = (toaster: Toaster) => {

    toastAchievement = (achievement: string) => {
        try {
            const temp = getAchievementDetails(achievement);
            if (temp) {
                const toast = {
                    title: "Achievement unlocked: " + temp.name,
                    body: temp.description,
                    icon: temp.icon,
                }
                toaster.toast(toast)

            }
        }
        catch (e) {
        }
    }
}

export const addAchievement = (achievementBase64: Achievement) => {
    try {
        const achievement = parseInt(atob(achievementBase64), 2);
        if (!hasAchievement(achievementBase64)) {
            let achievements = checkAchievements();
            achievements |= 1 << achievement;
            localStorage.setItem('achievements', btoa(achievements.toString(2)));
            toastAchievement(achievementBase64);
            if (getAchievements().length == 10) {
                addAchievement("MTAxMQ==")
            }
        }
    }
    catch (e) {
        logger.error("Error adding achievement: ", e);
    }
}
export const hasAchievement = (achievementBase64: Achievement): boolean => {
    try {
        const achievement = parseInt(atob(achievementBase64), 2);
        const achievements = checkAchievements();
        return (achievements & (1 << achievement)) !== 0;
    }
    catch (e) {
        logger.error("Error checking achievement: ", e);
        return false;
    }
}

export const getAchievements = (): Achievement[] => {
    try {
        let achievementsBitField = checkAchievements();
        const achievements: Achievement[] = [];
        let achievementNumber = 0;

        while (achievementsBitField > 0) {
            if ((achievementsBitField & 1) === 1) {
                achievements.push(btoa(achievementNumber.toString(2)));
            }
            achievementsBitField >>= 1;
            achievementNumber++;
        }
        logger.log(`Achievements: ${achievements}`);
        return achievements;
    }
    catch (e) {
        logger.error("Error getting achievements: ", e);
        return [];
    }
}

export const hasAchievements = (): boolean => {
    try {
        return getAchievements().length > 0;
    }
    catch (e) {
        logger.error("Error checking achievements: ", e);
        return false;
    }
}



export const intToAchievement = (achievement: number): Achievement => {
    return btoa(achievement.toString(2));
}
