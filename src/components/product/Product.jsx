/* eslint-disable react/prop-types */
import "./Product.css";
import { useDispatch, useSelector } from "react-redux";
import { CartAction } from "../../store/cartSlice.js";
import { actLikeToggle } from "../../store/favouriteSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaShoppingCart } from "react-icons/fa";
import { IoMdHeart } from "react-icons/io";
import Swal from "sweetalert2";

export default function Product({ pro }) {
  const dispatch = useDispatch();
  const { favouriteIds } = useSelector((state) => state.favourite);
  const { accessToken } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const isFavourite = favouriteIds.includes(pro.id);

  const handleAddToCart = (pro) => {
    if (accessToken) {
      dispatch(CartAction({ id: pro.id, act: "add" }));
    } else {
      Swal.fire({
        title: "You are not Logged in",
        text: "Log in first to use it",
        icon: "warning",
      });
      navigate("/login");
    }
  };

  const handleAddToFavourite = (pro) => {
    if (accessToken) {
      dispatch(actLikeToggle(pro.id));
    } else {
      Swal.fire({
        title: "You are not Logged in",
        text: "Log in first to use it",
        icon: "warning",
      });
      navigate("/login");
    }
  };

  return (
    <div className="Product">
      <div className="Product__img">
        <img
          className="w-100 h-100 object-fit-cover"
          src={pro.images?.[0]}
          alt={pro.title}
          loading="lazy"
        />

        <div className="Product__actions">
          <Link
            className="Product__icon"
            to={`/categories/products/${pro.catPrefix}/${pro.id}`}
          >
            <FaEye />
          </Link>

          <div className="Product__icon" onClick={() => handleAddToCart(pro)}>
            <FaShoppingCart />
          </div>

          <div
            className={`Product__icon ${isFavourite ? "active" : ""}`}
            onClick={() => handleAddToFavourite(pro)}
          >
            <IoMdHeart />
          </div>
        </div>
      </div>

      <Link to={`/categories/products/${pro.catPrefix}/${pro.id}`}>
        <h4 title={pro.title} className="Product__title">
          {pro.title}
        </h4>
      </Link>

      <p className="fs-4 fw-semibold textMC">{pro.price} $</p>
    </div>
  );
}
