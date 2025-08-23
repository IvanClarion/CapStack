import { View, Text } from 'react-native'
import AccountProfile from './components/Account/Profile'
import BillProfile from './components/Account/Bills'
import React , {Suspense} from 'react'
import ThemeMain from '../components/ui/ThemeMain'
import LayoutView from '../components/layout/LayoutView'
import '../assets/stylesheet/global.css'
import Spacer from '../components/layout/Spacer'
import ScrollViews from '../components/ui/ScrollView'
import CardSkeleton from '../components/loader/CardSkeleton'
const Account = () => {
  const BillLoad = React.lazy(()=> import('./components/Account/Bills'))
  return (
    <>
    <ThemeMain>
    <ScrollViews>
    <LayoutView className='flex-1 m-2 gap-5 pt-10 flex align-super items-stretch justify-center lg:grid-cols-2 lg:grid lg:place-content-center lg:items-stretch'>
      <AccountProfile/>
    <Suspense fallback={<CardSkeleton/>}>
      <BillLoad/>
    </Suspense>
    </LayoutView>
    </ScrollViews>
    </ThemeMain>
    </>
  )
}

export default Account