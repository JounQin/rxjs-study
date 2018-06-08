import { Input, Modal } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import React, { ChangeEvent, PureComponent } from 'react'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'

import { Post } from 'api'
import { Subscribe } from 'components'

export const CreatePostModal = Form.create()(
  class extends PureComponent<
    FormComponentProps & {
      visible$: Subject<boolean>
      addingPost$: Subject<Pick<Post, 'body' | 'title'>>
    }
  > {
    title: string
    body: string

    onPostTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
      this.title = e.target.value
    }

    onPostBodyChange = (e: ChangeEvent<HTMLInputElement>) => {
      this.body = e.target.value
    }

    onCancel = () => this.props.visible$.next(false)

    onOk = () =>
      this.props.addingPost$.next({
        title: this.title,
        body: this.body,
      })

    render() {
      const {
        form: { getFieldDecorator },
        visible$,
      } = this.props
      return (
        <Subscribe>
          {visible$.pipe(
            map(visible => (
              <Modal
                visible={visible}
                title="Create a new Post"
                okText="Create"
                onCancel={this.onCancel}
                onOk={this.onOk}
              >
                <Form>
                  <Form.Item label="Title">
                    {getFieldDecorator('title', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input the title of post!',
                        },
                      ],
                    })(<Input onChange={this.onPostTitleChange} />)}
                  </Form.Item>
                  <Form.Item label="Description">
                    {getFieldDecorator('description')(
                      <Input
                        type="textarea"
                        onChange={this.onPostBodyChange}
                      />,
                    )}
                  </Form.Item>
                </Form>
              </Modal>
            )),
          )}
        </Subscribe>
      )
    }
  },
)
