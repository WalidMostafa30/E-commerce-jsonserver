import { useSelector } from "react-redux";
import GlobalTitle from "../../components/GlobalTitle/GlobalTitle";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { cartIds } = useSelector((state) => state.cart);
  const { favouriteIds } = useSelector((state) => state.favourite);

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="container">
      <GlobalTitle title={"Profile"} />

      <table className="table table-striped table-hover table-bordered fs-4">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{user.name}</td>
          </tr>

          <tr>
            <td>E-mail</td>
            <td>{user.email}</td>
          </tr>

          <tr>
            <td>In Cart</td>
            <td>{cartIds.length}</td>
          </tr>

          <tr>
            <td>Favourite</td>
            <td>{favouriteIds.length}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default Profile;
