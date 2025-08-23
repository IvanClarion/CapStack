import { View, Text } from 'react-native'
import { User,Trash,SquarePen } from 'lucide-react-native'
import { fetchCurrentUser } from '../../../database/auth/FetchAuth'
import React, { useEffect, useState } from 'react'
import ThemeCard from '../../../components/ui/ThemeCard'
import ThemeText from '../../../components/ui/ThemeText'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import InputView from '../../../components/input/InputView'
import ScrollViews from '../../../components/ui/ScrollView'
import ButtonView from '../../../components/buttons/ButtonView'
import '../../../assets/stylesheet/global.css'
import CardSkeleton from '../../../components/loader/CardSkeleton'
const Profile = () => {
    const [user,setuser] = useState('');

    useEffect(()=>{
        const getUser = async()=>{
            const currentUser = await fetchCurrentUser();
            setuser(currentUser);
        };
        getUser();
    }, [])

    if(!user){
        return <CardSkeleton/>
    }

    
  return (
<ThemeCard className=' overflow-hidden gap-5'>
    <LayoutView className='flex flex-row align-middle gap-2 items-center'>
    <WrapperView className='iconWrapper'>
            <User color={'white'}/>
    </WrapperView>
        <ThemeText className='cardHeader'>Profile</ThemeText>
    </LayoutView>
        <LayoutView className='flex  items-stretch gap-2'>
            <WrapperView className='flex flex-row items-center gap-2'>
            <ThemeText className='cardlabel'>Name:</ThemeText>
            <ThemeText>{user.user_metadata?.full_name}</ThemeText>
            </WrapperView>
            <WrapperView className='flex flex-row items-center gap-2'>
            <ThemeText className='cardlabel'>Email:</ThemeText>
            <ThemeText>{user.email}</ThemeText>
            </WrapperView>
        </LayoutView>
        <LayoutView className='flex lg:flex-row w-full  items-center justify-start gap-2'>
            
            <ButtonView className='simpleButton android:border-none android:w-full android:border-0'>
            <WrapperView className='flex flex-row items-center gap-1'>
            <SquarePen size={16} color={'white'}/>
               <Text className="font-semibold color-white">Change Password</Text>
            </WrapperView>
            </ButtonView>
            <ButtonView className='deleteButton android:border-none android:w-full android:border-0 '>
                <WrapperView className='flex flex-row items-center gap-1'>
                    <Trash size={16} color={'white'}/>
                    <Text className="font-semibold color-white">Delete Account</Text>
                </WrapperView>
            </ButtonView> 
            
        </LayoutView>
    </ThemeCard>
  )
}

export default Profile