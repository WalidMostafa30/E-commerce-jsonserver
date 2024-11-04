import GlobalTitle from "../../components/GlobalTitle/GlobalTitle";
import { useDispatch, useSelector } from "react-redux";
import {
  actGetFavourites,
  favouritesCleanUp,
} from "../../store/favouriteSlice";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import ProductsItems from "../../components/ProductsItems/ProductsItems";
import Loading from "../../components/Loading/Loading";

const Favourite = () => {
  const { favouriteProducts, loading, error } = useSelector(
    (state) => state.favourite
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actGetFavourites("ProductsFullInfo"));

    return () => dispatch(favouritesCleanUp());
  }, [dispatch]);

  const { accessToken } = useSelector((state) => state.auth);

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return (
    <section>
      <GlobalTitle title={"Favourite"} />

      <Loading
        isLoading={loading}
        error={error}
        data={favouriteProducts}
        msg={"Favourites is empty"}
      >
        <div className="container">
          <ProductsItems products={favouriteProducts} />
        </div>
      </Loading>
    </section>
  );
};

export default Favourite;
