import { View, Text } from 'react-native'
import React from 'react'
import { Lightbulb } from 'lucide-react-native'
import WrapperView from '../input/WrapperView'
import ThemeText from '../ui/ThemeText'
import ThemeIcon from '../ui/ThemeIcon'
const NoIdeas = () => {
  return (
     <WrapperView className="flex items-center justify-center">
        <ThemeIcon>
            <Lightbulb size={50} />
        </ThemeIcon>
        <ThemeText className="cardHeader">Your Ideas</ThemeText>
         <ThemeText className="text-gray-300">There's nothing here yet.</ThemeText>
    </WrapperView>
  )
}

export default NoIdeas