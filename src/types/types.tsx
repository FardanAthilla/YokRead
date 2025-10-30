// types.ts

export interface ComicChapter {
  chapter: string;
  param: string;
  release: string;
  detail_url: string;
}

export interface ComicSimilar {
  title: string;
  thumbnail: string;
  synopsis: string;
  param: string;
  detail_url: string;
}

export interface ComicDetail {
  param: string | undefined;
  title: string;
  thumbnail: string;
  synopsis: string;
  genre: string[];
  chapters: ComicChapter[];
  similars: ComicSimilar[];
}

export interface Comic {
  title: string;
  description: string;
  latest_chapter: string;
  thumbnail: string;
  param: string;
  detail_url: string;
}
