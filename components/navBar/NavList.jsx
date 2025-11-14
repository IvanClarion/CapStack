import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname, Link } from "expo-router";
import { signOut } from "../../database/auth/SignOut";
import { Menu, Search, Sparkle, User, LogOut } from "lucide-react-native";
import React, { useState } from "react";
import ThemeText from "../ui/ThemeText";
import LayoutView from "../layout/LayoutView";
import "../../assets/stylesheet/global.css";
import WrapperView from "../input/WrapperView";
import ThemeIcon from "../ui/ThemeIcon";
import InputView from "../input/InputView";
import ThemeBody from "../ui/ThemeBody";
import ScrollViews from "../ui/ScrollView";
import ArchiveList from "../../app/components/archives/ArchiveList";
// If you need the user ID, import supabase and fetch it or pass it in as prop.

const NavList = ({ onClose, userId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.log(error.message || "Unable to Sign Out");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.log(error.message || "Unable to Sign Out");
    }
  };

  return (
    <ThemeBody className="flex-1 min-h-screen flex gap-5 p-5 rounded-none lg:w-[30%]">
      {/* Header Row */}
      <LayoutView className="flex flex-row gap-2 items-center">
        <TouchableOpacity onPress={onClose}>
          <ThemeIcon className="bg-secondaryCard p-1 rounded-lg">
            <Menu size={30}/>
          </ThemeIcon>
        </TouchableOpacity>

        <WrapperView className="flex flex-row flex-1 border border-gray-500 p-2 android:p-3 rounded-lg bg-transparent items-center">
          <InputView
            className="flex-1 p-1 w-full"
            placeholder="Search archived ideas..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
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
        <LayoutView>
          <ArchiveList
            userId={userId}
            archivedOnly={true}
            searchTerm={search}
            onItemPress={(item) => {
              // Example: navigate or close nav then open detail
              console.log("Open archived conversation:", item.id);
            }}
            onItemOptions={(item) => {
              console.log("Options for:", item.id);
            }}
          />
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