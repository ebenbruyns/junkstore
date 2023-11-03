// Define the game image

import { Focusable } from "decky-frontend-lib";
//@ts-ignore
function GameImage(props) {
  return (
    // @ts-ignore

    <Focusable
      // @ts-ignore
      focusableIfNoChildren={true}
      style={{ width: "100%", height: "77%" }}
      onClick={props.onClick}
      onOKButton={props.onClick}
      onOKActionDescription="Show details"

    >
      <img style={{ width: "100%", height: "100%" }} src={props.src} alt={props.src}></img>
    </Focusable>
  );
}
export default GameImage;
