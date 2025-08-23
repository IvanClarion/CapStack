import { View, Text } from 'react-native'
import { User, Trash, SquarePen } from 'lucide-react-native'
import { fetchCurrentUser } from '../../../database/auth/FetchAuth'
import { Portal } from 'react-native-portalize'
import React, { useEffect, useState } from 'react'
import ThemeCard from '../../../components/ui/ThemeCard'
import ThemeText from '../../../components/ui/ThemeText'
import WrapperView from '../../../components/input/WrapperView'
import LayoutView from '../../../components/layout/LayoutView'
import ButtonView from '../../../components/buttons/ButtonView'
import '../../../assets/stylesheet/global.css'
import CardSkeleton from '../../../components/loader/CardSkeleton'
import ResetPasswordModal from '../modal/ResetPasswordModal'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [changePassModal, setChangePassModal] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    }
    getUser()
  }, [])

  if (!user) {
    return <CardSkeleton />
  }

  return (
    <>
      <ThemeCard className="overflow-hidden gap-5">
        <LayoutView className="flex flex-row align-middle gap-2 items-center">
          <WrapperView className="iconWrapper">
            <User color={'white'} />
          </WrapperView>
          <ThemeText className="cardHeader">Profile</ThemeText>
        </LayoutView>

        <LayoutView className="flex items-stretch gap-2">
          <WrapperView className="flex flex-row items-center gap-2">
            <ThemeText className="cardlabel">Name:</ThemeText>
            <ThemeText>{user.user_metadata?.full_name}</ThemeText>
          </WrapperView>
          <WrapperView className="flex flex-row items-center gap-2">
            <ThemeText className="cardlabel">Email:</ThemeText>
            <ThemeText>{user.email}</ThemeText>
          </WrapperView>
        </LayoutView>

        <LayoutView className="flex lg:flex-row w-full items-center justify-start gap-2">
          <ButtonView
            className="simpleButton android:border-none android:w-full android:border-0"
            onPress={() => setChangePassModal(true)}
          >
            <WrapperView className="flex flex-row items-center gap-1">
              <SquarePen size={16} color={'white'} />
              <Text className="font-semibold color-white">Change Password</Text>
            </WrapperView>
          </ButtonView>

          <ButtonView className="deleteButton android:border-none android:w-full android:border-0 ">
            <WrapperView className="flex flex-row items-center gap-1">
              <Trash size={16} color={'white'} />
              <Text className="font-semibold color-white">Delete Account</Text>
            </WrapperView>
          </ButtonView>
        </LayoutView>
      </ThemeCard>


      <Portal>
        <ResetPasswordModal
          visible={changePassModal}
          onClose={() => setChangePassModal(false)}
        />
      </Portal>
    </>
  )
}

export default Profile
