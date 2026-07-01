import type { SideBarActionsEnum } from './SideBarActionsEnum'

export interface LinkProp {
  to?: string
  action?: SideBarActionsEnum
  icon: object
  label: string
  cssClass?: string
}
