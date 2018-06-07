import { from } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

export interface Post {
  id: string
  title: string
  body: string
}

const SERVER_ENDPOINT =
  process.env.SERVER_ENDPOINT || 'https://jsonplaceholder.typicode.com/'

class Api {
  getPosts() {
    return from(ajax.getJSON<Post[]>(SERVER_ENDPOINT + 'posts').toPromise())
  }

  createPost(post: Partial<Post>) {
    return ajax
      .post(SERVER_ENDPOINT + 'posts', post, {
        'Content-Type': 'application/json',
      })
      .pipe(map(({ response }) => response))
  }

  deletePost(id: string) {
    return from(
      ajax
        .delete(SERVER_ENDPOINT + 'posts/' + id)
        .pipe(map(() => id))
        .toPromise()
        .catch(() => null),
    )
  }
}

export default new Api()
