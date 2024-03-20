import { findClassModule } from 'decky-frontend-lib';

type SteamSpinnerClasses = Record<
    'BackgroundAnimation'
    | 'Black'
    | 'Container'
    | 'ContainerBackground'
    | 'ExtraSpace'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-green'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder - darkGrey'
    | 'LoadingStatus'
    | 'Medium'
    | 'Small'
    | 'Spacer'
    | 'SpinnerLoaderContainer'
    | 'focusAnimation'
    | 'hoverAnimation',
    string
>;

type FooterClasses = Record<
    'duration-app-launch'
    | 'BasicFooter'
    | 'FooterLegend'
    | 'WithKeyboard'
    | 'QuickAccessFooter'
    | 'Opaque'
    | 'Relative'
    | 'Spacer'
    | 'PillShapedIcon'
    | 'BackgroundAnimation'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder-darkGrey'
    | 'ItemFocusAnim-green'
    | 'focusAnimation'
    | 'hoverAnimation',
    string
>;

type BasicAppDetailsClasses = Record<
    'ActionButtonAndStatusPanel'
    | 'ActionRow'
    | 'AppActionButton'
    | 'AppButtons'
    | 'AppDetailSectionList'
    | 'AppDetailsContainer'
    | 'AppDetailsContent'
    | 'AppDetailsRoot'
    | 'CollectionsHeader'
    | 'DeckVerifiedFeedbackButton'
    | 'DeckVerifiedFeedbackConfirmation'
    | 'DeckVerifiedFeedbackConfirmationContainer'
    | 'DeckVerifiedFeedbackContainer'
    | 'DeckVerifiedFeedbackQuestion'
    | 'GameInfoCollections'
    | 'GameInfoContainer'
    | 'GameInfoQuickLinks'
    | 'Header'
    | 'InvertFocusedIcon'
    | 'PlaySection'
    | 'duration-app-launch'
    | 'headerPadding',
    string
>;

type AppActionButtonClasses = Record<
    'BackgroundAnimation'
    | 'BreakNarrow'
    | 'BreakShort'
    | 'BreakTall'
    | 'BreakUltraWide'
    | 'BreakWide'
    | 'ButtonChild'
    | 'ButtonText'
    | 'ButtonThrobberPadding'
    | 'Disabled'
    | 'ForceShutdownButton'
    | 'GamepadUIBreakNarrow'
    | 'GamepadUIBreakShort'
    | 'GamepadUIBreakWide'
    | 'Green'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-green'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder-darkGrey'
    | 'LongButton'
    | 'NoAction'
    | 'PlayButton'
    | 'PlayButtonContainer'
    | 'RightBreakNarrow'
    | 'RightBreakUltraNarrow'
    | 'RightBreakUltraWide'
    | 'RightBreakWide'
    | 'ShowStreaming'
    | 'ShowingStreaming'
    | 'ShutdownAppButton'
    | 'StreamingCallout'
    | 'StreamingCalloutMessage'
    | 'StreamingCalloutMessageContainer'
    | 'StreamingContextMenuItem'
    | 'StreamingSelector'
    | 'Throbber'
    | 'ThrobberContainer'
    | 'WaitingForForceShutdown'
    | 'WaitingForShutdownSpinner'
    | 'duration-app-launch'
    | 'focusAnimation'
    | 'hoverAnimation'
    | 'rotate',
    string
>;

type LibraryAssetImageClasses = Record<
    'Container'
    | 'GreyBackground'
    | 'Hidden'
    | 'Image'
    | 'LandscapeImage'
    | 'LongTitles'
    | 'NoTransitions'
    | 'PortraitImage'
    | 'Short'
    | 'Title'
    | 'Visibility'
    | 'Visible'
    | 'duration-app-launch',
    string
>;

type GamepadLibraryClasses = Record<
    'AppGridFilterHeader'
    | 'AppGridFilterHeaderAsButton'
    | 'AppGridFilterText'
    | 'BackgroundAnimation'
    | 'BreakNarrow'
    | 'BreakShort'
    | 'BreakTall'
    | 'BreakUltraWide'
    | 'BreakWide'
    | 'CollectionContents'
    | 'CollectionHeader'
    | 'ComingSoon'
    | 'GamepadLibrary'
    | 'GamepadUIBreakNarrow'
    | 'GamepadUIBreakShort'
    | 'GamepadUIBreakWide'
    | 'ItemFocusAnim-darkGrey'
    | 'ItemFocusAnim-darkerGrey'
    | 'ItemFocusAnim-darkerGrey-nocolor'
    | 'ItemFocusAnim-green'
    | 'ItemFocusAnim-grey'
    | 'ItemFocusAnim-translucent-white-10'
    | 'ItemFocusAnim-translucent-white-20'
    | 'ItemFocusAnimBorder-darkGrey'
    | 'RightBreakNarrow'
    | 'RightBreakUltraNarrow'
    | 'RightBreakUltraWide'
    | 'RightBreakWide'
    | 'duration-app-launch'
    | 'focusAnimation'
    | 'hoverAnimation',
    string
>;

type FocusRingClasses = Record<
    'DebugFocusRing'
    | 'FocusRing'
    | 'FocusRingOnHiddenItem'
    | 'FocusRingRoot'
    | 'blinker'
    | 'fadeOutline'
    | 'flash'
    | 'growOutline',
    string
>;

export const steamSpinnerClasses = findClassModule(m => !!m['SpinnerLoaderContainer']) as SteamSpinnerClasses;
export const footerClasses = findClassModule(m => !!m['QuickAccessFooter']) as FooterClasses;
export const basicAppDetailsClasses = findClassModule(m => !!m['AppDetailSectionList']) as BasicAppDetailsClasses;
export const appActionButtonClasses = findClassModule(m => !!m['PlayButtonContainer']) as AppActionButtonClasses;
export const libraryAssetImageClasses = findClassModule(m => !!m['LongTitles'] && !!m['GreyBackground']) as LibraryAssetImageClasses;
export const gamepadLibraryClasses = findClassModule(m => !!m['GamepadLibrary']) as GamepadLibraryClasses;
export const focusRingClasses = findClassModule(m => !!m['FocusRingRoot']) as FocusRingClasses;