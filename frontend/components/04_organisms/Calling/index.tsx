import {
  AspectRatio,
  HStack,
  IconButton,
  IconButtonProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalProps,
  Stack,
  useBoolean
} from '@chakra-ui/react'
import { connect } from 'components/hoc'
import {
  Call,
  CancelMutation,
  CancelMutationVariables,
  ContactInfoQuery,
  HangUpMutation,
  HangUpMutationVariables,
  IceCandidateSubscription,
  PickUpMutation,
  PickUpMutationVariables,
  RingUpMutation,
  RingUpMutationVariables,
  SendIceCandidateMutation,
  SendIceCandidateMutationVariables,
  SignalingSubscription
} from 'graphql/generated'
import React, { Ref, useCallback, useMemo, useRef } from 'react'
import {
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
  BsFillMicFill,
  BsFillMicMuteFill,
  BsSquareFill
} from 'react-icons/bs'
import { ApolloClient, CallType, ContainerProps, MutateFunction, SetState, SubscriptionLoading } from 'types'
import { isNullish } from 'utils/general/object'
import { WebRTC } from 'utils/webrtc'
import * as styles from './styles'

/** Calling Props */
export type CallingProps = Omit<ModalProps, 'children'> & {
  /**
   * 応答 Call ID
   */
  rcCallId?: Call['id']
  /**
   * ApolloClient
   */
  apolloClient: ApolloClient
  /**
   * Local State
   */
  state: {
    /**
     *  通話タイプ
     */
    callType: {
      state: CallType
      setCallType: SetState<CallType>
    }
  }
  /**
   * Query
   */
  query: {
    /**
     *  コンタクト情報
     */
    contactInfo: {
      result?: ContactInfoQuery['contactInfo']
    }
  }
  /**
   * Mutation
   */
  mutation: {
    /**
     * 通話架電
     */
    ringUp: {
      mutate: MutateFunction<RingUpMutation, RingUpMutationVariables>
    }
    /**
     * 通話応答
     */
    pickUp: {
      mutate: MutateFunction<PickUpMutation, PickUpMutationVariables>
    }
    /**
     * 通話終了
     */
    hangUp: {
      mutate: MutateFunction<HangUpMutation, HangUpMutationVariables>
    }
    /**
     * 通話キャンセル
     */
    cancel: {
      mutate: MutateFunction<CancelMutation, CancelMutationVariables>
    }
    /**
     * ICE Candidate 送信
     */
    sendIceCandidate: {
      mutate: MutateFunction<SendIceCandidateMutation, SendIceCandidateMutationVariables>
    }
  }
  /**
   * Subscription
   */
  subscription: {
    /**
     * シグナリング
     */
    signaling: {
      result?: SignalingSubscription['signalingSubscription']
      loading: SubscriptionLoading
    }
    /**
     * ICE Candidate
     */
    iceCandidate: {
      result?: IceCandidateSubscription['iceCandidateSubscription']
      loading: SubscriptionLoading
    }
  }
}

/** Presenter Props */
export type PresenterProps = Omit<
  CallingProps,
  'rcCallId' | 'apolloClient' | 'state' | 'query' | 'mutation' | 'subscription'
> & {
  micState: boolean
  cameraState: boolean
  remoteVideoRef: Ref<HTMLVideoElement>
  localVideoRef: Ref<HTMLVideoElement>
  onMicButtonClick: IconButtonProps['onClick']
  onCameraButtonClick: IconButtonProps['onClick']
  onHangUpButtonClick: IconButtonProps['onClick']
}

/** Presenter Component */
const CallingPresenter: React.VFC<PresenterProps> = ({
  micState,
  cameraState,
  remoteVideoRef,
  localVideoRef,
  onMicButtonClick,
  onCameraButtonClick,
  onHangUpButtonClick,
  ...props
}) => (
  <Modal size='full' {...props}>
    <ModalOverlay bg='white' />
    <ModalContent {...styles.content}>
      <ModalBody {...styles.body}>
        <Stack {...styles.container}>
          <Stack {...styles.screen}>
            <AspectRatio {...styles.video}>
              <video poster='/black.png' ref={remoteVideoRef}></video>
            </AspectRatio>
            <AspectRatio {...styles.video}>
              <video poster='/black.png' ref={localVideoRef}></video>
            </AspectRatio>
          </Stack>
          <HStack {...styles.actions}>
            <IconButton
              {...styles.mediaButton}
              aria-label='mic'
              icon={micState ? <BsFillMicFill /> : <BsFillMicMuteFill />}
              onClick={onMicButtonClick}
            />
            <IconButton
              {...styles.mediaButton}
              aria-label='camera'
              icon={cameraState ? <BsFillCameraVideoFill /> : <BsFillCameraVideoOffFill />}
              onClick={onCameraButtonClick}
            />
            <IconButton
              {...styles.hangUpButton}
              aria-label='hang up'
              icon={<BsSquareFill />}
              onClick={onHangUpButtonClick}
            />
          </HStack>
        </Stack>
      </ModalBody>
    </ModalContent>
  </Modal>
)

/** Container Component */
const CallingContainer: React.VFC<ContainerProps<CallingProps, PresenterProps>> = ({
  presenter,
  isOpen,
  onClose,
  rcCallId,
  apolloClient,
  state: { callType },
  query: { contactInfo },
  mutation: { ringUp, pickUp, hangUp, cancel, sendIceCandidate },
  subscription: { signaling, iceCandidate },
  ...props
}) => {
  const session = useRef<WebRTC | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [micState, setMicState] = useBoolean(true)
  const [cameraState, setCameraState] = useBoolean(true)

  // MicButton onClick
  const onMicButtonClick = () => {
    const connection = session.current
    if (isNullish(connection)) return
    connection.setMicState = !micState
    setMicState.toggle()
  }

  // CameraButton onClick
  const onCameraButtonClick = () => {
    const connection = session.current
    if (isNullish(connection)) return
    connection.setCameraState = !cameraState
    setCameraState.toggle()
  }

  // HangUpButton onClick
  const onHangUpButtonClick = () => {
    const connection = session.current
    if (isNullish(connection)) return
    connection.hangUp()
  }

  // 通話モード変更時
  const onCloseComplete = useCallback(() => {
    if (CallType.Close === callType.state) {
      // 通話切断時
      session.current = null
      setTimeout(onClose, 200)
      return
    }

    // RTCPeerConnection
    const connection = new WebRTC(
      callType.state,
      callType.setCallType,
      ringUp.mutate,
      pickUp.mutate,
      hangUp.mutate,
      cancel.mutate,
      sendIceCandidate.mutate,
      remoteVideoRef.current,
      localVideoRef.current,
      micState,
      cameraState
    )

    session.current = connection

    // 通話架電時
    if (CallType.Offer === callType.state) {
      if (!isNullish(contactInfo.result)) {
        connection.offer(contactInfo.result.id, contactInfo.result.userId)
      }
    }

    // 通話応答時
    if (CallType.Answer === callType.state) {
      // const offerSignal = apolloClient.readQuery<ContactInfoQuery, ContactInfoQueryVariables>({
      //   query: ContactInfoDocument,
      //   variables: { contactUserId: otherUserId }
      // })

      if (!isNullish(signaling.result)) connection.answer(signaling.result)
    }
  }, [callType.state]) // eslint-disable-line react-hooks/exhaustive-deps

  // シグナリング
  useMemo(() => {
    const connection = session.current
    if (isNullish(connection) || isNullish(signaling.result)) return
    connection.signaling(signaling.result)
  }, [signaling.result])

  // ICE Candidate
  useMemo(() => {
    const connection = session.current
    if (isNullish(connection) || isNullish(iceCandidate.result)) return
    connection.addIceCandidate(iceCandidate.result)
  }, [iceCandidate.result])

  return presenter({
    isOpen,
    onClose,
    onCloseComplete,
    micState,
    cameraState,
    remoteVideoRef,
    localVideoRef,
    onMicButtonClick,
    onCameraButtonClick,
    onHangUpButtonClick,
    ...props
  })
}

/** Calling */
export default connect<CallingProps, PresenterProps>('Calling', CallingPresenter, CallingContainer)