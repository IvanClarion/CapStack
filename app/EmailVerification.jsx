import { ImageBackground,Text } from 'react-native'
import { Mail } from 'lucide-react-native'
import ThemeText from '../components/ui/ThemeText'
import LayoutView from '../components/layout/LayoutView'
import ThemeCard from '../components/ui/ThemeCard'
import WrapperView from '../components/input/WrapperView'
import SectionView from '../components/layout/SectionView'
import InputView from '../components/input/InputView'
import ThemeIcon from '../components/ui/ThemeIcon'
import GeneralButton from '../components/buttons/GeneralButton'
import React, { useState } from 'react'
import '../assets/stylesheet/global.css'
import { resetPasswordToEmail } from '../database/auth/EmailVerification'
const EmailVerification = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage,setSucessMessage] = useState('');
    const handleEmailLink = async()=>{
        if(!email.trim()){
            setMessage('Email Feild is Empty')
            setTimeout(()=>setMessage(''), 3000)
            return;
        }
        try{
            const success = await resetPasswordToEmail(email);
            if(success){
                setSucessMessage("Email Verification Link is Sent")
                setTimeout(()=>setSucessMessage(''),3000);
            }else{
                setMessage('Email Link Failed')
                setTimeout(()=>setMessage(''),3000);
            }
        }catch(error){
            setMessage(error.message);
            setTimeout(()=>setMessage(''),3000);
        }
    }
  return (
    <>
    <ImageBackground
    source={require('../assets/images/PanelBG.png')}
    className='flex-1 object-cover overflow-hidden items-center justify-center'
    >
    <SectionView>
        <ThemeCard className='authCard w-[360px]'>
            <LayoutView className='flex justify-center items-center'>
                <ThemeText className='font-bold text-xl'>Email Verification</ThemeText>
                <ThemeText>Verify your email to reset your password</ThemeText>
                
            </LayoutView>
                {message? <Text className='font-semibold color-RosePink'>{message}</Text>:null}
                {successMessage? <Text className='font-semibold text-green-500'>{successMessage}</Text>:null}
            <LayoutView className='flex flex-col w-full gap-2'>
                <ThemeText className='font-semibold'>Email</ThemeText>
            <WrapperView className='inputWrapper w-full gap-2'>
                <InputView placeholder='Email' className='w-full outline-none'
                value={email}
                onChangeText={setEmail}
                />
                <ThemeIcon><Mail/></ThemeIcon>
            </WrapperView>
            </LayoutView>
            <LayoutView className='w-full'>
                <GeneralButton className='generalbutton' onPress={handleEmailLink}>Verify Email</GeneralButton>
            </LayoutView>
        </ThemeCard>
    </SectionView>
    </ImageBackground>
    </>
  )
}

export default EmailVerification