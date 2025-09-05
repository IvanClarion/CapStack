import { View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Menu } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import NavList from "./NavList";
import ThemeIcon from "../ui/ThemeIcon";
import LayoutView from "../layout/LayoutView";
import SectionView from "../layout/SectionView";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <SectionView className="p-0 w-full flex-col">
      {/* Top bar */}
      <LayoutView className="p-4">
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <ThemeIcon className="p-0">
            <Menu className="w-10 h-7 android:h-20" />
          </ThemeIcon>
        </TouchableOpacity>
      </LayoutView>

      {/* Dropdown overlay */}
      <AnimatePresence>
        {open && (
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -10 }}
            transition={{ type: "timing", duration: 250 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <NavList  onClose={() => setOpen(false)} />
          </MotiView>
        )}
      </AnimatePresence>
    </SectionView>
  );
};

export default NavBar;
