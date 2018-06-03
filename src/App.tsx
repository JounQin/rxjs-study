import { Button, Form, Input, List, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  PureComponent,
  Ref,
} from 'react'
import { Subject, of } from 'rxjs'
import {
  catchError,
  combineLatest,
  debounceTime,
  filter,
  startWith,
  switchMap,
} from 'rxjs/operators'

import api, { Post } from 'api'
import { buildBem } from 'utils'

import 'styles/app'

const bem = buildBem('app')

interface AppState {
  search: string
  posts: Post[]
  isModalOpen: boolean
}

const PostCreateForm = Form.create()(
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

// tslint:disable-next-line:max-classes-per-file
export default class App extends React.PureComponent<{}, AppState> {
  state = {
    search: '',
    posts: [],
    isModalOpen: false,
  } as AppState

  formRef: Ref<typeof PostCreateForm>
  search$ = new Subject<string>()
  addingPost$ = new Subject<Partial<Post>>()
  deletingPostId$ = new Subject<string>()

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.search$.next(e.target.value)
  }

  createPost = () => {
    this.setState({
      isModalOpen: true,
    })
  }

  deletePost(id: string) {
    Modal.confirm({
      title: 'Delete',
      content: 'Do you confirm to delete this post?',
      onOk: () => {
        this.deletingPostId$.next(id)
      },
    })
  }

  cancel = () => {
    this.setState({
      isModalOpen: false,
    })
  }

  confirm = (addingPost: Partial<Post>) => {
    this.addingPost$.next(addingPost)
  }

  saveFormRef = (formRef: Ref<typeof PostCreateForm>) => {
    this.formRef = formRef
  }

  componentDidMount() {
    api
      .getPosts()
      .pipe(combineLatest(this.search$.pipe(startWith(this.state.search))))
      .subscribe(([posts, search]) => {
        search = search && search.trim()
        this.setState({
          search,
          posts: search
            ? posts.filter(post => post.title.includes(search))
            : posts,
        })
      })

    this.addingPost$
      .pipe(
        filter(post => !!(post.title && post.body)),
        debounceTime(500),
        switchMap(post => api.createPost(post)),
        catchError(() => of(null)),
      )
      .subscribe(post => {
        if (!post) {
          return
        }
        this.setState({
          isModalOpen: false,
          posts: [post, ...this.state.posts],
        })
      })

    this.deletingPostId$
      .pipe(
        switchMap(id => api.deletePost(id)),
        catchError(() => of(null)),
      )
      .subscribe(id => {
        if (!id) {
          return
        }

        this.setState({
          posts: this.state.posts.filter(post => post.id !== id),
        })
      })
  }

  render() {
    return (
      <>
        <div className={bem.element('header')}>
          <Input.Search onChange={this.onChange} />
          <div className={bem.element('add-post')}>
            <Button onClick={this.createPost}>Add Post</Button>
          </div>
        </div>
        <List
          className={bem.element('list')}
          bordered
          dataSource={this.state.posts}
          rowKey="id"
          renderItem={(post: Post) => (
            <List.Item
              actions={[<a onClick={() => this.deletePost(post.id)}>delete</a>]}
            >
              <List.Item.Meta title={post.title} description={post.body} />
            </List.Item>
          )}
        />
        <PostCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.isModalOpen}
          onCancel={this.cancel}
          onCreate={this.confirm}
        />
      </>
    )
  }
}
