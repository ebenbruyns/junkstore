// Define the game image

import { Focusable } from "decky-frontend-lib";
//@ts-ignore
function GameImage(props) {
  return (
    // @ts-ignore

    <Focusable focusableIfNoChildren={true} style={{ width: 150, height: 200 }} onClick={props.onClick} onOKButton={props.onClick} onOKActionDescription="Show details"
      onMenuActionDescription="menu" onOptionsActionDescription="options" onMenuButton={() => { }}
      onOptionsButton={() => { }} onAbort={() => { }} >
      <img width={150} height={200} src={props.src} alt={props.src}>
      </img>

    </Focusable>

  );
}
export default GameImage;
