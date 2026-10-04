'use client';

// material-ui
import { useColorScheme } from '@mui/material/styles';
import Image from 'next/image';

// project imports
import { ThemeMode } from 'config';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain({ reverse }: { reverse?: boolean }) {
  const { colorScheme } = useColorScheme();
  const logoDark = '/assets/images/logo-dark.svg';

  const logo = '/assets/images/logo.svg';

  return <Image src={colorScheme !== ThemeMode.DARK ? logoDark : logo} alt="Mantis" width={118} height={35} />;
}
