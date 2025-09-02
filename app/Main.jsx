
import React ,{Suspense} from 'react'
import ThemeMain from '../components/ui/ThemeMain'
import ThemeText from '../components/ui/ThemeText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LayoutView from '../components/layout/LayoutView'
import '../assets/stylesheet/global.css'
import MainForm from './components/main/MainForm'
import CardSkeleton from '../components/loader/CardSkeleton'
const Main = () => {
    const MainPage = React.lazy(()=>import('./components/main/MainForm'));
  return (
  <>
    <ThemeMain >
      <LayoutView className='flex-1 items-center justify-center flex'>
      <Suspense fallback={<CardSkeleton/>}>
      <MainPage/>
      </Suspense>
      </LayoutView>
    </ThemeMain>
  </>
  )
}

export default Main
