import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { catchError, map } from 'rxjs/operators'

export interface Post {
  id: string
  title: string
  body: string
}

const SERVER_ENDPOINT =
  process.env.SERVER_ENDPOINT || 'https://jsonplaceholder.typicode.com/'

class Api {
  getPosts() {
    return ajax.getJSON<Post[]>(SERVER_ENDPOINT + 'posts')
  }

  createPost(post: Pick<Post, 'body' | 'title'>): Observable<Post> {
    return ajax
      .post(SERVER_ENDPOINT + 'posts', post, {
        'Content-Type': 'application/json',
      })
      .pipe(
        map(({ response }) => response),
        catchError(() => of(null)),
      )
  }

  deletePost(id: string) {
    return ajax.delete(SERVER_ENDPOINT + 'posts/' + id).pipe(
      map(() => id),
      catchError(() => of(null)),
    )
  }
}

export default new Api()
