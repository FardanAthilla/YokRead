export interface Comic {
  title: string
  description: string
  latest_chapter: string
  thumbnail: string
  param: string
  detail_url: string
}

export interface ComicDetail {
  title: string
  thumbnail: string
  genre: string[]
  synopsis: string
  chapters: {
    chapter: string
    param: string
    release: string
    detail_url: string
  }[]
}

// types.ts
export interface ComicChapter {
  chapter: string;
  param: string;
  release: string;
  detail_url: string;
}

export interface ComicDetail {
  title: string;
  thumbnail: string;
  synopsis: string;
  genre: string[];
  chapters: ComicChapter[];
}
