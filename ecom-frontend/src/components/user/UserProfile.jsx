import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);

  const dashboardPath = user?.roles?.includes("ROLE_ADMIN")
    ? "/admin"
    : user?.roles?.includes("ROLE_SELLER")
      ? "/seller"
      : null;

  const role = user?.roles?.includes("ROLE_ADMIN")
    ? "ADMIN"
    : user?.roles?.includes("ROLE_SELLER")
      ? "SELLER"
      : user?.roles?.includes("ROLE_USER")
        ? "USER"
        : "";

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>My Profile</h2>

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

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <Link to="/profile/orders">
            <button className="flex w-[300px] items-center justify-center gap-2 rounded-xs bg-custom-blue px-4 py-2 font-semibold text-white transition duration-500 hover:text-gray-300">
              My Orders
            </button>
          </Link>

          {dashboardPath && (
            <Link to={dashboardPath}>
              <button className="flex w-[300px] items-center justify-center gap-2 rounded-xs bg-slate-800 px-4 py-2 font-semibold text-white transition duration-500 hover:text-gray-300">
                Open Dashboard
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
