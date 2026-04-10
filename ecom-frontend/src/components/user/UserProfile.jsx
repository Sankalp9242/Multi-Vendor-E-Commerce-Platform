import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { user } = useSelector(state => state.auth);

  const role = user?.roles?.includes("ROLE_ADMIN")
    ? "ADMIN"
    : user?.roles?.includes("ROLE_SELLER")
      ? "SELLER"
      : user?.roles?.includes("ROLE_USER")
        ? "USER"
        : "";

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <div style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "20px" }}>👤 My Profile</h2>

        <div style={{ marginBottom: "10px" }}>
          <strong>Name:</strong> {user?.username}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Email:</strong> {user?.email}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <strong>Role:</strong> {role}
        </div>

        <hr />

        <div style={{
          display: "flex",
          gap: "15px",
          marginTop: "20px"
        }}>
          <Link to="/profile/orders">
            <button className="font-semibold w-[300px] py-2 px-4 rounded-xs bg-custom-blue text-white flex items-center justify-center gap-2 hover:text-gray-300 transition duration-500"> My Orders</button>
          </Link>

      
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
