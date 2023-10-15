import { findModuleChild } from "decky-frontend-lib";
import { FC } from "react"

interface SimpleModalProps{
    active?: boolean
}

const ModalModule = findModuleChild((mod) => {
  if (typeof mod !== 'object' || !mod.__esModule) return undefined;
  if (mod.SimpleModal && mod.ModalPosition) return mod;
})

const ScrollingModule = findModuleChild((mod) => {
  if (typeof mod !== 'object' || !mod.__esModule) return undefined;
  if (mod.ScrollPanel) return mod;
})

export const ScrollPanelGroup = findModuleChild((mod) => {
  if (typeof mod !== 'object' || !mod.__esModule) return undefined;
  return mod.ScrollPanelGroup;
})

export const Panel = findModuleChild((mod) => {
  if (typeof mod !== 'object' || !mod.__esModule) return undefined;
  return mod.Panel;
})

export const ScrollPanel = ScrollingModule.ScrollPanel;
export const SimpleModal = ModalModule.SimpleModal  as FC<SimpleModalProps>
export const ModalPosition = ModalModule.ModalPosition  as FC<SimpleModalProps>
