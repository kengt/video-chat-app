/* eslint-disable import/no-unresolved */
import { container } from '.storybook/decorators'
import { dummyMutation, me } from '.storybook/dummies'
/* eslint-enable import/no-unresolved  */
import { Box } from '@chakra-ui/react'
import { Meta, Story } from '@storybook/react'
import { SignOutMutation, SignOutMutationVariables } from 'graphql/generated'
import React from 'react'
import { MutaionLoading } from 'types'
import Header, { HeaderProps } from './index'

export default {
  title: '04_organisms/Header',
  component: Header,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh' }}>
        <Box pos='absolute' w='18rem' h='100vh' bg='#dcdcdc' d={{ base: 'none', md: 'block' }} />
        {Story()}
      </div>
    ),
    (Story) => container({ height: '100%', background: '#f5f5f5' })(Story())
  ]
} as Meta

type HeaderStoryProps = HeaderProps & {
  signOutLoading: MutaionLoading
}

const Template: Story<HeaderStoryProps> = ({ signOutLoading, ...props }) => {
  const signOut = dummyMutation<SignOutMutation['signOut'], SignOutMutation, SignOutMutationVariables>(
    'SignOut',
    undefined,
    signOutLoading
  )
  const mutation = { signOut }
  return <Header {...{ ...props, me, mutation }} />
}

export const Primary = Template.bind({})
Primary.storyName = 'プライマリ'
Primary.args = {
  signOutLoading: false
}