"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faA,
  faArrowLeft,
  faArrowRight,
  faArrowTrendUp,
  faArrowUpFromBracket,
  faBell,
  faBookOpen,
  faCamera,
  faChartColumn,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation,
  faCircleQuestion,
  faCloud,
  faCloudArrowUp,
  faGear,
  faGrip,
  faHashtag,
  faImage,
  faLock,
  faMagnifyingGlass,
  faMicrophoneLines,
  faPalette,
  faPenToSquare,
  faPlus,
  faPuzzlePiece,
  faRocket,
  faSchool,
  faShapes,
  faShieldHalved,
  faSliders,
  faStar,
  faTrophy,
  faUser,
  faVolumeHigh,
  faVolumeXmark,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export type SymbolName =
  | "abc"
  | "add"
  | "add_a_photo"
  | "arrow_back"
  | "arrow_back_ios_new"
  | "arrow_forward_ios"
  | "arrow_forward"
  | "auto_stories"
  | "bar_chart"
  | "category"
  | "chevron_left"
  | "chevron_right"
  | "cloud_upload"
  | "cloudy"
  | "dashboard"
  | "edit"
  | "emoji_events"
  | "error"
  | "error_outline"
  | "extension"
  | "help"
  | "history"
  | "lock"
  | "notifications"
  | "palette"
  | "person"
  | "pin"
  | "publish"
  | "rocket_launch"
  | "record_voice_over"
  | "school"
  | "search"
  | "settings"
  | "smart_button"
  | "star"
  | "trending_up"
  | "toys"
  | "verified_user"
  | "visibility"
  | "visibility_off"
  | "volume_off"
  | "volume_up"
  | "warning";

type MaterialSymbolProps = {
  name: SymbolName;
  className?: string;
  filled?: boolean;
};

const ICONS: Record<SymbolName, IconDefinition> = {
  abc: faA,
  add: faPlus,
  add_a_photo: faCamera,
  arrow_back: faArrowLeft,
  arrow_back_ios_new: faChevronLeft,
  arrow_forward_ios: faChevronRight,
  arrow_forward: faArrowRight,
  auto_stories: faBookOpen,
  bar_chart: faChartColumn,
  category: faShapes,
  chevron_left: faChevronLeft,
  chevron_right: faChevronRight,
  cloud_upload: faCloudArrowUp,
  cloudy: faCloud,
  dashboard: faGrip,
  edit: faPenToSquare,
  emoji_events: faTrophy,
  error: faCircleExclamation,
  error_outline: faCircleExclamation,
  extension: faPuzzlePiece,
  help: faCircleQuestion,
  history: faArrowLeft,
  lock: faLock,
  notifications: faBell,
  palette: faPalette,
  person: faUser,
  pin: faHashtag,
  publish: faArrowUpFromBracket,
  rocket_launch: faRocket,
  record_voice_over: faMicrophoneLines,
  school: faSchool,
  search: faMagnifyingGlass,
  settings: faGear,
  smart_button: faSliders,
  star: faStar,
  trending_up: faArrowTrendUp,
  toys: faImage,
  verified_user: faShieldHalved,
  visibility: faEye,
  visibility_off: faEyeSlash,
  volume_off: faVolumeXmark,
  volume_up: faVolumeHigh,
  warning: faWarning,
};

export function MaterialSymbol({
  name,
  className,
  filled = false,
}: MaterialSymbolProps) {
  const icon = ICONS[name];

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      fixedWidth
      aria-hidden="true"
      data-filled={filled ? "true" : "false"}
    />
  );
}
