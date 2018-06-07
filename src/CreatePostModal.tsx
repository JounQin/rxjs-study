import { Input, Modal } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import React, { ChangeEvent, FormEvent, MouseEvent, PureComponent } from 'react'

import { Post } from 'api'

export const CreatePostModal = Form.create()(
  class extends PureComponent<
    FormComponentProps & {
      visible: boolean
      onCancel: (e: MouseEvent<any>) => void
      onCreate: (post: Partial<Post>) => void
    }
  > {
    addingPost = {} as {
      title: string
      body: string
    }

    onPostTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
      this.addingPost.title = e.target.value
    }

    onPostBodyChange = (e: ChangeEvent<HTMLInputElement>) => {
      this.addingPost.body = e.target.value
    }

    onCreate = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      this.props.onCreate(this.addingPost)
    }

    render() {
      const {
        visible,
        onCancel,
        form: { getFieldDecorator },
      } = this.props
      return (
        <Modal
          visible={visible}
          title="Create a new Post"
          okText="Create"
          onCancel={onCancel}
          onOk={this.onCreate}
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
                <Input type="textarea" onChange={this.onPostBodyChange} />,
              )}
            </Form.Item>
          </Form>
        </Modal>
      )
    }
  },
)
