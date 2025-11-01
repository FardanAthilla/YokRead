import { useDetailLogic } from "./DetailLogic";
import DetailView from "./DetailView";

const Detail = () => {
  const logic = useDetailLogic();

  return <DetailView {...logic} />;
};

export default Detail;
