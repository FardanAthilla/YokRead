//Wrapper

import { useChapterReader } from "./ChapterReaderLogic";
import ChapterReaderView from "./ChapterReaderView";

const ChapterReader = () => {
  const reader = useChapterReader();
  return <ChapterReaderView {...reader} />;
};

export default ChapterReader;
