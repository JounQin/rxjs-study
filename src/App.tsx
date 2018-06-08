import { Button, Input, List, Modal } from 'antd'
import React, { ChangeEvent, Ref } from 'react'
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs'
import {
  catchError,
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

import { CreatePostModal } from './CreatePostModal'

import 'styles/app'

const bem = buildBem('app')

export default class App extends React.PureComponent {
  formRef: Ref<typeof CreatePostModal>

  search$ = new BehaviorSubject('')
  visible$ = new BehaviorSubject(false)
  loading$ = new BehaviorSubject(false)

  addingPost$ = new Subject<Pick<Post, 'body' | 'title'>>()
  addedPost$ = this.addingPost$.pipe(
    filter(post => !!(post.title && post.body)),
    debounceTime(500),
    tap(() => this.loading$.next(true)),
    switchMap(post => api.createPost(post)),
    catchError(() => of(null)),
    tap(() => this.loading$.next(false)),
    startWith(null),
  )

  deletingPostId$ = new Subject<string>()
  deletedPostId$ = this.deletingPostId$.pipe(
    tap(() => this.loading$.next(true)),
    switchMap(id => api.deletePost(id)),
    catchError(() => of(null)),
    tap(() => this.loading$.next(false)),
    startWith(null),
  )

  posts$ = combineLatest(
    api.getPosts(),
    this.addedPost$,
    this.deletedPostId$,
  ).pipe(
    tap(([posts, post, id]) => {
      if (post && !posts.includes(post)) {
        posts.splice(0, 0, post)
        this.visible$.next(false)
        return
      }

      if (!id) {
        return
      }

      const index = posts.findIndex(p => p.id === id)

      if (index + 1) {
        posts.splice(index, 1)
      }
    }),
    map(([posts]) => posts),
  )

  onChange = (e: ChangeEvent<HTMLInputElement>) =>
    this.search$.next(e.target.value.trim())

  createPost = () => this.visible$.next(true)

  deletePost(id: string) {
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
