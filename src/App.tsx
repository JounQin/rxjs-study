import { Button, Input, List, Modal } from 'antd'
import React, { ChangeEvent, Ref } from 'react'
import { hot } from 'react-hot-loader'
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  merge,
} from 'rxjs'
import {
  debounceTime,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'

import api, { Post } from 'api'
import { Subscribe } from 'components'
import { buildBem } from 'utils'

import 'styles/app'

import { CreatePostModal } from './CreatePostModal'

const bem = buildBem('app')

class App extends React.PureComponent {
  formRef: Ref<typeof CreatePostModal>

  search$ = new BehaviorSubject('')
  visible$ = new BehaviorSubject(false)
  loading$ = new BehaviorSubject(false)

  addingPost$ = new Subject<Pick<Post, 'body' | 'title'>>()
  addedPost$: Observable<Post | null> = this.addingPost$.pipe(
    filter(post => !!(post.title && post.body)),
    debounceTime(500),
    tap(() => {
      this.loading$.next(true)
      this.visible$.next(false)
    }),
    switchMap(post => api.createPost(post)),
    tap(() => this.loading$.next(false)),
    startWith(null),
  )

  deletingPostId$ = new Subject<number>()
  deletedPostId$: Observable<number | null> = this.deletingPostId$.pipe(
    tap(() => this.loading$.next(true)),
    switchMap(id => api.deletePost(id)),
    tap(() => this.loading$.next(false)),
    startWith(null),
  )

  posts$ = combineLatest(
    api.getPosts(),
    merge(this.addedPost$, this.deletedPostId$),
  ).pipe(
    tap(([posts, postOrId]) => {
      if (!postOrId) {
        return
      }

      if (typeof postOrId !== 'number') {
        posts.splice(0, 0, postOrId)
        return
      }

      const index = posts.findIndex(post => post.id === postOrId)

      if (index + 1) {
        posts.splice(index, 1)
      }
    }),
    map(([posts]) => posts),
  )

  onChange = (e: ChangeEvent<HTMLInputElement>) =>
    this.search$.next(e.target.value.trim())

  createPost = () => this.visible$.next(true)

  deletePost(id: number) {
    Modal.confirm({
      title: 'Delete',
      content: 'Do you confirm to delete this post?',
      onOk: () => this.deletingPostId$.next(id),
    })
  }

  saveFormRef = (formRef: Ref<typeof CreatePostModal>) => {
    this.formRef = formRef
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
        <Subscribe>
          {combineLatest(this.posts$, this.search$, this.loading$).pipe(
            map(([posts, search, loading]) => {
              posts = search
                ? posts.filter(post => post.title.includes(search))
                : posts
              return (
                <List
                  className={bem.element('list')}
                  bordered
                  dataSource={posts}
                  loading={loading}
                  rowKey="id"
                  renderItem={(post: Post) => (
                    <List.Item
                      actions={[
                        <a onClick={() => this.deletePost(post.id)}>delete</a>,
                      ]}
                    >
                      <List.Item.Meta
                        title={post.title}
                        description={post.body}
                      />
                    </List.Item>
                  )}
                />
              )
            }),
          )}
        </Subscribe>
        <CreatePostModal
          wrappedComponentRef={this.saveFormRef}
          addingPost$={this.addingPost$}
          visible$={this.visible$}
        />
      </>
    )
  }
}

export default hot(module)(App)
