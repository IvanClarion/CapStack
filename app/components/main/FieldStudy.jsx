import { View, TouchableOpacity } from 'react-native'
import { MoveRight, Search } from 'lucide-react-native'
import React from 'react'
import '../../../assets/stylesheet/global.css'
import ThemeBody from '../../../components/ui/ThemeBody'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import ButtonMain from '../../../components/buttons/ButtonMain'
import ScrollViews from '../../../components/ui/ScrollView'
import ThemeText from '../../../components/ui/ThemeText'
import InputView from '../../../components/input/InputView'
import ThemeIcon from '../../../components/ui/ThemeIcon'
const FieldStudy = () => {
  const field = [
    'Information Technology',
    'Computer Science',
    'Engineering General',
    'Electrical Engineering',
    'Architecture',
    'Mathematics',
    'Medical Technology',
    'Civil Engineering',
  ]

  const description =[
    'Network systems, databases, IT solutions, and system integration',
    'Software development, algorithms, AI systems, Cybersecurity',
    'Technical solutions or multidisciplinary prototypes',
    'Circuits, IoT, and power systems',
    'Building design concepts and sustainable structures',
    ' Data analysis models, statistical tools, theoretical polynomial',
    'Health devices, diagnostics, and Health information system',
    'Infrastructure planning, structural models, transportation'
  ]

  return (
  <>
    <LayoutView className="flex-1 gap-5">
      <WrapperView className='inputWrapper'>
          <InputView className='flex-1' placeholder='Search'/>
          <ThemeIcon>
          <Search/>
          </ThemeIcon>
      </WrapperView>
      <ScrollViews >
        <LayoutView className="gap-3 lg:grid lg:grid-cols-4">
          {field.map ((item, i) => (
            <ThemeBody key={i} className="WrapperChoices android:py-5 lg:py-8">
              <TouchableOpacity className="WrapperChoicesButton">
                <ThemeText className="font-semibold text-base capitalize">
                  {item}
                </ThemeText>
                <ThemeText className="text-sm text-center color-gray-400">
                  {description [i]}
                </ThemeText>
              </TouchableOpacity>
            </ThemeBody>
          ))}
        </LayoutView>
      </ScrollViews>
        <ButtonMain className='flex'>Next <MoveRight color={"white"}/></ButtonMain>
    </LayoutView>
  </>
  )
}

export default FieldStudy
