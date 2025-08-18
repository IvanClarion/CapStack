import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import Logo from'../../assets/icons/capstackLogo.svg'
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import ThemeCard from '../ui/ThemeCard';
import WrapperView from '../input/WrapperView';
import { House, User, Settings,Archive, LogOut } from 'lucide-react-native';
import '../../assets/stylesheet/global.css';
const items = [
  { label: 'Dashboard', href: '/Main', icon: House },
  { label: 'Archive', href: '/Archive', icon: Archive },
  { label: 'Account', href: '/Account', icon: User },
  { label: 'Settings', href: '/Settings', icon: Settings },
];

const NavList = () => (
  <ThemeCard className="absolute overflow-hidden top-0 lg:w-96 lg:rounded-r-2xl lg:rounded-l-none rounded-t-2xl rounded-l-none left-0 w-screen h-screen bg-se flex flex-col p-2 justify-start items-start">
  <WrapperView className='items-center flex w-full'>
   <Logo/>
  </WrapperView>
   <WrapperView className='flex justify-start items-start'>
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          className="flex-row flex color-white justify-start items-start gap-3 w-full max-w-xl p-2 mb-4 rounded-x"
        >
          <Icon size={22} color="white" />
          <Text className=" font-semibold text-lg">{item.label}</Text>
        </Link>
      );
    })}
    </WrapperView>
    <WrapperView className='absolute bottom-24'>
    <TouchableWithoutFeedback className='items-start flex flex-row gap-2 w-full justify-start ' >
      <Text className=" font-semibold color-white text-start flex gap-2 items-center w-full p-2  text-lg"><LogOut/>Sign out</Text>
      </TouchableWithoutFeedback>
    </WrapperView>
  </ThemeCard>
);

export default NavList;