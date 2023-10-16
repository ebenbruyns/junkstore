import {
  Focusable,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  useParams,
  Dropdown,
  Router,
  TextField,
  FocusRing,
  showModal,
  Carousel,
  findSP,
} from "decky-frontend-lib";
import { VFC, useEffect, useState, useRef } from "react";
import { ValueType, Section, ConfData, KeyValuePair } from "./Types";
import { SectionEditor } from "./SectionEditor";
import { Panel, ScrollPanelGroup } from "./Scrollable";

export interface SectionEditorProps {
  section: Section;
  onChange: (section: Section) => void;
}
export const ConfEditorPage: VFC<{ serverAPI: ServerAPI }> = ({
  serverAPI,
}) => {
  const { shortname, platform, forkname, version } = useParams<{
    shortname: string;
    platform: string;
    forkname: string;
    version: string;
  }>();
  const [confData, setConfData] = useState({} as ConfData);
  const focusRef = useRef(null);
  const [modeLevel, setModeLevel] = useState(0 as number);
  const [helpText, setHelpText] = useState({
    Key: "",
    Description: "",
    DefaultValue: "",
    Value: "",
    Type: ValueType.String,
    Min: 0,
    ModeLevel: 0,
    Max: 100,
    Parents: [],
    EnumValues: [],
  } as KeyValuePair);
  const [sectionHelpText, setSectionHelpText] = useState("" as string);
  useEffect(() => {
    serverAPI
      .callPluginMethod<{}, ConfData>("get_config", {
        tabindex: 0,
        shortname: shortname,
        platform: platform,
        version: version,
        forkname: forkname,
      })
      .then((data) => {
        setConfData(data.result as ConfData);
      });
  }, []);
  const handleSectionChange = (section: Section) => {
    const updatedSections = confData.Sections.map((s) =>
      s.Name === section.Name ? section : s
    );
    setConfData({ ...confData, Sections: updatedSections });
  };
  const updateHelpText = (field: KeyValuePair) => {
    setHelpText(field);
  };
  return (
    <ScrollPanelGroup focusable={false}>
      <Panel>
        <Focusable style={{ display: "flex", marginTop: "80px" }}>
          <Focusable
            style={{
              flex: "1",
            }}
            onSecondaryActionDescription="Save config"
            onSecondaryButton={(_) => {
              serverAPI.callPluginMethod("save_config", {
                shortname: shortname,
                platform: platform,
                forkname: forkname,
                version: version,
                config_data: confData,
              });
              //Router.Navigate("/game/" + shortname)
            }}
          >
            <PanelSection title={"Configuration: " + shortname}>
              <Dropdown
                rgOptions={[
                  { data: 0, label: "Basic" },
                  { data: 1, label: "Advanced" },
                  { data: 2, label: "Expert" },
                  { data: 3, label: "All" },
                ]}
                onChange={(e) => {
                  setModeLevel(e.data);
                }}
                selectedOption={modeLevel}
              />
              {confData.Sections &&
                confData.Sections.map((section) => {
                  if (section && modeLevel >= section.ModeLevel)
                    return (
                      <SectionEditor
                        key={section.Name}
                        section={section}
                        modeLevel={modeLevel}
                        onChange={(updatedSection) =>
                          handleSectionChange(updatedSection)
                        }
                        updateHelpText={(field: KeyValuePair) => {
                          updateHelpText(field);
                          setSectionHelpText(section.Description);
                        }}
                      />
                    );
                })}
            </PanelSection>
            <PanelSection title="[Autoexec]">
              <Focusable
                focusableIfNoChildren={true}
                noFocusRing={false}
                onFocusCapture={(e) => {
                  if (focusRef && focusRef.current != null)
                    focusRef.current.focus();
                }}
                onOKButton={(e) => { }}
              >
                <textarea
                  className=""
                  ref={focusRef}
                  style={{ width: "100%", height: "200px" }}
                  value={confData.Autoexec}
                  onChange={(e) => {
                    setConfData({ ...confData, Autoexec: e.target.value });
                  }}
                />
              </Focusable>
            </PanelSection>
          </Focusable>
          <Focusable
            focusWithinClassName="gpfocuswithin"
            onActivate={() => {
              // WIP
              // showModal(
              //   <DetailsModal
              //     sectionHelpText={sectionHelpText}
              //     helpText={helpText}
              //   />
              // );
            }}
            style={{
              flex: 1,
              minHeight: 0,
              marginRight: "20px",
              position: "sticky",
              height: "fit-content",
              top: "40px",
            }}
          >
            <Panel focusable={true} noFocusRing={false}>
              <div>{sectionHelpText}</div>
              <div>{helpText.Description}</div>
              {helpText.EnumValues &&
                helpText.EnumValues.map((enumValue) => (
                  <div>
                    {enumValue.Key} {enumValue.Description}
                  </div>
                ))}
            </Panel>
          </Focusable>
        </Focusable>
      </Panel>
    </ScrollPanelGroup>
  );
};

// WIP
// export function DetailsModal({
//   closeModal,
//   sectionHelpText,
//   helpText,
// }: {
//   closeModal?: () => void;
//   sectionHelpText: any;
//   helpText: any;
// }) {
//   const SP = findSP();
//   return (
//     <Focusable onCancelButton={closeModal}>
//       <FocusRing>
//         <Carousel
//           fnItemRenderer={(_) => {
//             return (
//               <Focusable
//                 style={{
//                   marginTop: "40px",
//                   height: "calc( 100% - 40px )",
//                   overflowY: "scroll",
//                   display: "flex",
//                   justifyContent: "center",
//                   margin: "40px",
//                 }}
//               >
//                 <div>
//                   <div>{sectionHelpText}</div>
//                   <div>{helpText.Description}</div>
//                   {helpText.EnumValues &&
//                     helpText.EnumValues.map((enumValue) => (
//                       <div>
//                         {enumValue.Key} {enumValue.Description}
//                       </div>
//                     ))}
//                 </div>
//               </Focusable>
//             );
//           }}
//           fnGetId={(id) => id}
//           nNumItems={1}
//           nItemMarginX={0}
//           initialColumn={0}
//           autoFocus={true}
//           nHeight={SP.innerHeight - 40}
//           nItemHeight={SP.innerHeight - 40}
//           fnGetColumnWidth={() => SP.innerWidth}
//           name="test"
//         />
//       </FocusRing>
//     </Focusable>
//   );
// }
