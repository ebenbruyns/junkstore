import {
    Focusable,
    DialogButton,
    Marquee,
    showContextMenu,
    Menu,
    MenuItem,
    showModal,
    ServerAPI,
    ProgressBar,
    FocusableProps,
    afterPatch,
} from "decky-frontend-lib";
import { FC, VFC, useEffect, useRef, useState } from "react";
import { FaCog, FaSlidersH } from "react-icons/fa";
import { EditorAction, MenuAction, ProgressUpdate } from "../Types/Types";
import { ConfEditor } from "../ConfEditor";
import { BatEditor } from "../BatEditor";
import Logger from "../Utils/logger";
import { ExeRunner } from "../ExeRunner";
import { getAppDetails } from "../Utils/executeAction";
import { ScrollableWindow } from '../ScrollableWindow';


interface GameDisplayProperties {
    serverApi: ServerAPI;
    name: string;
    shortName: string;
    closeModal?: any;
    images: string[];
    installer: () => void;
    uninstaller: () => void;
    steamClientID: string;
    runner: () => void;
    description: string;
    installing: boolean;
    progress: ProgressUpdate;
    editors: EditorAction[];
    cancelInstall: () => void;
    initActionSet: string;
    actions: MenuAction[];
    resetLaunchOptions: () => void;
    updater: () => void;
    scriptRunner: (actionSet: string, actionId: string, args: any) => void;
    clearActiveGame: () => void;
    reloadData: () => void;
}


const GameDisplay: VFC<GameDisplayProperties> = (
    {
        serverApi,
        closeModal,
        name,
        shortName,
        images,
        steamClientID,
        installer,
        uninstaller,
        cancelInstall,
        runner,
        description,
        installing,
        progress,
        editors,
        initActionSet,
        actions,
        resetLaunchOptions,
        scriptRunner,
        clearActiveGame,
        reloadData
    }
) => {
    const logger = new Logger("GameDisplay");
    logger.log(`initActionSet: ${initActionSet}`);
    const contextMenu = (e: any) => {
        showContextMenu(
            <Menu label="Configuration" cancelText="Cancel" onCancel={() => { }}>
                {editors.map((editor) => {
                    return <MenuItem onSelected={
                        () => {
                            if (editor.Type == "IniEditor")
                                showModal(<ConfEditor serverAPI={serverApi} initActionSet={initActionSet} initAction={editor.InitActionId} contentId={editor.ContentId} refreshParent={reloadData} />);
                            if (editor.Type == "FileEditor")
                                showModal(<BatEditor serverAPI={serverApi} initActionSet={initActionSet} initAction={editor.InitActionId} contentId={editor.ContentId} refreshParent={reloadData} />);
                        }
                    }>{editor.Title}</MenuItem>;
                })}

            </Menu>,
            e.currentTarget ?? window
        );
    };

    const actionsMenu = (e: any) => {
        showContextMenu(
            <Menu label="Actions" cancelText="Cancel" onCancel={() => { }}>
                {steamClientID !== "" &&
                    <MenuItem onSelected={
                        () => {

                            logger.debug("show exe list");
                            showModal(<ExeRunner serverAPI={serverApi} initActionSet={initActionSet} initAction="GetExeActions" contentId={steamClientID} shortName={shortName} closeParent={closeModal} refreshParent={reloadData} />);
                        }
                    }>Run exe in Game folder</MenuItem>}
                {steamClientID !== "" &&
                    <>
                        <MenuItem onSelected={resetLaunchOptions}>Reset Launch Options</MenuItem>
                        <MenuItem onSelected={uninstaller}>Uninstall Game</MenuItem>
                    </>
                }

                {actions && actions.length > 0 && actions.map((action) => {

                    const installed = steamClientID != "";
                    const mustBeInstalled = action.InstalledOnly != undefined && action.InstalledOnly == true;
                    const show = installed || !mustBeInstalled;

                    if (show)
                        return <MenuItem onSelected={
                            async () => {
                                const args = {
                                    shortname: shortName,
                                    steamClientID: "",
                                    startDir: "",
                                    compatToolName: "",
                                    inputData: "",
                                    gameId: "",
                                    appId: ""
                                };
                                if (steamClientID != "") {
                                    logger.debug("steamClientID: ", steamClientID);
                                    const id = parseInt(steamClientID);
                                    const details = await getAppDetails(id);
                                    if (details == null) {
                                        logger.error("details is null"); return;

                                    }
                                    else {
                                        logger.debug("details: ", details);
                                        const compatToolName = details.strCompatToolName;
                                        const startDir = details.strShortcutStartDir;
                                        args.startDir = startDir;
                                        args.compatToolName = compatToolName;
                                        args.steamClientID = steamClientID;
                                        args.gameId = String(steamClientID);
                                        args.appId = String(id);
                                    }
                                }
                                scriptRunner(initActionSet, action.ActionId, args);
                            }
                        }>{action.Title}</MenuItem>;
                    else
                        return null;

                })}

            </Menu>,
            e.currentTarget ?? window
        );
    };

    return (
        <>
            <div
                style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(0deg, #77777712, transparent)'
                    // background: 'linear-gradient(0deg, #0000007d, transparent)'
                }}
            >
                <ImageMarquee sources={images} height='165px' />
            </div>
            <FocusOnMount
                style={{
                    display: 'grid',
                    gridTemplateColumns: '340px auto',
                    flex: 'auto',
                    gap: '40px',
                    padding: '20px 24px',
                    background: 'radial-gradient(155.42% 100% at 0% 0%, #060a0e 0 0%, #0e141b 100%)'
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 0' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{name}</div>
                    <div>
                        {installing && (
                            <div style={{ margin: '5px 2px 10px' }}>
                                <div style={{ marginBottom: '5px', color: '#969696', fontSize: '11px', lineHeight: '11px' }}>
                                    {progress.Description}
                                </div>
                                <ProgressBar nProgress={progress.Percentage} />
                            </div>
                        )}
                        <Focusable style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <DialogButton onClick={installing ? cancelInstall : steamClientID == "" ? installer : runner}>
                                {installing ? 'Cancel' : steamClientID == "" ? 'Install Game' : 'Play Game'}
                            </DialogButton>
                            <div style={{ display: 'flex', gap: '10px', height: '40px' }}>
                                {/* actions.length > 0 && ( */}
                                <DialogButton
                                    onClick={actionsMenu}
                                    style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                                >
                                    <FaSlidersH style={{ verticalAlign: 'middle' }} />
                                </DialogButton>
                                {/* ) */}
                                {editors.length > 0 && (
                                    <DialogButton
                                        onClick={contextMenu}
                                        style={{ width: "48px", minWidth: 'initial', padding: 'initial' }}
                                    >
                                        <FaCog style={{ verticalAlign: 'middle' }} />
                                    </DialogButton>
                                )}
                            </div>
                        </Focusable>
                    </div>
                </div>
                <div style={{ width: '100%', padding: '8px 0', color: '#c2c0c0' }}>
                    <ScrollableWindow
                        height='100%'
                        onCancel={() => {
                            clearActiveGame();
                            closeModal();
                        }}
                    >
                        <div
                            style={{ paddingRight: '10px', whiteSpace: 'pre-wrap' }}
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </ScrollableWindow>
                </div>
            </FocusOnMount>
        </>
    );
};

interface ImageMarqueeProps {
    sources: string[];
    height: string;
}

const ImageMarquee: VFC<ImageMarqueeProps> = ({ sources, height }) => {
    const [key, setKey] = useState(0); //used to force marquee to remount so it works properly
    const ref = useRef<HTMLDivElement>(null);

    const checkOverflow = () => {
        if (ref.current?.parentElement?.parentElement) {
            const hasOverflow = ref.current.parentElement.parentElement.clientWidth < ref.current.scrollWidth;
            if (hasOverflow) setKey(1);
        }
    };

    return (
        <Marquee key={key} play={true} center={true} delay={0} speed={10}>
            <div key={'content'} style={{ height: height }} ref={ref}>
                {Array.isArray(sources) && //* this should not be necessary if the type is correct
                    sources.map((src: string) => (
                        <MarqueeImage
                            src={src}
                            onLoad={checkOverflow}
                        />
                    ))
                }
            </div>
        </Marquee>
    );
};

interface MarqueeImageProps {
    src: string;
    onLoad: () => void;
}

const MarqueeImage: VFC<MarqueeImageProps> = ({ src, onLoad }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(onLoad, [isImgLoaded]);
    return error ? null :
        <img
            key={src}
            style={{
                height: '100%',
                borderRadius: '3px',
                opacity: isImgLoaded ? 1 : 0,
                margin: isImgLoaded ? '0 8px' : 0,
                transition: 'opacity 1.5s ease',
            }}
            src={src}
            onLoad={() => setIsImgLoaded(true)}
            onError={() => setError(true)}
        />;
};

const FocusOnMount: FC<FocusableProps> = (props) => {
    const [shouldFocus, setShouldFocus] = useState(true);
    const focusable = <Focusable {...props} />;

    if (shouldFocus) {
        afterPatch(focusable.type, 'render', (_: any, ret: any) => {
            setShouldFocus(() => {
                ret.props.value.BTakeFocus(3);
                return false;
            });
            return ret;
        }, { singleShot: true });
    }

    return focusable;
};

export default GameDisplay;
