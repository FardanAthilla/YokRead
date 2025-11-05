import { useHomeLogic } from "./HomeLogic";
import HomeView from "./HomeView";

const Home = () => {
  const logic = useHomeLogic();
  return <HomeView {...logic} />;
};

export default Home;
