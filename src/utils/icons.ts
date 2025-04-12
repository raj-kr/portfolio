import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';

const iconMap: { [key: string]: IconType } = {
  ...FaIcons,
  ...SiIcons,
};

export const getIcon = (iconName: string): IconType => {
  return iconMap[iconName] || FaIcons.FaCode;
}; 