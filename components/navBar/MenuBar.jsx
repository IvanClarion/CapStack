// components/navBar/NavBar.js
import { View } from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import NavList from './NavList';
import ThemeIcon from '../ui/ThemeIcon';
import LayoutView from '../layout/LayoutView';
import SectionView from '../layout/SectionView';

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
  
    <SectionView className="p-0 flex flex-col">
      <LayoutView className="px-3">
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <ThemeIcon className="p-0">
            <Menu className="w-10 h-7 android:h-20" />
          </ThemeIcon>
        </TouchableOpacity>
      </LayoutView>

      {/* AnimatePresence ensures exit animation plays when `open` becomes false */}
      <AnimatePresence>
        {open && (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: 'timing', duration: 250 }}
          >
            <NavList />
          </MotiView>
        )}
      </AnimatePresence>
    </SectionView>
  );
};

export default NavBar;
