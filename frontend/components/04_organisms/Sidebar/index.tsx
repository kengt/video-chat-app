import { Box, BoxProps, CloseButton, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import AppLogo from 'components/01_atoms/AppLogo'
import ContactList from 'components/04_organisms/ContactList'
import LatestMessageList from 'components/04_organisms/LatestMessageList'
import { connect } from 'components/hoc'
import {
  ContactInfoQuery,
  ContactInfoQueryVariables,
  ContactsQuery,
  LatestMessagesQuery,
  MeQuery
} from 'graphql/generated'
import React from 'react'
import { ContactInfoUserId, ContainerProps, OnClose, QueryRefetch, SetState } from 'types'
import { toStr } from 'utils/general/helper'
import { isNullish } from 'utils/general/object'
import * as styles from './styles'

/** Sidebar Props */
export type SidebarProps = BoxProps & {
  /**
   * サイドバー onClose
   */
  onClose: OnClose
  /**
   * Local State
   */
  state: {
    /**
     *  コンタクト情報 ユーザーID
     */
    contactInfoUserId: {
      state: ContactInfoUserId
      setContactInfoUserId: SetState<ContactInfoUserId>
    }
  }
  /**
   * Query
   */
  query: {
    /**
     * ユーザー情報
     */
    me: {
      result?: MeQuery['me']
    }
    /**
     * コンタクト一覧
     */
    contacts: {
      result?: ContactsQuery['contacts']
    }
    /**
     * メッセージ一覧
     */
    latestMessages: {
      result?: LatestMessagesQuery['latestMessages']
    }
    /**
     *  コンタクト情報
     */
    contactInfo: {
      refetch: QueryRefetch<ContactInfoQuery, ContactInfoQueryVariables>
    }
  }
}

/** Presenter Props */
export type PresenterProps = SidebarProps & { count: string }

/** Presenter Component */
const SidebarPresenter: React.VFC<PresenterProps> = ({
  state,
  query: { me, contacts, latestMessages, contactInfo },
  onClose,
  count,
  ...props
}) => (
  <Box {...styles.root} {...props}>
    <Flex {...styles.head}>
      <AppLogo />
      <CloseButton {...styles.close} onClick={onClose} />
    </Flex>
    <Tabs isFitted {...styles.tabs}>
      <TabList>
        <Tab {...styles.tab}>
          <Text>Contacts</Text>
        </Tab>
        <Tab {...styles.tab}>
          <Text>Chats</Text>
          <Text {...styles.count({ count })}>{count}</Text>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel {...styles.panel}>
          <ContactList {...styles.contacts} onSbClose={onClose} state={state} query={{ me, contacts, contactInfo }} />
        </TabPanel>
        <TabPanel {...styles.panel}>
          <LatestMessageList
            {...styles.messages}
            onSbClose={onClose}
            state={state}
            query={{ me, latestMessages, contactInfo }}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
)

/** Container Component */
const SidebarContainer: React.VFC<ContainerProps<SidebarProps, PresenterProps>> = ({
  presenter,
  query: { latestMessages, ...queryRest },
  ...props
}) => {
  const unreadCount = latestMessages.result?.reduce((sum, ls) => sum + ls.unreadMessageCount, 0) ?? 0
  const count = !isNullish(unreadCount) && unreadCount > 99 ? '99+' : toStr(unreadCount)

  return presenter({
    query: { latestMessages, ...queryRest },
    count,
    ...props
  })
}

/** Sidebar */
export default connect<SidebarProps, PresenterProps>('Sidebar', SidebarPresenter, SidebarContainer)
