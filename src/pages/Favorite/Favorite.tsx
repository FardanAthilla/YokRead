import FavoriteView from "./FavoriteView";
import { useFavoriteLogic } from "./FavoriteLogic";

const Favorite = () => {
  const logic = useFavoriteLogic();
  return <FavoriteView {...logic} />;
};

export default Favorite;
