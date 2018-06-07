import { PureComponent, ReactNode } from 'react'
import { Observable, Subscription } from 'rxjs'

export interface SubscribeProps {
  children: Observable<ReactNode>
}

export interface SubscribeState {
  value: ReactNode
}

export class Subscribe extends PureComponent<SubscribeProps, SubscribeState> {
  state: Readonly<SubscribeState> = {
    value: null,
  }

  subscription: Subscription

  constructor(props: SubscribeProps) {
    super(props)
  }

  componentDidMount() {
    this.setupSubscription()
  }

  setupSubscription() {
    this.subscription = this.props.children.subscribe(value => {
      this.setState({ value })
    })
  }

  teardownSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  componentDidUpdate(prevProps: SubscribeProps) {
    if (prevProps.children !== this.props.children) {
      this.teardownSubscription()
      this.setupSubscription()
    }
  }

  componentWillUnmount() {
    this.teardownSubscription()
  }

  render() {
    return this.state.value
  }
}
