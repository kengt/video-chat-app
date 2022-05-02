import { ApolloError, GraphQLErrors } from '@apollo/client/errors'
import ResetPasswordTemplate, {
  ResetPasswordTemplateProps
} from 'components/06_templates/ResetPasswordTemplate'
import { ERROR_PAGE } from 'const'
import { addApolloState, initializeApollo } from 'graphql/apollo'
import {
  IsPasswordResetTokenValidDocument,
  IsPasswordResetTokenValidQuery,
  IsPasswordResetTokenValidQueryVariables,
  ResetPasswordInput,
  useResetPasswordMutation
} from 'graphql/generated'
import { handle, Handler, isValidationErrors } from 'graphql/lib'
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Unbox, ValidationErrors } from 'types'

const ResetPassword: NextPage<
  Partial<{
    token: ResetPasswordInput['token']
    result: IsPasswordResetTokenValidQuery['isPasswordResetTokenValid']
    errors: ValidationErrors
  }>
> = (props) => {
  const router = useRouter()

  // Redirect
  const toErrorPage = () => router.replace(ERROR_PAGE)

  // Operation Handler
  const handler: Handler<Promise<boolean> | GraphQLErrors | undefined> = {
    noError: () => undefined,
    validationError: (errors) => errors,
    _default: () => toErrorPage()
  }

  //  ----------------------------------------------------------------------------
  //  Mutation
  //  ----------------------------------------------------------------------------

  // パスワードリセット
  const [resetPassword, resetPasswordMutation] = useResetPasswordMutation()
  const resetPasswordResult = handle(resetPasswordMutation.error, handler)

  //  ----------------------------------------------------------------------------

  // ResetPasswordTemplate Props
  const templateProps: ResetPasswordTemplateProps = {
    ...props,
    mutation: {
      resetPassword: {
        loading: resetPasswordMutation.loading,
        errors: isValidationErrors(resetPasswordResult) ? resetPasswordResult : undefined,
        reset: resetPasswordMutation.reset,
        resetPassword
      }
    }
  }

  return <ResetPasswordTemplate {...templateProps} />
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const apolloClient = initializeApollo()

  const token = params?.roken as Exclude<Unbox<GetServerSidePropsContext['params']>, string[]>
  const { data, error } = await apolloClient
    .query<IsPasswordResetTokenValidQuery, IsPasswordResetTokenValidQueryVariables>({
      query: IsPasswordResetTokenValidDocument,
      variables: { token }
    })
    .catch((error) => ({ data: undefined, error: error as ApolloError }))

  return handle(error, {
    noError: () =>
      addApolloState(apolloClient, { props: { token, result: data?.isPasswordResetTokenValid } }),
    validationError: (errors) => addApolloState(apolloClient, { props: { errors } }),
    _default: () => ({ redirect: { permanent: false, destination: ERROR_PAGE } })
  })
}

export default ResetPassword
