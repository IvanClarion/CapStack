import { View, Text } from 'react-native'
import React from 'react'
import LayoutView from '../../../components/layout/LayoutView'
import AccountSet from './AccountSet'
import BillsSet from './BillsSet'
import TransactionSet from './TransactionSet'
import ReportSet from './ReportSet'
import WebView from '../../../components/ui/WebView'
const SettingsComp = () => {
  return (
    <WebView>
        <AccountSet/>
        <BillsSet/>
        <TransactionSet/>
        <ReportSet/>
    </WebView>
  )
}

export default SettingsComp