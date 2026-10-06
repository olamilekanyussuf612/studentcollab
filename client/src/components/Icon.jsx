import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaBook,
  FaCalculator,
  FaChartSimple,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaCircleQuestion,
  FaClone,
  FaComment,
  FaDownload,
  FaGraduationCap,
  FaHandWave,
  FaHouse,
  FaImage,
  FaInbox,
  FaLock,
  FaPenToSquare,
  FaRobot,
  FaSparkles,
  FaThumbtack,
  FaToolbox,
  FaTriangleExclamation,
  FaUser,
  FaXmark
} from "react-icons/fa6";

const ICONS = {
  book: FaBook,
  "pen-to-square": FaPenToSquare,
  calculator: FaCalculator,
  robot: FaRobot,
  "graduation-cap": FaGraduationCap,
  clone: FaClone,
  "circle-question": FaCircleQuestion,
  comment: FaComment,
  image: FaImage,
  "chart-simple": FaChartSimple,
  house: FaHouse,
  toolbox: FaToolbox,
  user: FaUser,
  "arrow-up": FaArrowUp,
  download: FaDownload,
  "arrow-left": FaArrowLeft,
  "arrow-right": FaArrowRight,
  "chevron-down": FaChevronDown,
  "chevron-right": FaChevronRight,
  "triangle-exclamation": FaTriangleExclamation,
  "circle-check": FaCheckCircle,
  lock: FaLock,
  "thumbtack": FaThumbtack,
  "hand-wave": FaHandWave,
  inbox: FaInbox,
  xmark: FaXmark,
  sparkles: FaSparkles
};

export default function Icon({ name, className = "", title }) {
  const Component = ICONS[name] || FaSparkles;

  return (
    <Component
      className={className}
      aria-hidden={!title}
      title={title || undefined}
    />
  );
}
