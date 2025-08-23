import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Logo from "../../assets/icons/capstackLogo.svg";
import { Link, useRouter, usePathname } from "expo-router";
import { signOut } from "../../database/auth/SignOut";
import ThemeBody from "../ui/ThemeBody";
import WrapperView from "../input/WrapperView";
import { Sparkle, User, Settings, Archive, LogOut } from "lucide-react-native";
import ThemeText from "../ui/ThemeText";
import ThemeIcon from "../ui/ThemeIcon";
import "../../assets/stylesheet/global.css";

const items = [
  { label: "Generate", href: "/Main", icon: Sparkle },
  { label: "Archive", href: "/Archive", icon: Archive },
  { label: "Account", href: "/Account", icon: User },
  { label: "Settings", href: "/Settings", icon: Settings },
];

const NavList = () => {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname(); // 👈 get current path

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        setMessage(error.message || "Unable to Sign Out");
      } else {
        router.replace("/");
        console.log(message);
      }
    } catch (error) {
      setMessage(error.message || "Unable to Sign Out");
    }
  };

  return (
    <ThemeBody className="absolute top-0 lg:w-96 lg:rounded-r-2xl lg:rounded-l-none rounded-none left-0 w-screen h-screen flex flex-col p-2 justify-start items-start">
      <WrapperView className="items-center flex w-full">
        <Logo />
      </WrapperView>

      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href; // 👈 check active state
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-row flex justify-start items-center gap-3 w-full max-w-xl p-3 mb-4 rounded-md transition-all
              ${isActive ? "bg-AscentViolet/20" : "hover:bg-AscentViolet/40"}
            `}
          >
            <WrapperView className="flex flex-row items-center align-middle gap-3">
              <ThemeIcon>
                <Icon size={22} color="white" />
              </ThemeIcon>
              <ThemeText className="font-semibold text-lg">
                {item.label}
              </ThemeText>
            </WrapperView>
          </Link>
        );
      })}

      <TouchableOpacity
        onPress={handleSignOut}
        className="items-center flex flex-row gap-0 w-full justify-start"
      >
        <WrapperView className="p-3 flex flex-row items-center gap-2 ">
          <LogOut color="#FF6060" />
          <Text className="font-semibold color-RosePink text-lg">
            Sign Out
          </Text>
        </WrapperView>
      </TouchableOpacity>

      {message ? (
        <Text className="text-red-500 mt-2">{message}</Text>
      ) : null}
    </ThemeBody>
  );
};

export default NavList;
