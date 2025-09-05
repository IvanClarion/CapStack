import { View, Text, TouchableOpacity } from "react-native";
import { useRouter,usePathname,Link } from "expo-router";
import { signOut } from "../../database/auth/SignOut";
import ButtonView from "../buttons/ButtonView";
import { Menu, Search, Sparkle, User, LogOut } from "lucide-react-native";
import React from "react";
import ThemeText from "../ui/ThemeText";
import LayoutView from "../layout/LayoutView";
import "../../assets/stylesheet/global.css";
import ThemeCard from "../ui/ThemeCard";
import WrapperView from "../input/WrapperView";
import ThemeIcon from "../ui/ThemeIcon";
import InputView from "../input/InputView";
import ThemeBody from "../ui/ThemeBody";
import ScrollViews from "../ui/ScrollView";
import NoIdeas from "./NoIdeas";
const NavList = ({ onClose }) => {
  const router = useRouter();
  const pathname = usePathname(); // 👈 get current path

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.log(error.message || "Unable to Sign Out");
      } else {
        router.replace("/");
        console.log(message);
      }
    } catch (error) {
      console.log(error.message || "Unable to Sign Out");
    }
  }
  return (
    <ThemeBody className="flex-1 min-h-screen flex gap-5 p-5 rounded-none lg:w-[30%]">
      {/* Header Row */}
      <LayoutView className="flex flex-row gap-2 items-center">
        <TouchableOpacity onPress={onClose}>
          <ThemeIcon className="bg-secondaryCard p-1 rounded-lg">
            <Menu />
          </ThemeIcon>
        </TouchableOpacity>

        <WrapperView className="flex flex-row flex-1 border border-gray-500 p-1 rounded-lg bg-transparent">
          <InputView className="flex-1 p-1 w-full" />
          <Search color={"white"} />
        </WrapperView>
      </LayoutView>

     
      <Link href='/Main'>
        <WrapperView className="flex-row gap-3 align-middle items-center">
          <ThemeIcon>
            <Sparkle />
          </ThemeIcon>
          <ThemeText className="font-semibold">Generate a New Idea</ThemeText>
        </WrapperView>
      </Link>
    
      {/* Divider */}
      <LayoutView>
        <WrapperView className="bg-white w-full flex-1 p-[1px]" />
      </LayoutView>

    <ScrollViews className='max-h-[70%]'>
      {/* Empty State */}
      <LayoutView>
          <NoIdeas/>
      </LayoutView>
    </ScrollViews>

      {/* Footer */}
      
     <LayoutView className="flex-row w-full items-center justify-between p-5">
      <Link href="Account">
        <WrapperView className="flex-row items-center gap-2">
          <ThemeIcon>
            <User size={30} />
          </ThemeIcon>
          <ThemeText className="font-semibold text-lg">Account</ThemeText>
        </WrapperView>
      </Link>

      <TouchableOpacity onPress={handleSignOut}>
        <WrapperView className="flex-row items-center gap-2">
          <LogOut color={"#FF6060"} />
          <ThemeText className="color-RosePink font-bold">Sign Out</ThemeText>
        </WrapperView>
      </TouchableOpacity>
    </LayoutView>

    </ThemeBody>
  );
};

export default NavList;
